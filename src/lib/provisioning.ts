/**
 * Provisioning engine — turns paid orders into real services.
 *
 * Flow:
 *   Payment received → provisionOrder(orderId)
 *     → creates HostingAccount / EmailService records + ProvisioningJobs
 *     → processProvisioningJob executes each job against WHM / Mailcow
 *
 * Job types: HOSTING_CREATE, HOSTING_SUSPEND, HOSTING_UNSUSPEND,
 *            HOSTING_TERMINATE, EMAIL_CREATE, EMAIL_SUSPEND, DOMAIN_REGISTER
 */
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import {
  createWhmAccount,
  suspendWhmAccount,
  unsuspendWhmAccount,
  terminateWhmAccount,
} from "@/lib/whm";
import {
  addMailcowDomain,
  createMailbox,
  setMailboxActive,
} from "@/lib/mailcow";

function generateUsername(domain: string): string {
  const base = domain.split(".")[0].replace(/[^a-z0-9]/gi, "").toLowerCase().slice(0, 8) || "user";
  const suffix = crypto.randomBytes(2).toString("hex");
  return `ph${base}${suffix}`.slice(0, 16);
}

function generatePassword(): string {
  return crypto.randomBytes(9).toString("base64url") + "A1!";
}

function addPeriod(date: Date, billingPeriod: string | null): Date {
  const d = new Date(date);
  if (billingPeriod === "MONTHLY") d.setMonth(d.getMonth() + 1);
  else if (billingPeriod === "BIENNIALLY") d.setFullYear(d.getFullYear() + 2);
  else d.setFullYear(d.getFullYear() + 1); // ANNUALLY and default
  return d;
}

async function log(jobId: string, level: "info" | "warn" | "error", message: string, data?: unknown) {
  await prisma.provisioningLog.create({
    data: { jobId, level, message, data: data === undefined ? undefined : JSON.stringify(data) },
  });
}

/**
 * Create service records + provisioning jobs for every item on a paid order,
 * then process each job immediately (async-safe — call fire-and-forget).
 */
export async function provisionOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: { select: { id: true, email: true } } },
  });
  if (!order) {
    console.error(`[Provisioning] Order ${orderId} not found`);
    return;
  }

  const alreadyProcessed = await prisma.provisioningJob.count({ where: { orderId } });
  if (alreadyProcessed > 0) return; // idempotent — don't provision twice

  for (const item of order.items) {
    let jobId: string | null = null;

    if (item.type === "HOSTING" && item.hostingPackageId && item.domain) {
      const account = await prisma.hostingAccount.create({
        data: {
          userId: order.userId,
          packageId: item.hostingPackageId,
          domain: item.domain,
          status: "PROVISIONING",
          billingPeriod: item.billingPeriod ?? "ANNUALLY",
        },
      });
      const job = await prisma.provisioningJob.create({
        data: {
          type: "HOSTING_CREATE",
          orderId,
          hostingAccountId: account.id,
          payload: JSON.stringify({ contactEmail: order.user.email }),
        },
      });
      jobId = job.id;
    } else if (item.type === "EMAIL" && item.emailPackageId && item.domain) {
      const service = await prisma.emailService.create({
        data: {
          userId: order.userId,
          packageId: item.emailPackageId,
          domain: item.domain,
          status: "PROVISIONING",
          billingPeriod: item.billingPeriod ?? "ANNUALLY",
        },
      });
      const job = await prisma.provisioningJob.create({
        data: {
          type: "EMAIL_CREATE",
          orderId,
          emailServiceId: service.id,
          payload: JSON.stringify({}),
        },
      });
      jobId = job.id;
    } else if (item.type === "DOMAIN" && item.domain) {
      const job = await prisma.provisioningJob.create({
        data: {
          type: "DOMAIN_REGISTER",
          orderId,
          payload: JSON.stringify({ domain: item.domain, extensionId: item.domainExtensionId }),
        },
      });
      jobId = job.id;
    }

    if (jobId) await processProvisioningJob(jobId);
  }
}

/**
 * Execute a single provisioning job against the relevant provider.
 * Safe to re-run: FAILED → PENDING → call again.
 */
export async function processProvisioningJob(jobId: string) {
  const job = await prisma.provisioningJob.findUnique({
    where: { id: jobId },
    include: {
      hostingAccount: { include: { package: true, user: { select: { email: true } } } },
      emailService: { include: { package: true, user: { select: { email: true, name: true } } } },
    },
  });
  if (!job) return;

  await prisma.provisioningJob.update({
    where: { id: jobId },
    data: { status: "PROCESSING", attempts: { increment: 1 }, lastAttemptAt: new Date() },
  });
  await log(jobId, "info", `Processing ${job.type} (attempt ${job.attempts + 1})`);

  const fail = async (message: string) => {
    await prisma.provisioningJob.update({
      where: { id: jobId },
      data: { status: "FAILED", failedAt: new Date(), errorMessage: message },
    });
    await log(jobId, "error", message);
  };
  const done = async (message: string, result?: unknown) => {
    await prisma.provisioningJob.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        result: result === undefined ? undefined : JSON.stringify(result),
      },
    });
    await log(jobId, "info", message, result);
  };

  try {
    switch (job.type) {
      case "HOSTING_CREATE": {
        const account = job.hostingAccount;
        if (!account) return fail("Hosting account record missing");

        const username = generateUsername(account.domain);
        const password = generatePassword();
        const result = await createWhmAccount({
          domain: account.domain,
          username,
          password,
          contactEmail: account.user.email,
          packageName: account.package.cPanelPackageName ?? undefined,
          quotaMB: account.package.storageGB * 1024,
          bandwidthMB: (account.package.bandwidthGB ?? 0) * 1024,
        });

        if (!result.success) return fail(result.error ?? "WHM createacct failed");

        const now = new Date();
        await prisma.hostingAccount.update({
          where: { id: account.id },
          data: {
            username,
            status: "ACTIVE",
            startDate: now,
            expiryDate: addPeriod(now, account.billingPeriod),
            notes: result.sandbox
              ? `cPanel password (sandbox): ${password}`
              : `Provisioned via WHM. Password set during creation.`,
          },
        });
        return done(`WHM account ${username} created for ${account.domain}`, result);
      }

      case "HOSTING_SUSPEND":
      case "HOSTING_UNSUSPEND":
      case "HOSTING_TERMINATE": {
        const account = job.hostingAccount;
        if (!account?.username) return fail("Hosting account or username missing");

        const fn = job.type === "HOSTING_SUSPEND"
          ? suspendWhmAccount
          : job.type === "HOSTING_UNSUSPEND"
            ? unsuspendWhmAccount
            : terminateWhmAccount;
        const result = await fn(account.username);
        if (!result.success) return fail(result.error ?? "WHM call failed");

        await prisma.hostingAccount.update({
          where: { id: account.id },
          data: job.type === "HOSTING_TERMINATE"
            ? { status: "TERMINATED" }
            : job.type === "HOSTING_SUSPEND"
              ? { status: "SUSPENDED", suspendedAt: new Date() }
              : { status: "ACTIVE", suspendedAt: null },
        });
        return done(`${job.type} completed for ${account.username}`, result);
      }

      case "EMAIL_CREATE": {
        const service = job.emailService;
        if (!service) return fail("Email service record missing");

        const domainResult = await addMailcowDomain(service.domain, `PHIDHOSTING service ${service.id}`);
        if (!domainResult.success) return fail(domainResult.error ?? "Mailcow add domain failed");

        const password = generatePassword();
        const mboxResult = await createMailbox({
          localPart: "info",
          domain: service.domain,
          displayName: service.user.name ?? service.domain,
          password,
          quotaMB: Math.round(service.package.mailboxQuotaGB * 1024),
        });
        if (!mboxResult.success) return fail(mboxResult.error ?? "Mailcow add mailbox failed");

        const mailbox = await prisma.mailbox.create({
          data: {
            emailServiceId: service.id,
            localPart: "info",
            domain: service.domain,
            fullEmail: `info@${service.domain}`,
            quotaGB: service.package.mailboxQuotaGB,
            status: "active",
          },
        });

        const now = new Date();
        await prisma.emailService.update({
          where: { id: service.id },
          data: {
            status: "ACTIVE",
            startDate: now,
            expiryDate: addPeriod(now, service.billingPeriod),
            notes: domainResult.sandbox
              ? `info@${service.domain} password (sandbox): ${password}`
              : `Default mailbox info@${service.domain} created.`,
          },
        });
        return done(`Mailcow domain ${service.domain} + mailbox ${mailbox.fullEmail} created`);
      }

      case "EMAIL_SUSPEND": {
        const service = job.emailService;
        if (!service) return fail("Email service record missing");
        const mailboxes = await prisma.mailbox.findMany({
          where: { emailServiceId: service.id },
          select: { fullEmail: true },
        });
        for (const m of mailboxes) {
          const r = await setMailboxActive(m.fullEmail, false);
          if (!r.success) return fail(r.error ?? "Mailcow suspend failed");
        }
        await prisma.emailService.update({
          where: { id: service.id },
          data: { status: "SUSPENDED", suspendedAt: new Date() },
        });
        return done(`Suspended ${mailboxes.length} mailbox(es) on ${service.domain}`);
      }

      case "DOMAIN_REGISTER": {
        const payload = JSON.parse(job.payload ?? "{}") as { domain?: string };
        await log(jobId, "warn", `Registrar API not implemented — ${payload.domain} requires manual registration`);
        return done(`Domain ${payload.domain} queued for manual registrar action`);
      }

      default:
        return fail(`Unknown job type: ${job.type}`);
    }
  } catch (err) {
    console.error(`[Provisioning] Job ${jobId} threw:`, err);
    return fail(err instanceof Error ? err.message : "Unexpected provisioning error");
  }
}
