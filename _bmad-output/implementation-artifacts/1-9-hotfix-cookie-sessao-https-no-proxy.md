# Story 1.9: Hotfix — proxy não reconhece cookie de sessão `__Secure-` em HTTPS

Status: done

<!-- Hotfix pós-Epic 1 (autenticação). Bug em staging e produção. Entrega isolada: branch de correção → PR para staging → validação → PR staging → main. -->

## Story

As a usuário que faz login com e-mail e senha em staging ou produção,
I want ser levado ao `/dashboard` depois de autenticar,
so that consigo usar o app em vez de voltar sempre para `/login`.

## Acceptance Criteria

1. **Given** um usuário em HTTPS (staging/produção) faz login com e-mail e senha **When** o Better Auth grava o cookie com prefixo seguro `__Secure-better-auth.session_token` e o navegador segue para `/dashboard` **Then** o `src/proxy.ts` reconhece a sessão e deixa a requisição seguir (`NextResponse.next()`), sem redirecionar para `/login`.

2. **Given** um usuário em desenvolvimento local (HTTP) **When** o cookie é `better-auth.session_token` (sem prefixo) **Then** o comportamento continua igual: acesso permitido.

3. **Given** uma requisição a uma rota protegida sem nenhum cookie de sessão **When** passa pelo proxy **Then** continua sendo redirecionada para `/login`. As rotas públicas (`/login`, `/register`, `/api/auth`) continuam liberadas.

4. **Given** a correção segue TDD **When** a story é implementada **Then** um teste em `src/proxy.test.ts` com o cookie `__Secure-better-auth.session_token` foi escrito **antes** da correção e falhou (saída registrada no Debug Log) **And** depois da correção ele passa junto com todos os testes existentes do proxy.

5. **Given** o fluxo de branches da arquitetura **When** a correção é entregue **Then** foi feita numa branch de correção → PR para `staging` → login validado em `caderninho-staging.vercel.app` → PR de `staging` para `main` → login validado em produção.

6. **Given** a story está completa **When** a validação roda **Then** `npx tsc --noEmit` 0 erros, `npx eslint src --max-warnings=0` 0 warnings, `npx vitest run` 100% passando, `npx next build` limpo.

## Tasks / Subtasks

<!-- Sem UI: Fase 0 de Design System não se aplica. -->

- [x] Task 1: Branch
  - [x] 1.1: `git checkout staging && git pull && git checkout -b fix/proxy-secure-session-cookie`

- [x] Task 2 (AC: #1, #4): Teste vermelho
  - [x] 2.1: Em `src/proxy.test.ts`, adicionar:
    - `it("deve permitir acesso quando cookie de sessao tem prefixo __Secure- (HTTPS)")`: `createRequest("/dashboard", { "__Secure-better-auth.session_token": "valid-token-123" })` → espera `NextResponse.next` chamado e `NextResponse.redirect` não chamado (mesmo estilo do teste da linha 45)
    - Caso equivalente para `/checklist` com o cookie seguro (espelha o teste da linha 104)
  - [x] 2.2: `npx vitest run src/proxy.test.ts` → **confirmar que os testes novos falham** (redirect para `/login`). Colar a saída no Debug Log. Não seguir para a Task 3 sem esse vermelho.

- [x] Task 3 (AC: #1, #2, #3): Correção
  - [x] 3.1: Em `src/proxy.ts`, adicionar `import { getSessionCookie } from "better-auth/cookies";`
  - [x] 3.2: Trocar a linha 56, `const sessionCookie = request.cookies.get("better-auth.session_token");`, por `const sessionCookie = getSessionCookie(request);`. Manter o comentário de verificação otimista (só cookie, sem DB; a validação real acontece nos Server Components via `auth.api.getSession()`).
  - [x] 3.3: Não mexer em `PUBLIC_PATHS`, no rate limit nem no logging.

- [x] Task 4 (AC: #2, #3, #4, #6): Verde + regressão
  - [x] 4.1: `npx vitest run src/proxy.test.ts` → testes novos e os 7 existentes passam
  - [x] 4.2: Se algum teste existente quebrar: `getSessionCookie` lê o **header** `cookie`, não `request.cookies`. O helper `createRequest` usa `request.cookies.set`, que no `NextRequest` também atualiza o header. Se não estiver atualizando, ajustar o helper para montar o header `cookie`, **sem** enfraquecer as asserções.
  - [x] 4.3: `npx tsc --noEmit`, `npx eslint src --max-warnings=0`, `npx vitest run`, `npx next build`

- [x] Task 5 (AC: #5): Entrega
  - [x] 5.1: Commit `fix: reconhece cookie de sessão __Secure- no proxy` → push → PR para `staging`
  - [x] 5.2: Depois do deploy em `caderninho-staging.vercel.app`: login com e-mail e senha → chega em `/dashboard`; navegar para `/transactions` e `/checklist`; abrir uma aba anônima e acessar `/dashboard` → redireciona para `/login`; logout → rotas protegidas voltam a redirecionar
  - [x] 5.3: ~~Login Google em staging~~ → movida para a **Story 1.12** (o Google OAuth nunca foi configurado em staging/produção; não depende do código desta story)
  - [x] 5.4: PR de `staging` para `main` → depois do deploy, repetir 5.2 em produção

## Dev Notes

### Causa raiz (confirmada no código)

- Em HTTPS, o Better Auth grava o cookie de sessão com o prefixo seguro: `__Secure-better-auth.session_token`.
- `src/proxy.ts:56` procura só `"better-auth.session_token"` → em staging/produção nunca acha o cookie → redirect para `/login`.
- Em dev (HTTP) não há prefixo, por isso o bug só aparece fora do ambiente local.
- Evidência: a sessão é criada na tabela `sessions` e o cookie fica no navegador. DevTools mostra `POST /api/auth/sign-in/email` → `GET /dashboard` → redirect para `/login`.

### Por que `getSessionCookie`

Implementação instalada (`node_modules/better-auth/dist/cookies/index.mjs:170`):
```js
const getCookie = (name) => parsedCookie.get(name) || parsedCookie.get(`${SECURE_COOKIE_PREFIX}${name}`);
const sessionToken = getCookie(`${cookiePrefix}.${cookieName}`) || getCookie(`${cookiePrefix}-${cookieName}`);
```
- Reconhece o nome com e sem `__Secure-` (e a variante com `-`).
- Defaults `cookiePrefix = "better-auth"`, `cookieName = "session_token"`. O projeto **não** customiza esses valores (nenhum `cookiePrefix`/`advanced` em `src/server`), então dá para chamar sem config. Se um dia customizar, passar o mesmo config para `getSessionCookie(request, { cookiePrefix })`.
- Retorna `string | null` (não um objeto de cookie). O `if (!sessionCookie)` continua funcionando.
- É o padrão recomendado pelo Better Auth para middleware/proxy no Next.js: verificação otimista, sem acessar o DB.

### O que NÃO fazer

- Não hardcodar os dois nomes de cookie no proxy (`get(a) ?? get(b)`): o helper oficial acompanha mudanças futuras do Better Auth.
- Não validar a sessão no DB dentro do proxy (Edge, latência). A validação real continua nos Server Components.
- Não mudar config de cookies (`useSecureCookies` etc.) para "resolver" o problema: o prefixo seguro é o comportamento correto em HTTPS.

### Arquivos

- Modificados: `src/proxy.ts`, `src/proxy.test.ts`
- Sem migrations e sem dependências novas (`better-auth/cookies` é subpath export do `better-auth` já instalado)

### Impacto em outras stories

- A Story 3.4c (smoke test autenticado em staging) depende deste hotfix estar em `main`.

### References

- [Source: src/proxy.ts#L50-L62]
- [Source: src/proxy.test.ts] (helper `createRequest`, mocks de `NextResponse`)
- [Source: node_modules/better-auth/dist/cookies/index.mjs#getSessionCookie]
- [Source: _bmad-output/implementation-artifacts/1-4-registro-e-login-com-email-senha.md] (origem do proxy e da verificação otimista)
- [Source: _bmad-output/implementation-artifacts/1-8-ci-cd-pipeline-ambientes-e-readme.md] (fluxo de branches staging → main)

## Dev Agent Record

### Agent Model Used

Claude Opus 5.5 (claude-opus-5-5)

### Debug Log References

- **TDD — vermelho (Task 2.2):** `npx vitest run src/proxy.test.ts` antes da correção → `10 tests | 2 failed`:
  - `× deve permitir /dashboard com __Secure-better-auth.session_token`
  - `× deve permitir /checklist com __Secure-better-auth.session_token`
  (o proxy chamava `NextResponse.redirect` para `/login`; o caso HTTPS sem cookie já passava)
- **Verde (Task 4.1):** mesmo comando após a correção → `10 passed (10)`.
- **Regressão (Task 4.3):** `npx tsc --noEmit` 0 erros; `npx eslint src --max-warnings=0` 0 warnings; `npx vitest run` 136 arquivos / 1102 testes passando (1099 da `staging` + 3 novos); `npx next build` ok (`ƒ Proxy (Middleware)` compilado com `better-auth/cookies`).
- **Task 4.2:** não foi necessário ajustar o helper `createRequest` — `request.cookies.set` atualiza o header `cookie` do `NextRequest`, que é o que `getSessionCookie` lê.

### Completion Notes List

- `src/proxy.ts`: a verificação otimista passou a usar `getSessionCookie(request)` de `better-auth/cookies`, que reconhece `better-auth.session_token` e `__Secure-better-auth.session_token`. Sem config (o projeto não customiza `cookiePrefix`/`cookieName`). `PUBLIC_PATHS`, rate limit e logging intactos.
- `src/proxy.test.ts`: 3 testes novos (dashboard e checklist com cookie `__Secure-` em URL HTTPS; HTTPS sem cookie de sessão continua redirecionando). Os 7 existentes seguem passando, inclusive o cookie sem prefixo (dev/HTTP).
- **Não validado localmente ponta a ponta:** em HTTP o Better Auth não usa o prefixo `__Secure-`, então o fluxo real só aparece em HTTPS. A validação fica na Task 5.2 (staging) e 5.4 (produção).
- **Task 5 (entrega):** 5.1 PR #39 → `staging`; 5.2 validado pelo usuário em `caderninho-staging.vercel.app` (login com e-mail/senha OK, redirecionou para `/onboarding` — esperado para conta sem onboarding no banco de staging); 5.4 PR #40 `staging` → `main`, deploy de Production Ready e login validado pelo usuário em produção. **5.3 (login Google em staging) ainda não confirmado.**

- 2026-11-14 (create-story): story criada a partir do relato do bug em staging/produção, separada da 3.4c.

### File List

- `src/proxy.ts` (modificado)
- `src/proxy.test.ts` (modificado)
- `_bmad-output/implementation-artifacts/1-9-hotfix-cookie-sessao-https-no-proxy.md` (novo)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modificado — `1-9` adicionada; `epic-1` reaberto)

## Change Log

- 2026-11-14 — Entregue: #39 (→ staging) e #40 (staging → main). Login validado em staging e produção. Pendente: 5.3 (Google em staging).
- 2026-11-14 — Hotfix implementado com TDD: `getSessionCookie` no proxy + 3 testes. Suite 1102/1102, build ok. Status: review (entrega via PR para `staging` pendente).

## Senior Developer Review (AI) — 2026-11-15

**Resultado:** aprovado → `done`. ACs 1–6 implementados; login com e-mail/senha validado em staging e produção.

- [MÉDIO] Task 5.3 (Google em staging) dependia de configuração inexistente (sem `GOOGLE_CLIENT_ID`/`SECRET` na Vercel; botão aparece e falha). **Resolvido:** movida para a Story 1.12.
- [BAIXO→corrigido] `PUBLIC_PATHS` usava `startsWith`, liberando `/login-qualquer-coisa`, `/register-admin`, `/api/authorize` sem sessão; e `/api/auth-fake` caía no limite rígido de auth. **Corrigido:** `matchesPath` (caminho exato ou subcaminho) em `src/proxy.ts`, com 12 testes novos em `src/proxy.test.ts` (vermelho antes: 6 falhas).
