import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AddStaffForm } from "./AddStaffForm";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Staff & Roles" };

const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "HOSTING_MANAGER", "FINANCE", "SUPPORT"];

function roleBadge(r: string) {
  const m: Record<string, string> = { SUPER_ADMIN: "badge-red", ADMIN: "badge-orange", HOSTING_MANAGER: "badge-blue", FINANCE: "badge-green", SUPPORT: "badge-gray" };
  return m[r] ?? "badge-gray";
}

function roleLabel(r: string) {
  const m: Record<string, string> = { SUPER_ADMIN: "Super Admin", ADMIN: "Administrator", HOSTING_MANAGER: "Hosting Manager", FINANCE: "Finance", SUPPORT: "Support" };
  return m[r] ?? r;
}

export default async function AdminStaffPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const staff = await prisma.user.findMany({
    where: { role: { in: STAFF_ROLES } },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    include: {
      staffPermissions: true,
      _count: { select: { assignedTickets: true } },
    },
  });

  const permissionDefs = [
    { key: "customers.view", label: "View customers" },
    { key: "customers.edit", label: "Edit customers" },
    { key: "domains.view", label: "View domains" },
    { key: "domains.manage", label: "Manage domains" },
    { key: "hosting.view", label: "View hosting" },
    { key: "hosting.manage", label: "Manage hosting" },
    { key: "email.view", label: "View email" },
    { key: "email.manage", label: "Manage email" },
    { key: "finance.view", label: "View finance" },
    { key: "finance.manage", label: "Manage finance" },
    { key: "support.view", label: "View support" },
    { key: "support.reply", label: "Reply to tickets" },
    { key: "servers.view", label: "View servers" },
    { key: "servers.manage", label: "Manage servers" },
    { key: "audit.view", label: "View audit logs" },
    { key: "settings.manage", label: "Manage settings" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">Staff & Roles</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {staff.length} staff member{staff.length !== 1 ? "s" : ""}. Manage roles and permissions.
        </p>
      </div>

      {session.user.role === "SUPER_ADMIN" && <AddStaffForm />}

      {/* Role guide */}
      <Card className="bg-slate-50">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-slate-700 mb-3">Role Hierarchy</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {STAFF_ROLES.map((r) => (
              <div key={r} className="text-center">
                <span className={roleBadge(r)}>{roleLabel(r)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {staff.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Shield className="h-10 w-10 mx-auto mb-3 opacity-25" />
              <p className="text-sm">No staff accounts found.</p>
            </div>
          ) : (
            <div className="table-container border-0">
              <table className="table">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Assigned Tickets</th>
                    <th>Extra Permissions</th>
                    <th>Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staff.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <p className="font-medium text-slate-900">{u.name ?? "—"}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </td>
                      <td><span className={roleBadge(u.role)}>{roleLabel(u.role)}</span></td>
                      <td><span className={u.status === "ACTIVE" ? "badge-green" : "badge-red"}>{u.status}</span></td>
                      <td className="text-center">{u._count.assignedTickets}</td>
                      <td className="text-xs text-slate-500">
                        {u.staffPermissions.length === 0
                          ? "Role defaults"
                          : u.staffPermissions.slice(0, 3).map(p => p.permission).join(", ") + (u.staffPermissions.length > 3 ? ` +${u.staffPermissions.length - 3}` : "")}
                      </td>
                      <td className="text-xs">{format(new Date(u.createdAt), "dd MMM yyyy")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permission reference */}
      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-slate-700 mb-3">Available Permissions (via StaffPermission model)</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {permissionDefs.map((p) => (
              <div key={p.key} className="text-xs">
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{p.key}</code>
                <span className="text-slate-400 ml-1">{p.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
