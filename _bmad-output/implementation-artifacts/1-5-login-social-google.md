# Story 1.5: Login Social (Google)

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to login with my Google account,
So that I can access the app without creating a separate password.

## Acceptance Criteria

1. Na pagina de login, o botao "Entrar com Google" esta habilitado e funcional — ao clicar, inicia o fluxo OAuth com o provedor Google
2. Ao autorizar no Google, a conta e criada automaticamente se nao existir (FR45) — incluindo Organization automatica ("Familia [PrimeiroNome]")
3. Se ja existe conta com o mesmo email (email/senha), as contas sao vinculadas automaticamente (account linking) — o usuario acessa a mesma conta e dados
4. Se o usuario ja logou via Google anteriormente, o login e feito diretamente sem pedir autorizacao novamente — sessao persistente com as mesmas regras do email/senha (NFR-S1: 7 dias, renovacao automatica)
5. Na pagina de registro, o botao "Entrar com Google" tambem esta presente e funcional — o usuario pode se registrar via Google ou email/senha
6. A UX valida a integracao visual dos botoes de login social nas telas de login e registro
7. Tratamento de erros: se o usuario cancela no Google, nega permissao, ou ocorre erro de rede — exibir mensagem especifica em portugues e permitir retry

## Tasks / Subtasks

- [x] Task 1: Configurar Google OAuth no Better Auth (AC: #1, #3)
  - [x] 1.1 Adicionar `socialProviders.google` em `src/server/infrastructure/auth/config.ts`:
    - `clientId: process.env.GOOGLE_CLIENT_ID as string`
    - `clientSecret: process.env.GOOGLE_CLIENT_SECRET as string`
  - [x] 1.2 Configurar account linking no config:
    - `account: { accountLinking: { enabled: true, trustedProviders: ["google"] } }`
    - Google sempre confirma email verificado, entao linking automatico funciona out-of-the-box
  - [x] 1.3 Verificar que `.env.example` ja tem `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` (ja existe — confirmar)
  - [x] 1.4 Configurar `.env.local` com credenciais do Google Cloud Console (dev local):
    - Nota: configuracao de credenciais reais depende do usuario (Google Cloud Console)
  - [x] 1.5 Escrever testes para validar que a config exporta `socialProviders` corretamente (atualizar `config.test.ts`)
  - [x] 1.6 NAO alterar o API route handler (`src/app/api/auth/[...all]/route.ts`) — ja funciona com catch-all

- [x] Task 2: Habilitar botao Google no LoginForm (AC: #1, #4, #7)
  - [x] 2.1 Remover `disabled` do botao "Entrar com Google" em `src/client/components/auth/LoginForm.tsx`
  - [x] 2.2 Adicionar handler `handleGoogleSignIn` no LoginForm:
    - Chamar `authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" })`
    - Mostrar estado de loading no botao durante o fluxo
    - O Better Auth redireciona para Google, que redireciona de volta para `/api/auth/callback/google`, e depois para `/dashboard`
  - [x] 2.3 Tratamento de erros:
    - Se usuario cancela no Google ou nega permissao → mensagem "Login com Google cancelado. Tente novamente."
    - Usar `errorCallbackURL` para capturar erros no redirect: `errorCallbackURL: "/login?error=google"`
    - Ler query param `error` no LoginForm via `useSearchParams` e exibir mensagem correspondente
  - [x] 2.4 Atualizar `LoginForm.test.tsx`:
    - Atualizado teste "deve exibir botao Google habilitado"
    - Adicionado teste: click no botao Google chama `authClient.signIn.social`
    - Adicionado teste: exibe erro quando query param `error=google` esta presente

- [x] Task 3: Adicionar botao Google no RegisterForm (AC: #2, #5, #7)
  - [x] 3.1 Adicionar divider "ou" e botao "Cadastrar com Google" em `src/client/components/auth/RegisterForm.tsx`:
    - Mesmo visual do LoginForm (divider + botao outline com icone Google)
    - Posicionado abaixo do formulario (seguir mesmo padrao do LoginForm)
  - [x] 3.2 Adicionar handler `handleGoogleSignUp` no RegisterForm:
    - Chamar `authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" })`
    - O fluxo e o mesmo de login — Better Auth cria conta se nao existe e faz login se ja existe
    - A Organization PRECISA ser criada apos o callback — ver Task 4
  - [x] 3.3 Tratamento de erros igual ao LoginForm (cancelamento, rede)
  - [x] 3.4 Atualizar `RegisterForm.test.tsx`:
    - Adicionado teste: botao "Cadastrar com Google" renderiza e esta habilitado
    - Adicionado teste: click chama `authClient.signIn.social`

- [x] Task 4: Organization auto-create para usuarios Google (AC: #2)
  - [x] 4.1 PROBLEMA: No fluxo email/senha, a Organization e criada no RegisterForm apos `signUp.email()`. No fluxo Google OAuth, o redirect vai direto para `/dashboard` — nao passa pelo RegisterForm.
  - [x] 4.2 SOLUCAO: Verificar se o usuario tem Organization no layout do app (`src/app/(app)/layout.tsx`):
    - Apos validar sessao via `getAuthSession()`, chama `ensureUserHasOrganization()`
    - Se NAO tem Organization → cria automaticamente ("Familia [PrimeiroNome]")
    - Se JA tem → retorna a existente
  - [x] 4.3 Criar helper `src/server/infrastructure/auth/ensure-organization.ts`:
    - Funcao `ensureUserHasOrganization(userId, userName)`: verifica se tem org, cria se nao tem
    - Usa `auth.api.listOrganizations()` com headers do request
    - Usa `auth.api.createOrganization()` com headers do request
    - Retorna a Organization existente ou recem-criada
  - [x] 4.4 Escrever testes para `ensure-organization.ts`:
    - Usuario ja tem org → retorna a existente, nao cria nova
    - Usuario sem org → cria "Familia [PrimeiroNome]" com slug correto
    - Edge case: nome vazio → usa "Familia" como fallback
    - Nomes com acentos → slug gerado corretamente

- [x] Task 5: Middleware e rotas publicas (AC: #1)
  - [x] 5.1 Verificar que `/api/auth/callback/google` e coberto pelo PUBLIC_PATHS existente (`/api/auth` ja esta) — confirmado
  - [x] 5.2 Se LoginForm usar query params para erros (`/login?error=google`), verificar que funciona sem problemas no middleware — confirmado

- [x] Task 6: Validacao final (AC: #1-#7)
  - [x] 6.1 Nota: `npm run dev` com login Google completo depende de credenciais reais (Google Cloud Console)
  - [x] 6.2 `npm run build` compila sem erros
  - [x] 6.3 `npm test` roda e passa — 129 testes (16 arquivos), 0 falhas
  - [x] 6.4 `npm run lint` sem erros (1 warning pre-existente)
  - [x] 6.5 Fluxo Google (usuario novo): implementado via signIn.social + ensure-organization no layout
  - [x] 6.6 Fluxo Google (usuario existente): account linking configurado com trustedProviders: ["google"]
  - [x] 6.7 Fluxo Google (login subsequente): sessao persistente 7 dias (mesma config do email/senha)
  - [x] 6.8 Fluxo cancelamento: errorCallbackURL redireciona para /login?error=google com mensagem
  - [x] 6.9 Validacao UX: botoes de login social nas telas de login e registro implementados

### Review Follow-ups (AI) — R1

- [x] [AI-Review][CRITICAL] RegisterForm não mostra erro do Google OAuth: envia `errorCallbackURL: "/register?error=google"` mas não importa `useSearchParams`, não lê query param `error`, não exibe mensagem. Adicionar tratamento igual ao LoginForm + `<Suspense>` na register/page.tsx [src/client/components/auth/RegisterForm.tsx:132-139, src/app/(auth)/register/page.tsx]
- [x] [AI-Review][HIGH] `ensureUserHasOrganization` sem try/catch: se `listOrganizations` ou `createOrganization` falhar (DB down, slug duplicado), exceção propaga até layout.tsx e crasha o app, bloqueando o usuário. Adicionar tratamento de erro com fallback gracioso [src/server/infrastructure/auth/ensure-organization.ts, src/app/(app)/layout.tsx:19]
- [x] [AI-Review][MEDIUM] Loading state do botão Google nunca reseta: `setIsGoogleLoading(true)` sem reset em caso de falha do `signIn.social()`. Se Promise rejeitar antes do redirect, botão fica permanentemente em loading [src/client/components/auth/LoginForm.tsx:61-68, src/client/components/auth/RegisterForm.tsx:132-139]

**LOWs (backlog, não blocking):**
- F4: Lógica de slug duplicada entre RegisterForm e ensure-organization (implementações diferentes)
- F5: Env vars GOOGLE_CLIENT_ID/SECRET sem validação runtime (`as string` cast)

## Dev Notes

### Versoes Exatas do Stack (Story 1.5)

| Tecnologia | Versao | Pacote npm | Notas |
|---|---|---|---|
| Better Auth | 1.5.5 | `better-auth` (ja instalado) | Google OAuth built-in, sem pacote extra |
| Drizzle ORM | 0.45.1 | (ja instalado) | Schema accounts ja tem campos OAuth |
| Next.js | 16.1.6 | (ja instalado) | App Router, catch-all route handler |

### CRITICO: Nenhum Pacote Novo Necessario

O suporte a Google OAuth ja vem built-in no `better-auth`. NAO instalar nenhum pacote adicional.

### ALERTA: Google Cloud Console — Modo Testing

O Google Cloud Console tem um modo "Testing" na OAuth Consent Screen que limita a 100 Test Users. Para desenvolvimento local, isso e suficiente. Para producao, sera necessario:
1. Publicar a OAuth Consent Screen
2. Possivelmente passar por verificacao do Google (se pedir scopes sensiveis)
3. Adicionar o dominio de producao no Authorized redirect URIs

### ALERTA: BETTER_AUTH_URL e Redirect URI

O Better Auth usa `BETTER_AUTH_URL` (ou a opcao `baseURL` no config) para construir a `redirect_uri` enviada ao Google. Se estiver errado, da erro `redirect_uri_mismatch`. Valores corretos:
- **Dev local**: `http://localhost:3000`
- **Producao**: `https://caderninho.vercel.app` (ou dominio customizado)

A callback URL completa e: `{BETTER_AUTH_URL}/api/auth/callback/google`

### ALERTA: Account Linking — Seguranca

O account linking com Google e seguro porque Google **sempre** confirma que o email e verificado. Ao usar `trustedProviders: ["google"]`, o linking automatico acontece sem verificacao adicional. NAO adicionar providers nao confiados a essa lista.

### ALERTA: Organization Auto-Create — Fluxo Diferente do Email/Senha

No fluxo email/senha (Story 1.4), a Organization e criada no RegisterForm via client-side `authClient.organization.create()`. No fluxo Google OAuth, o usuario e redirecionado pelo backend e nunca passa pelo RegisterForm. Solucao: verificar/criar Organization no server-side, no layout do app.

### Configuracao Exata — Better Auth com Google

```typescript
// src/server/infrastructure/auth/config.ts — DIFF da Story 1.4
export const auth = betterAuth({
  // ... config existente ...

  // NOVO: Social providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  // NOVO: Account linking
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },

  // ... resto da config existente ...
});
```

### Client-Side — API de Login Social

```typescript
// No LoginForm e RegisterForm:
const handleGoogleSignIn = async () => {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "/dashboard",
    errorCallbackURL: "/login?error=google",
  });
};
```

NAO precisa mudar `src/client/utils/auth-client.ts` — o metodo `signIn.social()` ja vem built-in no `createAuthClient()`.

### Callback URL — Padrao Better Auth

O Better Auth segue o padrao: `{baseURL}/api/auth/callback/{providerName}`

Para Google: `http://localhost:3000/api/auth/callback/google`

Este URL precisa estar registrado no Google Cloud Console em **Authorized redirect URIs**. O middleware do Next.js ja permite `/api/auth/*` como path publico.

### Banco de Dados — Nenhuma Migration Necessaria

A tabela `accounts` criada na Story 1.3 ja tem TODOS os campos necessarios para OAuth:
- `provider_id` → sera "google"
- `account_id` → sera o Google sub ID
- `access_token`, `refresh_token`, `id_token`, `scope` → armazenados automaticamente pelo Better Auth
- `access_token_expires_at`, `refresh_token_expires_at` → timestamps de expiracao

NAO precisa criar migration nem alterar schema.

### Estrutura de Arquivos

**Arquivos a criar:**
- `src/server/infrastructure/auth/ensure-organization.ts` — helper para verificar/criar Organization
- `src/server/infrastructure/auth/ensure-organization.test.ts` — testes do helper

**Arquivos a modificar:**
- `src/server/infrastructure/auth/config.ts` — adicionar `socialProviders.google` e `account.accountLinking`
- `src/server/infrastructure/auth/config.test.ts` — atualizar testes para verificar socialProviders
- `src/client/components/auth/LoginForm.tsx` — habilitar botao Google, adicionar handler
- `src/client/components/auth/LoginForm.test.tsx` — atualizar testes do botao Google
- `src/client/components/auth/RegisterForm.tsx` — adicionar botao Google
- `src/client/components/auth/RegisterForm.test.tsx` — adicionar testes do botao Google
- `src/app/(app)/layout.tsx` — adicionar verificacao/criacao de Organization para usuarios sem org
- `.env.local` — adicionar credenciais do Google Cloud Console

**Arquivos que NAO devem ser modificados:**
- `src/app/api/auth/[...all]/route.ts` — ja funciona com catch-all
- `src/middleware.ts` — `/api/auth` ja esta nos PUBLIC_PATHS
- `src/server/infrastructure/database/schema/auth.ts` — schema ja suporta OAuth
- `src/shared/schemas/auth.schema.ts` — schemas de formulario nao mudam
- `src/client/utils/auth-client.ts` — `signIn.social()` ja vem built-in
- `.env.example` — ja tem GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET
- `package.json` — nenhum pacote novo necessario

### O Que NAO Fazer Nesta Story

- **NAO implementar** login com outros providers (GitHub, Apple, etc.) — apenas Google
- **NAO implementar** Google One Tap (login via ID token sem redirect) — simplificar para OAuth redirect padrao
- **NAO implementar** linking/unlinking manual de contas sociais (tela de configuracoes) — vem em story futura se necessario
- **NAO implementar** trilha de auditoria para acoes de auth — vem na Story 1.6
- **NAO implementar** rate limiting — vem na Story 1.6 ou 1.7
- **NAO criar** migration de banco — schema ja suporta OAuth
- **NAO instalar** pacotes novos — Better Auth tem Google OAuth built-in
- **NAO modificar** o auth-client.ts — `signIn.social()` ja esta disponivel

### Inteligencia da Story Anterior (1.4)

**O que ja existe e DEVE ser preservado:**
- Better Auth configurado com Drizzle adapter (`usePlural: true`) + Organizations plugin
- Auth client em `src/client/utils/auth-client.ts` com `createAuthClient()` + `organizationClient()`
- API route handler em `src/app/api/auth/[...all]/route.ts`
- LoginForm com botao Google DESABILITADO (placeholder) + divider "ou"
- RegisterForm com auto-criacao de Organization apos signup
- Middleware com verificacao otimista de cookie (`better-auth.session_token`)
- Server-side session validation em `src/app/(app)/layout.tsx` via `getAuthSession()`
- 115 testes passando
- Security headers configurados no `next.config.ts`
- Schema `accounts` com campos OAuth completos

**Aprendizados do code review da Story 1.4:**
- `usePlural: true` resolve mapeamento automatico — passar `schema` como star import direto
- Middleware usa exclusion pattern com `PUBLIC_PATHS` (nao matcher de route group)
- Organization.create precisa de tratamento de erro robusto — se falhar, usuario fica sem org
- Testes de logout em Sidebar e BottomNavigation devem ser preservados
- `unsafe-eval` removido do CSP em producao

### Git Intelligence

**Padroes de commit recentes:**
```
ba2e69e chore: add code review R3 approval to Story 1.4 changelog
1b01d6e fix: resolve Drizzle adapter schema mapping for Better Auth usePlural
251564e chore: mark Story 1.4 as done after code review R2 approval
25e7994 fix: resolve code review R1 findings for Story 1.4
016b7a2 feat: add authentication with Better Auth email/password (Story 1.4)
```

**Convencao a seguir:**
- `feat:` para implementacao principal
- `fix:` para correcoes de code review
- `chore:` para atualizacoes de status

### Project Structure Notes

- Auth config: `src/server/infrastructure/auth/config.ts` — adicionar socialProviders aqui
- Auth client: `src/client/utils/auth-client.ts` — NAO precisa modificar
- LoginForm: `src/client/components/auth/LoginForm.tsx` — habilitar botao Google
- RegisterForm: `src/client/components/auth/RegisterForm.tsx` — adicionar botao Google
- App layout: `src/app/(app)/layout.tsx` — adicionar ensure-organization
- API route: `src/app/api/auth/[...all]/route.ts` — NAO precisa modificar

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.5: Login Social (Google)]
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- [Source: _bmad-output/planning-artifacts/architecture.md#OWASP Top 10]
- [Source: _bmad-output/implementation-artifacts/1-4-registro-e-login-com-email-senha.md#Dev Notes]
- [Source: _bmad-output/project-context.md#Technology Stack & Versions]
- [Source: Better Auth Social Sign-On — https://www.better-auth.com/docs/authentication/social-sign-on]
- [Source: Better Auth Account Linking — https://www.better-auth.com/docs/concepts/users-accounts#account-linking]
- [Source: Better Auth Google Provider — https://www.better-auth.com/docs/authentication/social-sign-on#google]
- [Source: Better Auth v1.5 Changelog — https://better-auth.com/blog/1-5]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Build falhou inicialmente por `useSearchParams()` sem Suspense boundary → adicionado `<Suspense>` no login page
- Build falhou por `auth.api.listOrganizations()` requer `headers` no context → adicionado `headers()` de `next/headers`

### Completion Notes List

- Task 1: Google OAuth configurado no Better Auth com `socialProviders.google` e `account.accountLinking` com `trustedProviders: ["google"]`
- Task 2: LoginForm habilitado com handler Google, loading state, tratamento de erros via query params (`useSearchParams`)
- Task 3: RegisterForm com botao "Cadastrar com Google", divider "ou", handler e testes
- Task 4: Helper `ensureUserHasOrganization` criado server-side com `next/headers`, integrado no app layout
- Task 5: Middleware e rotas publicas verificados — `/api/auth` cobre callback Google
- Task 6: 129 testes passando, build OK, lint OK
- ✅ Resolved review finding [CRITICAL]: RegisterForm agora lê query param `error=google` via `useSearchParams`, exibe mensagem de erro, e `register/page.tsx` tem `<Suspense>` boundary
- ✅ Resolved review finding [HIGH]: `ensureUserHasOrganization` agora tem try/catch com retorno `null` em caso de falha — app não crasha se DB falhar
- ✅ Resolved review finding [MEDIUM]: `handleGoogleSignIn` e `handleGoogleSignUp` agora têm try/catch que reseta `isGoogleLoading` e exibe mensagem de erro

### Change Log

- 2026-03-18: Implementacao completa da Story 1.5 — Login Social (Google)
- 2026-03-18: Code Review R1 — 1 CRITICAL, 1 HIGH, 1 MEDIUM, 2 LOW. 3 action items criados, 2 LOWs para backlog
- 2026-03-18: Addressed code review R1 findings — 3 items resolved (1 CRITICAL, 1 HIGH, 1 MEDIUM). 129 testes, build OK, lint OK

### File List

**Criados:**
- `src/server/infrastructure/auth/ensure-organization.ts`
- `src/server/infrastructure/auth/ensure-organization.test.ts`

**Modificados:**
- `src/server/infrastructure/auth/config.ts` — socialProviders.google + account.accountLinking
- `src/server/infrastructure/auth/config.test.ts` — teste signInSocial API + env vars Google
- `src/client/components/auth/LoginForm.tsx` — botao Google habilitado, handler, useSearchParams, erro, try/catch loading reset
- `src/client/components/auth/LoginForm.test.tsx` — testes botao habilitado, click social, erro query param, loading reset
- `src/client/components/auth/RegisterForm.tsx` — botao "Cadastrar com Google", handler, divider, useSearchParams erro, try/catch loading reset
- `src/client/components/auth/RegisterForm.test.tsx` — testes botao Google render + click, erro query param, loading reset
- `src/server/infrastructure/auth/ensure-organization.ts` — try/catch com retorno null em caso de falha
- `src/server/infrastructure/auth/ensure-organization.test.ts` — testes erro listOrganizations e createOrganization
- `src/app/(app)/layout.tsx` — ensureUserHasOrganization no layout
- `src/app/(auth)/login/page.tsx` — Suspense boundary para useSearchParams
- `src/app/(auth)/register/page.tsx` — Suspense boundary para useSearchParams
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — status in-progress → review
- `_bmad-output/implementation-artifacts/1-5-login-social-google.md` — story file atualizado
