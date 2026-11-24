import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Mail, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Email Hosting" };

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

export default async function EmailPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const services = await prisma.emailService.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      package: true,
      mailboxes: { select: { id: true } },
    },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">
            Email Hosting
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your professional email accounts.
          </p>
        </div>
        <Link href="/email-hosting">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New Email Plan
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {services.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-25" />
              <p className="font-medium text-slate-600">No email services yet</p>
              <p className="text-sm mt-1 mb-6">
                Set up professional email hosting for your domain.
              </p>
              <Link href="/email-hosting">
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                  Get Email Hosting
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
                    <th>Mailboxes</th>
                    <th>DNS Verified</th>
                    <th>Start Date</th>
                    <th>Expires</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {services.map((svc) => (
                    <tr key={svc.id}>
                      <td className="font-medium text-slate-900">{svc.domain}</td>
                      <td>{svc.package.name}</td>
                      <td>
                        {svc.mailboxes.length} / {svc.package.maxMailboxes}
                      </td>
                      <td>
                        <span
                          className={
                            svc.dnsVerified ? "badge-green" : "badge-orange"
                          }
                        >
                          {svc.dnsVerified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td>
                        {svc.startDate
                          ? format(new Date(svc.startDate), "dd MMM yyyy")
                          : "—"}
                      </td>
                      <td>
                        {svc.expiryDate ? (
                          <span
                            className={
                              new Date(svc.expiryDate) < new Date()
                                ? "text-red-600 font-medium"
                                : ""
                            }
                          >
                            {format(new Date(svc.expiryDate), "dd MMM yyyy")}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <span className={statusBadge(svc.status)}>
                          {svc.status}
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
