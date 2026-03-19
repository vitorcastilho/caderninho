import { describe, it, expect, vi, beforeEach } from "vitest";

const mockHeaders = new Headers();
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(mockHeaders),
}));

const mockListOrganizations = vi.fn();
const mockCreateOrganization = vi.fn();
const mockSetActiveOrganization = vi.fn();

vi.mock("./config", () => ({
  auth: {
    api: {
      listOrganizations: (...args: unknown[]) =>
        mockListOrganizations(...args),
      createOrganization: (...args: unknown[]) =>
        mockCreateOrganization(...args),
      setActiveOrganization: (...args: unknown[]) =>
        mockSetActiveOrganization(...args),
    },
  },
}));

const { ensureUserHasOrganization } = await import("./ensure-organization");

describe("ensureUserHasOrganization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar organization existente sem criar nova", async () => {
    const existingOrg = { id: "org-1", name: "Família Vitor", slug: "familia-vitor" };
    mockListOrganizations.mockResolvedValue([existingOrg]);

    const result = await ensureUserHasOrganization("user-1", "Vitor Castilho", null);

    expect(result).toEqual(existingOrg);
    expect(mockCreateOrganization).not.toHaveBeenCalled();
  });

  it("deve criar organization quando usuario nao tem nenhuma", async () => {
    mockListOrganizations.mockResolvedValue([]);
    const createdOrg = { id: "org-2", name: "Família Vitor", slug: "familia-vitor" };
    mockCreateOrganization.mockResolvedValue(createdOrg);

    const result = await ensureUserHasOrganization("user-1", "Vitor Castilho", null);

    expect(mockCreateOrganization).toHaveBeenCalledWith({
      headers: mockHeaders,
      body: {
        name: "Família Vitor",
        slug: "familia-vitor",
        userId: "user-1",
      },
    });
    expect(result).toEqual(createdOrg);
  });

  it("deve usar 'Família' como fallback quando nome esta vazio", async () => {
    mockListOrganizations.mockResolvedValue([]);
    const createdOrg = { id: "org-3", name: "Família", slug: "familia" };
    mockCreateOrganization.mockResolvedValue(createdOrg);

    const result = await ensureUserHasOrganization("user-1", "", null);

    expect(mockCreateOrganization).toHaveBeenCalledWith({
      headers: mockHeaders,
      body: {
        name: "Família",
        slug: "familia",
        userId: "user-1",
      },
    });
    expect(result).toEqual(createdOrg);
  });

  it("deve gerar slug correto para nomes com acentos", async () => {
    mockListOrganizations.mockResolvedValue([]);
    const createdOrg = { id: "org-4", name: "Família José", slug: "familia-jose" };
    mockCreateOrganization.mockResolvedValue(createdOrg);

    await ensureUserHasOrganization("user-1", "José Silva", null);

    expect(mockCreateOrganization).toHaveBeenCalledWith({
      headers: mockHeaders,
      body: {
        name: "Família José",
        slug: "familia-jose",
        userId: "user-1",
      },
    });
  });

  it("deve retornar null quando listOrganizations falha", async () => {
    mockListOrganizations.mockRejectedValue(new Error("DB connection failed"));

    const result = await ensureUserHasOrganization("user-1", "Vitor", null);

    expect(result).toBeNull();
  });

  it("deve retornar null quando createOrganization falha", async () => {
    mockListOrganizations.mockResolvedValue([]);
    mockCreateOrganization.mockRejectedValue(new Error("Slug duplicate"));

    const result = await ensureUserHasOrganization("user-1", "Vitor", null);

    expect(result).toBeNull();
  });
});
