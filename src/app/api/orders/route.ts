import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const itemSchema = z.object({
  type: z.enum(["HOSTING", "EMAIL", "DOMAIN"]),
  packageId: z.string().optional(),
  domain: z.string().min(4).max(253).toLowerCase(),
  billingPeriod: z.enum(["MONTHLY", "ANNUALLY", "BIENNIALLY"]).default("ANNUALLY"),
});

const schema = z.object({
  items: z.array(itemSchema).min(1).max(20),
});

const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z]{2,})+$/;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { items } = schema.parse(await req.json());

    interface Resolved {
      type: string;
      productName: string;
      domain: string;
      billingPeriod: string;
      unitPrice: number;
      currency: string;
      hostingPackageId?: string;
      emailPackageId?: string;
      domainExtensionId?: string;
    }

    const resolved: Resolved[] = [];

    for (const item of items) {
      if (!DOMAIN_RE.test(item.domain)) {
        return NextResponse.json({ error: `Invalid domain: ${item.domain}` }, { status: 400 });
      }

      if (item.type === "HOSTING") {
        if (!item.packageId) {
          return NextResponse.json({ error: "Hosting package required." }, { status: 400 });
        }
        const price = await prisma.hostingPackagePrice.findUnique({
          where: {
            packageId_billingPeriod: {
              packageId: item.packageId,
              billingPeriod: item.billingPeriod,
            },
            isActive: true,
          },
          include: { package: true },
        });
        if (!price || !price.package.isActive) {
          return NextResponse.json({ error: "Package not available for that billing period." }, { status: 400 });
        }
        resolved.push({
          type: "HOSTING",
          productName: price.package.name,
          domain: item.domain,
          billingPeriod: item.billingPeriod,
          unitPrice: price.price,
          currency: price.currency,
          hostingPackageId: item.packageId,
        });
      } else if (item.type === "EMAIL") {
        if (!item.packageId) {
          return NextResponse.json({ error: "Email package required." }, { status: 400 });
        }
        const price = await prisma.emailPackagePrice.findUnique({
          where: {
            packageId_billingPeriod: {
              packageId: item.packageId,
              billingPeriod: item.billingPeriod,
            },
            isActive: true,
          },
          include: { package: true },
        });
        if (!price || !price.package.isActive) {
          return NextResponse.json({ error: "Email package not available for that billing period." }, { status: 400 });
        }
        resolved.push({
          type: "EMAIL",
          productName: price.package.name,
          domain: item.domain,
          billingPeriod: item.billingPeriod,
          unitPrice: price.price,
          currency: price.currency,
          emailPackageId: item.packageId,
        });
      } else {
        const tld = "." + item.domain.split(".").slice(1).join(".");
        const extension = await prisma.domainExtension.findUnique({ where: { tld, isActive: true } });
        if (!extension) {
          return NextResponse.json({ error: `${tld} is not a supported extension.` }, { status: 400 });
        }
        const existing = await prisma.domain.findUnique({ where: { domainName: item.domain } });
        if (existing) {
          return NextResponse.json({ error: `${item.domain} is already registered.` }, { status: 409 });
        }
        resolved.push({
          type: "DOMAIN",
          productName: `${item.domain} registration`,
          domain: item.domain,
          billingPeriod: "ANNUALLY",
          unitPrice: extension.registrationPrice,
          currency: extension.currency,
          domainExtensionId: extension.id,
        });
      }
    }

    const subtotal = resolved.reduce((s, i) => s + i.unitPrice, 0);
    const currency = resolved[0]?.currency ?? "USD";
    const suffix = Date.now().toString(36).toUpperCase();

    const order = await prisma.order.create({
      data: {
        orderNumber: `PHD-${suffix}`,
        userId: session.user.id,
        status: "PENDING",
        currency,
        subtotal,
        total: subtotal,
        items: {
          create: resolved.map((i) => ({
            type: i.type,
            productName: i.productName,
            domain: i.domain,
            billingPeriod: i.billingPeriod,
            quantity: 1,
            unitPrice: i.unitPrice,
            total: i.unitPrice,
            hostingPackageId: i.hostingPackageId,
            emailPackageId: i.emailPackageId,
            domainExtensionId: i.domainExtensionId,
          })),
        },
        invoice: {
          create: {
            invoiceNumber: `INV-${suffix}`,
            userId: session.user.id,
            status: "UNPAID",
            currency,
            subtotal,
            total: subtotal,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            items: {
              create: resolved.map((i) => ({
                description: `${i.productName} — ${i.domain} (${i.billingPeriod.toLowerCase()})`,
                quantity: 1,
                unitPrice: i.unitPrice,
                total: i.unitPrice,
              })),
            },
          },
        },
      },
      select: { id: true, orderNumber: true, invoice: { select: { id: true, invoiceNumber: true } } },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      invoiceId: order.invoice!.id,
      invoiceNumber: order.invoice!.invoiceNumber,
    }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid order" }, { status: 400 });
    }
    console.error("[Orders]", err);
    return NextResponse.json({ error: "Could not create order." }, { status: 500 });
  }
}
