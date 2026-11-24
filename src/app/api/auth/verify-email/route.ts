import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  token: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = schema.parse(body);

    const record = await prisma.verificationToken.findUnique({ where: { token } });

    if (!record || new Date(record.expires) < new Date()) {
      return NextResponse.json(
        { error: "This verification link is invalid or has expired." },
        { status: 400 }
      );
    }

    if (record.userId) {
      await prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: new Date() },
      });
    }

    await prisma.verificationToken.delete({ where: { token } });

    return NextResponse.json({ success: true, message: "Email verified successfully." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Verify email error:", error);
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 });
  }
}
