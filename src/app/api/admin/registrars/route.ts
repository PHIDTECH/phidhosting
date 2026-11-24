import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN"];

const schema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only"),
  type: z.string().min(2).max(50),
  apiEndpoint: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  isSandbox: z.boolean().default(true),
  supportsTransfer: z.boolean().default(true),
  supportsDns: z.boolean().default(false),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    if (!ALLOWED_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = schema.parse(await req.json());

    const existing = await prisma.registrar.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return NextResponse.json({ error: "A registrar with this slug already exists." }, { status: 409 });
    }

    const registrar = await prisma.registrar.create({
      data: {
        name: data.name,
        slug: data.slug,
        type: data.type,
        apiEndpoint: data.apiEndpoint || null,
        isActive: data.isActive,
        isSandbox: data.isSandbox,
        supportsTransfer: data.supportsTransfer,
        supportsDns: data.supportsDns,
        notes: data.notes || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "registrar.create",
        resource: "Registrar",
        resourceId: registrar.id,
        details: `Added registrar ${data.name} (${data.slug})`,
      },
    });

    return NextResponse.json({ success: true, registrar }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    console.error("[Admin registrars]", err);
    return NextResponse.json({ error: "Failed to add registrar." }, { status: 500 });
  }
}
