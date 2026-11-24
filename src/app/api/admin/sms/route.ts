import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendSms, sendBulkSms } from "@/lib/sms";
import { z } from "zod";

const schema = z.object({
  mode: z.enum(["single", "all"]),
  recipientId: z.string().optional(),
  message: z.string().min(1).max(612),
  sentById: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const data = schema.parse(body);

    if (data.mode === "single") {
      if (!data.recipientId) {
        return NextResponse.json({ error: "Recipient required." }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { id: data.recipientId },
        select: { id: true, phone: true, name: true },
      });

      if (!user || !user.phone) {
        return NextResponse.json({ error: "Recipient has no phone number." }, { status: 400 });
      }

      const result = await sendSms(user.phone, data.message);

      await prisma.smsLog.create({
        data: {
          sentById: session.user.id,
          recipientId: user.id,
          phone: user.phone,
          message: data.message,
          status: result.success ? "SENT" : "FAILED",
        },
      });

      return NextResponse.json({ success: result.success, sent: 1 });
    }

    // Broadcast to all active customers with a phone number
    const customers = await prisma.user.findMany({
      where: { role: "CUSTOMER", status: "ACTIVE", phone: { not: null } },
      select: { id: true, phone: true },
    });

    if (customers.length === 0) {
      return NextResponse.json({ error: "No customers with phone numbers found." }, { status: 400 });
    }

    const recipients = customers
      .filter((c): c is typeof c & { phone: string } => !!c.phone)
      .map((c, i) => ({ phone: c.phone, recipientId: String(i + 1) }));

    const result = await sendBulkSms(recipients, data.message);

    // Log each message
    await prisma.smsLog.createMany({
      data: customers
        .filter((c) => c.phone)
        .map((c) => ({
          sentById: session.user.id,
          recipientId: c.id,
          phone: c.phone!,
          message: data.message,
          status: result.success ? "SENT" : "FAILED",
        })),
    });

    return NextResponse.json({ success: result.success, sent: customers.length });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("[API /admin/sms]", err);
    return NextResponse.json({ error: "Failed to send SMS." }, { status: 500 });
  }
}
