"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Server, Check, Star, Shield, Zap, HardDrive,
  Headphones, ArrowRight, Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, billingPeriodLabel } from "@/lib/utils";

interface PackagePrice {
  billingPeriod: string;
  price: number;
  currency: string;
}

interface Package {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  storageGB: number;
  bandwidthGB: number | null;
  maxWebsites: number;
  maxEmailAccounts: number | null;
  maxDatabases: number | null;
  sslIncluded: boolean;
  dailyBackups: boolean;
  features: string;
  isFeatured: boolean;
  pricing: PackagePrice[];
}

const whyUs = [
  { icon: Zap, title: "Lightning Fast SSD", desc: "NVMe SSD storage for blazing-fast load times." },
  { icon: Shield, title: "Free SSL Included", desc: "Every plan comes with a free Let's Encrypt SSL certificate." },
  { icon: HardDrive, title: "cPanel Access", desc: "Industry-standard control panel for easy management." },
  { icon: Headphones, title: "24/7 Expert Support", desc: "Our team is always ready to help you succeed online." },
  { icon: Globe, title: "99.9% Uptime SLA", desc: "We guarantee your site stays online with redundant infrastructure." },
  { icon: Server, title: "Daily Backups", desc: "Business and Premium plans include automated daily backups." },
];

export default function HostingPage() {
  const searchParams = useSearchParams();
  const highlightPlan = searchParams.get("plan");

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
    <div>
      {/* Hero */}
      <section className="gradient-hero py-16 lg:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-4 py-1.5 text-sm text-brand-300 mb-6">
              <Server className="h-4 w-4" />
              Web Hosting
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
              Fast, Reliable Web Hosting
            </h1>
            <p className="text-slate-300 text-lg mb-8">
              Supercharge your website with cPanel hosting, free SSL, and 99.9% uptime guarantee.
              Plans starting from just $3.99/month.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="#packages">
                <Button size="lg" className="font-semibold">
                  View Plans
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              <Link href="/domains">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 font-semibold"
                >
                  Also Register a Domain
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="section-sm bg-white">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {whyUs.map((item) => (
              <div key={item.title} className="text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 mx-auto mb-3">
                  <item.icon className="h-5 w-5 text-brand-600" />
                </div>
                <p className="text-sm font-semibold text-slate-900 mb-1">{item.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="section bg-slate-50" id="packages">
        <div className="container">
          <div className="text-center mb-10">
            <Badge variant="default" className="mb-4">Hosting Plans</Badge>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Choose Your Hosting Plan
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto mb-8">
              All plans include free SSL, cPanel, and email accounts. Upgrade or downgrade anytime.
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
                  <div className="space-y-3">{[1, 2, 3, 4].map((j) => <div key={j} className="h-3 bg-slate-100 rounded" />)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {packages.map((pkg) => {
                const priceObj = getPrice(pkg);
                const features: string[] = JSON.parse(pkg.features || "[]");
                const isHighlighted = pkg.id === highlightPlan;
                return (
                  <div
                    key={pkg.id}
                    id={`plan-${pkg.slug}`}
                    className={`card p-6 flex flex-col relative transition-all hover:shadow-lg ${
                      pkg.isFeatured || isHighlighted
                        ? "ring-2 ring-brand-500 shadow-brand-100 shadow-lg"
                        : ""
                    }`}
                  >
                    {(pkg.isFeatured || isHighlighted) && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white shadow">
                          <Star className="h-3 w-3" fill="currentColor" />
                          {isHighlighted ? "Selected Plan" : "Most Popular"}
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
                    <Link href={`/checkout?type=hosting&plan=${pkg.id}`}>
                      <Button
                        className="w-full"
                        variant={pkg.isFeatured || isHighlighted ? "default" : "outline"}
                      >
                        Get Started
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="section bg-white">
        <div className="container max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Compare All Features
            </h2>
            <p className="text-slate-500">Everything included in every plan.</p>
          </div>
          <div className="card overflow-hidden">
            <div className="table-container border-0">
              <table className="table">
                <thead>
                  <tr>
                    <th className="w-1/3">Feature</th>
                    <th className="text-center">Basic</th>
                    <th className="text-center">Starter</th>
                    <th className="text-center">Business</th>
                    <th className="text-center">Premium</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    ["SSD Storage", "5 GB", "10 GB", "25 GB", "50 GB"],
                    ["Websites", "1", "2", "5", "10"],
                    ["Email Accounts", "5", "20", "Unlimited", "Unlimited"],
                    ["Databases", "1", "5", "20", "Unlimited"],
                    ["Subdomains", "5", "20", "100", "Unlimited"],
                    ["Free SSL Certificate", "✓", "✓", "✓", "✓"],
                    ["cPanel Access", "✓", "✓", "✓", "✓"],
                    ["Daily Backups", "—", "—", "✓", "✓"],
                    ["Priority Support", "—", "—", "—", "✓"],
                  ].map(([feature, ...vals]) => (
                    <tr key={feature}>
                      <td className="font-medium text-slate-700">{feature}</td>
                      {vals.map((v, i) => (
                        <td key={i} className="text-center text-sm">
                          {v === "✓" ? (
                            <Check className="h-4 w-4 text-accent-500 mx-auto" />
                          ) : v === "—" ? (
                            <span className="text-slate-300">—</span>
                          ) : (
                            v
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm bg-brand-600 text-white">
        <div className="container text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-3">
            Ready to launch your website?
          </h2>
          <p className="text-brand-200 mb-8">
            Get started in minutes. Cancel anytime.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button variant="secondary" size="lg" className="font-semibold">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/email-hosting">
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 font-semibold"
              >
                Need Business Email?
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
