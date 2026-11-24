import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Users, Globe, Server, Mail, FileText, AlertTriangle,
  Activity, CheckCircle2, XCircle, Ticket, ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, addDays } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Overview" };

function statusBadge(status: string) {
  const map: Record<string, string> = {
    OPEN: "badge-blue", IN_PROGRESS: "badge-orange",
    RESOLVED: "badge-green", CLOSED: "badge-gray",
    PENDING: "badge-blue", COMPLETED: "badge-green",
    FAILED: "badge-red", PROCESSING: "badge-orange",
  };
  return map[status] ?? "badge-gray";
}

export default async function AdminOverviewPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const expiryThreshold = addDays(new Date(), 30);

  const [
    totalCustomers,
    activeCustomers,
    totalDomains,
    expiringDomains,
    activeHosting,
    activeEmail,
    openTickets,
    pendingJobs,
    failedJobs,
    recentInvoices,
    recentTickets,
    recentJobs,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { role: "CUSTOMER", status: "ACTIVE" } }),
    prisma.domain.count(),
    prisma.domain.count({
      where: { expiryDate: { lte: expiryThreshold }, status: "ACTIVE" },
    }),
    prisma.hostingAccount.count({ where: { status: "ACTIVE" } }),
    prisma.emailService.count({ where: { status: "ACTIVE" } }),
    prisma.supportTicket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.provisioningJob.count({ where: { status: { in: ["PENDING", "PROCESSING"] } } }),
    prisma.provisioningJob.count({ where: { status: "FAILED" } }),
    prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.supportTicket.findMany({
      where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.provisioningJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const stats = [
    { label: "Total Customers", value: totalCustomers, sub: `${activeCustomers} active`, icon: Users, color: "text-brand-600", bg: "bg-brand-50", href: "/admin/customers" },
    { label: "Domains", value: totalDomains, sub: expiringDomains > 0 ? `${expiringDomains} expiring soon` : "All good", icon: Globe, color: expiringDomains > 0 ? "text-orange-600" : "text-blue-600", bg: expiringDomains > 0 ? "bg-orange-50" : "bg-blue-50", href: "/admin/domains" },
    { label: "Active Hosting", value: activeHosting, sub: "accounts", icon: Server, color: "text-purple-600", bg: "bg-purple-50", href: "/admin/hosting" },
    { label: "Active Email", value: activeEmail, sub: "services", icon: Mail, color: "text-green-600", bg: "bg-green-50", href: "/admin/email" },
    { label: "Open Tickets", value: openTickets, sub: "awaiting response", icon: Ticket, color: openTickets > 0 ? "text-orange-600" : "text-slate-400", bg: openTickets > 0 ? "bg-orange-50" : "bg-slate-50", href: "/admin/support" },
    { label: "Pending Provisioning", value: pendingJobs, sub: failedJobs > 0 ? `${failedJobs} failed` : "No failures", icon: Activity, color: pendingJobs > 0 ? "text-blue-600" : "text-slate-400", bg: "bg-blue-50", href: "/admin/provisioning" },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">Admin Overview</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {format(new Date(), "EEEE, dd MMMM yyyy")} &mdash; Platform status at a glance.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="group">
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardContent className="p-4">
                <div className={`${s.bg} rounded-lg p-2 w-fit mb-3`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs font-medium text-slate-600 mt-0.5">{s.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Alerts */}
      {(failedJobs > 0 || expiringDomains > 0) && (
        <div className="space-y-2">
          {failedJobs > 0 && (
            <div className="flex items-center gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm">
              <XCircle className="h-4 w-4 text-red-600 shrink-0" />
              <span className="text-red-700 font-medium">{failedJobs} provisioning job{failedJobs > 1 ? "s" : ""} failed</span>
              <Link href="/admin/provisioning?status=FAILED" className="ml-auto text-red-600 hover:text-red-800 font-medium flex items-center gap-1">
                Review <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
          {expiringDomains > 0 && (
            <div className="flex items-center gap-3 rounded-lg bg-orange-50 border border-orange-200 px-4 py-3 text-sm">
              <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0" />
              <span className="text-orange-700 font-medium">{expiringDomains} domain{expiringDomains > 1 ? "s" : ""} expiring within 30 days</span>
              <Link href="/admin/domains?expiring=true" className="ml-auto text-orange-600 hover:text-orange-800 font-medium flex items-center gap-1">
                Review <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-0">
            <CardTitle className="text-sm font-semibold">Recent Invoices</CardTitle>
            <Link href="/admin/finance" className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0 mt-3">
            {recentInvoices.length === 0 ? (
              <p className="text-xs text-slate-400 px-5 pb-4">No invoices yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentInvoices.map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between px-5 py-2.5 text-xs">
                    <div>
                      <p className="font-medium text-slate-800">{inv.invoiceNumber}</p>
                      <p className="text-slate-400">{inv.user.name ?? inv.user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${inv.total.toFixed(2)}</p>
                      <span className={statusBadge(inv.status)}>{inv.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Open Tickets */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-0">
            <CardTitle className="text-sm font-semibold">Open Tickets</CardTitle>
            <Link href="/admin/support" className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0 mt-3">
            {recentTickets.length === 0 ? (
              <p className="text-xs text-slate-400 px-5 pb-4">No open tickets.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentTickets.map((t) => (
                  <li key={t.id} className="px-5 py-2.5 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-slate-800 truncate">#{t.ticketNumber} {t.subject}</p>
                      <span className={statusBadge(t.status)}>{t.status.replace("_", " ")}</span>
                    </div>
                    <p className="text-slate-400 mt-0.5">{t.user.name ?? t.user.email}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Jobs */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-0">
            <CardTitle className="text-sm font-semibold">Provisioning Jobs</CardTitle>
            <Link href="/admin/provisioning" className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0 mt-3">
            {recentJobs.length === 0 ? (
              <p className="text-xs text-slate-400 px-5 pb-4">No jobs yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentJobs.map((job) => (
                  <li key={job.id} className="px-5 py-2.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-slate-800">{job.type.replace(/_/g, " ")}</p>
                      <span className={statusBadge(job.status)}>{job.status}</span>
                    </div>
                    <p className="text-slate-400 mt-0.5">{format(new Date(job.createdAt), "dd MMM, HH:mm")}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
