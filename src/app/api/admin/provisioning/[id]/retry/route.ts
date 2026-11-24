import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processProvisioningJob } from "@/lib/provisioning";
import { NextResponse } from "next/server";

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN", "HOSTING_MANAGER"];

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !ALLOWED_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const job = await prisma.provisioningJob.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (job.status !== "FAILED") {
    return NextResponse.json({ error: "Only FAILED jobs can be retried" }, { status: 400 });
  }

  if (job.attempts >= job.maxAttempts) {
    return NextResponse.json({ error: "Max attempts reached" }, { status: 400 });
  }

  const updated = await prisma.provisioningJob.update({
    where: { id },
    data: { status: "PENDING", errorMessage: null },
  });

  await prisma.provisioningLog.create({
    data: {
      jobId: id,
      level: "info",
      message: `Retry queued by admin ${session.user.email}`,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "provisioning.retry",
      resource: "ProvisioningJob",
      resourceId: id,
      details: `Retried job type: ${job.type}`,
    },
  });

  await processProvisioningJob(id);

  const result = await prisma.provisioningJob.findUnique({ where: { id } });
  return NextResponse.json({ success: true, job: result ?? updated });
}
