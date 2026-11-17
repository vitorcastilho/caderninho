---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - product-brief-finance-2026-03-05.md
  - prd.md
  - prd-validation-report.md
  - ux-design-specification.md
  - brainstorming-session-2026-03-03-2100.md
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-03-15'
project_name: 'Caderninho'
user_name: 'Vitorcastilho'
date: '2026-03-14'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements (70 FRs em 12 subsistemas):**

| Subsistema | FRs | Complexidade Arquitetural |
|---|---|---|
| Gestão de Contas e Estrutura Financeira | FR1-FR8 | Modelo multi-entidade (contas, cartões, investimentos, fontes de receita) com métricas calculadas em tempo real |
| Registro de Transações | FR9-FR17, FR58 | Fluxo cascata com feedback < 100ms, transferências internas, recálculo de totalizadores < 500ms |
| Gastos Recorrentes | FR18-FR22 | 5 tipos de recorrência com frequências variáveis, projeção automática na timeline até 10 anos |
| Checklist Mensal | FR23-FR27 | 5 tipos de conta com confirmação diferenciada, geração automática, progresso visual |
| Notificações | FR28-FR29 | 3 momentos por conta (véspera, dia, atraso), badge persistente até confirmação |
| Dashboard e Controle | FR30-FR34, FR59-FR62 | Real-time, drill-down hierárquico 4 níveis, tap-to-trace, widgets configuráveis, filtro de perspectiva |
| Projeção Futura | FR35-FR37, FR62 | Timeline de parcelas, gastos não-mensais, margem projetada por mês |
| Categorização | FR38-FR44, FR71, FR72 | Hierarquia 4 níveis (classificação → categoria → subcategoria → estabelecimento opcional) com orçamento e método opcionais em todos os níveis, reclassificação retroativa, 7 classificações de essencialidade editáveis — ver "Modelo da Hierarquia de Gastos" |
| Gestão de Usuários | FR45-FR50 | Multi-tenant, papéis (Gestor/Acompanhante), permissões granulares, trilha de auditoria imutável |
| Admin | FR51-FR54 | Impersonation (não-prod), restauração de base, monitoramento |
| Modelo de Cartão | FR64-FR70 | Mês de referência automático, fatura estimada, reconciliação com loop até zero |
| Reconciliação e Backup | FR55-FR57, FR63 | Reconciliação de fatura guiada, backup automático com monitoramento |

**Non-Functional Requirements (24 NFRs):**

| Categoria | Quantidade | Destaques |
|---|---|---|
| Performance | 7 | Dashboard < 2s, feedback < 100ms, recálculo < 500ms, real-time < 2s, navegação < 300ms |
| Segurança | 4 | Sessões 7d renováveis, HTTPS, AES-256, OWASP Top 10 |
| Confiabilidade | 5 | 99.5% uptime, backup diário/semanal, RTO < 4h, RPO < 24h, zero perda transacional |
| Manutenibilidade | 4 | Separação camadas, 3 ambientes, restore < 30min, módulos sem deps circulares |
| Usabilidade | 4 | Registro < 10s, design system unificado, Acompanhante < 30s para entender status, feedback < 1s |

**Scale & Complexity:**

- Domínio primário: Full-stack Web (SPA + API + DB + Real-time + PWA)
- Nível de complexidade: Alto
- Componentes arquiteturais estimados: ~12 módulos de domínio + infraestrutura transversal

### Technical Constraints & Dependencies

- Design system definido: shadcn/ui + Tailwind CSS + Radix UI (decisão de UX, não de arquitetura)
- 3 ambientes isolados com deploy controlado e restauração de base
- Projeto mantido por 1 desenvolvedor — simplicidade operacional é requisito implícito
- Sem integrações externas no MVP
- Multi-tenant genérico preparado para N famílias/N membros
- Papéis genéricos (Gestor Financeiro / Acompanhante) — não amarrados a personas específicas

### Cross-Cutting Concerns Identified

1. **Precisão financeira** — representação decimal em todos os cálculos, sem floating point. Afeta: transações, orçamentos, projeções, reconciliação, dashboard
2. **Sincronização real-time** — mutações propagadas em < 2s para todos os conectados. Afeta: registro, edição, exclusão, checklist, reconciliação
3. **Trilha de auditoria** — log imutável (quem, quando, o quê) em toda mutação. Afeta: todos os subsistemas de escrita
4. **Autorização granular** — permissões por consentimento, privacidade como padrão. Afeta: todas as queries e visualizações
5. **Responsividade contextual** — 3 contextos de uso (registro mobile, gestão desktop, consulta mobile). Afeta: todos os componentes de UI
6. **Isolamento multi-tenant** — dados segregados por família/grupo. Afeta: todas as operações de dados

## Starter Template Evaluation

### Domínio Tecnológico Primário

Full-stack Web Application (SPA + API + DB + Real-time + PWA) baseado em análise dos 70 FRs e 24 NFRs do projeto.

### Preferências Técnicas do Desenvolvedor

- **Linguagens**: TypeScript e JavaScript (também Java, mas não aplicável ao projeto)
- **Experiência**: Nível intermediário, familiaridade com relacional e não-relacional
- **Deploy**: Vercel (já possui aplicações)
- **Infraestrutura**: Mais familiaridade com Docker que serverless
- **Postura**: Aberto a sugestões, prioriza a melhor solução técnica

### Starters Avaliados

| Starter | Avaliação | Motivo |
|---|---|---|
| create-t3-app | Descartado | Inclui NextAuth (substituído por Better Auth) e Prisma (substituído por Drizzle). Mais trabalho remover do que começar limpo |
| Boilerplates opinados diversos | Descartados | Decisões pré-definidas conflitam com nossas escolhas de stack |
| **create-next-app (padrão)** | **Selecionado** | Base limpa, inclui exatamente o necessário, sem conflito com nossas escolhas |

### Starter Selecionado: create-next-app

**Rationale:**
O Caderninho tem um stack customizado (Drizzle + Better Auth + Supabase Realtime) que não corresponde a nenhum starter opinado. Começar com o create-next-app padrão evita o trabalho de remover/substituir dependências indesejadas e dá controle total sobre a estrutura.

**Comando de Inicialização:**

```bash
npx create-next-app@latest caderninho --typescript --tailwind --eslint --app --src-dir --turbopack
```

**Decisões Arquiteturais Fornecidas pelo Starter:**

**Language & Runtime:**
- TypeScript configurado com strict mode
- Node.js runtime (com suporte a Edge runtime onde necessário)

**Styling Solution:**
- Tailwind CSS (pré-requisito para shadcn/ui, definido na especificação de UX)

**Build Tooling:**
- Turbopack para development (bundler rápido)
- Next.js compiler para production builds

**Code Organization:**
- App Router com `src/` directory
- Estrutura de pastas baseada em rotas (file-based routing)

**Development Experience:**
- Hot reloading via Turbopack
- ESLint configurado
- TypeScript com verificação de tipos

### Stack Completo Definido

| Componente | Escolha | Versão | Justificativa |
|---|---|---|---|
| Framework | Next.js (App Router, TypeScript, Turbopack) | 16.1.6 | Full-stack em um projeto, deploy nativo na Vercel, Server Actions para API |
| Banco de Dados | PostgreSQL via Supabase | — | ACID completo, RLS para multi-tenant, backup diário grátis, always-on (sem cold start) |
| ORM | Drizzle ORM + drizzle-kit | 0.45.1 | TypeScript-native, SQL transparente (crítico para queries financeiras complexas), migrations versionadas no git |
| Autenticação | Better Auth (Organizations plugin) | 1.5.5 | v1 estável (vs Auth.js v5 ainda beta), email/senha first-class, Organizations para multi-tenant, sessões no banco |
| Real-time | Supabase Realtime | — | WebSocket via WAL direto browser↔Supabase (Vercel não suporta WebSocket), < 2s propagação, respeita RLS |
| Testes unitários | Vitest | — | Rápido, TypeScript nativo, API compatível com Jest, extensão VS Code para debug integrado |
| Testes E2E | Playwright | — | Candidato para testes end-to-end (detalhamento no step de decisões) |
| Design System | shadcn/ui + Tailwind CSS + Radix UI | — | Definido na especificação de UX |
| Deploy | Vercel | — | Desenvolvedor já possui aplicações, preview deploys automáticos, serverless auto-scaling |

### Decisões de Precisão Financeira

- **Valores monetários**: armazenados como inteiros em centavos (R$ 149,99 → `14999`)
- **Percentuais**: armazenados como inteiros com 2 casas decimais (25,03% → `2503`)
- **Divisão por 100 apenas na camada de apresentação** — cálculos sempre em inteiros
- **Sem floating point em nenhuma operação financeira**

### Arquitetura de Conexões

```
┌──────────┐       HTTPS        ┌──────────┐
│  Browser │ ──────────────────→ │  Vercel  │  ← Server Actions, páginas, API
│          │                     │ (Next.js)│
│          │                     └──────────┘
│          │
│          │     WebSocket       ┌───────────────┐
│          │ ──────────────────→ │   Supabase    │  ← Real-time direto
│          │                     │  (Realtime)   │
└──────────┘                     └───────┬───────┘
                                         │
                                    ┌────┴────┐
                                    │PostgreSQL│  ← WAL (Write-Ahead Log)
                                    │(Supabase)│
                                    └─────────┘
```

- **Vercel** serve o Next.js (páginas, Server Actions, API) via HTTPS
- **Supabase Realtime** mantém conexão WebSocket direto com o browser
- **Drizzle** conecta ao PostgreSQL para queries de leitura/escrita (via Server Actions)
- **Supabase client** usado **apenas** para real-time (sem vendor lock-in nas queries)

**Nota:** A inicialização do projeto com este comando deve ser a primeira story de implementação.

## Core Architectural Decisions

### Princípios Fundacionais de Engenharia

Os seguintes princípios são **obrigatórios do início ao fim do desenvolvimento**. Toda decisão de implementação, review de código e contribuição deve respeitar estes princípios:

- **SOLID** — Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **DDD (Domain-Driven Design)** — domínio como centro da arquitetura, entidades, value objects, use cases, agregados
- **Clean Code** — código legível, funções pequenas com responsabilidade única, nomes expressivos, sem comentários desnecessários
- **TDD (Test-Driven Development)** — teste primeiro, implementa depois, refatora. Ciclo Red-Green-Refactor
- **Backend como dono das regras de negócio** — toda validação e lógica de negócio vive no servidor (Server Actions). O frontend exibe e coleta dados, mas **nunca** decide regras de negócio

### Decision Priority Analysis

**Decisões Críticas (bloqueiam implementação):**
- Validação de dados (Zod)
- Autorização multi-camada (RLS + middleware)
- Padrão de comunicação (Server Actions)
- Padrão de tratamento de erros (Result Pattern)
- Ambientes de desenvolvimento (Docker local + staging + produção)

**Decisões Importantes (moldam a arquitetura):**
- Gerenciamento de estado frontend
- Formulários (React Hook Form + Zod)
- CI/CD pipeline
- Monitoramento e logging

**Decisões Adiadas (pós-MVP):**
- Cache externo (Redis) — só se performance exigir
- Zustand para estado global — só se complexidade exigir
- Sentry para error tracking — só se volume de erros justificar
- Playwright E2E — estratégia detalhada definida na implementação

### Data Architecture

#### Validação de Dados: Zod

- **Decisão**: Zod como biblioteca única de validação
- **Versão**: verificar latest no momento da implementação
- **Rationale**: TypeScript-native, integração nativa com Drizzle (`drizzle-zod`), React Hook Form (`@hookform/resolvers/zod`) e shadcn/ui. Schemas compartilhados entre frontend e backend garantem validação consistente
- **Afeta**: todos os subsistemas com entrada de dados (transações, contas, orçamentos, categorias, usuários)
- **Padrão DDD**: schemas Zod funcionam como Value Objects — fonte única de verdade para validação

```typescript
// Schema compartilhado (Value Object)
const transactionSchema = z.object({
  amountCents: z.number().int().positive("Valor deve ser positivo"),
  description: z.string().min(1).max(200),
  categoryId: z.string().uuid(),
  date: z.date(),
});

// Backend: valida no Server Action
const parsed = transactionSchema.safeParse(input);

// Frontend: valida no formulário (mesmo schema)
const form = useForm({ resolver: zodResolver(transactionSchema) });
```

#### Estratégia de Cache: Next.js Nativo

- **Decisão**: sem cache externo no MVP. Utilizar cache nativo do Next.js
- **Rationale**: React Server Components fazem cache automático, `unstable_cache` para queries pesadas (totalizadores do dashboard). PostgreSQL com poucos usuários não precisa de Redis
- **Afeta**: Dashboard (< 2s), totalizadores (< 500ms)
- **Evolução futura**: se performance exigir, adicionar Redis como camada de cache dedicada

### Authentication & Security

#### Autorização: Defesa em Profundidade (CRÍTICO)

- **Decisão**: autorização em duas camadas obrigatórias
- **Rationale**: para dados financeiros, uma única camada de proteção é insuficiente. Se o código falhar, o banco protege. Se o banco falhar, o código protege
- **Afeta**: TODOS os subsistemas — toda query e toda mutação

**Camada 1 — Row-Level Security (RLS) no PostgreSQL:**
- Garante isolamento multi-tenant no nível mais baixo
- Políticas RLS aplicadas em **todas** as tabelas com dados de usuário
- Mesmo que o código da aplicação tenha um bug, o banco **nunca** retorna dados de outra família
- Implementado via Supabase RLS policies vinculadas ao tenant_id da sessão

**Camada 2 — Middleware de Autorização na Aplicação:**
- Lógica de papéis: Gestor Financeiro tem acesso total, Acompanhante tem acesso restrito ao consentido
- Permissões granulares de consentimento verificadas em cada operação
- Implementado como middleware nos Server Actions (antes de executar qualquer lógica de negócio)

**Regra inviolável**: nenhuma query ao banco pode existir sem que ambas as camadas estejam ativas. Code reviews devem verificar isso explicitamente.

#### Criptografia de Dados

- **Decisão**: AES-256 at rest (Supabase) + HTTPS em trânsito, sem criptografia por campo no MVP
- **Rationale**: criptografia por campo impede queries analíticas (`SUM`, `AVG`). Criptografia de disco do Supabase + TLS/HTTPS atende o requisito AES-256 do PRD. Dados financeiros pessoais não exigem PCI-DSS
- **Afeta**: todas as conexões (Vercel↔Browser, Drizzle↔PostgreSQL, Browser↔Supabase Realtime)
- **Evolução futura**: se necessário criptografar campos específicos (ex: número de cartão), utilizar `pgcrypto`

#### Conformidade OWASP Top 10

| Vulnerabilidade | Mitigação |
|---|---|
| Injection (SQL/XSS) | Drizzle parametriza queries + Zod sanitiza inputs |
| Broken Authentication | Better Auth com sessões no banco, expiração 7d |
| Broken Access Control | RLS no banco + middleware na aplicação (defesa em profundidade) |
| Security Misconfiguration | Headers de segurança via `next.config` (CSP, HSTS, X-Frame-Options) |
| Cryptographic Failures | AES-256 at rest (Supabase) + HTTPS em trânsito |
| Vulnerable Components | Dependabot/Renovate para atualização automática de dependências |
| Identification Failures | Better Auth com verificação de email obrigatória |
| Data Integrity Failures | Validação Zod em toda entrada + trilha de auditoria imutável |
| Logging & Monitoring | Trilha de auditoria (quem, quando, o quê) em toda mutação |
| SSRF | Server Actions não expõem URLs internas |

### API & Communication Patterns

#### Padrão de Comunicação: Server Actions

- **Decisão**: Server Actions como padrão para toda comunicação cliente↔servidor. Route Handlers apenas para casos pontuais (webhooks, cron jobs)
- **Rationale**: type-safe de ponta a ponta, sem necessidade de endpoints REST manuais, validação Zod integrada. tRPC descartado por adicionar complexidade desnecessária quando cliente e servidor estão no mesmo projeto
- **Afeta**: todos os subsistemas
- **Alinhamento com DDD**: cada Server Action mapeia para um Use Case do domínio

#### Tratamento de Erros: Result Pattern

- **Decisão**: Result Pattern para erros de negócio. Exceções reservadas para erros inesperados (infraestrutura)
- **Rationale**: erros de negócio (saldo insuficiente, categoria inválida) são resultados esperados, não exceções. O Result Pattern torna isso explícito, testável (TDD) e type-safe
- **Afeta**: todos os Server Actions e Use Cases

```typescript
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

// Use Case retorna Result, nunca lança exceção para erros de negócio
async function createTransaction(input: CreateTransactionInput): Promise<Result<Transaction>> {
  const validated = transactionSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: '...' } };
  }

  if (validated.data.amountCents <= 0) {
    return { success: false, error: { code: 'INVALID_AMOUNT', message: 'Valor deve ser positivo' } };
  }

  const result = await db.insert(transactions).values(validated.data).returning();
  return { success: true, data: result[0] };
}
```

#### Rate Limiting: Middleware Next.js

- **Decisão**: rate limiting via middleware no Next.js
- **Rationale**: controle no código (testável, versionado no git), sem dependência de serviço externo. Map em memória para o MVP, migração para Redis se escalar
- **Afeta**: todas as rotas da API e Server Actions

### Frontend Architecture

#### Gerenciamento de Estado: Sem Lib Global

- **Decisão**: `useState` para estado local, React Context para estado compartilhado pequeno (tema, sessão, sidebar). Sem lib de estado global no MVP
- **Rationale**: Server Components buscam dados direto do servidor, Supabase Realtime propaga atualizações, `revalidatePath` sincroniza após mutações. Estado no cliente é mínimo (UI state)
- **Afeta**: todos os componentes de UI
- **Evolução futura**: Zustand se surgir necessidade real de estado global complexo (YAGNI — não instalar antecipadamente)

#### Formulários: React Hook Form + Zod

- **Decisão**: React Hook Form com resolvers Zod para todos os formulários
- **Rationale**: performance (sem re-render a cada keystroke), schemas Zod compartilhados com backend (DDD — Value Objects), integração nativa com shadcn/ui
- **Afeta**: registro de transações, criação de contas, orçamentos, reconciliação, configurações

#### Performance & Otimização

| Padrão | Ferramenta | Requisito Atendido |
|---|---|---|
| Optimistic Updates | `useOptimistic` (React/Next.js) | Feedback < 100ms |
| Code Splitting | App Router (automático) | Navegação < 300ms |
| Lazy Loading | `next/dynamic` para componentes pesados | Bundle inicial menor |
| Otimização de imagens | `next/image` | Performance geral |

### Infrastructure & Deployment

#### 3 Ambientes Isolados

| Ambiente | Finalidade | Infraestrutura | Branch |
|---|---|---|---|
| **Development** | Desenvolvimento local + TDD | Supabase CLI + Docker (PostgreSQL, Realtime, Auth locais) | feature branches |
| **Staging** | Validação pré-produção | Vercel preview deploy + projeto Supabase de staging | `staging` |
| **Production** | Usuários reais | Vercel production + projeto Supabase de produção | `main` |

- Cada ambiente com **banco Supabase separado** (isolamento total de dados)
- Variáveis de ambiente configuradas por ambiente na Vercel
- Drizzle-kit roda migrations em cada ambiente independentemente
- Development 100% local via Docker (Supabase CLI): `npm run db:start` + `npm run dev`

**Um só caminho de conexão (Story 1.13):** app e migrations conectam pelo **pooler do Supabase (Supavisor) em modo transação**, com `prepare: false` no driver, em todos os ambientes — problemas de conexão aparecem no local ou no CI, não depois do deploy.

| Ambiente | Conexão (`DATABASE_URL`) | Arquivo local das migrations |
|---|---|---|
| **Development** | Pooler local, porta **54329** (`postgresql://postgres.pooler-dev:postgres@127.0.0.1:54329/postgres`) | `.env.local` |
| **Staging** | Pooler do projeto Supabase de staging, porta **6543** | `.env.staging.local` |
| **Production** | Pooler do projeto Supabase de produção, porta **6543** | `.env.production.local` |

- Nunca a conexão direta (54322 local, 5432 remota) — nem no app, nem nas migrations
- Migrations: `npm run db:migrate -- --env <local|staging|production>`; fora do CI (GitHub Actions, `GITHUB_ACTIONS=true`) o `DATABASE_URL` vem só do arquivo do ambiente (nunca do shell; no CI, da variável do job), o destino é impresso sem a senha, o local fora de `127.0.0.1:54329` e staging/produção fora da 6543 ou com o project ref de outro ambiente (usuário `postgres.<ref>` no pooler compartilhado ou host `db.<ref>.supabase.co` no pooler dedicado; refs só em `scripts/lib/migrate-env.ts`) são recusados, `db:push`/`db:studio` só aceitam o `.env.local` no pooler local (o `db:generate` não conecta no banco), argumentos desconhecidos, `--env` repetido, `--confirm-production` fora de produção, URL com `$` (o Next expande `$VAR`, o migrate não — `$` da senha vai como `%24`) e usuário/host com project refs diferentes são recusados, produção exige `--confirm-production` e os `.env*.local` são lidos da raiz do repositório
- Testar migrations do zero: `npm run db:reset:local` (zera o Supabase local e aplica tudo pelo pooler). Testes de banco só no Supabase, nunca num Postgres "puro" (sem `auth.uid()`)

#### CI/CD Pipeline: GitHub Actions + Vercel

| Evento | Ação Automática |
|---|---|
| Push em feature branch | Vercel cria preview deploy |
| Pull Request aberto | GitHub Actions: lint + type-check + testes (Vitest) + build; migrations do zero pelo pooler |
| Merge em `staging` | Vercel deploy staging + migrations Supabase staging (job `deploy-migrations`) |
| Merge em `main` | Vercel deploy produção + migrations Supabase produção (job `deploy-migrations`) |

**Jobs do `.github/workflows/ci.yml`** (PR e push em `staging`/`main`; não há `deploy.yml`):

| Job | Quando | O que faz |
|---|---|---|
| `ci` | PR e push | Lint, type-check, Vitest e `next build` |
| `bmad-process` | PR | Confere se as stories alteradas passaram pelos workflows BMAD (Story 1.14) |
| `migrations` | PR e push | Sobe o Supabase (Postgres + Supavisor) e aplica **todas as migrations do zero pelo pooler em modo transação** (54329); roda de novo e confere que todas do journal foram aplicadas; antes, falha se `drizzle-kit generate` gerar arquivo novo (schema sem migration) |
| `deploy-migrations` | Push em `staging`/`main`, depois de `ci` e `migrations` | Aplica as migrations no banco do ambiente com a URL do **secret do repositório** (`STAGING_DATABASE_URL` ou `PRODUCTION_DATABASE_URL`, porta 6543). Em `main` roda com `--confirm-production` — o merge `staging → main` é a confirmação. Sem o secret, avisa e não falha |

- Secrets do repositório, não Environments do GitHub (o plano gratuito não tem Environments em repositório privado)
- Só execuções de PR são canceladas pela concorrência; um push novo nunca interrompe uma migration em andamento. Mas o GitHub mantém só **uma** execução pendente por grupo: em pushes seguidos no mesmo branch, a do meio é cancelada antes de começar, e o deploy da Vercel desse commit fica no ar sem as migrations dele até a execução seguinte (que aplica todas as pendentes) terminar
- O job `migrations` sobe o Supabase sem `gotrue`/`storage-api`: os schemas `auth`/`storage` ficam no estado base da imagem do Postgres, não no das migrations do GoTrue de staging/produção. Hoje só `auth.uid()` é usado (existe na imagem); uma migration que dependa de colunas de `auth`/`storage` precisa de conferência manual em staging
- Migration e deploy da Vercel começam juntos no push: depois do lançamento, migrations precisam ser retrocompatíveis

**Checks obrigatórios antes de merge:**
- ESLint passa
- TypeScript compila sem erros
- Todos os testes passam (Vitest)
- Build do Next.js sucede

Fluxo: `feature branch → PR → checks passam → merge staging → valida → merge main → produção`

#### Monitoramento e Logging

**Trilha de Auditoria (imutável):**
- Tabela `audit_log` no PostgreSQL — quem, quando, o quê, valor anterior, valor novo
- Todo use case de mutação registra na trilha
- Somente INSERT, nunca UPDATE ou DELETE nesta tabela

**Logging da Aplicação:**
- Logs estruturados em JSON
- Vercel dashboard para visualização e busca de logs

**Monitoramento de Uptime:**
- Vercel Analytics para performance e Web Vitals
- Serviço externo gratuito (UptimeRobot ou similar) para monitoramento de uptime (meta: 99.5%)

### Requisitos Documentacionais

#### README como Single Source of Truth Operacional

O README do projeto deve conter **tudo** que um desenvolvedor precisa para trabalhar no projeto:

1. **Visão geral** — o que é o Caderninho, para que serve
2. **Pré-requisitos** — Node.js, Docker, Supabase CLI, versões mínimas
3. **Setup local completo** — passo a passo para subir o ambiente de desenvolvimento (Supabase CLI + Docker + Next.js)
4. **Variáveis de ambiente** — todas as env vars necessárias, com exemplos (sem valores reais)
5. **Como rodar testes** — comandos, como escrever novos testes, convenções de TDD
6. **Fluxo de trabalho** — branching strategy, como criar PRs, checks obrigatórios
7. **Deploy** — como funciona staging, como chega em produção, como rodar migrations
8. **Arquitetura** — stack, estrutura de pastas, decisões tomadas e links para documentação detalhada

### Decision Impact Analysis

**Sequência de Implementação:**
1. Inicialização do projeto (create-next-app + configuração base)
2. Setup do banco (Supabase + Drizzle schemas + migrations + RLS policies)
3. Autenticação (Better Auth + Organizations)
4. Infraestrutura transversal (Result Pattern, auditoria, rate limiting, middleware de autorização)
5. Domínios de negócio (contas, transações, categorias, orçamentos...)
6. Real-time (Supabase Realtime)
7. CI/CD pipeline (GitHub Actions)
8. README operacional

**Dependências entre Decisões:**
- RLS depende do schema do banco e do Better Auth (precisa do tenant_id na sessão)
- Server Actions dependem do Result Pattern e Zod (infraestrutura transversal)
- Formulários dependem dos schemas Zod (Value Objects compartilhados)
- CI/CD depende dos testes (Vitest deve estar configurado antes)
- Real-time depende do schema do banco (escuta mudanças nas tabelas)

## Implementation Patterns & Consistency Rules

### Naming Patterns

#### Banco de Dados (PostgreSQL)

| Elemento | Convenção | Exemplo |
|---|---|---|
| Tabelas | plural, snake_case | `transactions`, `audit_logs`, `recurring_expenses` |
| Colunas | snake_case | `amount_cents`, `created_at`, `account_id` |
| Foreign keys | tabela_referenciada_id | `account_id`, `category_id`, `family_id` |
| Índices | idx_tabela_coluna | `idx_transactions_account_id`, `idx_transactions_created_at` |
| Enums | snake_case | `transaction_type`, `recurrence_frequency` |

```sql
-- Correto
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount_cents INTEGER NOT NULL,
  account_id UUID REFERENCES accounts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);

-- Incorreto
CREATE TABLE Transaction (...)          -- singular, PascalCase
CREATE TABLE TRANSACTIONS (...)         -- UPPER_CASE
```

#### Código TypeScript

| Elemento | Convenção | Exemplo |
|---|---|---|
| Variáveis e funções | camelCase | `amountCents`, `getUserById()` |
| Tipos e interfaces | PascalCase | `Transaction`, `CreateAccountInput` |
| Componentes React | PascalCase | `TransactionForm`, `DashboardCard` |
| Constantes | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `DEFAULT_PAGE_SIZE` |
| Arquivos de componente | PascalCase | `TransactionForm.tsx`, `BalanceCard.tsx` |
| Arquivos utilitários | camelCase | `formatCurrency.ts`, `dateUtils.ts` |
| Arquivos de use case | kebab-case | `create-account.ts`, `get-balance.ts` |
| Arquivos de teste | kebab-case + .test | `create-account.test.ts` |
| Pastas | kebab-case | `use-cases/`, `server-actions/` |
| Schemas Drizzle (variável) | camelCase plural | `transactions`, `accounts` |
| Schemas Zod (variável) | camelCase + Schema | `transactionSchema`, `accountSchema` |
| Error codes | UPPER_SNAKE_CASE (inglês) | `INSUFFICIENT_BALANCE`, `VALIDATION_ERROR` |
| Error messages | Português | `"Saldo insuficiente na conta"` |

```typescript
// Correto
const amountCents = 14999;
type CreateTransactionInput = z.infer<typeof transactionSchema>;
function calculateBalance(accountId: string): Promise<Result<number>> { ... }

// Incorreto
const amount_cents = 14999;      // snake_case no TS
type createTransactionInput = ...  // camelCase para tipo
function CalculateBalance() { ... } // PascalCase para função
```

**Conversão automática Drizzle (DB ↔ TS):**

```typescript
// No código TypeScript: camelCase
// No banco PostgreSQL: snake_case (gerado automaticamente pelo Drizzle)
export const transactions = pgTable('transactions', {
  amountCents: integer('amount_cents').notNull(),  // TS: amountCents → DB: amount_cents
  createdAt: timestamp('created_at').defaultNow(),  // TS: createdAt → DB: created_at
});
```

#### Rotas e URLs

| Elemento | Convenção | Exemplo |
|---|---|---|
| Rotas (pastas) | kebab-case | `/recurring-expenses/`, `/credit-card/` |
| Parâmetros dinâmicos | camelCase dentro de `[]` | `[accountId]`, `[cardId]` |
| Query params | camelCase | `?categoryId=xxx&startDate=2026-03` |

### Structure Patterns

#### Organização do Projeto — Clean Architecture + DDD

Separação explícita entre backend (`server/`) e frontend (`client/`):

```
src/
  server/                            # ── BACKEND (tudo que roda no servidor)
    domain/                          #    Núcleo DDD
      accounts/
        entities/
          account.ts
          account.schema.ts          #    Value Objects (Zod)
        use-cases/
          create-account.ts
          create-account.test.ts     #    Teste co-localizado (TDD)
          get-account-balance.ts
          get-account-balance.test.ts
        repositories/
          account.repository.ts      #    Interface (contrato)
      transactions/
        entities/
        use-cases/
        repositories/
      categories/
        ...
    infrastructure/                  #    Implementações concretas
      database/
        schema/                      #    Schemas Drizzle (tabelas)
        repositories/                #    Implementação dos repositories
        migrations/
      auth/                          #    Better Auth config
      realtime/                      #    Supabase Realtime config
    actions/                         #    Server Actions (entry points)
      account.actions.ts
      transaction.actions.ts

  client/                            # ── FRONTEND (tudo que roda no browser)
    components/                      #    Componentes de UI
      ui/                            #    shadcn/ui (botões, inputs, etc.)
      accounts/                      #    Componentes por domínio
        AccountForm.tsx
        AccountCard.tsx
      transactions/
        TransactionForm.tsx
        TransactionList.tsx
      dashboard/
        DashboardSummary.tsx
        BalanceCard.tsx
    hooks/                           #    Custom hooks
      useOptimisticTransaction.ts
      useRealtimeUpdates.ts
    utils/                           #    Utilitários de frontend
      formatCurrency.ts
      formatDate.ts

  app/                               # ── ROTAS (camada fina de orquestração)
    (auth)/
      login/page.tsx
      register/page.tsx
    (app)/
      dashboard/page.tsx
      accounts/[accountId]/page.tsx
      transactions/page.tsx
      recurring-expenses/page.tsx
      credit-card/[cardId]/
        reconciliation/page.tsx

  shared/                            # ── COMPARTILHADO (frontend + backend)
    types/                           #    Result, enums, tipos globais
      result.ts
    schemas/                         #    Schemas Zod compartilhados
      transaction.schema.ts
      account.schema.ts

e2e/                                 # ── TESTES E2E (Playwright) — raiz do projeto
  auth.spec.ts
  transaction-flow.spec.ts
```

**Responsabilidade de cada camada:**

| Pasta | Quem roda | Responsabilidade |
|---|---|---|
| `src/server/` | Servidor | Domínio, regras de negócio, banco, auth |
| `src/client/` | Browser | Componentes visuais, hooks, formatação |
| `src/app/` | Ambos | Camada fina — conecta rotas a componentes e actions |
| `src/shared/` | Ambos | Tipos e schemas Zod (validação dos dois lados) |
| `e2e/` | CI/local | Testes end-to-end (fluxos completos) |

**Fluxo de uma operação:**

```
Browser → page.tsx (app/) → Server Action (server/actions/) → Use Case (server/domain/) → Repository Interface (server/domain/) → Repository Impl (server/infrastructure/)
               ↓
       Componente (client/components/)
```

**Regras estruturais:**
- `app/` nunca contém lógica de negócio — apenas importa componentes e chama actions
- `server/domain/` nunca importa de `infrastructure/` — depende de interfaces (SOLID D)
- `client/` nunca acessa o banco diretamente — sempre via Server Actions
- Testes unitários co-localizados com o arquivo testado (`.test.ts` ao lado)
- Testes E2E na pasta `e2e/` na raiz (testam fluxos completos, não arquivos individuais)

### Format Patterns

#### API Response Format (Result Pattern)

```typescript
// Tipo base — usado em TODOS os Server Actions e Use Cases
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: Record<string, string> } };

// Sucesso
{ success: true, data: { id: "xxx", amountCents: 14999 } }

// Erro de negócio
{ success: false, error: { code: "INSUFFICIENT_BALANCE", message: "Saldo insuficiente na conta" } }

// Erro de validação
{ success: false, error: { code: "VALIDATION_ERROR", message: "Dados inválidos", details: { amountCents: "Valor deve ser positivo" } } }
```

**Regras:**
- Todo Server Action retorna `Result<T>` — sem exceção
- `code` sempre UPPER_SNAKE_CASE em inglês (consumo programático)
- `message` sempre em português (exibição ao usuário)
- Erros de validação incluem `details` com campos que falharam
- Exceções (`throw`) reservadas exclusivamente para erros inesperados de infraestrutura

#### Datas

| Contexto | Formato | Exemplo |
|---|---|---|
| Banco (PostgreSQL) | `timestamp with time zone` | `2026-03-15T14:30:00-03:00` |
| JSON (API/Server Actions) | ISO 8601 string | `"2026-03-15T14:30:00.000Z"` |
| Exibição (UI) | Localizado pt-BR | `15/03/2026 às 14:30` |
| Mês de referência | `YYYY-MM` string | `"2026-03"` |

#### JSON

- Campos em **camelCase** (alinhado com TypeScript)
- Nulls explícitos (`"phone": null`, nunca omitir o campo)
- Booleanos como `true`/`false` (nunca `1`/`0`)

### Process Patterns

#### Loading States

- Cada rota tem seu `loading.tsx` com skeleton (nunca tela em branco)
- Botões de submit mostram spinner e ficam desabilitados durante a ação (`useFormStatus`)
- Optimistic Updates via `useOptimistic` para feedback < 100ms
- `useTransition` para navegações e ações que não são de formulário

#### Logging

Logs estruturados em JSON em todo o backend:

```typescript
console.log(JSON.stringify({
  level: 'info',                        // info | warn | error
  action: 'create_transaction',         // snake_case, nome do use case
  userId: 'xxx',
  familyId: 'xxx',
  data: { amountCents: 14999 },         // dados relevantes (nunca sensíveis)
  timestamp: new Date().toISOString(),
}));
```

**Regras:**
- Logs sempre em JSON estruturado
- Nunca logar dados sensíveis (senhas, tokens, dados pessoais)
- `level` obrigatório: `info` (operação normal), `warn` (inesperado recuperável), `error` (falha)
- `action` obrigatório: nome do use case em snake_case

#### Ordem de Imports

Padrão consistente em todos os arquivos:

```typescript
// 1. Bibliotecas externas
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// 2. Shared (tipos, schemas)
import { Result } from '@/shared/types/result';
import { transactionSchema } from '@/shared/schemas/transaction.schema';

// 3. Server (domínio, infra)
import { createTransaction } from '@/server/domain/transactions/use-cases/create-transaction';

// 4. Client (componentes, hooks)
import { TransactionForm } from '@/client/components/transactions/TransactionForm';

// 5. Estilos (se houver)
import './styles.css';
```

**Path aliases** (`tsconfig.json`):
- `@/server/*` → `src/server/*`
- `@/client/*` → `src/client/*`
- `@/shared/*` → `src/shared/*`
- `@/app/*` → `src/app/*`

### Enforcement Guidelines

**Todos os desenvolvedores e agentes IA DEVEM:**

1. Seguir as convenções de naming sem exceção — inconsistência gera bugs silenciosos
2. Respeitar a separação `server/` vs `client/` — lógica de negócio nunca no frontend
3. Retornar `Result<T>` em todo Server Action e Use Case — sem exceções para erros de negócio
4. Escrever testes antes da implementação (TDD) — co-localizados com o arquivo testado
5. Usar schemas Zod de `shared/` para validação — nunca duplicar validação
6. Seguir a ordem de imports padronizada — ESLint deve enforçar automaticamente

**Verificação de conformidade:**
- ESLint com regras de import ordering e naming conventions
- TypeScript strict mode para type-safety
- Code review verificando separação de camadas e Result Pattern
- CI pipeline bloqueia merge se lint ou testes falharem

**Anti-patterns (proibidos):**

```typescript
// ❌ Lógica de negócio no frontend
// client/components/TransactionForm.tsx
if (balance - amount < 0) showError("Sem saldo"); // ERRADO — regra no frontend

// ✅ Lógica de negócio no backend
// server/domain/transactions/use-cases/create-transaction.ts
if (balance - amountCents < 0) return { success: false, error: { code: "INSUFFICIENT_BALANCE", message: "Sem saldo" } };

// ❌ Server Action acessando banco diretamente
// server/actions/transaction.actions.ts
const result = await db.insert(transactions).values(data); // ERRADO — pulou o use case

// ✅ Server Action chamando use case
// server/actions/transaction.actions.ts
const result = await createTransaction(data); // CORRETO — use case encapsula a regra

// ❌ Exceção para erro de negócio
throw new Error("Saldo insuficiente"); // ERRADO — erro esperado não é exceção

// ✅ Result Pattern para erro de negócio
return { success: false, error: { code: "INSUFFICIENT_BALANCE", message: "Saldo insuficiente" } };
```

## Modelo da Hierarquia de Gastos

_(Adicionado em 2026-11-15 — correct-course. Fonte de produto: PRD FR5, FR38, FR71, FR72 e `decisao-modelo-categorizacao-v2.md` com adendo v2.1.)_

**Níveis e tabelas:**

| Nível | Tabela | Pai | Exemplo | Orçamento | Método padrão |
|---|---|---|---|---|---|
| Classificação | `essentiality_classifications` | — | Essenciais | opcional | opcional |
| Categoria | `categories` | classificação | Alimentação, Transporte | opcional | opcional |
| Subcategoria | `subcategories` | categoria | Supermercado, Gasolina, Pedágio | opcional | opcional |
| Estabelecimento | `establishments` | subcategoria | Pão de Açúcar, Posto da esquina | opcional | opcional (definido) + aprendido |

- **Orçamento:** `budget_min_cents` / `budget_max_cents` (nullable; valor fixo = min igual a max). Ausente = nível sem orçamento.
- **Método padrão:** `default_payment_method_type` / `default_payment_method_id` (nullable) em todos os níveis. No estabelecimento, o método **definido** pelo usuário fica separado do método **aprendido** pelo uso.
- **Transação de gasto:** `category_id` e `subcategory_id` obrigatórios; estabelecimento opcional. A classificação vem da categoria (reclassificação retroativa, FR41).
- **Nunca** modelar um tipo de gasto (Supermercado, Gasolina) como categoria. Categoria é o grande grupo; subcategoria é o tipo de gasto.

**Regra de preenchimento do método (FR71):** função pura de domínio `server/domain/categories/` (`resolve-payment-method`), sem acesso a banco, testada com TDD. Entrada: a cadeia estabelecimento → subcategoria → categoria → classificação com seus padrões e o histórico recente de métodos por nível. Saída: método preenchido + atalhos ("último usado", padrão do nível acima) + eventual sugestão de padrão. Em cada nível, do mais específico ao mais geral: padrão definido; senão hábito (3 últimos registros no nível com o mesmo método); senão sobe. Sugestão de padrão: método mais usado no nível nos últimos 90 dias, diferente do padrão atual (ou sem padrão), ainda não dispensado.

**Orçamento multinível (FR60, FR72):**
- Gasto realizado agregado por nível (cada transação conta no seu estabelecimento, subcategoria, categoria e classificação).
- Saldo não alocado de um nível = orçamento do nível − soma dos orçamentos dos filhos diretos que têm orçamento.
- Valor disponível livre: cada gasto é contado **uma única vez**, no nível mais específico da sua cadeia que tem orçamento — nunca somar o mesmo gasto em dois níveis.

**Política de dados do modelo:** antes do lançamento, mudanças no modelo podem ser entregues com reset dos bancos de staging e produção (sem migração de dados), sempre com confirmação do PO. Depois do lançamento, apenas migrations que preservam dados.

## Project Structure & Boundaries

### Mapeamento de Subsistemas para Domínios

| Domínio | Subsistemas PRD | FRs | Entidades Principais |
|---|---|---|---|
| `accounts` | Gestão de Contas e Estrutura Financeira | FR1-FR8 | Account, InvestmentAccount, IncomeSource |
| `transactions` | Registro de Transações | FR9-FR17, FR58 | Transaction, Transfer |
| `credit-cards` | Modelo de Cartão | FR64-FR70 | CreditCard, Invoice |
| `recurring` | Gastos Recorrentes | FR18-FR22 | RecurringExpense |
| `checklist` | Checklist Mensal | FR23-FR27 | ChecklistItem |
| `categories` | Categorização | FR38-FR44, FR71, FR72 | Classification, Category, Subcategory, Establishment (orçamento e método opcionais em todos) |
| `budgets` | Dashboard e Controle + Projeção Futura | FR30-FR37, FR59-FR62 | Budget, Projection |
| `notifications` | Notificações | FR28-FR29 | Notification |
| `users` | Gestão de Usuários | FR45-FR50 | User, Family, Permission |
| `admin` | Admin | FR51-FR54 | Impersonation, DatabaseCopy |
| `reconciliation` | Reconciliação e Backup | FR55-FR57, FR63 | Reconciliation |

### Complete Project Directory Structure

```
caderninho/
├── README.md                            # Single source of truth operacional
├── package.json
├── package-lock.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── components.json                      # Config do shadcn/ui
├── .env.example                         # Template de variáveis de ambiente
├── .env.local                           # Variáveis locais (gitignored)
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── supabase/                            # Supabase CLI config (Docker local)
│   └── config.toml
├── scripts/
│   └── copy-prod-db.sh                  # Cópia de base produção → dev/staging
├── .github/
│   └── workflows/
│       ├── ci.yml                       # Jobs ci, bmad-process, migrations e deploy-migrations
│       └── copy-db.yml                  # Workflow manual para cópia de base
├── e2e/                                 # Testes E2E (Playwright)
│   ├── auth.spec.ts
│   ├── transaction-flow.spec.ts
│   ├── dashboard.spec.ts
│   └── reconciliation.spec.ts
├── public/
│   ├── manifest.json                    # PWA manifest
│   ├── sw.js                            # Service Worker
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
└── src/
    ├── middleware.ts                     # Rate limiting + auth check
    │
    ├── server/                          # ══ BACKEND ══
    │   ├── domain/                      # Núcleo DDD (11 domínios)
    │   │   ├── accounts/                # FR1-FR8: Gestão de Contas
    │   │   │   ├── entities/
    │   │   │   │   ├── account.ts
    │   │   │   │   └── account.schema.ts
    │   │   │   ├── use-cases/
    │   │   │   │   ├── create-account.ts
    │   │   │   │   ├── create-account.test.ts
    │   │   │   │   ├── update-account.ts
    │   │   │   │   ├── update-account.test.ts
    │   │   │   │   ├── get-account-balance.ts
    │   │   │   │   └── get-account-balance.test.ts
    │   │   │   └── repositories/
    │   │   │       └── account.repository.ts
    │   │   │
    │   │   ├── transactions/            # FR9-FR17, FR58: Registro de Transações
    │   │   │   ├── entities/
    │   │   │   │   ├── transaction.ts
    │   │   │   │   └── transaction.schema.ts
    │   │   │   ├── use-cases/
    │   │   │   │   ├── create-transaction.ts
    │   │   │   │   ├── create-transaction.test.ts
    │   │   │   │   ├── update-transaction.ts
    │   │   │   │   ├── update-transaction.test.ts
    │   │   │   │   ├── delete-transaction.ts
    │   │   │   │   ├── delete-transaction.test.ts
    │   │   │   │   ├── transfer-between-accounts.ts
    │   │   │   │   ├── transfer-between-accounts.test.ts
    │   │   │   │   ├── recalculate-totals.ts
    │   │   │   │   └── recalculate-totals.test.ts
    │   │   │   └── repositories/
    │   │   │       └── transaction.repository.ts
    │   │   │
    │   │   ├── credit-cards/            # FR64-FR70: Modelo de Cartão
    │   │   │   ├── entities/
    │   │   │   │   ├── credit-card.ts
    │   │   │   │   ├── credit-card.schema.ts
    │   │   │   │   ├── invoice.ts
    │   │   │   │   └── invoice.schema.ts
    │   │   │   ├── use-cases/
    │   │   │   │   ├── calculate-reference-month.ts
    │   │   │   │   ├── calculate-reference-month.test.ts
    │   │   │   │   ├── estimate-invoice.ts
    │   │   │   │   ├── estimate-invoice.test.ts
    │   │   │   │   ├── reconcile-invoice.ts
    │   │   │   │   └── reconcile-invoice.test.ts
    │   │   │   └── repositories/
    │   │   │       ├── credit-card.repository.ts
    │   │   │       └── invoice.repository.ts
    │   │   │
    │   │   ├── recurring/               # FR18-FR22: Gastos Recorrentes
    │   │   │   ├── entities/
    │   │   │   │   ├── recurring-expense.ts
    │   │   │   │   └── recurring-expense.schema.ts
    │   │   │   ├── use-cases/
    │   │   │   │   ├── create-recurring.ts
    │   │   │   │   ├── create-recurring.test.ts
    │   │   │   │   ├── project-timeline.ts
    │   │   │   │   └── project-timeline.test.ts
    │   │   │   └── repositories/
    │   │   │       └── recurring.repository.ts
    │   │   │
    │   │   ├── checklist/               # FR23-FR27: Checklist Mensal
    │   │   │   ├── entities/
    │   │   │   │   ├── checklist-item.ts
    │   │   │   │   └── checklist-item.schema.ts
    │   │   │   ├── use-cases/
    │   │   │   │   ├── generate-monthly-checklist.ts
    │   │   │   │   ├── generate-monthly-checklist.test.ts
    │   │   │   │   ├── confirm-payment.ts
    │   │   │   │   └── confirm-payment.test.ts
    │   │   │   └── repositories/
    │   │   │       └── checklist.repository.ts
    │   │   │
    │   │   ├── categories/              # FR38-FR44: Categorização
    │   │   │   ├── entities/
    │   │   │   │   ├── category.ts
    │   │   │   │   └── category.schema.ts
    │   │   │   ├── use-cases/
    │   │   │   │   ├── create-category.ts
    │   │   │   │   ├── create-category.test.ts
    │   │   │   │   ├── reclassify-transactions.ts
    │   │   │   │   └── reclassify-transactions.test.ts
    │   │   │   └── repositories/
    │   │   │       └── category.repository.ts
    │   │   │
    │   │   ├── budgets/                 # FR30-FR37, FR59-FR62: Dashboard + Projeção
    │   │   │   ├── entities/
    │   │   │   │   ├── budget.ts
    │   │   │   │   ├── budget.schema.ts
    │   │   │   │   └── projection.ts
    │   │   │   ├── use-cases/
    │   │   │   │   ├── get-dashboard-summary.ts
    │   │   │   │   ├── get-dashboard-summary.test.ts
    │   │   │   │   ├── drill-down-category.ts
    │   │   │   │   ├── drill-down-category.test.ts
    │   │   │   │   ├── calculate-projection.ts
    │   │   │   │   └── calculate-projection.test.ts
    │   │   │   └── repositories/
    │   │   │       └── budget.repository.ts
    │   │   │
    │   │   ├── notifications/           # FR28-FR29: Notificações
    │   │   │   ├── entities/
    │   │   │   │   ├── notification.ts
    │   │   │   │   └── notification.schema.ts
    │   │   │   ├── use-cases/
    │   │   │   │   ├── generate-notifications.ts
    │   │   │   │   ├── generate-notifications.test.ts
    │   │   │   │   ├── dismiss-notification.ts
    │   │   │   │   └── dismiss-notification.test.ts
    │   │   │   └── repositories/
    │   │   │       └── notification.repository.ts
    │   │   │
    │   │   ├── users/                   # FR45-FR50: Gestão de Usuários
    │   │   │   ├── entities/
    │   │   │   │   ├── user.ts
    │   │   │   │   ├── user.schema.ts
    │   │   │   │   ├── family.ts
    │   │   │   │   └── permission.ts
    │   │   │   ├── use-cases/
    │   │   │   │   ├── invite-member.ts
    │   │   │   │   ├── invite-member.test.ts
    │   │   │   │   ├── update-permissions.ts
    │   │   │   │   ├── update-permissions.test.ts
    │   │   │   │   ├── get-audit-trail.ts
    │   │   │   │   └── get-audit-trail.test.ts
    │   │   │   └── repositories/
    │   │   │       ├── user.repository.ts
    │   │   │       └── family.repository.ts
    │   │   │
    │   │   ├── admin/                   # FR51-FR54: Administração
    │   │   │   ├── entities/
    │   │   │   │   └── admin-action.ts
    │   │   │   ├── use-cases/
    │   │   │   │   ├── impersonate-user.ts
    │   │   │   │   ├── impersonate-user.test.ts
    │   │   │   │   ├── stop-impersonation.ts
    │   │   │   │   ├── stop-impersonation.test.ts
    │   │   │   │   ├── trigger-database-copy.ts
    │   │   │   │   ├── trigger-database-copy.test.ts
    │   │   │   │   ├── get-copy-status.ts
    │   │   │   │   └── get-copy-status.test.ts
    │   │   │   └── repositories/
    │   │   │       └── admin.repository.ts
    │   │   │
    │   │   └── reconciliation/          # FR55-FR57, FR63: Reconciliação
    │   │       ├── entities/
    │   │       │   ├── reconciliation.ts
    │   │       │   └── reconciliation.schema.ts
    │   │       ├── use-cases/
    │   │       │   ├── start-reconciliation.ts
    │   │       │   ├── start-reconciliation.test.ts
    │   │       │   ├── match-transaction.ts
    │   │       │   └── match-transaction.test.ts
    │   │       └── repositories/
    │   │           └── reconciliation.repository.ts
    │   │
    │   ├── infrastructure/              # Implementações concretas
    │   │   ├── database/
    │   │   │   ├── client.ts            # Instância do Drizzle
    │   │   │   ├── schema/              # Schemas Drizzle (tabelas)
    │   │   │   │   ├── accounts.ts
    │   │   │   │   ├── transactions.ts
    │   │   │   │   ├── credit-cards.ts
    │   │   │   │   ├── recurring.ts
    │   │   │   │   ├── checklist.ts
    │   │   │   │   ├── categories.ts
    │   │   │   │   ├── budgets.ts
    │   │   │   │   ├── notifications.ts
    │   │   │   │   ├── users.ts
    │   │   │   │   ├── audit-logs.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── repositories/        # Implementação dos repositories
    │   │   │   │   ├── account.repository.impl.ts
    │   │   │   │   ├── transaction.repository.impl.ts
    │   │   │   │   ├── credit-card.repository.impl.ts
    │   │   │   │   ├── recurring.repository.impl.ts
    │   │   │   │   ├── checklist.repository.impl.ts
    │   │   │   │   ├── category.repository.impl.ts
    │   │   │   │   ├── budget.repository.impl.ts
    │   │   │   │   ├── notification.repository.impl.ts
    │   │   │   │   ├── user.repository.impl.ts
    │   │   │   │   ├── family.repository.impl.ts
    │   │   │   │   ├── admin.repository.impl.ts
    │   │   │   │   └── reconciliation.repository.impl.ts
    │   │   │   └── migrations/          # Drizzle-kit migrations versionadas
    │   │   │       └── ...
    │   │   ├── auth/
    │   │   │   ├── config.ts            # Better Auth config
    │   │   │   ├── middleware.ts         # Auth middleware
    │   │   │   └── permissions.ts       # Lógica de papéis/permissões
    │   │   ├── realtime/
    │   │   │   └── client.ts            # Supabase Realtime config
    │   │   └── logging/
    │   │       └── logger.ts            # Logger estruturado JSON
    │   │
    │   └── actions/                     # Server Actions (entry points)
    │       ├── account.actions.ts
    │       ├── transaction.actions.ts
    │       ├── credit-card.actions.ts
    │       ├── recurring.actions.ts
    │       ├── checklist.actions.ts
    │       ├── category.actions.ts
    │       ├── budget.actions.ts
    │       ├── notification.actions.ts
    │       ├── user.actions.ts
    │       ├── admin.actions.ts
    │       └── reconciliation.actions.ts
    │
    ├── client/                          # ══ FRONTEND ══
    │   ├── components/
    │   │   ├── ui/                      # shadcn/ui (gerado)
    │   │   │   ├── button.tsx
    │   │   │   ├── input.tsx
    │   │   │   ├── card.tsx
    │   │   │   ├── dialog.tsx
    │   │   │   ├── select.tsx
    │   │   │   ├── table.tsx
    │   │   │   └── ...
    │   │   ├── layout/
    │   │   │   ├── Sidebar.tsx
    │   │   │   ├── Header.tsx
    │   │   │   ├── MobileNav.tsx
    │   │   │   └── ThemeProvider.tsx
    │   │   ├── accounts/
    │   │   │   ├── AccountForm.tsx
    │   │   │   ├── AccountCard.tsx
    │   │   │   └── AccountList.tsx
    │   │   ├── transactions/
    │   │   │   ├── TransactionForm.tsx
    │   │   │   ├── TransactionList.tsx
    │   │   │   └── TransactionFilters.tsx
    │   │   ├── credit-cards/
    │   │   │   ├── CreditCardForm.tsx
    │   │   │   ├── InvoiceSummary.tsx
    │   │   │   └── ReconciliationWizard.tsx
    │   │   ├── recurring/
    │   │   │   ├── RecurringForm.tsx
    │   │   │   └── RecurringList.tsx
    │   │   ├── checklist/
    │   │   │   ├── ChecklistView.tsx
    │   │   │   └── ChecklistProgress.tsx
    │   │   ├── categories/
    │   │   │   ├── CategoryTree.tsx
    │   │   │   └── CategoryForm.tsx
    │   │   ├── dashboard/
    │   │   │   ├── DashboardSummary.tsx
    │   │   │   ├── BalanceCard.tsx
    │   │   │   ├── ExpenseChart.tsx
    │   │   │   └── DrillDownView.tsx
    │   │   ├── notifications/
    │   │   │   ├── NotificationBadge.tsx
    │   │   │   └── NotificationList.tsx
    │   │   ├── users/
    │   │   │   ├── InviteMemberForm.tsx
    │   │   │   ├── PermissionsPanel.tsx
    │   │   │   └── AuditTrailView.tsx
    │   │   └── admin/
    │   │       ├── UserImpersonationList.tsx
    │   │       ├── ImpersonationBanner.tsx
    │   │       ├── DatabaseCopyButton.tsx
    │   │       └── WorkflowStatus.tsx
    │   ├── hooks/
    │   │   ├── useOptimisticTransaction.ts
    │   │   ├── useRealtimeUpdates.ts
    │   │   ├── useFormAction.ts
    │   │   └── useNotifications.ts
    │   └── utils/
    │       ├── formatCurrency.ts
    │       ├── formatCurrency.test.ts
    │       ├── formatDate.ts
    │       ├── formatDate.test.ts
    │       ├── formatPercent.ts
    │       └── formatPercent.test.ts
    │
    ├── app/                             # ══ ROTAS (camada fina) ══
    │   ├── globals.css
    │   ├── layout.tsx                   # Root layout
    │   ├── (auth)/
    │   │   ├── layout.tsx
    │   │   ├── login/
    │   │   │   └── page.tsx
    │   │   └── register/
    │   │       └── page.tsx
    │   └── (app)/
    │       ├── layout.tsx               # Sidebar + Header + auth check
    │       ├── dashboard/
    │       │   ├── page.tsx
    │       │   └── loading.tsx
    │       ├── accounts/
    │       │   ├── page.tsx
    │       │   ├── loading.tsx
    │       │   ├── new/
    │       │   │   └── page.tsx
    │       │   └── [accountId]/
    │       │       ├── page.tsx
    │       │       └── edit/
    │       │           └── page.tsx
    │       ├── transactions/
    │       │   ├── page.tsx
    │       │   ├── loading.tsx
    │       │   └── new/
    │       │       └── page.tsx
    │       ├── credit-cards/
    │       │   ├── page.tsx
    │       │   ├── loading.tsx
    │       │   └── [cardId]/
    │       │       ├── page.tsx
    │       │       └── reconciliation/
    │       │           └── page.tsx
    │       ├── recurring/
    │       │   ├── page.tsx
    │       │   └── loading.tsx
    │       ├── checklist/
    │       │   ├── page.tsx
    │       │   └── loading.tsx
    │       ├── categories/
    │       │   ├── page.tsx
    │       │   └── loading.tsx
    │       ├── budgets/
    │       │   ├── page.tsx
    │       │   └── loading.tsx
    │       ├── projections/
    │       │   ├── page.tsx
    │       │   └── loading.tsx
    │       ├── notifications/
    │       │   └── page.tsx
    │       ├── settings/
    │       │   ├── page.tsx
    │       │   ├── members/
    │       │   │   └── page.tsx
    │       │   └── permissions/
    │       │       └── page.tsx
    │       └── admin/
    │           ├── page.tsx
    │           ├── loading.tsx
    │           ├── impersonation/
    │           │   └── page.tsx
    │           └── database/
    │               └── page.tsx
    │
    └── shared/                          # ══ COMPARTILHADO ══
        ├── types/
        │   ├── result.ts                # Result<T> type
        │   ├── enums.ts
        │   └── index.ts
        ├── schemas/
        │   ├── account.schema.ts
        │   ├── transaction.schema.ts
        │   ├── credit-card.schema.ts
        │   ├── recurring.schema.ts
        │   ├── checklist.schema.ts
        │   ├── category.schema.ts
        │   ├── budget.schema.ts
        │   └── user.schema.ts
        └── constants/
            ├── essentiality-levels.ts   # 7 classificações de essencialidade
            └── recurrence-types.ts      # 5 tipos de recorrência
```

### Architectural Boundaries

#### Regras de Dependência

```
┌─────────────────────────────────────────────┐
│  app/ (rotas)                               │
│  Importa de: client/, server/actions/       │
│  NUNCA importa de: server/domain/,          │
│  server/infrastructure/                     │
├─────────────────────────────────────────────┤
│  client/ (frontend)                         │
│  Importa de: shared/, hooks próprios        │
│  NUNCA importa de: server/                  │
├─────────────────────────────────────────────┤
│  server/actions/ (entry points)             │
│  Importa de: server/domain/, shared/        │
│  NUNCA importa de: server/infrastructure/   │
├─────────────────────────────────────────────┤
│  server/domain/ (regras de negócio)         │
│  Importa de: shared/, interfaces próprias   │
│  NUNCA importa de: server/infrastructure/,  │
│  client/, app/                              │
├─────────────────────────────────────────────┤
│  server/infrastructure/ (implementações)    │
│  Importa de: server/domain/ (interfaces),   │
│  shared/                                    │
│  Implementa: repository interfaces          │
├─────────────────────────────────────────────┤
│  shared/ (tipos e schemas)                  │
│  Importa de: nada (zero dependências)       │
│  Importado por: todos                       │
└─────────────────────────────────────────────┘
```

**Direção da dependência (SOLID D):**

```
app/ → server/actions/ → server/domain/ ← server/infrastructure/
  ↓                          ↑
client/                    shared/
```

#### Comunicação entre Domínios

| Cenário | Abordagem |
|---|---|
| Use case precisa de dado de outro domínio | Recebe via parâmetro (injetado pelo Server Action) |
| Use case precisa chamar outro use case | Server Action orquestra a chamada dos dois |
| Domínios compartilham tipo/schema | Vai no `shared/schemas/` |
| Domínios **nunca** importam diretamente entre si | Server Actions são os orquestradores |

```typescript
// ✅ CORRETO — Server Action orquestra
// server/actions/transaction.actions.ts
export async function createTransactionAction(data: FormData) {
  const account = await getAccountById(accountId);
  if (!account.success) return account;

  const result = await createTransaction({
    ...parsed.data,
    accountBalance: account.data.balanceCents,
  });
  return result;
}

// ❌ ERRADO — domínio importando outro domínio
// server/domain/transactions/use-cases/create-transaction.ts
import { getAccountById } from '../../accounts/use-cases/get-account-by-id'; // PROIBIDO
```

### Painel Administrativo

#### Impersonation (FR51-FR53)

- Acessível via `/admin/impersonation` — lista usuários com botão "Impersonar"
- Disponível **apenas** em development e staging (`ENABLE_IMPERSONATION=true`)
- Ao impersonar, sessão muda para o contexto do usuário selecionado
- Banner `ImpersonationBanner.tsx` visível no topo enquanto impersonando
- Toda impersonation registrada na trilha de auditoria
- Botão "Sair da impersonação" no banner para voltar ao admin

#### Cópia de Base de Produção (FR54)

- Acessível via `/admin/database` — botão "Copiar base de produção → este ambiente"
- Cópia direta (sem anonimização) — dados vêm como estão
- Disparado via GitHub Actions API (`workflow_dispatch`) pelo painel admin
- Painel mostra status do workflow em tempo real (rodando/concluído/erro)
- Direção única: produção → outros ambientes (nunca o inverso)
- Requer confirmação explícita (sobrescreve dados do destino)

#### Proteções de Segurança do Admin

- Variável `ENABLE_ADMIN_PANEL=true` apenas em dev/staging
- Rota `/admin` acessível apenas para papel Admin
- Middleware verifica: env var ativa + papel Admin + sessão válida
- Impersonation e cópia de base bloqueados em produção mesmo se a rota for acessada

### Data Flow Completo

```
[1]  Browser envia formulário
      ↓
[2]  page.tsx (app/) chama Server Action
      ↓
[3]  Server Action (server/actions/) valida com Zod (shared/schemas/)
      ↓
[4]  Server Action chama Use Case (server/domain/)
      ↓
[5]  Use Case aplica regra de negócio
      ↓
[6]  Use Case chama Repository Interface (server/domain/repositories/)
      ↓
[7]  Repository Impl (server/infrastructure/) executa query via Drizzle
      ↓
[8]  PostgreSQL retorna dados (filtrados por RLS)
      ↓
[9]  Use Case retorna Result<T>
      ↓
[10] Server Action retorna para o browser
      ↓
[11] Supabase Realtime detecta mudança (WAL) e notifica outros clientes conectados
```

### Cross-Cutting Concerns — Localização no Projeto

| Concern | Localização Principal | Afeta |
|---|---|---|
| Precisão financeira (integer cents) | `shared/schemas/` (validação) + `server/infrastructure/database/schema/` (tipos de coluna) | Todos os domínios com valores monetários ou percentuais |
| Sincronização real-time | `server/infrastructure/realtime/` + `client/hooks/useRealtimeUpdates.ts` | Dashboard, transações, checklist, reconciliação |
| Trilha de auditoria | `server/infrastructure/database/schema/audit-logs.ts` + middleware nos use cases | Todos os use cases de mutação |
| Autorização granular | `server/infrastructure/auth/permissions.ts` + RLS policies no banco | Todos os Server Actions e queries |
| Responsividade contextual | `client/components/` (design responsivo via Tailwind) | Todos os componentes de UI |
| Isolamento multi-tenant | RLS policies no PostgreSQL + Better Auth Organizations | Todas as operações de dados |

## Architecture Validation Results

### Coherence Validation

**Compatibilidade de Decisões:**

Todas as tecnologias escolhidas são compatíveis entre si:

| Decisão A | Decisão B | Status |
|---|---|---|
| Next.js 16 (App Router) | Server Actions | Nativo |
| Drizzle ORM | PostgreSQL (Supabase) | Suporte oficial |
| Better Auth | Drizzle | Adapter oficial |
| Better Auth Organizations | Multi-tenant (RLS) | Complementares |
| Supabase Realtime | Vercel (serverless) | WebSocket direto browser↔Supabase |
| shadcn/ui | Tailwind + Next.js | Feito para esse stack |
| Vitest | Next.js + TypeScript | Suporte oficial |
| Zod | Drizzle + React Hook Form | Integrações oficiais (`drizzle-zod`, `@hookform/resolvers/zod`) |
| Integer cents | Drizzle `integer` + PostgreSQL | Alinhado |

Nenhum conflito identificado.

**Consistência de Padrões:**

- Naming: snake_case no banco ↔ camelCase no TS (Drizzle converte automaticamente) — consistente
- Result Pattern: padronizado em Server Actions e Use Cases — consistente
- Separação server/client: alinhada com App Router (Server/Client Components) — consistente
- TDD: testes co-localizados + Vitest + extensão VS Code — consistente
- DDD: domínios isolados, boundaries definidos, Server Actions como orquestradores — consistente

**Alinhamento Estrutural:**

- Estrutura de pastas suporta todas as decisões arquiteturais
- Boundaries respeitam SOLID D (Dependency Inversion)
- 11 domínios mapeados para os 12 subsistemas do PRD
- Painel Admin com impersonation e cópia de base devidamente isolados

### Requirements Coverage Validation

**Functional Requirements: 70/70 cobertos**

| Subsistema | FRs | Domínio | Status |
|---|---|---|---|
| Gestão de Contas e Estrutura Financeira | FR1-FR8 | `accounts` | Coberto |
| Registro de Transações | FR9-FR17, FR58 | `transactions` | Coberto |
| Gastos Recorrentes | FR18-FR22 | `recurring` | Coberto |
| Checklist Mensal | FR23-FR27 | `checklist` | Coberto |
| Notificações | FR28-FR29 | `notifications` | Coberto |
| Dashboard e Controle | FR30-FR34, FR59-FR62 | `budgets` | Coberto |
| Projeção Futura | FR35-FR37, FR62 | `budgets` | Coberto |
| Categorização | FR38-FR44 | `categories` | Coberto |
| Gestão de Usuários | FR45-FR50 | `users` | Coberto |
| Admin | FR51-FR54 | `admin` | Coberto |
| Modelo de Cartão | FR64-FR70 | `credit-cards` | Coberto |
| Reconciliação e Backup | FR55-FR57, FR63 | `reconciliation` | Coberto |

**Non-Functional Requirements: 24/24 cobertos**

| Categoria | NFRs | Solução Arquitetural | Status |
|---|---|---|---|
| Performance (7) | Dashboard < 2s, feedback < 100ms, recálculo < 500ms, real-time < 2s, navegação < 300ms | Server Components + cache nativo, Optimistic Updates, Drizzle queries, Supabase Realtime, Code Splitting | Coberto |
| Segurança (4) | Sessões 7d, HTTPS, AES-256, OWASP Top 10 | Better Auth (banco), Vercel/Supabase TLS, Supabase at rest, mapeamento completo | Coberto |
| Confiabilidade (5) | 99.5% uptime, backup diário, RTO < 4h, RPO < 24h, zero perda | Vercel + UptimeRobot, Supabase free, restore Supabase, backup diário, PostgreSQL ACID | Coberto |
| Manutenibilidade (4) | Separação camadas, 3 ambientes, restore < 30min, sem deps circulares | Clean Architecture, Dev/Staging/Prod, Supabase restore + painel admin, boundaries DDD | Coberto |
| Usabilidade (4) | Registro < 10s, design system, Acompanhante < 30s, feedback < 1s | Server Actions + Optimistic, shadcn/ui, dashboard drill-down, loading states | Coberto |

**Cross-Cutting Concerns: 6/6 cobertos**

| Concern | Solução | Status |
|---|---|---|
| Precisão financeira | Integer cents (valores e percentuais) | Coberto |
| Sincronização real-time | Supabase Realtime (WAL → WebSocket) | Coberto |
| Trilha de auditoria | Tabela `audit_logs` (INSERT only) | Coberto |
| Autorização granular | RLS + middleware (defesa em profundidade) | Coberto |
| Responsividade contextual | Tailwind responsive + 3 contextos de uso | Coberto |
| Isolamento multi-tenant | Better Auth Organizations + RLS | Coberto |

### Gap Analysis Results

**Gaps Críticos:** 0
**Gaps Importantes:** 0
**Gaps Menores Resolvidos:** 1

- **PWA Strategy (resolvido):** Service Worker básico com cache de assets estáticos para o MVP. `manifest.json` para "Add to Home Screen". Sem funcionalidade offline — app requer conexão para operar com dados financeiros em tempo real. Evolução futura: cache de leitura offline se necessário.

### Architecture Completeness Checklist

**Requirements Analysis:**

- [x] Contexto do projeto analisado (70 FRs, 24 NFRs)
- [x] Escala e complexidade avaliadas (Full-stack Web, complexidade alta)
- [x] Restrições técnicas identificadas (1 dev, Vercel, shadcn/ui)
- [x] Cross-cutting concerns mapeados (6 concerns)

**Architectural Decisions:**

- [x] Decisões críticas documentadas com versões verificadas
- [x] Stack tecnológico completamente especificado
- [x] Padrões de integração definidos (Server Actions, Supabase Realtime)
- [x] Considerações de performance endereçadas (Optimistic Updates, cache, code splitting)
- [x] Segurança em profundidade (RLS + middleware + OWASP)
- [x] Princípios fundacionais definidos (SOLID, DDD, Clean Code, TDD)

**Implementation Patterns:**

- [x] Convenções de naming estabelecidas (banco, código, rotas)
- [x] Padrões de estrutura definidos (Clean Architecture + DDD, server/client separados)
- [x] Padrões de comunicação especificados (Result Pattern, Server Actions)
- [x] Padrões de processo documentados (loading, logging, imports, error handling)
- [x] Anti-patterns documentados com exemplos
- [x] Enforcement guidelines definidos

**Project Structure:**

- [x] Estrutura de diretórios completa com todos os arquivos
- [x] Boundaries de componentes estabelecidos (regras de dependência)
- [x] Pontos de integração mapeados (data flow completo)
- [x] Mapeamento de requisitos para estrutura completo (11 domínios → 12 subsistemas)
- [x] Painel Admin detalhado (impersonation + cópia de base)

### Architecture Readiness Assessment

**Status Geral:** PRONTO PARA IMPLEMENTAÇÃO

**Nível de Confiança:** Alto — todas as validações passaram sem gaps críticos

**Pontos Fortes:**

1. Stack coerente e sem conflitos entre tecnologias
2. 100% dos requisitos funcionais e não-funcionais cobertos
3. Separação clara frontend/backend com boundaries bem definidos
4. Princípios de engenharia (SOLID, DDD, TDD) integrados em toda a arquitetura
5. Segurança em profundidade (RLS + middleware) para dados financeiros
6. Padrões detalhados com exemplos concretos e anti-patterns documentados
7. Painel admin com impersonation e cópia de base para operação
8. README como single source of truth operacional

**Áreas para Evolução Futura (pós-MVP):**

1. Cache externo (Redis) se performance exigir
2. Zustand para estado global se complexidade aumentar
3. Sentry para error tracking se volume de erros justificar
4. PWA offline (cache de leitura) se necessário
5. Testes E2E detalhados (Playwright) — estratégia expandida na implementação

### Implementation Handoff

**Diretrizes para Implementação:**

- Seguir todas as decisões arquiteturais exatamente como documentado
- Usar padrões de implementação consistentemente em todos os componentes
- Respeitar estrutura do projeto e boundaries entre camadas
- Consultar este documento para todas as questões arquiteturais
- TDD obrigatório: teste primeiro, implementa depois, refatora

**Primeira Prioridade de Implementação:**

```bash
npx create-next-app@latest caderninho --typescript --tailwind --eslint --app --src-dir --turbopack
```

**Sequência de Implementação Recomendada:**

1. Inicialização do projeto (create-next-app + configuração base)
2. Setup do banco (Supabase + Drizzle schemas + migrations + RLS policies)
3. Autenticação (Better Auth + Organizations)
4. Infraestrutura transversal (Result Pattern, auditoria, rate limiting, middleware)
5. Domínios de negócio (contas, transações, categorias, orçamentos...)
6. Real-time (Supabase Realtime)
7. CI/CD pipeline (GitHub Actions)
8. README operacional
