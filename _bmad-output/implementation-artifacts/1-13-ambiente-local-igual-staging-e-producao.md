# Story 1.13: Ambiente local igual a staging e produção

Status: done

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
- [x] Task 7 (AC: #9): `architecture.md`
  - [x] 7.1 Seção "3 Ambientes Isolados": Development pelo pooler local (54329), staging/produção pelo pooler 6543, sempre em modo transação com `prepare: false`
  - [x] 7.2 Seção "CI/CD Pipeline": jobs `migrations` (toda PR/push) e `deploy-migrations` (push em `staging`/`main`, secrets do repositório) no `ci.yml`
  - [x] 7.3 Árvore de arquivos: trocar `deploy.yml` (não existe) pelos jobs do `ci.yml`
- [x] Task 8 (AC: #1, #7): resquícios da conexão direta (54322)
  - [x] 8.1 Job `ci` do `.github/workflows/ci.yml`: `DATABASE_URL` pela URL do pooler local (54329); o job não sobe banco, mas o valor deve seguir o caminho único
  - [x] 8.2 Fixture de `src/server/infrastructure/database/client.test.ts`: URL do pooler local (54329)

### Review Follow-ups (AI)

- [x] [AI-Review][High] (AC: #8) `deploy-migrations`: `github.ref_name == 'main' && secrets.PRODUCTION_DATABASE_URL || secrets.STAGING_DATABASE_URL` cai no secret de staging quando o de produção está vazio — em `main` roda `--env production --confirm-production` no banco de staging e não avisa. Escolher o secret no shell pelo `TARGET_ENV`, sem a cadeia `&&`/`||` [.github/workflows/ci.yml, job deploy-migrations, step "Aplicar migrations"]
- [x] [AI-Review][Medium] (AC: #2, #3) Sem o arquivo do ambiente (ou sem `DATABASE_URL` nele), o `DATABASE_URL` do shell prevalece: `--env staging` com uma URL de produção (6543) exportada migra produção sem `--confirm-production` e imprime "staging"; a mensagem de erro cita o arquivo mesmo quando o valor veio do shell. Exigir o arquivo fora do CI (ou registrar a origem da URL), com teste [scripts/migrate.ts:22]
- [x] [AI-Review][Medium] (AC: #6) `checkTarget` aceita qualquer porta no local (o teste afirma "pooler 54329 ou Postgres direto"), contradizendo o `architecture.md` ("nunca a conexão direta, 54322 local"); com `.env.local` na 54322, o `db:reset:local` aplica as migrations sem o pooler. Recusar (ou avisar) a 54322 no local [scripts/lib/migrate-env.ts:71, scripts/lib/migrate-env.test.ts:82]
- [x] [AI-Review][Medium] Mudanças das Tasks 7–8 (`ci.yml`, `client.test.ts`, `architecture.md`, story, `sprint-status.yaml`) não commitadas e fora da PR #51 — o CI da PR não as validou [working tree]
- [x] [AI-Review][Low] Comentários desatualizados: "secret do environment do GitHub" (agora secrets do repositório) e o aviso do `deploy-migrations` citando "Story 1.13, Task 7" (configuração dos secrets é a ação P3 do PO) [scripts/migrate.ts:12, .github/workflows/ci.yml job deploy-migrations]
- [x] [AI-Review][Low] `parseMigrateArgs` ignora argumentos desconhecidos: `npm run db:migrate --env staging` (sem `--`) roda no local em silêncio; `--confim-production` passa despercebido. Recusar argumentos desconhecidos [scripts/lib/migrate-env.ts:33]
- [x] [AI-Review][Low] Testes ausentes: `--env` sem valor, `describeTarget` com URL sem porta, precedência arquivo × shell [scripts/lib/migrate-env.test.ts]
- [x] [AI-Review][Low] (2ª rodada) `drizzle.config.ts` lia o `.env.local` sem `override`: o `DATABASE_URL` do shell prevalecia em `db:generate`/`db:push`/`db:studio`; drizzle-kit pelo pooler 54329 não verificado [drizzle.config.ts:4]
- [x] [AI-Review][Low] (2ª rodada) README e `docs/deploy-producao.md` sem as recusas novas (shell ignorado, 54322 no local, argumentos desconhecidos); troubleshooting do README ainda com o reset antigo [README.md, docs/deploy-producao.md]
- [x] [AI-Review][Low] (2ª rodada) `CI=true` exportado no terminal liberava o `DATABASE_URL` do shell; usar `GITHUB_ACTIONS` [scripts/migrate.ts]
- [x] [AI-Review][Low] (2ª rodada) `ENV_VALUE_REQUIRED` declarado depois da função que o usa [scripts/lib/migrate-env.ts]
- [x] [AI-Review][Low] (2ª rodada) Montagem do `migrate.ts` (leitura do arquivo e detecção do CI) sem teste automatizado [scripts/migrate.ts]
- [x] [AI-Review][High] (3ª rodada, AC: #9) `project-context.md` não descreve os jobs de migration (`migrations`, `deploy-migrations`) nem as recusas do `db:migrate`; o AC 9 exige os quatro documentos [_bmad-output/project-context.md:339]
- [x] [AI-Review][Medium] (3ª rodada) Mudanças não commitadas e fora da story: checagem de project ref em staging/produção, `drizzleKitDatabaseUrl`, `projectRefFromUrl`, novo `drizzle.config.ts` e textos de README/`deploy-producao.md`/`architecture.md`. Sem registro no Dev Agent Record, File List e Change Log; o teste cita uma "3ª rodada" inexistente; fora da PR #51 (CI não validou) [scripts/lib/migrate-env.ts, scripts/lib/migrate-env.test.ts, drizzle.config.ts, README.md, docs/deploy-producao.md, architecture.md]
- [x] [AI-Review][Medium] (3ª rodada) `drizzle.config.ts` chama `drizzleKitDatabaseUrl` ao carregar: `npm run db:generate` (que não conecta no banco) falha sem `.env.local` ou com `.env.local` fora da 54329 (ex.: clone novo) [drizzle.config.ts:18]
- [x] [AI-Review][Low] (3ª rodada) Project refs de staging/produção fixos no código e repetidos no teste; trocar de projeto exige editar os dois, e o teste não pega divergência [scripts/lib/migrate-env.ts:45, scripts/lib/migrate-env.test.ts:16]
- [x] [AI-Review][Low] (3ª rodada) `checkTarget` no local só confere a porta: host remoto na 54329 passaria (sem checar loopback) [scripts/lib/migrate-env.ts, `checkTarget`]
- [x] [AI-Review][Low] (3ª rodada) `describeTarget` no local imprime "(projeto pooler-dev)": `pooler-dev` é o tenant do Supavisor, não um project ref [scripts/lib/migrate-env.ts, `describeTarget`]
- [x] [AI-Review][Low] (3ª rodada) Job `migrations` só compara a contagem do journal com as aplicadas; não detecta divergência entre `schema/*.ts` e as migrations (migration esquecida) [.github/workflows/ci.yml, job migrations]
- [x] [AI-Review][Low] (3ª rodada) Exigir usuário `postgres.<ref>` recusa o pooler dedicado do Supabase (`db.<ref>.supabase.co:6543`, usuário `postgres`) com mensagem sobre "project ref" que não explica a causa [scripts/lib/migrate-env.ts, `checkTarget`]

### Ações do PO (pós-merge)

Fora do escopo do dev; validam os ACs 1, 8 e 10 nos ambientes reais. O job `deploy-migrations` só roda em push (na PR aparece como "skipping"): o AC 8 e a parte do AC 10 sobre ele ("jobs novos do CI verdes") só se comprovam com P3 e P4.

- [x] P1 (AC: #1, #6): reiniciar o Supabase local (`npm run db:stop && npm run db:start`), apontar o `.env.local` para `postgresql://postgres.pooler-dev:postgres@127.0.0.1:54329/postgres` e rodar `npm run db:reset:local`
- [x] P2 (AC: #3): `.env.production.local` na porta 6543
- [ ] P3 (AC: #8, #10): criar os secrets do repositório `STAGING_DATABASE_URL` e `PRODUCTION_DATABASE_URL` (porta 6543) em GitHub → Settings → Secrets and variables → Actions; conferir o job `deploy-migrations` verde no próximo merge em `staging`
- [ ] P4 (AC: #8): conferir o banco de staging, onde a conferência manual da 2ª rodada rodou `migrate` sem checar pendências — `select count(*) from drizzle.__drizzle_migrations` igual ao número de entradas de `src/server/infrastructure/database/migrations/meta/_journal.json` (no merge em `staging`, o log do `deploy-migrations` também serve: `Migrations applied successfully!` sem erro)

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
- 2026-11-16 (review follow-ups): vermelho com 10 testes novos falhando em `migrate-env.test.ts` (`resolveDatabaseUrl` inexistente, argumentos aceitos, 54322 aceita no local); verde com 23/23. `scripts/migrate.ts` exercitado com URLs fictícias: shell com URL de produção e `--env staging` sem arquivo → recusa; `--confim-production` → recusa; `npm run db:migrate staging` (sem `--`) → recusa citando o `--`; `.env.local` na 54322 → recusa indicando a URL do pooler; CI com staging na 5432 → recusa citando "variável DATABASE_URL do CI"; `--env` sem valor → recusa. `npm run db:migrate` no Supabase local: `Destino: local → 127.0.0.1:54329` → `Migrations applied successfully!`. Suíte: `tsc` 0, `eslint` 0, `vitest` 147 arquivos / 1313 testes, `next build` ok.
- 2026-11-16 (Tasks 7–8): `tsc` 0 erros, `eslint` 0 warnings, `vitest` 147 arquivos / 1303 testes, `next build` ok. Task 8 só troca valores de fixture/variável (sem lógica nova), sem fase vermelha.

### Completion Notes List

- 2026-11-15: story criada fora do workflow `create-story`, a partir do code review da 1.10 e do pedido do PO; Tasks 1–6 implementadas fora do `dev-story`.
- 2026-11-15 (dev): Environments do GitHub não existem em repositório privado no plano gratuito → secrets do repositório `STAGING_DATABASE_URL`/`PRODUCTION_DATABASE_URL`. Concorrência do CI deixou de cancelar execuções de push (não interrompe migration).
- 2026-11-16 (create-story, validação pelo checklist — correct course processo, Proposta 3): AC 8 alinhado aos secrets do repositório; AC 9 inclui `architecture.md`; ações do usuário separadas em "Ações do PO"; Tasks 7–8 abertas; status volta a `in-progress` para o `dev-story`.
- 2026-11-16 (dev-story, Tasks 7–8): `architecture.md` — "3 Ambientes Isolados" com o caminho único (pooler em modo transação, 54329 local / 6543 remoto, `prepare: false`), comandos `db:migrate --env` e `db:reset:local`; "CI/CD Pipeline" com os jobs `ci`, `bmad-process`, `migrations` e `deploy-migrations` do `ci.yml` (secrets do repositório, concorrência, retrocompatibilidade); árvore sem o `deploy.yml`. `DATABASE_URL` do job `ci` e a fixture do `client.test.ts` passam ao pooler local (54329). A 54322 que sobra no `supabase/config.toml` é a porta do próprio Postgres local, que o pooler usa.
- Observação para o code review: o aviso do `deploy-migrations` sem secret cita "Story 1.13, Task 7", mas a configuração dos secrets agora é a ação P3 do PO. Não alterei porque nenhuma task cobre isso.
- 2026-11-16 (dev-story, review follow-ups):
  - ✅ Resolved review finding [High]: `deploy-migrations` com um passo por ambiente (`if: github.ref_name == 'staging'` / `'main'`), cada um lendo só o próprio secret; um secret de produção vazio não cai mais no de staging.
  - ✅ Resolved review finding [Medium]: nova função pura `resolveDatabaseUrl` — fora do CI a URL vem só do arquivo do ambiente (o shell é ignorado); no CI (`CI=true`), sem arquivo, vem da variável do job. `checkTarget` recebe a origem e a cita nos erros. `migrate.ts` lê o arquivo com `dotenv.parse` em vez de `config({ override })`.
  - ✅ Resolved review finding [Medium]: `checkTarget` recusa no local qualquer porta diferente de 54329 e indica a URL do pooler; o teste que aceitava "Postgres direto" foi substituído.
  - ✅ Resolved review finding [Low]: comentário do `migrate.ts` sem "environment do GitHub"; avisos do `deploy-migrations` citam a ação P3 do PO.
  - ✅ Resolved review finding [Low]: `parseMigrateArgs` recusa argumentos desconhecidos, argumento solto (lembra do `--` do npm) e `--env` sem valor.
  - ✅ Resolved review finding [Low]: testes de `--env` sem valor, `describeTarget` sem porta e precedência arquivo × shell (`resolveDatabaseUrl`).
  - `architecture.md` ("3 Ambientes Isolados") atualizado com a nova regra de origem da URL, as recusas no local e os argumentos desconhecidos.
  - A story não tem a seção "Senior Developer Review (AI) → Action Items"; os itens foram marcados só em "Review Follow-ups (AI)".
  - ✅ Resolved review finding [Medium]: Tasks 7–8 e follow-ups commitados e enviados à PR #51 (commit `0eea64e`); CI verde — `ci`, `bmad-process` e `migrations` (`Destino: local → 127.0.0.1:54329`, 18/18 aplicadas, origem: variável do job).
  - Ações do PO conferidas nesta sessão: P1 (`.env.local` na 54329, container `supabase_pooler_caderninho` ativo, app sobe sem erro, `db:migrate` local ok) e P2 (`.env.production.local` e `.env.staging.local` na 6543). P3: secrets `STAGING_DATABASE_URL` e `PRODUCTION_DATABASE_URL` criados como secrets do repositório (`gh secret list`); falta conferir o job `deploy-migrations` no merge em `staging`.

- 2026-11-16 (code review, 2ª rodada — 0 High, 0 Medium, 5 Low, todos corrigidos):
  - `databaseUrlFromEnvFile` e `isGithubActions` (funções puras, TDD: 5 testes vermelhos → 28/28 verdes) tiram do `migrate.ts` a leitura do arquivo e a detecção do CI; só `GITHUB_ACTIONS=true` libera a variável do job (um `CI=true` no terminal não).
  - `drizzle.config.ts` com `override: true` (o `.env.local` prevalece sobre o shell). drizzle-kit usa postgres.js com `max: 1`: 60 consultas preparadas pelo pooler local (54329) sem erro.
  - README (comandos, regras do `db:migrate`, troubleshooting com `db:reset:local`), `docs/deploy-producao.md` e `architecture.md` com as recusas e o critério de CI.
  - `ENV_VALUE_REQUIRED` movido para as constantes do topo.
  - Validação: `tsc` 0, `eslint` 0, `vitest` 147 arquivos / 1318 testes, `next build` ok, `npm run db:migrate` local → `127.0.0.1:54329` ok.
  - ⚠️ Na conferência manual, `CI=true … migrate.ts --env staging` usou (como deve) o `.env.staging.local` e **rodou `migrate` no banco real de staging** (`Migrations applied successfully!`). Não foi possível conferir se havia migrations pendentes; o PO deve verificar `drizzle.__drizzle_migrations` de staging contra o journal.

- 2026-11-17 (dev-story, follow-ups da 3ª rodada):
  - Mudanças encontradas no working tree e cobertas pelo follow-up Medium "fora da story" (feitas depois da 2ª rodada, sem registro): checagem do project ref em staging/produção (`PROJECT_REFS`, `projectRefFromUrl`), `drizzleKitDatabaseUrl` (drizzle-kit preso ao banco local), `drizzle.config.ts` usando-a e textos de README, `docs/deploy-producao.md` e `architecture.md`. Mantidas (testadas) e registradas aqui; o comentário do teste que citava uma "3ª rodada" inexistente foi corrigido.
  - TDD: 8 testes vermelhos → 46/46 verdes em `migrate-env.test.ts`.
  - ✅ Resolved review finding [High]: `project-context.md` descreve os jobs `ci`, `bmad-process`, `migrations` e `deploy-migrations`, as recusas do `db:migrate`, os arquivos `.env.*.local` por ambiente e o drizzle-kit só no local.
  - ✅ Resolved review finding [Medium]: `drizzleKitCredentials` devolve um getter: a URL só é lida e validada quando o drizzle-kit a usa. Conferido numa cópia sem `.env.local` (scratchpad): `drizzle-kit generate` → "No schema changes"; `drizzle-kit push` → "drizzle-kit cancelado: DATABASE_URL não definido em .env.local".
  - ✅ Resolved review finding [Low]: `PROJECT_REFS` exportado e importado pelos testes (fonte única).
  - ✅ Resolved review finding [Low]: `checkTarget` no local recusa host fora de `127.0.0.1`/`localhost`/`[::1]`.
  - ✅ Resolved review finding [Low]: `describeTarget` não cita projeto no local (`local → 127.0.0.1:54329`).
  - ✅ Resolved review finding [Low]: job `migrations` roda `drizzle-kit generate` e falha se aparecer arquivo novo em `migrations/`. Script do passo simulado num repositório git no scratchpad: sem mudança → exit 0; coluna nova no schema → `::error::` com `0018_*.sql`, snapshot e journal, exit 1.
  - ✅ Resolved review finding [Low]: `projectRefFromUrl` lê o ref também do host `db.<ref>.supabase.co` (pooler dedicado, usuário `postgres`); a recusa sem ref explica os dois formatos.
  - Validação: `tsc` 0, `eslint` 0, `vitest` 147 arquivos / 1336 testes, `next build` ok, `drizzle-kit generate` no repositório sem mudanças, `npm run db:migrate` local → `local → 127.0.0.1:54329` ok. Nenhum comando em banco remoto.
  - A story não tem a seção "Senior Developer Review (AI) → Action Items"; os itens foram marcados só em "Review Follow-ups (AI)".
  - ✅ Resolved review finding [Medium]: com o OK do PO, commit `6022ef1` (inclui o correct course de 2026-11-16) na PR #51; CI verde — `ci`, `bmad-process` e `migrations` (`No schema changes`, `Destino: local → 127.0.0.1:54329`, 18/18). Descrição da PR #51 atualizada.

- 2026-11-17 (code review, 4ª rodada — 0 High, 1 Medium, 6 Low; PO escolheu corrigir automaticamente os High/Medium):
  - Conferido: ACs 1–9 implementados; Tasks 1–8 e os 21 follow-ups com evidência no código; `migrate-env.test.ts` 46/46, `tsc` 0; PR #51 com `ci`, `bmad-process` e `migrations` verdes, `deploy-migrations` pulado (só roda em push).
  - ✅ Corrigido [Medium]: AC 8 e parte do AC 10 (`deploy-migrations` verde) sem comprovação e o aviso da 2ª rodada sobre o banco de staging sem item rastreável → "Ações do PO" explica que esses ACs se comprovam com P3/P4; P3 passa a citar o AC 10; nova P4 para conferir `drizzle.__drizzle_migrations` de staging contra o journal.
  - Low não corrigidos (pelo workflow, a opção 1 só corrige High/Medium), registrados para decisão do PO: (1) `projectRefFromUrl` — `decodeURIComponent` lança `URIError` com `%` mal formado no usuário, fora da mensagem "Migration cancelada" [scripts/lib/migrate-env.ts:108]; (2) refs divergentes entre usuário e host (`postgres.<staging>@db.<produção>.supabase.co`) passam como staging [scripts/lib/migrate-env.ts:106]; (3) `parseMigrateArgs` aceita `--env` repetido e `--confirm-production` fora de produção em silêncio [scripts/lib/migrate-env.ts:63]; (4) `drizzleKitCredentials` depende de o drizzle-kit não ler `dbCredentials` no `generate` (comportamento interno, sem teste/comentário); cabeçalho "Funções puras" impreciso [drizzle.config.ts, scripts/lib/migrate-env.ts:236]; (5) README com o caminho `src/server/infrastructure/db/schema/` (correto: `database/schema/`) [README.md, "Fluxo de trabalho com migrations"]; (6) `sprint-change-proposal-2026-11-16.md` commitado em `6022ef1` fora da File List — este, por ser só registro, foi incluído na File List.

### File List

- `scripts/lib/migrate-env.ts` (novo; review: `resolveDatabaseUrl`, recusas), `scripts/lib/migrate-env.test.ts` (novo; review: +10 testes), `scripts/migrate.ts` (review)
- `supabase/config.toml`, `.env.example`, `package.json`
- `.github/workflows/ci.yml` (review: um passo por ambiente no `deploy-migrations`)
- `README.md`, `docs/deploy-producao.md`, `_bmad-output/project-context.md`
- `_bmad-output/planning-artifacts/architecture.md`, `src/server/infrastructure/database/client.test.ts`
- `_bmad-output/planning-artifacts/epics.md`, `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/planning-artifacts/sprint-change-proposal-2026-11-16.md` (correct course de 2026-11-16, commit `6022ef1`)
- `drizzle.config.ts` (review 2ª rodada; 3ª rodada: `drizzleKitCredentials`)
- 3ª rodada: `scripts/lib/migrate-env.ts`, `scripts/lib/migrate-env.test.ts`, `.github/workflows/ci.yml` (passo de migration esquecida), `README.md`, `docs/deploy-producao.md`, `_bmad-output/planning-artifacts/architecture.md`, `_bmad-output/project-context.md`

## Change Log

- 2026-11-15: Tasks 1–6 — `db:migrate --env`, pooler local, jobs `migrations` e `deploy-migrations`, documentação.
- 2026-11-16: story validada pelo checklist do `create-story`; Tasks 7–8 abertas.
- 2026-11-16: Tasks 7–8 — `architecture.md` com o caminho único de conexão e os jobs do CI; job `ci` e fixture do `client.test.ts` pelo pooler local (54329). Status → review.
- 2026-11-16: code review (AI) — 1 High, 3 Medium, 3 Low registrados em "Review Follow-ups (AI)"; ACs 6 e 8 parciais. Status → in-progress.
- 2026-11-16: Addressed code review findings - 7 items resolved (Date: 2026-11-16): secret por ambiente no `deploy-migrations`, URL só do arquivo fora do CI, 54322 recusada no local, argumentos desconhecidos recusados, comentários e testes. Commit `0eea64e` na PR #51 com CI verde; P1 e P2 conferidos; P3 com secrets criados. Status → review.
- 2026-11-16: code review (AI), 2ª rodada — follow-ups da 1ª rodada conferidos; 5 Low corrigidos (`drizzle.config.ts`, docs, `GITHUB_ACTIONS`, constante, testes da montagem do `migrate.ts`). Status → done. P3 (conferir `deploy-migrations` no merge em `staging`) segue com o PO.
- 2026-11-17: code review (AI), 3ª rodada — review completo pedido pelo correct course de 2026-11-16 (Proposta 3). ACs 1–8 e 10 implementados; AC 9 parcial (`project-context.md`). 1 High, 2 Medium, 5 Low registrados em "Review Follow-ups (AI)". Validação: `migrate-env.test.ts` 37/37, `tsc` 0, `eslint` 0; PR #51 (`7771318`) com CI verde. Status → in-progress.
- 2026-11-17: Addressed code review findings - 7 items resolved (Date: 2026-11-17): `project-context.md` com os jobs de migration e as recusas; drizzle-kit com URL preguiçosa (`db:generate` sem `.env.local`); refs numa fonte só; loopback no local; `describeTarget` local sem projeto; CI pega migration esquecida; pooler dedicado aceito. Mudanças de project ref/drizzle-kit fora da story registradas. Commit `6022ef1` na PR #51 com CI verde. Status → review.
- 2026-11-17: code review (AI), 4ª rodada — 0 High, 1 Medium, 6 Low. Medium corrigido (comprovação dos ACs 8/10 amarrada a P3 e à nova P4, conferência do banco de staging). Low registrados no Dev Agent Record para decisão do PO; File List com o `sprint-change-proposal-2026-11-16.md`. Status → done. P3 e P4 seguem com o PO.
