import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Cpu, Mail, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddServerForm } from "./AddServerForm";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Servers" };

function sBadge(s: string) {
  return s === "ACTIVE" ? "badge-green" : s === "MAINTENANCE" ? "badge-orange" : "badge-red";
}

export default async function AdminServersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [hostingServers, mailServers] = await Promise.all([
    prisma.hostingServer.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { hostingAccounts: true, packages: true } } },
    }),
    prisma.mailServer.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { emailServices: true } } },
    }),
  ]);

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">Server Infrastructure</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Web hosting (WHM/cPanel) and email hosting (Mailcow) servers.
          </p>
        </div>
      </div>

      <AddServerForm />

      {/* WHM / cPanel Servers */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-slate-800 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-purple-600" />
            Web Hosting Servers (WHM/cPanel)
          </h2>
        </div>
        {hostingServers.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-slate-400 text-sm">No hosting servers configured.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hostingServers.map((s) => (
              <Card key={s.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{s.name}</CardTitle>
                    <span className={sBadge(s.status)}>{s.status}</span>
                  </div>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <Row label="Hostname" value={s.hostname} />
                  <Row label="IP Address" value={s.ipAddress ?? "—"} />
                  <Row label="Mode" value={s.isSandbox ? "Sandbox" : "Production"} />
                  <Row label="Accounts" value={`${s._count.hostingAccounts} hosting accounts`} />
                  <Row label="Packages" value={`${s._count.packages} packages`} />
                  {s.maxAccounts && <Row label="Max Capacity" value={String(s.maxAccounts)} />}
                  {s.apiUrl && (
                    <div className="pt-2 border-t border-slate-100">
                      <a
                        href={`https://${s.hostname}:2087`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-brand-600 hover:text-brand-800 text-xs font-medium"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open WHM (port 2087)
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Mailcow / Mail Servers */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-slate-800 flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Email Hosting Servers (Mailcow)
          </h2>
        </div>
        {mailServers.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-slate-400 text-sm">No mail servers configured.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mailServers.map((s) => (
              <Card key={s.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{s.name}</CardTitle>
                    <span className={sBadge(s.status)}>{s.status}</span>
                  </div>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <Row label="Hostname" value={s.hostname} />
                  <Row label="Mode" value={s.isSandbox ? "Sandbox" : "Production"} />
                  <Row label="Email Services" value={`${s._count.emailServices} services`} />
                  {s.apiUrl && (
                    <div className="pt-2 border-t border-slate-100">
                      <a
                        href={`https://${s.hostname}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-brand-600 hover:text-brand-800 text-xs font-medium"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open Mailcow Admin
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800 text-right">{value}</span>
    </div>
  );
}
