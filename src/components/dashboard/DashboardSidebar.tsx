"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Globe, Server, Mail, FileText, CreditCard,
  Ticket, Bell, Settings, LogOut, User, ExternalLink,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

interface Props {
  user: { name?: string | null; email: string; role: string };
}

const workspaceItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Domains", href: "/dashboard/domains", icon: Globe },
  { label: "Services", href: "/dashboard/hosting", icon: Server },
  { label: "Email", href: "/dashboard/email", icon: Mail },
  { label: "Billing", href: "/dashboard/invoices", icon: FileText },
  { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { label: "Support", href: "/dashboard/support", icon: Ticket },
];

const accountItems = [
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function NavItem({
  href,
  icon: Icon,
  label,
  exact,
  pathname,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  exact?: boolean;
  pathname: string;
}) {
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-white/15 text-white"
          : "text-slate-400 hover:bg-white/8 hover:text-slate-100"
      )}
      style={!active ? undefined : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}

export function DashboardSidebar({ user }: Props) {
  const pathname = usePathname();
  const initials = (user.name ?? user.email)
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="flex flex-col w-56 shrink-0 bg-[#0d1b2e] h-screen sticky top-0">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-4 border-b border-white/10">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-500">
          <span className="text-white text-xs font-bold tracking-tight">PH</span>
        </div>
        <Link href="/" className="font-heading font-bold text-sm text-white tracking-wide">
          PHIDHOSTING
        </Link>
      </div>

      {/* Account block */}
      <div className="px-3 py-3 border-b border-white/10">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-600 text-white text-xs font-bold">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate leading-tight">
              {user.name ?? user.email.split("@")[0]}
            </p>
            <p className="text-xs text-slate-400 truncate">Client Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        <div>
          <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Workspace
          </p>
          <div className="space-y-0.5">
            {workspaceItems.map((item) => (
              <NavItem key={item.href} {...item} pathname={pathname} />
            ))}
          </div>
        </div>

        <div>
          <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Account
          </p>
          <div className="space-y-0.5">
            {accountItems.map((item) => (
              <NavItem key={item.href} {...item} pathname={pathname} />
            ))}
          </div>
        </div>

        {["ADMIN", "SUPER_ADMIN"].includes(user.role) && (
          <div>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Admin
            </p>
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-400 hover:bg-white/8 hover:text-slate-100 transition-colors"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              Admin Panel
            </Link>
          </div>
        )}
      </nav>

      {/* Sign out */}
      <div className="border-t border-white/10 p-2">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-400 hover:bg-white/8 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
