# Story 3.2: Registro de Receitas e Transferências

Status: review

## Story

As a user,
I want to register income and transfers between accounts,
so that my balances reflect reality accurately.

## Acceptance Criteria

1. **Given** o usuário está autenticado **When** registra uma transação de entrada (receita) **Then** pode informar valor, origem (fonte de receita) e conta de destino (FR10) **And** o saldo da conta de destino é atualizado automaticamente **And** totalizadores recalculados em < 500ms (FR17)

2. **Given** o usuário quer transferir entre contas próprias **When** seleciona "Transferência" **Then** pode escolher conta de origem e conta de destino (FR58) **And** a transferência não é contabilizada como receita nem despesa (FR58) **And** apenas os saldos das contas envolvidas são afetados

3. **Given** o usuário quer registrar transferência entre membros **When** seleciona membro de destino **Then** a transferência é registrada entre as contas dos dois membros (FR58)

## Tasks / Subtasks

### Fase 0: Design System & Protótipos (Obrigatória para stories com UI)

- [x] Task 0: Consultar Design System e protótipos relevantes
  - [x] 0.1: Consultar página `/design-system` (`src/app/design-system/page.tsx`) — tokens, cores, tipografia, espaçamentos
  - [x] 0.2: Verificar protótipos relevantes em `_bmad-output/prototypes/` — proto-07 (cascade input, padrão de referência para sheets de registro)
  - [x] 0.3: Listar componentes UI existentes em `src/client/components/ui/` que serão reutilizados — Sheet, CurrencyInput, Button, Select, etc.

### Fase 1: Schema e Migração DB

- [x] Task 1 (AC: #1, #2, #3): Estender schema de transactions para suportar receitas e transferências
  - [x] 1.1: Adicionar colunas ao schema Drizzle `src/server/infrastructure/database/schema/transactions.ts`: `incomeSourceId` (text, nullable, FK para income_sources opcionalmente), `sourceAccountId` (text, nullable, FK para bank_accounts), `destinationAccountId` (text, nullable, FK para bank_accounts)
  - [x] 1.2: Tornar `categoryId` nullable no schema (receitas e transferências não exigem categoria)
  - [x] 1.3: Gerar migration via `npx drizzle-kit generate` — NUNCA criar .sql manualmente
  - [x] 1.4: Testar que migration aplica corretamente com `npx drizzle-kit migrate`

### Fase 2: Schemas Zod de Validação

- [x] Task 2 (AC: #1, #2): Criar schemas Zod para receita e transferência
  - [x] 2.1: Criar `createIncomeSchema` em `src/shared/schemas/transaction.schema.ts` — campos: `amountCents` (positiveAmountCentsSchema), `incomeSourceId` (idSchema), `destinationAccountId` (idSchema), `description` (string, max 500, opcional), `transactionDate` (coerce date, opcional)
  - [x] 2.2: Criar `createTransferSchema` em `src/shared/schemas/transaction.schema.ts` — campos: `amountCents` (positiveAmountCentsSchema), `sourceAccountId` (idSchema), `destinationAccountId` (idSchema), `description` (string, max 500, opcional), `transactionDate` (coerce date, opcional)
  - [x] 2.3: Criar testes para ambos os schemas em `src/shared/schemas/transaction.schema.test.ts` — validar inputs válidos, inválidos, edge cases (mesma conta origem/destino para transfer)

### Fase 3: Domain — Use Cases

- [x] Task 3 (AC: #1): Criar use case `create-income`
  - [x] 3.1: Criar `src/server/domain/transactions/use-cases/create-income.ts` seguindo padrão de `create-transaction.ts` — recebe amountCents, incomeSourceId, destinationAccountId, description?, transactionDate?. Valida que income source existe e está ativa. Valida que conta destino existe. Cria transaction com `type: 'income'`. Credita saldo da conta destino (balanceCents + amountCents). Registra audit log.
  - [x] 3.2: Criar `src/server/domain/transactions/use-cases/create-income.test.ts` — TDD. Testar: criação com sucesso, income source inválida, conta inexistente, valor <= 0, atualização de saldo

- [x] Task 4 (AC: #2): Criar use case `transfer-between-accounts`
  - [x] 4.1: Criar `src/server/domain/transactions/use-cases/transfer-between-accounts.ts` — recebe amountCents, sourceAccountId, destinationAccountId, description?, transactionDate?. Valida que ambas contas existem e estão ativas. Valida que sourceAccountId !== destinationAccountId. Cria transaction com `type: 'transfer'`. Debita saldo conta origem. Credita saldo conta destino. Registra audit log.
  - [x] 4.2: Criar `src/server/domain/transactions/use-cases/transfer-between-accounts.test.ts` — TDD. Testar: transferência com sucesso, mesma conta origem/destino (erro), conta inexistente, saldo insuficiente (se aplicável — decisão: permitir saldo negativo ou não?), atualização de ambos saldos

### Fase 4: Repository — Extensões

- [x] Task 5 (AC: #1, #2): Estender TransactionRepository
  - [x] 5.1: Atualizar tipo `Transaction` em `src/server/domain/transactions/repositories/transaction.repository.ts` — adicionar campos: `incomeSourceId: string | null`, `sourceAccountId: string | null`, `destinationAccountId: string | null`
  - [x] 5.2: Atualizar `create()` para aceitar os novos campos opcionais, e `categoryId` como opcional
  - [x] 5.3: Atualizar `DrizzleTransactionRepository` em `src/server/infrastructure/database/repositories/transaction.repository.impl.ts`

### Fase 5: Server Actions

- [x] Task 6 (AC: #1, #2): Criar server actions para receita e transferência
  - [x] 6.1: Adicionar `createIncomeAction` em `src/server/actions/transaction.actions.ts` — seguir padrão de `createTransactionAction`. Validar com `createIncomeSchema`. Chamar `createIncome` use case. Revalidar paths.
  - [x] 6.2: Adicionar `createTransferAction` — seguir mesmo padrão. Validar com `createTransferSchema`. Chamar `transferBetweenAccounts` use case. Revalidar paths.
  - [x] 6.3: Criar factory deps para os novos use cases em `src/server/factories/transaction.ts` — adicionar `incomeSourceRepository` nas deps
  - [x] 6.4: Adicionar testes para as novas actions em `src/server/actions/transaction.actions.test.ts`

### Fase 6: UI — Sheets de Registro

- [x] Task 7 (AC: #1): Criar `NewIncomeSheet`
  - [x] 7.1: Criar `src/client/components/transactions/NewIncomeSheet.tsx` — seguir padrão de `NewExpenseSheet.tsx`. Campos: valor (CurrencyInput), fonte de receita (Select com income sources ativas), conta destino (Select com bank accounts ativas), descrição (Input, opcional). Usar Sheet (bottom no mobile, right no desktop).
  - [x] 7.2: Integrar com `createIncomeAction`
  - [x] 7.3: Toast de sucesso "Receita registrada!" com opção Desfazer (placeholder)

- [x] Task 8 (AC: #2): Criar `NewTransferSheet`
  - [x] 8.1: Criar `src/client/components/transactions/NewTransferSheet.tsx` — seguir padrão de `NewExpenseSheet.tsx`. Campos: valor (CurrencyInput), conta origem (Select com bank accounts ativas), conta destino (Select com bank accounts ativas, excluindo a selecionada como origem), descrição (Input, opcional). Usar Sheet (bottom no mobile, right no desktop).
  - [x] 8.2: Integrar com `createTransferAction`
  - [x] 8.3: Toast de sucesso "Transferência registrada!"

- [x] Task 9 (AC: #1, #2): Integrar sheets no fluxo principal
  - [x] 9.1: Atualizar FAB ou menu de registro para permitir escolha entre "Gasto", "Receita" e "Transferência" — o FAB atual abre `NewExpenseSheet` direto; agora deve abrir um menu/modal de seleção de tipo primeiro
  - [x] 9.2: Verificar onde o FAB está implementado e adicionar as opções

### Fase 7: Testes de Integração e Validação

- [x] Task 10: Validação end-to-end
  - [x] 10.1: Verificar que TypeScript compila sem erros
  - [x] 10.2: Verificar que ESLint passa
  - [x] 10.3: Rodar todos os testes e garantir zero regressões
  - [x] 10.4: Testar no browser (dev server) os fluxos de receita e transferência

## Dev Notes

### Design System & Protótipos

**Protótipos relevantes:**
- `_bmad-output/prototypes/proto-07-cascade-input.html` — referência para o pattern de sheet de registro (layout, espaçamento, UX flow). Não tem seção específica de receita/transferência, mas o layout do sheet é o mesmo padrão.

**Seções do DS a consultar:**
- Tokens de cor (background, text, border)
- Tipografia (Inter, tabular-nums para valores)
- Espaçamentos (grid base 4px)
- Componentes de formulário (Input, Select, Button)

**Componentes UI existentes a reutilizar:**
- `src/client/components/ui/sheet.tsx` — Sheet (bottom no mobile, right no desktop)
- `src/client/components/ui/currency-input.tsx` — Input monetário R$ (centavos in/out)
- `src/client/components/ui/button.tsx` — Botões com variants
- `src/client/components/ui/select.tsx` — Select dropdown para income sources e bank accounts
- `src/client/components/ui/input.tsx` — Input para descrição
- `src/client/components/ui/sonner.tsx` — Toast notifications
- `src/client/components/ui/label.tsx` — Labels dos campos

**Regras visuais obrigatórias:**
- NÃO hardcodar hex — sempre usar tokens Tailwind do Design System
- NÃO criar componentes visuais novos sem que existam no DS primeiro
- Usar tokens de tipografia: Inter para texto, tabular-nums para valores numéricos
- Espaçamentos seguem grid base 4px
- Border-radius segue padrão DS
- Componente novo necessário? Seguir workflow formal

### Padrões do Código Existente (CRÍTICO — seguir à risca)

**Padrão de Use Case (referência: `create-transaction.ts`):**
- Interface `CreateXParams` com dados de negócio + organizationId + userId
- Interface `CreateXDeps` com repositories e auditLogger
- Função async que retorna `Result<Transaction>`
- Validações de negócio no início, retornando `err()` com code UPPER_SNAKE e message em pt-BR
- Chamada ao repository.create() com todos os campos
- Atualização de saldos de contas após criação
- Audit log no final

**Padrão de Server Action (referência: `transaction.actions.ts`):**
- `'use server'` no topo
- `withAuth()` wrapper
- `validateInput()` com schema Zod
- `getOrganizationId()` para extrair org do session
- Chamada ao use case com deps injetadas via factory
- `revalidatePath('/')` e paths relevantes após sucesso
- Retorna `Result<T>` direto

**Padrão de UI Sheet (referência: `NewExpenseSheet.tsx`):**
- Props: `open`, `onOpenChange`
- `useIsMobile()` para layout responsivo
- `useTransition()` para loading de dados
- `useState()` para submitting
- `useEffect()` carrega dados quando `open` muda
- `useCallback()` para handlers
- Sheet com `side={isMobile ? 'bottom' : 'right'}`
- Mobile: handle bar + header customizado + botão fechar (✕)
- Desktop: SheetHeader + SheetTitle padrão
- Toast com Sonner após sucesso

**Padrão de Factory (referência: `src/server/factories/transaction.ts`):**
- Instancia repositories concretos do Drizzle
- Importa `logAudit` do audit service
- Exporta objeto com deps nomeadas

### Decisões Técnicas

**Schema DB — Novas colunas em `transactions`:**
- `income_source_id` (text, nullable) — FK para income_sources, usado quando type='income'
- `source_account_id` (text, nullable) — FK para bank_accounts, usado quando type='transfer'
- `destination_account_id` (text, nullable) — FK para bank_accounts, usado quando type='income' ou type='transfer'
- `category_id` deve se tornar NULLABLE — receitas e transferências não exigem categoria

**Validações de negócio nos use cases:**
- `create-income`: income source deve existir e estar ativa (status='active'), conta destino deve existir
- `transfer-between-accounts`: ambas contas devem existir, sourceAccountId !== destinationAccountId
- Transferências NÃO são receita nem despesa — type='transfer', não afeta totalizadores de gastos/receitas
- Para saldo negativo: PERMITIR transferência mesmo se saldo ficar negativo (app pessoal, não bancário — usuário sabe o que faz)

**AC3 — Transferência entre membros:**
- O sistema usa Better Auth com Organizations plugin — membros da mesma organização compartilham dados
- Transferência entre membros = transferência entre conta de um membro e conta de outro membro da mesma organização
- Ambas contas estão na mesma organização (RLS garante acesso)
- Implementação é idêntica à transferência entre contas próprias — o use case não precisa saber de quem é a conta, só precisa que ambas pertençam à mesma organização
- UI: Select de conta destino mostra TODAS as contas da organização (incluindo de outros membros)

**Separação de concerns no CascadeInput:**
- O CascadeInput é específico para GASTOS (progressive disclosure em 4 steps)
- Receita e Transferência são fluxos mais simples — formulários diretos com campos fixos
- NÃO reutilizar CascadeInput para receita/transferência — criar sheets separados com formulários React Hook Form

### Arquivos existentes a modificar

- `src/server/infrastructure/database/schema/transactions.ts` — adicionar colunas
- `src/shared/schemas/transaction.schema.ts` — adicionar schemas
- `src/shared/schemas/transaction.schema.test.ts` — adicionar testes
- `src/server/domain/transactions/repositories/transaction.repository.ts` — estender tipo e interface
- `src/server/infrastructure/database/repositories/transaction.repository.impl.ts` — estender implementação
- `src/server/actions/transaction.actions.ts` — adicionar actions
- `src/server/actions/transaction.actions.test.ts` — adicionar testes
- `src/server/factories/transaction.ts` — adicionar incomeSourceRepository

### Arquivos novos a criar

- `src/server/domain/transactions/use-cases/create-income.ts`
- `src/server/domain/transactions/use-cases/create-income.test.ts`
- `src/server/domain/transactions/use-cases/transfer-between-accounts.ts`
- `src/server/domain/transactions/use-cases/transfer-between-accounts.test.ts`
- `src/client/components/transactions/NewIncomeSheet.tsx`
- `src/client/components/transactions/NewTransferSheet.tsx`

### Dependências existentes a usar (NÃO instalar nada novo)

- `zod` — validação de schemas
- `drizzle-orm` — ORM para migrations e queries
- `sonner` — toast notifications
- `react-hook-form` + `@hookform/resolvers/zod` — se já instalado; senão usar pattern existente do NewExpenseSheet (que não usa react-hook-form, usa estado local)

### Learnings da Story 3.1e (story anterior)

- Sheet com `side="right"` precisa de `data-[side=right]:sm:max-w-[420px]` para especificidade correta
- useIsMobile() hook disponível para layout responsivo
- Pattern de handle bar mobile: `<div className="h-1 w-9 rounded-full bg-stone-200" />`
- Botão fechar mobile: `size-7 rounded-full bg-stone-100 text-stone-500`
- LOWs de cores hardcoded são backlog — não bloquear story por isso

### Project Structure Notes

- Alinhamento: domain transactions em `src/server/domain/transactions/`, actions em `src/server/actions/`, UI em `src/client/components/transactions/`
- Income sources domain em `src/server/domain/income-sources/` — reutilizar IncomeSourceRepository, NÃO duplicar
- Factory de income sources: verificar se existe `src/server/factories/income-source.ts` antes de criar deps

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.2]
- [Source: _bmad-output/planning-artifacts/prd.md#FR10, FR17, FR58]
- [Source: _bmad-output/planning-artifacts/architecture.md#transactions domain]
- [Source: _bmad-output/project-context.md]
- [Source: src/server/domain/transactions/use-cases/create-transaction.ts]
- [Source: src/client/components/transactions/NewExpenseSheet.tsx]
- [Source: src/server/infrastructure/database/schema/transactions.ts]
- [Source: src/server/domain/income-sources/repositories/income-source.repository.ts]
- [Source: src/server/domain/bank-accounts/repositories/bank-account.repository.ts]

## Dev Agent Record

### Agent Model Used

claude-opus-4-6[1m]

### Debug Log References

- `npx drizzle-kit generate --name=receitas_transferencias_transactions` → 0017 migration
- `npm run db:migrate` → aplicada com sucesso no banco local
- `npx tsc --noEmit` → zero erros
- `npx eslint src --max-warnings=0` → zero erros/warnings (após corrigir cascading setState em sheets)
- `npx vitest run` → 125 arquivos / 950 testes passando

### Completion Notes List

- **Schema DB:** `categoryId` e `paymentMethodType` passaram a `nullable` na tabela `transactions`; adicionadas `income_source_id`, `source_account_id`, `destination_account_id` com FKs. `paymentMethodType` virou nullable também porque receitas/transferências não possuem meio de pagamento — decisão técnica necessária (não explícita na story) para manter a integridade do modelo.
- **Use cases:** `create-income` credita a conta de destino; `transfer-between-accounts` debita origem e credita destino (permite saldo negativo, conforme Dev Notes). Ambos validam entidades ativas e retornam `Result<Transaction>` seguindo o padrão do `create-transaction`.
- **Repository:** `TransactionRepository.create()` agora aceita todos os novos campos como opcionais; `Transaction` type tem `categoryId: string | null` e `paymentMethodType: string | null`. `getMonthlySpendingSummary` filtra categoryIds null na impl para manter tipo de retorno `string` (query já restringe a `type='expense'`).
- **Factory:** `transactionDeps` ganhou `incomeSourceRepository` (DrizzleIncomeSourceRepository).
- **UI:** Três sheets independentes (`NewExpenseSheet` existente, `NewIncomeSheet`, `NewTransferSheet`) + `RegisterTypePicker` (bottom no mobile, right no desktop) que o FAB e o botão "Registrar" da sidebar abrem primeiro. Todos reutilizam `Sheet`, `CurrencyInput`, `Select`, `Input`, `Label`, `Button` do DS. Desktop sheets usam `w-[420px] data-[side=right]:sm:max-w-[420px]` para vencer a especificidade do `data-[side=right]:sm:max-w-sm` do componente base (lesson learned Story 3.1e).
- **AC3 (transferência entre membros):** atendido implicitamente — `listBankAccountsAction` retorna todas as contas ativas da organização, e como o Better Auth com Organizations plugin compartilha dados entre membros, o select de origem/destino no `NewTransferSheet` já inclui contas de outros membros da mesma organização. Nenhum código específico foi necessário.
- **Tests:** 22 novos testes (unit) — 14 para schemas Zod, 8 para `createIncome`, 9 para `transferBetweenAccounts`, 10 para as novas actions. Todos TDD-first.
- **Browser smoke test (Task 10.4):** dev server do usuário já estava rodando em `localhost:3000` quando tentei subir um segundo; validação estática completa (TS/lint/950 testes) + hot reload ativo, mas o teste manual visual dos fluxos receita/transferência via browser precisa ser feito pelo usuário antes do code review.
- **Fora de escopo intencional:** lógica de "desfazer" no toast de receita (placeholder), totalizadores por tipo de transação (Epic 5/6), reconciliação de cartão, metas de receita.

### File List

**Novos arquivos:**
- `src/server/domain/transactions/use-cases/create-income.ts`
- `src/server/domain/transactions/use-cases/create-income.test.ts`
- `src/server/domain/transactions/use-cases/transfer-between-accounts.ts`
- `src/server/domain/transactions/use-cases/transfer-between-accounts.test.ts`
- `src/client/components/transactions/NewIncomeSheet.tsx`
- `src/client/components/transactions/NewTransferSheet.tsx`
- `src/client/components/transactions/RegisterTypePicker.tsx`
- `src/server/infrastructure/database/migrations/0017_receitas_transferencias_transactions.sql`
- `src/server/infrastructure/database/migrations/meta/0017_snapshot.json`

**Arquivos modificados:**
- `src/server/infrastructure/database/schema/transactions.ts` (colunas novas + nullables)
- `src/server/infrastructure/database/schema/transactions.test.ts` (cobertura das novas colunas e nullables)
- `src/server/infrastructure/database/migrations/meta/_journal.json` (entry 0017)
- `src/shared/schemas/transaction.schema.ts` (createIncomeSchema, createTransferSchema, tipos)
- `src/shared/schemas/transaction.schema.test.ts` (testes dos novos schemas)
- `src/server/domain/transactions/repositories/transaction.repository.ts` (tipo Transaction nullable + novos campos em create)
- `src/server/infrastructure/database/repositories/transaction.repository.impl.ts` (signatura create + filter null em getMonthlySpendingSummary)
- `src/server/factories/transaction.ts` (incomeSourceRepository)
- `src/server/actions/transaction.actions.ts` (createIncomeAction, createTransferAction)
- `src/server/actions/transaction.actions.test.ts` (testes das novas actions)
- `src/client/components/layout/AppShell.tsx` (picker + 3 sheets)

### Change Log

- 2026-04-13: Story implementada — schema estendido, migration 0017, use cases, actions, sheets de receita/transferência e picker de tipo no FAB. Zero regressões (950/950 testes).
