import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN", "SUPPORT", "HOSTING_MANAGER"];

const replySchema = z.object({
  message: z.string().min(1).max(5000),
  isStaffNote: z.boolean().optional().default(false),
  newStatus: z.string().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !ALLOWED_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      assignee: { select: { name: true, email: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: { },
      },
    },
  });

  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ticket });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !ALLOWED_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const ticket = await prisma.supportTicket.findUnique({ where: { id } });
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const parsed = replySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { message, isStaffNote, newStatus } = parsed.data;

  const reply = await prisma.ticketReply.create({
    data: {
      ticketId: id,
      userId: session.user.id,
      message,
      isStaffNote,
    },
  });

  const updateData: { status?: string; assignedTo?: string } = {};
  if (newStatus) updateData.status = newStatus;
  if (!ticket.assignedTo) updateData.assignedTo = session.user.id;

  if (Object.keys(updateData).length > 0) {
    await prisma.supportTicket.update({ where: { id }, data: updateData });
  }

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "support.reply",
      resource: "SupportTicket",
      resourceId: id,
      details: isStaffNote ? "Added staff note" : "Replied to ticket",
    },
  });

  return NextResponse.json({ reply });
}
