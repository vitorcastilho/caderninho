"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import Link from "next/link";

import { registerSchema, type RegisterInput } from "@/shared/schemas/auth.schema";
import { authClient } from "@/client/utils/auth-client";
import { Input } from "@/client/components/ui/input";
import { Button } from "@/client/components/ui/button";

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const password = watch("password", "");

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const extraChecks = {
    special: /[^A-Za-z0-9]/.test(password),
    longPassword: password.length >= 12,
  };

  const baseScore = Object.values(passwordChecks).filter(Boolean).length;
  const extraScore = Object.values(extraChecks).filter(Boolean).length;

  // 1-2 base = Fraca, 3 base (minimum met) = Média, 3 base + extras = Forte
  const strengthScore =
    baseScore < 3
      ? baseScore === 0
        ? 0
        : baseScore <= 2
          ? 1
          : 2
      : extraScore >= 1
        ? 3
        : 2;

  const strengthLabel =
    strengthScore === 0
      ? ""
      : strengthScore === 1
        ? "Fraca"
        : strengthScore === 2
          ? "Média"
          : "Forte";

  const strengthColor =
    strengthScore === 1
      ? "bg-critical"
      : strengthScore === 2
        ? "bg-attention"
        : strengthScore === 3
          ? "bg-positive"
          : "bg-border";

  const strengthTextColor =
    strengthScore === 1
      ? "text-critical"
      : strengthScore === 2
        ? "text-attention"
        : strengthScore === 3
          ? "text-positive"
          : "text-text-tertiary";

  async function onSubmit(data: RegisterInput) {
    setServerError(null);

    const { error } = await authClient.signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    if (error) {
      const errorMessages: Record<string, string> = {
        USER_ALREADY_EXISTS: "Este e-mail já está em uso",
        WEAK_PASSWORD: "A senha não atende aos requisitos mínimos",
      };
      setServerError(
        errorMessages[error.code ?? ""] ??
          "Erro ao criar conta. Tente novamente.",
      );
      return;
    }

    // Create organization for the user
    const orgName = `Família ${data.name.split(" ")[0]}`;
    const slug = orgName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const orgResult = await authClient.organization.create({
      name: orgName,
      slug,
    });

    if (orgResult.error) {
      setServerError(
        "Conta criada, mas houve um erro ao configurar seu espaço. Tente fazer login novamente.",
      );
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="w-full max-w-[500px] rounded-card-lg border border-border bg-card p-8 shadow-sm md:p-10">
      <h1 className="text-2xl font-bold text-foreground">Criar conta</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Configure seu Caderninho em poucos minutos
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5">
        {serverError && (
          <div className="rounded-card-inner border border-critical/30 bg-critical-bg p-3 text-sm text-critical-text">
            {serverError}
          </div>
        )}

        {/* Nome */}
        <div className="md:flex md:gap-3">
          <div className="flex-1">
            <label
              htmlFor="name"
              className="mb-1.5 block text-[13px] font-medium text-foreground"
            >
              Nome completo
            </label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              aria-invalid={!!errors.name}
              className="h-11"
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-critical">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="mt-5 flex-1 md:mt-0">
            <label
              htmlFor="email"
              className="mb-1.5 block text-[13px] font-medium text-foreground"
            >
              E-mail
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              className="h-11"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-critical">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        {/* Senha */}
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-[13px] font-medium text-foreground"
          >
            Senha
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              className="h-11 pr-11"
              {...register("password")}
            />
            <button
              type="button"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-text-tertiary hover:text-muted-foreground"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <EyeOff className="size-[18px]" />
              ) : (
                <Eye className="size-[18px]" />
              )}
            </button>
          </div>

          {/* Strength bar */}
          {password.length > 0 && (
            <div className="mt-2">
              <div className="flex gap-1">
                <div
                  className={`h-1 flex-1 rounded-full ${strengthScore >= 1 ? strengthColor : "bg-border"}`}
                />
                <div
                  className={`h-1 flex-1 rounded-full ${strengthScore >= 2 ? strengthColor : "bg-border"}`}
                />
                <div
                  className={`h-1 flex-1 rounded-full ${strengthScore >= 3 ? strengthColor : "bg-border"}`}
                />
              </div>
              <span className={`mt-1.5 block text-xs font-medium ${strengthTextColor}`}>
                {strengthLabel}
              </span>
            </div>
          )}

          {/* Password requirements checklist */}
          <div className="mt-3 space-y-1">
            <PasswordRequirement met={passwordChecks.length} label="Mínimo 8 caracteres" />
            <PasswordRequirement met={passwordChecks.uppercase} label="Uma letra maiúscula" />
            <PasswordRequirement met={passwordChecks.number} label="Um número" />
          </div>
        </div>

        {/* Confirmar senha */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block text-[13px] font-medium text-foreground"
          >
            Confirmar senha
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              className="h-11 pr-11"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-text-tertiary hover:text-muted-foreground"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={
                showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="size-[18px]" />
              ) : (
                <Eye className="size-[18px]" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-critical">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full text-[15px] font-semibold"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Criando conta...
            </>
          ) : (
            "Criar conta"
          )}
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-text-tertiary">
        Ao criar sua conta, você concorda com os{" "}
        <span className="font-medium text-primary">Termos de Uso</span> e{" "}
        <span className="font-medium text-primary">Política de Privacidade</span>
      </p>

      <div className="mt-6 border-t border-border pt-5 text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Entrar
        </Link>
      </div>
    </div>
  );
}

function PasswordRequirement({ met, label }: { met: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 text-xs ${met ? "text-positive" : "text-text-tertiary"}`}>
      <span
        className={`flex size-4 shrink-0 items-center justify-center rounded-full ${met ? "bg-positive" : "bg-border"}`}
      >
        <Check className="size-2.5 text-white" />
      </span>
      <span>{label}</span>
    </div>
  );
}
