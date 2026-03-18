import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Verificacao otimista — apenas cookie, sem DB
  // A validacao real acontece nos Server Components via auth.api.getSession()
  const sessionCookie = request.cookies.get("better-auth.session_token");

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/(app)/:path*"],
};
