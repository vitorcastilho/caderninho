# Story 1.11: Hotfix — rate limit por tipo de requisição + error boundary

Status: review

<!-- Hotfix pós-Epic 1. Encontrado no smoke test da 3.4c em staging (2026-11-14). -->

## Story

As a usuário logado do Caderninho,
I want navegar, filtrar e registrar transações em ritmo normal sem ser bloqueado,
so that o app não quebra com "Application error" depois de poucas ações.

## Acceptance Criteria

1. **Given** o prefetch automático do Next (links da sidebar) **When** a página carrega **Then** essas requisições não consomem a cota de navegação; têm cota própria (600/min por IP) e não são ilimitadas (o header pode ser forjado).
2. **Given** navegação normal (páginas/RSC) **When** o usuário navega **Then** até 300 requisições/min por IP passam (antes: 30, somando tudo).
3. **Given** server actions (POST com header `next-action`) **When** o usuário filtra/registra **Then** têm cota própria de 120/min por IP; a 121ª recebe 429 com `Retry-After`.
4. **Given** rotas de auth (`/api/auth/*`) **When** há tentativas repetidas **Then** o limite rígido de 10/min por IP continua (proteção contra força bruta — requisito da Story 1.6).
5. **Given** um erro numa página logada (ex.: action com 429) **When** ele acontece **Then** aparece o error boundary com "Tentar de novo" e o layout (sidebar) continua, em vez da tela "Application error".
6. **Given** a correção **When** a validação roda **Then** TDD (testes vermelhos antes), `tsc`/`eslint` limpos, suíte passando, build ok.

## Tasks / Subtasks

- [x] Task 1 (AC: #1–#4, #6): testes em `src/proxy.test.ts` (mock de `NextResponse` construtível para o caminho do 429; store resetado por teste). Vermelho: 3 falhas (prefetch, navegação, actions); auth já passava.
- [x] Task 2 (AC: #1–#4): `src/proxy.ts` — buckets `auth` (10), `action` (120), `prefetch` (600), `default` (300) por IP/minuto.
- [x] Task 3 (AC: #5, #6): teste `src/app/(app)/error.test.tsx` (vermelho: arquivo inexistente) → `src/app/(app)/error.tsx` com `EmptyState` do DS, "Tentar de novo" (`reset`) e digest do erro.
- [x] Task 4 (AC: #6): `tsc` 0, `eslint src` 0, `vitest run` 139 arquivos / 1159 testes, `next build` ok.
- [x] Task 5: PR para `staging` → merge → retomar o smoke test da 3.4c em staging (valida AC #1–#3 com uso real).

## Dev Notes

**Evidência (staging, 2026-11-14):** abrir "Novo Gasto" após algumas navegações → `429` em `GET /accounts?_rsc=…`, `/transactions?_rsc=…`, `/dashboard?_rsc=…` e `POST /transactions` (server action) → "Application error: a client-side exception".

**Causa:** `DEFAULT_RATE_LIMIT = 30` por IP/min somando prefetch, navegação e server actions. Em produção o Next faz prefetch de cada link visível da sidebar (~10 por página); a tela de transações faz 2 actions por mudança de filtro. Sem error boundary, a action rejeitada derrubava a árvore inteira.

**Limitação conhecida (não muda nesta story):** o store é em memória por instância (ver alerta em `1-6-auditoria-e-seguranca.md`). Na Vercel, cada instância conta separado — o limite é por instância, não global. Um store compartilhado (Redis/Upstash) seria outra story.

**Sem migration, sem dependência nova.**

## Dev Agent Record

### Agent Model Used

Claude Opus 5.5 (claude-opus-5-5)

### Debug Log References

- Vermelho (proxy): `Tests 3 failed | 11 passed (14)` — prefetch, navegação 300/min, actions 120/min.
- Vermelho (error boundary): `Failed to resolve import "./error"`.
- Verde: proxy 14/14 + error boundary 3/3. Suíte 139 / 1159. `tsc` 0, `eslint` 0, `next build` ok.

### Completion Notes List

- Prefetch começou isento e virou cota própria (600/min) para não abrir brecha via header forjado.
- Error boundary não importa nada de `server/` (regra de camadas); loga no console do navegador.

### File List

- `src/proxy.ts` (modificado)
- `src/proxy.test.ts` (modificado)
- `src/app/(app)/error.tsx` (novo)
- `src/app/(app)/error.test.tsx` (novo)
- `_bmad-output/implementation-artifacts/1-11-hotfix-rate-limit-por-tipo-de-requisicao.md` (novo)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modificado)

## Change Log

- 2026-11-14 — Rate limit por tipo de requisição + error boundary das páginas logadas, com TDD. Status: review.

## Senior Developer Review (AI) — 2026-11-15

**Resultado:** permanece `review` até a validação em produção (release do Epic 3).

- [BAIXO→corrigido] Task 5 feita (smoke da 3.4c em staging sem 429), mas não marcada.
- [MÉDIO→corrigido] AC 5 cobria só erros de renderização/navegação. Uma server action que recebe 429 tem a promise **rejeitada** pelo Next (`server-action-reducer`: resposta `text/plain` vira `Error`), o que não chega ao error boundary: o componente ficava preso (ex.: "Salvando…" para sempre) sem mensagem. **Corrigido:** `src/client/actions/with-action-fallback.ts` transforma a rejeição em `Result` de erro (`RATE_LIMITED` / `NETWORK_ERROR`, mensagens em português); `src/client/actions/*.actions.ts` envolvem todas as actions; os 30 componentes `'use client'` passaram a importar de `@/client/actions`. Testes: `with-action-fallback.test.ts` (4), `client-actions.test.ts` (guarda: nenhum componente do navegador importa direto de `@/server/actions`; toda action tem wrapper) e integração em `TransactionList.test.tsx` (429 nas actions de filtro → aviso e cards fora do carregamento; vermelho sem o wrapper: rejeição não tratada).
- [BAIXO] Store do rate limit em memória por instância — limitação já documentada; fora do escopo.
