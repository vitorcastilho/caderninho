import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

import { middleware } from "./middleware";

// Mock NextResponse methods
vi.mock("next/server", async () => {
  const actual = await vi.importActual<typeof import("next/server")>(
    "next/server",
  );
  return {
    ...actual,
    NextResponse: {
      redirect: vi.fn((url: URL) => ({ type: "redirect", url })),
      next: vi.fn(() => ({ type: "next" })),
    },
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

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve permitir acesso quando cookie de sessao esta presente", () => {
    const request = createRequest("/dashboard", {
      "better-auth.session_token": "valid-token-123",
    });

    middleware(request);

    expect(NextResponse.next).toHaveBeenCalled();
  });

  it("deve redirecionar para /login quando cookie de sessao esta ausente", () => {
    const request = createRequest("/dashboard");

    middleware(request);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const redirectCall = vi.mocked(NextResponse.redirect).mock.calls[0];
    const redirectUrl = redirectCall[0] as URL;
    expect(redirectUrl.pathname).toBe("/login");
  });

  it("deve permitir acesso a /login sem cookie", () => {
    const request = createRequest("/login");

    middleware(request);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });

  it("deve permitir acesso a /register sem cookie", () => {
    const request = createRequest("/register");

    middleware(request);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });

  it("deve permitir acesso a /api/auth sem cookie", () => {
    const request = createRequest("/api/auth/sign-in/email");

    middleware(request);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });

  it("deve redirecionar /checklist para /login sem cookie", () => {
    const request = createRequest("/checklist");

    middleware(request);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const redirectCall = vi.mocked(NextResponse.redirect).mock.calls[0];
    const redirectUrl = redirectCall[0] as URL;
    expect(redirectUrl.pathname).toBe("/login");
  });

  it("deve permitir /checklist com cookie valido", () => {
    const request = createRequest("/checklist", {
      "better-auth.session_token": "valid-token-123",
    });

    middleware(request);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });
});
