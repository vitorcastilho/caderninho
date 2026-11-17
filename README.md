# Caderninho

[![CI](https://github.com/vitorcastilho/caderninho/actions/workflows/ci.yml/badge.svg)](https://github.com/vitorcastilho/caderninho/actions/workflows/ci.yml)

App de gestão financeira familiar. Feito para famílias que querem ter controle real sobre o dinheiro — sem planilha, sem complexidade de app bancário.

### O que o Caderninho faz

- **Registro de gastos e receitas** — input rápido com categorização automática (Cascade Input)
- **Orçamentos por categoria** — define limites mensais e acompanha em tempo real
- **Cartão de crédito** — parcelas, fatura estimada e reconciliação com a fatura real
- **Gastos recorrentes** — contas fixas, variáveis e parceladas com checklist mensal
- **Compartilhamento familiar** — membros da família acessam os mesmos dados com permissões granulares (visualizar, editar, admin)
- **Dashboard analítico** — visão consolidada com drill-down por categoria, período e método de pagamento
- **Projeção futura** — timeline de parcelas ativas e margem disponível projetada
- **Multi-tenant** — cada família é uma organização isolada (dados nunca se cruzam)

## Stack

| Tecnologia | Versão | Função |
|---|---|---|
| Next.js | 16.1.6 | Framework full-stack (App Router, Server Actions, Turbopack) |
| TypeScript | 5.9.3 | Linguagem (strict mode) |
| React | 19.2.3 | UI |
| Tailwind CSS | 4.x | Estilização (config via CSS, sem `tailwind.config.ts`) |
| shadcn/ui | 4.x | Design system (componentes base) |
| Supabase | — | PostgreSQL + Auth + Realtime (WebSocket direto browser) |
| Drizzle ORM | 0.45.1 | ORM TypeScript-native com migrations versionadas |
| Better Auth | 1.5.5 | Autenticação (email/senha + Google OAuth + Organizations) |
| Vitest | 4.1.0 | Testes unitários (TDD) |
| Playwright | 1.58.x | Testes E2E |
| Zod | 4.3.6 | Validação de schemas (compartilhado front/back) |
| Vercel | — | Deploy (preview automático + produção) |

## Pré-requisitos

- **Node.js** 22+ ([download](https://nodejs.org/))
- **Docker Desktop** rodando (para Supabase local) ([download](https://www.docker.com/products/docker-desktop/))
- **Supabase CLI** (`npm install -g supabase`)
- **Git**

## Setup Local

```bash
# 1. Clone o repositório
git clone https://github.com/vitorcastilho/caderninho.git
cd caderninho

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Preencha os valores (veja seção "Variáveis de Ambiente" abaixo)

# 4. Suba o Supabase local (PostgreSQL + Auth + Realtime via Docker)
npm run db:start
# Primeira vez demora ~2min (baixa imagens Docker)
# Ao final, exibe as URLs e chaves — copie para o .env.local

# 5. Rode as migrations do banco
npm run db:migrate

# 6. Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

Para parar o Supabase local: `npm run db:stop`.

## Variáveis de Ambiente

Copie `.env.example` para `.env.local` e preencha os valores.

**Obrigatórias** (app não funciona sem):

| Variável | Descrição | Como obter |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL da API do Supabase | Output de `npm run db:start` ou `npm run db:status` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima do Supabase | Output de `npm run db:start` ou `npm run db:status` |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço (acesso admin) | Output de `npm run db:start` ou `npm run db:status` |
| `DATABASE_URL` | Connection string do PostgreSQL **pelo pooler em modo transação** (mesmo caminho de staging/produção) | Local: `postgresql://postgres.pooler-dev:postgres@127.0.0.1:54329/postgres` (confira com `npm run db:status`) |
| `BETTER_AUTH_SECRET` | Secret para assinatura de sessões (32+ chars) | Gerar com `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | URL base da aplicação | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | URL pública da aplicação | `http://localhost:3000` |

**Opcionais** (funcionalidade específica):

| Variável | Descrição | Quando precisa |
|---|---|---|
| `GOOGLE_CLIENT_ID` | Client ID do Google OAuth | Só se quiser login com Google |
| `GOOGLE_CLIENT_SECRET` | Client Secret do Google OAuth | Só se quiser login com Google |

**Automáticas** (já têm valor padrão no `.env.example`):

| Variável | Valor padrão | Descrição |
|---|---|---|
| `NODE_ENV` | `development` | Ambiente Node.js |
| `ENVIRONMENT` | `development` | Ambiente da aplicação (`development`, `staging`, `production`) |

## Scripts

| Script | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Turbopack) |
| `npm run build` | Compila para produção |
| `npm run start` | Servidor de produção (requer `build` antes) |
| `npm run lint` | ESLint |
| `npm run type-check` | Verifica tipos TypeScript (`tsc --noEmit`) |
| `npm run test` | Testes unitários (Vitest) |
| `npm run test:watch` | Testes em modo watch (re-roda ao salvar) |
| `npm run test:coverage` | Testes com relatório de cobertura |
| `npm run test:e2e` | Testes E2E headless (Playwright) |
| `npm run test:e2e:ui` | Testes E2E com interface visual |
| `npm run db:start` | Sobe Supabase local (PostgreSQL + Auth + Realtime) |
| `npm run db:stop` | Para o Supabase local |
| `npm run db:status` | Mostra URLs e chaves do Supabase local |
| `npm run db:generate` | Gera migration a partir de mudanças no schema Drizzle |
| `npm run db:migrate` | Aplica migrations pendentes no banco local (`.env.local`, exige o pooler na porta 54329) |
| `npm run db:migrate -- --env staging` | Aplica no staging (`.env.staging.local`, exige porta 6543) |
| `npm run db:migrate -- --env production --confirm-production` | Aplica em produção (`.env.production.local`, exige porta 6543 e confirmação) |
| `npm run db:reset:local` | Zera o Supabase local e aplica todas as migrations do zero pelo pooler (destrói os dados locais) |
| `npm run db:push` | Sincroniza schema direto no banco local (dev only, sem migration; `db:push`/`db:studio` só aceitam o `.env.local` no pooler 54329 desta máquina — o `db:generate` não conecta no banco e não precisa do `.env.local`) |
| `npm run db:studio` | Abre Drizzle Studio (interface visual do banco) |

## Banco de Dados

### Um só caminho de conexão em todos os ambientes (Story 1.13)

| Ambiente | Conexão do app e das migrations | Arquivo local |
|---|---|---|
| Local | Pooler do Supabase local (Supavisor) em **modo transação**, porta `54329` | `.env.local` |
| Staging | Pooler do Supabase em **modo transação**, porta `6543` | `.env.staging.local` |
| Produção | Pooler do Supabase em **modo transação**, porta `6543` | `.env.production.local` |

- O modo transação não aceita prepared statements: o cliente usa `prepare: false` (Story 1.10).
- Testes de banco e de migrations valem só no Supabase (local zerado com `npm run db:reset:local`, staging ou produção) — nunca num Postgres "puro", que não tem `auth.uid()` e os demais objetos do Supabase.
- Os arquivos `.env.*.local` espelham as variáveis da Vercel de cada ambiente e nunca são commitados.
- O `db:migrate` lê o `DATABASE_URL` **só do arquivo do ambiente**: um `DATABASE_URL` exportado no terminal é ignorado (só o GitHub Actions usa a variável do job). Ele recusa o local fora de `127.0.0.1:54329`, staging/produção fora da 6543 ou com o project ref de outro ambiente (staging e produção têm o mesmo host:porta no pooler compartilhado; o ref vem do usuário `postgres.<ref>` ou, no pooler dedicado, do host `db.<ref>.supabase.co`; os refs ficam só em `scripts/lib/migrate-env.ts`), produção sem `--confirm-production` e argumentos desconhecidos — inclusive o esquecimento do `--` (`npm run db:migrate -- --env staging`).
- No pipeline, as migrations de staging e produção rodam sozinhas depois do merge (ver "Migrations automáticas").

O projeto usa **Drizzle ORM** com PostgreSQL (via Supabase). Schemas são definidos em TypeScript e migrations são versionadas.

### Fluxo de trabalho com migrations

```bash
# 1. Edite o schema em src/server/infrastructure/db/schema/
# 2. Gere a migration
npm run db:generate
# Cria arquivo SQL em src/server/infrastructure/database/migrations/

# 3. Aplique a migration
npm run db:migrate

# 4. Verifique o resultado
npm run db:studio
# Abre interface visual em http://localhost:4983
```

### Comandos úteis

```bash
# Resetar banco local e testar as migrations do zero (destrói todos os dados locais)
npm run db:reset:local

# Ver dados no banco
npm run db:studio

# Sincronizar schema sem criar migration (dev rápido)
npm run db:push

# Ver status do Supabase (URLs, chaves, portas)
npm run db:status
```

### Convenções de schema

- Tabelas em **plural, snake_case**: `transactions`, `audit_logs`
- Colunas em **snake_case**: `amount_cents`, `created_at`
- Drizzle mapeia para **camelCase** no TypeScript: `amountCents: integer('amount_cents')`

## Testes

O projeto segue **TDD** (Test-Driven Development): escreve o teste primeiro (Red), implementa o mínimo para passar (Green), refatora (Refactor).

### Testes Unitários (Vitest)

```bash
npm run test                        # Roda todos
npm run test:watch                  # Modo watch
npm run test:coverage               # Com relatório de cobertura
npx vitest run src/server/domain/   # Roda só um diretório
npx vitest run create-account       # Roda por nome do arquivo
```

**Convenções:**

- Testes **co-localizados**: `create-account.test.ts` ao lado de `create-account.ts`
- Globals habilitados: `describe`, `it`, `expect` sem import
- Pattern: `describe('Funcionalidade')` → `it('deve fazer X quando Y')`
- Mocks de repository via interfaces (Dependency Inversion) — nunca mock de Zod ou Result Pattern

### Testes E2E (Playwright)

```bash
npm run test:e2e       # Headless (CI-like)
npm run test:e2e:ui    # Interface visual (debug)
```

Testes E2E ficam em `e2e/` na raiz. Requerem o servidor rodando (`npm run dev`) — o Playwright sobe automaticamente se não estiver rodando.

## Convenções de Código

### Result Pattern (obrigatório)

Todo Server Action e Use Case retorna `Result<T>` — nunca `throw` para erros de negócio:

```typescript
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: Record<string, string> } };

// code: UPPER_SNAKE_CASE em inglês (consumo programático)
// message: português (exibição ao usuário)
return err({ code: 'INSUFFICIENT_BALANCE', message: 'Saldo insuficiente na conta' });
```

### Valores financeiros em centavos (obrigatório)

Zero floating point em operações financeiras:

```typescript
// R$ 149,99 → armazena como 14999 (integer cents)
// Divisão por 100 APENAS na camada de apresentação (formatCurrency)
const amountCents = 14999; // ✅
const amount = 149.99;     // ❌ NUNCA
```

### Import ordering

```typescript
// 1. Bibliotecas externas
import { z } from 'zod';
// 2. Shared (tipos, schemas)
import { type Result } from '@/shared/types/result';
// 3. Server (domínio, infra)
import { createAccount } from '@/server/domain/accounts/use-cases/create-account';
// 4. Client (componentes, hooks)
import { Button } from '@/client/components/ui/button';
```

### Naming

| Elemento | Convenção | Exemplo |
|---|---|---|
| Variáveis/funções | camelCase | `amountCents`, `getUserById()` |
| Tipos/interfaces | PascalCase | `Transaction`, `CreateAccountInput` |
| Componentes React | PascalCase | `TransactionForm.tsx` |
| Constantes | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Arquivos (use case, test) | kebab-case | `create-account.ts`, `create-account.test.ts` |
| Pastas | kebab-case | `use-cases/` |
| Error codes | UPPER_SNAKE_CASE (inglês) | `INSUFFICIENT_BALANCE` |
| Error messages | Português | `"Saldo insuficiente"` |

### O que NÃO fazer

```typescript
// ❌ Lógica de negócio no frontend
if (balance - amount < 0) showError("Sem saldo");

// ❌ Server Action acessando banco direto (pulou use case)
const result = await db.insert(transactions).values(data);

// ❌ throw para erro de negócio
throw new Error("Saldo insuficiente");

// ❌ Domínio importando outro domínio
import { getAccountById } from '../../accounts/use-cases/get-account-by-id';
```

## Arquitetura

Clean Architecture + DDD com separação explícita entre backend e frontend:

```
src/
  server/               # Backend — tudo que roda no servidor
    domain/             # Núcleo DDD (entidades, use cases, repository interfaces)
    infrastructure/     # Implementações concretas (DB, auth, logging)
    actions/            # Server Actions (entry points para o frontend)
  client/               # Frontend — tudo que roda no browser
    components/         # Componentes por domínio + ui/ (shadcn)
    hooks/              # Custom hooks
    utils/              # Utilitários de formatação (formatCurrency, etc.)
  shared/               # Compartilhado (front + back)
    types/              # Result<T>, enums
    schemas/            # Schemas Zod (validação compartilhada)
    constants/          # Constantes
  app/                  # Rotas Next.js (camada fina de orquestração)
e2e/                    # Testes E2E (Playwright)
```

### Regras de dependência

Quem pode importar de quem — violar essas regras quebra a arquitetura:

```
app/             → client/, server/actions/        (NUNCA server/domain/ ou infrastructure/)
client/          → shared/                         (NUNCA server/)
server/actions/  → server/domain/, shared/         (NUNCA server/infrastructure/)
server/domain/   → shared/, interfaces próprias    (NUNCA infrastructure/, client/, app/)
server/infra/    → server/domain/ (interfaces)     (implementa as interfaces do domínio)
shared/          → nada                            (zero dependências)
```

### Data flow

```
Browser → page.tsx (app/) → Server Action (server/actions/)
  → Use Case (server/domain/) → Repository Interface
  → Repository Impl (server/infrastructure/) → PostgreSQL (filtrado por RLS)
  → Use Case retorna Result<T> → Server Action retorna para browser
```

### Segurança — 2 camadas obrigatórias

1. **RLS no PostgreSQL** — isolamento multi-tenant no nível do banco (dados de uma família nunca acessíveis por outra)
2. **Middleware de autorização** — papéis e permissões na aplicação

Nenhuma query ao banco pode existir sem ambas as camadas ativas. Toda mutação gera registro em `audit_logs` (somente INSERT, nunca UPDATE/DELETE).

Para a documentação completa da arquitetura, veja `_bmad-output/planning-artifacts/architecture.md`.

## Fluxo de Trabalho

### Branching

```
main (produção)
  └── epic-N/story-key (feature branch)
       ex: epic-1/1-8-ci-cd-pipeline-ambientes-e-readme
```

1. Criar branch a partir de `main`: `git checkout -b epic-N/story-key`
2. Desenvolver com commits incrementais
3. Push: `git push -u origin epic-N/story-key`
4. Abrir PR para `main`
5. CI roda automaticamente (lint + type-check + testes + build)
6. Após aprovação, merge na `main`

### Convenção de Commits

- `feat:` — nova funcionalidade
- `fix:` — correção de bug ou finding de code review
- `chore:` — tarefas de manutenção (atualização de status, configs)
- `docs:` — alterações em documentação
- `refactor:` — refatoração sem mudança de comportamento
- `test:` — adição ou correção de testes

### CI/CD

- **Pull Request** → GitHub Actions executa: lint, type-check, testes, build
- **Push em branch** → Vercel cria preview deploy automático
- **Merge em main** → Vercel faz deploy em produção

## Deploy

### Ambientes

| Ambiente | Infraestrutura | Banco | URL |
|---|---|---|---|
| **Development** | Docker local | Supabase CLI (container) | `http://localhost:3000` |
| **Staging** | Vercel preview | Projeto Supabase separado (gratuito) | `*.vercel.app` |
| **Production** | Vercel | Projeto Supabase de produção | URL de produção |

Cada ambiente tem banco Supabase **completamente isolado** — dados nunca se cruzam entre ambientes.

### Vercel

Conectada ao repositório via integração nativa com GitHub:

- **Preview deploy**: automático em todo push para qualquer branch
- **Deploy de produção**: automático ao fazer merge na `main`
- **Bot comment**: URL do preview aparece automaticamente no PR

### Staging completo

Para um ambiente de staging com banco próprio:

1. Criar projeto Supabase separado (gratuito) no [Supabase Dashboard](https://supabase.com/dashboard)
2. Na Vercel, configurar variáveis de ambiente para o ambiente **Preview**:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` → apontando para o Supabase de staging
   - `BETTER_AUTH_SECRET` → secret diferente do de produção
   - `ENVIRONMENT` → `staging`
3. Migrations: automáticas pelo pipeline (abaixo). Manualmente, só se necessário: `npm run db:migrate -- --env staging` (lê `.env.staging.local`, exige porta 6543)

### Migrations automáticas (Story 1.13)

O workflow `CI` (`.github/workflows/ci.yml`) tem dois jobs de banco:

- **`migrations`** (toda PR e push): sobe o Supabase no runner (Postgres + pooler Supavisor) e aplica **todas as migrations do zero pelo pooler em modo transação** — o mesmo caminho de staging e produção. Confere que o número de migrations aplicadas bate com o journal e que rodar de novo não muda nada. Antes, roda o `drizzle-kit generate` e falha se `schema/*.ts` tiver mudança sem migration (migration esquecida).
- **`deploy-migrations`** (push em `staging` ou `main`, depois do CI verde): aplica as migrations no banco do ambiente, com a URL guardada em **secrets do repositório**:
  - `STAGING_DATABASE_URL` — URL do Supabase de staging, porta **6543**
  - `PRODUCTION_DATABASE_URL` — URL do Supabase de produção, porta **6543**
  - Configurar em GitHub → Settings → Secrets and variables → Actions → *New repository secret*. Sem o secret, o job só avisa e não falha.

A migration e o deploy da Vercel começam juntos no push. Antes do lançamento isso é aceitável; depois dele, toda migration precisa ser retrocompatível com o código anterior.

Para o guia completo de deploy em produção (criação de contas, env vars, checklist), veja [`docs/deploy-producao.md`](docs/deploy-producao.md).

## Processo BMAD e proteções

O projeto é desenvolvido com agentes e workflows BMAD: toda story passa por `create-story` → `dev-story` → `code-review` (comandos `/bmad-bmm-…` no Claude Code). Três camadas impedem que isso seja pulado (Story 1.14):

| Camada | Onde | O que faz |
|---|---|---|
| Instrução | `CLAUDE.md` | Carregado pelo Claude Code em toda sessão: só workflows BMAD alteram stories; fora disso, parar e perguntar; nunca `git worktree` |
| Bloqueio na sessão | `.claude/settings.json` → `.claude/hooks/bmad-story-guard.mjs` (lógica em `scripts/bmad/story-guard.mjs`) | Hook `PreToolUse` que barra escrita em stories e no `sprint-status.yaml` quando o último workflow BMAD invocado não permite |
| CI | job `bmad-process` em `.github/workflows/ci.yml` (`scripts/bmad/check-story-process.ts`) | Story alterada em `review`/`done` precisa do Dev Agent Record; em `done`, do registro de code review |

Limites: ver a seção "Limites das proteções" do `CLAUDE.md`. Ao alterar o hook, o Claude Code pede revisão em `/hooks` (os hooks são carregados no início da sessão).

## Decisões Técnicas

| Decisão | Escolha | Por quê |
|---|---|---|
| **ORM** | Drizzle (não Prisma) | TypeScript-native, SQL transparente, sem runtime pesado, migrations em SQL puro |
| **Auth** | Better Auth (não NextAuth) | Suporte nativo a Organizations (multi-tenant), mais controle sobre sessões, melhor integração com Supabase |
| **DB hosting** | Supabase (não Firebase/PlanetScale) | PostgreSQL (RLS nativo para multi-tenant), Realtime via WebSocket, tier gratuito generoso, dev local com Docker |
| **Validação** | Zod (não Yup/Joi) | TypeScript-first, 14x mais rápido que v3, schemas compartilhados front/back |
| **Estilização** | Tailwind v4 + shadcn/ui | Zero runtime CSS, config via CSS (`@theme {}`), componentes acessíveis prontos |
| **Testes** | Vitest (não Jest) | Compatível com Vite/Turbopack, ESM nativo, 10-20x mais rápido |
| **Valores financeiros** | Integer cents (não float) | Precisão absoluta — R$ 149,99 = `14999`. Zero erro de arredondamento |
| **Erros de negócio** | Result Pattern (não throw) | Fluxo explícito, TypeScript força tratamento, sem try/catch espalhado |
| **Comunicação client-server** | Server Actions (não REST) | Colocalizado com UI, type-safe end-to-end, sem boilerplate de API |

## Troubleshooting

### Docker não está rodando

```
Error: Cannot connect to the Docker daemon
```

Abra o Docker Desktop e espere ele inicializar completamente antes de rodar `npm run db:start`.

### Porta 3000 ocupada

```
Error: Port 3000 is already in use
```

Mate o processo que está usando a porta:

```bash
lsof -ti:3000 | xargs kill -9
```

### Supabase não sobe / timeout

```bash
# Pare tudo e suba novamente
npm run db:stop
docker system prune -f  # limpa containers/images órfãos
npm run db:start
```

Se persistir, verifique se o Docker tem pelo menos **4GB de RAM** alocados (Docker Desktop → Settings → Resources).

### `npm run db:start` exibe chaves mas `.env.local` está vazio

O comando `db:start` exibe as chaves no terminal. Copie manualmente para o `.env.local`:

```bash
# Veja as chaves a qualquer momento
npm run db:status
```

### Testes falhando com erro de localStorage

No Node.js 22+, `localStorage` existe nativamente e conflita com jsdom. Os testes já usam `vi.stubGlobal` para resolver. Se criar um teste novo com jsdom, siga o mesmo padrão dos existentes.

### Build falha por variáveis de ambiente

O `npm run build` precisa de todas as env vars definidas (mesmo que com valores dummy). Verifique se o `.env.local` está preenchido.

### Migration falha com "relation already exists"

O banco local está dessincronizado. Resete:

```bash
npm run db:reset:local
```
