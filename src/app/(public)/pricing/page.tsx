import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Check, ArrowRight, Globe, Server, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — PHIDHOSTING",
  description: "Simple, transparent pricing for domains, web hosting and business email hosting in Tanzania.",
};

function PriceCard({
  name,
  price,
  currency,
  period,
  features,
  isFeatured,
  href,
}: {
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  isFeatured?: boolean;
  href: string;
}) {
  return (
    <div
      className={`card p-6 flex flex-col relative ${
        isFeatured ? "ring-2 ring-brand-500 shadow-lg" : ""
      }`}
    >
      {isFeatured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white shadow">
            Most Popular
          </span>
        </div>
      )}
      <h3 className="font-heading font-bold text-base text-slate-900 mb-1">{name}</h3>
      <div className="flex items-baseline gap-1 my-3">
        <span className="text-2xl font-bold text-slate-900">
          {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(price)}
        </span>
        <span className="text-sm text-slate-400">/{period === "MONTHLY" ? "mo" : "yr"}</span>
      </div>
      <ul className="space-y-2 mb-6 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
            <Check className="h-3.5 w-3.5 shrink-0 text-accent-500" />
            {f}
          </li>
        ))}
      </ul>
      <Link href={href}>
        <Button className="w-full" size="sm" variant={isFeatured ? "default" : "outline"}>
          Get Started
        </Button>
      </Link>
    </div>
  );
}

export default async function PricingPage() {
  const [hostingPackages, emailPackages, domainExtensions] = await Promise.all([
    prisma.hostingPackage.findMany({
      where: { isActive: true },
      include: { pricing: { where: { isActive: true } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.emailPackage.findMany({
      where: { isActive: true },
      include: { pricing: { where: { isActive: true } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.domainExtension.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const getAnnualPrice = (pricing: { billingPeriod: string; price: number; currency: string }[]) =>
    pricing.find((p) => p.billingPeriod === "ANNUALLY") ||
    pricing.find((p) => p.billingPeriod === "MONTHLY");

  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero py-16 lg:py-20">
        <div className="container text-center">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            No hidden fees. No surprises. Everything you need to get online — domains, hosting and business email.
          </p>
        </div>
      </section>

      {/* Web Hosting */}
      <section className="section bg-slate-50">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600">
                <Server className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-bold text-slate-900">Web Hosting</h2>
                <p className="text-sm text-slate-500">cPanel hosting with free SSL. Billed annually.</p>
              </div>
            </div>
            <Link href="/hosting" className="hidden sm:flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium">
              View full details <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {hostingPackages.map((pkg) => {
              const p = getAnnualPrice(pkg.pricing);
              const features: string[] = JSON.parse(pkg.features || "[]");
              return p ? (
                <PriceCard
                  key={pkg.id}
                  name={pkg.name}
                  price={p.price}
                  currency={p.currency}
                  period={p.billingPeriod}
                  features={features}
                  isFeatured={pkg.isFeatured}
                  href={`/hosting?plan=${pkg.id}`}
                />
              ) : null;
            })}
          </div>
        </div>
      </section>

      {/* Email Hosting */}
      <section className="section bg-white">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-bold text-slate-900">Business Email</h2>
                <p className="text-sm text-slate-500">Professional @yourdomain email. Billed annually.</p>
              </div>
            </div>
            <Link href="/email-hosting" className="hidden sm:flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium">
              View full details <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl">
            {emailPackages.map((pkg) => {
              const p = getAnnualPrice(pkg.pricing);
              const features: string[] = JSON.parse(pkg.features || "[]");
              return p ? (
                <PriceCard
                  key={pkg.id}
                  name={pkg.name}
                  price={p.price}
                  currency={p.currency}
                  period={p.billingPeriod}
                  features={features}
                  isFeatured={pkg.isFeatured}
                  href={`/email-hosting?plan=${pkg.id}`}
                />
              ) : null;
            })}
          </div>
        </div>
      </section>

      {/* Domains */}
      <section className="section bg-slate-50">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-bold text-slate-900">Domain Registration</h2>
                <p className="text-sm text-slate-500">Annual pricing. Renewal rates may vary.</p>
              </div>
            </div>
            <Link href="/domains" className="hidden sm:flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium">
              Search domains <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {domainExtensions.map((ext) => (
              <div key={ext.id} className="card p-4 text-center hover:border-brand-300 hover:shadow-md transition-all">
                <p className="font-heading font-bold text-xl text-brand-700 mb-1">{ext.tld}</p>
                <p className="text-base font-bold text-slate-900">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: ext.currency }).format(ext.registrationPrice)}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">/year registration</p>
                {ext.renewalPrice !== ext.registrationPrice && (
                  <p className="text-xs text-slate-400 mt-1">
                    Renews at {new Intl.NumberFormat("en-US", { style: "currency", currency: ext.currency }).format(ext.renewalPrice)}/yr
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-white">
        <div className="container max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-slate-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-5">
            {[
              {
                q: "Are there any setup fees?",
                a: "No. All plans are priced as shown — no hidden setup fees or activation charges.",
              },
              {
                q: "Can I upgrade or downgrade my plan?",
                a: "Yes, you can upgrade or downgrade your hosting or email plan at any time from your dashboard. We'll prorate the difference.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept major credit/debit cards and mobile money payments (M-Pesa, Airtel Money). More gateways coming soon.",
              },
              {
                q: "Is there a free trial?",
                a: "We don't offer a free trial, but all hosting plans come with a 30-day money-back guarantee if you're not satisfied.",
              },
              {
                q: "Do I need a domain to get hosting or email?",
                a: "You'll need a domain for email hosting. For web hosting you can point an existing domain or register one with us.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="card p-5">
                <p className="font-semibold text-slate-900 mb-2">{q}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm bg-brand-600 text-white">
        <div className="container text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-3">
            Ready to get started?
          </h2>
          <p className="text-brand-200 mb-8">
            Create your free account and launch your online presence today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button variant="secondary" size="lg" className="font-semibold">
                Create Free Account
              </Button>
            </Link>
            <Link href="/domains">
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 font-semibold"
              >
                Search a Domain
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
