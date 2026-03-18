// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";

import { createLocalStorageMock } from "@/client/test-utils/local-storage-mock";

vi.stubGlobal("localStorage", createLocalStorageMock());

const mockPush = vi.fn();
const mockSearchParams = vi.fn().mockReturnValue(null);
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    get: (...args: unknown[]) => mockSearchParams(...args),
  }),
}));

const mockSignIn = vi.fn();
const mockSignInSocial = vi.fn();

vi.mock("@/client/utils/auth-client", () => ({
  authClient: {
    signIn: {
      email: (...args: unknown[]) => mockSignIn(...args),
      social: (...args: unknown[]) => mockSignInSocial(...args),
    },
  },
}));

const { LoginForm } = await import("./LoginForm");

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignIn.mockResolvedValue({ data: {}, error: null });
    mockSearchParams.mockReturnValue(null);
  });

  it("deve renderizar campos de email e senha", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
  });

  it("deve exibir logo e tagline", () => {
    render(<LoginForm />);

    expect(screen.getByText("Caderninho")).toBeInTheDocument();
    expect(screen.getByText("Suas finanças, com clareza")).toBeInTheDocument();
  });

  it("deve exibir link para pagina de registro", () => {
    render(<LoginForm />);

    const registerLink = screen.getByRole("link", { name: "Criar conta" });
    expect(registerLink).toHaveAttribute("href", "/register");
  });

  it("deve exibir botao Google habilitado", () => {
    render(<LoginForm />);

    const googleBtn = screen.getByRole("button", { name: /Entrar com Google/i });
    expect(googleBtn).toBeEnabled();
  });

  it("deve chamar signIn.social ao clicar no botao Google", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /Entrar com Google/i }));

    expect(mockSignInSocial).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: "/dashboard",
      errorCallbackURL: "/login?error=google",
    });
  });

  it("deve exibir erro quando query param error=google esta presente", () => {
    mockPush.mockClear();
    // Mock useSearchParams to return error=google
    vi.mocked(mockSearchParams).mockReturnValue("google");
    render(<LoginForm />);

    expect(
      screen.getByText("Login com Google cancelado. Tente novamente.")
    ).toBeInTheDocument();
  });

  it("deve exibir erros de validacao ao enviar formulario vazio", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(screen.getByText("Informe seu e-mail")).toBeInTheDocument();
    });
  });

  it("deve exibir erro do servidor para credenciais invalidas", async () => {
    mockSignIn.mockResolvedValue({
      data: null,
      error: { code: "INVALID_EMAIL_OR_PASSWORD" },
    });

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("E-mail"), "vitor@test.com");
    await user.type(screen.getByLabelText("Senha"), "senhaerrada");

    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(screen.getByText("E-mail ou senha incorretos")).toBeInTheDocument();
    });
  });

  it("deve chamar signIn e redirecionar ao dashboard com dados validos", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("E-mail"), "vitor@test.com");
    await user.type(screen.getByLabelText("Senha"), "Senha123");

    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: "vitor@test.com",
        password: "Senha123",
      });
    });

    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("deve resetar loading do botao Google quando signIn.social falha", async () => {
    mockSignInSocial.mockRejectedValue(new Error("Network error"));

    const user = userEvent.setup();
    render(<LoginForm />);

    const googleBtn = screen.getByRole("button", { name: /Entrar com Google/i });
    await user.click(googleBtn);

    await waitFor(() => {
      expect(googleBtn).toBeEnabled();
    });
  });

  it("deve alternar visibilidade da senha", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const passwordInput = screen.getByLabelText("Senha");
    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(screen.getByLabelText("Mostrar senha"));

    expect(passwordInput).toHaveAttribute("type", "text");
  });
});
