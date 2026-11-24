import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Invoices" };

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
    include: {
      items: { select: { description: true } },
    },
  });

  const totalUnpaid = invoices
    .filter((i) => ["UNPAID", "OVERDUE"].includes(i.status))
    .reduce((sum, i) => sum + (i.total - i.amountPaid), 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">Invoices</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          View and pay your invoices.
        </p>
      </div>

      {totalUnpaid > 0 && (
        <div className="rounded-xl bg-orange-50 border border-orange-200 p-4 flex items-center gap-3">
          <FileText className="h-5 w-5 text-orange-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-orange-800">
              You have outstanding balance of ${totalUnpaid.toFixed(2)}
            </p>
            <p className="text-xs text-orange-600 mt-0.5">
              Please settle your invoices to avoid service interruption.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-25" />
              <p className="font-medium text-slate-600">No invoices yet</p>
              <p className="text-sm mt-1">
                Invoices will appear here when you purchase a service.
              </p>
            </div>
          ) : (
            <div className="table-container border-0">
              <table className="table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Due Date</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="font-medium text-slate-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="text-slate-500 max-w-xs truncate">
                        {inv.items[0]?.description ?? "—"}
                        {inv.items.length > 1 &&
                          ` (+${inv.items.length - 1} more)`}
                      </td>
                      <td>{format(new Date(inv.createdAt), "dd MMM yyyy")}</td>
                      <td>
                        <span
                          className={
                            inv.status === "OVERDUE" ||
                            (inv.status === "UNPAID" &&
                              new Date(inv.dueDate) < new Date())
                              ? "text-red-600 font-medium"
                              : ""
                          }
                        >
                          {format(new Date(inv.dueDate), "dd MMM yyyy")}
                        </span>
                      </td>
                      <td className="font-medium">
                        ${inv.total.toFixed(2)}{" "}
                        <span className="text-slate-400 font-normal text-xs">
                          {inv.currency}
                        </span>
                      </td>
                      <td>${inv.amountPaid.toFixed(2)}</td>
                      <td>
                        <span className={statusBadge(inv.status)}>
                          {inv.status.replace("_", " ")}
                        </span>
                      </td>
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
