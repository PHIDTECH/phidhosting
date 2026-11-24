import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format, addDays } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Domain Management" };

function sBadge(s: string) {
  const m: Record<string, string> = { ACTIVE: "badge-green", PENDING: "badge-blue", EXPIRED: "badge-red", SUSPENDED: "badge-red", CANCELLED: "badge-gray", TRANSFER_PENDING: "badge-orange" };
  return m[s] ?? "badge-gray";
}

export default async function AdminDomainsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; expiring?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { q, status, expiring } = await searchParams;
  const expiryThreshold = addDays(new Date(), 30);

  const domains = await prisma.domain.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(expiring === "true" ? { expiryDate: { lte: expiryThreshold }, status: "ACTIVE" } : {}),
      ...(q
        ? { OR: [{ domainName: { contains: q } }, { user: { email: { contains: q } } }] }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      extension: true,
      registrar: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">Domains</h1>
        <p className="text-sm text-slate-500 mt-0.5">{domains.length} domain{domains.length !== 1 ? "s" : ""}</p>
      </div>

      <form method="get" className="flex flex-wrap gap-3">
        <input name="q" defaultValue={q} type="search" placeholder="Domain or customer email..." className="input w-72" />
        <select name="status" defaultValue={status ?? ""} className="input w-40">
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="EXPIRED">Expired</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
          <input type="checkbox" name="expiring" value="true" defaultChecked={expiring === "true"} className="rounded" />
          Expiring ≤ 30 days
        </label>
        <button type="submit" className="btn-primary">Search</button>
        {(q || status || expiring) && <Link href="/admin/domains" className="btn-outline">Clear</Link>}
      </form>

      <Card>
        <CardContent className="p-0">
          {domains.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Globe className="h-10 w-10 mx-auto mb-3 opacity-25" />
              <p className="text-sm">No domains found.</p>
            </div>
          ) : (
            <div className="table-container border-0">
              <table className="table">
                <thead>
                  <tr>
                    <th>Domain</th>
                    <th>Customer</th>
                    <th>Registrar</th>
                    <th>Registered</th>
                    <th>Expires</th>
                    <th>Auto-Renew</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {domains.map((d) => (
                    <tr key={d.id}>
                      <td className="font-medium text-slate-900">{d.domainName}</td>
                      <td>
                        <p className="text-sm">{d.user.name ?? "—"}</p>
                        <p className="text-xs text-slate-400">{d.user.email}</p>
                      </td>
                      <td>{d.registrar?.name ?? "—"}</td>
                      <td>{d.registrationDate ? format(new Date(d.registrationDate), "dd MMM yyyy") : "—"}</td>
                      <td>
                        {d.expiryDate ? (
                          <span className={new Date(d.expiryDate) <= expiryThreshold ? "text-orange-600 font-medium" : ""}>
                            {format(new Date(d.expiryDate), "dd MMM yyyy")}
                          </span>
                        ) : "—"}
                      </td>
                      <td><span className={d.autoRenew ? "badge-green" : "badge-gray"}>{d.autoRenew ? "On" : "Off"}</span></td>
                      <td><span className={sBadge(d.status)}>{d.status}</span></td>
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
