import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetSession = vi.fn();
const mockHeaders = vi.fn();

vi.mock("./config", () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: () => mockHeaders(),
}));

import { getAuthSession } from "./get-session";

describe("getAuthSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar sessao quando usuario esta autenticado", async () => {
    const mockSession = {
      user: { id: "user-1", name: "Vitor", email: "vitor@test.com" },
      session: { id: "session-1" },
    };
    const fakeHeaders = new Headers({ cookie: "session=abc" });
    mockHeaders.mockResolvedValue(fakeHeaders);
    mockGetSession.mockResolvedValue(mockSession);

    const result = await getAuthSession();

    expect(result).toEqual(mockSession);
    expect(mockGetSession).toHaveBeenCalledWith({ headers: fakeHeaders });
  });

  it("deve retornar null quando usuario nao esta autenticado", async () => {
    const fakeHeaders = new Headers();
    mockHeaders.mockResolvedValue(fakeHeaders);
    mockGetSession.mockResolvedValue(null);

    const result = await getAuthSession();

    expect(result).toBeNull();
  });
});
