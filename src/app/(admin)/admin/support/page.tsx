import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Ticket, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Support Tickets" };

function sBadge(s: string) {
  const m: Record<string, string> = { OPEN: "badge-blue", IN_PROGRESS: "badge-orange", AWAITING_CUSTOMER: "badge-blue", RESOLVED: "badge-green", CLOSED: "badge-gray" };
  return m[s] ?? "badge-gray";
}
function pBadge(p: string) {
  return p === "URGENT" ? "badge-red" : p === "HIGH" ? "badge-orange" : p === "MEDIUM" ? "badge-blue" : "badge-gray";
}

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; priority?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { q, status, priority } = await searchParams;

  const tickets = await prisma.supportTicket.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(q ? { OR: [{ ticketNumber: { contains: q } }, { subject: { contains: q } }, { user: { email: { contains: q } } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      assignee: { select: { name: true, email: true } },
      _count: { select: { replies: true } },
    },
  });

  const staffList = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN", "SUPPORT"] }, status: "ACTIVE" },
    select: { id: true, name: true, email: true },
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">Support Tickets</h1>
        <p className="text-sm text-slate-500 mt-0.5">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""}</p>
      </div>

      <form method="get" className="flex flex-wrap gap-3">
        <input name="q" defaultValue={q} type="search" placeholder="Ticket #, subject or email..." className="input w-72" />
        <select name="status" defaultValue={status ?? ""} className="input w-44">
          <option value="">All Statuses</option>
          {["OPEN","IN_PROGRESS","AWAITING_CUSTOMER","RESOLVED","CLOSED"].map(s => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
        <select name="priority" defaultValue={priority ?? ""} className="input w-36">
          <option value="">All Priorities</option>
          {["LOW","MEDIUM","HIGH","URGENT"].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button type="submit" className="btn-primary">Search</button>
        {(q || status || priority) && <Link href="/admin/support" className="btn-outline">Clear</Link>}
      </form>

      <Card>
        <CardContent className="p-0">
          {tickets.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Ticket className="h-10 w-10 mx-auto mb-3 opacity-25" />
              <p className="text-sm">No tickets found.</p>
            </div>
          ) : (
            <div className="table-container border-0">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Customer</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Assigned To</th>
                    <th>Replies</th>
                    <th>Created</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <p className="font-mono text-xs text-slate-500">#{t.ticketNumber}</p>
                        <p className="font-medium text-slate-900 max-w-[200px] truncate">{t.subject}</p>
                      </td>
                      <td>
                        <p>{t.user.name ?? "—"}</p>
                        <p className="text-xs text-slate-400">{t.user.email}</p>
                      </td>
                      <td className="text-xs">{t.category}</td>
                      <td><span className={pBadge(t.priority)}>{t.priority}</span></td>
                      <td className="text-xs">{t.assignee ? (t.assignee.name ?? t.assignee.email) : <span className="text-slate-400">Unassigned</span>}</td>
                      <td className="text-center">
                        <span className="flex items-center gap-1 justify-center text-slate-500">
                          <MessageSquare className="h-3.5 w-3.5" />{t._count.replies}
                        </span>
                      </td>
                      <td className="text-xs">{format(new Date(t.createdAt), "dd MMM yyyy")}</td>
                      <td><span className={sBadge(t.status)}>{t.status.replace("_", " ")}</span></td>
                      <td>
                        <Link href={`/admin/support/${t.id}`} className="text-brand-600 hover:text-brand-800 text-xs font-medium">
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
