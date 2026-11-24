import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import type { Metadata } from "next";

const LEGAL_SLUGS = ["terms", "privacy", "acceptable-use", "domain-policy", "refund-policy"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ legal: string }>;
}): Promise<Metadata> {
  const { legal } = await params;
  if (!LEGAL_SLUGS.includes(legal)) return {};
  const page = await prisma.contentPage.findUnique({ where: { slug: legal } });
  return {
    title: page ? `${page.title} — PHIDHOSTING` : "PHIDHOSTING",
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ legal: string }>;
}) {
  const { legal } = await params;

  if (!LEGAL_SLUGS.includes(legal)) notFound();

  const page = await prisma.contentPage.findUnique({ where: { slug: legal } });

  if (!page || page.status === "DRAFT") {
    return (
      <div className="section">
        <div className="container max-w-3xl text-center">
          <h1 className="font-heading text-3xl font-bold text-slate-900 mb-4">
            {legal.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </h1>
          <div className="card p-10 text-slate-500">
            <p className="text-lg font-medium mb-2">Coming Soon</p>
            <p className="text-sm">This page is currently being prepared. Please check back soon.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container max-w-3xl">
        <div className="mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            {page.title}
          </h1>
          {page.publishedAt && (
            <p className="text-sm text-slate-400">
              Last updated: {format(new Date(page.publishedAt), "dd MMMM yyyy")}
            </p>
          )}
        </div>
        <div
          className="prose prose-slate max-w-none text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
}
