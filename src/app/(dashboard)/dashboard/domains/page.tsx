import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Globe, Plus, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Domains" };

function domainStatusBadge(status: string) {
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

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">
            My Domains
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage all your registered domain names.
          </p>
        </div>
        <Link href="/domains">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Register Domain
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {domains.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-25" />
              <p className="font-medium text-slate-600">No domains yet</p>
              <p className="text-sm mt-1 mb-6">
                Register your first domain to get started.
              </p>
              <Link href="/domains">
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                  Register a Domain
                </Button>
              </Link>
            </div>
          ) : (
            <div className="table-container border-0">
              <table className="table">
                <thead>
                  <tr>
                    <th>Domain Name</th>
                    <th>TLD</th>
                    <th>Registered</th>
                    <th>Expires</th>
                    <th>Auto-Renew</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {domains.map((domain) => (
                    <tr key={domain.id}>
                      <td className="font-medium text-slate-900">
                        {domain.domainName}
                      </td>
                      <td>
                        <span className="badge-blue">{domain.tld}</span>
                      </td>
                      <td>
                        {domain.registrationDate
                          ? format(new Date(domain.registrationDate), "dd MMM yyyy")
                          : "—"}
                      </td>
                      <td>
                        {domain.expiryDate ? (
                          <span
                            className={
                              new Date(domain.expiryDate) < new Date()
                                ? "text-red-600 font-medium"
                                : ""
                            }
                          >
                            {format(new Date(domain.expiryDate), "dd MMM yyyy")}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <span
                          className={
                            domain.autoRenew ? "badge-green" : "badge-gray"
                          }
                        >
                          {domain.autoRenew ? "On" : "Off"}
                        </span>
                      </td>
                      <td>
                        <span className={domainStatusBadge(domain.status)}>
                          {domain.status.replace("_", " ")}
                        </span>
                      </td>
                      <td>
                        <a
                          href={`https://${domain.domainName}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-slate-600"
                          title="Visit domain"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
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
