import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Database, Globe, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "DNS & Registrars" };

export default async function AdminDnsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; domainId?: string; type?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { q, domainId, type } = await searchParams;

  const [registrars, dnsRecords, domainCount] = await Promise.all([
    prisma.registrar.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { extensions: true, domains: true } } } }),
    prisma.dnsRecord.findMany({
      where: {
        ...(domainId ? { domainId } : {}),
        ...(type ? { type } : {}),
        ...(q ? { OR: [{ name: { contains: q } }, { value: { contains: q } }, { domain: { domainName: { contains: q } } }] } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { domain: { select: { domainName: true } } },
    }),
    prisma.domain.count(),
  ]);

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">DNS & Registrars</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Registrar integrations, DNS records across {domainCount} domain{domainCount !== 1 ? "s" : ""}.
        </p>
      </div>

      {/* Nameserver info panel */}
      <Card className="border-brand-200 bg-brand-50/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-brand-800 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            PHIDHOSTING Private Nameservers
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1 text-brand-700">
          <div className="flex flex-wrap gap-4">
            <div className="font-mono bg-white/70 px-3 py-1.5 rounded border border-brand-200">ns1.phidhosting.com</div>
            <div className="font-mono bg-white/70 px-3 py-1.5 rounded border border-brand-200">ns2.phidhosting.com</div>
          </div>
          <p className="text-xs text-brand-600 mt-2">
            Glue records must be registered at the domain registrar (phidhosting.com) pointing to dedicated IP addresses.
            Assign separate IPs and server infrastructure for true DNS redundancy.
          </p>
        </CardContent>
      </Card>

      {/* Registrars */}
      <section>
        <h2 className="font-heading font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Globe className="h-4 w-4 text-brand-600" />
          Registrar Integrations
        </h2>
        {registrars.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-slate-400 text-sm">No registrars configured.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {registrars.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{r.name}</span>
                    <span className={r.isActive ? "badge-green" : "badge-gray"}>{r.isActive ? "Active" : "Inactive"}</span>
                  </div>
                  <p className="text-xs text-slate-500">{r.type} &mdash; {r.isSandbox ? "Sandbox mode" : "Production"}</p>
                  <div className="text-xs text-slate-600 space-y-0.5">
                    <p>{r._count.extensions} TLD{r._count.extensions !== 1 ? "s" : ""} supported</p>
                    <p>{r._count.domains} domain{r._count.domains !== 1 ? "s" : ""} registered</p>
                    {r.supportsTransfer && <p>✓ Domain transfers</p>}
                    {r.supportsDns && <p>✓ DNS management API</p>}
                  </div>
                  {r.apiEndpoint && (
                    <p className="text-xs text-slate-400 font-mono truncate">{r.apiEndpoint}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* DNS Records */}
      <section>
        <h2 className="font-heading font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Database className="h-4 w-4 text-brand-600" />
          DNS Records
        </h2>

        <form method="get" className="flex flex-wrap gap-3 mb-4">
          <input name="q" defaultValue={q} type="search" placeholder="Domain, name or value..." className="input w-72" />
          <select name="type" defaultValue={type ?? ""} className="input w-32">
            <option value="">All Types</option>
            {["A","AAAA","CNAME","MX","TXT","SRV","NS","CAA","PTR"].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button type="submit" className="btn-primary">Search</button>
          {(q || type || domainId) && <Link href="/admin/dns" className="btn-outline">Clear</Link>}
        </form>

        <Card>
          <CardContent className="p-0">
            {dnsRecords.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Database className="h-10 w-10 mx-auto mb-3 opacity-25" />
                <p className="text-sm">No DNS records found.</p>
              </div>
            ) : (
              <div className="table-container border-0">
                <table className="table">
                  <thead>
                    <tr><th>Domain</th><th>Type</th><th>Name</th><th>Value</th><th>TTL</th><th>Priority</th><th>Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dnsRecords.map((r) => (
                      <tr key={r.id}>
                        <td className="text-sm font-medium">{r.domain.domainName}</td>
                        <td><span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{r.type}</span></td>
                        <td className="font-mono text-xs">{r.name}</td>
                        <td className="font-mono text-xs max-w-[200px] truncate" title={r.value}>{r.value}</td>
                        <td className="text-xs text-slate-500">{r.ttl}s</td>
                        <td className="text-xs text-slate-500">{r.priority ?? "—"}</td>
                        <td><span className={r.isActive ? "badge-green" : "badge-gray"}>{r.isActive ? "Active" : "Disabled"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
