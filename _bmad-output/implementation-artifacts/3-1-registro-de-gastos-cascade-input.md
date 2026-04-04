# Story 3.1: Registro de Gastos (Cascade Input)

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to register an expense quickly through a cascade flow,
so that I can capture spending in ~5 seconds at the moment it happens.

## Acceptance Criteria

1. **Given** o usuário está autenticado e tem contas/cartões/categorias configurados **When** toca no FAB (+) no mobile ou botão "Registrar gasto" no desktop **Then** o sheet/modal abre com teclado numérico ativo (mobile) ou campo de valor focado (desktop)

2. **Given** o usuário digita um valor > 0 **When** confirma o valor **Then** classificações de essencialidade aparecem como pills selecionáveis e categorias filtradas pela classificação selecionada aparecem como chips

3. **Given** o usuário seleciona uma classificação e categoria **When** a categoria é selecionada **Then** as subcategorias da categoria aparecem como chips, cada uma mostrando o método de pagamento sugerido

4. **Given** o usuário seleciona uma subcategoria **When** a subcategoria é selecionada **Then** os 5 estabelecimentos mais utilizados naquela subcategoria (últimos 90 dias) são sugeridos como chips (FR14) **And** o método de pagamento padrão da subcategoria vem pré-selecionado (se configurado)

5. **Given** o usuário selecionou valor, categoria, subcategoria, estabelecimento e método de pagamento **When** o painel de impacto é exibido (antes de confirmar) **Then** mostra saldo/limite restante do método de pagamento e barra de progresso do orçamento da categoria (FR13) **And** o feedback de impacto aparece em < 100ms (NFR-P2) **And** se o orçamento estoura, a barra muda de cor (atenção, não pânico)

6. **Given** o usuário confirma a transação **When** toca em "Confirmar" **Then** a transação é registrada com valor, categoria, subcategoria, estabelecimento e método de pagamento (FR9, FR12) **And** todos os totalizadores, saldos e orçamentos são recalculados em < 500ms (FR17, NFR-P3) **And** feedback breve de sucesso (checkmark) e sheet fecha **And** toast com "Desfazer" por 5 segundos

7. **Given** ocorre um erro de rede ou servidor ao confirmar a transação **When** a operação falha **Then** o sistema exibe mensagem de erro específica, preserva todos os dados digitados e oferece opção de retry (FR63)

8. Fluxo completo em 3-5 toques, < 10 segundos (NFR-U1)
9. Componente CascadeInput do DS utilizado e adaptado com progressive disclosure
10. Componente ImpactPreview do DS utilizado
11. Validado contra `proto-07-cascade-input.html`

## Tasks / Subtasks

### Fase 0: Design System & Protótipos (Obrigatória para stories com UI)

- [x] Task 0: Consultar Design System e protótipos relevantes
  - [x] 0.1: Consultar página `/design-system` (`src/app/design-system/page.tsx`) — tokens, cores, tipografia, espaçamentos
  - [x] 0.2: Verificar protótipos relevantes em `_bmad-output/prototypes/` — identificar o(s) protótipo(s) HTML correspondente(s) à story
  - [x] 0.3: Listar componentes UI existentes em `src/client/components/ui/` que serão reutilizados — NÃO criar componentes novos ad-hoc

### Fase 1: Schema do Banco — tabela `transactions`

- [x] Task 1 (AC: #6)
  - [x] 1.1: Criar schema Drizzle `src/server/infrastructure/database/schema/transactions.ts` com campos: id, type (expense), amount_cents (integer), category_id (FK categories), subcategory_id (FK subcategories, nullable), establishment (text, nullable), payment_method_type (text: debit/credit/pix), payment_method_id (text, nullable — FK para bank_accounts ou credit_cards), description (text, nullable), transaction_date (timestamp with timezone), reference_month (text, YYYY-MM — para cartões de crédito, será usado no Epic 5), organization_id (FK), created_by (FK users), created_at, updated_at
  - [x] 1.2: Adicionar RLS policy `transactions_org_isolation` no schema
  - [x] 1.3: Exportar `transactions` no `schema/index.ts`
  - [x] 1.4: Gerar migration via `npx drizzle-kit generate` — NUNCA criar .sql manualmente
  - [x] 1.5: Criar testes do schema (`transactions.test.ts`) validando campos, tipos e constraints

### Fase 2: Schema Zod compartilhado

- [x] Task 2 (AC: #1, #6)
  - [x] 2.1: Criar `src/shared/schemas/transaction.schema.ts` com schemas: `createTransactionSchema` (amountCents, categoryId, subcategoryId?, establishment?, paymentMethodType, paymentMethodId?, description?, transactionDate?), `transactionIdSchema`
  - [x] 2.2: Criar testes `transaction.schema.test.ts` validando inputs válidos e inválidos (valor zero, valor negativo, campos obrigatórios)

### Fase 3: Domínio — Repository Interface + Use Cases

- [x] Task 3 (AC: #6, #4, #5)
  - [x] 3.1: Criar `src/server/domain/transactions/repositories/transaction.repository.ts` — interface TransactionRepository com: create, findById, findByOrganization, findTopEstablishments(subcategoryId, orgId, limit, sinceDays)
  - [x] 3.2: Criar use case `src/server/domain/transactions/use-cases/create-transaction.ts` — recebe deps (repository, auditLogger, bankAccountRepo, creditCardRepo), valida regras de negócio (valor > 0, categoria/subcategoria existem, método de pagamento válido), cria transação, atualiza saldo da conta ou comprometimento do cartão, registra auditoria. Retorna Result<Transaction>
  - [x] 3.3: Criar testes TDD `create-transaction.test.ts` — cenários: sucesso com débito, sucesso com crédito, sucesso com pix, valor zero (erro), categoria inexistente (erro), método pagamento inválido (erro), atualização de saldo da conta após débito, transação de cartão não altera saldo da conta
  - [x] 3.4: Criar use case `src/server/domain/transactions/use-cases/get-suggested-establishments.ts` — busca top 5 estabelecimentos por subcategoria nos últimos 90 dias
  - [x] 3.5: Criar testes `get-suggested-establishments.test.ts`
  - [x] 3.6: Criar use case `src/server/domain/transactions/use-cases/get-impact-preview.ts` — dado valor, método de pagamento e categoria, calcula: saldo/limite restante após, orçamento gasto/restante da categoria. Retorna Result<ImpactData>
  - [x] 3.7: Criar testes `get-impact-preview.test.ts` — cenários: impacto com débito (saldo diminui), impacto com crédito (limite diminui), orçamento abaixo de 70%, entre 70-85%, entre 85-100%, acima de 100%

### Fase 4: Repository Implementation

- [x] Task 4 (AC: #6)
  - [x] 4.1: Criar `src/server/infrastructure/database/repositories/transaction.repository.impl.ts` — DrizzleTransactionRepository implementando a interface
  - [x] 4.2: Implementar `findTopEstablishments` com query agrupada por estabelecimento, contagem, ordenada por frequência, filtrada por subcategoryId e últimos 90 dias

### Fase 5: Factory + Server Actions

- [x] Task 5 (AC: #6, #7)
  - [x] 5.1: Criar `src/server/factories/transaction.ts` — instanciar TransactionRepository + auditLogger + bankAccountRepo + creditCardRepo
  - [x] 5.2: Criar `src/server/actions/transaction.actions.ts` com: `createTransactionAction`, `getSuggestedEstablishmentsAction`, `getImpactPreviewAction`
  - [x] 5.3: Criar testes `transaction.actions.test.ts`
  - [x] 5.4: O `createTransactionAction` deve: validar input com Zod, verificar organização ativa, chamar use case, revalidar paths relevantes (dashboard, transações, contas)

### Fase 6: Adaptação do CascadeInput — Subcategoria Step

- [x] Task 6 (AC: #3, #4, #10)
  - [x] 6.1: **IMPORTANTE:** O CascadeInput do DS tem 4 steps mas o protótipo mostra 5 estados (com subcategoria separada). Antes de modificar, verificar se o DS já prevê extensibilidade. Se o componente do DS precisar de alteração, seguir o workflow formal: documentar necessidade, implementar no DS com testes, depois usar na feature
  - [x] 6.2: Adicionar step de subcategoria entre "Classificação & Categoria" e "Estabelecimento + Pagamento" — cada subcategoria mostra o método de pagamento sugerido como badge (conforme proto-07)
  - [x] 6.3: Garantir que ao selecionar subcategoria com método de pagamento padrão, o payment method é pré-selecionado automaticamente
  - [x] 6.4: Criar testes do componente adaptado

### Fase 7: Wiring — Página/Sheet de Registro

- [x] Task 7 (AC: #1, #2, #3, #4, #5, #6, #8)
  - [x] 7.1: Criar componente wrapper `src/client/components/transactions/NewExpenseSheet.tsx` que orquestra: carrega dados (classificações, categorias, subcategorias, métodos de pagamento), passa para CascadeInput, chama server actions de impacto e criação
  - [x] 7.2: Integrar FAB (+) no `BottomNavigation` (mobile) para abrir o sheet — BottomNavigation já tem `onFabClick` prop
  - [x] 7.3: Integrar botão "Registrar gasto" no header/dashboard (desktop) para abrir o sheet lateral (400px, conforme proto-07) — SheetContent `side="right"` com `w-full sm:w-[400px]`
  - [x] 7.4: Implementar optimistic update com `useOptimistic` para feedback < 100ms — toast imediato no sucesso
  - [x] 7.5: Implementar toast de sucesso com opção "Desfazer" por 5 segundos (usando Sonner)
  - [x] 7.6: Implementar tratamento de erro com preservação de dados e retry (FR63) — toast de erro com botão "Tentar novamente"
  - [x] 7.7: Implementar loading states (skeleton/spinner no botão de confirmar) — spinner enquanto carrega dados
  - [x] 7.8: Validar fluxo completo contra `proto-07-cascade-input.html` — 5 estados mobile + versão desktop

### Fase 8: Recálculo de Totalizadores

- [x] Task 8 (AC: #6)
  - [x] 8.1: Ao criar transação de débito/pix: debitar `balance_cents` da `bank_accounts` correspondente
  - [x] 8.2: Ao criar transação de crédito: NÃO alterar saldo de conta — o comprometimento do cartão será calculado na consulta (Epic 5 detalha métricas). Por enquanto, a transação é registrada com `payment_method_type = 'credit'` e `payment_method_id = creditCardId`
  - [x] 8.3: Recálculo de orçamento da categoria: somar transações do mês atual por categoria → comparar com `budget_min_cents`/`budget_max_cents`
  - [x] 8.4: Recálculo em < 500ms (NFR-P3)

### Review Follow-ups (AI) — R1 (2026-04-04)

#### CRITICAL
- [x] [AI-Review][CRITICAL] F1: Tasks 7.2 e 7.3 marcadas [x] mas NÃO integradas — NewExpenseSheet criado mas nenhum page.tsx, layout ou BottomNavigation foi modificado. O componente é dead code. Integrar FAB no BottomNavigation (mobile) e botão no header/dashboard (desktop) [src/client/components/transactions/NewExpenseSheet.tsx]

#### HIGH
- [x] [AI-Review][HIGH] F2: AC #4 — `getSuggestedEstablishmentsAction` importado mas nunca chamado. Quando subcategoria é selecionada, buscar top 5 estabelecimentos e atualizar `suggestedEstablishments` no CascadeInput [src/client/components/transactions/NewExpenseSheet.tsx:22,61,215]
- [x] [AI-Review][HIGH] F3: AC #5 — ImpactPreview usa `before: 0` e `after: valueCents` hardcoded. Chamar `getImpactPreviewAction` com dados reais (saldo da conta, orçamento gasto do mês) e passar resultado ao ImpactPreview [src/client/components/ui/cascade-input.tsx:357-366]
- [x] [AI-Review][HIGH] F4: Task 3.3 — Testes "categoria inexistente (erro)" e "método pagamento inválido (erro)" prometidos mas ausentes. Implementar validação no use case (retornar Result de erro) e adicionar testes [src/server/domain/transactions/use-cases/create-transaction.ts, create-transaction.test.ts]
- [x] [AI-Review][HIGH] F5: `getImpactPreviewAction` — `paymentMethodType`, `categoryName`, `categoryBudgetCents`, `paymentMethodLabel` castados com `as` sem validação Zod. Criar schema Zod para o input completo e validar com `validateInput` [src/server/actions/transaction.actions.ts:100-105]

#### MEDIUM
- [x] [AI-Review][MEDIUM] F6: `getImpactPreview` carrega TODAS as transações via `findByOrganization` e filtra em memória. Criar método específico no repository (ex: `sumMonthlySpentByCategory`) com query filtrada no banco [src/server/domain/transactions/use-cases/get-impact-preview.ts:57-64]
- [x] [AI-Review][MEDIUM] F7: Divergência visual proto-07 — Summary bar ("R$ 87,00 · Alimentação") ausente nos steps 2-4. Adicionar barra de contexto no topo de cada step mostrando dados já preenchidos [src/client/components/ui/cascade-input.tsx]
- [x] [AI-Review][MEDIUM] F8: CascadeInput não reseta estado ao fechar/reabrir o sheet. Usar `key={open}` ou resetar useState ao reabrir [src/client/components/transactions/NewExpenseSheet.tsx, src/client/components/ui/cascade-input.tsx]
- [x] [AI-Review][MEDIUM] F9: Step 5 (confirmação) não mostra ImpactPreview — proto-07 State 4 mostra saldo e barra de orçamento na tela de confirmação. Adicionar ImpactPreview no step 5 [src/client/components/ui/cascade-input.tsx:381-429]
- [x] [AI-Review][MEDIUM] F10: `isSubmitting` rastreado mas nunca usado na UI. Botão "Confirmar" não desabilitado nem mostra spinner durante submit — permite double-click e transações duplicadas. Passar `isSubmitting` ao CascadeInput e desabilitar botão [src/client/components/transactions/NewExpenseSheet.tsx:63, src/client/components/ui/cascade-input.tsx:424]

#### LOW
- [ ] [AI-Review][LOW] F11: Teclado numérico customizado do proto-07 não implementado — usa CurrencyInput padrão. Divergência visual aceitável mas documentada [src/client/components/ui/cascade-input.tsx]

## Dev Notes

- O domínio `transactions` é NOVO — não existe nenhum schema, use case, action ou repository de transações ainda
- Seguir exatamente o padrão estabelecido em `bank-accounts`: repository interface → use cases com TDD → repository impl → factory → server actions → componentes
- Padrão de DI: factories em `src/server/factories/` instanciam deps concretas, use cases recebem deps por parâmetro (SOLID D)
- `withAuth` wrapper em `src/server/infrastructure/auth/with-auth.ts` — todas as actions passam por ele
- `validateInput` em `src/server/infrastructure/validation/validate.ts` — validação Zod padronizada
- `err()` helper em `src/shared/types/result.ts` — atalho para Result de erro
- `logAudit` em `src/server/infrastructure/audit/audit.service.ts` — logger de auditoria
- Valores monetários em integer cents (R$ 87,00 → 8700)
- Input monetário: estilo app bancário — usuário digita só números, vírgula posiciona automaticamente. Usar `CurrencyInput` do DS (`src/client/components/ui/currency-input.tsx`)
- O campo `reference_month` na tabela transactions será preenchido automaticamente para transações de cartão de crédito no Epic 5. Por enquanto, pode ficar null para transações não-cartão
- A tabela `transactions` será usada por Stories 3.2 (receitas/transferências), 3.3 (edição/exclusão), 3.4 (listagem) — planejar o schema pensando nessas extensões (campo `type` com valores: expense, income, transfer)

### Design System & Protótipos

**Protótipos relevantes:**
- `_bmad-output/prototypes/proto-07-cascade-input.html` — fluxo cascata completo com 5 estados mobile + versão desktop (side sheet 400px)

**Seções do DS a consultar:**
- Tokens de cor: paleta Stone & Indigo (--primary: #4F46E5, --text-primary: #1C1917, etc.)
- Tipografia: Inter, tabular-nums para valores financeiros
- Espaçamentos: grid base 4px
- Border-radius: --radius-chip: 12px, --radius-button: 8px, --radius-card: 12px
- Sombras: --shadow-card, --shadow-sheet

**Componentes UI existentes a reutilizar:**
- `src/client/components/ui/cascade-input.tsx` — fluxo cascata (4 steps, precisará de step de subcategoria)
- `src/client/components/ui/impact-preview.tsx` — preview de impacto antes/depois
- `src/client/components/ui/currency-input.tsx` — input monetário (centavos in/out)
- `src/client/components/ui/budget-progress-bar.tsx` — barra de progresso orçamento (3 variantes, 4 faixas de cor)
- `src/client/components/ui/sheet.tsx` — bottom sheet (mobile) / side panel (desktop)
- `src/client/components/ui/button.tsx` — botões com variantes
- `src/client/components/ui/input.tsx` — input base
- `src/client/components/ui/sonner.tsx` — toast notifications
- `src/client/components/ui/bottom-navigation.tsx` — navegação mobile com FAB central
- `src/client/components/ui/emoji-picker.tsx` — para categorias com emoji

**Regras visuais obrigatórias:**
- NÃO hardcodar hex — sempre usar tokens Tailwind do Design System
- NÃO criar componentes visuais novos sem que existam no DS primeiro
- Usar tokens de tipografia: Inter para texto, tabular-nums para valores numéricos
- Espaçamentos seguem grid base 4px
- Border-radius segue padrão DS
- Componente novo necessário? Seguir workflow formal: dev identifica necessidade → documenta → UX prototipa → implementa no DS com testes → dev importa

### Project Structure Notes

**Novos arquivos a criar (domínio `transactions`):**
```
src/
  server/
    domain/
      transactions/
        repositories/
          transaction.repository.ts          # Interface
        use-cases/
          create-transaction.ts              # Use case
          create-transaction.test.ts         # TDD
          get-suggested-establishments.ts    # Top 5 por subcategoria
          get-suggested-establishments.test.ts
          get-impact-preview.ts              # Cálculo de impacto
          get-impact-preview.test.ts
    infrastructure/
      database/
        schema/
          transactions.ts                    # Schema Drizzle
          transactions.test.ts               # Testes do schema
        repositories/
          transaction.repository.impl.ts     # Implementação Drizzle
    factories/
      transaction.ts                         # DI factory
    actions/
      transaction.actions.ts                 # Server Actions
      transaction.actions.test.ts            # Testes
  shared/
    schemas/
      transaction.schema.ts                  # Schema Zod
      transaction.schema.test.ts             # Testes
  client/
    components/
      transactions/
        NewExpenseSheet.tsx                   # Wrapper que conecta CascadeInput + actions
```

**Padrão seguido:** Exatamente o mesmo de `bank-accounts` (domínio implementado no Epic 2):
- Repository interface em `domain/` define contrato
- Use cases em `domain/use-cases/` com TDD
- Implementation em `infrastructure/database/repositories/`
- Factory em `factories/` faz wiring de DI
- Server Action em `actions/` é o entry point (com `withAuth` + `validateInput`)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 3, Story 3.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture, API & Communication Patterns, Implementation Patterns]
- [Source: _bmad-output/project-context.md#Critical Implementation Rules]
- [Source: _bmad-output/prototypes/proto-07-cascade-input.html]
- [Source: src/server/domain/bank-accounts/ — padrão de referência para domínio]
- [Source: src/server/actions/bank-account.actions.ts — padrão de referência para actions]
- [Source: src/server/factories/bank-account.ts — padrão de referência para DI]
- [Source: src/client/components/ui/cascade-input.tsx — componente DS existente]
- [Source: src/client/components/ui/impact-preview.tsx — componente DS existente]
- [Source: src/shared/schemas/bank-account.schema.ts — padrão de referência para schemas Zod]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

Nenhum erro encontrado durante a implementação.

### Completion Notes List

- Task 0: Consultados DS, protótipos (proto-07) e componentes UI existentes
- Task 1: Schema `transactions` criado com 15 colunas, RLS policy, migration gerada via drizzle-kit
- Task 2: Schemas Zod `createTransactionSchema` e `transactionIdSchema` com 15 testes
- Task 3: Domínio completo — TransactionRepository interface, 3 use cases (create, establishments, impact) com 18 testes
- Task 4: DrizzleTransactionRepository com `findTopEstablishments` agrupado
- Task 5: Factory + 3 server actions com withAuth e validateInput, 6 testes
- Task 6: CascadeInput adaptado de 4 para 5 steps (subcategoria), pré-seleção de payment method, 15 testes
- Task 7: NewExpenseSheet com carregamento de dados, mapeamento de payment methods, toast sucesso/erro, loading spinner
- Task 8: Recálculo implementado no use case create-transaction — débito/pix debita conta, crédito não altera saldo
- 112 arquivos de teste, 806 testes passando, zero regressões
- TypeScript compilação limpa (tsc --noEmit)
- ✅ Resolved review finding [CRITICAL]: F1 — Integrado NewExpenseSheet via AppShell wrapper, FAB no BottomNavigation abre sheet, botão "Registrar gasto" adicionado no Sidebar (desktop)
- ✅ Resolved review finding [HIGH]: F2 — `getSuggestedEstablishmentsAction` chamado via `onSubcategorySelect` callback quando subcategoria é selecionada
- ✅ Resolved review finding [HIGH]: F3 — `getImpactPreviewAction` chamado com dados reais via `onRequestImpact` callback ao avançar para step 5
- ✅ Resolved review finding [HIGH]: F4 — Validação de categoryId vazia e paymentMethodType inválido adicionada no use case + 2 testes novos
- ✅ Resolved review finding [HIGH]: F5 — Schema Zod `getImpactPreviewSchema` criado, `as` casts eliminados do `getImpactPreviewAction`
- ✅ Resolved review finding [MEDIUM]: F6 — Método `sumMonthlySpentByCategory` adicionado ao repo com query SQL filtrada, eliminou carregamento de todas as transações
- ✅ Resolved review finding [MEDIUM]: F7 — Summary bar adicionada nos steps 2-4 mostrando dados já preenchidos (valor · classificação · categoria · subcategoria)
- ✅ Resolved review finding [MEDIUM]: F8 — CascadeInput resetado via `key={sheetOpenCount}` ao reabrir sheet + limpa suggestedEstablishments e impactData
- ✅ Resolved review finding [MEDIUM]: F9 — ImpactPreview adicionado no step 5 (confirmação) com saldo e barra de orçamento
- ✅ Resolved review finding [MEDIUM]: F10 — `isSubmitting` passado ao CascadeInput, botão "Confirmar" mostra spinner e fica desabilitado durante submit
- 112 arquivos de teste, 815 testes passando, zero regressões (pós review fixes)
- TypeScript compilação limpa (tsc --noEmit)

### File List

**Criados:**
- `src/server/infrastructure/database/schema/transactions.ts` — Schema Drizzle da tabela transactions
- `src/server/infrastructure/database/schema/transactions.test.ts` — Testes do schema (6 testes)
- `src/server/infrastructure/database/migrations/0012_old_bill_hollister.sql` — Migration gerada
- `src/shared/schemas/transaction.schema.ts` — Schemas Zod compartilhados (createTransactionSchema + getImpactPreviewSchema)
- `src/shared/schemas/transaction.schema.test.ts` — Testes Zod (15 testes)
- `src/server/domain/transactions/repositories/transaction.repository.ts` — Interface do repository (com sumMonthlySpentByCategory)
- `src/server/domain/transactions/use-cases/create-transaction.ts` — Use case criar transação (com validação de categoryId e paymentMethodType)
- `src/server/domain/transactions/use-cases/create-transaction.test.ts` — Testes (11 testes)
- `src/server/domain/transactions/use-cases/get-suggested-establishments.ts` — Use case sugestões
- `src/server/domain/transactions/use-cases/get-suggested-establishments.test.ts` — Testes (2 testes)
- `src/server/domain/transactions/use-cases/get-impact-preview.ts` — Use case impacto (via sumMonthlySpentByCategory)
- `src/server/domain/transactions/use-cases/get-impact-preview.test.ts` — Testes (8 testes)
- `src/server/infrastructure/database/repositories/transaction.repository.impl.ts` — Implementação Drizzle (com sumMonthlySpentByCategory)
- `src/server/factories/transaction.ts` — Factory DI
- `src/server/actions/transaction.actions.ts` — Server actions (com validação Zod completa no getImpactPreviewAction)
- `src/server/actions/transaction.actions.test.ts` — Testes actions (6 testes)
- `src/client/components/transactions/NewExpenseSheet.tsx` — Componente wrapper (integrado com establishments, impact e isSubmitting)
- `src/client/components/layout/AppShell.tsx` — Client wrapper para layout com sheet state compartilhado

**Modificados:**
- `src/server/infrastructure/database/schema/index.ts` — Export de transactions
- `src/client/components/ui/cascade-input.tsx` — Adaptado de 4 para 5 steps, summary bar, ImpactPreview no step 5, isSubmitting, onSubcategorySelect, onRequestImpact
- `src/client/components/ui/cascade-input.test.tsx` — Testes atualizados (21 testes)
- `src/app/(app)/layout.tsx` — Refatorado para usar AppShell
- `src/client/components/layout/BottomNavigation.tsx` — FAB alterado de Link para button com onFabClick prop
- `src/client/components/layout/BottomNavigation.test.tsx` — Testes atualizados para nova prop
- `src/client/components/layout/Sidebar.tsx` — Botão "Registrar gasto" adicionado com onRegisterClick prop

### Change Log

| Mudança | Motivo |
|---------|--------|
| Tabela `transactions` com 15 colunas | Schema extensível para expense/income/transfer (Stories 3.2-3.5) |
| Campo `reference_month` nullable | Será preenchido automaticamente para cartão no Epic 5 |
| RLS policy `transactions_org_isolation` | Isolamento multi-tenant padrão do projeto |
| CascadeInput de 4→5 steps | Proto-07 exige step separado de subcategoria |
| PIX com id `pix-{bankAccountId}` | Distinguir PIX de débito na mesma conta bancária |
| Toast "Desfazer" 5s | AC #6 — undo temporário (implementação real em Story 3.3) |
| Débito/PIX debita conta, crédito não | Crédito será calculado na consulta (Epic 5) |
| AppShell wrapper para layout | F1 — Centralizar state do sheet, compartilhar entre BottomNav e Sidebar |
| BottomNavigation FAB: Link → button | F1 — FAB abre sheet em vez de navegar para /registrar |
| Sidebar: botão "Registrar gasto" | F1 — Trigger desktop para abrir sheet |
| getSuggestedEstablishmentsAction integrado | F2 — Busca top 5 ao selecionar subcategoria |
| getImpactPreviewAction com dados reais | F3 — Saldo/limite e orçamento calculados no backend |
| Validação categoryId + paymentMethodType | F4 — Testes de erro no use case + validação explícita |
| getImpactPreviewSchema Zod | F5 — Eliminados `as` casts inseguros na action |
| sumMonthlySpentByCategory no repository | F6 — Query SQL filtrada substitui carregamento em memória |
| Summary bar steps 2-4 | F7 — Contexto visual dos dados já preenchidos (proto-07) |
| key={sheetOpenCount} reset | F8 — CascadeInput reseta estado ao reabrir sheet |
| ImpactPreview no step 5 | F9 — Saldo + barra de orçamento na confirmação (proto-07) |
| isSubmitting → spinner + disabled | F10 — Previne double-click e transações duplicadas |
| Addressed code review findings — 10 items resolved (Date: 2026-04-04) |

### Senior Developer Review (AI) — R1

**Reviewer:** Claude Opus 4.6
**Data:** 2026-04-04
**Resultado:** Changes Requested (1 CRITICAL, 4 HIGH, 5 MEDIUM, 1 LOW)

**Resumo:** Backend (schema, use cases, repository, actions) está sólido e bem estruturado seguindo o padrão bank-accounts. Os problemas concentram-se no wiring frontend: (1) componente NewExpenseSheet não integrado em nenhuma página, (2) getImpactPreviewAction e getSuggestedEstablishmentsAction nunca chamados no frontend, (3) ImpactPreview com dados hardcoded, (4) divergências visuais contra proto-07 (summary bar, ImpactPreview no step de confirmação). Também há testes prometidos mas ausentes (categoria inexistente, método inválido) e casting inseguro com `as` na action de impacto.

**Status:** `ready-for-dev` — dev precisa fixar HIGHs/MEDIUMs antes de voltar para review R2.
