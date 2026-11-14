// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { Sidebar } from "./Sidebar";

// Mock next/navigation
const mockPathname = vi.fn<() => string>().mockReturnValue("/dashboard");
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({ push: mockPush }),
}));

// Mock auth client
const mockSignOut = vi.fn().mockResolvedValue({});
vi.mock("@/client/utils/auth-client", () => ({
  authClient: {
    signOut: (...args: unknown[]) => mockSignOut(...args),
  },
}));

// Mock useSidebarState
const mockToggle = vi.fn();
const mockCollapsed = vi.fn<() => boolean>().mockReturnValue(false);
vi.mock("@/client/hooks/use-sidebar-state", () => ({
  useSidebarState: () => ({
    collapsed: mockCollapsed(),
    toggle: mockToggle,
    setCollapsed: vi.fn(),
  }),
}));

describe("Sidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue("/dashboard");
    mockCollapsed.mockReturnValue(false);
  });

  it("deve renderizar os 4 itens de navegacao", () => {
    render(<Sidebar userName="Vitor" />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Orçamentos")).toBeInTheDocument();
    expect(screen.getByText("Checklist")).toBeInTheDocument();
    expect(screen.getByText("Projeção")).toBeInTheDocument();
  });

  it("deve marcar item ativo com aria-current=page", () => {
    mockPathname.mockReturnValue("/dashboard");
    render(<Sidebar userName="Vitor" />);

    const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute("aria-current", "page");
  });

  it("deve nao marcar itens inativos com aria-current", () => {
    mockPathname.mockReturnValue("/dashboard");
    render(<Sidebar userName="Vitor" />);

    const checklistLink = screen.getByRole("link", { name: /transações/i });
    expect(checklistLink).not.toHaveAttribute("aria-current");
  });

  it("deve ter role=navigation com aria-label", () => {
    render(<Sidebar userName="Vitor" />);

    expect(
      screen.getByRole("navigation", { name: /menu lateral/i })
    ).toBeInTheDocument();
  });

  it("deve renderizar botao de toggle com aria-label correto quando expandido", () => {
    mockCollapsed.mockReturnValue(false);
    render(<Sidebar userName="Vitor" />);

    expect(
      screen.getByRole("button", { name: /recolher menu/i })
    ).toBeInTheDocument();
  });

  it("deve renderizar botao de toggle com aria-label correto quando colapsado", () => {
    mockCollapsed.mockReturnValue(true);
    render(<Sidebar userName="Vitor" />);

    expect(
      screen.getByRole("button", { name: /expandir menu/i })
    ).toBeInTheDocument();
  });

  it("deve aplicar classe de largura expandida quando nao colapsado", () => {
    mockCollapsed.mockReturnValue(false);
    render(<Sidebar userName="Vitor" />);

    const sidebar = screen.getByRole("complementary");
    expect(sidebar.className).toContain("lg:w-[220px]");
    expect(sidebar.className).not.toContain("lg:w-14");
  });

  it("deve aplicar classe de largura colapsada quando colapsado", () => {
    mockCollapsed.mockReturnValue(true);
    render(<Sidebar userName="Vitor" />);

    const sidebar = screen.getByRole("complementary");
    expect(sidebar.className).toContain("lg:w-[56px]");
    expect(sidebar.className).not.toContain("lg:w-[220px]");
  });

  it("deve ter aria-expanded=false no botao toggle quando colapsado", () => {
    mockCollapsed.mockReturnValue(true);
    render(<Sidebar userName="Vitor" />);

    const toggleBtn = screen.getByRole("button", { name: /expandir menu/i });
    expect(toggleBtn).toHaveAttribute("aria-expanded", "false");
  });

  it("deve ter aria-expanded=true no botao toggle quando expandido", () => {
    mockCollapsed.mockReturnValue(false);
    render(<Sidebar userName="Vitor" />);

    const toggleBtn = screen.getByRole("button", { name: /recolher menu/i });
    expect(toggleBtn).toHaveAttribute("aria-expanded", "true");
  });

  it("deve chamar signOut e redirecionar para /login ao clicar em Sair", async () => {
    const user = userEvent.setup();
    render(<Sidebar userName="Vitor" />);

    const logoutButton = screen.getByRole("button", { name: /sair/i });
    await user.click(logoutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });

    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  // Story 3.4f — telas dos épicos 4, 6 e 7 ainda não existem (davam 404)
  it("Orçamentos, Checklist e Projeção aparecem como \"Em breve\", sem link", () => {
    render(<Sidebar userName="Vitor" />);
    for (const label of ["Orçamentos", "Checklist", "Projeção"]) {
      expect(screen.queryByRole("link", { name: new RegExp(label, "i") })).not.toBeInTheDocument();
      const item = screen.getByText(label).closest("[aria-disabled]");
      expect(item).toHaveAttribute("aria-disabled", "true");
    }
    expect(screen.getAllByText("Em breve")).toHaveLength(3);
    // itens existentes continuam como link
    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: /transações/i })).toHaveAttribute("href", "/transactions");
  });
});
