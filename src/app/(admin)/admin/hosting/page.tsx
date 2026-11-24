import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Server } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Web Hosting" };

function sBadge(s: string) {
  const m: Record<string, string> = { ACTIVE: "badge-green", PENDING: "badge-blue", PROVISIONING: "badge-orange", SUSPENDED: "badge-red", CANCELLED: "badge-gray", TERMINATED: "badge-gray" };
  return m[s] ?? "badge-gray";
}

export default async function AdminHostingPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; serverId?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { q, status, serverId } = await searchParams;

  const [accounts, servers] = await Promise.all([
    prisma.hostingAccount.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(serverId ? { serverId } : {}),
        ...(q ? { OR: [{ domain: { contains: q } }, { username: { contains: q } }, { user: { email: { contains: q } } }] } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        package: { select: { name: true } },
        server: { select: { name: true, hostname: true } },
      },
    }),
    prisma.hostingServer.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">Web Hosting Accounts</h1>
        <p className="text-sm text-slate-500 mt-0.5">{accounts.length} account{accounts.length !== 1 ? "s" : ""}</p>
      </div>

      <form method="get" className="flex flex-wrap gap-3">
        <input name="q" defaultValue={q} type="search" placeholder="Domain, username or email..." className="input w-72" />
        <select name="status" defaultValue={status ?? ""} className="input w-40">
          <option value="">All Statuses</option>
          {["PENDING","PROVISIONING","ACTIVE","SUSPENDED","CANCELLED","TERMINATED"].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select name="serverId" defaultValue={serverId ?? ""} className="input w-48">
          <option value="">All Servers</option>
          {servers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button type="submit" className="btn-primary">Search</button>
        {(q || status || serverId) && <Link href="/admin/hosting" className="btn-outline">Clear</Link>}
      </form>

      <Card>
        <CardContent className="p-0">
          {accounts.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Server className="h-10 w-10 mx-auto mb-3 opacity-25" />
              <p className="text-sm">No hosting accounts found.</p>
            </div>
          ) : (
            <div className="table-container border-0">
              <table className="table">
                <thead>
                  <tr>
                    <th>Domain</th>
                    <th>Customer</th>
                    <th>Package</th>
                    <th>Server</th>
                    <th>cPanel User</th>
                    <th>Billing</th>
                    <th>Expires</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accounts.map((a) => (
                    <tr key={a.id}>
                      <td className="font-medium text-slate-900">{a.domain}</td>
                      <td>
                        <p className="text-sm">{a.user.name ?? "—"}</p>
                        <p className="text-xs text-slate-400">{a.user.email}</p>
                      </td>
                      <td>{a.package.name}</td>
                      <td className="text-xs">{a.server?.name ?? <span className="text-slate-400">Unassigned</span>}</td>
                      <td className="font-mono text-xs">{a.username ?? "—"}</td>
                      <td>{a.billingPeriod}</td>
                      <td>{a.expiryDate ? format(new Date(a.expiryDate), "dd MMM yyyy") : "—"}</td>
                      <td><span className={sBadge(a.status)}>{a.status}</span></td>
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
