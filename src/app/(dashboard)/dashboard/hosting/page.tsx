import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Server, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Web Hosting" };

function statusBadge(status: string) {
  const map: Record<string, string> = {
    ACTIVE: "badge-green",
    PENDING: "badge-blue",
    PROVISIONING: "badge-blue",
    SUSPENDED: "badge-red",
    CANCELLED: "badge-gray",
    EXPIRED: "badge-red",
    TERMINATED: "badge-gray",
  };
  return map[status] ?? "badge-gray";
}

function billingPeriodLabel(period: string) {
  const map: Record<string, string> = {
    MONTHLY: "Monthly",
    QUARTERLY: "Quarterly",
    SEMI_ANNUALLY: "Semi-Annual",
    ANNUALLY: "Annual",
    BIENNIALLY: "2 Years",
  };
  return map[period] ?? period;
}

export default async function HostingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const accounts = await prisma.hostingAccount.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { package: true, server: true },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">
            Web Hosting
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your web hosting accounts.
          </p>
        </div>
        <Link href="/hosting">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New Hosting Plan
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {accounts.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Server className="h-12 w-12 mx-auto mb-4 opacity-25" />
              <p className="font-medium text-slate-600">No hosting accounts yet</p>
              <p className="text-sm mt-1 mb-6">
                Choose a hosting plan to launch your website.
              </p>
              <Link href="/hosting">
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                  Get Web Hosting
                </Button>
              </Link>
            </div>
          ) : (
            <div className="table-container border-0">
              <table className="table">
                <thead>
                  <tr>
                    <th>Domain</th>
                    <th>Package</th>
                    <th>Billing</th>
                    <th>Start Date</th>
                    <th>Expires</th>
                    <th>Storage</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accounts.map((account) => (
                    <tr key={account.id}>
                      <td className="font-medium text-slate-900">
                        {account.domain}
                      </td>
                      <td>{account.package.name}</td>
                      <td>{billingPeriodLabel(account.billingPeriod)}</td>
                      <td>
                        {account.startDate
                          ? format(new Date(account.startDate), "dd MMM yyyy")
                          : "—"}
                      </td>
                      <td>
                        {account.expiryDate ? (
                          <span
                            className={
                              new Date(account.expiryDate) < new Date()
                                ? "text-red-600 font-medium"
                                : ""
                            }
                          >
                            {format(new Date(account.expiryDate), "dd MMM yyyy")}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        {account.storageUsedMB != null
                          ? `${(account.storageUsedMB / 1024).toFixed(1)} / ${account.package.storageGB} GB`
                          : `0 / ${account.package.storageGB} GB`}
                      </td>
                      <td>
                        <span className={statusBadge(account.status)}>
                          {account.status}
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
