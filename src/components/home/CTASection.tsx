import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="section bg-brand-700">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Get Your Business Online?
          </h2>
          <p className="text-brand-200 text-lg mb-10">
            Start with a domain search, choose your hosting plan and get your business email set up — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/domains">
              <Button size="xl" className="bg-white text-brand-700 hover:bg-brand-50 font-bold w-full sm:w-auto">
                Find Your Domain
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="xl"
                variant="outline"
                className="border-brand-300 bg-transparent text-white hover:bg-brand-600 font-semibold w-full sm:w-auto"
              >
                Create Free Account
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-brand-300">
            No credit card required to create an account.
          </p>
        </div>
      </div>
    </section>
  );
}
