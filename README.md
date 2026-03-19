# Caderninho

App de gestao financeira familiar. Permite registrar gastos, receitas, acompanhar orcamentos por categoria, reconciliar faturas de cartao de credito e compartilhar dados financeiros entre membros da familia com controle granular de permissoes.

## Stack

| Tecnologia | Versao | Funcao |
|---|---|---|
| Next.js | 16.1.6 | Framework full-stack (App Router, Server Actions, Turbopack) |
| TypeScript | 5.9.3 | Linguagem (strict mode) |
| React | 19.2.3 | UI |
| Tailwind CSS | 4.x | Estilizacao (config via CSS, sem tailwind.config.ts) |
| shadcn/ui | 4.x | Design system (componentes base) |
| Supabase | — | PostgreSQL + Auth + Realtime (WebSocket direto browser) |
| Drizzle ORM | 0.45.1 | ORM TypeScript-native com migrations versionadas |
| Better Auth | 1.5.5 | Autenticacao (email/senha + Google OAuth + Organizations) |
| Vitest | 4.1.0 | Testes unitarios (TDD) |
| Playwright | 1.58.x | Testes E2E |
| Zod | 4.3.6 | Validacao de schemas (compartilhado front/back) |
| Vercel | — | Deploy (preview automatico + producao) |

## Pre-requisitos

- **Node.js** 22+ ([download](https://nodejs.org/))
- **Docker** (para Supabase local) ([download](https://www.docker.com/products/docker-desktop/))
- **Supabase CLI** (`npm install -g supabase`)
- **Git**

## Setup Local

```bash
# 1. Clone o repositorio
git clone https://github.com/vitorcastilho/caderninho.git
cd caderninho

# 2. Instale as dependencias
npm install

# 3. Configure as variaveis de ambiente
cp .env.example .env.local
# Preencha os valores em .env.local (veja secao "Variaveis de Ambiente")

# 4. Suba o Supabase local (PostgreSQL + Auth + Realtime via Docker)
npm run db:start

# 5. Rode as migrations do banco
npm run db:migrate

# 6. Inicie o servidor de desenvolvimento
npm run dev
```

A aplicacao estara disponivel em `http://localhost:3000`.

Para parar o Supabase local: `npm run db:stop`.

## Variaveis de Ambiente

Copie `.env.example` para `.env.local` e preencha os valores:

| Variavel | Descricao | Como obter |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL da API do Supabase | `npm run db:status` (local) ou dashboard Supabase (staging/prod) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anonima do Supabase | `npm run db:status` (local) ou dashboard Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de servico do Supabase | `npm run db:status` (local) ou dashboard Supabase |
| `DATABASE_URL` | Connection string do PostgreSQL | Padrao local: `postgresql://postgres:postgres@localhost:54322/postgres` |
| `BETTER_AUTH_SECRET` | Secret para assinatura de sessoes | Gerar com `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | URL base da aplicacao | `http://localhost:3000` (local) |
| `NEXT_PUBLIC_APP_URL` | URL publica da aplicacao | `http://localhost:3000` (local) |
| `GOOGLE_CLIENT_ID` | Client ID do Google OAuth | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GOOGLE_CLIENT_SECRET` | Client Secret do Google OAuth | Google Cloud Console |
| `NODE_ENV` | Ambiente Node.js | `development` (local), `test` (CI), `production` |
| `ENVIRONMENT` | Ambiente da aplicacao | `development`, `staging` ou `production` |

## Scripts

| Script | Comando | Descricao |
|---|---|---|
| `dev` | `npm run dev` | Inicia o servidor de desenvolvimento (Turbopack) |
| `build` | `npm run build` | Compila a aplicacao para producao |
| `start` | `npm run start` | Inicia o servidor de producao |
| `lint` | `npm run lint` | Executa ESLint |
| `type-check` | `npm run type-check` | Verifica tipos TypeScript (`tsc --noEmit`) |
| `test` | `npm run test` | Roda testes unitarios (Vitest) |
| `test:watch` | `npm run test:watch` | Roda testes em modo watch |
| `test:coverage` | `npm run test:coverage` | Roda testes com relatorio de cobertura |
| `test:e2e` | `npm run test:e2e` | Roda testes E2E (Playwright) |
| `test:e2e:ui` | `npm run test:e2e:ui` | Roda testes E2E com interface visual |
| `db:start` | `npm run db:start` | Inicia Supabase local (PostgreSQL + Auth + Realtime) |
| `db:stop` | `npm run db:stop` | Para o Supabase local |
| `db:status` | `npm run db:status` | Mostra status e URLs do Supabase local |
| `db:generate` | `npm run db:generate` | Gera migration a partir das mudancas no schema |
| `db:migrate` | `npm run db:migrate` | Aplica migrations pendentes |
| `db:push` | `npm run db:push` | Sincroniza schema direto no banco (dev only) |
| `db:studio` | `npm run db:studio` | Abre o Drizzle Studio (interface visual do banco) |

## Testes

### Testes Unitarios (Vitest)

O projeto segue **TDD** (Test-Driven Development): teste primeiro, implementa depois, refatora.

```bash
npm run test           # Roda todos os testes
npm run test:watch     # Modo watch (re-roda ao salvar)
npm run test:coverage  # Gera relatorio de cobertura
```

**Convencoes:**

- Testes co-localizados com o arquivo testado: `create-account.test.ts` ao lado de `create-account.ts`
- Globals habilitados: `describe`, `it`, `expect` disponiveis sem import
- Environment: `node` (padrao) ou `jsdom` (para componentes React)
- Pattern: `describe('Funcionalidade')` > `it('deve fazer X quando Y')`

### Testes E2E (Playwright)

```bash
npm run test:e2e       # Roda testes E2E headless
npm run test:e2e:ui    # Abre interface visual do Playwright
```

Testes E2E ficam na pasta `e2e/` na raiz do projeto.

## Fluxo de Trabalho

### Branching

```
main (producao)
  └── epic-N/story-key (feature branch)
       ex: epic-1/1-8-ci-cd-pipeline-ambientes-e-readme
```

1. Criar branch a partir de `main`: `git checkout -b epic-N/story-key`
2. Desenvolver com commits incrementais
3. Push: `git push -u origin epic-N/story-key`
4. Abrir PR para `main`
5. CI roda automaticamente (lint + type-check + testes + build)
6. Apos aprovacao, merge na `main`

### Convencao de Commits

- `feat:` — nova funcionalidade
- `fix:` — correcao de bug ou finding de code review
- `chore:` — tarefas de manutencao (atualizacao de status, configs)
- `docs:` — alteracoes em documentacao
- `refactor:` — refatoracao sem mudanca de comportamento
- `test:` — adicao ou correcao de testes

### CI/CD

- **Pull Request** → GitHub Actions executa: lint, type-check, testes, build
- **Push em branch** → Vercel cria preview deploy automatico
- **Merge em main** → Vercel faz deploy em producao

## Deploy

### Ambientes

| Ambiente | Infraestrutura | Branch | URL |
|---|---|---|---|
| **Development** | Supabase CLI + Docker local | feature branches | `http://localhost:3000` |
| **Staging** | Vercel preview + Supabase staging | PRs e branches | `*.vercel.app` (automatico) |
| **Production** | Vercel + Supabase producao | `main` | URL de producao |

### Vercel

A Vercel esta conectada ao repositorio via integracao nativa com GitHub:

- **Preview deploy**: automatico em todo push para qualquer branch
- **Deploy de producao**: automatico ao fazer merge na `main`
- **Bot comment**: URL do preview aparece automaticamente no PR

### Staging Completo

Para um ambiente de staging com banco proprio:

1. Criar projeto Supabase separado (gratuito) no [Supabase Dashboard](https://supabase.com/dashboard)
2. Na Vercel, configurar variaveis de ambiente para o ambiente **Preview**:
   - `NEXT_PUBLIC_SUPABASE_URL` → URL do projeto Supabase de staging
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Chave anonima do staging
   - `SUPABASE_SERVICE_ROLE_KEY` → Chave de servico do staging
   - `DATABASE_URL` → Connection string do staging
   - `BETTER_AUTH_SECRET` → Secret diferente do de producao
   - `ENVIRONMENT` → `staging`
3. Rodar migrations no banco de staging: configurar `DATABASE_URL` e executar `npm run db:migrate`
4. Drizzle-kit roda migrations independentemente por ambiente

## Arquitetura

O projeto segue **Clean Architecture + DDD** (Domain-Driven Design) com separacao explicita entre backend e frontend:

```
src/
  server/           # Backend — regras de negocio, banco, auth
    domain/         # Nucleo DDD (entidades, use cases, repositories)
    infrastructure/ # Implementacoes concretas (DB, auth, logging)
    actions/        # Server Actions (entry points)
  client/           # Frontend — componentes visuais, hooks
    components/     # Componentes por dominio + ui/ (shadcn)
    hooks/          # Custom hooks
    utils/          # Utilitarios de formatacao
  shared/           # Compartilhado (front + back)
    types/          # Result<T>, enums
    schemas/        # Schemas Zod
  app/              # Rotas Next.js (camada fina)
e2e/                # Testes E2E (Playwright)
```

**Principios:**

- **Result Pattern** para erros de negocio (nunca `throw` para erros esperados)
- **Server Actions** como padrao de comunicacao cliente-servidor
- **RLS + Middleware** — autorizacao em 2 camadas (defesa em profundidade)
- **TDD** — teste primeiro, implementa depois
- **Valores financeiros em centavos** (integer) — zero floating point

Para a documentacao completa da arquitetura, veja `_bmad-output/planning-artifacts/architecture.md`.
