import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, User, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { TicketReplyForm } from "./TicketReplyForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ticket Detail" };

function sBadge(s: string) {
  const m: Record<string, string> = { OPEN: "badge-blue", IN_PROGRESS: "badge-orange", AWAITING_CUSTOMER: "badge-blue", RESOLVED: "badge-green", CLOSED: "badge-gray" };
  return m[s] ?? "badge-gray";
}
function pBadge(p: string) {
  return p === "URGENT" ? "badge-red" : p === "HIGH" ? "badge-orange" : p === "MEDIUM" ? "badge-blue" : "badge-gray";
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      assignee: { select: { name: true, email: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: { },
      },
    },
  });

  if (!ticket) notFound();

  const staffList = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN", "SUPPORT"] }, status: "ACTIVE" },
    select: { id: true, name: true, email: true },
  });

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/support">
          <span className="p-1.5 rounded-md hover:bg-slate-200 inline-flex"><ArrowLeft className="h-4 w-4" /></span>
        </Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-slate-900">#{ticket.ticketNumber} {ticket.subject}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={sBadge(ticket.status)}>{ticket.status.replace("_", " ")}</span>
            <span className={pBadge(ticket.priority)}>{ticket.priority}</span>
            <span className="text-xs text-slate-400">{ticket.category}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <Card>
          <CardContent className="p-4 space-y-1.5">
            <p className="text-xs font-semibold text-slate-500 uppercase">Customer</p>
            <p className="font-medium">{ticket.user.name ?? "—"}</p>
            <p className="text-slate-400 text-xs">{ticket.user.email}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1.5">
            <p className="text-xs font-semibold text-slate-500 uppercase">Assigned To</p>
            <p className="font-medium">{ticket.assignee ? (ticket.assignee.name ?? ticket.assignee.email) : "Unassigned"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1.5">
            <p className="text-xs font-semibold text-slate-500 uppercase">Opened</p>
            <p className="font-medium">{format(new Date(ticket.createdAt), "dd MMM yyyy HH:mm")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Replies */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Conversation ({ticket.replies.length} replies)</CardTitle></CardHeader>
        <CardContent className="space-y-3 p-4">
          {ticket.replies.length === 0 ? (
            <p className="text-sm text-slate-400">No replies yet.</p>
          ) : (
            ticket.replies.map((r) => (
              <div key={r.id} className={`rounded-lg p-4 text-sm ${r.isStaffNote ? "bg-yellow-50 border border-yellow-200" : r.userId === ticket.user.id ? "bg-slate-50 border border-slate-200" : "bg-brand-50 border border-brand-200"}`}>
                <div className="flex items-center gap-2 mb-2">
                  {r.isStaffNote ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-yellow-700"><Shield className="h-3 w-3" /> Internal Note</span>
                  ) : r.userId === ticket.user.id ? (
                    <span className="flex items-center gap-1 text-xs text-slate-500"><User className="h-3 w-3" /> Customer</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-medium text-brand-700"><Shield className="h-3 w-3" /> Staff</span>
                  )}
                  <span className="text-xs text-slate-400 ml-auto">{format(new Date(r.createdAt), "dd MMM yyyy HH:mm")}</span>
                </div>
                <p className="text-slate-800 whitespace-pre-wrap">{r.message}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <TicketReplyForm ticketId={id} currentStatus={ticket.status} />
    </div>
  );
}
