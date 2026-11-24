import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/domains",
  "/hosting",
  "/email-hosting",
  "/pricing",
  "/about",
  "/contact",
  "/faq",
  "/support",
  "/terms",
  "/privacy",
  "/acceptable-use",
  "/domain-policy",
  "/refund-policy",
  "/domain-transfer",
];

const adminRoutes = ["/admin"];
const customerRoutes = ["/dashboard"];

export default auth((req: NextRequest & { auth: { user?: { role?: string } } | null }) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isPublic = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  const isAdmin = adminRoutes.some((route) => pathname.startsWith(route));
  const isCustomer = customerRoutes.some((route) => pathname.startsWith(route));
  const isApiRoute = pathname.startsWith("/api");

  if (isPublic || isApiRoute) return NextResponse.next();

  if (!session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = session.user.role;

  if (isAdmin) {
    const adminRoles = ["ADMIN", "SUPER_ADMIN", "FINANCE", "SUPPORT", "HOSTING_MANAGER"];
    if (!adminRoles.includes(role || "")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (isCustomer && role && ["ADMIN", "SUPER_ADMIN"].includes(role)) {
    // Admins can access customer dashboard too
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|icons).*)"],
};
