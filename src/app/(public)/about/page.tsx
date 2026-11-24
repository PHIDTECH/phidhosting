import React from "react";
import Link from "next/link";
import { Shield, Zap, Headphones, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — PHIDHOSTING",
  description: "PHIDHOSTING is Tanzania's professional hosting provider offering domains, web hosting and business email services.",
};

const values = [
  { icon: Shield, title: "Reliability First", desc: "99.9% uptime SLA backed by redundant infrastructure and 24/7 monitoring." },
  { icon: Zap, title: "Built for Speed", desc: "NVMe SSD storage and optimised servers ensure your website loads fast." },
  { icon: Headphones, title: "Local Support", desc: "Our support team is based in Tanzania and understands your needs." },
  { icon: Globe, title: "Locally Focused", desc: "Specialised in Tanzanian domains (.co.tz, .or.tz) and local compliance." },
];

const stats = [
  { value: "99.9%", label: "Uptime Guarantee" },
  { value: "24/7", label: "Expert Support" },
  { value: "< 2hrs", label: "Avg. Response Time" },
  { value: "TZ", label: "Local Domain Registrar" },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero py-16 lg:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-5">
              Tanzania's Trusted Hosting Provider
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              PHIDHOSTING was built to give Tanzanian businesses a reliable, fast and affordable platform
              to register domains, host websites and set up professional business email — all in one place.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-10 border-b border-slate-100">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-heading text-3xl font-bold text-brand-700 mb-1">{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="section bg-white">
        <div className="container max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                Our Mission
              </h2>
              <p className="text-slate-500 leading-relaxed mb-4">
                We believe every Tanzanian business deserves a strong online presence. That's why we've built
                PHIDHOSTING — a platform that makes it easy and affordable to get online, stay online, and grow.
              </p>
              <p className="text-slate-500 leading-relaxed mb-6">
                From the small business registering their first <strong>.co.tz</strong> domain, to the
                enterprise running multiple websites with hundreds of business email accounts — PHIDHOSTING
                is built to scale with you.
              </p>
              <Link href="/register">
                <Button>
                  Get Started Today
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="rounded-2xl bg-brand-50 p-8 border border-brand-100">
              <blockquote className="text-brand-900 text-lg font-medium leading-relaxed italic">
                "We built PHIDHOSTING because Tanzanian businesses deserved a hosting provider that speaks
                their language, understands their market, and is here when they need support."
              </blockquote>
              <p className="mt-4 text-sm text-brand-700 font-semibold">— PHIDHOSTING Team</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-slate-50">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              What We Stand For
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="card p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 mx-auto mb-4">
                  <v.icon className="h-6 w-6 text-brand-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{v.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm bg-brand-600 text-white">
        <div className="container text-center">
          <h2 className="font-heading text-2xl font-bold text-white mb-3">
            Ready to join thousands of Tanzanian businesses online?
          </h2>
          <p className="text-brand-200 mb-8">Start with a free account today.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button variant="secondary" size="lg" className="font-semibold">
                Create Free Account
              </Button>
            </Link>
            <Link href="/support">
              <Button variant="outline" size="lg" className="border-white/30 bg-white/10 text-white hover:bg-white/20 font-semibold">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
