import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PUBLIC_ROUTES = ["/", "/sign-in", "/sign-up", "/invite"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicInviteLookup =
    request.method === "GET" && /^\/api\/invites\/[^/]+$/.test(pathname);

  if (
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith("/api/auth") ||
    isPublicInviteLookup
  ) {
    return NextResponse.next();
  }

  if (!getSessionCookie(request)) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set(
      "callbackUrl",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );

    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
