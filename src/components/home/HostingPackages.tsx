"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, billingPeriodLabel } from "@/lib/utils";

interface Package {
  id: string;
  name: string;
  shortDescription: string;
  features: string;
  isFeatured: boolean;
  pricing: { billingPeriod: string; price: number; currency: string }[];
}

export function HostingPackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [period, setPeriod] = useState<"MONTHLY" | "ANNUALLY">("ANNUALLY");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/packages/hosting")
      .then((r) => r.json())
      .then((d) => { setPackages(d.packages || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const getPrice = (pkg: Package) =>
    pkg.pricing.find((p) => p.billingPeriod === period) ||
    pkg.pricing.find((p) => p.billingPeriod === "MONTHLY");

  return (
    <section className="section bg-slate-50" id="hosting-packages">
      <div className="container">
        <div className="text-center mb-12">
          <Badge variant="default" className="mb-4">Web Hosting</Badge>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Fast, Reliable Web Hosting Plans
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8">
            All plans include free SSL, cPanel access and 99.9% uptime guarantee.
          </p>
          <div className="inline-flex items-center rounded-xl bg-white border border-slate-200 p-1 shadow-sm">
            {(["MONTHLY", "ANNUALLY"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all ${
                  period === p
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {billingPeriodLabel(p)}
                {p === "ANNUALLY" && (
                  <span className="ml-1.5 text-xs font-medium text-accent-600">Save 20%</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded mb-4" />
                <div className="h-8 bg-slate-200 rounded mb-6" />
                <div className="space-y-3">{[1,2,3,4].map((j) => <div key={j} className="h-3 bg-slate-100 rounded" />)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg) => {
              const priceObj = getPrice(pkg);
              const features: string[] = JSON.parse(pkg.features || "[]");
              return (
                <div
                  key={pkg.id}
                  className={`card p-6 flex flex-col relative transition-all hover:shadow-md ${
                    pkg.isFeatured ? "ring-2 ring-brand-500 shadow-brand-100 shadow-lg" : ""
                  }`}
                >
                  {pkg.isFeatured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white shadow">
                        <Star className="h-3 w-3" fill="currentColor" /> Most Popular
                      </span>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="font-heading font-bold text-lg text-slate-900 mb-1">{pkg.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{pkg.shortDescription}</p>
                  </div>
                  <div className="mb-6">
                    {priceObj ? (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-slate-900">
                            {formatCurrency(priceObj.price, priceObj.currency)}
                          </span>
                          <span className="text-sm text-slate-400">/mo</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Billed {billingPeriodLabel(priceObj.billingPeriod).toLowerCase()}
                        </p>
                      </>
                    ) : (
                      <p className="text-slate-400 text-sm">Price on request</p>
                    )}
                  </div>
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check className="h-4 w-4 shrink-0 text-accent-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={`/hosting?plan=${pkg.id}`}>
                    <Button
                      className="w-full"
                      variant={pkg.isFeatured ? "default" : "outline"}
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-10">
          <Link href="/hosting" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
            Compare all hosting features →
          </Link>
        </div>
      </div>
    </section>
  );
}
