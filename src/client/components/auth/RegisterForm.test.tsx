// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";

import { createLocalStorageMock } from "@/client/test-utils/local-storage-mock";

vi.stubGlobal("localStorage", createLocalStorageMock());

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockSignUp = vi.fn();
const mockOrgCreate = vi.fn();

vi.mock("@/client/utils/auth-client", () => ({
  authClient: {
    signUp: {
      email: (...args: unknown[]) => mockSignUp(...args),
    },
    organization: {
      create: (...args: unknown[]) => mockOrgCreate(...args),
    },
  },
}));

// Must import AFTER mocks
const { RegisterForm } = await import("./RegisterForm");

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignUp.mockResolvedValue({ data: {}, error: null });
    mockOrgCreate.mockResolvedValue({ data: {}, error: null });
  });

  it("deve renderizar todos os campos do formulario", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText("Nome completo")).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmar senha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Criar conta" })).toBeInTheDocument();
  });

  it("deve exibir link para pagina de login", () => {
    render(<RegisterForm />);

    const loginLink = screen.getByRole("link", { name: "Entrar" });
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("deve exibir checklist de requisitos de senha", () => {
    render(<RegisterForm />);

    expect(screen.getByText("Mínimo 8 caracteres")).toBeInTheDocument();
    expect(screen.getByText("Uma letra maiúscula")).toBeInTheDocument();
    expect(screen.getByText("Um número")).toBeInTheDocument();
  });

  it("deve exibir erros de validacao ao enviar formulario vazio", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    await waitFor(() => {
      expect(screen.getByText("Informe seu nome completo")).toBeInTheDocument();
    });
  });

  it("deve exibir erro quando senhas nao coincidem", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Nome completo"), "Vitor");
    await user.type(screen.getByLabelText("E-mail"), "vitor@test.com");
    await user.type(screen.getByLabelText("Senha"), "Senha123");
    await user.type(screen.getByLabelText("Confirmar senha"), "Outra123");

    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    await waitFor(() => {
      expect(screen.getByText("As senhas não coincidem")).toBeInTheDocument();
    });
  });

  it("deve exibir erro do servidor quando email ja esta em uso", async () => {
    mockSignUp.mockResolvedValue({
      data: null,
      error: { code: "USER_ALREADY_EXISTS" },
    });

    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Nome completo"), "Vitor");
    await user.type(screen.getByLabelText("E-mail"), "vitor@test.com");
    await user.type(screen.getByLabelText("Senha"), "Senha123");
    await user.type(screen.getByLabelText("Confirmar senha"), "Senha123");

    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    await waitFor(() => {
      expect(screen.getByText("Este e-mail já está em uso")).toBeInTheDocument();
    });
  });

  it("deve chamar signUp e criar organization ao enviar dados validos", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Nome completo"), "Vitor Castilho");
    await user.type(screen.getByLabelText("E-mail"), "vitor@test.com");
    await user.type(screen.getByLabelText("Senha"), "Senha123");
    await user.type(screen.getByLabelText("Confirmar senha"), "Senha123");

    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        name: "Vitor Castilho",
        email: "vitor@test.com",
        password: "Senha123",
      });
    });

    await waitFor(() => {
      expect(mockOrgCreate).toHaveBeenCalledWith({
        name: "Família Vitor",
        slug: "familia-vitor",
      });
    });

    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("deve exibir erro e nao redirecionar quando organization.create falha", async () => {
    mockOrgCreate.mockResolvedValue({
      data: null,
      error: { code: "ORGANIZATION_CREATION_FAILED" },
    });

    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Nome completo"), "Vitor Castilho");
    await user.type(screen.getByLabelText("E-mail"), "vitor@test.com");
    await user.type(screen.getByLabelText("Senha"), "Senha123");
    await user.type(screen.getByLabelText("Confirmar senha"), "Senha123");

    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    await waitFor(() => {
      expect(screen.getByText(/erro ao configurar seu espaço/i)).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("deve alternar visibilidade da senha", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const passwordInput = screen.getByLabelText("Senha");
    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleButtons = screen.getAllByLabelText("Mostrar senha");
    await user.click(toggleButtons[0]);

    expect(passwordInput).toHaveAttribute("type", "text");
  });
});
