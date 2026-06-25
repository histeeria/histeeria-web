import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPrefixes = ["/dashboard", "/onboarding"];

const workspaceRoutePattern =
  /^\/[^/]+\/(dashboard|inbox|agents|evaluation|team)(\/|$)/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected =
    protectedPrefixes.some((route) => pathname.startsWith(route)) ||
    workspaceRoutePattern.test(pathname);
  const isLogin = pathname.startsWith("/login");

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLogin && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/login",
    "/:workspace_slug/dashboard",
    "/:workspace_slug/dashboard/:path*",
    "/:workspace_slug/inbox",
    "/:workspace_slug/agents/:path*",
    "/:workspace_slug/evaluation/:path*",
    "/:workspace_slug/team/:path*",
  ],
};
