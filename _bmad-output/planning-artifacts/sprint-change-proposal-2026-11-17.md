# Sprint Change Proposal — 2026-11-17

**Projeto:** Caderninho
**Gatilho:** Story 1.13 (Ambiente local igual a staging e produção) — code review (AI), 6ª rodada, follow-up High
**Modo:** Incremental (7 propostas aprovadas uma a uma pelo PO)
**Escopo:** Minor — implementação direta pelo dev (`dev-story` da Story 1.13)

## 1. Resumo do problema

O AC 2 da Story 1.13 definiu `.env.production.local` como o arquivo local da migration de produção. O Next carrega esse mesmo arquivo em todo `npm run build`/`npm run start` local (`NODE_ENV=production`), com prioridade sobre o `.env.local`. Resultado: o build e o servidor locais passam a usar o banco e os segredos de produção.

**Como foi descoberto:** 6ª rodada do code review da Story 1.13 (2026-11-17).

**Evidência** (`loadEnvConfig` do `@next/env`, modo produção, sem imprimir segredos):

```
arquivos: .env.production.local, .env.local
DATABASE_URL do build → aws-1-us-east-2.pooler.supabase.com:6543 ENVIRONMENT=production
```

O arquivo também contém `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` e `ENVIRONMENT` de produção. O "`next build` ok" da validação do AC 10 foi feito com esses valores, e um `npm run start` local gravaria no banco de produção.

**Tipo:** limitação técnica descoberta na implementação (conflito de nome com a convenção do Next).

## 2. Análise de impacto

### Épicos

- **Épico 1:** segue viável; só o AC 2 da Story 1.13 muda, com uma task nova (Task 9). O texto da Story 1.13 no `epics.md` não cita os nomes dos arquivos.
- **Story 1.15 (backlog):** o AC do hook que bloqueia a leitura dos arquivos de banco remoto cita os nomes antigos — atualizado no `epics.md`.
- Nenhum épico fica obsoleto, nenhum novo, ordem inalterada.

### Artefatos

| Artefato | Impacto |
|---|---|
| PRD | Nenhum (sem referência a arquivos `.env` ou staging) |
| UX | Nenhum |
| `architecture.md` | Tabela "3 Ambientes Isolados" com os nomes novos e o motivo |
| `project-context.md` | Nomes novos e proibição de `.env.production*`/`.env.development*` |
| `epics.md` | AC da Story 1.15 |
| Story 1.13 | AC 2, Task 9, follow-up High, Ações do PO (P2, P5) |
| `.gitignore` | **Crítico:** `.env*.local` não cobre `.env.migrate.*` |
| Código | `scripts/lib/migrate-env.ts` (`ENV_FILES`), teste, comentário de `scripts/migrate.ts` |
| Documentação | README, `docs/deploy-producao.md` |
| Arquivos locais do PO | Renomear e deixar só o `DATABASE_URL` |

### Técnico

- Sem mudança de lógica: só o mapeamento ambiente → arquivo, mensagens e documentação.
- CI e `deploy-migrations` não mudam (no GitHub Actions a URL vem do secret, sem arquivo).

## 3. Abordagem recomendada

**Opção 1 — Ajuste direto** (escolhida). Esforço baixo, risco baixo, sem impacto no cronograma.

- Opção 2 (rollback): não viável — nada a desfazer.
- Opção 3 (revisão do MVP): não se aplica.
- Alternativa considerada e descartada pelo PO: manter `.env.production.local` só com o `DATABASE_URL` — o build local continuaria apontando para o banco de produção.
- Decisão do PO: renomear **os dois** arquivos remotos (`.env.migrate.staging`, `.env.migrate.production`) por consistência, embora o Next não carregue `.env.staging.local`.

## 4. Propostas de mudança detalhadas

### 4.1 Story 1.13 — AC 2

**Antes:**
> 2. **Given** `npm run db:migrate -- --env <local|staging|production>` **When** o script roda **Then** carrega o arquivo do ambiente (`.env.local`, `.env.staging.local`, `.env.production.local`), cujo `DATABASE_URL` prevalece sobre qualquer outro, e imprime o destino **sem a senha** (ambiente, host, porta).

**Depois:**
> 2. **Given** `npm run db:migrate -- --env <local|staging|production>` **When** o script roda **Then** carrega o arquivo do ambiente (`.env.local`, `.env.migrate.staging`, `.env.migrate.production`), cujo `DATABASE_URL` prevalece sobre qualquer outro, e imprime o destino **sem a senha** (ambiente, host, porta). Os arquivos de staging e produção têm só o `DATABASE_URL`, e os nomes não podem ser carregados pelo Next (o Next lê `.env.production.local` em todo `next build`/`next start`), nem entrar no git (`.gitignore`).

**Justificativa:** o nome antigo coincide com a convenção do Next; o novo fica fora dela (`.env`, `.env.local`, `.env.[modo]`, `.env.[modo].local`).

### 4.2 Story 1.13 — nova Task 9

```
- [ ] Task 9 (AC: #2, #9, #10): renomear os arquivos de migration remota (correct course 2026-11-17)
  - [ ] 9.1 TDD em `scripts/lib/migrate-env.test.ts`: `envFileFor`/`envFilePath` devolvem
        `.env.migrate.staging` e `.env.migrate.production`; mensagens de erro citam os nomes novos
  - [ ] 9.2 `scripts/lib/migrate-env.ts` (`ENV_FILES`) e o comentário de uso de `scripts/migrate.ts`
  - [ ] 9.3 `.gitignore`: padrão `.env.migrate.*`; conferir com `git check-ignore` que os dois nomes ficam ignorados
  - [ ] 9.4 Teste de que o Next não carrega os arquivos novos: `loadEnvConfig` (`@next/env`) em modo
        produção, num diretório temporário com `.env.migrate.production`, não deve carregar o arquivo
  - [ ] 9.5 README, `docs/deploy-producao.md`, `project-context.md` e `architecture.md` com os nomes novos,
        explicando que o arquivo de migration tem só o `DATABASE_URL`, não espelha a Vercel e não pode
        se chamar `.env.production.local` (atende também o follow-up Low da 6ª rodada sobre a documentação)
  - [ ] 9.6 Validação completa (`tsc`, `eslint`, `vitest`, `next build` sem `.env.production.local`) e conferir com
        `loadEnvConfig` que o build local carrega só o `.env.local`
```

O follow-up High da 6ª rodada recebe a nota "resolvido pela Task 9 (correct course 2026-11-17)"; é marcado `[x]` só quando a Task 9 terminar, pelo `dev-story`.

### 4.3 `.gitignore`

**Antes:**
```
.env
.env.local
.env*.local
```

**Depois:**
```
.env
.env.local
.env*.local
# Arquivos de migration remota (Story 1.13): só o DATABASE_URL de staging/produção.
.env.migrate.*
```

**Justificativa:** sem a linha, o arquivo com a senha de produção poderia ser commitado. Deve entrar **antes** de o PO renomear os arquivos (P5). Implementado na Task 9.3.

### 4.4 `architecture.md` — "3 Ambientes Isolados"

**Antes:**
```
| **Staging** | Pooler do projeto Supabase de staging, porta **6543** | `.env.staging.local` |
| **Production** | Pooler do projeto Supabase de produção, porta **6543** | `.env.production.local` |
```

**Depois:**
```
| **Staging** | Pooler do projeto Supabase de staging, porta **6543** | `.env.migrate.staging` |
| **Production** | Pooler do projeto Supabase de produção, porta **6543** | `.env.migrate.production` |

- Os arquivos `.env.migrate.*` têm só o `DATABASE_URL`, ficam no `.gitignore` e não espelham a Vercel.
  O nome não pode ser `.env.production.local`: o Next carrega esse arquivo em todo `next build`/`next start`
  local, com prioridade sobre o `.env.local`, e o app local passaria a usar o banco e os segredos de produção
  (correct course 2026-11-17).
```

**Justificativa:** registrar decisão e motivo, para ninguém "padronizar" de volta. Implementado na Task 9.5.

### 4.5 `project-context.md` — "3 Ambientes isolados"

**Antes:**
```
- **Staging**: Vercel preview + projeto Supabase de staging; `.env.staging.local` pelo pooler 6543
- **Production**: Vercel production + projeto Supabase de produção; `.env.production.local` pelo pooler 6543
```

**Depois:**
```
- **Staging**: Vercel preview + projeto Supabase de staging; migrations manuais pelo `.env.migrate.staging` (pooler 6543)
- **Production**: Vercel production + projeto Supabase de produção; migrations manuais pelo `.env.migrate.production` (pooler 6543)
- Arquivos `.env.migrate.*`: só o `DATABASE_URL`, no `.gitignore`. Nunca criar `.env.production.local`
  (nem `.env.production`/`.env.development*`): o Next carrega esses arquivos e o app local usaria outro banco
```

**Justificativa:** regra lida pelos agentes antes de implementar. Implementado na Task 9.5.

### 4.6 `epics.md` — AC da Story 1.15

**Antes:**
> **When** o `Bash` tenta rodar o `migrate`/`db:migrate` com `--env staging|production` ou ler `.env.staging.local`/`.env.production.local`

**Depois:**
> **When** o `Bash` tenta rodar o `migrate`/`db:migrate` com `--env staging|production` ou ler `.env.migrate.staging`/`.env.migrate.production` (ou os nomes antigos `.env.staging.local`/`.env.production.local`, caso ainda existam em alguma máquina)

**Justificativa:** a Story 1.15 está em `backlog`; o `create-story` dela parte do texto certo. Arquivos antigos esquecidos continuam com segredos.

### 4.7 Story 1.13 — Ações do PO

**Novo:**
```
- [ ] P5 (AC: #2): depois do merge da Task 9 (com o `.gitignore` novo já no branch), renomear os arquivos locais
      e deixar neles só o `DATABASE_URL`:
      `mv .env.staging.local .env.migrate.staging && mv .env.production.local .env.migrate.production`;
      apagar as outras linhas (`BETTER_AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, chaves do Google, `ENVIRONMENT`);
      conferir com `git status` que os arquivos não aparecem e com `npm run db:migrate -- --env staging`
      que o destino é o projeto de staging
```

**P2 — antes:** `- [x] P2 (AC: #3): \`.env.production.local\` na porta 6543`
**P2 — depois:** `- [x] P2 (AC: #3): \`.env.production.local\` na porta 6543 (renomeado na P5 para \`.env.migrate.production\`)`

**Justificativa:** arquivos com credenciais remotas são do PO (regra "Bancos remotos"); o `db:migrate --env staging` também.

## 5. Handoff de implementação

**Classificação:** Minor.

| Quem | Responsabilidade |
|---|---|
| Correct course (este workflow) | Aplicar 4.6 (`epics.md`) — feito |
| `create-story` (Story 1.13) | Aplicar na story 4.1 (AC 2), 4.2 (Task 9 e nota no follow-up High) e 4.7 (P2, P5), validar pelo checklist; status continua `in-progress`. (O hook do processo bloqueia o correct-course de editar stories; o PO escolheu o `create-story`, como no correct course de 2026-11-16.) |
| Dev (`/bmad-bmm-dev-story` da Story 1.13) | Task 9 completa (4.3, 4.4, 4.5 e código/testes/docs) e os 3 Low abertos da 6ª rodada |
| PO | P5 (renomear arquivos locais, só `DATABASE_URL`, conferência em staging); P3/P4 seguem pendentes |
| Code review (`/bmad-bmm-code-review`) | 7ª rodada depois do `dev-story` |

**Critérios de sucesso:**

- `loadEnvConfig` em modo produção, na raiz do repositório, carrega só o `.env.local` (sem `.env.production.local`).
- `git check-ignore .env.migrate.staging .env.migrate.production` confirma os dois ignorados.
- `npm run db:migrate -- --env staging` lê o `.env.migrate.staging` (conferido pelo PO).
- `tsc` 0, `eslint` 0, `vitest` 100%, `next build` ok; CI da PR #51 verde.

**Aprovação:** PO aprovou em 2026-11-17 (7 propostas aprovadas uma a uma; proposta completa aprovada).

**Ordem:** edições deste workflow (`epics.md`) → `create-story` (edições da story) → `dev-story` (Task 9, `.gitignore` antes de tudo) → P5 do PO → code review.
