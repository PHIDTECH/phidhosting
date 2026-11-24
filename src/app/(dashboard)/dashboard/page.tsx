import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Globe, Server, Mail, FileText, ArrowRight,
  Plus, Headphones, MessageSquare, BookOpen,
} from "lucide-react";
import { format } from "date-fns";
import { PayButton } from "@/components/dashboard/PayButton";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

function invBadge(status: string) {
  const map: Record<string, string> = {
    PAID: "badge-green",
    UNPAID: "badge-orange",
    OVERDUE: "badge-red",
    PENDING: "badge-blue",
    DRAFT: "badge-gray",
    CANCELLED: "badge-gray",
    REFUNDED: "badge-gray",
    PARTIALLY_PAID: "badge-orange",
  };
  return map[status] ?? "badge-gray";
}

function svcBadge(status: string) {
  const map: Record<string, string> = {
    ACTIVE: "badge-green",
    PENDING: "badge-blue",
    SUSPENDED: "badge-red",
    CANCELLED: "badge-gray",
    EXPIRED: "badge-red",
  };
  return map[status] ?? "badge-gray";
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  const [
    domains,
    hostingAccounts,
    emailServices,
    recentInvoices,
    openTickets,
  ] = await Promise.all([
    prisma.domain.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, domainName: true, status: true, expiryDate: true, autoRenew: true },
    }),
    prisma.hostingAccount.findMany({
      where: { userId },
      take: 3,
      select: { id: true, status: true, package: { select: { name: true } } },
    }),
    prisma.emailService.findMany({
      where: { userId },
      take: 3,
      select: { id: true, status: true, package: { select: { name: true } } },
    }),
    prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        total: true,
        amountPaid: true,
        currency: true,
        dueDate: true,
        createdAt: true,
      },
    }),
    prisma.supportTicket.count({ where: { userId, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
  ]);

  const unpaidInvoices = recentInvoices.filter((i) => ["UNPAID", "OVERDUE"].includes(i.status));
  const unpaidBalance = unpaidInvoices.reduce((s, i) => s + (i.total - i.amountPaid), 0);
  const activeDomains = domains.filter((d) => d.status === "ACTIVE").length;
  const activeServices = hostingAccounts.filter((h) => h.status === "ACTIVE").length
    + emailServices.filter((e) => e.status === "ACTIVE").length;

  const firstName = session.user.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Page header */}
      <div>
        <p className="text-xs text-slate-400 mb-0.5">Portal Home</p>
        <h1 className="font-heading text-xl font-bold text-slate-900">
          Welcome back, {firstName}
        </h1>
        <p className="text-sm text-slate-500">Your services, domains and billing in one place.</p>
      </div>

      {/* Support banner */}
      <div className="relative overflow-hidden rounded-lg bg-[#0d1b2e] px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-brand-400 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            24/7 Support Desk
          </span>
          <h2 className="font-heading text-lg font-bold text-white">
            A helping hand, every step of the way.
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Get help with your domains, hosting, email and billing.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Link
            href="/dashboard/support/new"
            className="inline-flex items-center gap-2 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            <Headphones className="h-4 w-4" />
            Open a Ticket
          </Link>
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Help Centre
          </Link>
          {openTickets > 0 && (
            <Link
              href="/dashboard/support"
              className="inline-flex items-center gap-2 rounded-md bg-brand-600 hover:bg-brand-700 px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              {openTickets} open ticket{openTickets !== 1 ? "s" : ""}
            </Link>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Unpaid balance */}
        <Link href="/dashboard/invoices" className="group">
          <div className={`rounded-lg border p-4 bg-white hover:shadow-sm transition-shadow ${unpaidBalance > 0 ? "border-orange-200" : "border-slate-200"}`}>
            <div className="flex items-start justify-between mb-2">
              <p className={`text-[10px] font-semibold uppercase tracking-widest ${unpaidBalance > 0 ? "text-orange-500" : "text-slate-400"}`}>
                Unpaid Balance
              </p>
              <FileText className={`h-4 w-4 ${unpaidBalance > 0 ? "text-orange-400" : "text-slate-300"}`} />
            </div>
            <p className={`text-2xl font-bold leading-tight ${unpaidBalance > 0 ? "text-orange-700" : "text-slate-900"}`}>
              ${unpaidBalance.toFixed(2)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {unpaidInvoices.length} unpaid invoice{unpaidInvoices.length !== 1 ? "s" : ""}
            </p>
            {unpaidBalance > 0 && (
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-orange-600">
                Review &amp; pay <ArrowRight className="h-3 w-3" />
              </span>
            )}
          </div>
        </Link>

        {/* Active domains */}
        <Link href="/dashboard/domains" className="group">
          <div className="rounded-lg border border-slate-200 p-4 bg-white hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Active Domains
              </p>
              <Globe className="h-4 w-4 text-slate-300" />
            </div>
            <p className="text-2xl font-bold text-slate-900 leading-tight">{activeDomains}</p>
            <p className="text-xs text-slate-400 mt-1">
              {domains.length} domain{domains.length !== 1 ? "s" : ""} total
            </p>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-600">
              Manage domains <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </Link>

        {/* Active services */}
        <Link href="/dashboard/hosting" className="group">
          <div className="rounded-lg border border-slate-200 p-4 bg-white hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Active Services
              </p>
              <Server className="h-4 w-4 text-slate-300" />
            </div>
            <p className="text-2xl font-bold text-slate-900 leading-tight">{activeServices}</p>
            <p className="text-xs text-slate-400 mt-1">Hosting &amp; email services</p>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-600">
              Manage services <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </Link>

        {/* Email services */}
        <Link href="/dashboard/email" className="group">
          <div className="rounded-lg border border-slate-200 p-4 bg-white hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Email Hosting
              </p>
              <Mail className="h-4 w-4 text-slate-300" />
            </div>
            <p className="text-2xl font-bold text-slate-900 leading-tight">
              {emailServices.filter((e) => e.status === "ACTIVE").length}
            </p>
            <p className="text-xs text-slate-400 mt-1">Active mailbox services</p>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-600">
              View email <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </Link>
      </div>

      {/* Two-column: services + billing */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Active services list */}
        <div className="lg:col-span-3 rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Active Services</h3>
              <p className="text-xs text-slate-400">Hosting and email accounts</p>
            </div>
            <div className="flex gap-2">
              <Link href="/hosting" className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
                <Plus className="h-3 w-3" /> Add service
              </Link>
            </div>
          </div>

          {hostingAccounts.length === 0 && emailServices.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Server className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No services yet</p>
              <Link href="/hosting" className="mt-2 inline-flex items-center gap-1 text-xs text-brand-600 font-medium">
                <Plus className="h-3 w-3" /> Get web hosting
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {hostingAccounts.map((h) => (
                <div key={h.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-100">
                      <Server className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{h.package?.name ?? "Web Hosting"}</p>
                      <p className="text-xs text-slate-400">Web hosting plan</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={svcBadge(h.status)}>{h.status}</span>
                    <Link href="/dashboard/hosting" className="text-xs font-medium text-slate-600 hover:text-brand-600 border border-slate-200 rounded px-2.5 py-1">
                      Manage →
                    </Link>
                  </div>
                </div>
              ))}
              {emailServices.map((e) => (
                <div key={e.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-100">
                      <Mail className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{e.package?.name ?? "Email Hosting"}</p>
                      <p className="text-xs text-slate-400">Email hosting plan</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={svcBadge(e.status)}>{e.status}</span>
                    <Link href="/dashboard/email" className="text-xs font-medium text-slate-600 hover:text-brand-600 border border-slate-200 rounded px-2.5 py-1">
                      Manage →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Domain table below */}
          {domains.length > 0 && (
            <>
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                <div>
                  <p className="text-xs font-semibold text-slate-700">Managed domain names</p>
                  <p className="text-xs text-slate-400">Registration expiry and status</p>
                </div>
                <Link href="/domains" className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
                  <Plus className="h-3 w-3" /> Add domain
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-100">
                      <th className="px-5 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Domain name</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Expiry</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Auto-renew</th>
                      <th className="px-4 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {domains.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3 font-medium text-slate-900 flex items-center gap-2">
                          <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          {d.domainName}
                        </td>
                        <td className="px-4 py-3">
                          <span className={svcBadge(d.status)}>{d.status}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {d.expiryDate ? format(new Date(d.expiryDate), "yyyy-MM-dd") : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={d.autoRenew ? "badge-green" : "badge-gray"}>
                            {d.autoRenew ? "Enabled" : "Disabled"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link href="/dashboard/domains" className="text-xs font-medium text-slate-600 hover:text-brand-600 border border-slate-200 rounded px-2.5 py-1 whitespace-nowrap">
                            Manage →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Outstanding balance + invoices */}
        <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Outstanding balance</p>
            <p className={`text-3xl font-bold mt-1 ${unpaidBalance > 0 ? "text-orange-700" : "text-slate-900"}`}>
              ${unpaidBalance.toFixed(2)}
            </p>
            {unpaidBalance > 0 && (
              <p className="text-xs text-slate-400 mt-0.5">
                Review any pending payments before paying again.
              </p>
            )}
          </div>
          <div className="divide-y divide-slate-50">
            {recentInvoices.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No invoices yet</p>
              </div>
            ) : (
              recentInvoices.slice(0, 5).map((inv) => (
                <div key={inv.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{inv.invoiceNumber}</p>
                    <span className={invBadge(inv.status)}>{inv.status}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">${inv.total.toFixed(2)}</p>
                    {["UNPAID", "OVERDUE"].includes(inv.status) && (
                      <PayButton invoiceId={inv.id} label="Pay" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          {recentInvoices.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100">
              <Link
                href="/dashboard/invoices"
                className="flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                View all invoices <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
