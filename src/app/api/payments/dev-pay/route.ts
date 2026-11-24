import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { provisionOrder } from "@/lib/provisioning";

const schema = z.object({ invoiceId: z.string().min(1) });

/**
 * DEV ONLY — instantly marks an invoice as paid and runs provisioning.
 * Disabled automatically once SELCOM_API_KEY is configured.
 */
export async function POST(req: NextRequest) {
  if (process.env.SELCOM_API_KEY) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { invoiceId } = schema.parse(await req.json());

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, userId: session.user.id },
      select: { id: true, invoiceNumber: true, total: true, currency: true, status: true, orderId: true },
    });
    if (!invoice) return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    if (invoice.status === "PAID") return NextResponse.json({ success: true, already: true });

    await prisma.$transaction([
      prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: "PAID", amountPaid: invoice.total, paidAt: new Date() },
      }),
      prisma.payment.create({
        data: {
          userId: session.user.id,
          invoiceId: invoice.id,
          amount: invoice.total,
          currency: invoice.currency,
          status: "COMPLETED",
          paidAt: new Date(),
          method: "DEV",
          reference: `DEV-${invoice.invoiceNumber}`,
        },
      }),
      ...(invoice.orderId
        ? [prisma.order.update({ where: { id: invoice.orderId }, data: { status: "PAID" } })]
        : []),
    ]);

    if (invoice.orderId) {
      await provisionOrder(invoice.orderId).catch((e) =>
        console.error("[Provisioning] provisionOrder failed:", e)
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("[Dev pay]", err);
    return NextResponse.json({ error: "Dev payment failed." }, { status: 500 });
  }
}
