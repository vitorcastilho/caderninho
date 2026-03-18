// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { BottomNavigation, navItems } from "./BottomNavigation";

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

describe("BottomNavigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue("/dashboard");
  });

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

  it("deve exibir badge quando badge > 0", () => {
    const original = navItems[0].badge;
    navItems[0].badge = 5;
    try {
      render(<BottomNavigation />);
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByLabelText("5 notificações")).toBeInTheDocument();
    } finally {
      navItems[0].badge = original;
    }
  });

  it("deve exibir botao de logout", () => {
    render(<BottomNavigation />);

    expect(screen.getByText("Sair")).toBeInTheDocument();
  });

  it("deve exibir 99+ quando badge > 99", () => {
    const original = navItems[0].badge;
    navItems[0].badge = 150;
    try {
      render(<BottomNavigation />);
      expect(screen.getByText("99+")).toBeInTheDocument();
      expect(screen.getByLabelText("150 notificações")).toBeInTheDocument();
    } finally {
      navItems[0].badge = original;
    }
  });

  it("deve chamar signOut e redirecionar para /login ao clicar em Sair", async () => {
    const user = userEvent.setup();
    render(<BottomNavigation />);

    const logoutButton = screen.getByRole("button", { name: /sair/i });
    await user.click(logoutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });

    expect(mockPush).toHaveBeenCalledWith("/login");
  });
});
