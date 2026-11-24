import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const extensions = [
  { tld: ".com", price: "$12.99", desc: "Global standard" },
  { tld: ".co.tz", price: "$24.99", desc: "Tanzania identity" },
  { tld: ".net", price: "$11.99", desc: "Network services" },
  { tld: ".org", price: "$10.99", desc: "Organisations" },
  { tld: ".or.tz", price: "$24.99", desc: "TZ organisations" },
  { tld: ".biz", price: "$10.99", desc: "Business" },
  { tld: ".info", price: "$9.99", desc: "Information" },
  { tld: ".ac.tz", price: "$24.99", desc: "Academic TZ" },
];

export function DomainExtensions() {
  return (
    <section className="section bg-white">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Register Your Perfect Domain
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Choose from popular international domains and local Tanzanian extensions.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mb-10">
          {extensions.map((ext) => (
            <Link
              key={ext.tld}
              href={`/domains?tld=${ext.tld.replace(".", "")}`}
              className="card p-4 text-center hover:border-brand-300 hover:shadow-md transition-all group"
            >
              <div className="font-heading font-bold text-xl text-brand-700 group-hover:text-brand-800 mb-1">
                {ext.tld}
              </div>
              <div className="text-xs font-semibold text-slate-900 mb-0.5">{ext.price}</div>
              <div className="text-xs text-slate-400">{ext.desc}</div>
            </Link>
          ))}
        </div>
        <div className="text-center">
          <Link
            href="/domains"
            className="inline-flex items-center gap-2 text-brand-600 font-semibold hover:text-brand-700 text-sm"
          >
            View all domain extensions <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
