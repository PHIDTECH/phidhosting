import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"];

const schema = z.object({
  settings: z.record(z.string()),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { settings } = parsed.data;

  await Promise.all(
    Object.entries(settings).map(([key, value]) =>
      prisma.systemSetting.updateMany({
        where: { key },
        data: { value, updatedBy: session.user.id },
      })
    )
  );

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "settings.update",
      resource: "SystemSetting",
      details: `Updated ${Object.keys(settings).length} setting(s)`,
    },
  });

  return NextResponse.json({ success: true });
}
