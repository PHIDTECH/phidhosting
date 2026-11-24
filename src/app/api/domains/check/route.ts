import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain")?.toLowerCase().trim();

  if (!domain) {
    return NextResponse.json({ error: "Domain name is required" }, { status: 400 });
  }

  const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z]{2,})+$/;
  if (!domainRegex.test(domain)) {
    return NextResponse.json({ error: "Invalid domain name format" }, { status: 400 });
  }

  try {
    const tld = "." + domain.split(".").slice(1).join(".");
    const sld = domain.split(".")[0];

    const extension = await prisma.domainExtension.findUnique({
      where: { tld },
      include: { registrar: true },
    });

    if (!extension || !extension.isActive) {
      return NextResponse.json({
        domain,
        tld,
        available: false,
        supported: false,
        message: "This domain extension is not currently supported.",
      });
    }

    const existing = await prisma.domain.findUnique({ where: { domainName: domain } });
    if (existing) {
      return NextResponse.json({
        domain,
        tld,
        available: false,
        supported: true,
        taken: true,
        message: "This domain is already registered.",
      });
    }

    const isSandbox = process.env.SPACESHIP_SANDBOX === "true" || !process.env.SPACESHIP_API_KEY;

    if (isSandbox) {
      const simulatedTaken = ["google", "facebook", "microsoft", "apple", "amazon"].includes(sld);
      return NextResponse.json({
        domain,
        tld,
        available: !simulatedTaken,
        supported: true,
        sandbox: true,
        registrationPrice: extension.registrationPrice,
        renewalPrice: extension.renewalPrice,
        transferPrice: extension.transferPrice,
        currency: extension.currency,
        eligibilityReq: extension.eligibilityReq,
        message: simulatedTaken
          ? "This domain appears to be taken."
          : "Domain appears to be available. [Sandbox mode — not a real availability check]",
      });
    }

    return NextResponse.json({
      domain,
      tld,
      available: true,
      supported: true,
      sandbox: false,
      registrationPrice: extension.registrationPrice,
      renewalPrice: extension.renewalPrice,
      transferPrice: extension.transferPrice,
      currency: extension.currency,
    });
  } catch (error) {
    console.error("Domain check error:", error);
    return NextResponse.json({ error: "Domain check failed. Please try again." }, { status: 500 });
  }
}
