// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Sidebar } from "./Sidebar";

// Mock next/navigation
const mockPathname = vi.fn<() => string>().mockReturnValue("/dashboard");
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
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
    mockPathname.mockReturnValue("/dashboard");
    mockCollapsed.mockReturnValue(false);
    mockToggle.mockClear();
  });

  it("deve renderizar os 4 itens de navegacao", () => {
    render(<Sidebar />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Orçamentos")).toBeInTheDocument();
    expect(screen.getByText("Checklist")).toBeInTheDocument();
    expect(screen.getByText("Projeção")).toBeInTheDocument();
  });

  it("deve marcar item ativo com aria-current=page", () => {
    mockPathname.mockReturnValue("/dashboard");
    render(<Sidebar />);

    const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute("aria-current", "page");
  });

  it("deve nao marcar itens inativos com aria-current", () => {
    mockPathname.mockReturnValue("/dashboard");
    render(<Sidebar />);

    const checklistLink = screen.getByRole("link", { name: /checklist/i });
    expect(checklistLink).not.toHaveAttribute("aria-current");
  });

  it("deve ter role=navigation com aria-label", () => {
    render(<Sidebar />);

    expect(
      screen.getByRole("navigation", { name: /menu lateral/i })
    ).toBeInTheDocument();
  });

  it("deve renderizar botao de toggle com aria-label correto quando expandido", () => {
    mockCollapsed.mockReturnValue(false);
    render(<Sidebar />);

    expect(
      screen.getByRole("button", { name: /recolher menu/i })
    ).toBeInTheDocument();
  });

  it("deve renderizar botao de toggle com aria-label correto quando colapsado", () => {
    mockCollapsed.mockReturnValue(true);
    render(<Sidebar />);

    expect(
      screen.getByRole("button", { name: /expandir menu/i })
    ).toBeInTheDocument();
  });

  it("deve aplicar classe de largura expandida quando nao colapsado", () => {
    mockCollapsed.mockReturnValue(false);
    render(<Sidebar />);

    const sidebar = screen.getByRole("complementary");
    expect(sidebar.className).toContain("lg:w-[220px]");
    expect(sidebar.className).not.toContain("lg:w-14");
  });

  it("deve aplicar classe de largura colapsada quando colapsado", () => {
    mockCollapsed.mockReturnValue(true);
    render(<Sidebar />);

    const sidebar = screen.getByRole("complementary");
    expect(sidebar.className).toContain("lg:w-[56px]");
    expect(sidebar.className).not.toContain("lg:w-[220px]");
  });

  it("deve ter aria-expanded=false no botao toggle quando colapsado", () => {
    mockCollapsed.mockReturnValue(true);
    render(<Sidebar />);

    const toggleBtn = screen.getByRole("button", { name: /expandir menu/i });
    expect(toggleBtn).toHaveAttribute("aria-expanded", "false");
  });

  it("deve ter aria-expanded=true no botao toggle quando expandido", () => {
    mockCollapsed.mockReturnValue(false);
    render(<Sidebar />);

    const toggleBtn = screen.getByRole("button", { name: /recolher menu/i });
    expect(toggleBtn).toHaveAttribute("aria-expanded", "true");
  });
});
