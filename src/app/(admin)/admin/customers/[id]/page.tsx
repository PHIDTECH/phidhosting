import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Globe, Server, Mail, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Customer Detail" };

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const customer = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      domains: { include: { extension: true }, orderBy: { createdAt: "desc" } },
      hostingAccounts: { include: { package: true }, orderBy: { createdAt: "desc" } },
      emailServices: { include: { package: true }, orderBy: { createdAt: "desc" } },
      invoices: { orderBy: { createdAt: "desc" }, take: 10 },
      supportTickets: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!customer) notFound();

  function sBadge(s: string) {
    const m: Record<string, string> = { ACTIVE: "badge-green", PAID: "badge-green", UNPAID: "badge-orange", OVERDUE: "badge-red", SUSPENDED: "badge-red", OPEN: "badge-blue", IN_PROGRESS: "badge-orange", RESOLVED: "badge-green", CLOSED: "badge-gray" };
    return m[s] ?? "badge-gray";
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/customers">
          <span className="p-1.5 rounded-md hover:bg-slate-200 inline-flex"><ArrowLeft className="h-4 w-4" /></span>
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">
            {customer.name ?? customer.email}
          </h1>
          <p className="text-sm text-slate-500">{customer.email} &mdash; <span className={sBadge(customer.status)}>{customer.status}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Account Details</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <Row label="Name" value={customer.name ?? "—"} />
            <Row label="Email" value={customer.email} />
            <Row label="Phone" value={customer.phone ?? "—"} />
            <Row label="Role" value={customer.role} />
            <Row label="Status" value={customer.status} />
            <Row label="Joined" value={format(new Date(customer.createdAt), "dd MMM yyyy")} />
            {customer.profile && (
              <>
                <Row label="Company" value={customer.profile.companyName ?? "—"} />
                <Row label="City" value={customer.profile.city ?? "—"} />
                <Row label="Country" value={customer.profile.country} />
              </>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4 self-start">
          {[
            { label: "Domains", val: customer.domains.length, icon: Globe, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Hosting", val: customer.hostingAccounts.length, icon: Server, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Email", val: customer.emailServices.length, icon: Mail, color: "text-green-600", bg: "bg-green-50" },
            { label: "Invoices", val: customer.invoices.length, icon: FileText, color: "text-orange-600", bg: "bg-orange-50" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <div className={`${s.bg} rounded-lg p-2 w-fit mb-2`}><s.icon className={`h-4 w-4 ${s.color}`} /></div>
                <p className="text-2xl font-bold">{s.val}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Domains */}
      <SectionTable
        title="Domains"
        rows={customer.domains}
        empty="No domains."
        headers={["Domain", "TLD", "Expires", "Status"]}
        renderRow={(d) => (
          <tr key={d.id}>
            <td className="font-medium">{d.domainName}</td>
            <td>{d.tld}</td>
            <td>{d.expiryDate ? format(new Date(d.expiryDate), "dd MMM yyyy") : "—"}</td>
            <td><span className={sBadge(d.status)}>{d.status}</span></td>
          </tr>
        )}
      />

      {/* Invoices */}
      <SectionTable
        title="Recent Invoices"
        rows={customer.invoices}
        empty="No invoices."
        headers={["Invoice #", "Total", "Date", "Status"]}
        renderRow={(inv) => (
          <tr key={inv.id}>
            <td className="font-medium">{inv.invoiceNumber}</td>
            <td>${inv.total.toFixed(2)}</td>
            <td>{format(new Date(inv.createdAt), "dd MMM yyyy")}</td>
            <td><span className={sBadge(inv.status)}>{inv.status}</span></td>
          </tr>
        )}
      />

      {/* Support */}
      <SectionTable
        title="Support Tickets"
        rows={customer.supportTickets}
        empty="No tickets."
        headers={["Ticket #", "Subject", "Priority", "Status"]}
        renderRow={(t) => (
          <tr key={t.id}>
            <td className="font-mono text-xs">#{t.ticketNumber}</td>
            <td className="font-medium">{t.subject}</td>
            <td>{t.priority}</td>
            <td><span className={sBadge(t.status)}>{t.status.replace("_", " ")}</span></td>
          </tr>
        )}
      />
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

function SectionTable<T>({
  title, rows, empty, headers, renderRow,
}: {
  title: string;
  rows: T[];
  empty: string;
  headers: string[];
  renderRow: (row: T) => React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <p className="text-sm text-slate-400 px-5 pb-4">{empty}</p>
        ) : (
          <div className="table-container border-0">
            <table className="table">
              <thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">{rows.map(renderRow)}</tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
