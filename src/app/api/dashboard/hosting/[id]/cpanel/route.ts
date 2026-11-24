import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createWhmSession } from "@/lib/whm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { id } = await params;
  const account = await prisma.hostingAccount.findFirst({
    where: { id, userId: session.user.id },
    select: { username: true, status: true, domain: true },
  });

  if (!account || !account.username || account.status !== "ACTIVE") {
    return NextResponse.redirect(new URL("/dashboard/hosting?error=cpanel_unavailable", req.url));
  }

  const result = await createWhmSession(account.username);

  if (!result.success || !result.loginUrl) {
    return NextResponse.redirect(new URL("/dashboard/hosting?error=cpanel_unavailable", req.url));
  }

  if (result.sandbox) {
    return NextResponse.json({
      sandbox: true,
      message: `WHM_SANDBOX is on — in production you would be logged into cPanel for ${account.domain} now.`,
      loginUrl: result.loginUrl,
    });
  }

  return NextResponse.redirect(result.loginUrl);
}
