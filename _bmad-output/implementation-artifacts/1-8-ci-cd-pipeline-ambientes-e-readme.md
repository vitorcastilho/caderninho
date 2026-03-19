# Story 1.8: CI/CD Pipeline, Ambientes e README

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want automated quality checks, multi-environment deployment, and comprehensive documentation,
So that code quality is enforced and the project is maintainable long-term.

## Acceptance Criteria

1. Push em feature branch dispara GitHub Actions que executa: ESLint, TypeScript type-check e Vitest — pipeline falha se qualquer check falhar
2. Vercel cria preview deploy automaticamente em push de feature branch (via integracao nativa GitHub)
3. Merge em `main` dispara Vercel deploy em producao automaticamente
4. `.github/workflows/ci.yml` esta configurado com lint + type-check + testes + build, com `concurrency` para cancelar runs anteriores
5. Variaveis de ambiente dummy estao configuradas no CI para que testes rodem sem Supabase real
6. Ambiente de staging esta documentado no README (projeto Supabase separado, Vercel preview)
7. README contem: visao geral, pre-requisitos, setup local completo, variaveis de ambiente, como rodar testes, fluxo de trabalho (branching), deploy, e visao da arquitetura
8. Playwright esta instalado e configurado com `playwright.config.ts` basico e pelo menos 1 teste E2E de smoke (health check da app)
9. Script `type-check` adicionado ao `package.json` para uso no CI

## Tasks / Subtasks

- [ ] Task 1: Adicionar script `type-check` ao package.json (AC: #9)
  - [ ] 1.1 Adicionar `"type-check": "tsc --noEmit"` na secao `scripts` do `package.json`
  - [ ] 1.2 Verificar que `npm run type-check` roda com sucesso localmente (zero erros de tipo)

- [ ] Task 2: Criar GitHub Actions CI workflow (AC: #1, #4, #5)
  - [ ] 2.1 Criar diretorio `.github/workflows/`
  - [ ] 2.2 Criar `.github/workflows/ci.yml` com:
    - Trigger: `pull_request` (branches: [main]) + `push` (branches: [main])
    - `concurrency` com `cancel-in-progress: true` para evitar runs duplicados
    - Job unico `ci` com steps sequenciais:
      1. `actions/checkout@v4`
      2. `actions/setup-node@v4` com `node-version: '22'` e `cache: 'npm'`
      3. `npm ci` (instalacao deterministica)
      4. `npm run lint` (ESLint)
      5. `npm run type-check` (TypeScript)
      6. `npm run test` (Vitest)
      7. `npm run build` (Next.js build — verifica que compila)
    - Variaveis de ambiente dummy no step de test:
      ```
      NEXT_PUBLIC_SUPABASE_URL: http://127.0.0.1:54321
      NEXT_PUBLIC_SUPABASE_ANON_KEY: dummy-anon-key-for-ci
      SUPABASE_SERVICE_ROLE_KEY: dummy-service-role-key-for-ci
      DATABASE_URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      BETTER_AUTH_SECRET: ci-test-secret-minimum-32-chars-long
      BETTER_AUTH_URL: http://localhost:3000
      NEXT_PUBLIC_APP_URL: http://localhost:3000
      NODE_ENV: test
      ENVIRONMENT: test
      ```
    - Cache de `.next/cache` para builds mais rapidos (via `actions/cache@v4`)
  - [ ] 2.3 Testar localmente com `act` (opcional) ou via push para confirmar que pipeline funciona

- [ ] Task 3: Instalar e configurar Playwright (AC: #8)
  - [ ] 3.1 Instalar Playwright: `npm install -D @playwright/test`
  - [ ] 3.2 Instalar browsers: `npx playwright install --with-deps chromium` (apenas Chromium para MVP)
  - [ ] 3.3 Criar `playwright.config.ts` na raiz:
    - `testDir: './e2e'`
    - `baseURL: 'http://localhost:3000'`
    - `webServer` configurado para `npm run dev` com `reuseExistingServer: !process.env.CI`
    - Apenas projeto Chromium (sem Firefox/WebKit no MVP)
    - Screenshots on failure
    - `retries: process.env.CI ? 2 : 0`
  - [ ] 3.4 Criar teste E2E de smoke em `e2e/health.spec.ts`:
    - Verificar que a pagina de login carrega (GET /login retorna 200)
    - Verificar que elementos basicos estao presentes
  - [ ] 3.5 Remover `e2e/.gitkeep` (ja tera arquivos reais)
  - [ ] 3.6 Adicionar scripts ao `package.json`:
    - `"test:e2e": "playwright test"`
    - `"test:e2e:ui": "playwright test --ui"`
  - [ ] 3.7 Adicionar ao `.gitignore`: `test-results/`, `playwright-report/`, `blob-report/`
  - [ ] 3.8 NOTA: E2E NAO roda no CI ainda — sera adicionado quando houver mais testes E2E e Supabase rodando no CI

- [ ] Task 4: Criar README.md operacional (AC: #7)
  - [ ] 4.1 Criar `README.md` na raiz do projeto com as seguintes secoes:
    - **Caderninho** — descricao curta: app de gestao financeira familiar
    - **Stack** — tabela com: Next.js 16, TypeScript, Tailwind v4, Supabase (PostgreSQL), Drizzle ORM, Better Auth, Vitest, Playwright, shadcn/ui, Vercel
    - **Pre-requisitos** — Node.js 22+, Docker (para Supabase local), Supabase CLI, Git
    - **Setup local** — passo a passo:
      1. Clone do repo
      2. `npm install`
      3. Copiar `.env.example` para `.env.local` e preencher
      4. `npm run db:start` (sobe PostgreSQL + Auth + Realtime local)
      5. `npm run db:migrate` (roda migrations)
      6. `npm run dev` (sobe Next.js com Turbopack)
    - **Variaveis de ambiente** — tabela com cada variavel, descricao e onde obter (referenciando `.env.example`)
    - **Scripts** — tabela com todos os scripts do package.json e descricao
    - **Testes** — como rodar (`npm test`, `npm run test:watch`, `npm run test:coverage`, `npm run test:e2e`), convencoes TDD, localizacao dos testes
    - **Fluxo de trabalho** — branching strategy (feature branch → PR → CI checks → merge), convencao de commits (feat/fix/chore)
    - **Deploy** — Vercel (preview automatico em PR, producao em merge na main), 3 ambientes (dev/staging/prod)
    - **Arquitetura** — resumo da Clean Architecture + DDD, estrutura de pastas, link para doc completa em `_bmad-output/planning-artifacts/architecture.md`
  - [ ] 4.2 Validar que README nao contem valores reais de env vars (apenas exemplos/placeholders)

- [ ] Task 5: Documentar configuracao de staging (AC: #6)
  - [ ] 5.1 No README, secao de Deploy, documentar:
    - Staging = Vercel preview deploys (automatico a cada push em branch)
    - Para staging completo: criar projeto Supabase separado (gratuito)
    - Configurar env vars do Supabase staging na Vercel (Settings → Environment Variables → Preview)
    - Drizzle migrations rodam independentemente por ambiente
  - [ ] 5.2 Atualizar `.env.example` se necessario para documentar variaveis staging-specific

- [ ] Task 6: Validacao final (AC: #1-#9)
  - [ ] 6.1 `npm run type-check` — zero erros
  - [ ] 6.2 `npm run lint` — sem erros novos
  - [ ] 6.3 `npm run test` — todos os testes passam (189+ existentes + novos E2E)
  - [ ] 6.4 `npm run build` — compila sem erros
  - [ ] 6.5 `npm run test:e2e` — smoke test passa localmente
  - [ ] 6.6 GitHub Actions CI workflow YAML esta sintaticamente correto (validar com linter YAML ou push de teste)
  - [ ] 6.7 README esta completo com todas as secoes obrigatorias

## Dev Notes

### Versoes Exatas do Stack (Story 1.8)

| Tecnologia | Versao | Pacote npm | Notas |
|---|---|---|---|
| Next.js | 16.1.6 | `next` (ja instalado) | Build + type-check no CI |
| TypeScript | 5.9.3 | `typescript` (ja instalado) | `tsc --noEmit` para type-check |
| Vitest | 4.1.0 | `vitest` (ja instalado) | `vitest run` no CI |
| ESLint | 9.x | `eslint` (ja instalado) | Flat config em `eslint.config.mjs` |
| Playwright | latest | `@playwright/test` | **INSTALAR nesta story** |
| Node.js (CI) | 22 | — | LTS, usar no GitHub Actions |

### Pacotes a Instalar

- `@playwright/test` — unico pacote novo necessario (dev dependency)
- NAO instalar nenhum outro pacote

### ALERTA: Vercel Faz Deploy Automatico

A Vercel com integracao GitHub nativa ja faz:
- Preview deploy em todo push para qualquer branch
- Deploy de producao em merge na `main`
- Bot comment no PR com URL do preview

**NAO criar** GitHub Actions workflow para deploy — Vercel cuida disso. O CI workflow so precisa de checks (lint, type-check, test, build).

### ALERTA: Variaveis de Ambiente no CI

Os testes unitarios usam mocks (nao conectam ao Supabase real). Porem, o `npm run build` e `npm run type-check` podem precisar de env vars definidas para compilar sem erros. Usar valores dummy no CI:

```yaml
env:
  NEXT_PUBLIC_SUPABASE_URL: http://127.0.0.1:54321
  NEXT_PUBLIC_SUPABASE_ANON_KEY: dummy-anon-key-for-ci
  SUPABASE_SERVICE_ROLE_KEY: dummy-service-role-key-for-ci
  DATABASE_URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
  BETTER_AUTH_SECRET: ci-test-secret-minimum-32-chars-long-for-testing
  BETTER_AUTH_URL: http://localhost:3000
  NEXT_PUBLIC_APP_URL: http://localhost:3000
  NODE_ENV: test
  ENVIRONMENT: test
```

Verificar se o `next.config.ts` ou `src/server/infrastructure/auth/config.ts` fazem acesso direto a env vars durante build. Se sim, os dummies acima devem satisfazer. Se alguma validacao falhar no build, ajustar os dummies.

### ALERTA: ESLint Flat Config

O projeto usa ESLint 9+ com flat config (`eslint.config.mjs`), NAO `.eslintrc.json`. O comando `npm run lint` ja executa `eslint` que carrega a flat config automaticamente.

### ALERTA: Middleware vs Proxy

O `project-context.md` menciona que Next.js 16 renomeou `middleware.ts` para `proxy.ts`. Porem, o projeto atual usa `src/middleware.ts` e funciona. **NAO renomear** — manter como esta. A documentacao do Next.js 16 pode ter mudado, mas o middleware existente funciona.

### ALERTA: Cache do Next.js no CI

Adicionar cache de `.next/cache` no GitHub Actions para builds mais rapidos em execucoes subsequentes:

```yaml
- name: Cache Next.js build
  uses: actions/cache@v4
  with:
    path: .next/cache
    key: nextjs-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('src/**/*.ts', 'src/**/*.tsx') }}
    restore-keys: |
      nextjs-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}-
```

### Configuracao Exata — GitHub Actions CI

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  ci:
    runs-on: ubuntu-latest

    env:
      NEXT_PUBLIC_SUPABASE_URL: http://127.0.0.1:54321
      NEXT_PUBLIC_SUPABASE_ANON_KEY: dummy-anon-key-for-ci
      SUPABASE_SERVICE_ROLE_KEY: dummy-service-role-key-for-ci
      DATABASE_URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      BETTER_AUTH_SECRET: ci-test-secret-minimum-32-chars-long-for-testing
      BETTER_AUTH_URL: http://localhost:3000
      NEXT_PUBLIC_APP_URL: http://localhost:3000
      NODE_ENV: test
      ENVIRONMENT: test

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Run tests
        run: npm run test

      - name: Cache Next.js build
        uses: actions/cache@v4
        with:
          path: .next/cache
          key: nextjs-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('src/**/*.ts', 'src/**/*.tsx') }}
          restore-keys: |
            nextjs-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}-

      - name: Build
        run: npm run build
```

### Configuracao Exata — Playwright Config

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Configuracao Exata — README Estrutura

```markdown
# Caderninho

App de gestao financeira familiar...

## Stack

[tabela com tecnologias]

## Pre-requisitos

- Node.js 22+
- Docker (para Supabase local)
- Supabase CLI (`npm install -g supabase`)
- Git

## Setup Local

1. Clone...
2. npm install
3. Copiar .env.example...
4. npm run db:start
5. npm run db:migrate
6. npm run dev

## Variaveis de Ambiente

[tabela referenciando .env.example]

## Scripts

[tabela com todos os scripts]

## Testes

[como rodar, convencoes TDD]

## Fluxo de Trabalho

[branching, commits, PRs]

## Deploy

[Vercel, 3 ambientes, staging]

## Arquitetura

[resumo, estrutura de pastas, link para doc completa]
```

### Inteligencia da Story Anterior (1.7)

**O que ja existe e DEVE ser preservado:**
- Logger estruturado em `src/server/infrastructure/logging/logger.ts` com sanitizacao de dados sensiveis
- Helpers `ok()` e `err()` do Result Pattern em `src/shared/types/result.ts`
- Schemas Zod comuns em `src/shared/schemas/common.schema.ts`
- Utilitario `validateInput()` em `src/server/infrastructure/validation/validate.ts`
- 189 testes passando (23 arquivos)
- Middleware com rate limiting e verificacao de sessao em `src/middleware.ts`
- Headers de seguranca em `next.config.ts`

**Aprendizados da Story 1.7:**
- `sanitizeData()` precisa tratar arrays de objetos recursivamente
- `email` adicionado como campo sensivel no logger
- for...of mais eficiente que Array.from().some() para iteracao em Sets
- Testes devem mockar o logger para evitar poluicao de output

### Git Intelligence

**Padroes de commit recentes:**
```
eb1fdf4 Merge pull request #7 from vitorcastilho/epic-1/1-7-validacao-logging-e-infraestrutura-compartilhada
34deac5 chore: mark Story 1.7 as done after code review R2 approval
8401d5a fix: resolve code review R1 findings for Story 1.7
b48536d feat: add structured logging, validation infrastructure, and Result Pattern helpers (Story 1.7)
57bba40 Merge pull request #6 from vitorcastilho/epic-1/1-6-auditoria-e-seguranca
```

**Convencao a seguir:**
- `feat:` para implementacao principal da story
- `fix:` para correcoes de code review
- `chore:` para atualizacoes de status
- Branch: `epic-1/1-8-ci-cd-pipeline-ambientes-e-readme`

### Arquivos Existentes Relevantes

| Arquivo | Status | Relevancia |
|---|---|---|
| `package.json` | Modificar | Adicionar scripts `type-check`, `test:e2e`, `test:e2e:ui` |
| `.env.example` | Revisar | Verificar se esta completo para documentacao no README |
| `eslint.config.mjs` | Nao modificar | Flat config ja funciona com `npm run lint` |
| `vitest.config.ts` | Nao modificar | Ja esta configurado corretamente |
| `tsconfig.json` | Nao modificar | Strict mode ja ativo, path aliases configurados |
| `next.config.ts` | Nao modificar | Headers de seguranca ja configurados |
| `drizzle.config.ts` | Nao modificar | Config de migrations ja funciona |
| `supabase/config.toml` | Nao modificar | Supabase local ja configurado |
| `src/middleware.ts` | Nao modificar | Middleware ja funciona |
| `e2e/.gitkeep` | Remover | Sera substituido por arquivos reais |
| `.gitignore` | Modificar | Adicionar entradas do Playwright |

### Arquivos a Criar

- `.github/workflows/ci.yml` — GitHub Actions CI pipeline
- `playwright.config.ts` — Configuracao do Playwright
- `e2e/health.spec.ts` — Teste E2E de smoke
- `README.md` — Documentacao operacional completa

### Arquivos a Modificar

- `package.json` — Adicionar scripts: `type-check`, `test:e2e`, `test:e2e:ui`
- `.gitignore` — Adicionar: `test-results/`, `playwright-report/`, `blob-report/`

### O Que NAO Fazer Nesta Story

- **NAO criar** workflow de deploy no GitHub Actions — Vercel cuida disso nativamente
- **NAO configurar** Supabase real no CI — testes unitarios usam mocks, valores dummy bastam
- **NAO renomear** `middleware.ts` para `proxy.ts` — manter como esta
- **NAO modificar** testes existentes — apenas adicionar novos (E2E)
- **NAO criar** `tailwind.config.ts` — Tailwind v4 nao usa
- **NAO adicionar** linting rules novas ao ESLint — manter config existente
- **NAO criar** workflow de copia de base de dados — sera feito no Epic 9
- **NAO documentar** Sentry, Redis ou outras ferramentas pos-MVP no README
- **NAO escrever** testes E2E detalhados alem do smoke test — apenas setup basico

### Informacao Tecnica Atualizada

**GitHub Actions:**
- `actions/checkout@v4`, `actions/setup-node@v4`, `actions/cache@v4` — versoes estaveis atuais
- `setup-node@v4` com `cache: 'npm'` automaticamente cacheia `~/.npm`
- `npm ci` para instalacao deterministica (usa package-lock.json)
- `concurrency` com `cancel-in-progress: true` cancela runs anteriores da mesma branch

**Vercel + GitHub:**
- Integracao nativa via Vercel Dashboard (nao precisa de workflow)
- Preview deploy automatico em todo push
- Deploy de producao automatico em merge na main
- Bot comment no PR com URL do preview

**Playwright:**
- `@playwright/test` — pacote unico necessario
- `npx playwright install chromium` — instala apenas Chromium (mais leve)
- `webServer` config inicia o dev server automaticamente antes dos testes
- `forbidOnly: !!process.env.CI` — previne `.only` no CI
- `retries: 2` no CI para resiliencia contra flakiness

**Next.js Build no CI:**
- `npm run build` verifica que a aplicacao compila corretamente
- Necessita env vars definidas (mesmo que dummy) para compilar
- Cache de `.next/cache` reduz tempo de builds subsequentes
- `tsc --noEmit` pode precisar de `next-env.d.ts` no repo (ja esta commitado)

### Project Structure Notes

**Alinhamento com a arquitetura:**
- `.github/workflows/ci.yml` — novo diretorio na raiz conforme architecture.md
- `playwright.config.ts` — na raiz conforme architecture.md
- `e2e/` — ja existe (com .gitkeep), sera populado com testes reais
- `README.md` — na raiz, "single source of truth operacional"

**Nenhum conflito com a estrutura existente.**

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.8: CI/CD Pipeline, Ambientes e README]
- [Source: _bmad-output/planning-artifacts/architecture.md#CI/CD Pipeline: GitHub Actions + Vercel]
- [Source: _bmad-output/planning-artifacts/architecture.md#3 Ambientes Isolados]
- [Source: _bmad-output/planning-artifacts/architecture.md#README como Single Source of Truth Operacional]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Handoff]
- [Source: _bmad-output/project-context.md#Development Workflow Rules]
- [Source: _bmad-output/implementation-artifacts/1-7-validacao-logging-e-infraestrutura-compartilhada.md#Dev Notes]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
