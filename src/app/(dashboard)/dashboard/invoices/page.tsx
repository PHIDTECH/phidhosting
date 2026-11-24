import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FileText } from "lucide-react";
import { format } from "date-fns";
import { PayButton } from "@/components/dashboard/PayButton";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Invoices & Payments" };

function statusBadge(status: string) {
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

export default async function InvoicesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const invoices = await prisma.invoice.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { select: { description: true } } },
  });

  const total = invoices.length;
  const unpaid = invoices.filter((i) => i.status === "UNPAID").length;
  const overdue = invoices.filter((i) => i.status === "OVERDUE").length;
  const paid = invoices.filter((i) => i.status === "PAID").length;
  const unpaidBalance = invoices
    .filter((i) => ["UNPAID", "OVERDUE"].includes(i.status))
    .reduce((s, i) => s + (i.total - i.amountPaid), 0);

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div>
        <p className="text-xs text-slate-400 mb-0.5">Portal Home / Billing</p>
        <h1 className="font-heading text-xl font-bold text-slate-900">Invoices &amp; payments</h1>
        <p className="text-sm text-slate-500">Review each invoice and its remaining balance before paying.</p>
      </div>

      {/* Outstanding balance notice */}
      {unpaidBalance > 0 && (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Payment pending? Open the invoice to check its latest status before retrying.
          Outstanding balance: <strong>${unpaidBalance.toFixed(2)}</strong>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total invoices", value: total },
          { label: "Unpaid", value: unpaid, warn: unpaid > 0 },
          { label: "Overdue", value: overdue, danger: overdue > 0 },
          { label: "Paid", value: paid },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-lg border p-4 bg-white ${s.danger ? "border-red-200" : s.warn ? "border-orange-200" : "border-slate-200"}`}
          >
            <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${s.danger ? "text-red-500" : s.warn ? "text-orange-500" : "text-slate-400"}`}>
              {s.label}
            </p>
            <p className={`text-3xl font-bold leading-tight ${s.danger ? "text-red-700" : s.warn ? "text-orange-700" : "text-slate-900"}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Invoices table */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-900">All invoices</p>
          <p className="text-xs text-slate-400">Showing 1 to {total} of {total} entries</p>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium text-slate-600">No invoices yet</p>
            <p className="text-xs mt-1">Invoices will appear here when you purchase a service.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Invoice #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Invoice date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Due date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Remaining</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.map((inv) => {
                  const remaining = inv.total - inv.amountPaid;
                  const overdueDue = inv.status === "OVERDUE" || (inv.status === "UNPAID" && new Date(inv.dueDate) < new Date());
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-900 font-mono text-xs">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {format(new Date(inv.createdAt), "dd MMM yyyy")}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={overdueDue ? "text-red-600 font-medium" : "text-slate-600"}>
                          {format(new Date(inv.dueDate), "dd MMM yyyy")}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-900">
                        ${inv.total.toFixed(2)}{" "}
                        <span className="text-slate-400 font-normal text-xs">{inv.currency}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={remaining > 0 ? "text-orange-600 font-medium" : "text-slate-400"}>
                          ${remaining.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={statusBadge(inv.status)}>
                          {inv.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {["UNPAID", "OVERDUE", "PARTIALLY_PAID"].includes(inv.status) ? (
                          <PayButton invoiceId={inv.id} />
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
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
