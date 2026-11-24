/**
 * Edge-compatible NextAuth config (no Prisma / bcrypt).
 * Used by middleware.ts for JWT-only route protection.
 * Full config (with Prisma adapter + Credentials) is in auth.ts.
 */
import type { NextAuthConfig } from "next-auth";

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

const adminRoles = ["ADMIN", "SUPER_ADMIN", "FINANCE", "SUPPORT", "HOSTING_MANAGER"];

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.emailVerified = (user as { emailVerified?: Date | null }).emailVerified;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.emailVerified = token.emailVerified as Date | null;
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const pathname = nextUrl.pathname;

      const isPublic = publicRoutes.some(
        (r) => pathname === r || pathname.startsWith(r + "/")
      );
      const isApi = pathname.startsWith("/api");

      if (isPublic || isApi) return true;

      if (!auth?.user) return false;

      if (pathname.startsWith("/admin")) {
        if (!adminRoles.includes(auth.user.role ?? "")) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
      }

      return true;
    },
  },
  providers: [],
};
