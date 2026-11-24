"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Globe, Server, Mail, Phone, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
  {
    label: "Domains",
    href: "/domains",
    children: [
      { label: "Domain Search", href: "/domains", icon: Globe, desc: "Find your perfect domain name" },
      { label: "Domain Transfer", href: "/domain-transfer", icon: Globe, desc: "Transfer to PHIDHOSTING" },
      { label: "Domain Extensions", href: "/domains#extensions", icon: Globe, desc: "Browse all TLDs" },
    ],
  },
  {
    label: "Web Hosting",
    href: "/hosting",
    children: [
      { label: "Shared Hosting", href: "/hosting", icon: Server, desc: "Fast, reliable shared hosting" },
      { label: "Hosting Packages", href: "/hosting#packages", icon: Server, desc: "Compare all plans" },
    ],
  },
  {
    label: "Email Hosting",
    href: "/email-hosting",
    children: [
      { label: "Business Email", href: "/email-hosting", icon: Mail, desc: "Professional email for business" },
      { label: "Email Packages", href: "/email-hosting#packages", icon: Mail, desc: "Compare email plans" },
    ],
  },
  { label: "Pricing", href: "/pricing" },
  { label: "Support", href: "/support" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <nav className="container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl text-navy-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <span className="text-white text-xs font-bold">PH</span>
            </div>
            PHIDHOSTING
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                {item.children ? (
                  <button
                    className={cn(
                      "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      pathname.startsWith(item.href)
                        ? "text-brand-700 bg-brand-50"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    )}
                  >
                    {item.label}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "text-brand-700 bg-brand-50"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    )}
                  >
                    {item.label}
                  </Link>
                )}

                {item.children && openDropdown === item.label && (
                  <div className="absolute top-full left-0 w-64 pt-2">
                    <div className="rounded-xl border border-slate-200 bg-white shadow-lg p-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="flex items-start gap-3 rounded-lg p-3 hover:bg-slate-50 transition-colors"
                        >
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                            <child.icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{child.label}</div>
                            <div className="text-xs text-slate-500">{child.desc}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="tel:+255744741874"
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
            >
              <Phone className="h-3.5 w-3.5" />
              +255 744 741 874
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pb-6 pt-4">
          <div className="space-y-1">
            {navigation.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                  {item.children && <ChevronDown className="h-4 w-4 text-slate-400" />}
                </Link>
                {item.children && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-slate-200 pl-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                        onClick={() => setMobileOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <Link href="/login" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" className="w-full">Sign In</Button>
            </Link>
            <Link href="/register" onClick={() => setMobileOpen(false)}>
              <Button className="w-full">Get Started Free</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
