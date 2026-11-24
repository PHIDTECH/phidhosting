import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN", "HOSTING_MANAGER"];

const schema = z.object({
  kind: z.enum(["hosting", "mail"]),
  name: z.string().min(2).max(100),
  hostname: z.string().min(3).max(255),
  ipAddress: z.string().max(45).optional().or(z.literal("")),
  apiUrl: z.string().url().optional().or(z.literal("")),
  username: z.string().max(100).optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "MAINTENANCE", "OFFLINE"]).default("ACTIVE"),
  isSandbox: z.boolean().default(true),
  maxAccounts: z.coerce.number().int().positive().optional(),
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
    const { kind, ...fields } = data;

    const clean = {
      name: fields.name,
      hostname: fields.hostname,
      apiUrl: fields.apiUrl || null,
      status: fields.status,
      isSandbox: fields.isSandbox,
      notes: fields.notes || null,
    };

    const server = kind === "hosting"
      ? await prisma.hostingServer.create({
          data: {
            ...clean,
            ipAddress: fields.ipAddress || null,
            username: fields.username || null,
            maxAccounts: fields.maxAccounts ?? null,
          },
        })
      : await prisma.mailServer.create({ data: clean });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: `server.create.${kind}`,
        resource: kind === "hosting" ? "HostingServer" : "MailServer",
        resourceId: server.id,
        details: `Added ${kind === "hosting" ? "WHM" : "Mailcow"} server ${fields.hostname}`,
      },
    });

    return NextResponse.json({ success: true, server }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    console.error("[Admin servers]", err);
    return NextResponse.json({ error: "Failed to add server." }, { status: 500 });
  }
}
