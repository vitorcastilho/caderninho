// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { BottomNavigation } from "./BottomNavigation";

// Mock next/navigation
const mockPathname = vi.fn<() => string>().mockReturnValue("/dashboard");
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

describe("BottomNavigation", () => {
  it("deve renderizar 5 itens de navegacao", () => {
    render(<BottomNavigation />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Orçamentos")).toBeInTheDocument();
    expect(screen.getByText("Registrar")).toBeInTheDocument();
    expect(screen.getByText("Checklist")).toBeInTheDocument();
    expect(screen.getByText("Projeção")).toBeInTheDocument();
  });

  it("deve marcar item ativo com aria-current=page", () => {
    mockPathname.mockReturnValue("/dashboard");
    render(<BottomNavigation />);

    const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute("aria-current", "page");
  });

  it("deve nao marcar itens inativos com aria-current", () => {
    mockPathname.mockReturnValue("/dashboard");
    render(<BottomNavigation />);

    const checklistLink = screen.getByRole("link", { name: /checklist/i });
    expect(checklistLink).not.toHaveAttribute("aria-current");
  });

  it("deve ter o FAB central como botao", () => {
    render(<BottomNavigation />);

    const fab = screen.getByRole("link", { name: /registrar/i });
    expect(fab).toBeInTheDocument();
  });

  it("deve ter role=navigation", () => {
    render(<BottomNavigation />);

    expect(screen.getByRole("navigation", { name: /navegação inferior/i })).toBeInTheDocument();
  });
});
