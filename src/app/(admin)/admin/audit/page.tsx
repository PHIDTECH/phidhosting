import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Audit Logs" };

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; action?: string; resource?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { q, action, resource } = await searchParams;

  const logs = await prisma.auditLog.findMany({
    where: {
      ...(action ? { action: { contains: action } } : {}),
      ...(resource ? { resource } : {}),
      ...(q ? {
        OR: [
          { action: { contains: q } },
          { resource: { contains: q } },
          { details: { contains: q } },
          { user: { email: { contains: q } } },
        ],
      } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { name: true, email: true, role: true } } },
  });

  const resources = await prisma.auditLog.groupBy({ by: ["resource"], orderBy: { _count: { resource: "desc" } }, take: 20 });

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">Audit Logs</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {logs.length} log entr{logs.length !== 1 ? "ies" : "y"} shown (last 200).
        </p>
      </div>

      <form method="get" className="flex flex-wrap gap-3">
        <input name="q" defaultValue={q} type="search" placeholder="Search action, resource, details or email..." className="input w-80" />
        <select name="resource" defaultValue={resource ?? ""} className="input w-44">
          <option value="">All Resources</option>
          {resources.map(r => <option key={r.resource} value={r.resource}>{r.resource}</option>)}
        </select>
        <button type="submit" className="btn-primary">Search</button>
        {(q || action || resource) && <Link href="/admin/audit" className="btn-outline">Clear</Link>}
      </form>

      <Card>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-25" />
              <p className="text-sm">No audit logs found.</p>
            </div>
          ) : (
            <div className="table-container border-0">
              <table className="table">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Resource</th>
                    <th>Resource ID</th>
                    <th>IP Address</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="text-xs text-slate-500 whitespace-nowrap">
                        {format(new Date(log.createdAt), "dd MMM HH:mm:ss")}
                      </td>
                      <td>
                        {log.user ? (
                          <>
                            <p className="text-sm">{log.user.name ?? log.user.email}</p>
                            <p className="text-xs text-slate-400">{log.user.role}</p>
                          </>
                        ) : (
                          <span className="text-slate-400 text-xs">System</span>
                        )}
                      </td>
                      <td><span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{log.action}</span></td>
                      <td className="text-xs text-slate-600">{log.resource}</td>
                      <td className="font-mono text-xs text-slate-400">{log.resourceId ? log.resourceId.slice(0, 12) + "…" : "—"}</td>
                      <td className="text-xs text-slate-400">{log.ipAddress ?? "—"}</td>
                      <td className="text-xs text-slate-500 max-w-[200px] truncate" title={log.details ?? undefined}>
                        {log.details ?? "—"}
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
