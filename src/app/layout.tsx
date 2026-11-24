import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "PHIDHOSTING — Domains, Web Hosting & Business Email",
    template: "%s | PHIDHOSTING",
  },
  description:
    "Register your domain, host your website and create professional business email accounts with PHIDHOSTING. Tanzania's professional hosting provider.",
  keywords: [
    "web hosting Tanzania",
    "domain registration Tanzania",
    "business email hosting Tanzania",
    "register .co.tz domain",
    "affordable web hosting",
    "hosting company Tanzania",
    "website hosting Tanzania",
  ],
  authors: [{ name: "PHIDHOSTING" }],
  creator: "PHIDHOSTING",
  publisher: "PHIDHOSTING",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://www.phidhosting.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.phidhosting.com",
    siteName: "PHIDHOSTING",
    title: "PHIDHOSTING — Domains, Web Hosting & Business Email",
    description:
      "Register your domain, host your website and create professional business email accounts with PHIDHOSTING.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PHIDHOSTING — Domains, Web Hosting & Business Email",
    description: "Professional hosting for Tanzania and beyond.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
