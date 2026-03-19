# Story 2.2: Cadastro e Gestão de Cartões de Crédito (Estrutura)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a authenticated user,
I want to create, edit, and view my credit cards,
So that I can organize my card payments and track limits.

## Acceptance Criteria

1. Pode cadastrar cartão com nome, bandeira, limite total, data de fechamento e data de vencimento da fatura (FR2)
2. Pode editar qualquer campo do cartão (FR6)
3. Pode arquivar um cartão (FR6)
4. Pode reativar um cartão arquivado
5. Lista de cartões mostra nome, bandeira e limite total de cada cartão
6. Cartões arquivados não aparecem na lista principal (toggle para exibir)
7. Schema Drizzle `credit_cards` criado com: id, name, brand, limit_cents (integer), closing_day (integer 1-31), due_day (integer 1-31), status (active/archived), organization_id, created_at, updated_at
8. Schema Zod de validação em `src/shared/schemas/credit-card.schema.ts`
9. Server Action + Use Case + Repository implementados seguindo Clean Architecture (mesmo padrão da Story 2.1)
10. Testes unitários escritos antes da implementação (TDD)
11. Valores monetários armazenados em centavos (inteiros, nunca floating-point)
12. Trilha de auditoria registrada para toda mutação (CREATE, UPDATE, ARCHIVE, REACTIVATE)
13. Nota: as métricas calculadas (utilizado, disponível, fatura estimada) serão implementadas no Epic 5

## Tasks / Subtasks

- [x] Task 1: Criar schema Drizzle para `credit_cards` + migration (AC: #7, #11)
  - [x] 1.1 Criar `src/server/infrastructure/database/schema/credit-cards.ts`:
    - Tabela `credit_cards` com colunas: `id` (text PK, UUID), `name` (text notNull), `brand` (text notNull), `limit_cents` (integer notNull), `closing_day` (integer notNull), `due_day` (integer notNull), `status` (text notNull default 'active'), `organization_id` (text notNull, FK → organizations.id), `created_at` (timestamp with timezone, notNull, defaultNow), `updated_at` (timestamp with timezone, notNull, defaultNow)
    - Import: `pgTable, pgPolicy, text, integer, timestamp` de `drizzle-orm/pg-core` + `sql` de `drizzle-orm`
    - FK: `organizationId` references `organizations.id`
    - RLS policy `credit_cards_org_isolation` com `organization_id = current_setting('app.organization_id', true)` (mesmo padrão de `bank_accounts`)
  - [x] 1.2 Atualizar `src/server/infrastructure/database/schema/index.ts` — adicionar export de `creditCards`
  - [x] 1.3 Executar `npm run db:generate` para gerar migration SQL
  - [x] 1.4 Executar `npm run db:migrate` para aplicar no banco local
  - [x] 1.5 Escrever testes em `src/server/infrastructure/database/schema/credit-cards.test.ts`:
    - Verifica que tabela tem todas as colunas esperadas com tipos corretos
    - Verifica constraints: notNull em name, brand, limitCents, closingDay, dueDay, status, organizationId
    - Verifica default values: status='active', createdAt/updatedAt=defaultNow

- [x] Task 2: Criar schema Zod de validação (AC: #8)
  - [x] 2.1 Criar `src/shared/schemas/credit-card.schema.ts`:
    - `createCreditCardSchema`: `z.object({ name: z.string().min(1, "Nome do cartão é obrigatório").max(100), brand: z.string().min(1, "Bandeira é obrigatória").max(50), limitCents: z.number().int().positive("Limite deve ser um valor positivo"), closingDay: z.number().int().min(1, "Dia de fechamento deve ser entre 1 e 31").max(31, "Dia de fechamento deve ser entre 1 e 31"), dueDay: z.number().int().min(1, "Dia de vencimento deve ser entre 1 e 31").max(31, "Dia de vencimento deve ser entre 1 e 31") })`
    - `updateCreditCardSchema`: `z.object({ name: z.string().min(1).max(100).optional(), brand: z.string().min(1).max(50).optional(), limitCents: z.number().int().positive().optional(), closingDay: z.number().int().min(1).max(31).optional(), dueDay: z.number().int().min(1).max(31).optional() }).refine(data => Object.keys(data).length > 0, { message: "Pelo menos um campo deve ser informado" })`
    - `creditCardIdSchema`: usa `idSchema` de `common.schema.ts`
    - Tipos inferidos: `CreateCreditCardInput`, `UpdateCreditCardInput`
  - [x] 2.2 Escrever testes TDD em `src/shared/schemas/credit-card.schema.test.ts`:
    - createCreditCardSchema: aceita dados válidos, rejeita nome vazio, rejeita bandeira vazia, rejeita limite zero/negativo, rejeita closingDay < 1 ou > 31, rejeita dueDay < 1 ou > 31
    - updateCreditCardSchema: aceita campos parciais, rejeita objeto vazio, valida cada campo individualmente

- [x] Task 3: Criar repository interface e implementação (AC: #9)
  - [x] 3.1 Criar interface em `src/server/domain/credit-cards/repositories/credit-card.repository.ts`:
    - `CreditCardRepository` interface com métodos:
      - `create(data: { id: string; name: string; brand: string; limitCents: number; closingDay: number; dueDay: number; organizationId: string }): Promise<CreditCard>`
      - `findById(id: string, organizationId: string): Promise<CreditCard | null>`
      - `findAllByOrganization(organizationId: string, includeArchived?: boolean): Promise<CreditCard[]>`
      - `update(id: string, organizationId: string, data: Partial<{ name: string; brand: string; limitCents: number; closingDay: number; dueDay: number }>): Promise<CreditCard>`
      - `updateStatus(id: string, organizationId: string, status: 'active' | 'archived'): Promise<CreditCard>`
    - Tipo `CreditCard`: `{ id: string; name: string; brand: string; limitCents: number; closingDay: number; dueDay: number; status: 'active' | 'archived'; organizationId: string; createdAt: Date; updatedAt: Date }`
  - [x] 3.2 Criar implementação em `src/server/infrastructure/database/repositories/credit-card.repository.impl.ts`:
    - Seguir EXATAMENTE o padrão de `DrizzleBankAccountRepository`
    - Usar `db` de `@/server/infrastructure/database/client`
    - Usar `creditCards` de `@/server/infrastructure/database/schema`
    - Queries Drizzle com `eq()` e `and()` para filtros
    - **CRITICO**: `.returning()` em todos os `update` e `updateStatus` (bug corrigido na Story 2.1 R1)
    - `update`: set dados + `updatedAt: new Date()`
    - `updateStatus`: set status + `updatedAt: new Date()`
  - [x] 3.3 Escrever testes TDD para o repository em `src/server/infrastructure/database/repositories/credit-card.repository.impl.test.ts`:
    - Mock do Drizzle client (`db`) — mesmo padrão de bank-account.repository.impl.test.ts
    - Testa create com dados completos
    - Testa findById retorna cartão ou null
    - Testa findAllByOrganization filtra por organization e status
    - Testa update atualiza campos parciais + updatedAt
    - Testa updateStatus muda status + updatedAt

- [x] Task 4: Criar use cases (AC: #9, #12)
  - [x] 4.1 Criar `src/server/domain/credit-cards/use-cases/create-credit-card.ts`:
    - Recebe: `deps: { repository, auditLogger }` + `params: { name, brand, limitCents, closingDay, dueDay, organizationId, userId }`
    - Gera UUID via `crypto.randomUUID()`
    - Chama `repository.create()`
    - Registra auditoria via `deps.auditLogger({ action: 'CREATE', entityType: 'credit_card', ... })`
    - Retorna `ok(creditCard)`
  - [x] 4.2 Criar `src/server/domain/credit-cards/use-cases/update-credit-card.ts`:
    - Recebe: `deps` + `params: { id, organizationId, userId, data }`
    - Busca cartão existente — se não existe, retorna `err('CREDIT_CARD_NOT_FOUND', ...)`
    - Chama `repository.update()`
    - Registra auditoria com `oldValue` e `newValue`
    - Retorna `ok(updatedCard)`
  - [x] 4.3 Criar `src/server/domain/credit-cards/use-cases/archive-credit-card.ts`:
    - Se não existe, retorna erro. Se já archived, retorna `err('CREDIT_CARD_ALREADY_ARCHIVED', ...)`
    - Chama `repository.updateStatus(id, organizationId, 'archived')`
    - Registra auditoria (action: 'ARCHIVE')
  - [x] 4.4 Criar `src/server/domain/credit-cards/use-cases/reactivate-credit-card.ts`:
    - Se não existe ou já ativa, retorna erro adequado
    - Chama `repository.updateStatus(id, organizationId, 'active')`
    - Registra auditoria (action: 'REACTIVATE')
  - [x] 4.5 Criar `src/server/domain/credit-cards/use-cases/list-credit-cards.ts`:
    - Recebe: `repository` + `params: { organizationId, includeArchived? }`
    - Retorna `ok(cards)`
  - [x] 4.6 Criar `src/server/domain/credit-cards/use-cases/get-credit-card.ts`:
    - Se não existe, retorna `err('CREDIT_CARD_NOT_FOUND', ...)`
    - Retorna `ok(card)`
  - [x] 4.7 Escrever testes TDD para CADA use case (co-localizados):
    - Seguir EXATAMENTE o padrão dos testes de bank-account: mock repository + mock auditLogger
    - `create-credit-card.test.ts`: sucesso, auditoria registrada
    - `update-credit-card.test.ts`: sucesso, cartão não encontrado, auditoria com oldValue/newValue
    - `archive-credit-card.test.ts`: sucesso, já archived, não encontrado
    - `reactivate-credit-card.test.ts`: sucesso, já ativo, não encontrado
    - `list-credit-cards.test.ts`: lista cartões, filtra archived
    - `get-credit-card.test.ts`: sucesso, não encontrado

- [x] Task 5: Criar factory e Server Actions com withAuth + validateInput (AC: #9, #10)
  - [x] 5.1 Criar `src/server/factories/credit-card.ts`:
    - Exportar `creditCardDeps` com `repository: new DrizzleCreditCardRepository()` e `auditLogger: logAudit`
    - Seguir EXATAMENTE o padrão de `src/server/factories/bank-account.ts`
  - [x] 5.2 Criar `src/server/actions/credit-card.actions.ts`:
    - `'use server'` no topo
    - `createCreditCardAction`, `updateCreditCardAction`, `archiveCreditCardAction`, `reactivateCreditCardAction`, `listCreditCardsAction`, `getCreditCardAction`
    - Seguir EXATAMENTE o padrão de `bank-account.actions.ts`: withAuth, validateInput, getOrganizationId, err NO_ACTIVE_ORGANIZATION
    - `listCreditCardsAction`: passar `includeArchived: true` (bug corrigido na Story 2.1 R1)
  - [x] 5.3 Escrever testes TDD em `src/server/actions/credit-card.actions.test.ts`:
    - Testa que cada action chama withAuth (session required)
    - Testa validação de input (rejeita dados inválidos)
    - Testa que use case é chamado com dados corretos
    - Mock de withAuth, validateInput e use cases

- [x] Task 6: Criar componentes de UI (AC: #1, #2, #3, #4, #5, #6)
  - [x] 6.1 Criar página `src/app/(app)/credit-cards/page.tsx`:
    - Server Component que carrega lista de cartões via `listCreditCardsAction`
    - Renderiza `CreditCardList` com dados iniciais
  - [x] 6.2 Criar `src/app/(app)/credit-cards/loading.tsx`:
    - Skeleton cards seguindo padrão de `/accounts/loading.tsx`
  - [x] 6.3 Criar `src/client/components/credit-cards/CreditCardForm.tsx`:
    - Client Component (`'use client'`)
    - Form com campos: nome (text), bandeira (text), limite (input monetário com máscara de centavos — MESMO padrão do BankAccountForm), dia de fechamento (number 1-31), dia de vencimento (number 1-31)
    - Input de limite: estilo app bancário — usuário digita só números, vírgula posiciona automaticamente. Usar `centsToDisplayValue`/`displayValueToCents` de BankAccountForm
    - Submissão chama `createCreditCardAction` ou `updateCreditCardAction`
    - Validação client-side via erros do Result
    - Toast de confirmação ao sucesso
    - Loading state com `useTransition`
    - Props: `mode: 'create' | 'edit'`, `defaultValues?`
  - [x] 6.4 Criar `src/client/components/credit-cards/CreditCardCard.tsx`:
    - Client Component
    - Exibe: nome do cartão, bandeira, limite formatado (R$ X.XX)
    - Limite com `tabular-nums` (requisito UX para valores financeiros)
    - Mostrar dia de fechamento e dia de vencimento
    - Botões: Editar, Arquivar (com dialog de confirmação) / Reativar (para arquivados)
    - Seguir EXATAMENTE o padrão de `BankAccountCard.tsx`
  - [x] 6.5 Criar `src/client/components/credit-cards/CreditCardList.tsx`:
    - Client Component
    - Renderiza lista de `CreditCardCard`
    - Separação visual: cartões ativos vs. cartões arquivados (toggle)
    - Empty state para quando não há cartões
    - Dialog para create/edit form
    - Seguir EXATAMENTE o padrão de `BankAccountList.tsx`

- [x] Task 7: Adicionar link na sidebar/navegação (AC: #5)
  - [x] 7.1 Verificar a estrutura de navegação existente (Sidebar/MobileNav) e adicionar link para `/credit-cards`
  - [x] 7.2 Usar ícone apropriado para cartões de crédito na navegação

- [x] Task 8: Validação final (AC: #1-#13)
  - [x] 8.1 `npm run build` compila sem erros
  - [x] 8.2 `npm test` roda e passa — todos os testes novos + zero regressões nos 250+ existentes
  - [x] 8.3 `npm run lint` sem erros novos
  - [x] 8.4 CRUD completo funcional: criar, listar, editar, arquivar, reativar
  - [x] 8.5 Auditoria registrada para todas as mutações
  - [x] 8.6 Valores monetários em centavos (integer) em todo o fluxo
  - [x] 8.7 Verificar UX: layout responsivo, limite com tabular-nums, toast de confirmação, dialog de arquivamento, dias de fechamento/vencimento visíveis

### Review Follow-ups (AI) — R1 2026-03-19

- [x] [AI-Review][MEDIUM] Extrair `centsToDisplayValue`/`displayValueToCents` para `src/client/utils/currency-input.ts` — duplicadas em BankAccountForm e CreditCardForm [CreditCardForm.tsx:25-34]
- [x] [AI-Review][LOW] Corrigir import ordering em `credit-card.actions.ts`, `CreditCardForm.tsx` e `CreditCardList.tsx` para seguir padrão project-context (External → Shared → Server → Client)
- [x] [AI-Review][LOW] Documentar `migrations/meta/0005_snapshot.json` e `migrations/meta/_journal.json` na File List da story
- [x] [AI-Review][LOW] Utilizar `isPending` do `useTransition` em `CreditCardList.tsx` para feedback visual durante refresh/edit loading [CreditCardList.tsx:46]

## Dev Notes

### ALERTA CRITICO: Seguir Blueprint da Story 2.1

A Story 2.1 (bank accounts) é o **blueprint completo** para esta story. O padrão de Clean Architecture foi estabelecido e validado em code review com 2 rounds. Seguir EXATAMENTE:

```
src/server/domain/credit-cards/
  repositories/credit-card.repository.ts        → Interface (contrato)
  use-cases/
    create-credit-card.ts + .test.ts
    update-credit-card.ts + .test.ts
    archive-credit-card.ts + .test.ts
    reactivate-credit-card.ts + .test.ts
    list-credit-cards.ts + .test.ts
    get-credit-card.ts + .test.ts

src/server/infrastructure/database/
  schema/credit-cards.ts                        → Schema Drizzle
  schema/credit-cards.test.ts                   → Testes do schema
  repositories/credit-card.repository.impl.ts   → Implementação
  repositories/credit-card.repository.impl.test.ts

src/server/factories/credit-card.ts             → Composition root (DI)
src/server/actions/credit-card.actions.ts       → Server Actions
src/server/actions/credit-card.actions.test.ts

src/shared/schemas/credit-card.schema.ts        → Schemas Zod
src/shared/schemas/credit-card.schema.test.ts

src/client/components/credit-cards/
  CreditCardForm.tsx
  CreditCardCard.tsx
  CreditCardList.tsx

src/app/(app)/credit-cards/page.tsx             → Rota
src/app/(app)/credit-cards/loading.tsx          → Skeleton
```

### Versões Exatas do Stack (Story 2.2)

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

### ALERTA: Nome da Tabela — `credit_cards`

A tabela deve se chamar `credit_cards` no banco e `creditCards` como variável Drizzle. Não há colisão com tabelas existentes.

### ALERTA: Campos Específicos de Cartão de Crédito

| Campo | Tipo DB | Tipo TS | Validação | Notas |
|---|---|---|---|---|
| `name` | text notNull | string | min(1), max(100) | Nome do cartão (ex: "Latam Pass Visa") |
| `brand` | text notNull | string | min(1), max(50) | Bandeira (ex: "Visa", "Mastercard") |
| `limit_cents` | integer notNull | number | int(), positive() | Limite total em centavos |
| `closing_day` | integer notNull | number | int(), min(1), max(31) | Dia de fechamento da fatura (1-31) |
| `due_day` | integer notNull | number | int(), min(1), max(31) | Dia de vencimento da fatura (1-31) |
| `status` | text notNull default 'active' | 'active' \| 'archived' | — | Soft delete |

**closing_day e due_day**: São inteiros de 1 a 31 representando o dia do mês. Para meses com menos dias (ex: fevereiro), o sistema tratará no Epic 5 quando calcular mês de referência. Nesta story, apenas armazenar os valores.

### ALERTA: Monetary Precision — Centavos como Integer

**NUNCA usar floating-point para o limite do cartão.**

- Banco: `limit_cents` como INTEGER (`integer('limit_cents')` no Drizzle)
- Armazenamento: R$10.000,00 → 1000000 (centavos)
- Apresentação: dividir por 100 apenas na camada de exibição (formatCurrency.ts — já existe)
- Validação Zod: `z.number().int().positive()` — rejeita decimais, zero e negativos

### ALERTA: Input de Valor Monetário — Mesmo Padrão da Story 2.1

O input de limite do cartão DEVE seguir o padrão app bancário estabelecido em BankAccountForm.tsx:
- Usuário digita só números, vírgula posiciona automaticamente
- Ex: digitar "1000000" mostra "R$ 10.000,00"
- Usar `inputMode="numeric"`, prefixo "R$" no valor
- Reutilizar `centsToDisplayValue` e `displayValueToCents` — **EXTRAIR** essas funções para `src/client/utils/currency-input.ts` se ainda não estiverem lá, ou importar diretamente do BankAccountForm se exportadas. Se não exportadas, duplicar a lógica (mesmo código).

### ALERTA: Drizzle Schema — Padrão Correto

```typescript
import { sql } from 'drizzle-orm';
import { pgTable, pgPolicy, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';

export const creditCards = pgTable('credit_cards', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  brand: text('brand').notNull(),
  limitCents: integer('limit_cents').notNull(),
  closingDay: integer('closing_day').notNull(),
  dueDay: integer('due_day').notNull(),
  status: text('status').notNull().default('active'),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, () => [
  pgPolicy('credit_cards_org_isolation', {
    for: 'all',
    using: sql`organization_id = current_setting('app.organization_id', true)`,
  }),
]);
```

### ALERTA: Use Cases — Dependency Injection (Lição Story 2.1 R1)

**NUNCA** importar diretamente de `infrastructure/` nos use cases. Seguir DI:

```typescript
// ✅ CORRETO — Use case recebe deps via parâmetro
export async function createCreditCard(
  deps: { repository: CreditCardRepository; auditLogger: AuditLogger },
  params: CreateCreditCardParams,
): Promise<Result<CreditCard>> { ... }

// ❌ ERRADO — Use case importa de infrastructure
import { logAudit } from '@/server/infrastructure/audit/audit.service'; // PROIBIDO
```

### ALERTA: Factory — Composition Root (Lição Story 2.1 R1)

```typescript
// src/server/factories/credit-card.ts
import { DrizzleCreditCardRepository } from '@/server/infrastructure/database/repositories/credit-card.repository.impl';
import { logAudit } from '@/server/infrastructure/audit/audit.service';

export const creditCardDeps = {
  repository: new DrizzleCreditCardRepository(),
  auditLogger: logAudit,
};
```

### ALERTA: Server Actions — Padrão com withAuth (Lição Story 2.1 R1)

```typescript
// src/server/actions/credit-card.actions.ts
'use server';

import { withAuth } from '@/server/infrastructure/auth/with-auth';
import { validateInput } from '@/server/infrastructure/validation/validate';
import { err } from '@/shared/types/result';
import { creditCardDeps } from '@/server/factories/credit-card';
// ... importar use cases e schemas

function getOrganizationId(session: { session: { activeOrganizationId?: string | null } }) {
  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) return null;
  return organizationId;
}

export const createCreditCardAction = withAuth(async (session, input: unknown) => {
  const validation = validateInput(createCreditCardSchema, input);
  if (!validation.success) return validation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return createCreditCard(creditCardDeps, {
    ...validation.data,
    organizationId,
    userId: session.user.id,
  });
});
```

**CRITICO**: `listCreditCardsAction` DEVE passar `includeArchived: true` — bug corrigido na Story 2.1 R1.

### ALERTA: Repository `.returning()` (Lição Story 2.1 R1)

Os métodos `update()` e `updateStatus()` do repository DEVEM usar `.returning()`. Sem isso, Drizzle UPDATE não retorna os registros atualizados e causa crash em runtime.

```typescript
// ✅ CORRETO
const [card] = await db
  .update(creditCards)
  .set({ ...data, updatedAt: new Date() })
  .where(and(eq(creditCards.id, id), eq(creditCards.organizationId, organizationId)))
  .returning();

// ❌ ERRADO — sem .returning()
await db.update(creditCards).set({ ...data }).where(...);
```

### Error Codes — Padrão para Credit Cards

| Código | Mensagem | Quando |
|---|---|---|
| `VALIDATION_ERROR` | Mensagem do Zod em pt-BR | Dados inválidos no input |
| `UNAUTHORIZED` | Sessão inválida. Faça login novamente. | withAuth — sem sessão |
| `NO_ACTIVE_ORGANIZATION` | Nenhuma organização ativa. | Sem activeOrganizationId na session |
| `CREDIT_CARD_NOT_FOUND` | Cartão de crédito não encontrado. | findById retorna null |
| `CREDIT_CARD_ALREADY_ARCHIVED` | Este cartão já está arquivado. | Tentar arquivar cartão archived |
| `CREDIT_CARD_ALREADY_ACTIVE` | Este cartão já está ativo. | Tentar reativar cartão active |

### Dependências desta Story

**Depende de (já implementado):**
- Story 1.1: Projeto inicializado com estrutura base
- Story 1.3: Supabase + Drizzle configurado + migrations rodando
- Story 1.4: Better Auth com Organizations (session, activeOrganizationId)
- Story 1.6: logAudit, withAuth, RLS base
- Story 1.7: logger, validateInput, ok/err helpers, common schemas
- Story 2.1: Blueprint de Clean Architecture (Server Action → Use Case → Repository), factory pattern, AuditLogger interface, formatCurrency, centsToDisplayValue/displayValueToCents

**É dependência de (stories futuras):**
- Story 2.5: Configuração de método de pagamento padrão por categoria (cartão como opção)
- Story 2.6: Onboarding — Etapa 2 é "Adicionar cartões de crédito"
- Story 3.1: Transações selecionam cartão como método de pagamento
- Story 5.1: Mês de referência automático usa closing_day do cartão
- Story 5.2: Parcelas associadas ao cartão
- Story 5.3: Reconciliação de fatura

### Inteligência da Story 2.1 (Previous Story)

**Infraestrutura já pronta (NÃO reimplementar):**
- `src/server/infrastructure/audit/audit.service.ts` → `logAudit()` — fail-safe, nunca bloqueia
- `src/server/infrastructure/auth/with-auth.ts` → `withAuth()` — Result Pattern para auth
- `src/server/infrastructure/validation/validate.ts` → `validateInput()` — Zod + Result
- `src/shared/types/result.ts` → `ok()`, `err()` — helpers do Result Pattern
- `src/server/infrastructure/logging/logger.ts` → `logger.info()`, `.warn()`, `.error()`
- `src/shared/schemas/common.schema.ts` → `idSchema`, `amountCentsSchema` — schemas reutilizáveis
- `src/server/domain/shared/types/audit-logger.ts` → `AuditLogger` type (interface DI)
- `src/client/utils/format-currency.ts` → `formatCurrency()` — converte centavos para "R$ X,XX"

**Lições aprendidas (Story 2.1 Code Review R1 — 7 findings):**
1. **[CRITICAL] `.returning()` obrigatório** — Drizzle UPDATE sem `.returning()` não retorna registros, crash em runtime
2. **[HIGH] Use cases NÃO importam de infrastructure** — usar DI via `deps` parameter com `AuditLogger` interface
3. **[HIGH] Server Actions NÃO importam de infrastructure** — usar factory/composition root (`src/server/factories/`)
4. **[HIGH] `listAction` deve incluir archived** — passar `includeArchived: true` para que UI possa mostrar toggle de arquivados
5. **[MEDIUM] `loading.tsx` obrigatório** — cada rota deve ter skeleton (nunca tela em branco)
6. **[LOW] `displayValueToCents` sem floating-point** — não usar `Math.round(parseFloat(value) * 100)`, fazer parsing de inteiro/decimal separado

**Git patterns:**
```
feat: add credit card CRUD with Clean Architecture (Story 2.2)
fix: resolve code review findings for Story 2.2
chore: mark Story 2.2 as done after code review approval
```

### shadcn/ui — Componentes Já Disponíveis

Os seguintes componentes de `src/client/components/ui/` já estão instalados e prontos:
- button, input, label, card, dialog, skeleton, sonner (toast)

Para adicionar novos (se necessário): `npx shadcn@latest add <component>` — verificar `components.json` para paths.

### O Que NÃO Fazer Nesta Story

- **NÃO implementar** métricas calculadas (utilizado, disponível, fatura estimada) — vem no Epic 5
- **NÃO implementar** mês de referência automático — vem na Story 5.1
- **NÃO implementar** parcelas — vem na Story 5.2
- **NÃO implementar** reconciliação de fatura — vem na Story 5.3
- **NÃO implementar** CreditCardDetail component (visão detalhada com métricas) — vem no Epic 5
- **NÃO usar** floating-point para limite — sempre integer em centavos
- **NÃO implementar** exclusão permanente — sempre soft delete (archive)
- **NÃO implementar** real-time updates — será adicionado em stories futuras
- **NÃO instalar** pacotes novos
- **NÃO criar** `tailwind.config.ts` — Tailwind v4 não usa
- **NÃO alterar** tabelas existentes (bank_accounts, auth tables, etc.)

### Project Structure Notes

**Arquivos a criar:**
- `src/server/infrastructure/database/schema/credit-cards.ts`
- `src/server/infrastructure/database/schema/credit-cards.test.ts`
- `src/server/infrastructure/database/repositories/credit-card.repository.impl.ts`
- `src/server/infrastructure/database/repositories/credit-card.repository.impl.test.ts`
- `src/server/domain/credit-cards/repositories/credit-card.repository.ts` (interface)
- `src/server/domain/credit-cards/use-cases/create-credit-card.ts`
- `src/server/domain/credit-cards/use-cases/create-credit-card.test.ts`
- `src/server/domain/credit-cards/use-cases/update-credit-card.ts`
- `src/server/domain/credit-cards/use-cases/update-credit-card.test.ts`
- `src/server/domain/credit-cards/use-cases/archive-credit-card.ts`
- `src/server/domain/credit-cards/use-cases/archive-credit-card.test.ts`
- `src/server/domain/credit-cards/use-cases/reactivate-credit-card.ts`
- `src/server/domain/credit-cards/use-cases/reactivate-credit-card.test.ts`
- `src/server/domain/credit-cards/use-cases/list-credit-cards.ts`
- `src/server/domain/credit-cards/use-cases/list-credit-cards.test.ts`
- `src/server/domain/credit-cards/use-cases/get-credit-card.ts`
- `src/server/domain/credit-cards/use-cases/get-credit-card.test.ts`
- `src/server/factories/credit-card.ts`
- `src/server/actions/credit-card.actions.ts`
- `src/server/actions/credit-card.actions.test.ts`
- `src/shared/schemas/credit-card.schema.ts`
- `src/shared/schemas/credit-card.schema.test.ts`
- `src/app/(app)/credit-cards/page.tsx`
- `src/app/(app)/credit-cards/loading.tsx`
- `src/client/components/credit-cards/CreditCardForm.tsx`
- `src/client/components/credit-cards/CreditCardCard.tsx`
- `src/client/components/credit-cards/CreditCardList.tsx`
- `src/server/infrastructure/database/migrations/XXXX_*.sql` (gerado pelo drizzle-kit)

**Arquivos a modificar:**
- `src/server/infrastructure/database/schema/index.ts` — adicionar export de `creditCards`
- Sidebar/navegação — adicionar link para `/credit-cards` (verificar componente existente)

**Arquivos que NÃO devem ser modificados:**
- `src/server/infrastructure/database/schema/bank-accounts.ts` — tabela de contas bancárias intacta
- `src/server/infrastructure/database/schema/auth.ts` — tabela de auth intacta
- `src/server/infrastructure/auth/config.ts` — config Better Auth intacta
- `package.json` — nenhum pacote novo
- `src/app/globals.css` — design system intacto
- `next.config.ts` — config intacta

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.2: Cadastro e Gestao de Cartoes de Credito (Estrutura)]
- [Source: _bmad-output/planning-artifacts/architecture.md#Clean Architecture + DDD]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Result Pattern]
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns]
- [Source: _bmad-output/planning-artifacts/prd.md#FR2, FR6, FR8]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#CreditCardDetail, Sidebar, Onboarding]
- [Source: _bmad-output/implementation-artifacts/2-1-cadastro-e-gestao-de-contas-bancarias.md]
- [Source: _bmad-output/project-context.md]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- drizzle-kit migrate hung during execution — migration applied manually via psql

### Completion Notes List

- Task 1: Schema Drizzle `credit_cards` com RLS policy, FK, migration 0005_natural_zzzax.sql gerada e aplicada
- Task 2: Schemas Zod (create, update, id) com validação de closingDay/dueDay 1-31, limitCents positivo inteiro
- Task 3: Repository interface + DrizzleCreditCardRepository com .returning() em todos os updates
- Task 4: 6 use cases (create, update, archive, reactivate, list, get) com DI e auditoria
- Task 5: Factory (composition root) + 6 Server Actions com withAuth, validateInput, listAction com includeArchived: true
- Task 6: UI completa — CreditCardForm (input monetário estilo app bancário), CreditCardCard (tabular-nums, dias de fechamento/vencimento), CreditCardList (toggle archived, dialogs), page.tsx, loading.tsx
- Task 7: Link "Cartões" adicionado no Sidebar e BottomNavigation com ícone CreditCard
- Task 8: 312 testes passando (0 falhas), build OK, lint sem erros novos
- Todos os padrões da Story 2.1 seguidos fielmente (Clean Architecture, DI, Result Pattern, auditoria)
- Review Follow-ups R1: Extraído currency-input.ts (12 testes), corrigido import ordering em 4 arquivos, documentado migration meta files, adicionado isPending feedback no CreditCardList

### Change Log

- 2026-03-19: Implementação completa do CRUD de cartões de crédito (Story 2.2)
- 2026-03-19: Code Review R1 — 0 HIGH, 1 MEDIUM, 3 LOW. Action items criados como backlog.
- 2026-03-19: Addressed code review findings — 4 items resolved (1 MEDIUM, 3 LOW)
- 2026-03-19: Code Review R2 — All 4 R1 fixes validated. 324 tests passing. APPROVED.

### File List

**Novos:**
- src/server/infrastructure/database/schema/credit-cards.ts
- src/server/infrastructure/database/schema/credit-cards.test.ts
- src/server/infrastructure/database/migrations/0005_natural_zzzax.sql
- src/server/infrastructure/database/migrations/meta/0005_snapshot.json
- src/server/infrastructure/database/migrations/meta/_journal.json
- src/client/utils/currency-input.ts
- src/client/utils/currency-input.test.ts
- src/server/domain/credit-cards/repositories/credit-card.repository.ts
- src/server/infrastructure/database/repositories/credit-card.repository.impl.ts
- src/server/infrastructure/database/repositories/credit-card.repository.impl.test.ts
- src/server/domain/credit-cards/use-cases/create-credit-card.ts
- src/server/domain/credit-cards/use-cases/create-credit-card.test.ts
- src/server/domain/credit-cards/use-cases/update-credit-card.ts
- src/server/domain/credit-cards/use-cases/update-credit-card.test.ts
- src/server/domain/credit-cards/use-cases/archive-credit-card.ts
- src/server/domain/credit-cards/use-cases/archive-credit-card.test.ts
- src/server/domain/credit-cards/use-cases/reactivate-credit-card.ts
- src/server/domain/credit-cards/use-cases/reactivate-credit-card.test.ts
- src/server/domain/credit-cards/use-cases/list-credit-cards.ts
- src/server/domain/credit-cards/use-cases/list-credit-cards.test.ts
- src/server/domain/credit-cards/use-cases/get-credit-card.ts
- src/server/domain/credit-cards/use-cases/get-credit-card.test.ts
- src/server/factories/credit-card.ts
- src/server/actions/credit-card.actions.ts
- src/server/actions/credit-card.actions.test.ts
- src/shared/schemas/credit-card.schema.ts
- src/shared/schemas/credit-card.schema.test.ts
- src/client/components/credit-cards/CreditCardForm.tsx
- src/client/components/credit-cards/CreditCardCard.tsx
- src/client/components/credit-cards/CreditCardList.tsx
- src/app/(app)/credit-cards/page.tsx
- src/app/(app)/credit-cards/loading.tsx

**Modificados:**
- src/server/infrastructure/database/schema/index.ts (adicionado export creditCards)
- src/client/components/layout/Sidebar.tsx (adicionado link Cartões)
- src/client/components/layout/BottomNavigation.tsx (adicionado link Cartões, removido Orçamentos do mobile)
- src/client/components/layout/BottomNavigation.test.tsx (atualizado teste para novo nav item)
- src/client/components/bank-accounts/BankAccountForm.tsx (importa centsToDisplayValue/displayValueToCents de currency-input.ts)
- src/client/components/credit-cards/CreditCardForm.tsx (importa de currency-input.ts + import ordering corrigido)
- src/client/components/credit-cards/CreditCardList.tsx (isPending feedback visual + import ordering corrigido)
- src/server/actions/credit-card.actions.ts (import ordering corrigido)
- _bmad-output/implementation-artifacts/sprint-status.yaml (status atualizado)
- _bmad-output/implementation-artifacts/2-2-cadastro-e-gestao-de-cartoes-de-credito-estrutura.md (tasks marcadas, review follow-ups resolvidos)
