"use client";
import React, { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const popularTlds = [".com", ".co.tz", ".net", ".org", ".biz", ".or.tz"];

const trustStats = [
  { value: "99.9%", label: "Uptime guarantee" },
  { value: "24/7", label: "Expert support" },
  { value: "Free SSL", label: "On every plan" },
  { value: "Local", label: "Tanzania-based" },
];

export function HeroSection() {
  const [domain, setDomain] = useState("");
  const [searching, setSearching] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;
    setSearching(true);
    router.push(`/domains?search=${encodeURIComponent(domain.trim())}`);
  };

  return (
    <section className="gradient-hero py-16 lg:py-24">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          {/* Label */}
          <p className="text-sm font-medium text-brand-300 mb-4 tracking-wide uppercase">
            Domains · Web Hosting · Business Email
          </p>

          {/* Headline */}
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-white mb-5 leading-tight tracking-tight">
            Everything you need to get{" "}
            <span className="text-gradient">your business online.</span>
          </h1>

          <p className="text-base text-slate-300 max-w-xl mx-auto mb-9">
            Register your domain, host your website and set up professional business email
            with PHIDHOSTING — fast, secure and built for Tanzania.
          </p>

          {/* Search box */}
          <form onSubmit={handleSearch} className="mx-auto max-w-xl mb-5">
            <div className="flex h-12 rounded-md overflow-hidden shadow-lg border border-white/20">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="Find your perfect domain name..."
                  className="w-full h-full pl-10 pr-3 bg-white text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none"
                  autoComplete="off"
                />
              </div>
              <button
                type="submit"
                disabled={searching || !domain.trim()}
                className="shrink-0 px-5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                {searching ? "Searching…" : "Search"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Popular TLDs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
              <span className="text-xs text-slate-500">Popular:</span>
              {popularTlds.map((tld) => (
                <button
                  key={tld}
                  type="button"
                  onClick={() => {
                    setDomain((prev) => prev.replace(/\.[a-z.]+$/, "") + tld);
                  }}
                  className="text-xs font-medium text-slate-300 border border-white/15 rounded px-2.5 py-0.5 hover:border-white/40 hover:text-white transition-colors"
                >
                  {tld}
                </button>
              ))}
            </div>
          </form>

          {/* Secondary CTAs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <Link
              href="/hosting"
              className="inline-flex items-center gap-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition-colors"
            >
              Web Hosting plans
            </Link>
            <Link
              href="/email-hosting"
              className="inline-flex items-center gap-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition-colors"
            >
              Business Email
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>

        {/* Trust stats bar */}
        <div className="mx-auto max-w-2xl border-t border-white/10 pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {trustStats.map((s) => (
              <div key={s.label}>
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
