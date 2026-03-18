import { NextRequest, NextResponse } from "next/server";

import { rateLimit } from "@/server/infrastructure/security/rate-limiter";

const PUBLIC_PATHS = ["/login", "/register", "/api/auth"];
const AUTH_PATHS = ["/api/auth"];

const AUTH_RATE_LIMIT = 10;
const DEFAULT_RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting — antes de qualquer outra verificacao
  const ip = getClientIp(request);
  const isAuthRoute = AUTH_PATHS.some((path) => pathname.startsWith(path));
  const limit = isAuthRoute ? AUTH_RATE_LIMIT : DEFAULT_RATE_LIMIT;
  const rateLimitKey = `${ip}:${isAuthRoute ? "auth" : "default"}`;

  const { success, retryAfterMs } = rateLimit(rateLimitKey, limit, RATE_WINDOW_MS);

  if (!success) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil(retryAfterMs / 1000)),
      },
    });
  }

  // Skip public paths (auth pages and Better Auth API)
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Verificacao otimista — apenas cookie, sem DB
  // A validacao real acontece nos Server Components via auth.api.getSession()
  const sessionCookie = request.cookies.get("better-auth.session_token");

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
