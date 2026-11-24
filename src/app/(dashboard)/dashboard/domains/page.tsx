import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Globe, Plus, RefreshCw, AlertCircle, Clock } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Domains" };

function statusBadge(status: string) {
  const map: Record<string, string> = {
    ACTIVE: "badge-green",
    PENDING: "badge-blue",
    EXPIRED: "badge-red",
    SUSPENDED: "badge-red",
    CANCELLED: "badge-gray",
    TRANSFER_PENDING: "badge-orange",
    REDEMPTION_PERIOD: "badge-orange",
  };
  return map[status] ?? "badge-gray";
}

export default async function DomainsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const domains = await prisma.domain.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { extension: true },
  });

  const now = new Date();
  const total = domains.length;
  const needsAction = domains.filter((d) =>
    ["EXPIRED", "SUSPENDED", "REDEMPTION_PERIOD"].includes(d.status)
  ).length;
  const expiringSoon = domains.filter(
    (d) => d.expiryDate && differenceInDays(new Date(d.expiryDate), now) <= 60 && differenceInDays(new Date(d.expiryDate), now) > 0
  ).length;
  const transferPending = domains.filter((d) => d.status === "TRANSFER_PENDING").length;

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Portal Home / My Account</p>
          <h1 className="font-heading text-xl font-bold text-slate-900">Domains</h1>
          <p className="text-sm text-slate-500">
            Manage registrations, renewals, transfers and domain settings.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href="/domain-transfer"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Transfer in
          </Link>
          <Link
            href="/domains"
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add domain
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total domains", value: total, sub: "All registration states", active: true },
          { label: "Needs action", value: needsAction, sub: "Renewal or recovery review", warn: needsAction > 0 },
          { label: "Expiring soon", value: expiringSoon, sub: "Within 60 days", warn: expiringSoon > 0 },
          { label: "Transfers", value: transferPending, sub: "Awaiting completion" },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-lg border p-4 bg-white ${s.warn ? "border-orange-200" : s.active ? "border-brand-300" : "border-slate-200"}`}
          >
            <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${s.warn ? "text-orange-500" : s.active ? "text-brand-600" : "text-slate-400"}`}>
              {s.label}
            </p>
            <p className={`text-3xl font-bold leading-tight ${s.warn ? "text-orange-700" : "text-slate-900"}`}>
              {s.value}
            </p>
            <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Domains table */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-900">Domain portfolio</p>
          <p className="text-xs text-slate-400">
            Showing {total} domain{total !== 1 ? "s" : ""}
          </p>
        </div>

        {domains.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Globe className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium text-slate-600">No domains registered yet</p>
            <p className="text-xs mt-1 mb-5">Register your first domain to get started.</p>
            <Link
              href="/domains"
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              <Plus className="h-3.5 w-3.5" /> Register a Domain
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Domain</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Expiry</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Auto-renew</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {domains.map((domain) => {
                  const daysLeft = domain.expiryDate
                    ? differenceInDays(new Date(domain.expiryDate), now)
                    : null;
                  const expiring = daysLeft !== null && daysLeft <= 60 && daysLeft > 0;
                  const expired = daysLeft !== null && daysLeft <= 0;

                  return (
                    <tr key={domain.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium text-slate-900">{domain.domainName}</span>
                        </div>
                        {domain.status === "REDEMPTION_PERIOD" && (
                          <p className="text-xs text-orange-500 mt-0.5 pl-5">Restoration review required</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={statusBadge(domain.status)}>
                          {domain.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {domain.expiryDate ? (
                          <div className="flex items-center gap-1.5">
                            <span className={expired ? "text-red-600 font-medium" : expiring ? "text-orange-600" : "text-slate-600"}>
                              {format(new Date(domain.expiryDate), "yyyy-MM-dd")}
                            </span>
                            {expiring && <Clock className="h-3 w-3 text-orange-400" />}
                            {expired && <AlertCircle className="h-3 w-3 text-red-400" />}
                          </div>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={domain.autoRenew ? "badge-green" : "badge-gray"}>
                          {domain.autoRenew ? "Enabled" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button className="text-xs font-medium text-slate-700 hover:text-brand-600 border border-slate-200 rounded px-3 py-1.5 hover:border-brand-300 transition-colors">
                          Details →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
