import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSelcomOrder } from "@/lib/selcom";
import { z } from "zod";
import crypto from "crypto";

const schema = z.object({
  invoiceId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const body = await req.json();
    const { invoiceId } = schema.parse(body);

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId, userId: session.user.id },
      select: {
        id: true,
        invoiceNumber: true,
        total: true,
        amountPaid: true,
        currency: true,
        status: true,
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    if (!invoice) return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    if (!["UNPAID", "OVERDUE", "PARTIALLY_PAID"].includes(invoice.status)) {
      return NextResponse.json({ error: "Invoice is not payable." }, { status: 400 });
    }

    const remaining = invoice.total - invoice.amountPaid;
    if (remaining <= 0) return NextResponse.json({ error: "Invoice is already paid." }, { status: 400 });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const merchantTxId = `PH-${invoice.invoiceNumber}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    // Record a pending payment
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        invoiceId: invoice.id,
        amount: remaining,
        currency: invoice.currency,
        status: "PENDING",
        reference: merchantTxId,
        method: "SELCOM",
      },
    });

    const result = await createSelcomOrder({
      amount: remaining,
      currency: invoice.currency,
      merchantTransactionId: merchantTxId,
      buyerPhone: invoice.user.phone ?? "",
      buyerName: invoice.user.name ?? invoice.user.email,
      buyerEmail: invoice.user.email,
      invoiceId: invoice.id,
      cancelUrl: `${baseUrl}/dashboard/invoices?payment=cancelled`,
      redirectUrl: `${baseUrl}/dashboard/invoices?payment=success&ref=${merchantTxId}`,
      webhookUrl: `${baseUrl}/api/payments/selcom/callback`,
    });

    if (!result.success) {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { gatewayRef: result.reference },
    });

    return NextResponse.json({
      success: true,
      paymentUrl: result.paymentGatewayUrl,
      reference: merchantTxId,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("[Selcom checkout]", err);
    return NextResponse.json({ error: "Payment initiation failed." }, { status: 500 });
  }
}
