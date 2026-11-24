import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const packages = await prisma.hostingPackage.findMany({
      where: { isActive: true },
      include: { pricing: { where: { isActive: true } } },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ packages });
  } catch (error) {
    console.error("Hosting packages error:", error);
    return NextResponse.json({ error: "Failed to load packages" }, { status: 500 });
  }
}
