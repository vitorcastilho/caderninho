import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

import { proxy } from "./proxy";
import { resetRateLimitStore } from "@/server/infrastructure/security/rate-limiter";

// Mock logger to prevent console output in tests
vi.mock("@/server/infrastructure/logging/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock NextResponse methods
vi.mock("next/server", async () => {
  const actual = await vi.importActual<typeof import("next/server")>(
    "next/server",
  );
  // Construtível (o proxy usa `new NextResponse(...)` no 429) + estáticos mockados
  const MockNextResponse = vi.fn(function (
    this: { type: string; status?: number; headers: Headers },
    _body?: unknown,
    init?: { status?: number; headers?: Record<string, string> },
  ) {
    this.type = "response";
    this.status = init?.status;
    this.headers = new Headers(init?.headers);
  }) as unknown as Record<string, unknown>;
  MockNextResponse.redirect = vi.fn((url: URL) => ({ type: "redirect", url }));
  MockNextResponse.next = vi.fn(() => ({ type: "next" }));
  return {
    ...actual,
    NextResponse: MockNextResponse,
  };
});

function createRequest(
  url: string,
  cookies: Record<string, string> = {},
): NextRequest {
  const request = new NextRequest(new URL(url, "http://localhost:3000"));
  for (const [name, value] of Object.entries(cookies)) {
    request.cookies.set(name, value);
  }
  return request;
}

describe("proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve permitir acesso quando cookie de sessao esta presente", () => {
    const request = createRequest("/dashboard", {
      "better-auth.session_token": "valid-token-123",
    });

    proxy(request);

    expect(NextResponse.next).toHaveBeenCalled();
  });

  it("deve redirecionar para /login quando cookie de sessao esta ausente", () => {
    const request = createRequest("/dashboard");

    proxy(request);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const redirectCall = vi.mocked(NextResponse.redirect).mock.calls[0];
    const redirectUrl = redirectCall[0] as URL;
    expect(redirectUrl.pathname).toBe("/login");
  });

  it("deve permitir acesso a /login sem cookie", () => {
    const request = createRequest("/login");

    proxy(request);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });

  it("deve permitir acesso a /register sem cookie", () => {
    const request = createRequest("/register");

    proxy(request);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });

  it("deve permitir acesso a /api/auth sem cookie", () => {
    const request = createRequest("/api/auth/sign-in/email");

    proxy(request);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });

  it("deve redirecionar /checklist para /login sem cookie", () => {
    const request = createRequest("/checklist");

    proxy(request);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const redirectCall = vi.mocked(NextResponse.redirect).mock.calls[0];
    const redirectUrl = redirectCall[0] as URL;
    expect(redirectUrl.pathname).toBe("/login");
  });

  it("deve permitir /checklist com cookie valido", () => {
    const request = createRequest("/checklist", {
      "better-auth.session_token": "valid-token-123",
    });

    proxy(request);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });

  // Story 1.9 — em HTTPS (staging/produção) o Better Auth grava o cookie com o
  // prefixo seguro `__Secure-`. O proxy precisa reconhecer os dois nomes.
  describe("cookie de sessao com prefixo __Secure- (HTTPS)", () => {
    it("deve permitir /dashboard com __Secure-better-auth.session_token", () => {
      const request = createRequest("https://caderninho-staging.vercel.app/dashboard", {
        "__Secure-better-auth.session_token": "valid-token-123",
      });

      proxy(request);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it("deve permitir /checklist com __Secure-better-auth.session_token", () => {
      const request = createRequest("https://caderninho-staging.vercel.app/checklist", {
        "__Secure-better-auth.session_token": "valid-token-123",
      });

      proxy(request);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it("deve continuar redirecionando para /login em HTTPS sem cookie de sessao", () => {
      const request = createRequest("https://caderninho-staging.vercel.app/dashboard", {
        "outro-cookie": "x",
      });

      proxy(request);

      expect(NextResponse.redirect).toHaveBeenCalled();
      const redirectUrl = vi.mocked(NextResponse.redirect).mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe("/login");
    });
  });

  // Story 1.11 — o limite de 30 req/min por IP derrubava usuários reais:
  // prefetch da sidebar + server actions passavam de 30 em poucas navegações.
  describe("rate limit por tipo de requisição", () => {
    const SESSION = { "better-auth.session_token": "valid-token-123" };
    let ipCounter = 0;

    function req(
      path: string,
      opts: { method?: string; headers?: Record<string, string>; ip?: string } = {},
    ): NextRequest {
      const request = new NextRequest(new URL(path, "https://caderninho.example.com"), {
        method: opts.method ?? "GET",
        headers: { "x-forwarded-for": opts.ip ?? "203.0.113.1", ...(opts.headers ?? {}) },
      });
      for (const [name, value] of Object.entries(SESSION)) request.cookies.set(name, value);
      return request;
    }

    function hit(n: number, make: () => NextRequest) {
      const results: Array<{ type: string; status?: number; headers?: Headers }> = [];
      for (let i = 0; i < n; i++) results.push(proxy(make()) as never);
      return results;
    }

    const blocked = (rs: Array<{ status?: number }>) => rs.filter((r) => r.status === 429).length;

    beforeEach(() => {
      resetRateLimitStore();
      ipCounter++;
    });

    it("prefetch do Next tem cota própria (600/min) e não consome a cota de navegação", () => {
      const ip = `198.51.100.${ipCounter}`;
      const prefetch = () =>
        req("/transactions?_rsc=abc", { ip, headers: { "next-router-prefetch": "1", rsc: "1" } });
      expect(blocked(hit(600, prefetch))).toBe(0);
      // navegação intacta depois de 600 prefetches
      expect(blocked(hit(300, () => req("/dashboard", { ip })))).toBe(0);
      // header forjável: prefetch não é ilimitado
      expect((proxy(prefetch()) as unknown as { status?: number }).status).toBe(429);
    });

    it("navegação normal: 300 por minuto passam (antes o limite era 30)", () => {
      const ip = `198.51.100.${ipCounter}`;
      const nav = hit(300, () => req("/transactions", { ip }));
      expect(blocked(nav)).toBe(0);
      const extra = proxy(req("/transactions", { ip })) as unknown as { status?: number };
      expect(extra.status).toBe(429);
    });

    it("server actions têm cota própria: 120 por minuto, a 121ª recebe 429 com Retry-After", () => {
      const ip = `198.51.100.${ipCounter}`;
      const action = () => req("/transactions", { ip, method: "POST", headers: { "next-action": "abc123" } });
      const ok = hit(120, action);
      expect(blocked(ok)).toBe(0);
      const over = proxy(action()) as unknown as { status?: number; headers: Headers };
      expect(over.status).toBe(429);
      expect(Number(over.headers.get("Retry-After"))).toBeGreaterThan(0);
      // navegação continua liberada (cotas separadas)
      expect(blocked(hit(5, () => req("/dashboard", { ip })))).toBe(0);
    });

    it("rotas de auth continuam com limite rígido de 10 por minuto", () => {
      const ip = `198.51.100.${ipCounter}`;
      const auth = () => req("/api/auth/sign-in/email", { ip, method: "POST" });
      expect(blocked(hit(10, auth))).toBe(0);
      expect((proxy(auth()) as unknown as { status?: number }).status).toBe(429);
    });
  });
});
