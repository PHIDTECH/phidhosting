"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const contactInfo = [
  { icon: Mail, label: "Email", value: "support@phidhosting.com", href: "mailto:support@phidhosting.com" },
  { icon: Phone, label: "Phone / WhatsApp", value: "+255 XXX XXX XXX", href: "tel:+255000000000" },
  { icon: MapPin, label: "Location", value: "Dar es Salaam, Tanzania", href: null },
  { icon: Clock, label: "Business Hours", value: "Mon–Fri, 8am–6pm EAT", href: null },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
    setLoading(false);
  };

  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero py-16 lg:py-20">
        <div className="container text-center">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto">
            Have a question or need help? Our team is ready to assist you.
          </p>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-12">

            {/* Contact info */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-slate-900 mb-6">Contact Information</h2>
              <div className="space-y-5 mb-10">
                {contactInfo.map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50">
                      <item.icon className="h-5 w-5 text-brand-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="text-sm font-semibold text-slate-900 hover:text-brand-600 transition-colors">
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm font-semibold text-slate-900">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-brand-50 border border-brand-100 p-5">
                <p className="text-sm font-semibold text-brand-900 mb-1">Need technical support?</p>
                <p className="text-xs text-brand-700 leading-relaxed mb-3">
                  For the fastest response to billing or technical issues, open a ticket from your dashboard.
                </p>
                <Link href="/login">
                  <Button size="sm" variant="outline" className="border-brand-300 text-brand-700 hover:bg-brand-100">
                    Open Support Ticket
                  </Button>
                </Link>
              </div>
            </div>

            {/* Contact form */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-slate-900 mb-6">Send a Message</h2>

              {sent ? (
                <div className="card p-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-50 mx-auto mb-4">
                    <CheckCircle2 className="h-7 w-7 text-accent-600" />
                  </div>
                  <h3 className="font-heading font-bold text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-sm text-slate-500">
                    Thanks for reaching out. We'll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      required
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      required
                    />
                  </div>
                  <Input
                    label="Subject"
                    placeholder="How can we help?"
                    value={form.subject}
                    onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                    required
                  />
                  <div>
                    <label className="label">Message</label>
                    <textarea
                      className="input min-h-[140px] resize-none"
                      placeholder="Tell us more about your question or issue..."
                      value={form.message}
                      onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                      required
                      rows={5}
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full" loading={loading}>
                    <Send className="h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
