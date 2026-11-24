import React from "react";
import Link from "next/link";
import {
  MessageCircle, Mail, Phone, FileText,
  ArrowRight, Clock, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support — PHIDHOSTING",
  description: "Get help from the PHIDHOSTING support team. Submit a ticket, check our FAQs or contact us directly.",
};

const channels = [
  {
    icon: MessageCircle,
    title: "Support Ticket",
    desc: "Open a ticket in your dashboard and our team will respond within 2 hours.",
    action: "Open a Ticket",
    href: "/dashboard/support/new",
    color: "bg-brand-50 text-brand-600",
    badge: "Fastest Response",
  },
  {
    icon: Mail,
    title: "Email Support",
    desc: "Send us an email at support@phidhosting.com and we'll get back to you within 24 hours.",
    action: "Send Email",
    href: "mailto:support@phidhosting.com",
    color: "bg-green-50 text-green-600",
    badge: null,
  },
  {
    icon: Phone,
    title: "Phone & WhatsApp",
    desc: "Call or WhatsApp us during business hours (Mon–Fri 8am–6pm EAT).",
    action: "Call Now",
    href: "tel:+255000000000",
    color: "bg-purple-50 text-purple-600",
    badge: null,
  },
];

const faqs = [
  {
    q: "How do I transfer my domain to PHIDHOSTING?",
    a: "Go to our domain transfer page, enter your domain name and get the transfer authorisation code from your current registrar. The transfer typically takes 5–7 days.",
  },
  {
    q: "My website is down — what should I do?",
    a: "First check our status page. If everything looks fine on our end, open a support ticket and our team will investigate within 1 hour.",
  },
  {
    q: "How do I create an email account?",
    a: "Log in to your dashboard, navigate to Email Hosting, then click on your email service to manage mailboxes. You can add, remove and configure mailboxes from there.",
  },
  {
    q: "How do I access cPanel?",
    a: "Log in to your dashboard and go to Web Hosting. Click 'Open cPanel' on your hosting account to be automatically logged in.",
  },
  {
    q: "How do I renew my domain or hosting?",
    a: "Services are renewed automatically if auto-renew is enabled. You'll receive reminder emails 30, 14 and 7 days before expiry. You can also renew manually from your dashboard.",
  },
  {
    q: "Can I upgrade my hosting plan?",
    a: "Yes! Log in to your dashboard, go to Web Hosting and click on your account to find the upgrade option. We'll prorate the difference.",
  },
];

export default function SupportPage() {
  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero py-16 lg:py-20">
        <div className="container text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-4 py-1.5 text-sm text-brand-300 mb-6">
            <Clock className="h-4 w-4" />
            Average response time: under 2 hours
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
            How Can We Help?
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Our team of experts is here to help you with anything — domains, hosting, email or billing.
          </p>
        </div>
      </section>

      {/* Support channels */}
      <section className="section bg-white">
        <div className="container max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {channels.map((ch) => (
              <div key={ch.title} className="card p-6 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${ch.color}`}>
                    <ch.icon className="h-5 w-5" />
                  </div>
                  {ch.badge && (
                    <span className="badge-green text-xs">{ch.badge}</span>
                  )}
                </div>
                <h3 className="font-heading font-bold text-slate-900 mb-2">{ch.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-5 flex-1">{ch.desc}</p>
                <Link href={ch.href}>
                  <Button size="sm" variant="outline" className="w-full">
                    {ch.action}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SLA / promises */}
      <section className="section-sm bg-slate-50">
        <div className="container max-w-4xl">
          <h2 className="font-heading text-2xl font-bold text-slate-900 text-center mb-8">
            Our Support Promise
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { label: "First Response", value: "Under 2 hours", sub: "During business hours" },
              { label: "Resolution Target", value: "Same day", sub: "For most issues" },
              { label: "Uptime SLA", value: "99.9%", sub: "Guaranteed uptime" },
            ].map((item) => (
              <div key={item.label} className="card p-5 text-center">
                <p className="text-2xl font-bold text-brand-700 mb-1">{item.value}</p>
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-white">
        <div className="container max-w-3xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-2xl font-bold text-slate-900">
              Common Questions
            </h2>
            <Link href="/faq" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
              View all FAQs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="card p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900 mb-1.5">{q}</p>
                    <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
                  </div>
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
            Still need help?
          </h2>
          <p className="text-brand-200 mb-8">
            Log in to your dashboard and open a support ticket — we respond fast.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/login">
              <Button variant="secondary" size="lg" className="font-semibold">
                <FileText className="h-4 w-4" />
                Open a Ticket
              </Button>
            </Link>
            <a href="mailto:support@phidhosting.com">
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 font-semibold"
              >
                <Mail className="h-4 w-4" />
                Email Support
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
