"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRightLeft, Search, CheckCircle2, AlertCircle,
  ArrowRight, Shield, Clock, DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  { n: "1", title: "Unlock your domain", desc: "Log in to your current registrar and unlock the domain / disable transfer lock." },
  { n: "2", title: "Get the auth code", desc: "Request the EPP/AuthCode (transfer authorisation code) from your current registrar." },
  { n: "3", title: "Start transfer here", desc: "Enter your domain name and auth code below, then follow the checkout process." },
  { n: "4", title: "Confirm & wait", desc: "Approve the transfer email sent to your registrant address. Transfer takes 5–7 days." },
];

const benefits = [
  { icon: Shield, title: "No Downtime", desc: "Your domain and DNS continue working throughout the transfer." },
  { icon: Clock, title: "1 Year Extension", desc: "Your registration is extended by 1 year on successful transfer." },
  { icon: DollarSign, title: "Transfer at Reg Price", desc: "Transfer fees match our standard registration prices — no premium." },
  { icon: CheckCircle2, title: "Full Management", desc: "Manage DNS, nameservers and renewals from one dashboard after transfer." },
];

export default function DomainTransferPage() {
  const [domain, setDomain] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (domain.trim()) setSubmitted(true);
  };

  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero py-16 lg:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-4 py-1.5 text-sm text-brand-300 mb-6">
              <ArrowRightLeft className="h-4 w-4" />
              Domain Transfer
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
              Transfer Your Domain to PHIDHOSTING
            </h1>
            <p className="text-slate-300 text-lg mb-10">
              Bring your existing domain under one roof. Manage your domains, hosting and email from a single dashboard.
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="card p-6 max-w-xl mx-auto text-left">
                <div className="space-y-4">
                  <div>
                    <label className="label">Domain Name</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder="e.g. yourdomain.com"
                        className="input pl-11"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">
                      EPP / Auth Code
                      <span className="ml-1 text-xs text-slate-400 font-normal">(from your current registrar)</span>
                    </label>
                    <input
                      type="text"
                      value={authCode}
                      onChange={(e) => setAuthCode(e.target.value)}
                      placeholder="Enter authorisation code"
                      className="input font-mono"
                    />
                  </div>
                  <div className="flex items-start gap-2 rounded-lg bg-orange-50 border border-orange-200 p-3 text-xs text-orange-700">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    Make sure your domain is unlocked and the auth code is correct before proceeding.
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    Start Transfer
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            ) : (
              <div className="card p-8 max-w-xl mx-auto text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-50 mx-auto mb-4">
                  <CheckCircle2 className="h-7 w-7 text-accent-600" />
                </div>
                <h2 className="font-heading text-xl font-bold text-slate-900 mb-2">Transfer Request Received!</h2>
                <p className="text-slate-500 text-sm mb-4">
                  To complete the transfer for <strong>{domain}</strong>, please create or log in to your PHIDHOSTING account.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/register" className="flex-1">
                    <Button className="w-full">Create Account</Button>
                  </Link>
                  <Link href="/login" className="flex-1">
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section bg-white">
        <div className="container max-w-4xl">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-10">
            Why Transfer to PHIDHOSTING?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 mx-auto mb-3">
                  <b.icon className="h-5 w-5 text-brand-600" />
                </div>
                <p className="text-sm font-semibold text-slate-900 mb-1">{b.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="section bg-slate-50">
        <div className="container max-w-3xl">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-10">
            How the Transfer Works
          </h2>
          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.n} className="card p-5 flex items-start gap-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white text-sm font-bold">
                  {step.n}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 mb-1">{step.title}</p>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm bg-brand-600 text-white">
        <div className="container text-center">
          <h2 className="font-heading text-2xl font-bold text-white mb-3">
            Ready to make the switch?
          </h2>
          <p className="text-brand-200 mb-8">
            Transfer your domain today and get everything managed in one place.
          </p>
          <Link href="/register">
            <Button variant="secondary" size="lg" className="font-semibold">
              Create Your Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
