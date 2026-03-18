"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, BookOpen } from "lucide-react";
import Link from "next/link";

import { loginSchema, type LoginInput } from "@/shared/schemas/auth.schema";
import { authClient } from "@/client/utils/auth-client";
import { Input } from "@/client/components/ui/input";
import { Button } from "@/client/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const googleError = searchParams.get("error");
  const googleErrorMessage =
    googleError === "google"
      ? "Login com Google cancelado. Tente novamente."
      : null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  async function onSubmit(data: LoginInput) {
    setServerError(null);

    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });

    if (error) {
      const errorMessages: Record<string, string> = {
        INVALID_EMAIL_OR_PASSWORD: "E-mail ou senha incorretos",
        USER_NOT_FOUND: "E-mail ou senha incorretos",
        INVALID_PASSWORD: "E-mail ou senha incorretos",
      };
      setServerError(
        errorMessages[error.code ?? ""] ??
          "Erro ao fazer login. Tente novamente.",
      );
      return;
    }

    router.push("/dashboard");
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    setServerError(null);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
      errorCallbackURL: "/login?error=google",
    });
  }

  return (
    <div className="w-full max-w-[420px] rounded-card-lg border border-border bg-card p-8 shadow-sm md:p-10">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
          <BookOpen className="size-5 text-primary-foreground" />
        </div>
        <span className="text-[26px] font-bold tracking-tight text-foreground">
          Caderninho
        </span>
      </div>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Suas finanças, com clareza
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-9 space-y-5">
        {(serverError || googleErrorMessage) && (
          <div className="rounded-card-inner border border-critical/30 bg-critical-bg p-3 text-sm text-critical-text">
            {serverError || googleErrorMessage}
          </div>
        )}

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-[13px] font-medium text-foreground"
          >
            E-mail
          </label>
          <Input
            id="email"
            type="email"
            placeholder="voce@exemplo.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            className="h-11"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-critical">{errors.email.message}</p>
          )}
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
              placeholder="Digite sua senha"
              autoComplete="current-password"
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
          {errors.password && (
            <p className="mt-1 text-xs text-critical">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full text-sm font-semibold"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </Button>
      </form>

      {/* Divider + Google */}
      <div className="my-7 flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-text-tertiary">ou</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button
        variant="outline"
        type="button"
        disabled={isGoogleLoading}
        onClick={handleGoogleSignIn}
        className="h-11 w-full gap-2.5 text-sm font-medium"
      >
        {isGoogleLoading ? (
          <Loader2 className="size-[18px] animate-spin" />
        ) : (
          <svg className="size-[18px]" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        Entrar com Google
      </Button>

      {/* Footer */}
      <div className="mt-8 text-center text-[13px] text-muted-foreground">
        Não tem conta?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:underline"
        >
          Criar conta
        </Link>
      </div>
    </div>
  );
}
