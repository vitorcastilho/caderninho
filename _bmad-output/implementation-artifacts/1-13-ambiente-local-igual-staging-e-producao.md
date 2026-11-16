# Story 1.13: Ambiente local igual a staging e produção

Status: in-progress

<!-- Criada em 2026-11-15 a partir do code review da Story 1.10. Pedido do PO: "precisamos ter um ambiente local igual ao ambiente de prod e staging". Deve ser concluída antes da Story 3.5 (primeira story com migration e reset de banco). -->

## Story

As a desenvolvedor do Caderninho,
I want que o app e as migrations usem localmente o mesmo caminho de conexão de staging e produção,
so that problemas de banco aparecem no meu computador ou no CI, e não depois do deploy.

## Contexto

- Staging e produção usam o pooler do Supabase em **modo transação (6543)** com `prepare: false`; o local conectava direto (54322), e por isso `EMAXCONNSESSION` e o limite de prepared statements só apareceram em staging. [Source: _bmad-output/implementation-artifacts/1-10-hotfix-pool-conexoes-modo-transacao.md#Review]
- Migration remota exigia colar a URL com senha no terminal, e `.env.staging.local`/`.env.production.local` estavam na 5432.
- Testes de banco só valem no Supabase (o Postgres "puro" não tem `auth.uid()`).

## Acceptance Criteria

1. **Given** o Supabase local **When** `npm run db:start` sobe o ambiente **Then** o pooler (Supavisor) está ligado em **modo transação** na porta 54329, e `.env.example`/README orientam o app local a conectar por ele.
2. **Given** `npm run db:migrate -- --env <local|staging|production>` **When** o script roda **Then** carrega o arquivo do ambiente (`.env.local`, `.env.staging.local`, `.env.production.local`), cujo `DATABASE_URL` prevalece sobre qualquer outro, e imprime o destino **sem a senha** (ambiente, host, porta).
3. **Given** `--env staging` ou `--env production` **When** o `DATABASE_URL` não está na porta 6543 **Then** o script recusa rodar e explica o motivo.
4. **Given** `--env production` **When** falta `--confirm-production` **Then** o script recusa rodar.
5. **Given** um ambiente sem `--env` **When** `npm run db:migrate` roda **Then** o comportamento é `--env local` (compatível com o uso atual).
6. **Given** `npm run db:reset:local` **When** o desenvolvedor quer testar as migrations do zero **Then** o Supabase local é zerado e todas as migrations são aplicadas **pelo pooler em modo transação**.
7. **Given** uma PR ou push para `staging`/`main` **When** o CI roda **Then** um job sobe o Supabase (Postgres + Supavisor) e aplica **todas as migrations do zero pelo pooler em modo transação** — a mesma condição de staging e produção.
8. **Given** um merge em `staging` (ou `main`) com o CI verde **When** o pipeline continua **Then** um job aplica as migrations no banco do ambiente com a URL guardada em **secret do repositório** (`STAGING_DATABASE_URL` ou `PRODUCTION_DATABASE_URL`), sem ninguém colar senha no terminal. Sem o secret configurado, o job avisa e não falha.
9. **Given** a documentação **When** alguém configura o ambiente **Then** README, `docs/deploy-producao.md`, `project-context.md` e `architecture.md` (Ambientes e CI/CD) descrevem o caminho único de conexão (pooler em modo transação em todos os ambientes), os jobs de migration e os comandos novos.
10. **Given** a story está completa **When** a validação roda **Then** TDD para a lógica de ambiente do `migrate`, `tsc` 0 erros, `eslint` 0 warnings, `vitest` 100%, `next build` ok, e os jobs novos do CI verdes.

## Tasks / Subtasks

- [x] Task 1 (AC: #2–#5, #10): lógica de ambiente do `db:migrate` com TDD
  - [x] 1.1 Testes vermelhos em `scripts/lib/migrate-env.test.ts`: parse de `--env` e `--confirm-production`; arquivo por ambiente; descrição do destino sem senha; recusa de porta ≠ 6543 em staging/produção; recusa de produção sem confirmação; padrão `local`
  - [x] 1.2 Implementar `scripts/lib/migrate-env.ts` (funções puras) e usar em `scripts/migrate.ts` (`dotenv` com `override: true` no arquivo do ambiente)
- [x] Task 2 (AC: #1, #6): pooler local
  - [x] 2.1 `supabase/config.toml`: `[db.pooler] enabled = true` (modo transação, 54329)
  - [x] 2.2 `.env.example`: `DATABASE_URL` local pelo pooler
  - [x] 2.3 Script `db:reset:local` (`supabase db reset` + `db:migrate --env local`)
- [x] Task 3 (AC: #7): job de CI `migrations` (do zero pelo pooler)
- [x] Task 4 (AC: #8): job `deploy-migrations` em `staging`/`main` com secrets do repositório
- [x] Task 5 (AC: #9): README, `docs/deploy-producao.md`, `project-context.md`
- [x] Task 6 (AC: #10): validação completa + PR para `staging`
- [ ] Task 7 (AC: #9): `architecture.md`
  - [ ] 7.1 Seção "3 Ambientes Isolados": Development pelo pooler local (54329), staging/produção pelo pooler 6543, sempre em modo transação com `prepare: false`
  - [ ] 7.2 Seção "CI/CD Pipeline": jobs `migrations` (toda PR/push) e `deploy-migrations` (push em `staging`/`main`, secrets do repositório) no `ci.yml`
  - [ ] 7.3 Árvore de arquivos: trocar `deploy.yml` (não existe) pelos jobs do `ci.yml`
- [ ] Task 8 (AC: #1, #7): resquícios da conexão direta (54322)
  - [ ] 8.1 Job `ci` do `.github/workflows/ci.yml`: `DATABASE_URL` pela URL do pooler local (54329); o job não sobe banco, mas o valor deve seguir o caminho único
  - [ ] 8.2 Fixture de `src/server/infrastructure/database/client.test.ts`: URL do pooler local (54329)

### Ações do PO (pós-merge)

Fora do escopo do dev; validam os ACs 1 e 8 nos ambientes reais.

- [ ] P1 (AC: #1, #6): reiniciar o Supabase local (`npm run db:stop && npm run db:start`), apontar o `.env.local` para `postgresql://postgres.pooler-dev:postgres@127.0.0.1:54329/postgres` e rodar `npm run db:reset:local`
- [ ] P2 (AC: #3): `.env.production.local` na porta 6543
- [ ] P3 (AC: #8): criar os secrets do repositório `STAGING_DATABASE_URL` e `PRODUCTION_DATABASE_URL` (porta 6543) em GitHub → Settings → Secrets and variables → Actions; conferir o job `deploy-migrations` no próximo merge em `staging`

## Dev Notes

- URL do pooler local (Supavisor do CLI): `postgresql://postgres.pooler-dev:postgres@127.0.0.1:54329/postgres` — confirmar com `npm run db:status`.
- `dotenv` não sobrescreve variáveis já definidas; para o arquivo do ambiente prevalecer, `override: true`.
- Nunca imprimir a URL completa nem a senha (logs do CI são visíveis).
- **Secrets do repositório, não Environments:** o plano gratuito do GitHub não tem Environments em repositório privado.
- **Decisão do PO — migration automática em produção:** o `deploy-migrations` roda `--env production --confirm-production` no push em `main`. O merge `staging → main` (só com o épico completo em staging) é a confirmação; o `--confirm-production` continua obrigatório na execução manual.
- **Ordem migration × deploy da Vercel:** os dois começam no push. Antes do lançamento é aceitável; depois, migrations devem ser retrocompatíveis (política de dados da arquitetura).
- **Concorrência do CI:** só execuções de PR são canceladas; um push novo nunca interrompe uma migration em andamento.

### Project Structure Notes

- Funções puras e testáveis em `scripts/lib/` (`migrate-env.ts` + teste ao lado); `scripts/migrate.ts` só orquestra.
- Os jobs de migration ficam no `.github/workflows/ci.yml` (não há `deploy.yml`); `deploy-migrations` depende de `ci` e `migrations`.
- Story sem UI: não se aplica a Fase 0 (Design System e protótipos).

### References

- [Source: _bmad-output/implementation-artifacts/1-10-hotfix-pool-conexoes-modo-transacao.md#Review] (validação da porta 6543 e lição do Postgres "puro")
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.13]
- [Source: _bmad-output/planning-artifacts/architecture.md#3 Ambientes Isolados], [#CI/CD Pipeline], [#modelo-da-hierarquia-de-gastos] (política de dados)
- [Source: _bmad-output/project-context.md] (um só caminho de conexão)
- [Source: docs/deploy-producao.md], [Source: README.md]

## Dev Agent Record

### Agent Model Used

Claude Opus 5.5

### Debug Log References

- Vermelho: `scripts/lib/migrate-env.test.ts` falhou com o módulo inexistente; verde com 13/13.
- Recusas do `db:migrate` exercitadas com URLs fictícias: arquivo ausente, ambiente inválido, staging na 5432, produção sem `--confirm-production`.
- CI da PR #51, job `migrations`: `Destino: local → 127.0.0.1:54329` → `Migrations applied successfully!` (2×) → `migrations no journal: 18 | aplicadas: 18`.

### Completion Notes List

- 2026-11-15: story criada fora do workflow `create-story`, a partir do code review da 1.10 e do pedido do PO; Tasks 1–6 implementadas fora do `dev-story`.
- 2026-11-15 (dev): Environments do GitHub não existem em repositório privado no plano gratuito → secrets do repositório `STAGING_DATABASE_URL`/`PRODUCTION_DATABASE_URL`. Concorrência do CI deixou de cancelar execuções de push (não interrompe migration).
- 2026-11-16 (create-story, validação pelo checklist — correct course processo, Proposta 3): AC 8 alinhado aos secrets do repositório; AC 9 inclui `architecture.md`; ações do usuário separadas em "Ações do PO"; Tasks 7–8 abertas; status volta a `in-progress` para o `dev-story`.

### File List

- `scripts/lib/migrate-env.ts` (novo), `scripts/lib/migrate-env.test.ts` (novo), `scripts/migrate.ts`
- `supabase/config.toml`, `.env.example`, `package.json`
- `.github/workflows/ci.yml`
- `README.md`, `docs/deploy-producao.md`, `_bmad-output/project-context.md`
- `_bmad-output/planning-artifacts/epics.md`, `_bmad-output/implementation-artifacts/sprint-status.yaml`
