"use client";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Bell, ExternalLink, LogOut, User } from "lucide-react";

type AdminUser = {
  id: string;
  name?: string | null;
  email: string;
  role: string;
};

function roleLabel(role: string) {
  const map: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Administrator",
    HOSTING_MANAGER: "Hosting Manager",
    FINANCE: "Finance",
    SUPPORT: "Support",
  };
  return map[role] ?? role;
}

export function AdminTopbar({ user }: { user: AdminUser }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div className="text-sm text-slate-500">
        PHIDHOSTING &mdash; <span className="font-semibold text-slate-700">Admin Control Panel</span>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          View Site
        </Link>

        {/* User menu */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 leading-none">
              {user.name ?? user.email}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{roleLabel(user.role)}</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center">
            <User className="h-4 w-4 text-brand-600" />
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
