"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search, CheckCircle2, XCircle, Loader2, ArrowRight, Globe,
  ShoppingCart, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

const ALL_TLDS = [
  { tld: ".com", price: 12.99, desc: "Global standard" },
  { tld: ".co.tz", price: 24.99, desc: "Tanzania identity" },
  { tld: ".net", price: 11.99, desc: "Network services" },
  { tld: ".org", price: 10.99, desc: "Organisations" },
  { tld: ".or.tz", price: 24.99, desc: "TZ organisations" },
  { tld: ".ac.tz", price: 24.99, desc: "Academic TZ" },
  { tld: ".go.tz", price: 24.99, desc: "Government TZ" },
  { tld: ".biz", price: 10.99, desc: "Business" },
  { tld: ".info", price: 9.99, desc: "Information" },
];

interface CheckResult {
  domain: string;
  tld: string;
  available: boolean;
  supported: boolean;
  sandbox?: boolean;
  registrationPrice?: number;
  renewalPrice?: number;
  currency?: string;
  eligibilityReq?: string;
  message?: string;
}

export default function DomainsPage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [query, setQuery] = useState(initialSearch);
  const [input, setInput] = useState(initialSearch);
  const [results, setResults] = useState<CheckResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<string[]>([]);

  const checkDomain = useCallback(async (domain: string) => {
    const name = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (!name) return;

    setLoading(true);
    setResults([]);

    const hasTld = name.includes(".");
    const domainsToCHeck = hasTld
      ? [name]
      : ALL_TLDS.filter((e) => e.tld !== ".go.tz" && e.tld !== ".ac.tz").map((e) => name + e.tld);

    try {
      const checks = await Promise.all(
        domainsToCHeck.map((d) =>
          fetch(`/api/domains/check?domain=${encodeURIComponent(d)}`).then((r) => r.json())
        )
      );
      setResults(checks);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialSearch) {
      checkDomain(initialSearch);
    }
  }, [initialSearch, checkDomain]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(input);
    checkDomain(input);
  };

  const toggleCart = (domain: string) => {
    setCart((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    );
  };

  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero py-16 lg:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-4 py-1.5 text-sm text-brand-300 mb-6">
              <Globe className="h-4 w-4" />
              Domain Registration
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
              Find Your Perfect Domain
            </h1>
            <p className="text-slate-300 text-lg mb-10">
              Search from hundreds of domain extensions. Register your brand online today.
            </p>

            <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
              <div className="flex flex-col sm:flex-row gap-3 p-2 rounded-2xl bg-white/10 backdrop-blur border border-white/20 shadow-xl">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Search for your domain name..."
                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  loading={loading}
                  className="sm:w-auto w-full h-12 rounded-xl font-semibold"
                >
                  Search
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Results */}
      {(loading || results.length > 0) && (
        <section className="py-10 bg-slate-50">
          <div className="container max-w-4xl">
            {loading ? (
              <div className="text-center py-16">
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-brand-600 mb-3" />
                <p className="text-slate-500 text-sm">Checking domain availability…</p>
              </div>
            ) : (
              <>
                <h2 className="font-heading font-bold text-xl text-slate-900 mb-6">
                  Results for &quot;{query}&quot;
                </h2>
                <div className="space-y-3">
                  {results.map((r) => (
                    <div
                      key={r.domain}
                      className={`card p-4 flex items-center justify-between gap-4 ${
                        r.available ? "border-accent-200 bg-accent-50/30" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {r.available ? (
                          <CheckCircle2 className="h-5 w-5 text-accent-600 shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-slate-400 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className={`font-semibold text-sm ${r.available ? "text-slate-900" : "text-slate-400 line-through"}`}>
                            {r.domain}
                          </p>
                          {r.available && r.eligibilityReq && (
                            <p className="text-xs text-orange-600 mt-0.5 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {r.eligibilityReq}
                            </p>
                          )}
                          {!r.available && (
                            <p className="text-xs text-slate-400 mt-0.5">Not available</p>
                          )}
                        </div>
                      </div>
                      {r.available && r.registrationPrice ? (
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right hidden sm:block">
                            <p className="font-bold text-slate-900">
                              {formatCurrency(r.registrationPrice, r.currency || "USD")}
                            </p>
                            <p className="text-xs text-slate-400">/year</p>
                          </div>
                          <Button
                            size="sm"
                            variant={cart.includes(r.domain) ? "default" : "outline"}
                            onClick={() => toggleCart(r.domain)}
                            className="gap-2"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            {cart.includes(r.domain) ? "Added" : "Add to Cart"}
                          </Button>
                        </div>
                      ) : (
                        <span className="badge-gray shrink-0">Taken</span>
                      )}
                    </div>
                  ))}
                </div>

                {cart.length > 0 && (
                  <div className="mt-6 p-4 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-brand-900 text-sm">
                        {cart.length} domain{cart.length > 1 ? "s" : ""} selected
                      </p>
                      <p className="text-xs text-brand-600 mt-0.5">{cart.join(", ")}</p>
                    </div>
                    <Link href="/register">
                      <Button size="sm">
                        Continue to Register
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* All TLD Pricing */}
      <section className="section bg-white" id="extensions">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Domain Extensions & Pricing
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Choose from popular international and local Tanzanian domain extensions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {ALL_TLDS.map((ext) => (
              <div key={ext.tld} className="card p-5 flex items-center justify-between gap-4 hover:border-brand-300 hover:shadow-md transition-all">
                <div>
                  <span className="font-heading font-bold text-2xl text-brand-700">{ext.tld}</span>
                  <p className="text-xs text-slate-500 mt-0.5">{ext.desc}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{formatCurrency(ext.price, "USD")}</p>
                  <p className="text-xs text-slate-400">/year registration</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-slate-400 mt-8">
            Prices shown in USD. Renewal prices may vary. Local TZ domains may have eligibility requirements.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm bg-brand-600 text-white">
        <div className="container text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-3">
            Ready to claim your domain?
          </h2>
          <p className="text-brand-200 mb-8">Create a free account and register your domain in minutes.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button variant="secondary" size="lg" className="font-semibold">
                Get Started Free
              </Button>
            </Link>
            <Link href="/hosting">
              <Button variant="outline" size="lg" className="border-white/30 bg-white/10 text-white hover:bg-white/20 font-semibold">
                Also Need Hosting?
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
