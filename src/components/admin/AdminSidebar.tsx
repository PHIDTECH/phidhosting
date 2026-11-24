"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Users, Globe, Server, Mail, FileText,
  CreditCard, Ticket, Cpu, Database, Shield, ClipboardList,
  Settings, ChevronLeft, ChevronRight, Activity, Building2,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
};

const navItems: NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Domains", href: "/admin/domains", icon: Globe },
  { label: "Web Hosting", href: "/admin/hosting", icon: Server },
  { label: "Email Hosting", href: "/admin/email", icon: Mail },
  { label: "Finance", href: "/admin/finance", icon: CreditCard, roles: ["ADMIN", "SUPER_ADMIN", "FINANCE"] },
  { label: "Support", href: "/admin/support", icon: Ticket },
  { label: "Provisioning", href: "/admin/provisioning", icon: Activity },
  { label: "Servers", href: "/admin/servers", icon: Cpu, roles: ["ADMIN", "SUPER_ADMIN", "HOSTING_MANAGER"] },
  { label: "DNS & Registrars", href: "/admin/dns", icon: Database, roles: ["ADMIN", "SUPER_ADMIN"] },
  { label: "Staff & Roles", href: "/admin/staff", icon: Shield, roles: ["ADMIN", "SUPER_ADMIN"] },
  { label: "Audit Logs", href: "/admin/audit", icon: ClipboardList, roles: ["ADMIN", "SUPER_ADMIN"] },
  { label: "Settings", href: "/admin/settings", icon: Settings, roles: ["ADMIN", "SUPER_ADMIN"] },
];

export function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const visible = navItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside
      className={`flex flex-col bg-navy-900 text-white shrink-0 transition-all duration-200 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-brand-400" />
            <div>
              <span className="font-heading font-bold text-sm text-white">
                PHIDHOSTING
              </span>
              <p className="text-[10px] text-white/40 leading-none">Admin Panel</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-white/10 text-white/60 hover:text-white ml-auto"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-0.5 px-2">
          {visible.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-brand-600 text-white"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Customer portal link */}
      {!collapsed && (
        <div className="p-4 border-t border-white/10">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            <Users className="h-3.5 w-3.5" />
            Customer Portal
          </Link>
        </div>
      )}
    </aside>
  );
}
