# Story 1.12: Login com Google em staging e produção

Status: ready-for-dev

<!-- Criada no code review das Stories 1.9–1.11 (2026-11-15). A Story 1.5 implementou o código do login com Google; faltou configurar as credenciais nos ambientes remotos. Era a Task 5.3 da Story 1.9. -->

## Story

As a usuário do Caderninho em staging ou produção,
I want entrar com a minha conta Google,
so that não preciso criar nem lembrar uma senha separada.

## Acceptance Criteria

1. **Given** um ambiente sem credenciais do Google (`GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` ausentes) **When** as telas de login e registro carregam **Then** o botão "Entrar com Google" não aparece, e o provedor Google não é registrado no Better Auth (hoje o botão aparece e falha ao clicar).
2. **Given** um ambiente com as credenciais **When** as telas carregam **Then** o botão aparece e funciona como na Story 1.5.
3. **Given** staging (`caderninho-staging.vercel.app`) configurado **When** o usuário clica em "Entrar com Google" e autoriza **Then** volta autenticado (cookie `__Secure-`, Story 1.9) e cai em `/onboarding` (conta nova) ou `/dashboard` (conta existente).
4. **Given** um usuário que já tem conta com e-mail e senha **When** entra com o Google usando o mesmo e-mail **Then** as contas são vinculadas (account linking da Story 1.5) e ele vê os mesmos dados.
5. **Given** produção configurada **When** a release do Epic 3 for para `main` **Then** o mesmo fluxo (AC 3 e 4) é validado em produção.
6. **Given** o usuário cancela no Google **When** volta ao app **Then** vê "Login com Google cancelado. Tente novamente." (comportamento da Story 1.5, validado no ambiente remoto).
7. **Given** a story está completa **When** a validação roda **Then** TDD para o AC 1, `npx tsc --noEmit` 0 erros, `npx eslint src --max-warnings=0` 0 warnings, `npx vitest run` 100% passando, `npx next build` limpo.

## Tasks / Subtasks

- [ ] Task 1 (AC: #1, #2, #7): botão e provedor condicionais (TDD)
  - [ ] 1.1 Teste vermelho: com `GOOGLE_CLIENT_ID` ausente, `LoginForm` e `RegisterForm` não exibem "Entrar com Google"; com a variável presente, exibem
  - [ ] 1.2 Teste vermelho: `auth/config.ts` só registra `socialProviders.google` quando as duas variáveis existem
  - [ ] 1.3 Implementar: as páginas de login/registro (Server Components) leem se o Google está configurado e passam uma prop `googleEnabled` aos formulários; nada de `NEXT_PUBLIC_` com segredo
- [ ] Task 2 (AC: #3): Google Cloud — **feito pelo usuário com guia passo a passo**
  - [ ] 2.1 Projeto no Google Cloud Console + tela de consentimento OAuth (tipo "Externo", modo "Testing", e-mails do Vitor e da Tamires como test users)
  - [ ] 2.2 Cliente OAuth "Web application" **de staging** — origem `https://caderninho-staging.vercel.app`, redirect `https://caderninho-staging.vercel.app/api/auth/callback/google`
  - [ ] 2.3 Cliente OAuth "Web application" **de produção** — origem e redirect com o domínio de produção
  - [ ] 2.4 (Opcional) cliente de desenvolvimento — `http://localhost:3000/api/auth/callback/google` — no `.env.local`
- [ ] Task 3 (AC: #3, #5): Vercel — variáveis por ambiente
  - [ ] 3.1 `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` de staging no escopo **Preview (branch `staging`)**
  - [ ] 3.2 Os de produção no escopo **Production**
  - [ ] 3.3 Conferir que `BETTER_AUTH_URL` de cada ambiente é exatamente a origem cadastrada no Google
- [ ] Task 4 (AC: #3, #4, #6): validar em staging depois do deploy
  - [ ] 4.1 Conta nova pelo Google → `/onboarding`
  - [ ] 4.2 Conta existente (e-mail/senha) com o mesmo e-mail → mesmos dados
  - [ ] 4.3 Cancelar no Google → mensagem de cancelamento
- [ ] Task 5 (AC: #5): validar em produção na release do Epic 3

## Dev Notes

- O código do OAuth já existe (Story 1.5): `src/server/infrastructure/auth/config.ts` (`socialProviders.google`, `accountLinking`), `LoginForm.tsx`, `RegisterForm.tsx`.
- Hoje `clientId: process.env.GOOGLE_CLIENT_ID as string` registra o provedor mesmo sem credenciais, e o botão aparece em staging/produção sem funcionar.
- Um cliente OAuth por ambiente isola os segredos (vazou o de staging, produção continua segura) e evita misturar redirects.
- Enquanto a tela de consentimento estiver em "Testing", só os test users conseguem entrar. Publicar o app só faz sentido no lançamento.
- Guia existente: `docs/deploy-producao.md` seção "3. Google Cloud — OAuth" (atualizar para os dois ambientes).
- Fluxo de entrega: branch a partir de `staging` → PR para `staging` → validação → release com o Epic 3.

### References

- [Source: _bmad-output/implementation-artifacts/1-5-login-social-google.md]
- [Source: _bmad-output/implementation-artifacts/1-9-hotfix-cookie-sessao-https-no-proxy.md] (Task 5.3 movida para esta story)
- [Source: docs/deploy-producao.md#3-google-cloud--oauth-login-com-google]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

- 2026-11-15 (code review 1.9–1.11): story criada; a configuração do Google saiu da Task 5.3 da Story 1.9.

### File List
