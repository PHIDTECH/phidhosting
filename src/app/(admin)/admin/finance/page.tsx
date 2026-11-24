import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FileText, CreditCard, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Finance" };

function sBadge(s: string) {
  const m: Record<string, string> = { PAID: "badge-green", UNPAID: "badge-orange", OVERDUE: "badge-red", CANCELLED: "badge-gray", DRAFT: "badge-gray", PENDING: "badge-blue", PARTIALLY_PAID: "badge-orange", COMPLETED: "badge-green", FAILED: "badge-red" };
  return m[s] ?? "badge-gray";
}

export default async function AdminFinancePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { q, status, tab = "invoices" } = await searchParams;

  const [invoices, payments, totalRevenue, pendingRevenue] = await Promise.all([
    prisma.invoice.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(q ? { OR: [{ invoiceNumber: { contains: q } }, { user: { email: { contains: q } } }] } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.payment.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(q ? { OR: [{ reference: { contains: q } }, { user: { email: { contains: q } } }] } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { name: true, email: true } },
        invoice: { select: { invoiceNumber: true } },
        gateway: { select: { name: true } },
      },
    }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "COMPLETED" } }),
    prisma.invoice.aggregate({ _sum: { total: true }, where: { status: { in: ["UNPAID", "OVERDUE"] } } }),
  ]);

  const totalRevenueVal = totalRevenue._sum.amount ?? 0;
  const pendingRevenueVal = pendingRevenue._sum.total ?? 0;

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">Finance</h1>
        <p className="text-sm text-slate-500 mt-0.5">Invoices, payments and revenue overview.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Revenue Collected", value: `$${totalRevenueVal.toFixed(2)}`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
          { label: "Outstanding Balance", value: `$${pendingRevenueVal.toFixed(2)}`, icon: FileText, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Total Invoices", value: invoices.length, icon: CreditCard, color: "text-brand-600", bg: "bg-brand-50" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`${s.bg} p-3 rounded-xl`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
              <div>
                <p className="text-xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {["invoices", "payments"].map((t) => (
          <Link key={t} href={`/admin/finance?tab=${t}`} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors capitalize ${tab === t ? "bg-white border border-b-white border-slate-200 text-brand-600 -mb-px" : "text-slate-500 hover:text-slate-700"}`}>{t}</Link>
        ))}
      </div>

      {/* Filters */}
      <form method="get" className="flex flex-wrap gap-3">
        <input type="hidden" name="tab" value={tab} />
        <input name="q" defaultValue={q} type="search" placeholder={tab === "invoices" ? "Invoice # or email..." : "Reference or email..."} className="input w-72" />
        <select name="status" defaultValue={status ?? ""} className="input w-40">
          <option value="">All Statuses</option>
          {tab === "invoices"
            ? ["DRAFT","UNPAID","PENDING","PAID","PARTIALLY_PAID","OVERDUE","CANCELLED"].map(s => <option key={s} value={s}>{s}</option>)
            : ["PENDING","PROCESSING","COMPLETED","FAILED","CANCELLED","REFUNDED"].map(s => <option key={s} value={s}>{s}</option>)
          }
        </select>
        <button type="submit" className="btn-primary">Search</button>
        {(q || status) && <Link href={`/admin/finance?tab=${tab}`} className="btn-outline">Clear</Link>}
      </form>

      {tab === "invoices" ? (
        <Card>
          <CardContent className="p-0">
            {invoices.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-16">No invoices found.</p>
            ) : (
              <div className="table-container border-0">
                <table className="table">
                  <thead>
                    <tr><th>Invoice #</th><th>Customer</th><th>Total</th><th>Paid</th><th>Balance</th><th>Due Date</th><th>Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td className="font-mono text-xs font-medium">{inv.invoiceNumber}</td>
                        <td>
                          <p>{inv.user.name ?? "—"}</p>
                          <p className="text-xs text-slate-400">{inv.user.email}</p>
                        </td>
                        <td>${inv.total.toFixed(2)}</td>
                        <td>${inv.amountPaid.toFixed(2)}</td>
                        <td className={inv.total - inv.amountPaid > 0 ? "text-orange-600 font-medium" : "text-green-600"}>
                          ${(inv.total - inv.amountPaid).toFixed(2)}
                        </td>
                        <td>{format(new Date(inv.dueDate), "dd MMM yyyy")}</td>
                        <td><span className={sBadge(inv.status)}>{inv.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            {payments.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-16">No payments found.</p>
            ) : (
              <div className="table-container border-0">
                <table className="table">
                  <thead>
                    <tr><th>Reference</th><th>Customer</th><th>Invoice</th><th>Amount</th><th>Gateway</th><th>Date</th><th>Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td className="font-mono text-xs">{p.reference ?? "—"}</td>
                        <td>
                          <p>{p.user.name ?? "—"}</p>
                          <p className="text-xs text-slate-400">{p.user.email}</p>
                        </td>
                        <td className="text-xs">{p.invoice?.invoiceNumber ?? "—"}</td>
                        <td className="font-medium">${p.amount.toFixed(2)}</td>
                        <td>{p.gateway?.name ?? p.method ?? "—"}</td>
                        <td>{format(new Date(p.createdAt), "dd MMM yyyy")}</td>
                        <td><span className={sBadge(p.status)}>{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
