"use client";
import React from "react";
import Link from "next/link";
import { Bell, ChevronDown, ExternalLink } from "lucide-react";
import { signOut } from "next-auth/react";

interface Props {
  user: { name?: string | null; email: string; role: string };
}

export function DashboardTopbar({ user }: Props) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <h1 className="text-sm font-semibold text-slate-900">Client Portal</h1>
        <p className="text-xs text-slate-400">Manage your services</p>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
        >
          Visit site <ExternalLink className="h-3 w-3" />
        </Link>
        <Link href="/dashboard/notifications" className="relative">
          <Bell className="h-5 w-5 text-slate-500 hover:text-slate-700" />
        </Link>
        <div className="relative group">
          <button className="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-slate-100 transition-colors">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-bold">
              {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
              {user.name || user.email}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>
          <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-slate-200 bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <div className="p-3 border-b border-slate-100">
              <p className="text-xs font-medium text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
            <div className="p-1">
              <Link href="/dashboard/profile" className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">Profile</Link>
              <Link href="/dashboard/settings" className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">Settings</Link>
              {["ADMIN", "SUPER_ADMIN"].includes(user.role) && (
                <Link href="/admin" className="block rounded-lg px-3 py-2 text-sm text-brand-600 hover:bg-brand-50">Admin Dashboard</Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full text-left rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
