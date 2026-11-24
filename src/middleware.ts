import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routing logic lives in proxy.ts (Next.js 16). This file is kept as a
// no-op to satisfy the filename-based detection while proxy.ts takes precedence.
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|icons).*)"],
};
