# Story 1.3: Banco de Dados e Supabase Local

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want the database configured with Supabase running locally via Docker,
So that I can develop and test with a real PostgreSQL instance.

## Acceptance Criteria

1. PostgreSQL, Auth e Realtime estao rodando localmente via Docker apos executar `supabase start`
2. Drizzle ORM esta configurado em `src/server/infrastructure/database/client.ts`
3. `supabase/config.toml` esta configurado para o projeto Caderninho
4. `drizzle.config.ts` esta na raiz do projeto apontando para o banco local
5. O primeiro migration roda com sucesso criando as tabelas base do Better Auth (user, session, account, verification) e Organizations plugin (organization, member, invitation)
6. RLS esta habilitado nas tabelas com policies base de isolamento por organizacao
7. O comando `npm run db:push` ou `npm run db:migrate` funciona corretamente

## Tasks / Subtasks

- [x] Task 1: Instalar e configurar Supabase CLI local (AC: #1, #3)
  - [x] 1.1 Instalar Supabase CLI como devDependency: `npm install -D supabase`
  - [x] 1.2 Executar `npx supabase init` para criar `supabase/config.toml`
  - [x] 1.3 Configurar `supabase/config.toml` com `project_id = "caderninho"`, auth enabled, realtime enabled
  - [x] 1.4 Verificar que `supabase start` sobe PostgreSQL (porta 54322), Auth e Realtime via Docker
  - [x] 1.5 Adicionar `supabase` ao `.gitignore` (pasta `.supabase/` com dados locais, NAO a pasta `supabase/` de config)
  - [x] 1.6 Atualizar `.env.example` com `DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres`
  - [x] 1.7 Criar `.env.local` (gitignored) com a connection string real
  - [x] 1.8 Adicionar scripts ao `package.json`: `"db:start": "supabase start"`, `"db:stop": "supabase stop"`, `"db:status": "supabase status"`

- [x] Task 2: Instalar e configurar Drizzle ORM (AC: #2, #4)
  - [x] 2.1 Instalar dependencias: `npm install drizzle-orm postgres dotenv` e `npm install -D drizzle-kit`
  - [x] 2.2 Criar `drizzle.config.ts` na raiz do projeto com dialect `postgresql`, schema path `src/server/infrastructure/database/schema/index.ts`, out `src/server/infrastructure/database/migrations`
  - [x] 2.3 Criar `src/server/infrastructure/database/client.ts` com instancia do Drizzle usando driver `postgres` (postgres.js)
  - [x] 2.4 Escrever testes unitarios para o modulo de conexao (TDD — testar que exporta `db` corretamente, que usa DATABASE_URL)
  - [x] 2.5 Adicionar scripts ao `package.json`: `"db:generate": "drizzle-kit generate"`, `"db:migrate": "drizzle-kit migrate"`, `"db:push": "drizzle-kit push"`, `"db:studio": "drizzle-kit studio"`

- [x] Task 3: Criar schemas Drizzle para tabelas do Better Auth (AC: #5)
  - [x] 3.1 Criar `src/server/infrastructure/database/schema/auth.ts` com tabelas: `users`, `sessions`, `accounts`, `verifications`
  - [x] 3.2 Criar `src/server/infrastructure/database/schema/organizations.ts` com tabelas: `organizations`, `members`, `invitations`
  - [x] 3.3 Adicionar campo `active_organization_id` na tabela `sessions` (required pelo Organizations plugin)
  - [x] 3.4 Criar `src/server/infrastructure/database/schema/audit-logs.ts` com tabela `audit_logs` (somente INSERT — preparacao para Story 1.6)
  - [x] 3.5 Criar `src/server/infrastructure/database/schema/index.ts` exportando todos os schemas
  - [x] 3.6 Escrever testes para validar que schemas exportam corretamente e que tipos TypeScript estao corretos (TDD)
  - [x] 3.7 Usar naming convention: tabelas em plural snake_case (`users`, `sessions`, etc.), colunas em snake_case, tipos TS em camelCase

- [x] Task 4: Gerar e rodar primeira migration (AC: #5, #7)
  - [x] 4.1 Garantir que Supabase esta rodando (`npx supabase start`)
  - [x] 4.2 Executar `npm run db:generate` para gerar a migration SQL
  - [x] 4.3 Executar `npm run db:migrate` para aplicar no banco local
  - [x] 4.4 Verificar que todas as tabelas foram criadas: users, sessions, accounts, verifications, organizations, members, invitations, audit_logs
  - [x] 4.5 Verificar via `npx drizzle-kit studio` ou query direta que o schema esta correto

- [x] Task 5: Configurar RLS base (AC: #6)
  - [x] 5.1 Criar migration SQL customizada habilitando RLS em todas as tabelas
  - [x] 5.2 Criar policies base de isolamento por organizacao nas tabelas: organizations, members (usuarios so veem suas proprias organizacoes/memberships)
  - [x] 5.3 Tabela `audit_logs`: habilitar RLS, policy de INSERT only (sem SELECT/UPDATE/DELETE para usuarios regulares)
  - [x] 5.4 Tabelas de auth (users, sessions, accounts, verifications): policies que permitem usuarios acessarem apenas seus proprios dados
  - [x] 5.5 Documentar que policies completas de permissao granular serao implementadas nas Stories 1.4+ e Epic 8

- [x] Task 6: Validacao final (AC: #1-#7)
  - [x] 6.1 `npx supabase start` sobe todos os servicos sem erros
  - [x] 6.2 `npm run db:migrate` roda com sucesso (idempotente — sem erros se tabelas ja existem)
  - [x] 6.3 `npm run dev` funciona com Supabase rodando
  - [x] 6.4 `npm run build` compila sem erros
  - [x] 6.5 `npm test` roda e passa (todos os testes novos e existentes)
  - [x] 6.6 `npm run lint` sem erros
  - [x] 6.7 Verificar que `supabase/config.toml` esta no git e `.supabase/` esta no `.gitignore`

### Review Follow-ups (AI)

- [x] [AI-Review][HIGH] RLS policy `audit_logs_insert_service` excessivamente permissiva — `WITH CHECK (true)` permite qualquer role inserir. Restringir a service_role. [supabase/migrations/20260317000000_enable_rls.sql:79-80]
- [x] [AI-Review][MEDIUM] `dotenv` como production dependency — mover para devDependencies (so usado em drizzle.config.ts). [package.json:25]
- [x] [AI-Review][MEDIUM] Testes de schema verificam apenas existencia de colunas, nao constraints (notNull, unique, FK, defaults). [src/server/infrastructure/database/schema/schema.test.ts]
- [x] [AI-Review][MEDIUM] `supabase/.gitignore` nao documentado no File List da story. [supabase/.gitignore]
- [x] [AI-Review][MEDIUM] Risco de colisao de nome `accounts` (auth providers vs contas financeiras futuras) — resolver antes da Story de contas financeiras. [src/server/infrastructure/database/schema/auth.ts:27]
- [x] [AI-Review][LOW] Sem FK constraint em `sessions.active_organization_id` → `organizations.id`. [src/server/infrastructure/database/schema/auth.ts:22]
- [x] [AI-Review][LOW] Todas as FKs usam `ON DELETE no action` — avaliar CASCADE quando Better Auth for integrado (Story 1.4). [migrations/0000_odd_scarlet_witch.sql]

#### R2 Follow-ups

- [x] [AI-Review-R2][HIGH] Migration ordering: Supabase RLS migrations (`supabase/migrations/`) dependem de tabelas criadas pelo Drizzle (`drizzle-kit migrate`). Em fresh setup, `supabase start` aplica RLS migrations antes das tabelas existirem — `ALTER TABLE users ENABLE ROW LEVEL SECURITY` falha com "relation does not exist". Mover RLS para Drizzle migrations ou criar script de setup ordenado. [supabase/migrations/20260317000000_enable_rls.sql + supabase/migrations/20260317000001_fix_review_findings.sql]
- [x] [AI-Review-R2][MEDIUM] RLS policy `verifications_select_own` compara `auth.uid()::text` (UUID) com `identifier` (email/phone) — comparacao nunca sera verdadeira. Remover policy (RLS habilitado sem policy ja bloqueia SELECT, que e o comportamento desejado). [supabase/migrations/20260317000000_enable_rls.sql:44]
- [x] [AI-Review-R2][MEDIUM] Tabela `members` sem unique constraint em `(user_id, organization_id)` — permite memberships duplicadas no banco. Adicionar `UNIQUE (user_id, organization_id)`. [src/server/infrastructure/database/schema/organizations.ts:14]
- [x] [AI-Review-R2][LOW] RLS policies usam `auth.uid()` (Supabase Auth) mas projeto usa Better Auth — policies nao funcionais ate integracao JWT (Story 1.4+). Documentar dependencia explicitamente na migration. [supabase/migrations/20260317000000_enable_rls.sql:3-5]
- [x] [AI-Review-R2][LOW] `updatedAt` com `defaultNow()` so seta valor no INSERT, nao auto-atualiza em UPDATE. Avaliar `.$onUpdate()` ou trigger PostgreSQL na Story 1.4. [src/server/infrastructure/database/schema/auth.ts:14]

## Dev Notes

### Versoes Exatas do Stack (Story 1.3)

| Tecnologia | Versao | Pacote npm | Notas |
|---|---|---|---|
| Supabase CLI | 2.78.1 | `supabase` (devDep) | Docker local: PostgreSQL 17, Auth, Realtime |
| Drizzle ORM | 0.45.1 | `drizzle-orm` | TypeScript-native, SQL transparente |
| drizzle-kit | 0.31.10 | `drizzle-kit` (devDep) | Gera migrations, push, studio |
| postgres.js | 3.4.x | `postgres` | Driver PostgreSQL para Drizzle (NAO usar `pg`) |
| Better Auth | 1.5.5 | `better-auth` | NAO instalar nesta story — apenas criar os schemas Drizzle das tabelas |
| dotenv | latest | `dotenv` | Para carregar DATABASE_URL no drizzle.config.ts |
| Next.js | 16.1.6 | (ja instalado) | App Router, Turbopack |
| Vitest | 4.1.0 | (ja instalado) | Testes unitarios |

### ALERTA CRITICO: Better Auth — Schemas vs Instalacao

**NESTA STORY, NAO instalar o pacote `better-auth`.** A Story 1.3 cria apenas a infraestrutura de banco de dados. O pacote `better-auth` sera instalado e configurado na Story 1.4 (Registro e Login).

O que fazer nesta story:
1. Criar os schemas Drizzle manualmente baseados na documentacao do Better Auth
2. Os schemas devem ser compativeis com o que o Better Auth espera quando for instalado na Story 1.4
3. Usar tabelas em **plural** (`users`, `sessions`, etc.) conforme naming convention do projeto — na Story 1.4, configurar `usePlural: true` no adapter

### ALERTA CRITICO: Zod v3 vs v4 — Incompatibilidade com drizzle-orm/zod

O `project-context.md` lista Zod 4.3.6 como parte do stack, MAS:
- `drizzle-orm@0.45.1` tem suporte built-in a Zod via `drizzle-orm/zod` (substitui `drizzle-zod` deprecated)
- Este suporte built-in so funciona com **Zod v3**, NAO v4
- **Impacto**: quando Zod for instalado em stories futuras, verificar compatibilidade. Pode ser necessario usar Zod v3 ou aguardar suporte oficial do Drizzle para Zod v4
- **Nesta story**: Zod NAO e instalado, entao nao ha conflito imediato

### ALERTA: Driver PostgreSQL — postgres.js, NAO pg

O Drizzle ORM recomenda `postgres` (postgres.js) para Supabase, NAO `pg` (node-postgres):
- Pacote: `npm install postgres`
- Import: `import postgres from 'postgres'`
- Drizzle adapter: `import { drizzle } from 'drizzle-orm/postgres-js'`
- Para pooler Supabase (producao): desabilitar prepare com `postgres(url, { prepare: false })`

### ALERTA: Supabase CLI — Portas Padrao

| Servico | Porta | Uso |
|---|---|---|
| API URL (Kong) | 54321 | Supabase client API |
| PostgreSQL direto | 54322 | **Usar esta para Drizzle** |
| Studio (dashboard) | 54323 | Interface visual |
| Mailpit (email testing) | 54324 | Testes de email |

**Connection string para desenvolvimento:**
```
postgresql://postgres:postgres@localhost:54322/postgres
```

### ALERTA: Better Auth — Tabelas e Colunas Esperadas

O Better Auth 1.5.5 espera as seguintes tabelas e colunas. Os schemas Drizzle DEVEM corresponder exatamente:

**Core tables:**

```sql
-- users (Better Auth espera "user" singular, mas usaremos "users" com usePlural)
CREATE TABLE users (
  id TEXT PRIMARY KEY,              -- UUID string
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- sessions
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  token TEXT NOT NULL UNIQUE,       -- Hash do token de sessao
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  active_organization_id TEXT,      -- Organizations plugin
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- accounts (provedores de autenticacao: email, google, etc.)
CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  account_id TEXT NOT NULL,         -- ID no provedor externo
  provider_id TEXT NOT NULL,        -- "credential", "google", etc.
  access_token TEXT,
  refresh_token TEXT,
  access_token_expires_at TIMESTAMP WITH TIME ZONE,
  refresh_token_expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  id_token TEXT,
  password TEXT,                    -- Hash da senha (provider "credential")
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- verifications (tokens de verificacao de email, reset de senha, etc.)
CREATE TABLE verifications (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,         -- Email ou outro identificador
  value TEXT NOT NULL,              -- Token ou codigo
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

**Organizations plugin tables:**

```sql
-- organizations
CREATE TABLE organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  logo TEXT,
  metadata TEXT,                    -- JSON metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- members
CREATE TABLE members (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- invitations
CREATE TABLE invitations (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  inviter_id TEXT NOT NULL REFERENCES users(id),
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  role TEXT NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, rejected, canceled
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

**Tabela de auditoria (preparacao para Story 1.6):**

```sql
-- audit_logs (somente INSERT, nunca UPDATE ou DELETE)
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,                     -- Quem fez (null para acoes de sistema)
  organization_id TEXT,             -- Contexto da organizacao
  action TEXT NOT NULL,             -- 'create', 'update', 'delete'
  entity_type TEXT NOT NULL,        -- 'transaction', 'account', etc.
  entity_id TEXT NOT NULL,          -- ID da entidade afetada
  old_value JSONB,                  -- Valor anterior (para update/delete)
  new_value JSONB,                  -- Valor novo (para create/update)
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### ALERTA: Drizzle Schema — Mapping snake_case para camelCase

O Drizzle converte automaticamente. Exemplo correto:

```typescript
import { pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),  // TS: emailVerified → DB: email_verified
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
```

### ALERTA: RLS — Escopo desta Story

Esta story configura RLS **base** (isolamento minimo):
- `users`: usuarios so veem seus proprios dados (`auth.uid() = id`)
- `sessions`: usuarios so veem suas proprias sessoes
- `organizations`: via membership (usuarios so veem organizacoes onde sao membros)
- `members`: usuarios so veem suas proprias memberships
- `audit_logs`: INSERT only para funcao de servico, sem acesso direto de usuarios

**NAO implementar nesta story:**
- Permissoes granulares (vem no Epic 8)
- Middleware de autorizacao na aplicacao (vem na Story 1.6)
- Verificacao de papeis (admin vs member) — vem na Story 1.4+

**NOTA IMPORTANTE sobre RLS e Drizzle:**
O Drizzle ORM conecta ao PostgreSQL com a role `postgres` (superuser no Supabase local), que **bypassa RLS**. Isso e intencional para Server Actions — a segunda camada de autorizacao e o middleware na aplicacao (defesa em profundidade). O RLS protege contra acesso direto via Supabase client (browser → Supabase Realtime).

### drizzle.config.ts — Configuracao Exata

```typescript
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './src/server/infrastructure/database/migrations',
  schema: './src/server/infrastructure/database/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Estrutura de Arquivos a Criar

**Novos arquivos:**
- `drizzle.config.ts` — config Drizzle na raiz
- `supabase/config.toml` — config Supabase CLI (gerado pelo `supabase init`, editado)
- `src/server/infrastructure/database/client.ts` — instancia Drizzle
- `src/server/infrastructure/database/client.test.ts` — testes do client
- `src/server/infrastructure/database/schema/auth.ts` — tabelas users, sessions, accounts, verifications
- `src/server/infrastructure/database/schema/organizations.ts` — tabelas organizations, members, invitations
- `src/server/infrastructure/database/schema/audit-logs.ts` — tabela audit_logs
- `src/server/infrastructure/database/schema/index.ts` — barrel export de todos os schemas
- `src/server/infrastructure/database/schema/schema.test.ts` — testes dos schemas
- `src/server/infrastructure/database/migrations/` — pasta com migrations geradas pelo drizzle-kit

**Arquivos a modificar:**
- `package.json` — novas dependencias e scripts db:*
- `package-lock.json` — lock file atualizado
- `.env.example` — adicionar DATABASE_URL e SUPABASE_* vars
- `.gitignore` — adicionar `.supabase/`

**Arquivos que NAO devem ser modificados:**
- `src/app/globals.css` — design system intacto
- `src/app/layout.tsx` — layout intacto
- `src/client/**` — nenhum componente frontend nesta story
- `src/shared/types/result.ts` — intacto
- `vitest.config.ts` — intacto (aliases ja corretos)
- `tsconfig.json` — intacto (aliases ja corretos)

### O Que NAO Fazer Nesta Story

- **NAO instalar** Better Auth (`better-auth`) — apenas criar schemas Drizzle compativeis
- **NAO instalar** Zod — validacao vem em stories futuras
- **NAO criar** rotas de autenticacao (login, register) — vem na Story 1.4
- **NAO criar** middleware de autorizacao — vem na Story 1.6
- **NAO criar** Server Actions ou Use Cases — apenas infraestrutura de banco
- **NAO configurar** Supabase Realtime no codigo — apenas garantir que esta rodando via Docker
- **NAO modificar** componentes de UI ou layout
- **NAO criar** `tailwind.config.ts` (Tailwind v4 nao usa)
- **NAO instalar** React Hook Form ou Playwright

### Inteligencia da Story Anterior (1.2)

**O que ja existe e DEVE ser preservado:**
- Projeto Next.js 16.1.6 + TypeScript 5.9.3 + Tailwind CSS v4 + React 19.2.3
- shadcn/ui com 11 componentes em `src/client/components/ui/`
- Design tokens Stone & Indigo em `globals.css`
- Sidebar colapsavel + Bottom Navigation + Layout responsivo
- DensityProvider com context React
- 52 testes passando (24 de componente + 28 de utilidades)
- ESLint configurado
- Result<T> em `src/shared/types/result.ts`

**Aprendizados do code review da Story 1.2 (CRITICO — evitar ciclo de 7 rounds):**
- **Maximo 3 rounds de review** — R1-R2 capturam HIGHs/MEDIUMs reais, R3 e o limite
- **LOWs e refatoracoes NAO sao blocking** — aceitar como backlog
- **Nao pedir refatoracoes em code review** — geram codigo novo que gera mais findings
- **Se pedir "criar X", especificar tudo na mesma rodada** — incluir testes e edge cases
- localStorage mock necessario nos testes jsdom (Node.js 22+) — usar `vi.stubGlobal`

**Commits recentes (padrao a seguir):**
```
feat: add design system and responsive layout (Story 1.2)
fix: resolve code review R7 findings for Story 1.2
```

### Project Structure Notes

- Database schemas ficam em `src/server/infrastructure/database/schema/`
- Migrations ficam em `src/server/infrastructure/database/migrations/`
- Database client fica em `src/server/infrastructure/database/client.ts`
- `drizzle.config.ts` fica na raiz do projeto (necessario para drizzle-kit CLI)
- `supabase/config.toml` fica na pasta `supabase/` (criada pelo supabase init)
- Testes co-localizados com os arquivos testados (`.test.ts` ao lado)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Stack Completo Definido]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- [Source: _bmad-output/planning-artifacts/architecture.md#3 Ambientes Isolados]
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns — Banco de Dados]
- [Source: _bmad-output/planning-artifacts/architecture.md#Complete Project Directory Structure]
- [Source: _bmad-output/planning-artifacts/architecture.md#Monitoramento e Logging — Trilha de Auditoria]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3: Banco de Dados e Supabase Local]
- [Source: _bmad-output/project-context.md#Technology Stack & Versions]
- [Source: _bmad-output/project-context.md#Code Quality & Architecture Rules]
- [Source: _bmad-output/implementation-artifacts/1-2-design-system-e-layout-responsivo.md#Dev Notes]
- [Source: Drizzle ORM docs — https://orm.drizzle.team/docs/get-started/supabase-new]
- [Source: Better Auth docs — https://better-auth.com/docs/adapters/drizzle]
- [Source: Better Auth Organizations — https://better-auth.com/docs/plugins/organization]
- [Source: Supabase CLI docs — https://supabase.com/docs/guides/local-development]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Supabase `vector` container requer mount do Docker socket que e incompativel com Colima (virtiofs). Solucao: `--exclude vector` no `db:start` script.
- `dotenv/config` carrega `.env` por padrao, nao `.env.local`. `drizzle.config.ts` atualizado para `config({ path: '.env.local' })`.

### Completion Notes List

- Supabase CLI instalado como devDependency, `supabase init` executado, config.toml gerado com project_id "caderninho"
- Drizzle ORM configurado com driver postgres.js, conexao via DATABASE_URL, instancia exportada com schema completo
- 8 schemas Drizzle criados compativeis com Better Auth 1.5.5: users, sessions, accounts, verifications, organizations, members, invitations, audit_logs
- Primeira migration gerada e aplicada com sucesso — 8 tabelas no banco local
- RLS habilitado em todas as 8 tabelas com 10 policies base de isolamento
- 12 testes novos (2 client + 10 schema) — total 64 testes passando, zero regressoes
- Build, lint, dev — tudo passando sem erros
- ✅ Resolved review finding [HIGH]: RLS policy audit_logs_insert_service restrita a service_role via nova migration
- ✅ Resolved review finding [MEDIUM]: dotenv movido para devDependencies
- ✅ Resolved review finding [MEDIUM]: Testes de schema expandidos com verificacao de constraints (notNull, unique, hasDefault, primaryKey) — 8 testes novos, total 72
- ✅ Resolved review finding [MEDIUM]: supabase/.gitignore documentado no File List
- ✅ Resolved review finding [MEDIUM]: Risco de colisao de nome accounts documentado com comentario no schema
- ✅ Resolved review finding [LOW]: FK constraint sessions.active_organization_id → organizations.id adicionado via SQL migration
- ✅ Resolved review finding [LOW]: ON DELETE cascade evaluation documentada como TODO para Story 1.4
- ✅ Resolved R2 finding [HIGH]: Migration ordering — RLS SQL consolidado em Drizzle migration 0001, deletadas migrations do Supabase que causavam falha em fresh setup
- ✅ Resolved R2 finding [MEDIUM]: Policy verifications_select_own removida (comparava UUID com email, nunca matcharia). RLS habilitado sem policy ja bloqueia SELECT.
- ✅ Resolved R2 finding [MEDIUM]: Unique constraint UNIQUE(user_id, organization_id) adicionado na tabela members via schema Drizzle + migration
- ✅ Resolved R2 finding [LOW]: Dependencia auth.uid() documentada explicitamente na migration com explicacao sobre Better Auth vs Supabase Auth
- ✅ Resolved R2 finding [LOW]: Comportamento updatedAt documentado em auth.ts com opcoes para Story 1.4 (.$onUpdate ou trigger PostgreSQL)

### Change Log

- 2026-03-17: Implementacao completa da Story 1.3 — Banco de Dados e Supabase Local
- 2026-03-17: Code Review R1 — 7 findings (1 HIGH, 4 MEDIUM, 2 LOW). Action items criados em Review Follow-ups.
- 2026-03-17: Addressed code review findings — 7/7 items resolved (1 HIGH, 4 MEDIUM, 2 LOW)
- 2026-03-17: Code Review R2 — 5 findings (1 HIGH, 2 MEDIUM, 2 LOW). Action items criados em R2 Follow-ups.
- 2026-03-17: Addressed code review R2 findings — 5/5 items resolved (1 HIGH, 2 MEDIUM, 2 LOW)
- 2026-03-17: Code Review R3 (final) — APPROVED. All R1+R2 fixes validated, 0 new findings. Status → done.

### File List

**Novos arquivos:**
- `drizzle.config.ts` — configuracao Drizzle Kit (raiz)
- `supabase/config.toml` — configuracao Supabase CLI local
- `supabase/.gitignore` — gitignore gerado pelo Supabase CLI (exclui .branches, .temp, .env files)
- `src/server/infrastructure/database/migrations/0001_freezing_meteorite.sql` — unique constraint members + RLS consolidado (movido de supabase/migrations/)
- `src/server/infrastructure/database/migrations/meta/0001_snapshot.json` — snapshot Drizzle para migration 0001
- `src/server/infrastructure/database/client.ts` — instancia Drizzle ORM
- `src/server/infrastructure/database/client.test.ts` — 2 testes do client
- `src/server/infrastructure/database/schema/auth.ts` — tabelas users, sessions, accounts, verifications
- `src/server/infrastructure/database/schema/organizations.ts` — tabelas organizations, members, invitations
- `src/server/infrastructure/database/schema/audit-logs.ts` — tabela audit_logs
- `src/server/infrastructure/database/schema/index.ts` — barrel export
- `src/server/infrastructure/database/schema/schema.test.ts` — 10 testes dos schemas
- `src/server/infrastructure/database/migrations/0000_odd_scarlet_witch.sql` — migration inicial (8 tabelas)
- `src/server/infrastructure/database/migrations/meta/0000_snapshot.json` — snapshot Drizzle
- `src/server/infrastructure/database/migrations/meta/_journal.json` — journal Drizzle

**Arquivos modificados:**
- `package.json` — dependencias (drizzle-orm, postgres, dotenv, drizzle-kit, supabase) + scripts db:*
- `package-lock.json` — lock file atualizado
- `.env.example` — DATABASE_URL com valor padrao local
- `.gitignore` — adicionado `.supabase/`
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — story 1.2 done, 1.3 in-progress
- `_bmad-output/implementation-artifacts/1-2-design-system-e-layout-responsivo.md` — status done
- `_bmad-output/implementation-artifacts/1-3-banco-de-dados-e-supabase-local.md` — tasks completadas, status review
- `src/server/infrastructure/database/schema/organizations.ts` — unique constraint em members(user_id, organization_id)
- `src/server/infrastructure/database/schema/auth.ts` — documentacao updatedAt behavior
- `src/server/infrastructure/database/schema/schema.test.ts` — teste do unique constraint

**Arquivos deletados:**
- `supabase/migrations/20260317000000_enable_rls.sql` — RLS movido para Drizzle migration 0001
- `supabase/migrations/20260317000001_fix_review_findings.sql` — fixes movidos para Drizzle migration 0001
