"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Globe, Server, Mail, FileText, CreditCard,
  Ticket, Bell, Settings, LogOut, ChevronLeft, ChevronRight, User
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Domains", href: "/dashboard/domains", icon: Globe },
  { label: "Web Hosting", href: "/dashboard/hosting", icon: Server },
  { label: "Email Hosting", href: "/dashboard/email", icon: Mail },
  { label: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { label: "Support", href: "/dashboard/support", icon: Ticket },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col bg-white border-r border-slate-200 h-screen sticky top-0 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 font-heading font-bold text-sm text-navy-900">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-600">
              <span className="text-white text-xs font-bold">PH</span>
            </div>
            PHIDHOSTING
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="mx-auto">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600">
              <span className="text-white text-xs font-bold">PH</span>
            </div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "sidebar-link",
                  active && "active",
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" style={{ height: "18px", width: "18px" }} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Sign out */}
      <div className="border-t border-slate-200 p-2">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={cn(
            "sidebar-link w-full text-red-600 hover:bg-red-50 hover:text-red-700",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
