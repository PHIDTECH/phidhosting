"use client";
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "What is included in every hosting plan?",
    a: "All PHIDHOSTING plans include free SSL certificates, cPanel access, 24/7 support and a 99.9% uptime guarantee. Higher plans include daily backups, more storage and additional websites.",
  },
  {
    q: "Can I register a .co.tz domain?",
    a: "Yes. PHIDHOSTING supports .co.tz and other Tanzanian domain extensions. Some .tz domains may have eligibility requirements such as local business registration.",
  },
  {
    q: "What payment methods are supported?",
    a: "PHIDHOSTING accepts mobile money (M-Pesa, Airtel Money, Tigo Pesa), bank transfers and card payments. Payment options are shown at checkout.",
  },
  {
    q: "How long does it take to activate my hosting?",
    a: "Web hosting is typically activated automatically within minutes of verified payment. Domain registration may take up to 24 hours depending on the extension.",
  },
  {
    q: "Can I migrate my existing website to PHIDHOSTING?",
    a: "Yes. Our team can assist with website migrations. Contact our support team for a free migration assessment.",
  },
  {
    q: "Do you offer business email hosting?",
    a: "Yes. PHIDHOSTING provides professional email hosting with your own domain, webmail access, IMAP/SMTP support and spam protection.",
  },
  {
    q: "What is the refund policy?",
    a: "PHIDHOSTING offers a refund policy for eligible services. Please review our Refund Policy page for details on refund eligibility and timelines.",
  },
  {
    q: "Can I upgrade my hosting plan later?",
    a: "Yes. You can upgrade your plan at any time from your customer dashboard. Pricing is prorated for the remaining billing period.",
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="section bg-slate-50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Answers to the most common questions about PHIDHOSTING services.
          </p>
        </div>
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="card overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-medium text-slate-900 pr-4">{faq.q}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-slate-400 transition-transform",
                    open === i && "rotate-180"
                  )}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
