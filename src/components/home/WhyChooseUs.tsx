import React from "react";
import { Shield, Zap, Headphones, Server, Globe, Lock } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "High-Performance Servers",
    description: "SSD-powered infrastructure with optimized stacks for fast loading times across Tanzania and globally.",
    color: "text-brand-600 bg-brand-50",
  },
  {
    icon: Shield,
    title: "Free SSL on Every Plan",
    description: "Every hosting account includes a free SSL certificate to keep your website secure and trusted.",
    color: "text-accent-600 bg-accent-50",
  },
  {
    icon: Headphones,
    title: "24/7 Expert Support",
    description: "Our knowledgeable support team is available around the clock to help you with any issue.",
    color: "text-purple-600 bg-purple-50",
  },
  {
    icon: Server,
    title: "99.9% Uptime Guarantee",
    description: "We guarantee your website stays online. Our robust infrastructure ensures maximum availability.",
    color: "text-orange-600 bg-orange-50",
  },
  {
    icon: Globe,
    title: "Local Expertise",
    description: "Based in Tanzania with deep understanding of local business needs, payment methods and connectivity.",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: Lock,
    title: "Secure & Compliant",
    description: "Your data is protected with industry-standard security practices and regular security updates.",
    color: "text-red-600 bg-red-50",
  },
];

export function WhyChooseUs() {
  return (
    <section className="section bg-white">
      <div className="container">
        <div className="text-center mb-14">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Why Businesses Choose PHIDHOSTING
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Professional hosting with the reliability, support and local expertise your business deserves.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="flex gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${f.color}`}>
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-slate-900 mb-1">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
