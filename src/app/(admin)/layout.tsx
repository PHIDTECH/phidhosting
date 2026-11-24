import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "FINANCE", "SUPPORT", "HOSTING_MANAGER"];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (!ADMIN_ROLES.includes(session.user.role)) redirect("/dashboard");

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <AdminSidebar role={session.user.role} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminTopbar user={session.user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
