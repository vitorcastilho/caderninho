# Story 1.4: Registro e Login com Email/Senha

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to create an account with email/password and login securely,
So that I can access my financial data with confidence.

## Acceptance Criteria

1. O usuario pode criar conta com email e senha na pagina de registro — senha validada com requisitos minimos (8+ chars, 1 maiuscula, 1 numero)
2. O usuario pode fazer login com email e senha, criando sessao persistente com expiracao de 7 dias e renovacao automatica (FR46, NFR-S1)
3. O usuario logado e redirecionado ao dashboard
4. O usuario pode fazer logout, encerrando a sessao completamente e sendo redirecionado a tela de login (FR46)
5. Usuario nao autenticado que tenta acessar qualquer rota protegida e redirecionado a pagina de login
6. Better Auth esta configurado com Drizzle adapter (`usePlural: true`) e Organizations plugin
7. API route handler em `/api/auth/[...all]/route.ts` serve todas as rotas do Better Auth
8. Tela de login validada contra `proto-01-login.html`
9. Tela de registro validada contra `proto-02-signup.html`
10. Toda comunicacao usa HTTPS (NFR-S2) — headers de seguranca configurados no `next.config.ts`
11. Ao criar conta, uma Organization e criada automaticamente para o usuario (estrutura familiar)
12. A UX valida as telas de login e registro implementadas contra os prototipos (validacao visual obrigatoria antes de considerar done)

## Tasks / Subtasks

- [x] Task 1: Instalar e configurar Better Auth (AC: #6, #7)
  - [x]1.1 Instalar dependencias: `npm install better-auth`
  - [x]1.2 Criar `src/server/infrastructure/auth/config.ts` com instancia `betterAuth()`:
    - Drizzle adapter com `usePlural: true` e schema mapping explicito (users, sessions, accounts, verifications, organizations, members, invitations)
    - `emailAndPassword: { enabled: true }`
    - Session: `expiresIn: 604800` (7 dias em segundos), `updateAge: 86400` (renova quando < 1 dia restante)
    - Organizations plugin com `allowUserToCreateOrganization: true`, `creatorRole: "owner"`
  - [x]1.3 Criar `src/app/api/auth/[...all]/route.ts` com `toNextJsHandler(auth)` exportando GET e POST
  - [x]1.4 Atualizar `.env.example` com `BETTER_AUTH_SECRET` e `BETTER_AUTH_URL=http://localhost:3000`
  - [x]1.5 Criar `.env.local` com `BETTER_AUTH_SECRET` gerado (`openssl rand -base64 32`)
  - [x]1.6 Criar `src/client/utils/auth-client.ts` com `createAuthClient()` e `organizationClient()` plugin
  - [x]1.7 Verificar compatibilidade do schema existente com Better Auth — rodar `npx @better-auth/cli generate` para detectar diffs e criar migration se necessario (ex: `updatedAt` em organizations)
  - [x]1.8 Escrever testes para validar que a configuracao exporta corretamente e que o auth handler responde (TDD)

- [x] Task 2: Criar pagina de registro (AC: #1, #9, #11)
  - [x]2.1 Criar route group `src/app/(auth)/layout.tsx` com layout minimalista (sem sidebar, sem bottom nav)
  - [x]2.2 Criar `src/app/(auth)/register/page.tsx` como Server Component com o formulario
  - [x]2.3 Criar `src/client/components/auth/RegisterForm.tsx` (Client Component) com:
    - Campos: nome, email, senha, confirmar senha
    - Validacao client-side com schema Zod compartilhado
    - Requisitos de senha: minimo 8 caracteres, 1 maiuscula, 1 numero
    - Feedback visual de requisitos de senha (checklist visual enquanto digita)
    - Botao submit com spinner (useFormStatus) e desabilitado durante acao
    - Link "Ja tem conta? Entrar" para /login
  - [x]2.4 Criar `src/shared/schemas/auth.schema.ts` com schemas Zod: `registerSchema` e `loginSchema`
  - [x]2.5 Implementar fluxo de registro via `authClient.signUp.email()`:
    - Ao sucesso, criar Organization automaticamente para o usuario via `authClient.organization.create()`
    - Redirecionar ao dashboard
  - [x]2.6 Tratamento de erros: email ja em uso, senha fraca, erro de rede — mensagens em portugues, preservar dados digitados, opcao de retry (FR63)
  - [x]2.7 Validar visual contra `proto-02-signup.html`
  - [x]2.8 Escrever testes para RegisterForm (renderiza, valida campos, exibe erros) — mockar `authClient` via `vi.mock("@/client/utils/auth-client")`

- [x] Task 3: Criar pagina de login (AC: #2, #3, #8)
  - [x]3.1 Criar `src/app/(auth)/login/page.tsx` como Server Component
  - [x]3.2 Criar `src/client/components/auth/LoginForm.tsx` (Client Component) com:
    - Campos: email, senha
    - Validacao client-side com `loginSchema`
    - Botao submit com spinner e desabilitado durante acao
    - Link "Nao tem conta? Cadastrar" para /register
    - Espaco reservado para botao "Entrar com Google" (Story 1.5 — desabilitado ou oculto por enquanto)
  - [x]3.3 Implementar fluxo de login via `authClient.signIn.email()`:
    - Ao sucesso, redirecionar ao dashboard
    - Sessao criada com expiracao 7 dias + auto-renovacao
  - [x]3.4 Tratamento de erros: credenciais invalidas, conta inexistente, erro de rede — mensagens em portugues
  - [x]3.5 Validar visual contra `proto-01-login.html`
  - [x]3.6 Escrever testes para LoginForm (renderiza, valida campos, exibe erros) — mockar `authClient` via `vi.mock("@/client/utils/auth-client")`

- [x] Task 4: Implementar logout (AC: #4)
  - [x]4.1 Adicionar botao/opcao de logout no Sidebar e MobileNav (componentes existentes)
  - [x]4.2 Implementar logout via `authClient.signOut()` — encerrar sessao completamente
  - [x]4.3 Apos logout, redirecionar a pagina de login
  - [x]4.4 Escrever teste para o fluxo de logout

- [x] Task 5: Protecao de rotas e middleware (AC: #5)
  - [x]5.1 Criar `src/middleware.ts` com verificacao de cookie de sessao:
    - Verificar existencia do cookie `better-auth.session_token` (verificacao otimista para redirect)
    - Se ausente, redirecionar para `/login`
    - Matcher: `/(app)/:path*` (todas as rotas protegidas)
    - NAO usar verificacao full DB no middleware (Edge runtime) — verificacao segura nos Server Components
  - [x]5.2 Atualizar `src/app/(app)/layout.tsx` para validar sessao server-side via `auth.api.getSession({ headers })`:
    - Se sessao invalida, redirect para `/login`
    - Se sessao valida, passar dados do usuario para os componentes filhos
  - [x]5.3 Criar `src/server/infrastructure/auth/get-session.ts` como helper reutilizavel para obter sessao autenticada nos Server Components
  - [x]5.4 Escrever testes para o middleware (`src/middleware.test.ts`): cookie presente → next(), cookie ausente → redirect /login
  - [x]5.5 Escrever testes para o helper de sessao

- [x] Task 6: Configuracao de seguranca (AC: #10)
  - [x]6.1 Configurar headers de seguranca no `next.config.ts`:
    - Content-Security-Policy (CSP)
    - Strict-Transport-Security (HSTS)
    - X-Frame-Options: DENY
    - X-Content-Type-Options: nosniff
    - Referrer-Policy: strict-origin-when-cross-origin
  - [x]6.2 Verificar que HTTPS esta forcado (Vercel faz por padrao, Supabase local usa HTTP para dev)

- [x] Task 7: Validacao final (AC: #1-#12)
  - [x]7.1 `npm run dev` funciona com registro e login completos
  - [x]7.2 `npm run build` compila sem erros
  - [x]7.3 `npm test` roda e passa (todos os testes novos e existentes)
  - [x]7.4 `npm run lint` sem erros
  - [x]7.5 Fluxo completo: registro → redirecionado ao dashboard → logout → redirecionado ao login → login → dashboard
  - [x]7.6 Rota protegida: acessar /dashboard sem sessao → redirecionado ao login
  - [x]7.7 Verificar que Organization e criada automaticamente no registro
  - [x]7.8 Validacao UX: telas de login e registro conferidas contra prototipos por validacao visual

### Review Follow-ups (AI) — Code Review R1

- [x] [AI-Review][HIGH] Tratar erro de `authClient.organization.create()` em RegisterForm — se org creation falhar apos signup, usuario fica sem Organization quebrando multi-tenant. Verificar retorno, exibir erro e nao redirecionar se org nao foi criada. [src/client/components/auth/RegisterForm.tsx:98-103]
- [x] [AI-Review][HIGH] Corrigir middleware matcher `/(app)/:path*` — route groups `(app)` sao removidos da URL pelo Next.js, entao o matcher nunca dispara para `/dashboard`, `/checklist`, etc. Trocar para exclusion pattern ou lista explicita de rotas protegidas. [src/middleware.ts:15-17]
- [x] [AI-Review][HIGH] Adicionar testes de fluxo de logout — Task 4.4 marcada [x] mas nenhum teste verifica click no botao Sair → `authClient.signOut()` chamado → `router.push("/login")`. Adicionar em Sidebar.test.tsx e BottomNavigation.test.tsx. [src/client/components/layout/Sidebar.test.tsx, src/client/components/layout/BottomNavigation.test.tsx]
- [x] [AI-Review][MEDIUM] Remover `'unsafe-eval'` do CSP `script-src` — Next.js 16 App Router nao precisa de `unsafe-eval` em producao. Se quebrar dev (Turbopack), condicionar CSP por ambiente. [next.config.ts:23]

## Dev Notes

### Versoes Exatas do Stack (Story 1.4)

| Tecnologia | Versao | Pacote npm | Notas |
|---|---|---|---|
| Better Auth | 1.5.5 | `better-auth` | Ultima versao estavel (marco 2026). v1.5.0 foi major release com 600+ commits |
| Drizzle ORM | 0.45.1 | (ja instalado) | Adapter via `better-auth/adapters/drizzle` |
| Next.js | 16.1.6 | (ja instalado) | App Router, APIs async (params, cookies) |
| React Hook Form | latest | `react-hook-form` | Para formularios de login/registro |
| @hookform/resolvers | latest | `@hookform/resolvers` | Resolver Zod para React Hook Form |
| Zod | latest | `zod` | Schemas de validacao compartilhados. `drizzle-orm/zod` NAO e usado nesta story |

### ALERTA CRITICO: Better Auth v1.5 — Mudancas Importantes

1. **Drizzle adapter e re-export**: usar `import { drizzleAdapter } from "better-auth/adapters/drizzle"` — funciona sem pacote extra
2. **CLI novo**: `npx @better-auth/cli` (ou `npx auth`) para gerar schemas e migrations
3. **Tipos removidos**: `InferUser` e `InferSession` foram removidos — usar `typeof auth.$Infer.Session`
4. **After-hooks**: executam pos-transaction (nao durante)
5. **`usePlural: true`** resolve o mapeamento singular→plural automaticamente (user→users, session→sessions)

### NOTA: Zod — Versao e Instalacao

Nesta story, Zod e usado **apenas** para schemas de validacao dos formularios de auth (`registerSchema`, `loginSchema`). O modulo `drizzle-orm/zod` **NAO e usado nesta story** — portanto nao ha restricao de versao por parte do Drizzle.

- Zod ja existe como dependencia transitiva no projeto, MAS nao esta no `package.json`
- **Acao**: instalar explicitamente como dependencia direta: `npm install zod` (ultima versao estavel)
- Better Auth nao tem restricao de versao do Zod
- Se no futuro `drizzle-orm/zod` for necessario e exigir v3, avaliar nesse momento

### NOTA: Next.js 16 — middleware.ts

O Next.js 16.1.6 ainda usa `middleware.ts` como nome do arquivo de middleware. O `project-context.md` menciona renomeacao para `proxy.ts`, mas na pratica o Next.js 16.1.6 continua aceitando `middleware.ts`. **Usar `src/middleware.ts`** como nome definitivo.

### ALERTA: Better Auth — Edge Runtime Limitation

O middleware do Next.js roda em Edge Runtime por padrao. Better Auth tem uma issue conhecida (#5120) com imports em Edge Runtime. Solucao:
- **No middleware**: verificar cookie diretamente por nome (`better-auth.session_token`) sem importar helpers do Better Auth
- **Nos Server Components**: usar `auth.api.getSession({ headers })` para validacao completa (Node.js runtime)
- **Nunca confiar apenas no middleware para seguranca** — middleware faz redirect otimista, Server Components fazem validacao real

### ALERTA: Schema Compatibility — Gaps a Resolver

O schema criado na Story 1.3 tem pequenos gaps com o que Better Auth 1.5.5 espera:
1. **`organizations` tabela**: falta coluna `updatedAt` — Better Auth pode esperar essa coluna
2. **Verificar via CLI**: rodar `npx @better-auth/cli generate` apos instalar para detectar todas as diferencas
3. **Criar migration** para qualquer coluna faltante antes de iniciar o fluxo de auth
4. **NAO alterar schemas existentes manualmente** — usar o CLI do Better Auth para gerar o diff exato

### ALERTA: Testes jsdom — localStorage Mock Necessario

Testes que usam environment `jsdom` (componentes React) precisam de mock de localStorage no Node.js 22+. Usar `vi.stubGlobal('localStorage', ...)` no setup do teste ou no `vitest.config.ts` (setup file). Referencia: Story 1.2 ja resolveu isso — verificar se o setup existente cobre os novos testes.

### ALERTA: React Hook Form — Instalacao Nesta Story

Se React Hook Form ainda nao esta no projeto:
- `npm install react-hook-form @hookform/resolvers`
- Usado para formularios de registro e login
- Integra com schemas Zod via `@hookform/resolvers/zod`
- Integra com shadcn/ui Input components

### ALERTA: Organization Auto-Create no Registro

Ao registrar um novo usuario, criar automaticamente uma Organization:
- Nome padrao: nome do usuario + "familia" (ex: "Familia Vitor")
- Slug: derivado do nome (kebab-case)
- O usuario criador recebe role "owner"
- Isso garante que o usuario ja tem um contexto multi-tenant desde o primeiro acesso
- A Organization sera usada como `tenant_id` para isolamento de dados via RLS

### Configuracao Exata do Better Auth

```typescript
// src/server/infrastructure/auth/config.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { db } from "@/server/infrastructure/database/client";
import * as schema from "@/server/infrastructure/database/schema";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
      organization: schema.organizations,
      member: schema.members,
      invitation: schema.invitations,
    },
  }),

  emailAndPassword: {
    enabled: true,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,   // 7 dias
    updateAge: 60 * 60 * 24,        // renova quando < 1 dia restante
  },

  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      creatorRole: "owner",
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
```

### Configuracao do Auth Client (Frontend)

```typescript
// src/client/utils/auth-client.ts
import { createAuthClient } from "better-auth/client";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [organizationClient()],
});
```

### API Route Handler

```typescript
// src/app/api/auth/[...all]/route.ts
import { auth } from "@/server/infrastructure/auth/config";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

### Middleware Pattern (Verificacao Otimista)

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Verificacao otimista — apenas cookie, sem DB
  const sessionCookie = request.cookies.get("better-auth.session_token");

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/(app)/:path*"],
};
```

### Helper de Sessao Server-Side

```typescript
// src/server/infrastructure/auth/get-session.ts
import { auth } from "./config";
import { headers } from "next/headers";

export async function getAuthSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}
```

### Estrutura de Arquivos a Criar

**Novos arquivos:**
- `src/server/infrastructure/auth/config.ts` — instancia Better Auth
- `src/server/infrastructure/auth/config.test.ts` — testes da config
- `src/server/infrastructure/auth/get-session.ts` — helper de sessao server-side
- `src/server/infrastructure/auth/get-session.test.ts` — testes do helper
- `src/app/api/auth/[...all]/route.ts` — API route handler do Better Auth
- `src/app/(auth)/layout.tsx` — layout minimalista para paginas de auth
- `src/app/(auth)/login/page.tsx` — pagina de login
- `src/app/(auth)/register/page.tsx` — pagina de registro
- `src/client/components/auth/RegisterForm.tsx` — formulario de registro
- `src/client/components/auth/RegisterForm.test.tsx` — testes do formulario
- `src/client/components/auth/LoginForm.tsx` — formulario de login
- `src/client/components/auth/LoginForm.test.tsx` — testes do formulario
- `src/client/utils/auth-client.ts` — Better Auth client para frontend
- `src/shared/schemas/auth.schema.ts` — schemas Zod para auth (register, login)
- `src/shared/schemas/auth.schema.test.ts` — testes dos schemas
- `src/middleware.ts` — middleware de protecao de rotas
- `src/middleware.test.ts` — testes do middleware

**Arquivos a modificar:**
- `package.json` — dependencias (better-auth, zod, react-hook-form, @hookform/resolvers)
- `.env.example` — BETTER_AUTH_SECRET, BETTER_AUTH_URL, NEXT_PUBLIC_APP_URL
- `src/app/(app)/layout.tsx` — adicionar validacao de sessao server-side
- `src/client/components/layout/Sidebar.tsx` — adicionar opcao de logout
- `src/client/components/layout/BottomNavigation.tsx` — adicionar opcao de logout (se aplicavel)
- `next.config.ts` — headers de seguranca (CSP, HSTS, X-Frame-Options)
- `src/server/infrastructure/database/schema/organizations.ts` — possivel adicao de `updatedAt` (se Better Auth CLI indicar)

**Arquivos que NAO devem ser modificados:**
- `src/app/globals.css` — design system intacto
- `src/client/components/ui/*` — componentes shadcn intactos
- `src/shared/types/result.ts` — intacto
- `vitest.config.ts` — intacto
- `tsconfig.json` — intacto
- `drizzle.config.ts` — intacto

### O Que NAO Fazer Nesta Story

- **NAO implementar** login social Google — vem na Story 1.5
- **NAO implementar** trilha de auditoria para acoes de auth — vem na Story 1.6
- **NAO implementar** rate limiting — vem na Story 1.6 ou 1.7
- **NAO implementar** verificacao de email obrigatoria — simplificar para MVP, email e confiavel
- **NAO implementar** recuperacao de senha (forgot password) — pode vir como melhoria futura
- **NAO criar** Server Actions customizados para auth — Better Auth gerencia tudo via API route
- **NAO modificar** tabelas de schema diretamente — usar CLI do Better Auth para diffs
- **NAO instalar** Playwright
- **NAO implementar** real-time ainda

### Project Structure Notes

- Auth config fica em `src/server/infrastructure/auth/config.ts`
- Auth client fica em `src/client/utils/auth-client.ts`
- Paginas de auth ficam em `src/app/(auth)/` (route group separado do app)
- Paginas protegidas ficam em `src/app/(app)/` (ja existe)
- Schemas Zod compartilhados ficam em `src/shared/schemas/`
- Middleware fica na raiz de `src/` (`middleware.ts`)
- API route handler fica em `src/app/api/auth/[...all]/route.ts`

### Inteligencia da Story Anterior (1.3)

**O que ja existe e DEVE ser preservado:**
- 8 tabelas de banco criadas: users, sessions, accounts, verifications, organizations, members, invitations, audit_logs
- RLS habilitado em todas as tabelas com policies base
- Drizzle ORM configurado com client em `src/server/infrastructure/database/client.ts`
- 72 testes passando (schema + client + componentes + utilidades)
- Supabase CLI funcionando com Docker local

**Aprendizados do code review da Story 1.3:**
- Migration ordering e critico — Supabase migrations vs Drizzle migrations precisam de ordem correta
- RLS policies usam `auth.uid()` (Supabase Auth) — NAO funcionais com Better Auth ate integracao JWT
- `updatedAt` com `defaultNow()` so seta valor no INSERT — avaliar `.$onUpdate()` ou trigger
- Unique constraint em `members(user_id, organization_id)` ja existe
- `dotenv` movido para devDependencies (so usado em drizzle.config.ts)

**NOTA sobre RLS e Better Auth:**
O Drizzle conecta ao PostgreSQL como superuser (`postgres`), que bypassa RLS. A segunda camada de autorizacao (middleware na aplicacao) sera implementada nesta story via middleware do Better Auth. As policies RLS protegem contra acesso direto via Supabase client (browser → Supabase Realtime). A integracao completa RLS ↔ Better Auth JWT pode ser necessaria em stories futuras quando Realtime for implementado.

### Git Intelligence

**Padroes de commit recentes:**
```
feat: add database infrastructure with Supabase and Drizzle ORM (Story 1.3)
fix: resolve code review R1 findings for Story 1.3
fix: resolve code review R2 findings for Story 1.3
chore: mark Story 1.3 as done after code review R3 approval
```

**Convencao a seguir:**
- `feat:` para implementacao principal
- `fix:` para correcoes de code review
- `chore:` para atualizacoes de status

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#OWASP Top 10]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.4: Registro e Login com Email/Senha]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Onboarding]
- [Source: _bmad-output/planning-artifacts/proto-01-login.html]
- [Source: _bmad-output/planning-artifacts/proto-02-signup.html]
- [Source: _bmad-output/project-context.md#Technology Stack & Versions]
- [Source: _bmad-output/project-context.md#Framework Rules]
- [Source: _bmad-output/implementation-artifacts/1-3-banco-de-dados-e-supabase-local.md#Dev Notes]
- [Source: Better Auth docs — https://better-auth.com/docs/integrations/next]
- [Source: Better Auth Drizzle adapter — https://better-auth.com/docs/adapters/drizzle]
- [Source: Better Auth Organizations — https://better-auth.com/docs/plugins/organization]
- [Source: Better Auth session management — https://better-auth.com/docs/concepts/session-management]
- [Source: Better Auth v1.5 changelog — https://better-auth.com/blog/1-5]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Better Auth CLI `generate` confirmed schema compatibility — no missing columns (organizations.updatedAt not required)
- Auth config test required 15s timeout when running in full suite (Better Auth initialization overhead)
- @testing-library/user-event needed separate install (not included in @testing-library/react)
- Next.js 16 warns about middleware.ts → proxy.ts rename, but both work. Used middleware.ts per story spec.

### Completion Notes List

- Better Auth 1.5.5 configured with Drizzle adapter, email/password auth, and Organizations plugin
- Auth client (frontend) with organizationClient plugin
- API route handler at /api/auth/[...all]/route.ts
- Register page with password strength indicator, requirements checklist, and auto Organization creation
- Login page with logo, Google button (disabled, reserved for Story 1.5), divider
- Logout added to both Sidebar and BottomNavigation components
- Middleware with optimistic cookie check for protected routes
- Server-side session validation in app layout via getAuthSession() helper
- Security headers configured in next.config.ts (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- Zod schemas for register (with password requirements) and login validation
- All 115 tests pass (43 new tests added)
- Build compiles successfully
- Lint passes (0 errors, 1 warning about RHF watch() + React Compiler)
- ✅ Resolved review finding [HIGH]: Organization.create error handling — verifica retorno, exibe erro, nao redireciona se falhar
- ✅ Resolved review finding [HIGH]: Middleware matcher corrigido — exclusion pattern com PUBLIC_PATHS para /login, /register, /api/auth
- ✅ Resolved review finding [HIGH]: Testes de logout adicionados em Sidebar.test.tsx e BottomNavigation.test.tsx
- ✅ Resolved review finding [MEDIUM]: unsafe-eval removido do CSP em producao, mantido apenas em dev (Turbopack)

### Change Log

- 2026-03-17: Implemented Story 1.4 — Registration and Login with Email/Password
- 2026-03-18: Code Review R1 — 3 HIGH, 1 MEDIUM, 2 LOW findings. 4 action items criados (3 HIGH + 1 MEDIUM). LOWs aceitos como backlog.
- 2026-03-18: Addressed code review R1 findings — 4 items resolved (3 HIGH + 1 MEDIUM)

### File List

**New files:**
- src/server/infrastructure/auth/config.ts
- src/server/infrastructure/auth/config.test.ts
- src/server/infrastructure/auth/get-session.ts
- src/server/infrastructure/auth/get-session.test.ts
- src/app/api/auth/[...all]/route.ts
- src/app/(auth)/layout.tsx
- src/app/(auth)/login/page.tsx
- src/app/(auth)/register/page.tsx
- src/client/components/auth/RegisterForm.tsx
- src/client/components/auth/RegisterForm.test.tsx
- src/client/components/auth/LoginForm.tsx
- src/client/components/auth/LoginForm.test.tsx
- src/client/utils/auth-client.ts
- src/shared/schemas/auth.schema.ts
- src/shared/schemas/auth.schema.test.ts
- src/middleware.ts
- src/middleware.test.ts

**Modified files:**
- package.json (added better-auth, zod, react-hook-form, @hookform/resolvers, @testing-library/user-event)
- package-lock.json
- .env.example (added NEXT_PUBLIC_APP_URL)
- .env.local (added Better Auth env vars)
- next.config.ts (security headers)
- src/app/(app)/layout.tsx (server-side session validation)
- src/client/components/layout/Sidebar.tsx (logout button)
- src/client/components/layout/Sidebar.test.tsx (authClient mock)
- src/client/components/layout/BottomNavigation.tsx (logout button)
- src/client/components/layout/BottomNavigation.test.tsx (authClient mock)
- _bmad-output/implementation-artifacts/sprint-status.yaml (status: in-progress → review)
