# Story 1.13: Ambiente local igual a staging e produção

Status: review

<!-- Criada em 2026-11-15 a partir do code review da Story 1.10. Pedido do PO: "precisamos ter um ambiente local igual ao ambiente de prod e staging". Deve ser concluída antes da Story 3.5 (primeira story com migration e reset de banco). -->

## Story

As a desenvolvedor do Caderninho,
I want que o app e as migrations usem localmente o mesmo caminho de conexão de staging e produção,
so that problemas de banco aparecem no meu computador ou no CI, e não depois do deploy.

## Contexto

- Staging e produção conectam pelo pooler do Supabase em **modo transação (porta 6543)** — app e migrations (Story 1.10).
- O ambiente local conectava **direto no Postgres (54322)**. Por isso o pool esgotado (`EMAXCONNSESSION`) e a restrição a prepared statements só apareceram em staging.
- Rodar migration remota exigia colar a URL do banco no terminal (`docs/deploy-producao.md`), e o `.env.staging.local` / `.env.production.local` estavam na porta 5432.
- Um teste de migrations "do zero" falhou num Postgres puro (sem `auth.uid()` do Supabase): testes de banco só valem no Supabase.

## Acceptance Criteria

1. **Given** o Supabase local **When** `npm run db:start` sobe o ambiente **Then** o pooler (Supavisor) está ligado em **modo transação** na porta 54329, e `.env.example`/README orientam o app local a conectar por ele.
2. **Given** `npm run db:migrate -- --env <local|staging|production>` **When** o script roda **Then** carrega o arquivo do ambiente (`.env.local`, `.env.staging.local`, `.env.production.local`), cujo `DATABASE_URL` prevalece sobre qualquer outro, e imprime o destino **sem a senha** (ambiente, host, porta).
3. **Given** `--env staging` ou `--env production` **When** o `DATABASE_URL` não está na porta 6543 **Then** o script recusa rodar e explica o motivo.
4. **Given** `--env production` **When** falta `--confirm-production` **Then** o script recusa rodar.
5. **Given** um ambiente sem `--env` **When** `npm run db:migrate` roda **Then** o comportamento é `--env local` (compatível com o uso atual).
6. **Given** `npm run db:reset:local` **When** o desenvolvedor quer testar as migrations do zero **Then** o Supabase local é zerado e todas as migrations são aplicadas **pelo pooler em modo transação**.
7. **Given** uma PR ou push para `staging`/`main` **When** o CI roda **Then** um job sobe o Supabase (Postgres + Supavisor) e aplica **todas as migrations do zero pelo pooler em modo transação** — a mesma condição de staging e produção.
8. **Given** um merge em `staging` (ou `main`) com o CI verde **When** o pipeline continua **Then** um job aplica as migrations no banco do ambiente com a URL guardada como secret do GitHub (environment `staging` ou `production`), sem ninguém colar senha no terminal. Sem o secret configurado, o job avisa e não falha.
9. **Given** a documentação **When** alguém configura o ambiente **Then** README, `docs/deploy-producao.md` e `project-context.md` descrevem o caminho único de conexão (pooler em modo transação em todos os ambientes) e os comandos novos.
10. **Given** a story está completa **When** a validação roda **Then** TDD para a lógica de ambiente do `migrate`, `tsc` 0 erros, `eslint` 0 warnings, `vitest` 100%, `next build` ok, e os jobs novos do CI verdes.

## Tasks / Subtasks

- [x] Task 1 (AC: #2–#5, #10): lógica de ambiente do `db:migrate` com TDD
  - [x] 1.1 Testes vermelhos em `scripts/lib/migrate-env.test.ts`: parse de `--env` e `--confirm-production`; arquivo por ambiente; descrição do destino sem senha; recusa de porta ≠ 6543 em staging/produção; recusa de produção sem confirmação; padrão `local`
  - [x] 1.2 Implementar `scripts/lib/migrate-env.ts` (funções puras) e usar em `scripts/migrate.ts` (`dotenv` com `override: true` no arquivo do ambiente)
- [ ] Task 2 (AC: #1, #6): pooler local — falta só a 2.4 (usuário)
  - [x] 2.1 `supabase/config.toml`: `[db.pooler] enabled = true` (modo transação, 54329)
  - [x] 2.2 `.env.example`: `DATABASE_URL` local pelo pooler
  - [x] 2.3 Script `db:reset:local` (`supabase db reset` + `db:migrate --env local`)
  - [ ] 2.4 Validar localmente (usuário reinicia o Supabase local: `npm run db:stop && npm run db:start`)
- [x] Task 3 (AC: #7): job de CI "migrations do zero pelo pooler"
- [x] Task 4 (AC: #8): job de migration automática em `staging`/`main` (GitHub environments + secrets)
- [x] Task 5 (AC: #9): README, `docs/deploy-producao.md`, `project-context.md`
- [x] Task 6 (AC: #10): validação completa + PR para `staging`
- [ ] Task 7 (usuário): `.env.production.local` na porta 6543; secrets `DATABASE_URL` nos environments `staging` e `production` do GitHub; reiniciar o Supabase local; apontar o `.env.local` para o pooler local

## Dev Notes

- Formato da URL do pooler local (Supavisor do CLI): `postgresql://postgres.pooler-dev:postgres@127.0.0.1:54329/postgres` — confirmar com `npm run db:status` depois de ligar o pooler.
- `dotenv` não sobrescreve variáveis já definidas; para o arquivo do ambiente prevalecer, usar `override: true`.
- Ordem migration × deploy da Vercel: os dois começam no push. Antes do lançamento é aceitável; depois, migrations devem ser retrocompatíveis (política de dados da arquitetura).
- Nunca imprimir a URL completa nem a senha (logs do CI são visíveis).

### References

- [Source: _bmad-output/implementation-artifacts/1-10-hotfix-pool-conexoes-modo-transacao.md] (review e validação da porta 6543)
- [Source: _bmad-output/planning-artifacts/architecture.md#modelo-da-hierarquia-de-gastos] (política de dados)
- [Source: docs/deploy-producao.md], [Source: README.md]

## Dev Agent Record

### Agent Model Used

Claude Opus 5.5

### Debug Log References

- Vermelho: `scripts/lib/migrate-env.test.ts` falhou com o módulo inexistente; verde com 13/13.
- Recusas do `db:migrate` exercitadas com URLs fictícias: arquivo ausente, ambiente inválido, staging na 5432, produção sem `--confirm-production`.
- CI da PR #51, job `migrations`: `Destino: local → 127.0.0.1:54329` → `Migrations applied successfully!` (2×) → `migrations no journal: 18 | aplicadas: 18`.

### Completion Notes List

- 2026-11-15 (create-story): criada a partir do code review da 1.10 e do pedido do PO.
- 2026-11-15 (dev): Tasks 1–6 entregues. Environments do GitHub não existem em repositório privado no plano gratuito → secrets do repositório `STAGING_DATABASE_URL`/`PRODUCTION_DATABASE_URL`. Concorrência do CI deixou de cancelar execuções de push (não interrompe migration). Pendente: Task 2.4 e Task 7 (usuário).

### File List

- `scripts/lib/migrate-env.ts` (novo), `scripts/lib/migrate-env.test.ts` (novo), `scripts/migrate.ts`
- `supabase/config.toml`, `.env.example`, `package.json`
- `.github/workflows/ci.yml`
- `README.md`, `docs/deploy-producao.md`, `_bmad-output/project-context.md`
- `_bmad-output/planning-artifacts/epics.md`, `_bmad-output/implementation-artifacts/sprint-status.yaml`
