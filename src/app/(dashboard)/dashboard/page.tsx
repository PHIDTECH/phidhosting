import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Globe, Server, Mail, FileText, ArrowRight,
  Plus, Ticket, AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

function statusBadge(status: string) {
  const map: Record<string, string> = {
    ACTIVE: "badge-green",
    PAID: "badge-green",
    UNPAID: "badge-orange",
    OVERDUE: "badge-red",
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

  const [domainCount, hostingCount, emailCount, recentInvoices, notifications] =
    await Promise.all([
      prisma.domain.count({ where: { userId } }),
      prisma.hostingAccount.count({ where: { userId } }),
      prisma.emailService.count({ where: { userId } }),
      prisma.invoice.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          total: true,
          currency: true,
          dueDate: true,
          createdAt: true,
        },
      }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

  const unpaidCount = recentInvoices.filter((i) =>
    ["UNPAID", "OVERDUE"].includes(i.status)
  ).length;

  const stats = [
    {
      label: "Domains",
      value: domainCount,
      icon: Globe,
      iconColor: "text-brand-600",
      iconBg: "bg-brand-50",
      href: "/dashboard/domains",
    },
    {
      label: "Web Hosting",
      value: hostingCount,
      icon: Server,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50",
      href: "/dashboard/hosting",
    },
    {
      label: "Email Hosting",
      value: emailCount,
      icon: Mail,
      iconColor: "text-green-600",
      iconBg: "bg-green-50",
      href: "/dashboard/email",
    },
    {
      label: "Unpaid Invoices",
      value: unpaidCount,
      icon: FileText,
      iconColor: unpaidCount > 0 ? "text-orange-600" : "text-slate-400",
      iconBg: unpaidCount > 0 ? "bg-orange-50" : "bg-slate-50",
      href: "/dashboard/invoices",
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">
            Welcome back, {session.user.name?.split(" ")[0] || "there"}!
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Here&apos;s an overview of your services.
          </p>
        </div>
        {notifications > 0 && (
          <Link href="/dashboard/notifications">
            <div className="flex items-center gap-2 rounded-lg bg-orange-50 border border-orange-200 px-3 py-2 text-sm text-orange-700">
              <AlertCircle className="h-4 w-4" />
              {notifications} unread notification{notifications > 1 ? "s" : ""}
            </div>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.iconBg} rounded-xl p-3`}>
                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 pt-0">
          <Link href="/domains">
            <Button variant="outline" size="sm">
              <Globe className="h-4 w-4" />
              Register Domain
            </Button>
          </Link>
          <Link href="/hosting">
            <Button variant="outline" size="sm">
              <Server className="h-4 w-4" />
              Get Web Hosting
            </Button>
          </Link>
          <Link href="/email-hosting">
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4" />
              Get Email Hosting
            </Button>
          </Link>
          <Link href="/dashboard/support">
            <Button variant="outline" size="sm">
              <Ticket className="h-4 w-4" />
              Open Support Ticket
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-0">
          <CardTitle className="text-base">Recent Invoices</CardTitle>
          <Link
            href="/dashboard/invoices"
            className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          {recentInvoices.length === 0 ? (
            <div className="text-center py-14 text-slate-400">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No invoices yet</p>
              <p className="text-xs mt-1">
                Invoices will appear here after you order a service.
              </p>
            </div>
          ) : (
            <div className="table-container rounded-none border-x-0 border-b-0">
              <table className="table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Date</th>
                    <th>Due</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="font-medium text-slate-900">
                        {inv.invoiceNumber}
                      </td>
                      <td>{format(new Date(inv.createdAt), "dd MMM yyyy")}</td>
                      <td>{format(new Date(inv.dueDate), "dd MMM yyyy")}</td>
                      <td className="font-medium">
                        ${inv.total.toFixed(2)}{" "}
                        <span className="text-slate-400 font-normal">
                          {inv.currency}
                        </span>
                      </td>
                      <td>
                        <span className={statusBadge(inv.status)}>
                          {inv.status}
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
