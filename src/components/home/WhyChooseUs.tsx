import React from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";

const features = [
  "Free SSL certificate on every plan",
  "SSD-powered servers for fast load times",
  "99.9% uptime SLA with monitoring",
  "24/7 expert support via tickets",
  "Free website migration assistance",
  "cPanel hosting control panel",
  "Professional business email hosting",
  "Local Tanzania-based operations",
  "Automatic daily backups",
  "One-click WordPress installer",
];

const comparison = [
  { feature: "Free SSL", us: true, shared: false },
  { feature: "24/7 Support", us: true, shared: false },
  { feature: "cPanel included", us: true, shared: true },
  { feature: "Local billing (TZS)", us: true, shared: false },
  { feature: "Free migration", us: true, shared: false },
  { feature: "Daily backups", us: true, shared: false },
];

export function WhyChooseUs() {
  return (
    <section className="section bg-slate-50 border-y border-slate-100">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: feature list */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">
              Why PHIDHOSTING
            </p>
            <h2 className="font-heading text-3xl font-bold text-slate-900 mb-4 leading-snug">
              Professional hosting built for Tanzanian businesses.
            </h2>
            <p className="text-slate-500 mb-8">
              Every plan comes with the tools and support you need to run a reliable, secure website or email service — without the complexity.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex gap-3">
              <Link
                href="/hosting"
                className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                See hosting plans
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                About us
              </Link>
            </div>
          </div>

          {/* Right: comparison table */}
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <div className="px-5 py-3">Feature</div>
              <div className="px-4 py-3 text-center text-brand-700">PHIDHOSTING</div>
              <div className="px-4 py-3 text-center">Typical shared</div>
            </div>
            {comparison.map((row) => (
              <div key={row.feature} className="grid grid-cols-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                <div className="px-5 py-3.5 text-sm text-slate-700">{row.feature}</div>
                <div className="px-4 py-3.5 flex justify-center">
                  {row.us
                    ? <Check className="h-4 w-4 text-green-500" />
                    : <X className="h-4 w-4 text-slate-300" />}
                </div>
                <div className="px-4 py-3.5 flex justify-center">
                  {row.shared
                    ? <Check className="h-4 w-4 text-green-500" />
                    : <X className="h-4 w-4 text-slate-300" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
