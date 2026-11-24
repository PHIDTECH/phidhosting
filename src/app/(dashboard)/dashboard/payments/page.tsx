import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Payments" };

function statusBadge(status: string) {
  const map: Record<string, string> = {
    COMPLETED: "badge-green",
    PENDING: "badge-blue",
    PROCESSING: "badge-blue",
    FAILED: "badge-red",
    CANCELLED: "badge-gray",
    REFUNDED: "badge-gray",
  };
  return map[status] ?? "badge-gray";
}

export default async function PaymentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const payments = await prisma.payment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      invoice: { select: { invoiceNumber: true } },
      gateway: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">
          Payments
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Your complete payment history.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-25" />
              <p className="font-medium text-slate-600">No payments yet</p>
              <p className="text-sm mt-1">
                Payment transactions will appear here once you make a payment.
              </p>
            </div>
          ) : (
            <div className="table-container border-0">
              <table className="table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Invoice</th>
                    <th>Amount</th>
                    <th>Method / Gateway</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((pmt) => (
                    <tr key={pmt.id}>
                      <td className="font-medium text-slate-900 font-mono text-xs">
                        {pmt.reference ?? "—"}
                      </td>
                      <td>{pmt.invoice.invoiceNumber}</td>
                      <td className="font-medium">
                        ${pmt.amount.toFixed(2)}{" "}
                        <span className="text-slate-400 font-normal text-xs">
                          {pmt.currency}
                        </span>
                      </td>
                      <td>
                        {pmt.method ?? pmt.gateway?.name ?? "—"}
                      </td>
                      <td>
                        {pmt.paidAt
                          ? format(new Date(pmt.paidAt), "dd MMM yyyy HH:mm")
                          : format(new Date(pmt.createdAt), "dd MMM yyyy")}
                      </td>
                      <td>
                        <span className={statusBadge(pmt.status)}>
                          {pmt.status}
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
