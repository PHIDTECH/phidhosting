import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/sms";
import { notifyWelcome } from "@/lib/notifications";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain uppercase, lowercase and number"
  ),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine(
      (v) => /^(\+?255|0)[67]\d{8}$/.test(v.replace(/[\s\-().]/g, "")),
      "Enter a valid Tanzanian phone number (e.g. 0744 741 874 or +255744741874)"
    ),
  website: z.string().max(0, "Bot detected").optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    // Honeypot: bots fill the hidden "website" field
    if (data.website) {
      return NextResponse.json({ success: true }, { status: 201 });
    }

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    // Check phone uniqueness
    const existingPhone = await prisma.user.findFirst({ where: { phone: data.phone } });
    if (existingPhone) {
      return NextResponse.json({ error: "This phone number is already registered." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone,
        passwordHash,
        role: "CUSTOMER",
        status: "ACTIVE",
        profile: {
          create: { country: "TZ" },
        },
      },
      select: { id: true, email: true, name: true },
    });

    // Fire-and-forget: welcome SMS + in-system notification
    const welcomeMsg = `Welcome to PHIDHOSTING, ${data.name.split(" ")[0]}! Your account is ready. Register domains, hosting and business email at phidhosting.com`;
    sendSms(data.phone, welcomeMsg).catch(() => {});
    notifyWelcome(user.id).catch(() => {});

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Register error:", error);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
