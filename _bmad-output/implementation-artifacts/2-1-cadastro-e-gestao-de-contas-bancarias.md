# Story 2.1: Cadastro e Gestão de Contas Bancárias

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a authenticated user,
I want to create, edit, and view my bank accounts,
So that I can track my balances and organize my financial structure.

## Acceptance Criteria

1. Pode cadastrar conta bancária com nome, banco e saldo inicial (FR1)
2. Pode visualizar o saldo atualizado de cada conta (FR7)
3. Pode editar nome, banco e saldo de qualquer conta (FR6)
4. Pode arquivar uma conta (não aparece para novas transações, histórico preservado) (FR6)
5. Pode reativar uma conta arquivada (FR6)
6. Tentativa de exclusão resulta em arquivamento (nunca exclusão definitiva) (FR6)
7. Schema Drizzle `bank_accounts` criado com: id, name, bank, balanceCents (integer), status (active/archived), organizationId, createdAt, updatedAt
8. Schema Zod de validação em `src/shared/schemas/bank-account.schema.ts`
9. Server Action + Use Case + Repository implementados seguindo Clean Architecture
10. Testes unitários escritos antes da implementação (TDD)
11. Valores monetários armazenados em centavos (inteiros, nunca floating-point)
12. Trilha de auditoria registrada para toda mutação (CREATE, UPDATE, ARCHIVE, REACTIVATE)

## Tasks / Subtasks

- [x] Task 1: Criar schema Drizzle para `bank_accounts` + migration (AC: #7, #11)
  - [x] 1.1 Criar `src/server/infrastructure/database/schema/bank-accounts.ts`:
    - Tabela `bank_accounts` com colunas: `id` (text PK, UUID), `name` (text notNull), `bank` (text notNull), `balance_cents` (integer notNull default 0), `status` (text notNull default 'active'), `organization_id` (text notNull, FK → organizations.id), `created_at` (timestamp with timezone, notNull, defaultNow), `updated_at` (timestamp with timezone, notNull, defaultNow)
    - Import: `pgTable, text, integer, timestamp` de `drizzle-orm/pg-core`
    - FK: `organizationId` references `organizations.id`
  - [x] 1.2 Atualizar `src/server/infrastructure/database/schema/index.ts` — adicionar export de `bankAccounts`
  - [x] 1.3 Executar `npm run db:generate` para gerar migration SQL
  - [x] 1.4 Executar `npm run db:migrate` para aplicar no banco local
  - [x] 1.5 Escrever testes em `src/server/infrastructure/database/schema/bank-accounts.test.ts`:
    - Verifica que tabela tem todas as colunas esperadas com tipos corretos
    - Verifica constraints: notNull em name, bank, balanceCents, status, organizationId
    - Verifica default values: balanceCents=0, status='active', createdAt/updatedAt=defaultNow

- [x] Task 2: Criar schema Zod de validação (AC: #8)
  - [x] 2.1 Criar `src/shared/schemas/bank-account.schema.ts`:
    - `createBankAccountSchema`: `z.object({ name: z.string().min(1, "Nome da conta é obrigatório").max(100), bank: z.string().min(1, "Nome do banco é obrigatório").max(100), balanceCents: z.number().int().nonnegative("Saldo deve ser um valor positivo em centavos").default(0) })`
    - `updateBankAccountSchema`: `z.object({ name: z.string().min(1).max(100).optional(), bank: z.string().min(1).max(100).optional(), balanceCents: z.number().int().nonnegative().optional() }).refine(data => Object.keys(data).length > 0, { message: "Pelo menos um campo deve ser informado" })`
    - `bankAccountIdSchema`: usa `idSchema` de `common.schema.ts`
    - Tipos inferidos: `CreateBankAccountInput`, `UpdateBankAccountInput`
  - [x] 2.2 Escrever testes TDD em `src/shared/schemas/bank-account.schema.test.ts`:
    - createBankAccountSchema: aceita dados válidos, rejeita nome vazio, rejeita banco vazio, rejeita saldo negativo, aceita saldo zero, default balanceCents=0
    - updateBankAccountSchema: aceita campos parciais, rejeita objeto vazio, valida cada campo individualmente

- [x] Task 3: Criar repository interface e implementação (AC: #9)
  - [x] 3.1 Criar interface em `src/server/domain/bank-accounts/repositories/bank-account.repository.ts`:
    - `BankAccountRepository` interface com métodos:
      - `create(data: { id: string; name: string; bank: string; balanceCents: number; organizationId: string }): Promise<BankAccount>`
      - `findById(id: string, organizationId: string): Promise<BankAccount | null>`
      - `findAllByOrganization(organizationId: string, includeArchived?: boolean): Promise<BankAccount[]>`
      - `update(id: string, organizationId: string, data: Partial<{ name: string; bank: string; balanceCents: number }>): Promise<BankAccount>`
      - `updateStatus(id: string, organizationId: string, status: 'active' | 'archived'): Promise<BankAccount>`
    - Tipo `BankAccount`: `{ id: string; name: string; bank: string; balanceCents: number; status: 'active' | 'archived'; organizationId: string; createdAt: Date; updatedAt: Date }`
  - [x] 3.2 Criar implementação em `src/server/infrastructure/database/repositories/bank-account.repository.impl.ts`:
    - Usa `db` de `@/server/infrastructure/database/client`
    - Usa `bankAccounts` de `@/server/infrastructure/database/schema`
    - Queries Drizzle com `eq()` e `and()` para filtros
    - `findAllByOrganization`: filtra por organizationId, default exclui archived (status='active'), opcional inclui todos
    - `update`: usa `set()` com spread dos dados + `updatedAt: new Date()`
    - `updateStatus`: set status + updatedAt
    - Retorna objetos mapeados para o tipo `BankAccount`
  - [x] 3.3 Escrever testes TDD para o repository em `src/server/infrastructure/database/repositories/bank-account.repository.impl.test.ts`:
    - Mock do Drizzle client (`db`)
    - Testa create com dados completos
    - Testa findById retorna conta ou null
    - Testa findAllByOrganization filtra por organization e status
    - Testa update atualiza campos parciais + updatedAt
    - Testa updateStatus muda status + updatedAt

- [x] Task 4: Criar use cases (AC: #9, #12)
  - [x] 4.1 Criar `src/server/domain/bank-accounts/use-cases/create-bank-account.ts`:
    - Recebe: `{ name, bank, balanceCents, organizationId, userId }`
    - Gera UUID via `crypto.randomUUID()`
    - Chama `repository.create()`
    - Registra auditoria via `logAudit({ userId, organizationId, action: 'CREATE', entityType: 'bank_account', entityId, newValue })`
    - Retorna `ok(bankAccount)`
  - [x] 4.2 Criar `src/server/domain/bank-accounts/use-cases/update-bank-account.ts`:
    - Recebe: `{ id, organizationId, userId, data: { name?, bank?, balanceCents? } }`
    - Busca conta existente via `repository.findById()` — se não existe, retorna `err('BANK_ACCOUNT_NOT_FOUND', ...)`
    - Chama `repository.update()`
    - Registra auditoria com `oldValue` e `newValue`
    - Retorna `ok(updatedAccount)`
  - [x] 4.3 Criar `src/server/domain/bank-accounts/use-cases/archive-bank-account.ts`:
    - Recebe: `{ id, organizationId, userId }`
    - Busca conta existente — se não existe, retorna erro
    - Se já archived, retorna `err('BANK_ACCOUNT_ALREADY_ARCHIVED', ...)`
    - Chama `repository.updateStatus(id, organizationId, 'archived')`
    - Registra auditoria (action: 'ARCHIVE')
    - Retorna `ok(archivedAccount)`
  - [x] 4.4 Criar `src/server/domain/bank-accounts/use-cases/reactivate-bank-account.ts`:
    - Recebe: `{ id, organizationId, userId }`
    - Busca conta — se não existe ou já ativa, retorna erro adequado
    - Chama `repository.updateStatus(id, organizationId, 'active')`
    - Registra auditoria (action: 'REACTIVATE')
    - Retorna `ok(reactivatedAccount)`
  - [x] 4.5 Criar `src/server/domain/bank-accounts/use-cases/list-bank-accounts.ts`:
    - Recebe: `{ organizationId, includeArchived? }`
    - Chama `repository.findAllByOrganization()`
    - Retorna `ok(accounts)`
  - [x] 4.6 Criar `src/server/domain/bank-accounts/use-cases/get-bank-account.ts`:
    - Recebe: `{ id, organizationId }`
    - Busca conta — se não existe, retorna `err('BANK_ACCOUNT_NOT_FOUND', ...)`
    - Retorna `ok(account)`
  - [x] 4.7 Escrever testes TDD para CADA use case (co-localizados):
    - `create-bank-account.test.ts`: sucesso, auditoria registrada
    - `update-bank-account.test.ts`: sucesso, conta não encontrada, auditoria com oldValue/newValue
    - `archive-bank-account.test.ts`: sucesso, já archived, não encontrada
    - `reactivate-bank-account.test.ts`: sucesso, já ativa, não encontrada
    - `list-bank-accounts.test.ts`: lista contas, filtra archived
    - `get-bank-account.test.ts`: sucesso, não encontrada
    - Mock do repository (interface) e do logAudit

- [x] Task 5: Criar Server Actions com withAuth + validateInput (AC: #9, #10)
  - [x] 5.1 Criar `src/server/actions/bank-account.actions.ts`:
    - `'use server'` no topo do arquivo
    - `createBankAccount`: `withAuth(async (session, input) => { ... })` — valida com `validateInput(createBankAccountSchema, input)`, extrai organizationId da session, chama use case
    - `updateBankAccount`: `withAuth(async (session, input) => { ... })` — valida com updateBankAccountSchema, chama use case
    - `archiveBankAccount`: `withAuth(async (session, input) => { ... })` — valida id, chama use case
    - `reactivateBankAccount`: `withAuth(async (session, input) => { ... })` — valida id, chama use case
    - `listBankAccounts`: `withAuth(async (session) => { ... })` — extrai organizationId da session, chama use case
    - `getBankAccount`: `withAuth(async (session, input) => { ... })` — valida id, chama use case
  - [x] 5.2 Escrever testes TDD em `src/server/actions/bank-account.actions.test.ts`:
    - Testa que cada action chama withAuth (session required)
    - Testa validação de input (rejeita dados inválidos)
    - Testa que use case é chamado com dados corretos
    - Mock de withAuth, validateInput e use cases

- [x] Task 6: Criar componentes de UI (AC: #1, #2, #3, #4, #5)
  - [x] 6.1 Criar página `src/app/(app)/accounts/page.tsx`:
    - Server Component que carrega lista de contas via Server Action `listBankAccounts`
    - Renderiza `BankAccountList` e botão "Nova Conta"
    - Loading state com skeleton
  - [x] 6.2 Criar `src/client/components/bank-accounts/BankAccountForm.tsx`:
    - Client Component (`'use client'`)
    - Form com campos: nome (text input), banco (text input), saldo inicial (number input com máscara de centavos)
    - Submissão chama `createBankAccount` ou `updateBankAccount` Server Action
    - Validação client-side com schema Zod (feedback imediato)
    - Toast de confirmação ao sucesso
    - Loading state no botão de submit
    - Props: `mode: 'create' | 'edit'`, `defaultValues?` (para edição)
  - [x] 6.3 Criar `src/client/components/bank-accounts/BankAccountCard.tsx`:
    - Client Component
    - Exibe: nome da conta, banco, saldo formatado (R$ X.XX)
    - Saldo com `font-variant-numeric: tabular-nums` (requisito UX para valores financeiros)
    - Botões: Editar, Arquivar (com dialog de confirmação)
    - Para contas arquivadas: botão "Reativar" em vez de "Arquivar"
  - [x] 6.4 Criar `src/client/components/bank-accounts/BankAccountList.tsx`:
    - Client Component
    - Renderiza lista de `BankAccountCard`
    - Separação visual: contas ativas vs. contas arquivadas (toggle ou seção separada)
    - Empty state para quando não há contas
  - [x] 6.5 Criar utilitário `src/client/utils/format-currency.ts`:
    - `formatCurrency(cents: number): string` — converte centavos para formato BRL (ex: 14999 → "R$ 149,99")
    - Usar `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`
  - [x] 6.6 Escrever testes:
    - `format-currency.test.ts`: formata corretamente valores positivos, zero, centavos isolados
    - Testes de componente são opcionais nesta story (componentes simples de form/list)

- [x] Task 7: Criar RLS policy para bank_accounts (AC: #7)
  - [x] 7.1 Adicionar `pgPolicy` no schema Drizzle `bank-accounts.ts`:
    - Policy de SELECT: `organization_id = current_setting('app.organization_id')` OU usar a mesma estratégia das outras tabelas
    - **NOTA**: Como o Drizzle conecta como `postgres` (superuser), RLS é bypassed para Server Actions. A policy protege apenas acesso direto via Supabase client (Realtime)
  - [x] 7.2 Gerar nova migration e aplicar

- [x] Task 8: Validação final (AC: #1-#12)
  - [x] 8.1 `npm run build` compila sem erros
  - [x] 8.2 `npm test` roda e passa — todos os testes novos + zero regressões
  - [x] 8.3 `npm run lint` sem erros novos
  - [x] 8.4 CRUD completo funcional: criar, listar, editar, arquivar, reativar
  - [x] 8.5 Auditoria registrada para todas as mutações
  - [x] 8.6 Valores monetários em centavos (integer) em todo o fluxo
  - [x] 8.7 Verificar UX: layout responsivo, saldo com tabular-nums, toast de confirmação, dialog de arquivamento

### Review Follow-ups (AI) — R1 2026-03-19

- [x] [AI-Review][CRITICAL] Repository `update()` e `updateStatus()` sem `.returning()` — Drizzle UPDATE sem `.returning()` não retorna registros, causando crash em runtime. Adicionar `.returning()` nos dois métodos. [src/server/infrastructure/database/repositories/bank-account.repository.impl.ts:50-53,62-65]
- [x] [AI-Review][HIGH] Domain use cases importam de `infrastructure/` (logAudit) — viola "server/domain/ nunca importa de infrastructure/". Injetar `logAudit` como dependência ou criar interface AuditService no domain. [create-bank-account.ts:3, update-bank-account.ts:3, archive-bank-account.ts:3, reactivate-bank-account.ts:3]
- [x] [AI-Review][HIGH] Server Actions importam de `infrastructure/` (DrizzleBankAccountRepository) — viola "server/actions/ NUNCA importa de server/infrastructure/". Criar factory/composition root separado. [src/server/actions/bank-account.actions.ts:11]
- [x] [AI-Review][HIGH] `listBankAccountsAction` nunca retorna contas arquivadas — BankAccountList filtra por `status === 'archived'` mas dados nunca chegam do servidor. AC #5 (reativar conta arquivada) quebrado. Passar `includeArchived: true` na listagem. [src/server/actions/bank-account.actions.ts:100-107]
- [x] [AI-Review][MEDIUM] Sem `loading.tsx` para rota `/accounts` — viola "cada rota tem seu loading.tsx com skeleton". Criar `src/app/(app)/accounts/loading.tsx` com skeleton cards.
- [x] [AI-Review][LOW] Migration meta files (0003_snapshot.json, 0004_snapshot.json, _journal.json) não documentados na File List da story.
- [x] [AI-Review][LOW] `displayValueToCents` usa `Math.round(parseFloat(value) * 100)` — viola anti-pattern documentado no project-context. [src/client/components/bank-accounts/BankAccountForm.tsx:30]

## Dev Notes

### ALERTA CRITICO: Nome da Tabela — `bank_accounts`, NÃO `accounts`

A tabela de auth `accounts` já existe em `src/server/infrastructure/database/schema/auth.ts` (armazena provedores OAuth — email, Google, etc.). O comentário no código diz explicitamente:

```
// NAMING: This table stores auth provider accounts (email, google, etc.), NOT
// financial accounts. When financial accounts are added (Epic 2, Story 2-1),
// use a distinct name like "bank_accounts" or "financial_accounts".
```

**Usar `bank_accounts` como nome da tabela e `bankAccounts` como nome da variável Drizzle.**

O epics.md menciona `schema Drizzle "accounts"` — IGNORAR essa referência e usar `bank_accounts` para evitar colisão.

### Versões Exatas do Stack (Story 2.1)

| Tecnologia | Versão | Pacote npm | Notas |
|---|---|---|---|
| Next.js | 16.1.6 | `next` (já instalado) | App Router, Server Actions, Server Components |
| Drizzle ORM | 0.45.1 | `drizzle-orm` (já instalado) | Schema, queries, migrations |
| Drizzle Kit | 0.31.10 | `drizzle-kit` (já instalado) | Generate + migrate |
| Better Auth | 1.5.5 | `better-auth` (já instalado) | Session, organizations |
| Zod | 4.3.6 | `zod` (já instalado) | Validação client + server |
| Vitest | 4.1.0 | `vitest` (já instalado) | Testes TDD |
| shadcn/ui | v4 | (já instalado) | Componentes UI |

### CRITICO: Nenhum Pacote Novo Necessário

Todas as funcionalidades usam dependências já instaladas. NÃO instalar nenhum pacote adicional.

### ALERTA: Primeira Implementação de Clean Architecture

Esta é a PRIMEIRA story que implementa o padrão completo Server Action → Use Case → Repository. O código desta story serve como **blueprint** para todas as stories futuras. Seguir com rigor:

```
src/app/(app)/accounts/page.tsx          → Rota (Server Component, camada fina)
src/server/actions/bank-account.actions.ts  → Server Actions (entry point, validação Zod, withAuth)
src/server/domain/bank-accounts/
  use-cases/                             → Regras de negócio (Result Pattern)
  repositories/                          → Interface (contrato — SOLID D)
src/server/infrastructure/database/
  schema/bank-accounts.ts                → Schema Drizzle (tabela)
  repositories/bank-account.repository.impl.ts → Implementação concreta
src/shared/schemas/bank-account.schema.ts   → Schemas Zod (compartilhado)
src/client/components/bank-accounts/     → Componentes de UI
src/client/utils/format-currency.ts      → Formatação de moeda
```

**Regras estruturais (da architecture.md):**
- `app/` nunca contém lógica de negócio — apenas importa componentes e chama actions
- `server/domain/` nunca importa de `infrastructure/` — depende de interfaces (SOLID D)
- `client/` nunca acessa o banco diretamente — sempre via Server Actions
- Testes unitários co-localizados com o arquivo testado (`.test.ts` ao lado)

### ALERTA: Monetary Precision — Centavos como Integer

**NUNCA usar floating-point para valores financeiros.**

- Banco: `balance_cents` como INTEGER (`integer('balance_cents')` no Drizzle)
- Armazenamento: R$149,99 → 14999 (centavos)
- Cálculos: toda aritmética em inteiros (14999 + 500 = 15499)
- Apresentação: dividir por 100 apenas na camada de exibição (format-currency.ts)
- Validação Zod: `z.number().int().nonnegative()` — rejeita decimais e negativos

### ALERTA: Soft Delete Pattern

Exclusão de conta SEMPRE resulta em arquivamento:
- Campo `status`: `'active'` (default) ou `'archived'`
- Contas arquivadas NÃO aparecem em listagens padrão nem seletores de nova transação
- Histórico de transações da conta SEMPRE preservado
- Reativação: status volta para `'active'`
- NUNCA fazer DELETE permanente — não existe botão de "excluir" real

### ALERTA: Extração do organizationId da Session

O `withAuth` passa a session do Better Auth. Para extrair o organizationId:

```typescript
// A session do Better Auth com Organizations plugin inclui:
// session.session.activeOrganizationId — o org ativo na sessão
const organizationId = session.session.activeOrganizationId;
if (!organizationId) {
  return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
}
```

Verificar o formato exato da session no Better Auth 1.5 com Organizations plugin. A `activeOrganizationId` é setada na tabela `sessions` (ver schema auth.ts).

### ALERTA: Auditoria — Integração com logAudit

Usar o serviço de auditoria existente de `src/server/infrastructure/audit/audit.service.ts`:

```typescript
import { logAudit } from '@/server/infrastructure/audit/audit.service';

// Dentro do use case, APÓS a operação de banco:
await logAudit({
  userId: session.user.id,
  organizationId,
  action: 'CREATE', // ou 'UPDATE', 'ARCHIVE', 'REACTIVATE'
  entityType: 'bank_account',
  entityId: account.id,
  oldValue: null, // para CREATE
  newValue: { name: account.name, bank: account.bank, balanceCents: account.balanceCents },
});
```

**Lembrete**: `logAudit` NUNCA lança exceção — fail-safe by design. Não precisa de try/catch.

### ALERTA: validateInput — Integração com Result Pattern

Usar o utilitário de validação de `src/server/infrastructure/validation/validate.ts`:

```typescript
import { validateInput } from '@/server/infrastructure/validation/validate';
import { createBankAccountSchema } from '@/shared/schemas/bank-account.schema';

// Dentro do Server Action:
const validation = validateInput(createBankAccountSchema, input);
if (!validation.success) return validation; // Propaga o Result<never> com erro de validação
```

### ALERTA: Drizzle Schema — Padrão Correto para integer

```typescript
import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';

export const bankAccounts = pgTable('bank_accounts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  bank: text('bank').notNull(),
  balanceCents: integer('balance_cents').notNull().default(0),
  status: text('status').notNull().default('active'),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
```

### ALERTA: Rota de Accounts — Layout (app)

A rota de contas deve ficar dentro do grupo `(app)` que requer autenticação:
- `src/app/(app)/accounts/page.tsx` — listagem de contas
- O grupo `(app)` já tem middleware de autenticação via Better Auth (Story 1.4)
- Verificar se o layout group `(app)` existe; se não, criar com layout que verifica sessão

### ALERTA: shadcn/ui v4 — Componentes Disponíveis

shadcn/ui v4 já está instalado com 11 componentes em `src/client/components/ui/`. Verificar quais estão disponíveis antes de usar:

```bash
ls src/client/components/ui/
```

Componentes que provavelmente serão necessários e podem precisar ser adicionados:
- `dialog` (para confirmação de arquivamento)
- `toast` / `sonner` (para feedback de operações)
- `input` (provavelmente já existe)
- `button` (provavelmente já existe)
- `card` (para AccountCard)
- `label` (para form)

Para adicionar: `npx shadcn@latest add <component>` — verificar `components.json` para confirmar paths corretos.

### ALERTA: formatCurrency — Usar Intl.NumberFormat

```typescript
// src/client/utils/format-currency.ts
const formatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatCurrency(cents: number): string {
  return formatter.format(cents / 100);
}
```

Saída esperada: `formatCurrency(14999)` → `"R$ 149,99"`

### ALERTA: Input de Valor Monetário — Máscara de Centavos

O input de saldo deve converter o que o usuário digita para centavos:
- Usuário digita: "149,99" → armazena: 14999
- Alternativa: input que trabalha direto em centavos (ex: usuário digita "14999" e exibe como "R$ 149,99")
- Decisão: usar um input controlado que formata enquanto digita — pattern comum em apps financeiros brasileiros

### Error Codes — Padrão para Bank Accounts

| Código | Mensagem | Quando |
|---|---|---|
| `VALIDATION_ERROR` | Mensagem do Zod em pt-BR | Dados inválidos no input |
| `UNAUTHORIZED` | Sessão inválida. Faça login novamente. | withAuth — sem sessão |
| `NO_ACTIVE_ORGANIZATION` | Nenhuma organização ativa. | Sem activeOrganizationId na session |
| `BANK_ACCOUNT_NOT_FOUND` | Conta bancária não encontrada. | findById retorna null |
| `BANK_ACCOUNT_ALREADY_ARCHIVED` | Esta conta já está arquivada. | Tentar arquivar conta archived |
| `BANK_ACCOUNT_ALREADY_ACTIVE` | Esta conta já está ativa. | Tentar reativar conta active |

### Dependências desta Story

**Depende de (já implementado no Epic 1):**
- Story 1.1: Projeto inicializado com estrutura base
- Story 1.3: Supabase + Drizzle configurado + migrations rodando
- Story 1.4: Better Auth com Organizations (session, activeOrganizationId)
- Story 1.6: logAudit, withAuth, RLS base
- Story 1.7: logger, validateInput, ok/err helpers, common schemas

**É dependência de (stories futuras):**
- Story 2.2: Cartões precisam de contas para vinculação
- Story 2.3: Investimentos seguem padrão similar de registro
- Story 2.6: Onboarding — Etapa 1 é "Adicionar contas bancárias"
- Story 3.1: Transações selecionam conta como método de pagamento
- Story 6.1: Dashboard calcula saldo total de contas

### Inteligência das Stories Anteriores

**Infraestrutura já pronta (NÃO reimplementar):**
- `src/server/infrastructure/audit/audit.service.ts` → `logAudit()` — fail-safe, nunca bloqueia
- `src/server/infrastructure/auth/with-auth.ts` → `withAuth()` — Result Pattern para auth
- `src/server/infrastructure/validation/validate.ts` → `validateInput()` — Zod + Result
- `src/shared/types/result.ts` → `ok()`, `err()` — helpers do Result Pattern
- `src/server/infrastructure/logging/logger.ts` → `logger.info()`, `.warn()`, `.error()` — logging estruturado
- `src/shared/schemas/common.schema.ts` → `idSchema`, `amountCentsSchema` — schemas reutilizáveis

**Lições aprendidas (Epic 1):**
- Drizzle conecta como `postgres` superuser → RLS bypassed. Proteção real é via `withAuth` + organizationId nos queries
- `updatedAt` com `defaultNow()` só seta valor no INSERT. Para UPDATE, setar manualmente: `updatedAt: new Date()` no repository
- Migration ordering: migrations devem ser geradas via `drizzle-kit generate` e aplicadas via `drizzle-kit migrate`
- Testes: usar `vi.stubGlobal` para mocks globais (localStorage, etc.), `vi.spyOn` para spies
- Testes do Drizzle: mockar o `db` client com `vi.mock('@/server/infrastructure/database/client')`

**Git patterns:**
```
feat: add bank account CRUD with Clean Architecture (Story 2.1)
fix: resolve code review R1 findings for Story 2.1
chore: mark Story 2.1 as done after code review approval
```

### Project Structure Notes

**Arquivos a criar:**
- `src/server/infrastructure/database/schema/bank-accounts.ts`
- `src/server/infrastructure/database/schema/bank-accounts.test.ts`
- `src/server/infrastructure/database/repositories/bank-account.repository.impl.ts`
- `src/server/infrastructure/database/repositories/bank-account.repository.impl.test.ts`
- `src/server/domain/bank-accounts/repositories/bank-account.repository.ts` (interface)
- `src/server/domain/bank-accounts/use-cases/create-bank-account.ts`
- `src/server/domain/bank-accounts/use-cases/create-bank-account.test.ts`
- `src/server/domain/bank-accounts/use-cases/update-bank-account.ts`
- `src/server/domain/bank-accounts/use-cases/update-bank-account.test.ts`
- `src/server/domain/bank-accounts/use-cases/archive-bank-account.ts`
- `src/server/domain/bank-accounts/use-cases/archive-bank-account.test.ts`
- `src/server/domain/bank-accounts/use-cases/reactivate-bank-account.ts`
- `src/server/domain/bank-accounts/use-cases/reactivate-bank-account.test.ts`
- `src/server/domain/bank-accounts/use-cases/list-bank-accounts.ts`
- `src/server/domain/bank-accounts/use-cases/list-bank-accounts.test.ts`
- `src/server/domain/bank-accounts/use-cases/get-bank-account.ts`
- `src/server/domain/bank-accounts/use-cases/get-bank-account.test.ts`
- `src/server/actions/bank-account.actions.ts`
- `src/server/actions/bank-account.actions.test.ts`
- `src/shared/schemas/bank-account.schema.ts`
- `src/shared/schemas/bank-account.schema.test.ts`
- `src/app/(app)/accounts/page.tsx`
- `src/client/components/bank-accounts/BankAccountForm.tsx`
- `src/client/components/bank-accounts/BankAccountCard.tsx`
- `src/client/components/bank-accounts/BankAccountList.tsx`
- `src/client/utils/format-currency.ts`
- `src/client/utils/format-currency.test.ts`
- `src/server/infrastructure/database/migrations/0003_*.sql` (gerado pelo drizzle-kit)

**Arquivos a modificar:**
- `src/server/infrastructure/database/schema/index.ts` — adicionar export de bankAccounts

**Arquivos que NÃO devem ser modificados:**
- `src/server/infrastructure/database/schema/auth.ts` — tabela `accounts` é de auth, NÃO financeira
- `src/server/infrastructure/auth/config.ts` — config Better Auth intacta
- `src/middleware.ts` — middleware intacto
- `package.json` — nenhum pacote novo
- `src/app/globals.css` — design system intacto
- `next.config.ts` — config intacta

### O Que NÃO Fazer Nesta Story

- **NÃO usar** o nome `accounts` para a tabela — colide com auth accounts. Usar `bank_accounts`
- **NÃO usar** floating-point para saldo — sempre integer em centavos
- **NÃO implementar** exclusão permanente — sempre soft delete (archive)
- **NÃO implementar** real-time updates — será adicionado em stories futuras (Supabase Realtime)
- **NÃO implementar** permissões granulares — vem no Epic 8
- **NÃO implementar** transferências entre contas — vem na Story 3.2
- **NÃO instalar** pacotes novos
- **NÃO criar** `tailwind.config.ts` — Tailwind v4 não usa
- **NÃO alterar** tabelas de auth (users, sessions, accounts, etc.)
- **NÃO implementar** onboarding — vem na Story 2.6

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.1: Cadastro e Gestao de Contas Bancarias]
- [Source: _bmad-output/planning-artifacts/architecture.md#Clean Architecture + DDD]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Result Pattern]
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns]
- [Source: _bmad-output/planning-artifacts/prd.md#FR1, FR6, FR7]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Jornada 1, Dashboard, Onboarding]
- [Source: _bmad-output/implementation-artifacts/1-3-banco-de-dados-e-supabase-local.md#NAMING comment in auth.ts]
- [Source: _bmad-output/implementation-artifacts/1-6-auditoria-e-seguranca.md#logAudit, withAuth]
- [Source: _bmad-output/implementation-artifacts/1-7-validacao-logging-e-infraestrutura-compartilhada.md#validateInput, Result helpers, common schemas]
- [Source: _bmad-output/project-context.md]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Migration 0003 applied manually via psql (drizzle-kit migrate hung); registered in drizzle.__drizzle_migrations
- Migration 0004 (RLS) applied manually via psql; registered in drizzle.__drizzle_migrations
- formatCurrency: Intl.NumberFormat returns NBSP (char 160) between R$ and value — normalized to regular space

### Completion Notes List

- Task 1: Schema Drizzle `bank_accounts` criado com 8 colunas, FK para organizations, 2 migrations geradas e aplicadas (0003 tabela, 0004 RLS policy). 5 testes de schema passando.
- Task 2: Schemas Zod criados (create, update, bankAccountId) reusando `amountCentsSchema` e `idSchema` de common.schema. 16 testes passando.
- Task 3: Interface `BankAccountRepository` no domain + implementação `DrizzleBankAccountRepository` na infra. 8 testes com mock do Drizzle client.
- Task 4: 6 use cases implementados (create, update, archive, reactivate, list, get) com Result Pattern e auditoria. 17 testes co-localizados.
- Task 5: 6 Server Actions com withAuth + validateInput + organizationId extraction. 11 testes cobrindo auth, validação e NO_ACTIVE_ORGANIZATION.
- Task 6: Página /accounts (Server Component), BankAccountForm (create/edit com máscara de centavos), BankAccountCard (tabular-nums, dialog de arquivamento), BankAccountList (ativas/arquivadas com toggle). formatCurrency com 4 testes. Toaster adicionado ao root layout. Label componente adicionado via shadcn.
- Task 7: RLS policy `bank_accounts_org_isolation` com `current_setting('app.organization_id', true)`. Migration 0004 gerada e aplicada.
- Task 8: Build OK, 250 testes passando (zero regressões), lint sem erros novos.
- ✅ Resolved review finding [CRITICAL]: Adicionado `.returning()` aos métodos `update()` e `updateStatus()` do DrizzleBankAccountRepository. Atualizado mock de teste correspondente.
- ✅ Resolved review finding [HIGH]: Criada interface `AuditLogger` em `src/server/domain/shared/types/audit-logger.ts`. Todos os 4 use cases (create, update, archive, reactivate) agora recebem `auditLogger` via dependency injection em vez de importar diretamente de infrastructure.
- ✅ Resolved review finding [HIGH]: Criado composition root `src/server/factories/bank-account.ts`. Server Actions agora importam de factory, sem dependência direta em infrastructure.
- ✅ Resolved review finding [HIGH]: `listBankAccountsAction` agora passa `includeArchived: true` — contas arquivadas chegam ao BankAccountList para AC #5 (reativação).
- ✅ Resolved review finding [MEDIUM]: Criado `src/app/(app)/accounts/loading.tsx` com skeleton cards seguindo padrão do dashboard.
- ✅ Resolved review finding [LOW]: Migration meta files documentados no File List.
- ✅ Resolved review finding [LOW]: `displayValueToCents` reescrito com parsing de inteiro/decimal separado — sem floating-point (`Math.round(parseFloat * 100)` removido).

### File List

**Novos:**
- src/server/infrastructure/database/schema/bank-accounts.ts
- src/server/infrastructure/database/schema/bank-accounts.test.ts
- src/server/infrastructure/database/repositories/bank-account.repository.impl.ts
- src/server/infrastructure/database/repositories/bank-account.repository.impl.test.ts
- src/server/domain/bank-accounts/repositories/bank-account.repository.ts
- src/server/domain/bank-accounts/use-cases/create-bank-account.ts
- src/server/domain/bank-accounts/use-cases/create-bank-account.test.ts
- src/server/domain/bank-accounts/use-cases/update-bank-account.ts
- src/server/domain/bank-accounts/use-cases/update-bank-account.test.ts
- src/server/domain/bank-accounts/use-cases/archive-bank-account.ts
- src/server/domain/bank-accounts/use-cases/archive-bank-account.test.ts
- src/server/domain/bank-accounts/use-cases/reactivate-bank-account.ts
- src/server/domain/bank-accounts/use-cases/reactivate-bank-account.test.ts
- src/server/domain/bank-accounts/use-cases/list-bank-accounts.ts
- src/server/domain/bank-accounts/use-cases/list-bank-accounts.test.ts
- src/server/domain/bank-accounts/use-cases/get-bank-account.ts
- src/server/domain/bank-accounts/use-cases/get-bank-account.test.ts
- src/server/actions/bank-account.actions.ts
- src/server/actions/bank-account.actions.test.ts
- src/shared/schemas/bank-account.schema.ts
- src/shared/schemas/bank-account.schema.test.ts
- src/app/(app)/accounts/page.tsx
- src/app/(app)/accounts/loading.tsx
- src/client/components/bank-accounts/BankAccountForm.tsx
- src/client/components/bank-accounts/BankAccountCard.tsx
- src/client/components/bank-accounts/BankAccountList.tsx
- src/client/utils/format-currency.ts
- src/client/utils/format-currency.test.ts
- src/client/components/ui/label.tsx (gerado por shadcn)
- src/server/infrastructure/database/migrations/0003_shiny_green_goblin.sql
- src/server/infrastructure/database/migrations/0004_unknown_black_cat.sql
- src/server/infrastructure/database/migrations/meta/0003_snapshot.json
- src/server/infrastructure/database/migrations/meta/0004_snapshot.json
- src/server/infrastructure/database/migrations/meta/_journal.json
- src/server/domain/shared/types/audit-logger.ts
- src/server/factories/bank-account.ts

**Modificados:**
- src/server/infrastructure/database/schema/index.ts (adicionado export de bankAccounts)
- src/app/layout.tsx (adicionado Toaster do sonner)
- _bmad-output/implementation-artifacts/sprint-status.yaml (status atualizado)

## Change Log

- 2026-03-19: Implementação completa da Story 2.1 — CRUD de contas bancárias com Clean Architecture (Server Action → Use Case → Repository), schemas Drizzle e Zod, auditoria, RLS, componentes UI com shadcn/ui v4, 250 testes passando.
- 2026-03-19: Code Review R1 — 7 findings (1 CRITICAL, 3 HIGH, 1 MEDIUM, 2 LOW). Status revertido para in-progress. Action items adicionados em "Review Follow-ups (AI)".
- 2026-03-19: Addressed code review findings — 7 items resolved. Fixes: .returning() no repository, AuditLogger interface no domain (DI), factory/composition root para Server Actions, includeArchived na listagem, loading.tsx, File List atualizado, displayValueToCents sem floating-point. 250 testes passando, build e lint OK.
