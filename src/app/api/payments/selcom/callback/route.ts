import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyPaymentReceived } from "@/lib/notifications";
import { sendSms } from "@/lib/sms";
import { provisionOrder } from "@/lib/provisioning";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      order_id?: string;
      reference?: string;
      resultcode?: string;
      result?: string;
      payment_status?: string;
      amount?: number;
      msisdn?: string;
    };

    const orderId = body.order_id ?? body.reference;
    const isSuccess =
      body.resultcode === "000" ||
      body.result === "SUCCESS" ||
      body.payment_status === "COMPLETED";

    if (!orderId) {
      return NextResponse.json({ result: "FAIL", message: "Missing order_id" }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { reference: orderId },
      include: {
        invoice: { select: { id: true, invoiceNumber: true, total: true, amountPaid: true, userId: true, orderId: true } },
        user: { select: { name: true, phone: true, email: true } },
      },
    });

    if (!payment) {
      return NextResponse.json({ result: "FAIL", message: "Payment not found" }, { status: 404 });
    }

    if (payment.status === "COMPLETED") {
      return NextResponse.json({ result: "SUCCESS" });
    }

    if (isSuccess) {
      const paidAmount = body.amount ?? payment.amount;
      const newAmountPaid = payment.invoice.amountPaid + paidAmount;
      const fullyPaid = newAmountPaid >= payment.invoice.total;

      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: { status: "COMPLETED", paidAt: new Date() },
        }),
        prisma.invoice.update({
          where: { id: payment.invoice.id },
          data: {
            amountPaid: newAmountPaid,
            status: fullyPaid ? "PAID" : "PARTIALLY_PAID",
          },
        }),
      ]);

      // Log transaction
      await prisma.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          type: "PAYMENT",
          status: "COMPLETED",
          amount: paidAmount,
          currency: payment.currency,
          reference: orderId,
          rawResponse: JSON.stringify(body),
        },
      });

      // In-system notification + SMS receipt
      notifyPaymentReceived(
        payment.invoice.userId,
        payment.invoice.invoiceNumber,
        paidAmount,
        payment.currency
      ).catch(() => {});

      if (payment.user.phone) {
        const msg = `PHIDHOSTING: Payment of ${payment.currency} ${paidAmount.toFixed(2)} received for invoice ${payment.invoice.invoiceNumber}. Thank you!`;
        sendSms(payment.user.phone, msg).catch(() => {});
      }

      // Provision services once the invoice is fully paid
      if (fullyPaid && payment.invoice.orderId) {
        provisionOrder(payment.invoice.orderId).catch((e) =>
          console.error("[Provisioning] provisionOrder failed:", e)
        );
      }
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
    }

    return NextResponse.json({ result: "SUCCESS" });
  } catch (err) {
    console.error("[Selcom callback]", err);
    return NextResponse.json({ result: "FAIL", message: "Internal error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("order_id") ?? searchParams.get("reference");
  if (!orderId) return NextResponse.redirect(new URL("/dashboard/invoices", req.url));
  return NextResponse.redirect(new URL(`/dashboard/invoices?ref=${orderId}`, req.url));
}
