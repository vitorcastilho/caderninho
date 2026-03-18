import { describe, it, expect } from "vitest";

import { registerSchema, loginSchema } from "./auth.schema";

describe("registerSchema", () => {
  const validData = {
    name: "Vitor Castilho",
    email: "vitor@example.com",
    password: "Senha123",
    confirmPassword: "Senha123",
  };

  it("deve aceitar dados validos", () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("deve rejeitar nome vazio", () => {
    const result = registerSchema.safeParse({ ...validData, name: "" });
    expect(result.success).toBe(false);
  });

  it("deve rejeitar email invalido", () => {
    const result = registerSchema.safeParse({ ...validData, email: "invalido" });
    expect(result.success).toBe(false);
  });

  it("deve rejeitar senha com menos de 8 caracteres", () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: "Ab1",
      confirmPassword: "Ab1",
    });
    expect(result.success).toBe(false);
  });

  it("deve rejeitar senha sem letra maiuscula", () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: "senha123",
      confirmPassword: "senha123",
    });
    expect(result.success).toBe(false);
  });

  it("deve rejeitar senha sem numero", () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: "SenhaForte",
      confirmPassword: "SenhaForte",
    });
    expect(result.success).toBe(false);
  });

  it("deve rejeitar quando senhas nao coincidem", () => {
    const result = registerSchema.safeParse({
      ...validData,
      confirmPassword: "OutraSenha1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmError = result.error.issues.find(
        (issue) => issue.path.includes("confirmPassword"),
      );
      expect(confirmError?.message).toBe("As senhas não coincidem");
    }
  });
});

describe("loginSchema", () => {
  const validData = {
    email: "vitor@example.com",
    password: "qualquersenha",
  };

  it("deve aceitar dados validos", () => {
    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("deve rejeitar email vazio", () => {
    const result = loginSchema.safeParse({ ...validData, email: "" });
    expect(result.success).toBe(false);
  });

  it("deve rejeitar email invalido", () => {
    const result = loginSchema.safeParse({ ...validData, email: "nao-email" });
    expect(result.success).toBe(false);
  });

  it("deve rejeitar senha vazia", () => {
    const result = loginSchema.safeParse({ ...validData, password: "" });
    expect(result.success).toBe(false);
  });
});
