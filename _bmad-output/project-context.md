---
project_name: 'Caderninho'
user_name: 'Vitorcastilho'
date: '2026-03-16'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'code_quality_architecture', 'workflow_rules', 'critical_dont_miss']
status: 'complete'
rule_count: 62
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

| Tecnologia | Versão | Notas |
|---|---|---|
| Next.js | 16.1.6 | App Router, Turbopack padrão, React 19 peer dependency |
| TypeScript | 5.9.3 | Strict mode. **NÃO usar 6.0** (RC, instável) |
| Tailwind CSS | 4.2.1 | **BREAKING**: Sem `tailwind.config.ts`. Config via CSS `@theme {}` |
| React | 19.x | Peer dependency do Next.js 16 |
| Vitest | 4.1.0 | Alinhado com Vite 7.x |
| Zod | 4.3.6 | 14x mais rápido que v3. Validação compartilhada front/back |
| Drizzle ORM | 0.45.1 | TypeScript-native, SQL transparente |
| Better Auth | 1.5.5 | Organizations plugin para multi-tenant |
| Supabase | — | PostgreSQL + Realtime (WebSocket direto browser↔Supabase) |
| shadcn/ui | — | + Radix UI + Tailwind CSS |
| Playwright | — | Testes E2E |
| Deploy | Vercel | 3 ambientes: dev (Docker local), staging, production |

### Version Constraints

- **TypeScript 6.0 é RC instável** — forçar 5.9.3
- **Tailwind v4 eliminou config JS/TS** — NÃO criar `tailwind.config.ts` (não existe mais)
- **Next.js 16**: `params`, `searchParams`, `cookies()`, `headers()` retornam **Promises** (APIs async)
- **Next.js 16**: `middleware.ts` foi renomeado para `proxy.ts`
- **Turbopack** é o bundler padrão (não mais experimental)
- Cada dependência tem sua story de instalação — não instalar prematuramente

## Critical Implementation Rules

### TypeScript & Language Rules

**Strict mode obrigatório** — `"strict": true` no tsconfig, sem `any` implícito.

**Result Pattern para erros de negócio:**

```typescript
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: Record<string, string> } };
```

- Todo Server Action e Use Case retorna `Result<T>` — sem exceção
- `code`: UPPER_SNAKE_CASE em inglês (consumo programático) — ex: `INSUFFICIENT_BALANCE`
- `message`: português (exibição ao usuário) — ex: `"Saldo insuficiente na conta"`
- Erros de validação incluem `details` com campos que falharam
- `throw` reservado **exclusivamente** para erros inesperados de infraestrutura

**Precisão financeira (CRÍTICO):**

- Valores monetários em **integer cents**: R$ 149,99 → `14999`
- Percentuais com 2 casas decimais: 25,03% → `2503`
- Divisão por 100 **apenas** na camada de apresentação
- **Zero floating point** em qualquer operação financeira

**Import ordering obrigatório:**

```typescript
// 1. Bibliotecas externas
// 2. Shared (tipos, schemas) — @/shared/
// 3. Server (domínio, infra) — @/server/
// 4. Client (componentes, hooks) — @/client/
// 5. Estilos
```

**Path aliases** (`tsconfig.json`): `@/*` → `src/*`, `@/server/*`, `@/client/*`, `@/shared/*`, `@/app/*`

**Naming conventions:**

| Elemento | Convenção | Exemplo |
|---|---|---|
| Variáveis/funções | camelCase | `amountCents`, `getUserById()` |
| Tipos/interfaces | PascalCase | `Transaction`, `CreateAccountInput` |
| Componentes React | PascalCase | `TransactionForm.tsx` |
| Constantes | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Arquivos use case | kebab-case | `create-account.ts` |
| Arquivos teste | kebab-case + .test | `create-account.test.ts` |
| Pastas | kebab-case | `use-cases/` |
| Schemas Zod | camelCase + Schema | `transactionSchema` |
| Error codes | UPPER_SNAKE_CASE (inglês) | `INSUFFICIENT_BALANCE` |
| Error messages | Português | `"Saldo insuficiente"` |
| Tabelas DB | plural, snake_case | `transactions`, `audit_logs` |
| Colunas DB | snake_case | `amount_cents`, `created_at` |

### Framework Rules (Next.js 16 + React 19)

**Next.js 16 — Mudanças que quebram:**

- `params`, `searchParams`, `cookies()`, `headers()` são **async** — retornam Promises
- `middleware.ts` renomeado para `proxy.ts`
- Turbopack é bundler padrão — não usar webpack configs
- Cache Components para caching explícito (modelo novo)

**Server Actions como padrão de comunicação:**

- Toda comunicação cliente↔servidor via Server Actions — sem endpoints REST manuais
- Route Handlers apenas para webhooks e cron jobs
- Cada Server Action mapeia para um Use Case do domínio (DDD)
- Fluxo: Server Action valida com Zod → chama Use Case → retorna `Result<T>`

**React patterns:**

- `useState` para estado local, React Context para estado compartilhado pequeno (tema, sessão)
- Sem lib de estado global no MVP (YAGNI — não instalar antecipadamente)
- `useOptimistic` para feedback < 100ms
- `useTransition` para navegações e ações que não são de formulário
- `useFormStatus` para spinner em botões de submit
- React Hook Form + Zod resolver para todos os formulários

**Loading states:**

- Cada rota tem `loading.tsx` com skeleton — nunca tela em branco
- Botões de submit mostram spinner e ficam desabilitados durante ação

**Tailwind CSS v4:**

- Config via CSS: `@import "tailwindcss"` + `@theme {}`
- **NÃO criar** `tailwind.config.ts` — não existe mais no v4
- Design tokens configurados via `@theme {}` em `globals.css`

### Testing Rules

**TDD obrigatório — Red-Green-Refactor:**

- Escrever teste ANTES da implementação (Red)
- Implementar o mínimo para passar (Green)
- Melhorar estrutura mantendo testes verdes (Refactor)

**Organização de testes:**

- Testes unitários **co-localizados** com o arquivo testado: `create-account.test.ts` ao lado de `create-account.ts`
- Testes E2E na pasta `e2e/` na raiz (fluxos completos, não arquivos individuais)
- Pattern: `describe('NomeDaFuncionalidade')` → `it('deve fazer X quando Y')`

**Vitest config:**

- `globals: true` — sem import de `describe`/`it`/`expect`
- `environment: 'node'` como padrão
- Path aliases resolvidos no `vitest.config.ts` (mesmos do tsconfig)
- Scripts: `test` (run), `test:watch` (dev), `test:coverage`

**O que testar:**

- Use Cases: lógica de negócio + edge cases + erros esperados via Result Pattern
- Schemas Zod: validação de inputs válidos e inválidos
- Componentes: interações críticas (não testar estilização)
- **Não testar** implementações de infraestrutura diretamente — mock via interfaces de repository

**Mocking:**

- Mock de repositories via interfaces (SOLID D — Dependency Inversion)
- Nunca mockar Zod ou o Result Pattern — testar de verdade
- Supabase/Drizzle mockados nos testes unitários, usados de verdade nos E2E

### Code Quality & Architecture Rules

**Estrutura do projeto — Clean Architecture + DDD:**

```
src/
  server/           # BACKEND — tudo que roda no servidor
    domain/         # Núcleo DDD (entidades, use cases, repository interfaces)
    infrastructure/ # Implementações concretas (DB, auth, realtime)
    actions/        # Server Actions (entry points)
  client/           # FRONTEND — tudo que roda no browser
    components/     # Componentes visuais (por domínio + ui/)
    hooks/          # Custom hooks
    utils/          # Utilitários de formatação
  shared/           # COMPARTILHADO (front + back)
    types/          # Result<T>, enums, tipos globais
    schemas/        # Schemas Zod compartilhados
    constants/      # Constantes compartilhadas
  app/              # ROTAS — camada fina de orquestração
e2e/                # Testes E2E (raiz)
```

**Regras de dependência (CRÍTICO):**

- `app/` importa de: `client/`, `server/actions/` — **NUNCA** de `server/domain/` ou `server/infrastructure/`
- `client/` importa de: `shared/`, hooks próprios — **NUNCA** de `server/`
- `server/actions/` importa de: `server/domain/`, `shared/` — **NUNCA** de `server/infrastructure/`
- `server/domain/` importa de: `shared/`, interfaces próprias — **NUNCA** de `infrastructure/`, `client/`, `app/`
- `server/infrastructure/` importa de: `server/domain/` (interfaces), `shared/`
- `shared/` importa de: **nada** (zero dependências)
- Domínios **nunca** importam diretamente entre si — Server Actions orquestram

**Data flow completo:**

```
Browser → page.tsx (app/) → Server Action (server/actions/)
  → Use Case (server/domain/) → Repository Interface (server/domain/repositories/)
  → Repository Impl (server/infrastructure/) → PostgreSQL (filtrado por RLS)
  → Use Case retorna Result<T> → Server Action retorna para browser
  → Supabase Realtime notifica outros clientes
```

**Anti-patterns proibidos:**

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

**Logging estruturado JSON:**

```typescript
console.log(JSON.stringify({
  level: 'info',               // info | warn | error
  action: 'create_transaction', // snake_case, nome do use case
  userId: 'xxx',
  data: { amountCents: 14999 }, // nunca dados sensíveis
  timestamp: new Date().toISOString(),
}));
```

**Segurança — Autorização em 2 camadas obrigatórias:**

- **Camada 1**: RLS no PostgreSQL — isolamento multi-tenant no nível do banco
- **Camada 2**: Middleware de autorização na aplicação — papéis e permissões
- Nenhuma query ao banco pode existir sem ambas as camadas ativas
- Trilha de auditoria imutável (tabela `audit_logs`, somente INSERT) em toda mutação

### Design System Enforcement Rules

**4 Barreiras de conformidade visual** (acordadas na Retrospectiva do Épico 2):

1. **Barreira Story:** Toda story com UI tem uma Task 0 obrigatória: "Consultar Design System e protótipos relevantes" — consultar `/design-system`, verificar protótipos em `_bmad-output/prototypes/`, listar componentes UI existentes a reutilizar
2. **Barreira Dev Notes:** Seção "### Design System & Protótipos" obrigatória nos Dev Notes — lista protótipos relevantes, seções DS a consultar, componentes UI existentes, regras visuais
3. **Barreira Code Review:** Checklist de code review inclui seção "Visual & Design System Compliance" com severidade MEDIUM (blocking) — tokens de cor, border-radius, espaçamentos, componentes DS, validação contra protótipo, tipografia
4. **Barreira Componente Novo:** Dev nunca cria componente visual ad-hoc em story de feature. Workflow formal: dev identifica necessidade → documenta → UX prototipa no HTML → implementa no DS com testes e seção na página /design-system → dev importa

**Paths do Design System:**
- Página DS (rota): `/design-system`
- Página DS (código): `src/app/design-system/page.tsx`
- Protótipos HTML: `_bmad-output/prototypes/`
- Componentes UI: `src/client/components/ui/`

**Regras de tokens visuais:**
- Nunca hex hardcoded — sempre classes Tailwind do DS (ex: `text-muted-foreground`, não `#6b7280`)
- Tipografia: Inter para texto geral, `tabular-nums` para valores numéricos
- Espaçamentos: grid base 4px (classes Tailwind padrão)
- Border-radius: seguir padrão DS

**Workflow de componente novo:**
- Dev identifica necessidade de componente visual que não existe
- Dev documenta a necessidade (issue ou documento)
- UX prototipa no HTML (`_bmad-output/prototypes/`)
- Dev implementa no DS com testes e seção na página `/design-system`
- Dev importa e usa na story de feature
- Componente novo NUNCA é criado ad-hoc dentro de uma story de feature

**Componentes UI disponíveis (`src/client/components/ui/`):**
- `badge.tsx` — Badge com 4 variants (default/secondary/outline/destructive)
- `bank-logo.tsx` — Logo de banco
- `bottom-navigation.tsx` — Navegação mobile com FAB central
- `breadcrumb.tsx` — Breadcrumb de navegação
- `budget-progress-bar.tsx` — Barra de progresso de orçamento (3 variantes, 4 faixas de cor)
- `button.tsx` — Button CVA com variants: default/secondary/ghost/outline/destructive/link
- `card.tsx` — Card + CardHeader/CardTitle/CardDescription/CardContent/CardFooter/CardAction
- `cascade-input.tsx` — Fluxo de registro em cascata (progressive disclosure, 4 steps)
- `credit-card-brand-badge.tsx` — Badge de bandeira de cartão de crédito
- `currency-input.tsx` — Input monetário R$ (centavos in/out)
- `dialog.tsx` — Dialog modal
- `emoji-picker.tsx` — Seletor de emoji
- `empty-state.tsx` — Estado vazio com ícone + CTA
- `impact-preview.tsx` — Preview de impacto antes/depois (integra BudgetProgressBar)
- `input.tsx` — Input base com cn()
- `label.tsx` — Label
- `page-header.tsx` — H1 + description + action button
- `percentage-input.tsx` — Input percentual (basis points in/out)
- `select.tsx` — Select dropdown
- `sheet.tsx` — Sheet (bottom drawer)
- `skeleton.tsx` — Skeleton loading
- `sonner.tsx` — Toast notifications (Sonner)
- `summary-card.tsx` — Card compacto de métricas (default/compact, trends)
- `table.tsx` — Table
- `tabs.tsx` — Tabs

### Development Workflow Rules

**Git & Branching (atualizado na Story 1.14 — ver `CLAUDE.md`):**

- Cada story: branch a partir de `staging` atualizada, **na pasta principal do projeto** (`git switch`) — nunca `git worktree` nem cópias do repositório em outras pastas
- PR da story para `staging` (squash) → CI verde → validação em staging
- Ao fim do épico, sem pendências em staging: PR `staging → main` com **merge commit** (nunca squash; nunca apagar `staging`) → validação em produção
- Toda story passa por `create-story` → `dev-story` → `code-review`, invocados de verdade; o hook `.claude/hooks/bmad-story-guard.mjs` e o job de CI `bmad-process` conferem

**CI/CD (GitHub Actions + Vercel):**

- Push em feature branch → Vercel cria preview deploy
- PR aberto → GitHub Actions: ESLint + TypeScript type-check + Vitest
- Merge em `main` → Vercel deploy produção
- Checks obrigatórios: lint passa, TS compila, testes passam, build sucede

**3 Ambientes isolados:**

- **Development**: Supabase CLI + Docker local (`supabase start` + `npm run dev`)
- **Staging**: Vercel preview + projeto Supabase de staging
- **Production**: Vercel production + projeto Supabase de produção
- Cada ambiente com banco Supabase separado (isolamento total de dados)
- Drizzle-kit roda migrations em cada ambiente independentemente

**Processo de validação visual:**

- UX valida obrigatoriamente toda tela/componente visual — nenhum componente visual é "done" sem validação
- Dev valida contra o protótipo HTML correspondente antes de considerar pronto
- Protótipos HTML são a fonte da verdade visual (15 protótipos)

**Princípios fundacionais obrigatórios:**

- SOLID, DDD, Clean Code, TDD — do início ao fim do desenvolvimento
- Backend como dono das regras de negócio — frontend exibe e coleta, **nunca** decide regras de negócio

### Critical Don't-Miss Rules

- **Um só caminho de conexão (Story 1.13):** app e migrations usam o pooler do Supabase em **modo transação** em todos os ambientes (local `54329`, staging/produção `6543`), com `prepare: false`. Migrations: `npm run db:migrate -- --env <local|staging|production>` (produção exige `--confirm-production`); nunca colar URL com senha no terminal. Testes de banco/migration só no Supabase (local zerado com `npm run db:reset:local`), nunca num Postgres "puro".
- **Hierarquia de gastos (FR38):** classificação → categoria → subcategoria → estabelecimento (opcional). Categoria é o grande grupo (Alimentação, Transporte); subcategoria é o tipo de gasto (Supermercado, Gasolina, Pedágio). **Nunca** use uma subcategoria como categoria em código, seeds, sugestões, testes ou exemplos — siga o `proto-08` e a seção "Modelo da Hierarquia de Gastos" da arquitetura. Orçamento e método de pagamento são opcionais em todos os níveis.

**Gotchas do Stack:**

- **Tailwind v4**: NÃO criar `tailwind.config.ts` — config é via CSS (`@theme {}`)
- **Next.js 16 async APIs**: `const { id } = await params` — não mais síncrono
- **Next.js 16 proxy.ts**: middleware agora é `proxy.ts`, não `middleware.ts`
- **Drizzle snake↔camel**: DB usa `amount_cents`, TS usa `amountCents` — mapear explicitamente: `amountCents: integer('amount_cents')`
- **Drizzle migrations**: SEMPRE usar `npx drizzle-kit generate` para criar migrations. NUNCA criar arquivos `.sql` manualmente — o drizzle-kit só aplica migrations registradas no `meta/_journal.json` com snapshot correspondente. Arquivo `.sql` solto é silenciosamente ignorado pelo `drizzle-kit migrate`.

**Precisão financeira — Edge cases:**

- Arredondamento de parcelas: soma das parcelas = valor total exato (centavos)
- Nunca usar `Math.round(valor * 100)` — valores já devem estar em centavos desde a entrada
- Divisão por 100 somente em `formatCurrency()` na camada de apresentação
- Booleanos como `true`/`false` em JSON (nunca `1`/`0`)
- Nulls explícitos em JSON (`"phone": null`, nunca omitir o campo)

**Segurança — Regras invioláveis:**

- Nenhuma query sem RLS + middleware de autorização ativos
- `audit_logs` somente INSERT — nunca UPDATE ou DELETE
- Impersonation bloqueada em produção (`ENVIRONMENT=production` → bloqueio no middleware E na UI)
- Dados sensíveis nunca em logs (senhas, tokens, dados pessoais)
- HTTPS obrigatório em todos os ambientes

**Escopo — O que NÃO fazer sem a story correspondente:**

- NÃO instalar dependências que não são da story atual
- NÃO criar componentes de UI antes da Story 1.2 (Design System)
- NÃO configurar banco antes da Story 1.3 (Supabase)
- NÃO criar schemas de autenticação antes da Story 1.4 (Better Auth)
- NÃO modificar `page.tsx` padrão do Next.js prematuramente
- NÃO criar `tailwind.config.ts` (Tailwind v4 não usa)
- NÃO instalar Playwright antes da Story 1.8

---

## Usage Guidelines

**Para Agentes IA:**

- Ler este arquivo antes de implementar qualquer código
- Seguir TODAS as regras exatamente como documentadas
- Em caso de dúvida, preferir a opção mais restritiva
- Consultar a arquitetura (`_bmad-output/planning-artifacts/architecture.md`) para detalhes completos

**Para Humanos:**

- Manter este arquivo enxuto e focado nas necessidades dos agentes
- Atualizar quando o stack tecnológico mudar
- Revisar periodicamente para remover regras que se tornaram óbvias
- Adicionar novas regras quando padrões emergirem durante o desenvolvimento

Last Updated: 2026-04-04
