# Caderninho

App de gestão financeira familiar. Permite registrar gastos, receitas, acompanhar orçamentos por categoria, reconciliar faturas de cartão de crédito e compartilhar dados financeiros entre membros da família com controle granular de permissões.

## Stack

| Tecnologia | Versão | Função |
|---|---|---|
| Next.js | 16.1.6 | Framework full-stack (App Router, Server Actions, Turbopack) |
| TypeScript | 5.9.3 | Linguagem (strict mode) |
| React | 19.2.3 | UI |
| Tailwind CSS | 4.x | Estilização (config via CSS, sem tailwind.config.ts) |
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
- **Docker** (para Supabase local) ([download](https://www.docker.com/products/docker-desktop/))
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
# Preencha os valores em .env.local (veja seção "Variáveis de Ambiente")

# 4. Suba o Supabase local (PostgreSQL + Auth + Realtime via Docker)
npm run db:start

# 5. Rode as migrations do banco
npm run db:migrate

# 6. Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

Para parar o Supabase local: `npm run db:stop`.

## Variáveis de Ambiente

Copie `.env.example` para `.env.local` e preencha os valores:

| Variável | Descrição | Como obter |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL da API do Supabase | `npm run db:status` (local) ou dashboard Supabase (staging/prod) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima do Supabase | `npm run db:status` (local) ou dashboard Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço do Supabase | `npm run db:status` (local) ou dashboard Supabase |
| `DATABASE_URL` | Connection string do PostgreSQL | Padrão local: `postgresql://postgres:postgres@localhost:54322/postgres` |
| `BETTER_AUTH_SECRET` | Secret para assinatura de sessões | Gerar com `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | URL base da aplicação | `http://localhost:3000` (local) |
| `NEXT_PUBLIC_APP_URL` | URL pública da aplicação | `http://localhost:3000` (local) |
| `GOOGLE_CLIENT_ID` | Client ID do Google OAuth | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GOOGLE_CLIENT_SECRET` | Client Secret do Google OAuth | Google Cloud Console |
| `NODE_ENV` | Ambiente Node.js | `development` (local), `test` (CI), `production` |
| `ENVIRONMENT` | Ambiente da aplicação | `development`, `staging` ou `production` |

## Scripts

| Script | Comando | Descrição |
|---|---|---|
| `dev` | `npm run dev` | Inicia o servidor de desenvolvimento (Turbopack) |
| `build` | `npm run build` | Compila a aplicação para produção |
| `start` | `npm run start` | Inicia o servidor de produção |
| `lint` | `npm run lint` | Executa ESLint |
| `type-check` | `npm run type-check` | Verifica tipos TypeScript (`tsc --noEmit`) |
| `test` | `npm run test` | Roda testes unitários (Vitest) |
| `test:watch` | `npm run test:watch` | Roda testes em modo watch |
| `test:coverage` | `npm run test:coverage` | Roda testes com relatório de cobertura |
| `test:e2e` | `npm run test:e2e` | Roda testes E2E (Playwright) |
| `test:e2e:ui` | `npm run test:e2e:ui` | Roda testes E2E com interface visual |
| `db:start` | `npm run db:start` | Inicia Supabase local (PostgreSQL + Auth + Realtime) |
| `db:stop` | `npm run db:stop` | Para o Supabase local |
| `db:status` | `npm run db:status` | Mostra status e URLs do Supabase local |
| `db:generate` | `npm run db:generate` | Gera migration a partir das mudanças no schema |
| `db:migrate` | `npm run db:migrate` | Aplica migrations pendentes |
| `db:push` | `npm run db:push` | Sincroniza schema direto no banco (dev only) |
| `db:studio` | `npm run db:studio` | Abre o Drizzle Studio (interface visual do banco) |

## Testes

### Testes Unitários (Vitest)

O projeto segue **TDD** (Test-Driven Development): teste primeiro, implementa depois, refatora.

```bash
npm run test           # Roda todos os testes
npm run test:watch     # Modo watch (re-roda ao salvar)
npm run test:coverage  # Gera relatório de cobertura
```

**Convenções:**

- Testes co-localizados com o arquivo testado: `create-account.test.ts` ao lado de `create-account.ts`
- Globals habilitados: `describe`, `it`, `expect` disponíveis sem import
- Environment: `node` (padrão) ou `jsdom` (para componentes React)
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

| Ambiente | Infraestrutura | Branch | URL |
|---|---|---|---|
| **Development** | Supabase CLI + Docker local | feature branches | `http://localhost:3000` |
| **Staging** | Vercel preview + Supabase staging | PRs e branches | `*.vercel.app` (automático) |
| **Production** | Vercel + Supabase produção | `main` | URL de produção |

### Vercel

A Vercel está conectada ao repositório via integração nativa com GitHub:

- **Preview deploy**: automático em todo push para qualquer branch
- **Deploy de produção**: automático ao fazer merge na `main`
- **Bot comment**: URL do preview aparece automaticamente no PR

### Staging Completo

Para um ambiente de staging com banco próprio:

1. Criar projeto Supabase separado (gratuito) no [Supabase Dashboard](https://supabase.com/dashboard)
2. Na Vercel, configurar variáveis de ambiente para o ambiente **Preview**:
   - `NEXT_PUBLIC_SUPABASE_URL` → URL do projeto Supabase de staging
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Chave anônima do staging
   - `SUPABASE_SERVICE_ROLE_KEY` → Chave de serviço do staging
   - `DATABASE_URL` → Connection string do staging
   - `BETTER_AUTH_SECRET` → Secret diferente do de produção
   - `ENVIRONMENT` → `staging`
3. Rodar migrations no banco de staging: configurar `DATABASE_URL` e executar `npm run db:migrate`
4. Drizzle-kit roda migrations independentemente por ambiente

## Arquitetura

O projeto segue **Clean Architecture + DDD** (Domain-Driven Design) com separação explícita entre backend e frontend:

```
src/
  server/           # Backend — regras de negócio, banco, auth
    domain/         # Núcleo DDD (entidades, use cases, repositories)
    infrastructure/ # Implementações concretas (DB, auth, logging)
    actions/        # Server Actions (entry points)
  client/           # Frontend — componentes visuais, hooks
    components/     # Componentes por domínio + ui/ (shadcn)
    hooks/          # Custom hooks
    utils/          # Utilitários de formatação
  shared/           # Compartilhado (front + back)
    types/          # Result<T>, enums
    schemas/        # Schemas Zod
  app/              # Rotas Next.js (camada fina)
e2e/                # Testes E2E (Playwright)
```

**Princípios:**

- **Result Pattern** para erros de negócio (nunca `throw` para erros esperados)
- **Server Actions** como padrão de comunicação cliente-servidor
- **RLS + Middleware** — autorização em 2 camadas (defesa em profundidade)
- **TDD** — teste primeiro, implementa depois
- **Valores financeiros em centavos** (integer) — zero floating point

Para a documentação completa da arquitetura, veja `_bmad-output/planning-artifacts/architecture.md`.
