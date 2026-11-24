import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STAFF_ROLES = ["ADMIN", "HOSTING_MANAGER", "FINANCE", "SUPPORT"] as const;

const PERMISSIONS = [
  "customers.view", "customers.edit",
  "domains.view", "domains.manage",
  "hosting.view", "hosting.manage",
  "email.view", "email.manage",
  "finance.view", "finance.manage",
  "support.view", "support.reply",
  "servers.view", "servers.manage",
  "audit.view", "settings.manage",
] as const;

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain uppercase, lowercase and number"
  ),
  phone: z.string().max(20).optional().or(z.literal("")),
  role: z.enum(STAFF_ROLES),
  permissions: z.array(z.enum(PERMISSIONS)).default([]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Only Super Admins can add staff." }, { status: 403 });
    }

    const body = await req.json();
    const data = schema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    if (data.phone) {
      const existingPhone = await prisma.user.findFirst({ where: { phone: data.phone } });
      if (existingPhone) {
        return NextResponse.json({ error: "This phone number is already registered." }, { status: 409 });
      }
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone || null,
        passwordHash,
        role: data.role,
        status: "ACTIVE",
        emailVerified: new Date(),
        staffPermissions: {
          create: data.permissions.map((p) => ({
            permission: p,
            grantedBy: session.user.id,
          })),
        },
      },
      select: { id: true, email: true, name: true, role: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "staff.create",
        resource: "user",
        resourceId: user.id,
        details: `Created staff account ${user.email} with role ${user.role}`,
      },
    });

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    console.error("[Admin staff]", err);
    return NextResponse.json({ error: "Failed to create staff account." }, { status: 500 });
  }
}
