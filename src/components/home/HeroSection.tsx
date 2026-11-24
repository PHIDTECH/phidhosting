"use client";
import React, { useState } from "react";
import { Search, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

const popularTlds = [".com", ".co.tz", ".net", ".org", ".biz"];

const highlights = [
  "Free SSL Certificate",
  "24/7 Expert Support",
  "99.9% Uptime Guarantee",
];

export function HeroSection() {
  const [domain, setDomain] = useState("");
  const [searching, setSearching] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;
    setSearching(true);
    router.push(`/domains?search=${encodeURIComponent(domain.trim())}`);
  };

  return (
    <section className="relative overflow-hidden gradient-hero py-20 lg:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-brand-800/20 blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-4 py-1.5 text-sm text-brand-300 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-pulse" />
            Trusted hosting for Tanzania and beyond
          </div>

          {/* Headline */}
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Domains, Web Hosting &{" "}
            <span className="text-gradient">Business Email</span>
            <br />— All in One Place.
          </h1>

          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Register your domain, host your website and create professional business email accounts
            with PHIDHOSTING. Fast, secure and affordable.
          </p>

          {/* Domain search */}
          <form onSubmit={handleSearch} className="mx-auto max-w-2xl mb-8">
            <div className="flex flex-col sm:flex-row gap-3 p-2 rounded-2xl bg-white/10 backdrop-blur border border-white/20 shadow-xl">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="Search for your domain name..."
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                loading={searching}
                className="sm:w-auto w-full h-12 rounded-xl font-semibold"
              >
                Search Domain
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Popular TLDs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <span className="text-xs text-slate-400">Popular:</span>
              {popularTlds.map((tld) => (
                <button
                  key={tld}
                  type="button"
                  onClick={() => setDomain((prev) => {
                    const base = prev.replace(/\.[a-z.]+$/, "");
                    return base + tld;
                  })}
                  className="rounded-full px-3 py-1 text-xs font-medium bg-white/10 text-slate-300 border border-white/20 hover:bg-white/20 hover:text-white transition-colors"
                >
                  {tld}
                </button>
              ))}
            </div>
          </form>

          {/* Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {highlights.map((h) => (
              <div key={h} className="flex items-center gap-1.5 text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-accent-400 shrink-0" />
                {h}
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <Link href="/hosting">
              <Button
                variant="secondary"
                size="lg"
                className="font-semibold"
              >
                Explore Web Hosting
              </Button>
            </Link>
            <Link href="/email-hosting">
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 font-semibold"
              >
                Business Email
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
