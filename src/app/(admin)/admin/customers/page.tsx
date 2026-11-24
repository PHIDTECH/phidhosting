import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Customers" };

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { q, status } = await searchParams;

  const customers = await prisma.user.findMany({
    where: {
      role: "CUSTOMER",
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { email: { contains: q } },
              { phone: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          domains: true,
          hostingAccounts: true,
          emailServices: true,
          invoices: true,
        },
      },
    },
  });

  function statusBadge(s: string) {
    return s === "ACTIVE" ? "badge-green" : s === "SUSPENDED" ? "badge-red" : "badge-gray";
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {customers.length} customer{customers.length !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      {/* Filters */}
      <form method="get" className="flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q}
          type="search"
          placeholder="Search name, email, phone..."
          className="input w-72"
        />
        <select name="status" defaultValue={status ?? ""} className="input w-40">
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="BANNED">Banned</option>
        </select>
        <button type="submit" className="btn-primary">Search</button>
        {(q || status) && (
          <Link href="/admin/customers" className="btn-outline">Clear</Link>
        )}
      </form>

      <Card>
        <CardContent className="p-0">
          {customers.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-25" />
              <p className="text-sm">No customers found.</p>
            </div>
          ) : (
            <div className="table-container border-0">
              <table className="table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Domains</th>
                    <th>Hosting</th>
                    <th>Email</th>
                    <th>Invoices</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <p className="font-medium text-slate-900">{c.name ?? "—"}</p>
                        <p className="text-xs text-slate-400">{c.email}</p>
                      </td>
                      <td>{c.phone ?? "—"}</td>
                      <td>{c._count.domains}</td>
                      <td>{c._count.hostingAccounts}</td>
                      <td>{c._count.emailServices}</td>
                      <td>{c._count.invoices}</td>
                      <td>{format(new Date(c.createdAt), "dd MMM yyyy")}</td>
                      <td><span className={statusBadge(c.status)}>{c.status}</span></td>
                      <td>
                        <Link href={`/admin/customers/${c.id}`} className="text-brand-600 hover:text-brand-800" title="View">
                          <Eye className="h-4 w-4" />
                        </Link>
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
