"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Mail, Check, Star, Shield, Smartphone, Globe,
  ArrowRight, Users, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, billingPeriodLabel } from "@/lib/utils";

interface PackagePrice {
  billingPeriod: string;
  price: number;
  currency: string;
}

interface EmailPackage {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  maxMailboxes: number;
  mailboxQuotaGB: number;
  hasWebmail: boolean;
  hasImap: boolean;
  hasSmtp: boolean;
  spamProtection: boolean;
  features: string;
  isFeatured: boolean;
  pricing: PackagePrice[];
}

const highlights = [
  { icon: Mail, title: "Custom @yourdomain Email", desc: "Professional email addresses on your own domain." },
  { icon: Globe, title: "Webmail Access", desc: "Access your email from any browser, anywhere." },
  { icon: Smartphone, title: "Mobile Sync (IMAP)", desc: "Sync with iPhone, Android and any email client." },
  { icon: Shield, title: "Spam & Virus Protection", desc: "Advanced filtering keeps your inbox clean." },
  { icon: Lock, title: "SSL/TLS Encrypted", desc: "All connections secured with SSL/TLS encryption." },
  { icon: Users, title: "Team Collaboration", desc: "Share inboxes, aliases and manage your whole team." },
];

export default function EmailHostingPage() {
  const [packages, setPackages] = useState<EmailPackage[]>([]);
  const [period, setPeriod] = useState<"MONTHLY" | "ANNUALLY">("ANNUALLY");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/packages/email")
      .then((r) => r.json())
      .then((d) => { setPackages(d.packages || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const getPrice = (pkg: EmailPackage) =>
    pkg.pricing.find((p) => p.billingPeriod === period) ||
    pkg.pricing.find((p) => p.billingPeriod === "MONTHLY");

  return (
    <div>
      {/* Hero */}
      <section className="bg-navy-950 text-white py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        </div>
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-4 py-1.5 text-sm text-brand-300 mb-6">
              <Mail className="h-4 w-4" />
              Business Email Hosting
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
              Professional Email for Your Business
            </h1>
            <p className="text-slate-300 text-lg mb-8">
              Give your team a professional identity with custom email accounts on your own domain.
              Powered by PHIDHOSTING's secure Mailcow infrastructure.
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
                  Get a Domain First
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="section-sm bg-white">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {highlights.map((item) => (
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
            <Badge variant="default" className="mb-4">Email Plans</Badge>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Business Email Plans
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto mb-8">
              Professional email hosting for every size of team. All plans include webmail, IMAP, SMTP and spam protection.
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded mb-4" />
                  <div className="h-8 bg-slate-200 rounded mb-6" />
                  <div className="space-y-3">{[1, 2, 3, 4].map((j) => <div key={j} className="h-3 bg-slate-100 rounded" />)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {packages.map((pkg) => {
                const priceObj = getPrice(pkg);
                const features: string[] = JSON.parse(pkg.features || "[]");
                return (
                  <div
                    key={pkg.id}
                    className={`card p-6 flex flex-col relative transition-all hover:shadow-lg ${
                      pkg.isFeatured ? "ring-2 ring-brand-500 shadow-brand-100 shadow-lg" : ""
                    }`}
                  >
                    {pkg.isFeatured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white shadow">
                          <Star className="h-3 w-3" fill="currentColor" />
                          Most Popular
                        </span>
                      </div>
                    )}
                    <div className="mb-6">
                      <h3 className="font-heading font-bold text-lg text-slate-900 mb-1">{pkg.name}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{pkg.shortDescription}</p>
                    </div>
                    <div className="mb-4 p-3 rounded-lg bg-slate-50 grid grid-cols-2 gap-2 text-center text-xs">
                      <div>
                        <p className="font-bold text-slate-900 text-base">{pkg.maxMailboxes}</p>
                        <p className="text-slate-500">Mailboxes</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-base">{pkg.mailboxQuotaGB} GB</p>
                        <p className="text-slate-500">Per Mailbox</p>
                      </div>
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
                    <Link href={`/register?plan=${pkg.id}&type=email`}>
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
        </div>
      </section>

      {/* Demo mockup */}
      <section className="section bg-white">
        <div className="container max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                Manage Your Team's Email
              </h2>
              <p className="text-slate-500 leading-relaxed mb-6">
                Create mailboxes, manage aliases, and configure your domain's email settings — all from one easy-to-use control panel.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Create mailboxes instantly after ordering",
                  "Set custom forwarding and auto-responders",
                  "Access email via webmail or any IMAP client",
                  "Monitor usage and quotas in real time",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-700">
                    <Check className="h-4 w-4 shrink-0 text-accent-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register">
                <Button size="lg">
                  Start for Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="card p-6 bg-slate-50">
              {["info@mybusiness.co.tz", "sales@mybusiness.co.tz", "support@mybusiness.co.tz", "admin@mybusiness.co.tz"].map((email, i) => (
                <div key={email} className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-bold shrink-0">
                    {["I", "S", "Su", "A"][i]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{email}</p>
                    <p className="text-xs text-slate-500">Active • 5 GB quota</p>
                  </div>
                  <span className="badge-green shrink-0">Active</span>
                </div>
              ))}
              <div className="pt-4">
                <Button size="sm" className="w-full" variant="outline">
                  <Mail className="h-4 w-4" />
                  + Add Mailbox
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm bg-brand-600 text-white">
        <div className="container text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-3">
            Ready to go professional?
          </h2>
          <p className="text-brand-200 mb-8">
            Get your first mailbox set up in under 5 minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button variant="secondary" size="lg" className="font-semibold">
                Get Started Free
              </Button>
            </Link>
            <Link href="/hosting">
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 font-semibold"
              >
                Also Need Web Hosting?
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
