import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

const PUBLIC_ROUTES = [
  "/sign-in",
  "/sign-up",
];

// Slugs that are reserved for application pages and should NOT be treated as organizations
const RESERVED_SLUGS = [
  "api",
  "_next",
  "favicon.ico",
  "dashboard",
  "invite",
  "sign-in",
  "sign-up",
  "404",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/invites/")
  ) {
    return NextResponse.next();
  }

  // Get current session
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.redirect(
      new URL("/sign-in", request.url)
    );
  }

  const segments = pathname.split("/").filter(Boolean);

  if (segments.length > 0) {
    const orgSlug = segments[0];

    // Only run organization verification if the slug is NOT in the reserved list
    if (!RESERVED_SLUGS.includes(orgSlug)) {
      const organization = await prisma.organization.findUnique({
        where: { slug: orgSlug },
        select: { id: true },
      });

      if (!organization) {
        return NextResponse.rewrite(
          new URL("/404", request.url),
          { status: 404 }
        );
      }

      const membership = await prisma.member.findFirst({
        where: {
          organizationId: organization.id,
          userId: session.user.id,
        },
      });

      if (!membership) {
        return NextResponse.rewrite(
          new URL("/404", request.url),
          { status: 404 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
