import React from "react";
import Link from "next/link";
import { Globe, Server, Mail, Shield } from "lucide-react";

const stats = [
  { icon: Globe, value: "100+", label: "Domains registered", sub: ".co.tz, .com, .net and more" },
  { icon: Server, value: "50+", label: "Websites hosted", sub: "Businesses running on our servers" },
  { icon: Mail, value: "200+", label: "Email accounts", sub: "Professional business mailboxes" },
  { icon: Shield, value: "99.9%", label: "Uptime delivered", sub: "Measured across all services" },
];

export function TestimonialsSection() {
  return (
    <section className="section bg-[#0d1b2e]">
      <div className="container">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-3">
            By the numbers
          </p>
          <h2 className="font-heading text-3xl font-bold text-white mb-3">
            Trusted by businesses across Tanzania.
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            We&apos;re a local hosting provider committed to reliable, affordable infrastructure for Tanzanian businesses and organisations.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-white/10 bg-white/5 p-5 text-center">
              <s.icon className="h-6 w-6 text-brand-400 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white mb-1">{s.value}</p>
              <p className="text-sm font-medium text-slate-200">{s.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-md bg-brand-600 hover:bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition-colors"
          >
            Get started today
          </Link>
          <p className="text-xs text-slate-500 mt-3">No credit card required. Free account setup.</p>
        </div>
      </div>
    </section>
  );
}
