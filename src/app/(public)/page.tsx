import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { DomainExtensions } from "@/components/home/DomainExtensions";
import { HostingPackages } from "@/components/home/HostingPackages";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { FAQSection } from "@/components/home/FAQSection";
import { EmailHostingTeaser } from "@/components/home/EmailHostingTeaser";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CTASection } from "@/components/home/CTASection";

export const metadata: Metadata = {
  title: "PHIDHOSTING — Domains, Web Hosting & Business Email in Tanzania",
  description:
    "Register your domain, host your website and set up professional business email with PHIDHOSTING. Fast, reliable and affordable hosting for Tanzania and beyond.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <DomainExtensions />
      <HostingPackages />
      <WhyChooseUs />
      <EmailHostingTeaser />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
