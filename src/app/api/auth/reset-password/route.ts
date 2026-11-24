import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { notifyPasswordChanged } from "@/lib/notifications";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain uppercase, lowercase and number"
  ),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = schema.parse(body);

    const reset = await prisma.passwordReset.findUnique({ where: { token } });

    if (!reset || reset.used || new Date(reset.expires) < new Date()) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: reset.userId },
        data: { passwordHash },
      }),
      prisma.passwordReset.update({
        where: { id: reset.id },
        data: { used: true },
      }),
    ]);

    notifyPasswordChanged(reset.userId).catch(() => {});

    return NextResponse.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Password reset failed. Please try again." }, { status: 500 });
  }
}
