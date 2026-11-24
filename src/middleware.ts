import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routing is handled by proxy.ts (Next.js 16 convention).
// This file exists only to prevent a "missing export" lint warning.
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = { matcher: [] };
