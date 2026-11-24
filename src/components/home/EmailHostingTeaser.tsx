import React from "react";
import Link from "next/link";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  "Professional @yourdomain.com email addresses",
  "Webmail access from any browser",
  "IMAP & SMTP support for all email clients",
  "Spam and virus protection",
  "5 to 50+ mailboxes depending on your plan",
  "10 GB mailbox storage on enterprise plans",
];

export function EmailHostingTeaser() {
  return (
    <section className="section bg-navy-950 text-white overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>
      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/15 border border-brand-400/20 px-4 py-1.5 text-sm text-brand-300 mb-6">
              <Mail className="h-4 w-4" />
              Business Email Hosting
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
              Professional Email for Your Business
            </h2>
            <p className="text-slate-300 leading-relaxed mb-8">
              Stop using generic email addresses. Give your business a professional identity with
              custom email accounts on your own domain — powered by PHIDHOSTING's secure mail server.
            </p>
            <ul className="space-y-3 mb-8">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-accent-400" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-4">
              <Link href="/email-hosting">
                <Button size="lg" className="font-semibold">
                  View Email Plans
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10 font-semibold"
                >
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Business Email</div>
                  <div className="text-xs text-slate-400">mail.phidhosting.com</div>
                </div>
              </div>
              {["info@yourbusiness.co.tz", "sales@yourbusiness.co.tz", "support@yourbusiness.co.tz", "admin@yourbusiness.co.tz"].map((email, i) => (
                <div key={email} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600/30 text-brand-300 text-xs font-bold">
                    {["I", "S", "Su", "A"][i]}
                  </div>
                  <div>
                    <div className="text-sm text-white font-medium">{email}</div>
                    <div className="text-xs text-slate-500">Active • 5 GB quota</div>
                  </div>
                  <div className="ml-auto">
                    <span className="badge-green text-xs">Active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
