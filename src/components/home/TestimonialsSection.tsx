import React from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "James Mwangi",
    company: "Mwangi & Associates",
    role: "Managing Director",
    text: "PHIDHOSTING has been excellent. Our website loads fast and we have never had a downtime issue. The support team is always responsive.",
    rating: 5,
    note: "[Sample testimonial — to be replaced with genuine customer feedback]",
  },
  {
    name: "Fatuma Hassan",
    company: "Safari Tours Tanzania",
    role: "Operations Manager",
    text: "Switching to PHIDHOSTING was one of the best business decisions we made. Professional email and reliable hosting at a great price.",
    rating: 5,
    note: "[Sample testimonial — to be replaced with genuine customer feedback]",
  },
  {
    name: "David Ochieng",
    company: "Tech Solutions Ltd",
    role: "CEO",
    text: "The team helped us migrate our existing website seamlessly. Everything works perfectly and the control panel is easy to use.",
    rating: 5,
    note: "[Sample testimonial — to be replaced with genuine customer feedback]",
  },
];

export function TestimonialsSection() {
  return (
    <section className="section bg-white">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Trusted by Businesses Across Tanzania
          </h2>
          <p className="text-sm text-slate-400 italic">
            The testimonials below are sample content and will be replaced with genuine customer reviews.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="card p-6 flex flex-col">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <blockquote className="text-sm text-slate-600 leading-relaxed italic mb-6 flex-1">
                &ldquo;{t.text}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                  <div className="text-xs text-slate-400">{t.role}, {t.company}</div>
                </div>
              </div>
              <p className="text-xs text-slate-300 mt-3 italic">{t.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
