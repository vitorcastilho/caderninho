import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

import { rateLimit } from "@/server/infrastructure/security/rate-limiter";
import { logger } from "@/server/infrastructure/logging/logger";

const PUBLIC_PATHS = ["/login", "/register", "/api/auth"];
const AUTH_PATHS = ["/api/auth"];

// Casa o próprio caminho ou um subcaminho dele ("/login", "/login/..."), nunca
// um prefixo de texto: "/login-qualquer-coisa" não é rota pública.
function matchesPath(pathname: string, paths: readonly string[]): boolean {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

// Limites por IP, por janela de 1 minuto, separados por tipo de requisição.
// - auth: rígido (força bruta em login/registro)
// - action: server actions (POST com header `next-action`)
// - default: navegação (páginas e payloads RSC)
// - prefetch: cota própria e alta — a sidebar dispara um prefetch por link
//   visível e, somado à navegação, esgotava o antigo limite de 30 req/min
//   (Story 1.11). Não fica ilimitado porque o header pode ser forjado.
const AUTH_RATE_LIMIT = 10;
const ACTION_RATE_LIMIT = 120;
const DEFAULT_RATE_LIMIT = 300;
const PREFETCH_RATE_LIMIT = 600;
const RATE_WINDOW_MS = 60_000;

type RateLimitBucket = "auth" | "action" | "prefetch" | "default";

function isPrefetch(request: NextRequest): boolean {
  const h = request.headers;
  return (
    h.get("next-router-prefetch") === "1" ||
    h.get("purpose") === "prefetch" ||
    (h.get("sec-purpose") ?? "").includes("prefetch")
  );
}

function getBucket(request: NextRequest, pathname: string): RateLimitBucket {
  if (matchesPath(pathname, AUTH_PATHS)) return "auth";
  if (request.method === "POST" && request.headers.has("next-action")) return "action";
  if (request.method === "GET" && isPrefetch(request)) return "prefetch";
  return "default";
}

const LIMIT_BY_BUCKET: Record<RateLimitBucket, number> = {
  auth: AUTH_RATE_LIMIT,
  action: ACTION_RATE_LIMIT,
  prefetch: PREFETCH_RATE_LIMIT,
  default: DEFAULT_RATE_LIMIT,
};

function getClientIp(request: NextRequest): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip");

  if (!ip) {
    logger.warn({
      action: "missing_client_ip",
      data: { pathname: request.nextUrl.pathname },
    });
    return "unknown";
  }

  return ip;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting — antes de qualquer outra verificacao
  const ip = getClientIp(request);
  const bucket = getBucket(request, pathname);
  const { success, retryAfterMs } = rateLimit(
    `${ip}:${bucket}`,
    LIMIT_BY_BUCKET[bucket],
    RATE_WINDOW_MS,
  );

  if (!success) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil(retryAfterMs / 1000)),
      },
    });
  }

  // Skip public paths (auth pages and Better Auth API)
  if (matchesPath(pathname, PUBLIC_PATHS)) {
    return NextResponse.next();
  }

  // Verificacao otimista — apenas cookie, sem DB
  // A validacao real acontece nos Server Components via auth.api.getSession()
  // `getSessionCookie` reconhece o nome com e sem o prefixo `__Secure-`, que o
  // Better Auth usa em HTTPS (staging/producao).
  const sessionCookie = getSessionCookie(request);

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
