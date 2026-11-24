import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/sms";
import { notifyPasswordResetRequested } from "@/lib/notifications";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, phone: true } });

    if (user) {
      await prisma.passwordReset.updateMany({
        where: { userId: user.id, used: false },
        data: { used: true },
      });

      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 1000 * 60 * 60);
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;

      await prisma.passwordReset.create({
        data: { userId: user.id, token, expires },
      });

      console.log(`[DEV] Password reset link: ${resetUrl}`);

      // SMS with reset link (if phone registered)
      if (user.phone) {
        const smsMsg = `PHIDHOSTING: Password reset requested. Click to reset: ${resetUrl} (expires in 1 hour). Ignore if not you.`;
        sendSms(user.phone, smsMsg).catch(() => {});
      }

      // In-system notification
      notifyPasswordResetRequested(user.id).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
