import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding PHIDHOSTING database...");

  // ── Admin user ───────────────────────────────────────────────
  const adminHash = await bcrypt.hash("Admin@123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@phidhosting.com" },
    update: {},
    create: {
      email: "admin@phidhosting.com",
      name: "PHIDHOSTING Admin",
      passwordHash: adminHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });
  console.log("✓ Admin user:", admin.email);

  // ── Demo customer ─────────────────────────────────────────────
  const customerHash = await bcrypt.hash("Customer@123!", 12);
  const customer = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo Customer",
      passwordHash: customerHash,
      role: "CUSTOMER",
      status: "ACTIVE",
      emailVerified: new Date(),
      profile: {
        create: {
          companyName: "Demo Company Ltd",
          city: "Dar es Salaam",
          country: "TZ",
        },
      },
    },
  });
  console.log("✓ Demo customer:", customer.email);

  // ── Domain extensions ────────────────────────────────────────
  const extensions = [
    { tld: ".com", registrationPrice: 12.99, renewalPrice: 14.99, transferPrice: 12.99, isFeatured: true, sortOrder: 1 },
    { tld: ".net", registrationPrice: 11.99, renewalPrice: 13.99, transferPrice: 11.99, isFeatured: true, sortOrder: 2 },
    { tld: ".org", registrationPrice: 10.99, renewalPrice: 12.99, transferPrice: 10.99, isFeatured: true, sortOrder: 3 },
    { tld: ".co.tz", registrationPrice: 24.99, renewalPrice: 24.99, transferPrice: null, isFeatured: true, sortOrder: 4, eligibilityReq: "Must have a business presence in Tanzania" },
    { tld: ".or.tz", registrationPrice: 24.99, renewalPrice: 24.99, transferPrice: null, isFeatured: true, sortOrder: 5, eligibilityReq: "For registered organisations in Tanzania" },
    { tld: ".ac.tz", registrationPrice: 24.99, renewalPrice: 24.99, transferPrice: null, sortOrder: 6, eligibilityReq: "For academic institutions in Tanzania" },
    { tld: ".go.tz", registrationPrice: 24.99, renewalPrice: 24.99, transferPrice: null, sortOrder: 7, eligibilityReq: "For government entities in Tanzania" },
    { tld: ".biz", registrationPrice: 10.99, renewalPrice: 12.99, transferPrice: 10.99, sortOrder: 8 },
    { tld: ".info", registrationPrice: 9.99, renewalPrice: 11.99, transferPrice: 9.99, sortOrder: 9 },
  ];

  for (const ext of extensions) {
    await prisma.domainExtension.upsert({
      where: { tld: ext.tld },
      update: ext,
      create: { ...ext, isActive: true, currency: "USD" },
    });
  }
  console.log("✓ Domain extensions seeded:", extensions.length);

  // ── Hosting packages ──────────────────────────────────────────
  const hostingPackages = [
    {
      name: "BASIC",
      slug: "basic",
      shortDescription: "Perfect for small websites and personal projects",
      description: "Get started with reliable hosting for your first website. Includes everything you need to get online.",
      storageGB: 5,
      bandwidthGB: 50,
      maxWebsites: 1,
      maxEmailAccounts: 5,
      maxDatabases: 1,
      maxSubdomains: 5,
      sslIncluded: true,
      dailyBackups: false,
      features: JSON.stringify(["5 GB SSD Storage", "1 Website", "5 Email Accounts", "Free SSL Certificate", "cPanel Access", "1 Database"]),
      cPanelPackageName: "phid_basic",
      isFeatured: false,
      sortOrder: 1,
      pricing: [
        { billingPeriod: "MONTHLY", price: 4.99 },
        { billingPeriod: "ANNUALLY", price: 3.99 },
      ],
    },
    {
      name: "STARTER",
      slug: "starter",
      shortDescription: "Ideal for growing businesses and multiple projects",
      description: "More resources for businesses that need flexibility. Host multiple websites with ample storage.",
      storageGB: 10,
      bandwidthGB: 100,
      maxWebsites: 2,
      maxEmailAccounts: 20,
      maxDatabases: 5,
      maxSubdomains: 20,
      sslIncluded: true,
      dailyBackups: false,
      features: JSON.stringify(["10 GB SSD Storage", "2 Websites", "20 Email Accounts", "Free SSL Certificate", "cPanel Access", "5 Databases"]),
      cPanelPackageName: "phid_starter",
      isFeatured: true,
      sortOrder: 2,
      pricing: [
        { billingPeriod: "MONTHLY", price: 8.99 },
        { billingPeriod: "ANNUALLY", price: 6.99 },
      ],
    },
    {
      name: "BUSINESS",
      slug: "business",
      shortDescription: "Built for serious businesses with high performance needs",
      description: "High performance hosting for businesses that demand reliability and speed.",
      storageGB: 25,
      bandwidthGB: 300,
      maxWebsites: 5,
      maxEmailAccounts: 100,
      maxDatabases: 20,
      maxSubdomains: 100,
      sslIncluded: true,
      dailyBackups: true,
      features: JSON.stringify(["25 GB SSD Storage", "5 Websites", "Unlimited Email", "Free SSL Certificate", "cPanel Access", "20 Databases", "Daily Backups"]),
      cPanelPackageName: "phid_business",
      isFeatured: false,
      sortOrder: 3,
      pricing: [
        { billingPeriod: "MONTHLY", price: 15.99 },
        { billingPeriod: "ANNUALLY", price: 12.99 },
      ],
    },
    {
      name: "PREMIUM",
      slug: "premium",
      shortDescription: "Maximum resources for high-traffic websites",
      description: "Our most powerful hosting plan for high-traffic websites and demanding applications.",
      storageGB: 50,
      bandwidthGB: 1000,
      maxWebsites: 10,
      maxEmailAccounts: -1,
      maxDatabases: -1,
      maxSubdomains: -1,
      sslIncluded: true,
      dailyBackups: true,
      features: JSON.stringify(["50 GB SSD Storage", "10 Websites", "Unlimited Email", "Free SSL Certificate", "cPanel Access", "Unlimited Databases", "Daily Backups", "Priority Support"]),
      cPanelPackageName: "phid_premium",
      isFeatured: false,
      sortOrder: 4,
      pricing: [
        { billingPeriod: "MONTHLY", price: 25.99 },
        { billingPeriod: "ANNUALLY", price: 19.99 },
      ],
    },
  ];

  for (const pkg of hostingPackages) {
    const { pricing, ...pkgData } = pkg;
    const created = await prisma.hostingPackage.upsert({
      where: { slug: pkgData.slug },
      update: pkgData,
      create: { ...pkgData, isActive: true },
    });
    for (const price of pricing) {
      await prisma.hostingPackagePrice.upsert({
        where: { packageId_billingPeriod: { packageId: created.id, billingPeriod: price.billingPeriod } },
        update: { price: price.price },
        create: { packageId: created.id, billingPeriod: price.billingPeriod, price: price.price, currency: "USD", isActive: true },
      });
    }
  }
  console.log("✓ Hosting packages seeded:", hostingPackages.length);

  // ── Email packages ────────────────────────────────────────────
  const emailPackages = [
    {
      name: "EMAIL BASIC",
      slug: "email-basic",
      shortDescription: "Professional email for small teams",
      maxMailboxes: 5,
      mailboxQuotaGB: 2,
      hasWebmail: true, hasImap: true, hasSmtp: true,
      features: JSON.stringify(["5 Mailboxes", "2 GB Per Mailbox", "Webmail Access", "IMAP & SMTP", "Spam Protection"]),
      isFeatured: false, sortOrder: 1,
      pricing: [{ billingPeriod: "MONTHLY", price: 4.99 }, { billingPeriod: "ANNUALLY", price: 3.99 }],
    },
    {
      name: "EMAIL BUSINESS",
      slug: "email-business",
      shortDescription: "Business email for growing companies",
      maxMailboxes: 20,
      mailboxQuotaGB: 5,
      hasWebmail: true, hasImap: true, hasSmtp: true,
      features: JSON.stringify(["20 Mailboxes", "5 GB Per Mailbox", "Webmail Access", "IMAP & SMTP", "Spam Protection", "Email Aliases"]),
      isFeatured: true, sortOrder: 2,
      pricing: [{ billingPeriod: "MONTHLY", price: 12.99 }, { billingPeriod: "ANNUALLY", price: 9.99 }],
    },
    {
      name: "EMAIL ENTERPRISE",
      slug: "email-enterprise",
      shortDescription: "Enterprise email for large organisations",
      maxMailboxes: 50,
      mailboxQuotaGB: 10,
      hasWebmail: true, hasImap: true, hasSmtp: true,
      features: JSON.stringify(["50 Mailboxes", "10 GB Per Mailbox", "Webmail Access", "IMAP & SMTP", "Spam Protection", "Email Aliases", "Priority Support"]),
      isFeatured: false, sortOrder: 3,
      pricing: [{ billingPeriod: "MONTHLY", price: 29.99 }, { billingPeriod: "ANNUALLY", price: 24.99 }],
    },
  ];

  for (const pkg of emailPackages) {
    const { pricing, ...pkgData } = pkg;
    const created = await prisma.emailPackage.upsert({
      where: { slug: pkgData.slug },
      update: pkgData,
      create: { ...pkgData, isActive: true },
    });
    for (const price of pricing) {
      await prisma.emailPackagePrice.upsert({
        where: { packageId_billingPeriod: { packageId: created.id, billingPeriod: price.billingPeriod } },
        update: { price: price.price },
        create: { packageId: created.id, billingPeriod: price.billingPeriod, price: price.price, currency: "USD", isActive: true },
      });
    }
  }
  console.log("✓ Email packages seeded:", emailPackages.length);

  // ── System settings ───────────────────────────────────────────
  const settings = [
    { key: "company.name", value: "PHIDHOSTING", group: "general", isPublic: true, label: "Company Name" },
    { key: "company.email", value: "info@phidhosting.com", group: "general", isPublic: true, label: "Company Email" },
    { key: "company.phone", value: "+255 XXX XXX XXX", group: "general", isPublic: true, label: "Company Phone" },
    { key: "company.address", value: "Dar es Salaam, Tanzania", group: "general", isPublic: true, label: "Company Address" },
    { key: "currency.default", value: "USD", group: "billing", isPublic: true, label: "Default Currency" },
    { key: "invoice.due_days", value: "7", group: "billing", isPublic: false, label: "Invoice Due Days" },
    { key: "grace.period_days", value: "7", group: "billing", isPublic: false, label: "Grace Period Days" },
    { key: "domain.renewal_reminder_days", value: "30,14,7,3", group: "domains", isPublic: false, label: "Renewal Reminder Days" },
    { key: "sandbox.mode", value: "true", group: "integrations", isPublic: false, label: "Sandbox Mode" },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log("✓ System settings seeded");

  // ── Content pages (legal) ─────────────────────────────────────
  const pages = [
    { slug: "terms", title: "Terms of Service", content: "<p>Terms of Service — draft content. Please review before publishing.</p>", status: "DRAFT" },
    { slug: "privacy", title: "Privacy Policy", content: "<p>Privacy Policy — draft content. Please review before publishing.</p>", status: "DRAFT" },
    { slug: "acceptable-use", title: "Acceptable Use Policy", content: "<p>Acceptable Use Policy — draft content. Please review before publishing.</p>", status: "DRAFT" },
    { slug: "domain-policy", title: "Domain Registration Policy", content: "<p>Domain Registration Policy — draft content. Please review before publishing.</p>", status: "DRAFT" },
    { slug: "refund-policy", title: "Refund Policy", content: "<p>Refund Policy — draft content. Please review before publishing.</p>", status: "DRAFT" },
  ];

  for (const page of pages) {
    await prisma.contentPage.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }
  console.log("✓ Content pages seeded");

  console.log("\n✅ Seed complete!");
  console.log("\nAdmin login:    admin@phidhosting.com / Admin@123!");
  console.log("Customer login: demo@example.com / Customer@123!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
