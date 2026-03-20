# Story 2.3: Cadastro de Investimentos e Fontes de Receita

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a authenticated user,
I want to register my investments and income sources,
So that I have a complete picture of my financial structure.

## Acceptance Criteria

### Investimentos (FR3)

1. Pode cadastrar investimento com nome, instituição, tipo (renda fixa / renda variável / reserva), saldo atual, data de atualização e data de vencimento opcional (FR3)
2. Tracking diferenciado por tipo: reserva e renda fixa rastreiam rendimento previsível (ex: % CDI), renda variável rastreia apenas saldo (FR3)
3. Pode editar qualquer campo do investimento (FR6)
4. Pode arquivar um investimento (FR6)
5. Pode reativar um investimento arquivado
6. Lista de investimentos mostra nome, instituição, tipo, saldo formatado e status
7. Investimentos arquivados não aparecem na lista principal (toggle para exibir)

### Fontes de Receita (FR4)

8. Pode cadastrar fonte de receita com nome, tipo de vínculo (PJ própria / CLT / freelance / outro), recorrência (sim/não), valor base mensal (opcional) e dia habitual de pagamento (opcional) (FR4)
9. Fonte de receita funciona como etiqueta de origem — sem saldo próprio (FR4)
10. Pode editar e arquivar fontes de receita (FR6)
11. Pode reativar uma fonte de receita arquivada
12. Lista de fontes de receita mostra nome, tipo de vínculo, recorrência e valor base (se houver)

### Infraestrutura Comum

13. Schemas Drizzle para `investments` e `income_sources` com RLS, FK para organizations
14. Schemas Zod correspondentes em `src/shared/schemas/`
15. Server Action + Use Case + Repository implementados seguindo Clean Architecture (mesmo padrão Story 2.1/2.2)
16. Testes unitários escritos antes da implementação (TDD)
17. Valores monetários armazenados em centavos (inteiros, nunca floating-point)
18. Trilha de auditoria registrada para toda mutação (CREATE, UPDATE, ARCHIVE, REACTIVATE)

## Tasks / Subtasks

### Módulo: Investimentos

- [x] Task 1: Criar schema Drizzle para `investments` + migration (AC: #13, #17)
  - [x] 1.1 Criar `src/server/infrastructure/database/schema/investments.ts`
  - [x] 1.2 Atualizar `src/server/infrastructure/database/schema/index.ts` — adicionar export de `investments`
  - [x] 1.3 Executar `npm run db:generate` para gerar migration SQL
  - [x] 1.4 Aplicar migration no banco local (via psql direto — drizzle-kit migrate pendurou)
  - [x] 1.5 Escrever testes em `src/server/infrastructure/database/schema/investments.test.ts` — 6 testes passando

- [x] Task 2: Criar schema Zod para investimentos (AC: #13)
  - [x] 2.1 Criar `src/shared/schemas/investment.schema.ts` com cross-field `.refine()` para yieldRateBasisPoints
  - [x] 2.2 Escrever testes TDD — 17 testes passando

- [x] Task 3: Criar repository interface e implementação para investimentos (AC: #15)
  - [x] 3.1 Criar interface em `src/server/domain/investments/repositories/investment.repository.ts`
  - [x] 3.2 Criar implementação com `.returning()` em todos os updates
  - [x] 3.3 Escrever testes TDD — 8 testes passando

- [x] Task 4: Criar use cases para investimentos (AC: #15, #18)
  - [x] 4.1 `create-investment.ts` + `.test.ts`
  - [x] 4.2 `update-investment.ts` + `.test.ts` — inclui edge case: troca de tipo para renda_variavel limpa yieldRateBasisPoints
  - [x] 4.3 `archive-investment.ts` + `.test.ts`
  - [x] 4.4 `reactivate-investment.ts` + `.test.ts`
  - [x] 4.5 `list-investments.ts` + `.test.ts`
  - [x] 4.6 `get-investment.ts` + `.test.ts`
  - 21 testes passando no total

- [x] Task 5: Criar factory e Server Actions para investimentos (AC: #15, #16)
  - [x] 5.1 Criar `src/server/factories/investment.ts`
  - [x] 5.2 Criar `src/server/actions/investment.actions.ts` — `listInvestmentsAction` passa `includeArchived: true`
  - [x] 5.3 Escrever testes TDD — 11 testes passando

### Módulo: Fontes de Receita

- [x] Task 6: Criar schema Drizzle para `income_sources` + migration (AC: #13)
  - [x] 6.1 Criar `src/server/infrastructure/database/schema/income-sources.ts`
  - [x] 6.2 Atualizar `src/server/infrastructure/database/schema/index.ts` — adicionar export de `incomeSources`
  - [x] 6.3 Executar `npm run db:generate` + aplicar migration via psql
  - [x] 6.4 Escrever testes do schema

- [x] Task 7: Criar schema Zod para fontes de receita (AC: #13)
  - [x] 7.1 Criar `src/shared/schemas/income-source.schema.ts`
  - [x] 7.2 Escrever testes TDD

- [x] Task 8: Criar repository interface e implementação para fontes de receita (AC: #15)
  - [x] 8.1 Interface em `src/server/domain/income-sources/repositories/income-source.repository.ts`
  - [x] 8.2 Implementação com `.returning()` em todos os updates
  - [x] 8.3 Escrever testes TDD

- [x] Task 9: Criar use cases para fontes de receita (AC: #15, #18)
  - [x] 9.1 `create-income-source.ts` + `.test.ts`
  - [x] 9.2 `update-income-source.ts` + `.test.ts`
  - [x] 9.3 `archive-income-source.ts` + `.test.ts`
  - [x] 9.4 `reactivate-income-source.ts` + `.test.ts`
  - [x] 9.5 `list-income-sources.ts` + `.test.ts`
  - [x] 9.6 `get-income-source.ts` + `.test.ts`

- [x] Task 10: Criar factory e Server Actions para fontes de receita (AC: #15, #16)
  - [x] 10.1 Criar `src/server/factories/income-source.ts`
  - [x] 10.2 Criar `src/server/actions/income-source.actions.ts` — `listIncomeSourcesAction` passa `includeArchived: true`
  - [x] 10.3 Escrever testes TDD

### UI

- [x] Task 11: Criar componentes de UI para investimentos (AC: #1-#7)
  - [x] 11.1 Criar página `src/app/(app)/investments/page.tsx` (Server Component)
  - [x] 11.2 Criar `src/app/(app)/investments/loading.tsx` (Skeleton)
  - [x] 11.3 Criar `src/client/components/investments/InvestmentForm.tsx` — campos condicionais (rendimento/vencimento) para renda_fixa/reserva
  - [x] 11.4 Criar `src/client/components/investments/InvestmentCard.tsx`
  - [x] 11.5 Criar `src/client/components/investments/InvestmentList.tsx`

- [x] Task 12: Criar componentes de UI para fontes de receita (AC: #8-#12)
  - [x] 12.1 Criar página `src/app/(app)/income-sources/page.tsx` (Server Component)
  - [x] 12.2 Criar `src/app/(app)/income-sources/loading.tsx` (Skeleton)
  - [x] 12.3 Criar `src/client/components/income-sources/IncomeSourceForm.tsx` — checkbox para recorrência, input monetário opcional
  - [x] 12.4 Criar `src/client/components/income-sources/IncomeSourceCard.tsx`
  - [x] 12.5 Criar `src/client/components/income-sources/IncomeSourceList.tsx`

- [x] Task 13: Adicionar links na Sidebar (AC: #6, #12)
  - [x] 13.1 Adicionar link "Investimentos" na Sidebar (ícone Landmark)
  - [x] 13.2 Adicionar link "Receitas" na Sidebar (ícone Wallet)
  - NÃO adicionado na BottomNavigation (conforme Dev Notes)

- [x] Task 14: Validação final (AC: #1-#18)
  - [x] 14.1 `npm run build` — compilou sem erros, todas as rotas presentes
  - [x] 14.2 `npm test` — 66 arquivos, 451 testes, TODOS passando, zero regressões
  - [x] 14.3 `npm run lint` — 0 erros, 1 warning pré-existente (RegisterForm.tsx)
  - [x] 14.4 CRUD completo funcional para ambos os módulos
  - [x] 14.5 Auditoria registrada para todas as mutações
  - [x] 14.6 Valores monetários em centavos em todo o fluxo

### Review Follow-ups (AI)

- [x] [AI-Review] H1: Auto-atualizar `lastBalanceUpdate` quando `balanceCents` muda no repository `update()` — 2 testes adicionados
- [x] [AI-Review] M1: Guard reverso no update use case — troca de `renda_variavel` → `renda_fixa`/`reserva` sem `yieldRateBasisPoints` retorna VALIDATION_ERROR — 3 testes adicionados

## Dev Notes

### ALERTA CRITICO: Seguir Blueprint das Stories 2.1 e 2.2

As Stories 2.1 (bank accounts) e 2.2 (credit cards) são o **blueprint completo** para esta story. O padrão de Clean Architecture foi estabelecido e validado em 2 code reviews com R2 approval. Seguir EXATAMENTE o mesmo padrão para ambos os módulos.

### Versões Exatas do Stack

| Tecnologia | Versão | Notas |
|---|---|---|
| Next.js | 16.1.6 | App Router, Server Actions, Server Components |
| Drizzle ORM | 0.45.1 | Schema, queries, migrations |
| Drizzle Kit | 0.31.10 | Generate + migrate |
| Better Auth | 1.5.5 | Session, organizations |
| Zod | 4.3.6 | Validação client + server |
| Vitest | 4.1.0 | Testes TDD |
| shadcn/ui | v4 | Componentes UI — estilo base-nova com @base-ui/react |

### CRITICO: Nenhum Pacote Novo Necessário

Todas as funcionalidades usam dependências já instaladas. NÃO instalar nenhum pacote adicional.

### ALERTA: Duas Entidades, Dois Domínios Separados

Esta story cria DOIS domínios independentes:
1. `investments` — entidade com saldo próprio, tracking diferenciado por tipo
2. `income-sources` — etiqueta/label sem saldo, usado como origem de receitas

Cada domínio segue a mesma estrutura de pastas:
```
src/server/domain/{domain-name}/
  repositories/{entity}.repository.ts       → Interface
  use-cases/
    create-{entity}.ts + .test.ts
    update-{entity}.ts + .test.ts
    archive-{entity}.ts + .test.ts
    reactivate-{entity}.ts + .test.ts
    list-{entity}s.ts + .test.ts
    get-{entity}.ts + .test.ts
```

### ALERTA: Schema de Investimentos — Campos Específicos

| Campo | Tipo DB | Tipo TS | Validação | Notas |
|---|---|---|---|---|
| `name` | text notNull | string | min(1), max(100) | Nome do investimento |
| `institution` | text notNull | string | min(1), max(100) | Instituição financeira |
| `type` | text notNull | 'renda_fixa' \| 'renda_variavel' \| 'reserva' | enum | Tipo de investimento |
| `balance_cents` | integer notNull | number | int(), min(0) | Saldo atual em centavos (pode ser 0 para novo) |
| `yield_rate_basis_points` | integer | number \| null | int(), min(0), optional | Rendimento em basis points (110% CDI → 11000). Null para renda_variavel |
| `last_balance_update` | timestamp tz notNull | Date | defaultNow | Data da última atualização do saldo |
| `maturity_date` | date | string \| null | ISO date string, optional | Vencimento (Tesouro Direto, CDBs) |
| `status` | text notNull default 'active' | 'active' \| 'archived' | — | Soft delete |

**Rendimento previsível (`yield_rate_basis_points`):**
- Renda fixa e reserva: campo obrigatório na UI (ex: "110% CDI" → armazena 11000)
- Renda variável: campo oculto na UI (null no banco) — apenas saldo é rastreado
- Armazenado como inteiro em basis points (mesma lógica de centavos para moeda)
- Conversão: 110,50% → 11050 basis points
- Apresentação: `value / 100` com 2 casas decimais + "% CDI" (ou similar)

**Data de vencimento (`maturity_date`):**
- Campo OPCIONAL — aplicável a Tesouro Direto e CDBs com vencimento
- Usar tipo `date` no Drizzle (sem timezone — é apenas uma data)
- Na UI: input tipo date, visível para renda_fixa e reserva

### ALERTA: Schema de Fontes de Receita — Campos Específicos

| Campo | Tipo DB | Tipo TS | Validação | Notas |
|---|---|---|---|---|
| `name` | text notNull | string | min(1), max(100) | Nome da fonte (ex: "Salário", "PJ Consultoria") |
| `employment_type` | text notNull | 'pj_propria' \| 'clt' \| 'freelance' \| 'outro' | enum | Tipo de vínculo |
| `is_recurring` | boolean notNull | boolean | default true | Se é receita recorrente |
| `base_amount_cents` | integer | number \| null | int(), positive(), optional | Valor base mensal para projeção (centavos) |
| `usual_payment_day` | integer | number \| null | int(), min(1), max(31), optional | Dia habitual de pagamento |
| `status` | text notNull default 'active' | 'active' \| 'archived' | — | Soft delete |

**CRITICO — Fonte de receita NÃO tem saldo:**
- Funciona como etiqueta/tag de origem — usada no Epic 3 para associar receitas à sua fonte
- `base_amount_cents` é para PROJEÇÃO futura, não saldo real
- Não exibir "saldo" na UI — mostrar "valor base mensal" como info secundária

### ALERTA: Enum Labels para UI — Mapeamento Obrigatório

Criar constantes de mapeamento enum → label pt-BR para uso nos Selects e Cards:

```typescript
// src/shared/constants/investment.constants.ts
export const INVESTMENT_TYPE_LABELS: Record<string, string> = {
  renda_fixa: 'Renda Fixa',
  renda_variavel: 'Renda Variável',
  reserva: 'Reserva',
} as const;

// src/shared/constants/income-source.constants.ts
export const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  pj_propria: 'PJ Própria',
  clt: 'CLT',
  freelance: 'Freelance',
  outro: 'Outro',
} as const;
```

Usar nos componentes Select (options), Card (badge/label), e List (display). **Nunca exibir o valor do enum raw** (ex: "renda_fixa") na UI.

### ALERTA: Monetary Precision — Centavos como Integer

**Investimentos:**
- `balance_cents` como INTEGER — R$10.000,00 → 1000000
- `yield_rate_basis_points` como INTEGER — 110,50% → 11050

**Fontes de receita:**
- `base_amount_cents` como INTEGER nullable — R$15.000,00 → 1500000

**NUNCA usar floating-point.** Validação Zod: `z.number().int()` em todos os campos monetários.

### ALERTA: Input de Valor Monetário — Padrão Estabelecido

Reutilizar `centsToDisplayValue` e `displayValueToCents` de `src/client/utils/currency-input.ts` (extraído na Story 2.2 R1):
- Investimento saldo: input com `inputMode="numeric"`, prefixo "R$"
- Receita valor base: mesmo padrão, prefixo "R$"
- Rendimento: input com `inputMode="numeric"`, sufixo "%" — usar mesmo padrão de auto-vírgula mas com divisor 100 para exibir 2 casas decimais

### ALERTA: Input de Rendimento (Basis Points) — Novo Padrão

O input de rendimento segue a mesma lógica do input monetário:
- Usuário digita só números, vírgula posiciona automaticamente
- Ex: digitar "11050" mostra "110,50%"
- Armazenar como integer (basis points): 11050
- Usar `inputMode="numeric"`, sufixo "%"

**Implementação de `src/client/utils/percentage-input.ts`:**

```typescript
/**
 * Converte basis points (integer) para string de exibição.
 * Ex: 11050 → "110,50"  |  2503 → "25,03"  |  0 → "0,00"
 */
export function basisPointsToDisplayValue(basisPoints: number): string {
  const intPart = Math.floor(basisPoints / 100);
  const decPart = basisPoints % 100;
  return `${intPart},${String(decPart).padStart(2, '0')}`;
}

/**
 * Converte string de input numérico para basis points (integer).
 * Ex: "11050" → 11050  |  "2503" → 2503  |  "" → 0
 * Usuário digita apenas dígitos — a vírgula é posicionada automaticamente.
 */
export function displayValueToBasisPoints(displayValue: string): number {
  const digits = displayValue.replace(/\D/g, '');
  return digits === '' ? 0 : parseInt(digits, 10);
}
```

**Testes obrigatórios em `percentage-input.test.ts`:**
- `basisPointsToDisplayValue(11050)` → `"110,50"`
- `basisPointsToDisplayValue(2503)` → `"25,03"`
- `basisPointsToDisplayValue(100)` → `"1,00"`
- `basisPointsToDisplayValue(0)` → `"0,00"`
- `displayValueToBasisPoints("11050")` → `11050`
- `displayValueToBasisPoints("")` → `0`
- `displayValueToBasisPoints("abc")` → `0`

### ALERTA: Drizzle Schema — Padrão de Investimentos

```typescript
import { sql } from 'drizzle-orm';
import { pgTable, pgPolicy, text, integer, timestamp, date } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';

export const investments = pgTable('investments', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  institution: text('institution').notNull(),
  type: text('type').notNull(), // 'renda_fixa' | 'renda_variavel' | 'reserva'
  balanceCents: integer('balance_cents').notNull(),
  yieldRateBasisPoints: integer('yield_rate_basis_points'), // nullable
  lastBalanceUpdate: timestamp('last_balance_update', { withTimezone: true }).notNull().defaultNow(),
  maturityDate: date('maturity_date'), // nullable
  status: text('status').notNull().default('active'),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, () => [
  pgPolicy('investments_org_isolation', {
    for: 'all',
    using: sql`organization_id = current_setting('app.organization_id', true)`,
  }),
]);
```

### ALERTA: Drizzle Schema — Padrão de Fontes de Receita

```typescript
import { sql } from 'drizzle-orm';
import { pgTable, pgPolicy, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';

export const incomeSources = pgTable('income_sources', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  employmentType: text('employment_type').notNull(), // 'pj_propria' | 'clt' | 'freelance' | 'outro'
  isRecurring: boolean('is_recurring').notNull().default(true),
  baseAmountCents: integer('base_amount_cents'), // nullable
  usualPaymentDay: integer('usual_payment_day'), // nullable, 1-31
  status: text('status').notNull().default('active'),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, () => [
  pgPolicy('income_sources_org_isolation', {
    for: 'all',
    using: sql`organization_id = current_setting('app.organization_id', true)`,
  }),
]);
```

### ALERTA: Use Cases — Dependency Injection

Seguir EXATAMENTE o padrão das Stories 2.1/2.2:

```typescript
// ✅ CORRETO
export async function createInvestment(
  deps: { repository: InvestmentRepository; auditLogger: AuditLogger },
  params: CreateInvestmentParams,
): Promise<Result<Investment>> { ... }

// ❌ ERRADO — importar de infrastructure
import { logAudit } from '@/server/infrastructure/audit/audit.service';
```

### ALERTA: Server Actions — Padrão com withAuth

```typescript
'use server';

import { withAuth } from '@/server/infrastructure/auth/with-auth';
import { validateInput } from '@/server/infrastructure/validation/validate';
import { err } from '@/shared/types/result';
import { investmentDeps } from '@/server/factories/investment';

function getOrganizationId(session: { session: { activeOrganizationId?: string | null } }) {
  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) return null;
  return organizationId;
}

export const createInvestmentAction = withAuth(async (session, input: unknown) => {
  const validation = validateInput(createInvestmentSchema, input);
  if (!validation.success) return validation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return createInvestment(investmentDeps, {
    ...validation.data,
    organizationId,
    userId: session.user.id,
  });
});
```

**CRITICO**: `listInvestmentsAction` e `listIncomeSourcesAction` DEVEM passar `includeArchived: true`.

### Error Codes

**Investimentos:**

| Código | Mensagem | Quando |
|---|---|---|
| `VALIDATION_ERROR` | Mensagem do Zod em pt-BR | Dados inválidos |
| `UNAUTHORIZED` | Sessão inválida. Faça login novamente. | Sem sessão |
| `NO_ACTIVE_ORGANIZATION` | Nenhuma organização ativa. | Sem activeOrganizationId |
| `INVESTMENT_NOT_FOUND` | Investimento não encontrado. | findById retorna null |
| `INVESTMENT_ALREADY_ARCHIVED` | Este investimento já está arquivado. | Tentar arquivar archived |
| `INVESTMENT_ALREADY_ACTIVE` | Este investimento já está ativo. | Tentar reativar active |

**Fontes de Receita:**

| Código | Mensagem | Quando |
|---|---|---|
| `INCOME_SOURCE_NOT_FOUND` | Fonte de receita não encontrada. | findById retorna null |
| `INCOME_SOURCE_ALREADY_ARCHIVED` | Esta fonte de receita já está arquivada. | Tentar arquivar archived |
| `INCOME_SOURCE_ALREADY_ACTIVE` | Esta fonte de receita já está ativa. | Tentar reativar active |

### Dependências desta Story

**Depende de (já implementado):**
- Story 1.1: Projeto inicializado com estrutura base
- Story 1.3: Supabase + Drizzle configurado + migrations rodando
- Story 1.4: Better Auth com Organizations (session, activeOrganizationId)
- Story 1.6: logAudit, withAuth, RLS base
- Story 1.7: logger, validateInput, ok/err helpers, common schemas
- Story 2.1: Blueprint de Clean Architecture, factory pattern, AuditLogger interface, formatCurrency, centsToDisplayValue/displayValueToCents
- Story 2.2: Padrão confirmado em code review R2, currency-input.ts extraído

**É dependência de (stories futuras):**
- Story 2.5: Configuração de método de pagamento padrão — investimentos como destino de sobra no fechamento
- Story 2.6: Onboarding — setup inicial pode incluir investimentos e receitas
- Story 3.2: Registro de receitas usa fontes de receita como origem
- Story 5.6: Fechamento de mês — sobra pode ir para investimento
- Story 7.1-7.3: Timeline/projeção futura — investimentos com vencimento, receitas para projeção de margem

### Inteligência da Story 2.2 (Previous Story)

**Infraestrutura já pronta (NÃO reimplementar):**
- `src/server/infrastructure/audit/audit.service.ts` → `logAudit()` — fail-safe
- `src/server/infrastructure/auth/with-auth.ts` → `withAuth()` — Result Pattern
- `src/server/infrastructure/validation/validate.ts` → `validateInput()` — Zod + Result
- `src/shared/types/result.ts` → `ok()`, `err()` — helpers
- `src/server/infrastructure/logging/logger.ts` → `logger.info()`, `.warn()`, `.error()`
- `src/shared/schemas/common.schema.ts` → `idSchema`, `amountCentsSchema`
- `src/server/domain/shared/types/audit-logger.ts` → `AuditLogger` type
- `src/client/utils/format-currency.ts` → `formatCurrency()` — centavos para "R$ X,XX"
- `src/client/utils/currency-input.ts` → `centsToDisplayValue()`, `displayValueToCents()` — input monetário

**Lições aprendidas (Stories 2.1 e 2.2):**
1. **[CRITICAL] `.returning()` obrigatório** em Drizzle UPDATE
2. **[HIGH] Use cases NÃO importam de infrastructure** — DI via `deps`
3. **[HIGH] Server Actions usam factory** — composition root
4. **[HIGH] `listAction` includeArchived: true** — UI mostra toggle
5. **[MEDIUM] `loading.tsx` obrigatório** em cada rota
6. **[LOW] Import ordering** — External → Shared → Server → Client

### shadcn/ui — Componentes Já Disponíveis

Já instalados: button, input, label, card, dialog, skeleton, sonner (toast), select, badge, tabs

Para o Select de tipo de investimento e tipo de vínculo: usar o componente `select` já instalado.

Para o toggle de recorrência: o componente `switch` do shadcn **NÃO está instalado** atualmente. Duas opções:
1. **(Recomendado)** Instalar: `npx shadcn@latest add switch` — única exceção de install nesta story
2. **(Fallback)** Usar `checkbox` estilizado como toggle — funcional mas menos polido

Se a opção 1 falhar (shadcn v4 com @base-ui/react pode ter incompatibilidade), usar fallback imediatamente sem perder tempo debugando.

### O Que NÃO Fazer Nesta Story

- **NÃO implementar** projeção de investimentos (rendimento futuro, timeline) — vem no Epic 7
- **NÃO implementar** painel de investimentos (aportes vs. rendimentos) — Fase 3
- **NÃO implementar** registro de transações de receita — vem na Story 3.2
- **NÃO implementar** associação de receita à fonte — vem na Story 3.2
- **NÃO usar** floating-point para saldos ou percentuais — sempre integer
- **NÃO implementar** exclusão permanente — sempre soft delete (archive)
- **NÃO implementar** real-time updates
- **NÃO instalar** pacotes novos (verificar switch do shadcn — é a única exceção possível)
- **NÃO criar** `tailwind.config.ts`
- **NÃO alterar** tabelas existentes (bank_accounts, credit_cards, auth tables)

### NOTA: Migrations — Duas Tabelas em Uma Story

Esta story cria DUAS tabelas novas. Opções:
1. **Uma migration por tabela** (recomendado) — mais granular para rollback
2. **Uma migration com ambas** — mais simples

Recomendação: executar `db:generate` após cada schema criado (Task 1 e Task 6), gerando migrations separadas.

### Project Structure Notes

**Arquivos a criar — Investimentos:**
- `src/server/infrastructure/database/schema/investments.ts`
- `src/server/infrastructure/database/schema/investments.test.ts`
- `src/server/domain/investments/repositories/investment.repository.ts`
- `src/server/infrastructure/database/repositories/investment.repository.impl.ts`
- `src/server/infrastructure/database/repositories/investment.repository.impl.test.ts`
- `src/server/domain/investments/use-cases/create-investment.ts` + `.test.ts`
- `src/server/domain/investments/use-cases/update-investment.ts` + `.test.ts`
- `src/server/domain/investments/use-cases/archive-investment.ts` + `.test.ts`
- `src/server/domain/investments/use-cases/reactivate-investment.ts` + `.test.ts`
- `src/server/domain/investments/use-cases/list-investments.ts` + `.test.ts`
- `src/server/domain/investments/use-cases/get-investment.ts` + `.test.ts`
- `src/server/factories/investment.ts`
- `src/server/actions/investment.actions.ts`
- `src/server/actions/investment.actions.test.ts`
- `src/shared/schemas/investment.schema.ts`
- `src/shared/schemas/investment.schema.test.ts`
- `src/client/components/investments/InvestmentForm.tsx`
- `src/client/components/investments/InvestmentCard.tsx`
- `src/client/components/investments/InvestmentList.tsx`
- `src/app/(app)/investments/page.tsx`
- `src/app/(app)/investments/loading.tsx`

**Arquivos a criar — Fontes de Receita:**
- `src/server/infrastructure/database/schema/income-sources.ts`
- `src/server/infrastructure/database/schema/income-sources.test.ts`
- `src/server/domain/income-sources/repositories/income-source.repository.ts`
- `src/server/infrastructure/database/repositories/income-source.repository.impl.ts`
- `src/server/infrastructure/database/repositories/income-source.repository.impl.test.ts`
- `src/server/domain/income-sources/use-cases/create-income-source.ts` + `.test.ts`
- `src/server/domain/income-sources/use-cases/update-income-source.ts` + `.test.ts`
- `src/server/domain/income-sources/use-cases/archive-income-source.ts` + `.test.ts`
- `src/server/domain/income-sources/use-cases/reactivate-income-source.ts` + `.test.ts`
- `src/server/domain/income-sources/use-cases/list-income-sources.ts` + `.test.ts`
- `src/server/domain/income-sources/use-cases/get-income-source.ts` + `.test.ts`
- `src/server/factories/income-source.ts`
- `src/server/actions/income-source.actions.ts`
- `src/server/actions/income-source.actions.test.ts`
- `src/shared/schemas/income-source.schema.ts`
- `src/shared/schemas/income-source.schema.test.ts`
- `src/client/components/income-sources/IncomeSourceForm.tsx`
- `src/client/components/income-sources/IncomeSourceCard.tsx`
- `src/client/components/income-sources/IncomeSourceList.tsx`
- `src/app/(app)/income-sources/page.tsx`
- `src/app/(app)/income-sources/loading.tsx`

**Arquivos a criar — Compartilhados:**
- `src/shared/constants/investment.constants.ts` (INVESTMENT_TYPE_LABELS)
- `src/shared/constants/income-source.constants.ts` (EMPLOYMENT_TYPE_LABELS)
- `src/client/utils/percentage-input.ts` (conversão basis points ↔ display)
- `src/client/utils/percentage-input.test.ts`

**Arquivos a modificar:**
- `src/server/infrastructure/database/schema/index.ts` (adicionar exports de `investments` e `incomeSources`)
- `src/client/components/layout/Sidebar.tsx` (adicionar links Investimentos e Receitas)
- `src/client/components/layout/BottomNavigation.tsx` — **NÃO adicionar** Investimentos e Receitas na BottomNavigation. Mobile tem no máximo 4-5 itens no bottom nav (Home, Transações, Contas, Perfil já ocupam o espaço). Investimentos e Receitas ficam acessíveis apenas pela Sidebar (menu hambúrguer no mobile). Se no futuro fizer sentido, será via Epic 6 (dashboard com acesso rápido).

**Arquivos que NÃO devem ser modificados:**
- Schemas existentes (bank-accounts, credit-cards, auth)
- `package.json` (nenhum pacote novo)
- `src/app/globals.css`
- `next.config.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.3: Cadastro de Investimentos e Fontes de Receita]
- [Source: _bmad-output/planning-artifacts/prd.md#FR3, FR4, FR6]
- [Source: _bmad-output/planning-artifacts/architecture.md#Clean Architecture + DDD]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture — Precisão Financeira]
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/project-context.md]
- [Source: _bmad-output/implementation-artifacts/2-2-cadastro-e-gestao-de-cartoes-de-credito-estrutura.md]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- drizzle-kit migrate hanging: workaround via psql direto + manual INSERT em drizzle.__drizzle_migrations

### Completion Notes List

- Todos os 14 tasks e subtasks completos
- 451 testes passando (66 arquivos), zero regressões
- Build compila sem erros, lint sem erros novos
- Dois módulos completos: Investments (12 colunas, cross-field validation, campos condicionais na UI) e Income Sources (10 colunas, checkbox recorrência, valor base opcional)
- Padrão Clean Architecture seguido fielmente (blueprint Stories 2.1/2.2)
- `listAction` com `includeArchived: true` em ambos os módulos
- ✅ Resolved review finding [HIGH]: H1 — `lastBalanceUpdate` auto-atualizado quando `balanceCents` muda no repository `update()`
- ✅ Resolved review finding [MEDIUM]: M1 — Guard reverso no update use case: troca de `renda_variavel` → `renda_fixa`/`reserva` sem `yieldRateBasisPoints` retorna VALIDATION_ERROR
- 5 testes adicionados para os fixes (456 total, 66 arquivos)

### Code Review R1 — Action Items

| # | Severidade | Descrição | Arquivo | Status |
|---|-----------|-----------|---------|--------|
| H1 | **HIGH** | `lastBalanceUpdate` não é atualizado automaticamente quando `balanceCents` muda no `update()`. O método só seta `updatedAt: new Date()` mas ignora `lastBalanceUpdate`. Quando o saldo é atualizado via edição, `lastBalanceUpdate` deveria ser setado para `new Date()` também. | `src/server/infrastructure/database/repositories/investment.repository.impl.ts:60-64` | FIXED |
| M1 | **MEDIUM** | Falta guard reverso no update use case: ao trocar tipo de `renda_variavel` → `renda_fixa` ou `reserva`, o use case não valida se `yieldRateBasisPoints` está presente. A troca inversa (para `renda_variavel`) já limpa o campo corretamente, mas a troca DE `renda_variavel` deixa `yieldRateBasisPoints` como `null` no banco sem erro. | `src/server/domain/investments/use-cases/update-investment.ts:34-37` | FIXED |
| L1 | LOW | Pages silenciosamente swallow erros de fetch (consistente com blueprint Stories 2.1/2.2). | `src/app/(app)/investments/page.tsx`, `src/app/(app)/income-sources/page.tsx` | WON'T FIX (blueprint) |
| L2 | LOW | File List da story não lista arquivos `meta/snapshot.json` auto-gerados pelo drizzle-kit. | Story file | WON'T FIX (auto-generated) |

### Change Log

- 2026-03-20: Addressed code review findings — 2 items resolved (H1: lastBalanceUpdate auto-update, M1: yield rate guard on type change). 5 tests added.
- 2026-03-20: Code Review R1 — 1 HIGH, 1 MEDIUM, 2 LOW. H1 e M1 registrados como backlog.
- 2026-03-20: Story implementada — 2 domínios completos (investments + income-sources) com schema Drizzle, Zod, repository, 6 use cases cada, factory, server actions, UI (form/card/list/page/loading), sidebar links

### File List

**Criados — Investimentos (Backend):**
- `src/server/infrastructure/database/schema/investments.ts`
- `src/server/infrastructure/database/schema/investments.test.ts`
- `src/server/infrastructure/database/migrations/0006_calm_firebird.sql`
- `src/shared/schemas/investment.schema.ts`
- `src/shared/schemas/investment.schema.test.ts`
- `src/server/domain/investments/repositories/investment.repository.ts`
- `src/server/infrastructure/database/repositories/investment.repository.impl.ts`
- `src/server/infrastructure/database/repositories/investment.repository.impl.test.ts`
- `src/server/domain/investments/use-cases/create-investment.ts`
- `src/server/domain/investments/use-cases/create-investment.test.ts`
- `src/server/domain/investments/use-cases/update-investment.ts`
- `src/server/domain/investments/use-cases/update-investment.test.ts`
- `src/server/domain/investments/use-cases/archive-investment.ts`
- `src/server/domain/investments/use-cases/archive-investment.test.ts`
- `src/server/domain/investments/use-cases/reactivate-investment.ts`
- `src/server/domain/investments/use-cases/reactivate-investment.test.ts`
- `src/server/domain/investments/use-cases/list-investments.ts`
- `src/server/domain/investments/use-cases/list-investments.test.ts`
- `src/server/domain/investments/use-cases/get-investment.ts`
- `src/server/domain/investments/use-cases/get-investment.test.ts`
- `src/server/factories/investment.ts`
- `src/server/actions/investment.actions.ts`
- `src/server/actions/investment.actions.test.ts`

**Criados — Fontes de Receita (Backend):**
- `src/server/infrastructure/database/schema/income-sources.ts`
- `src/server/infrastructure/database/schema/income-sources.test.ts`
- `src/server/infrastructure/database/migrations/0007_remarkable_ironclad.sql`
- `src/shared/schemas/income-source.schema.ts`
- `src/shared/schemas/income-source.schema.test.ts`
- `src/server/domain/income-sources/repositories/income-source.repository.ts`
- `src/server/infrastructure/database/repositories/income-source.repository.impl.ts`
- `src/server/infrastructure/database/repositories/income-source.repository.impl.test.ts`
- `src/server/domain/income-sources/use-cases/create-income-source.ts`
- `src/server/domain/income-sources/use-cases/create-income-source.test.ts`
- `src/server/domain/income-sources/use-cases/update-income-source.ts`
- `src/server/domain/income-sources/use-cases/update-income-source.test.ts`
- `src/server/domain/income-sources/use-cases/archive-income-source.ts`
- `src/server/domain/income-sources/use-cases/archive-income-source.test.ts`
- `src/server/domain/income-sources/use-cases/reactivate-income-source.ts`
- `src/server/domain/income-sources/use-cases/reactivate-income-source.test.ts`
- `src/server/domain/income-sources/use-cases/list-income-sources.ts`
- `src/server/domain/income-sources/use-cases/list-income-sources.test.ts`
- `src/server/domain/income-sources/use-cases/get-income-source.ts`
- `src/server/domain/income-sources/use-cases/get-income-source.test.ts`
- `src/server/factories/income-source.ts`
- `src/server/actions/income-source.actions.ts`
- `src/server/actions/income-source.actions.test.ts`

**Criados — Compartilhados:**
- `src/shared/constants/investment.constants.ts`
- `src/shared/constants/income-source.constants.ts`
- `src/client/utils/percentage-input.ts`
- `src/client/utils/percentage-input.test.ts`

**Criados — UI Investimentos:**
- `src/client/components/investments/InvestmentForm.tsx`
- `src/client/components/investments/InvestmentCard.tsx`
- `src/client/components/investments/InvestmentList.tsx`
- `src/app/(app)/investments/page.tsx`
- `src/app/(app)/investments/loading.tsx`

**Criados — UI Fontes de Receita:**
- `src/client/components/income-sources/IncomeSourceForm.tsx`
- `src/client/components/income-sources/IncomeSourceCard.tsx`
- `src/client/components/income-sources/IncomeSourceList.tsx`
- `src/app/(app)/income-sources/page.tsx`
- `src/app/(app)/income-sources/loading.tsx`

**Modificados:**
- `src/server/infrastructure/database/schema/index.ts` — exports de investments e incomeSources
- `src/client/components/layout/Sidebar.tsx` — links Investimentos e Receitas
- `src/server/infrastructure/database/migrations/meta/_journal.json` — registros de migration
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — status da story
- `_bmad-output/implementation-artifacts/2-3-cadastro-de-investimentos-e-fontes-de-receita.md` — story file
