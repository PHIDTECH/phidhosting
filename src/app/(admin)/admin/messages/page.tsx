import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MessageComposer } from "./MessageComposer";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Messages — Admin" };

export default async function AdminMessagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) redirect("/admin");

  const [customers, recentSms] = await Promise.all([
    prisma.user.findMany({
      where: { role: "CUSTOMER", status: "ACTIVE" },
      select: { id: true, name: true, email: true, phone: true },
      orderBy: { name: "asc" },
    }),
    prisma.smsLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        sentBy: { select: { name: true, email: true } },
        recipient: { select: { name: true, email: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <p className="text-xs text-slate-400 mb-0.5">Admin / Communications</p>
        <h1 className="font-heading text-xl font-bold text-slate-900">Messages & SMS</h1>
        <p className="text-sm text-slate-500">
          Send SMS notifications to customers via Beem Africa. In-system notifications are delivered automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Compose */}
        <div className="lg:col-span-2">
          <MessageComposer customers={customers} sentById={session.user.id} />
        </div>

        {/* History */}
        <div className="lg:col-span-3 rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">SMS history</h3>
            <p className="text-xs text-slate-400">Recent outgoing messages</p>
          </div>

          {recentSms.length === 0 ? (
            <div className="text-center py-14 text-slate-400">
              <p className="text-sm">No messages sent yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Recipient</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Message</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Sent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentSms.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3 text-slate-900 font-medium">
                        {log.recipient?.name ?? log.recipient?.email ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">{log.phone}</td>
                      <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{log.message}</td>
                      <td className="px-4 py-3">
                        <span className={log.status === "SENT" ? "badge-green" : log.status === "FAILED" ? "badge-red" : "badge-blue"}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                        {format(new Date(log.createdAt), "dd MMM yyyy HH:mm")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
