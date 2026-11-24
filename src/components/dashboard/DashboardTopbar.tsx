"use client";
import React from "react";
import Link from "next/link";
import { Search, Bell, ChevronDown, User, Settings, LogOut, LayoutDashboard } from "lucide-react";
import { signOut } from "next-auth/react";

interface Props {
  user: { name?: string | null; email: string; role: string };
}

export function DashboardTopbar({ user }: Props) {
  const initials = (user.name ?? user.email)
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="flex h-14 items-center gap-4 border-b border-slate-200 bg-white px-5">
      {/* Search */}
      <div className="flex flex-1 items-center max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search domains, services, invoices..."
            className="w-full h-9 pl-9 pr-3 rounded-md border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 focus:bg-white transition-colors"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
            Ctrl K
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1 ml-auto">
        <Link
          href="/dashboard/notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          title="Notifications"
        >
          <Bell className="h-4.5 w-4.5" style={{ height: "18px", width: "18px" }} />
        </Link>

        {/* Account dropdown */}
        <div className="relative group ml-1">
          <button className="flex items-center gap-2 rounded-md border border-slate-200 pl-2 pr-3 py-1.5 hover:bg-slate-50 transition-colors">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-brand-600 text-white text-[10px] font-bold">
              {initials}
            </div>
            <span className="text-sm font-medium text-slate-700 max-w-[110px] truncate hidden sm:block">
              My Account
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
          </button>

          <div className="absolute right-0 top-full mt-1 w-52 rounded-lg border border-slate-200 bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user.name || user.email.split("@")[0]}
              </p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
            <div className="py-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-slate-400" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                <User className="h-3.5 w-3.5 text-slate-400" />
                Profile
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                <Settings className="h-3.5 w-3.5 text-slate-400" />
                Settings
              </Link>
              {["ADMIN", "SUPER_ADMIN"].includes(user.role) && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-brand-600 hover:bg-brand-50"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Admin Panel
                </Link>
              )}
            </div>
            <div className="border-t border-slate-100 py-1">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
