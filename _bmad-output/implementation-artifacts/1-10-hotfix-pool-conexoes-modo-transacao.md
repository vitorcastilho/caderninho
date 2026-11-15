# Story 1.10: Hotfix — pool de conexões para serverless (pooler do Supabase em modo transação)

Status: review

<!-- Hotfix pós-Epic 1. Encontrado no smoke test da 3.4c em staging (2026-11-14). -->

## Story

As a usuário do Caderninho em staging/produção,
I want que as páginas logadas carreguem sem erro de servidor,
so that consigo usar o app mesmo com várias instâncias da função na Vercel.

## Acceptance Criteria

1. **Given** o app roda na Vercel (várias instâncias serverless) **When** as páginas logadas fazem várias consultas em paralelo **Then** não ocorre `EMAXCONNSESSION (max clients reached in session mode)`.
2. **Given** o `DATABASE_URL` aponta para o pooler do Supabase em **modo transação** (porta 6543) **When** o app consulta o banco **Then** funciona sem erros de prepared statement (`prepare: false`).
3. **Given** cada instância mantém seu próprio pool **When** ela fica ociosa **Then** devolve as conexões (`idle_timeout`) e usa poucas conexões (`max` baixo).
4. **Given** as migrations rodam pela porta 6543 (`docs/deploy-producao.md`) **When** `npm run db:migrate` executa **Then** funciona sem prepared statements.
5. **Given** a correção **When** a validação roda **Then** TDD (teste vermelho antes), `tsc`/`eslint` limpos, suíte passando.

## Tasks / Subtasks

- [x] Task 1 (AC: #2, #3, #5): teste em `client.test.ts` exigindo `prepare: false`, `idle_timeout: 20` e `max` entre 1 e 5 — falhou antes da correção.
- [x] Task 2 (AC: #1, #2, #3): `client.ts` cria o cliente com `{ max: 3, idle_timeout: 20, prepare: false }`.
- [x] Task 3 (AC: #4): `scripts/migrate.ts` com `{ max: 1, prepare: false }`.
- [x] Task 4 (AC: #5): `tsc` 0 erros, `eslint src scripts` 0 warnings, `vitest run` 138 arquivos / 1152 testes.
- [x] Task 5 (AC: #1, #2): usuário troca o `DATABASE_URL` de **staging** (Vercel, Preview/staging) para o Transaction pooler (porta 6543) → merge desta PR → validar páginas logadas em staging.
- [ ] Task 6 (AC: #1, #2): trocar o `DATABASE_URL` de **produção** para a porta 6543 **antes** do merge da PR `staging` → `main` → validar produção.

## Dev Notes

**Causa (logs da Vercel, staging, 2026-11-14):**
```
[Better Auth] Failed to get session
cause: (EMAXCONNSESSION) max clients reached in session mode - max clients are limited to pool_size: 15
```
- `DATABASE_URL` apontava para o pooler em **modo sessão** (porta 5432): cada conexão aberta pela app ocupa uma das 15 vagas o tempo todo.
- `postgres(connectionString)` sem opções: até 10 conexões por instância e `idle_timeout` 0 (nunca fecha ociosas). Duas instâncias já passam de 15; instâncias antigas seguram vagas indefinidamente → todas as páginas logadas caem.

**Por que modo transação:** a conexão real só é ocupada durante cada transação; o pooler multiplexa as instâncias. É o modo indicado pelo Supabase para serverless. Exige `prepare: false` no postgres.js.

**Ordem de deploy:** código (`prepare: false`, compatível com os dois modos) junto com/antes da troca da URL. Trocar a URL com o código antigo pode gerar erros de prepared statement.

**Dev local:** sem impacto (Postgres local direto; as opções também funcionam).

## Dev Agent Record

### Agent Model Used

Claude Opus 5.5 (claude-opus-5-5)

### Debug Log References

- Vermelho: `client.test.ts` → `AssertionError: expected undefined to match object { prepare: false, idle_timeout: 20 }` (1 failed, 2 passed).
- Verde: 3/3. Suíte: 138 arquivos / 1152 testes. `tsc` 0, `eslint src scripts` 0.

### Completion Notes List

- Opções do pool fixas no código (`max: 3`); se precisar ajustar por ambiente, virar env var numa próxima story.

### File List

- `src/server/infrastructure/database/client.ts` (modificado)
- `src/server/infrastructure/database/client.test.ts` (modificado)
- `scripts/migrate.ts` (modificado)
- `_bmad-output/implementation-artifacts/1-10-hotfix-pool-conexoes-modo-transacao.md` (novo)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modificado)

## Change Log

- 2026-11-14 — Hotfix implementado com TDD (pool para serverless + `prepare: false`). Status: review.

## Senior Developer Review (AI) — 2026-11-15

**Resultado:** permanece `review` até a validação em produção (Task 6, na release do Epic 3).

- [BAIXO→corrigido] Task 5 feita (staging na 6543; smoke da 3.4c sem `EMAXCONNSESSION`), mas não marcada.
- [MÉDIO] AC 4 (migrations pela 6543) nunca foi exercitado num ambiente real. **Decisão do PO:** a porta 6543 passa a ser usada também para migrations, daqui em diante. **Pendente:** teste de migrations em modo transação — (a) todas as migrations a partir de um banco vazio, através de um pooler em modo transação local; (b) `db:migrate` no staging pela 6543. A execução local foi bloqueada pela política de permissões da sessão e aguarda autorização do usuário. Se não for feito antes, a Story 3.5 (que zera o banco de staging e aplica migrations) é a validação real.
