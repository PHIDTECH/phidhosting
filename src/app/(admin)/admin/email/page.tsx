import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Mail, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Email Hosting" };

function sBadge(s: string) {
  const m: Record<string, string> = { ACTIVE: "badge-green", PENDING: "badge-blue", PROVISIONING: "badge-orange", SUSPENDED: "badge-red", CANCELLED: "badge-gray", TERMINATED: "badge-gray" };
  return m[s] ?? "badge-gray";
}

export default async function AdminEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { q, status } = await searchParams;

  const services = await prisma.emailService.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q ? { OR: [{ domain: { contains: q } }, { user: { email: { contains: q } } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      package: { select: { name: true, maxMailboxes: true } },
      mailServer: { select: { name: true } },
      _count: { select: { mailboxes: true } },
    },
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">Email Hosting Services</h1>
        <p className="text-sm text-slate-500 mt-0.5">{services.length} service{services.length !== 1 ? "s" : ""}</p>
      </div>

      <form method="get" className="flex flex-wrap gap-3">
        <input name="q" defaultValue={q} type="search" placeholder="Domain or customer email..." className="input w-72" />
        <select name="status" defaultValue={status ?? ""} className="input w-40">
          <option value="">All Statuses</option>
          {["PENDING","PROVISIONING","ACTIVE","SUSPENDED","CANCELLED","TERMINATED"].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button type="submit" className="btn-primary">Search</button>
        {(q || status) && <Link href="/admin/email" className="btn-outline">Clear</Link>}
      </form>

      <Card>
        <CardContent className="p-0">
          {services.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Mail className="h-10 w-10 mx-auto mb-3 opacity-25" />
              <p className="text-sm">No email services found.</p>
            </div>
          ) : (
            <div className="table-container border-0">
              <table className="table">
                <thead>
                  <tr>
                    <th>Domain</th>
                    <th>Customer</th>
                    <th>Package</th>
                    <th>Mail Server</th>
                    <th>Mailboxes</th>
                    <th>DNS Verified</th>
                    <th>Expires</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {services.map((s) => (
                    <tr key={s.id}>
                      <td className="font-medium text-slate-900">{s.domain}</td>
                      <td>
                        <p className="text-sm">{s.user.name ?? "—"}</p>
                        <p className="text-xs text-slate-400">{s.user.email}</p>
                      </td>
                      <td>{s.package.name}</td>
                      <td className="text-xs">{s.mailServer?.name ?? <span className="text-slate-400">Unassigned</span>}</td>
                      <td className="text-center">{s._count.mailboxes} / {s.package.maxMailboxes}</td>
                      <td className="text-center">
                        {s.dnsVerified
                          ? <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                          : <XCircle className="h-4 w-4 text-slate-300 mx-auto" />}
                      </td>
                      <td>{s.expiryDate ? format(new Date(s.expiryDate), "dd MMM yyyy") : "—"}</td>
                      <td><span className={sBadge(s.status)}>{s.status}</span></td>
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
