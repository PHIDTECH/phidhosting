import React from "react";
import Link from "next/link";
import { Globe, Mail, Phone, MapPin, Twitter, Facebook, Linkedin } from "lucide-react";

const footerLinks = {
  services: {
    title: "Services",
    links: [
      { label: "Domain Registration", href: "/domains" },
      { label: "Domain Transfer", href: "/domain-transfer" },
      { label: "Web Hosting", href: "/hosting" },
      { label: "Business Email", href: "/email-hosting" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Support", href: "/support" },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Acceptable Use", href: "/acceptable-use" },
      { label: "Domain Policy", href: "/domain-policy" },
      { label: "Refund Policy", href: "/refund-policy" },
    ],
  },
  account: {
    title: "Account",
    links: [
      { label: "Client Portal", href: "/dashboard" },
      { label: "Sign In", href: "/login" },
      { label: "Create Account", href: "/register" },
      { label: "Submit Ticket", href: "/support/tickets/new" },
    ],
  },
};

const tlds = [".com", ".net", ".org", ".co.tz", ".or.tz", ".ac.tz", ".biz", ".info"];

export function Footer() {
  return (
    <footer className="bg-navy-950 text-slate-300">
      {/* TLD banner */}
      <div className="border-b border-white/10 py-4">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Register:</span>
            {tlds.map((tld) => (
              <Link
                key={tld}
                href={`/domains?tld=${tld.replace(".", "")}`}
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                {tld}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl text-white mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                <span className="text-white text-xs font-bold">PH</span>
              </div>
              PHIDHOSTING
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Professional domains, web hosting and business email for Tanzania and beyond. 
              Reliable infrastructure, expert support, affordable pricing.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="h-4 w-4 shrink-0 text-brand-400" />
                Dar es Salaam, Tanzania
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="h-4 w-4 shrink-0 text-brand-400" />
                <a href="mailto:info@phidhosting.com" className="hover:text-white transition-colors">
                  info@phidhosting.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Phone className="h-4 w-4 shrink-0 text-brand-400" />
                <a href="tel:+255000000000" className="hover:text-white transition-colors">
                  +255 XXX XXX XXX
                </a>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-slate-400 hover:bg-brand-600 hover:text-white transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-slate-400 hover:bg-brand-600 hover:text-white transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-slate-400 hover:bg-brand-600 hover:text-white transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="font-heading font-semibold text-white text-sm mb-4 uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} PHIDHOSTING. All rights reserved.
            </p>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Globe className="h-3 w-3" />
              <span>www.phidhosting.com</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
