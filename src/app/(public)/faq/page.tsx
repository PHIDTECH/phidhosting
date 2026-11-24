import React from "react";
import Link from "next/link";
import { FAQSection } from "@/components/home/FAQSection";
import { MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — PHIDHOSTING",
  description: "Answers to frequently asked questions about PHIDHOSTING domains, web hosting and email services.",
};

const categories = [
  { label: "Domains", href: "#domains" },
  { label: "Web Hosting", href: "#hosting" },
  { label: "Email Hosting", href: "#email" },
  { label: "Billing & Payments", href: "#billing" },
  { label: "Technical Support", href: "#support" },
];

export default function FAQPage() {
  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero py-16 lg:py-20">
        <div className="container text-center">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto">
            Find answers to common questions about our services. Can't find what you're looking for? Contact our support team.
          </p>
        </div>
      </section>

      {/* Category nav */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-10">
        <div className="container">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {categories.map((c) => (
              <a
                key={c.label}
                href={c.href}
                className="shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                {c.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main FAQ component (reused from home) */}
      <FAQSection />

      {/* Still need help */}
      <section className="section-sm bg-brand-600 text-white">
        <div className="container text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 mx-auto mb-4">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-white mb-3">
            Still have questions?
          </h2>
          <p className="text-brand-200 mb-8">
            Our support team is available Monday to Friday, 8am–6pm EAT.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/support">
              <Button variant="secondary" size="lg" className="font-semibold">
                Contact Support
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="border-white/30 bg-white/10 text-white hover:bg-white/20 font-semibold">
                Open a Ticket
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
