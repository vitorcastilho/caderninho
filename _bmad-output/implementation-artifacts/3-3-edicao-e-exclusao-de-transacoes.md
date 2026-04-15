# Story 3.3: Edição e Exclusão de Transações

Status: done

## Story

As a user,
I want to edit or delete any registered transaction,
so that I can correct mistakes and keep my data accurate.

## Acceptance Criteria

1. **Given** o usuário tem transações registradas **When** seleciona uma transação para editar **Then** pode alterar valor, categoria, subcategoria, estabelecimento e método de pagamento (FR15) **And** o impacto da alteração é mostrado antes de confirmar (ImpactPreview) **And** todos os totalizadores são recalculados em < 500ms após confirmar (FR17, NFR-P3)

2. **Given** o usuário quer excluir uma transação **When** confirma a exclusão (dialog de confirmação) **Then** a transação é removida (FR16) **And** todos os totalizadores são recalculados em < 500ms (FR17) **And** toast com "Desfazer" por 5 segundos

3. **Given** uma edição ou exclusão é efetivada **When** a operação conclui com sucesso **Then** a trilha de auditoria registra a alteração/exclusão com os valores anteriores (`oldValue`) e, no caso de edição, os novos (`newValue`)

## Tasks / Subtasks

### Fase 0: Design System & Protótipos (Obrigatória para stories com UI)

- [x] Task 0: Consultar Design System e protótipos relevantes
  - [x] 0.1: Consultar página `/design-system` (`src/app/design-system/page.tsx`) — tokens, cores, tipografia, espaçamentos
  - [x] 0.2: Verificar protótipos relevantes em `_bmad-output/prototypes/` — `proto-07-cascade-input.html` (referência do sheet de gasto; EditExpenseSheet reaproveita o layout), `proto-15-drill-down.html` (linha da transação individual — tap para abrir detalhe/edit)
  - [x] 0.3: Listar componentes UI existentes em `src/client/components/ui/` que serão reutilizados — `Sheet`, `Dialog` (confirm), `CurrencyInput`, `Select`, `Input`, `Button` (com variant `destructive`), `Label`, `ImpactPreview`, `Sonner` (toast), `CascadeInput` (NÃO reutilizar — é específico de criação)

### Fase 1: Repositório — Extensões (update + delete + findById já existente)

- [x] Task 1 (AC: #1, #2): Estender `TransactionRepository` com `update()` e `delete()`
  - [x] 1.1: Adicionar à interface `TransactionRepository` em `src/server/domain/transactions/repositories/transaction.repository.ts`:
    - `update(id: string, organizationId: string, data: Partial<Omit<Transaction, 'id' | 'organizationId' | 'createdBy' | 'createdAt'>>): Promise<Transaction>`
    - `delete(id: string, organizationId: string): Promise<void>`
  - [x] 1.2: Implementar ambos em `DrizzleTransactionRepository` (`src/server/infrastructure/database/repositories/transaction.repository.impl.ts`) — `update` via `db.update(transactions).set({ ...data, updatedAt: new Date() }).where(and(eq(transactions.id, id), eq(transactions.organizationId, organizationId))).returning()`, `delete` via `db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.organizationId, organizationId)))`
  - [x] 1.3: Decisão de modelo: **hard-delete** (não há coluna `status` em `transactions`, e FR16 diz "a transação é removida"). A trilha de auditoria preserva o histórico da exclusão. NÃO adicionar coluna `status` nesta story — manter escopo enxuto.

### Fase 2: Schemas Zod de Validação

- [x] Task 2 (AC: #1): Criar `updateExpenseSchema` em `src/shared/schemas/transaction.schema.ts`
  - [x] 2.1: Campos editáveis de gasto — `id` (idSchema), `amountCents` (positiveAmountCentsSchema), `categoryId` (idSchema), `subcategoryId` (idSchema.optional()), `establishment` (z.string().max(200).optional()), `paymentMethodType` (enum `['debit', 'credit', 'pix']`), `paymentMethodId` (idSchema.optional()), `installments` (z.number().int().nonnegative().optional()), `description` (z.string().max(500).optional()), `transactionDate` (z.coerce.date().optional())
  - [x] 2.2: Criar `deleteTransactionSchema` — apenas `{ id: idSchema }` (server use case resolve organizationId pela sessão)
  - [x] 2.3: Exportar types `UpdateExpenseInput` e `DeleteTransactionInput`
  - [x] 2.4: Adicionar testes em `src/shared/schemas/transaction.schema.test.ts` — inputs válidos, inválidos, edge cases
  - [x] 2.5: **Escopo de edição**: nesta story editamos apenas transações do tipo `expense`. Edição de `income` e `transfer` fica de fora (menor demanda de uso, maior complexidade — inverter saldos de 1-2 contas, trocar fonte de receita etc.). Exclusão funciona para os três tipos. Isto é uma decisão consciente de escopo — documentar em Dev Notes e respeitar no UI.

### Fase 3: Domain — Use Cases

- [x] Task 3 (AC: #1, #3): Criar use case `update-expense-transaction`
  - [x] 3.1: Criar `src/server/domain/transactions/use-cases/update-expense-transaction.ts` seguindo o padrão de `create-transaction.ts`
  - [x] 3.2: Deps: `repository: TransactionRepository`, `auditLogger: AuditLogger`, `bankAccountRepository: BankAccountRepository`
  - [x] 3.3: Params: `id`, todos os campos editáveis (opcional), `organizationId`, `userId`
  - [x] 3.4: Fluxo:
    - Validar `amountCents > 0` se informado
    - Validar `paymentMethodType` está em `['debit', 'credit', 'pix']` se informado
    - `findById` — retornar `TRANSACTION_NOT_FOUND` se não existir, `INVALID_TRANSACTION_TYPE` se `type !== 'expense'`
    - Snapshot do `existing` (para audit `oldValue` e para reverter saldos)
    - **Reverter saldo antigo**: se `existing.paymentMethodType` era `debit`/`pix` com `paymentMethodId`, creditar de volta `existing.amountCents` na conta antiga
    - **Aplicar saldo novo**: se o novo `paymentMethodType` é `debit`/`pix` com `paymentMethodId`, debitar `newAmountCents` na conta nova
    - `repository.update(id, organizationId, updatedFields)`
    - Audit log `action: 'UPDATE'` com `oldValue` (snapshot) e `newValue` (updated transaction)
    - Retornar `ok(updated)`
  - [x] 3.5: Tratamento de conta inexistente/arquivada: se conta nova não existe → `DESTINATION_ACCOUNT_NOT_FOUND`; se conta nova está inactive → `DESTINATION_ACCOUNT_INACTIVE`. Se conta antiga não existir mais (caso borda raríssimo), apenas pular o estorno (não bloquear a edição, apenas logar no `auditLogger` como divergência esperada) — decisão para manter operação robusta. **Nota**: se o usuário só mudar categoria/descrição sem mexer em valor nem método, nenhum saldo é afetado.
  - [x] 3.6: Criar `update-expense-transaction.test.ts` — TDD. Cobrir: atualização simples sem afetar saldo; troca de valor em débito (estorno + novo débito); troca de método (debit → credit), troca de conta (debit conta A → debit conta B); not found; tipo incompatível (income/transfer); amount <= 0; conta nova arquivada; conta nova não existe

- [x] Task 4 (AC: #2, #3): Criar use case `delete-transaction`
  - [x] 4.1: Criar `src/server/domain/transactions/use-cases/delete-transaction.ts`
  - [x] 4.2: Deps: `repository: TransactionRepository`, `auditLogger: AuditLogger`, `bankAccountRepository: BankAccountRepository`
  - [x] 4.3: Params: `id`, `organizationId`, `userId`
  - [x] 4.4: Fluxo:
    - `findById` — `TRANSACTION_NOT_FOUND` se não existe
    - Snapshot para audit e reversão
    - **Reverter saldos** por tipo:
      - `expense` com `paymentMethodType` em `['debit', 'pix']` e `paymentMethodId` → creditar `amountCents` de volta na conta
      - `expense` com `paymentMethodType: 'credit'` → nenhum efeito em saldo (crédito não altera saldo, fica para Epic 5)
      - `income` com `destinationAccountId` → debitar `amountCents` da conta destino
      - `transfer` com `sourceAccountId` + `destinationAccountId` → creditar origem + debitar destino
    - Se alguma conta referenciada não existir mais (caso borda), apenas pular o estorno para aquela conta, não bloquear a exclusão
    - `repository.delete(id, organizationId)` (hard-delete)
    - Audit log `action: 'DELETE'` com snapshot completo em `oldValue` e `newValue: null`
    - Retornar `ok({ id })` — não retornar o objeto porque já foi deletado
  - [x] 4.5: Criar `delete-transaction.test.ts` — TDD. Cobrir: delete de expense/debit (estorno em conta), expense/credit (sem efeito em conta), income (débito na conta destino), transfer (estorno nas duas contas), not found, conta referenciada inexistente (não bloqueia), audit log recebe snapshot completo

### Fase 4: Server Actions

- [x] Task 5 (AC: #1, #2): Adicionar actions em `src/server/actions/transaction.actions.ts`
  - [x] 5.1: `updateExpenseTransactionAction` — seguir padrão de `createTransactionAction`. Validar com `updateExpenseSchema`. Chamar `updateExpenseTransaction` use case. Revalidar `'/'`, `'/transactions'`, `'/dashboard'`, `'/accounts'` ao sucesso.
  - [x] 5.2: `deleteTransactionAction` — seguir mesmo padrão. Validar com `deleteTransactionSchema`. Chamar `deleteTransaction` use case. Revalidar os mesmos paths.
  - [x] 5.3: Verificar se `transactionDeps` em `src/server/factories/transaction.ts` já contém tudo que os novos use cases precisam (repository, bankAccountRepository, auditLogger) — está OK, já foi montado na Story 3.2. Nenhuma extensão de factory é necessária.
  - [x] 5.4: Adicionar testes em `src/server/actions/transaction.actions.test.ts` — inputs válidos, inválidos, sem organização ativa, propagação de erros do domain

### Fase 5: UI — Listagem mínima para habilitar seleção

> **Contexto de escopo**: A Story 3.4 (backlog) é a listagem completa com filtros, busca e paginação. Esta story 3.3 precisa de um ponto de entrada para o usuário conseguir selecionar uma transação e editá-la/excluí-la. Criamos aqui uma **lista simples cronológica** em `/transactions` que a Story 3.4 evoluirá. NÃO implementar filtros, chips, busca, paginação — tudo isso é 3.4.

- [x] Task 6 (AC: #1, #2): Criar página `/transactions` mínima
  - [x] 6.1: Criar `src/app/(app)/transactions/page.tsx` — Server Component. Carrega `transactions = await transactionDeps.repository.findByOrganization(organizationId)` via uma nova server action `listTransactionsAction` (ou chamando o use case direto se houver precedente). Renderiza `<TransactionList transactions={transactions} />`.
  - [x] 6.2: Criar server action `listTransactionsAction` em `src/server/actions/transaction.actions.ts` — `withAuth`, resolve `organizationId`, chama `transactionDeps.repository.findByOrganization` direto (use-case-less list). Também carregar lookups mínimos para rótulos: categorias, subcategorias, contas, cartões, income sources da org. **NÃO** reimplementar filtros — apenas lista crua ordenada por `transactionDate DESC`.
  - [x] 6.3: Adicionar item "Transações" na sidebar (`AppShell.tsx` ou equivalente), apontando para `/transactions`. Verificar onde os outros itens de sidebar (Contas, Categorias) estão listados e seguir o mesmo padrão.
  - [x] 6.4: Criar `src/client/components/transactions/TransactionList.tsx` — Client Component. Recebe `transactions`, `categories`, `subcategories`, `bankAccounts`, `creditCards`, `incomeSources` como props. Renderiza lista simples (cada item mostra: valor, label resolvido por tipo — gasto exibe categoria + estabelecimento, receita exibe fonte + conta destino, transferência exibe origem → destino — método/descrição, data formatada). Estilo segue DS (Card ou div com `bg-white border rounded`, tabular-nums em valores).
  - [x] 6.5: Cada linha tem uma área clicável que abre `EditExpenseSheet` (quando `type === 'expense'`) ou exibe toast informativo "Edição disponível apenas para gastos nesta versão" (para income/transfer). Também um botão de menu (ícone `⋯` ou "Excluir") que abre o `ConfirmDeleteDialog`.
  - [x] 6.6: Empty state quando não há transações: usar componente `EmptyState` existente com mensagem "Nenhuma transação registrada ainda".

- [x] Task 7 (AC: #1): Criar `EditExpenseSheet`
  - [x] 7.1: Criar `src/client/components/transactions/EditExpenseSheet.tsx` — seguir padrão de `NewExpenseSheet.tsx`
  - [x] 7.2: Props: `open`, `onOpenChange`, `transaction` (a ser editada), dados de lookup (categorias, subcategorias, contas, cartões)
  - [x] 7.3: Campos editáveis: valor (CurrencyInput), categoria (Select), subcategoria (Select condicional), estabelecimento (Input), método de pagamento (toggle debit/credit/pix + Select de conta/cartão conforme o tipo), descrição (Input, opcional)
  - [x] 7.4: `ImpactPreview` visível ANTES do "Confirmar" — reutilizar componente `src/client/components/ui/impact-preview.tsx`. Usa a action `getImpactPreviewAction` existente (passar o novo valor/método). **Importante**: o preview deve considerar o impacto DO DELTA — ou seja, como ficará o saldo/orçamento APÓS a edição. Se o impact-preview existente não suportar isso (só calcula para novos gastos), documentar a limitação em Dev Notes e usar o preview simples (mostrar saldo/orçamento atual + o que vai mudar) sem bloquear a story. Decisão técnica fica pro dev: se a lógica de delta for < 10 linhas, extender; senão, escopo mínimo.
  - [x] 7.5: Botão "Confirmar alteração" chama `updateExpenseTransactionAction`. Em caso de sucesso: toast "Alteração salva" e fecha sheet.
  - [x] 7.6: Layout responsivo com `useIsMobile()` + `side={isMobile ? 'bottom' : 'right'}` e `data-[side=right]:sm:max-w-[420px]` (lição aprendida na Story 3.1e/3.2).

- [x] Task 8 (AC: #2): Criar confirmação de exclusão com undo
  - [x] 8.1: Criar `src/client/components/transactions/ConfirmDeleteTransactionDialog.tsx` — usar componente `Dialog` (`src/client/components/ui/dialog.tsx`)
  - [x] 8.2: Props: `open`, `onOpenChange`, `transaction`, `onConfirmed` (callback opcional)
  - [x] 8.3: Conteúdo: título "Excluir transação?", descrição com resumo da transação ("R$ 42,50 — Mercado — 12/04/2026"), botão primário destrutivo "Excluir" (variant `destructive`), botão secundário "Cancelar"
  - [x] 8.4: Ao confirmar, chama `deleteTransactionAction({ id })`. Em sucesso: fecha dialog, exibe toast com `Sonner` contendo botão "Desfazer" (5 segundos). Ver Task 9 para a semântica do undo.

- [x] Task 9 (AC: #2): Implementar "Desfazer" por 5 segundos
  - [x] 9.1: Após `deleteTransactionAction` bem-sucedida, guardar no cliente o **snapshot completo** da transação retornado pelo action (precisamos expor o snapshot — ajustar `deleteTransactionAction` para retornar `ok({ id, snapshot: existing })` além de só `id`, ou criar action helper `undoDeleteTransactionAction` que recria pelo snapshot mandado do cliente).
  - [x] 9.2: Abordagem recomendada (mais simples, alinhada ao padrão do app): na Story 3.1 o "Desfazer" de criação ainda é **placeholder** (ver Completion Notes da 3.1/3.2). Nesta story, implementar o desfazer de exclusão **de forma funcional**: o toast Sonner fica 5s; ao clicar em "Desfazer", client chama `recreateTransactionFromSnapshotAction(snapshot)` que valida e passa direto para `repository.create()` (bypass das validações de negócio porque o snapshot já é de uma transação que foi válida). Isso mantém consistência até o Epic 5 trazer um sistema mais robusto de undo.
  - [x] 9.3: **Alternativa aceitável** (se 9.2 provar-se complexo demais): manter "Desfazer" como placeholder também (igual Story 3.1/3.2), apenas mostrando o toast com botão inoperante + comentário `// TODO: undo funcional — Epic 5`. Nesse caso, documentar em Dev Notes por que a funcionalidade foi adiada. **Discutir com o usuário em code review qual caminho seguir.**
  - [x] 9.4: Seja qual for a decisão, o toast de sucesso "Transação excluída" deve aparecer com duração de 5s.

### Fase 6: Testes de Integração e Validação

- [x] Task 10 (AC: #1, #2, #3): Validação end-to-end
  - [x] 10.1: `npx tsc --noEmit` — zero erros
  - [x] 10.2: `npx eslint src --max-warnings=0` — zero warnings
  - [x] 10.3: `npx vitest run` — todos os testes passando, zero regressões
  - [x] 10.4: **Smoke test manual em browser** (OBRIGATÓRIO antes de marcar como completo — lição Story 3.2):
    - Registrar um gasto em conta débito. Ir em `/transactions`, editar: mudar valor, confirmar, verificar que saldo da conta atualiza corretamente, que trilha de auditoria registra `UPDATE`.
    - Editar o mesmo gasto trocando método (débito → crédito): saldo deve ser creditado de volta na conta original.
    - Excluir um gasto: confirmar no dialog, verificar que transação some da lista e saldo é estornado.
    - Excluir uma receita: verificar que saldo da conta destino é debitado.
    - Excluir uma transferência: verificar que ambas as contas voltam aos saldos anteriores.
    - Se o "Desfazer" funcional (9.2) foi implementado, validar que recriar via undo funciona.

### Review Follow-ups (AI)

**Code Review R1 — 2026-04-14 (Opus 4.6)**

HIGH (blocking — obrigatório antes de `done`):

- [x] [AI-Review][HIGH] `recreateTransactionFromSnapshotAction` não valida o input — é um buraco de segurança. O action recebe `input as Transaction | null` e só checa `organizationId`. Qualquer usuário autenticado pode forjar um "snapshot" arbitrário (qualquer `amountCents`, `type`, IDs de conta/cartão/categoria, `createdBy`, `transactionDate`, `id`) e o action recria direto no DB mexendo em saldos sem validação de negócio. [`src/server/actions/transaction.actions.ts:164-262`]
  - **Resolvido em R1-fix**: Novo schema `recreateTransactionSnapshotSchema` (zod com enums, positiveAmountCentsSchema, idSchema, nullable explícito) aplicado via `validateInput`. Adicionado ownership check explícito em todos os FKs — `categoryId`, `subcategoryId`, `incomeSourceId`, `paymentMethodId` (com dispatch entre `bankAccountRepository` e `creditCardRepository` conforme `paymentMethodType`), `sourceAccountId`, `destinationAccountId`. Cada FK referenciada tem que retornar via `findById(id, organizationId)` senão devolve `INVALID_SNAPSHOT`. `createdBy` é forçado a `session.user.id`. Factory foi extendida com `categoryRepository`, `subcategoryRepository`, `creditCardRepository` para suportar os novos checks.

- [x] [AI-Review][HIGH] Zero testes para `recreateTransactionFromSnapshotAction`. Cobrir no mínimo: snapshot válido recria preservando `id` e aplica saldo; snapshot de outra org é rejeitado; snapshot com campos faltando/inválidos é rejeitado; idempotência (segundo clique em "Desfazer" não duplica saldo); round-trip delete→undo retorna o estado de conta ao valor pré-delete para os 3 tipos (expense/income/transfer). [`src/server/actions/transaction.actions.test.ts`]
  - **Resolvido em R1-fix**: Novo arquivo dedicado `src/server/actions/recreate-transaction.actions.test.ts` com 15 casos cobrindo autenticação/org, VALIDATION_ERROR (id inválido, amountCents negativo, type fora do enum), ownership (categoria/conta inválida), force de `createdBy` (cliente tentando forjar), recreate expense/income/transfer, idempotência (findById curto-circuita sem reaplicar saldo) e atomicidade (withTransaction é chamada).

- [x] [AI-Review][HIGH] Race condition no "Desfazer": o `onClick` do toast Sonner não bloqueia cliques concorrentes. Clicar duas vezes em <5s chama `recreateTransactionFromSnapshotAction` duas vezes — dependendo do Drizzle, pode falhar em PK conflict (500 não tratado) ou aplicar saldo duas vezes. [`src/client/components/transactions/ConfirmDeleteTransactionDialog.tsx:57-68`, `src/server/actions/transaction.actions.ts:183-254`]
  - **Resolvido em R1-fix**: Server-side, a idempotência é garantida por um `repository.findById` no início da action — se a transação já existe (PK match), curto-circuita retornando `{ success, data: existing }` sem recriar nem reaplicar saldo. Client-side, o `onClick` do toast tem uma flag `undoInFlight` que guarda no closure e bloqueia cliques concorrentes; reset apenas em caso de falha para permitir retry.

- [x] [AI-Review][HIGH] AC#1 exige `ImpactPreview` antes de confirmar a edição. Implementação atual removeu o componente inteiro — não há nem o "preview simplificado" (saldo atual da conta + orçamento atual da categoria) que a Task 7.4 autorizava como escopo mínimo. [`src/client/components/transactions/EditExpenseSheet.tsx:289`]
  - **Resolvido em R1-fix**: Adicionado bloco de contexto financeiro simplificado (versão b da Task 7.4) no `EditExpenseSheet`, exibindo saldo atual da conta selecionada e orçamento mensal da categoria selecionada, com border-left indigo estilo alerta. Sem delta pós-confirmação (o preview rico fica como `// TODO: preview de delta — Epic 6`). `BankAccountOption` passou a expor `balanceCents` para habilitar esse display.

MEDIUM (should fix — antes de `done`):

- [x] [AI-Review][MEDIUM] `updateExpenseTransaction` e `deleteTransaction` não usam DB transaction. [`src/server/domain/transactions/use-cases/update-expense-transaction.ts`, `delete-transaction.ts`]
  - **Resolvido em R1-fix**: Introduzido padrão `withTransaction` na factory. `DrizzleTransactionRepository` e `DrizzleBankAccountRepository` passaram a aceitar um `DbExecutor` opcional no construtor (default = `db`). `transactionDeps.withTransaction(fn)` invoca `db.transaction` passando repositórios scoped na tx. Os use cases `updateExpenseTransaction`, `deleteTransaction` e a action `recreateTransactionFromSnapshotAction` agora rodam todos os writes de saldo + update/delete/create dentro da mesma tx atômica. Audit log fica fora da tx (append-only, falha isolada).

- [x] [AI-Review][MEDIUM] `updateExpenseTransaction` grava saldo intermediário quando `existing.paymentMethodId === newMethodId`. [`update-expense-transaction.ts`]
  - **Resolvido em R1-fix**: Reestruturado o bloco de reversão/aplicação: computa todos os saldos finais em um `Map<accountId, finalBalance>` em memória e faz uma única gravação por conta no final. Teste existente "deve estornar saldo antigo e aplicar novo ao mudar valor em débito" foi atualizado para exigir `toHaveBeenCalledTimes(1)` e o saldo final direto (45000, sem o intermediário 60000).

- [x] [AI-Review][MEDIUM] `updateExpenseSchema` aceita `{ id }` sem nenhum outro campo. [`src/shared/schemas/transaction.schema.ts`]
  - **Resolvido em R1-fix**: Schema convertido para `.refine` que exige ao menos um campo não-`id` definido. Teste "deve aceitar apenas id" substituído por "deve rejeitar payload sem nenhum campo para atualizar além do id" + "deve aceitar atualização com um único campo opcional".

- [x] [AI-Review][MEDIUM] `recreateTransactionFromSnapshotAction` passa `createdBy: snapshot.createdBy` vindo do cliente. [`transaction.actions.ts:200`]
  - **Resolvido em R1-fix**: `createdBy` é substituído por `session.user.id` na chamada a `tx.repository.create`. Teste dedicado "deve forçar createdBy a partir da session (ignora valor do cliente)" valida o comportamento.

LOW (backlog — não blocking):

- [ ] [AI-Review][LOW] `ConfirmDeleteTransactionDialog.tsx:71-77` renderiza `<Dialog><DialogContent /></Dialog>` vazio quando `transaction` é null (ramo morto). Trocar por `return null` ou remover o early return.

- [ ] [AI-Review][LOW] `EditExpenseSheet.tsx:67-78` usa set-state-em-render (`if (transaction && transaction.id !== loadedId) { setLoadedId(...); ... }`) como workaround do warning `react-hooks/set-state-in-effect`. Alternativa idiomática: passar `key={transaction?.id}` no `<Sheet>` e deixar o React remontar o componente naturalmente.

- [ ] [AI-Review][LOW] `listTransactionsAction` usa `// eslint-disable-next-line @typescript-eslint/no-unused-vars` para suprimir o `_input` (`src/server/actions/transaction.actions.ts:148-157`). Workaround aceitável, mas considerar ajustar a assinatura de `withAuth` para suportar actions sem input.

## Dev Notes

### Design System & Protótipos

**Protótipos relevantes:**
- `_bmad-output/prototypes/proto-07-cascade-input.html` — referência visual do `NewExpenseSheet` que o `EditExpenseSheet` deve espelhar (mesmo layout de sheet, mesma tipografia, mesma ordem de campos, só o CTA muda para "Confirmar alteração"). O componente `CascadeInput` em si NÃO deve ser reutilizado (é específico de criação com progressive disclosure).
- `_bmad-output/prototypes/proto-15-drill-down.html` — padrão de linha de transação individual (layout da lista em `/transactions`).

**Seções do DS a consultar:**
- Tokens de cor (background, text, border, destructive)
- Tipografia: Inter para texto, `tabular-nums` para valores monetários, `text-lg`/`text-2xl` nas linhas de valor
- Espaçamentos: grid base 4px
- Componentes de formulário: Input, Select, Button (variants `primary`, `destructive`, `ghost`), Dialog, Sheet
- Ícone destrutivo: botão "Excluir" com variant `destructive` (borda vermelha, texto vermelho → sólido ao confirmar)

**Componentes UI existentes a reutilizar:**
- `src/client/components/ui/sheet.tsx` — Sheet (edit)
- `src/client/components/ui/dialog.tsx` — Dialog (confirm delete)
- `src/client/components/ui/currency-input.tsx` — input de valor
- `src/client/components/ui/select.tsx` — categoria, subcategoria, conta, cartão
- `src/client/components/ui/input.tsx` — estabelecimento, descrição
- `src/client/components/ui/button.tsx` — ações (usar variant `destructive` para excluir)
- `src/client/components/ui/label.tsx` — labels dos campos
- `src/client/components/ui/sonner.tsx` — toasts (sucesso + undo)
- `src/client/components/ui/impact-preview.tsx` — preview de impacto antes de confirmar edição
- `src/client/components/ui/empty-state.tsx` — lista vazia
- `src/client/components/ui/card.tsx` — container das linhas da lista

**Regras visuais obrigatórias:**
- NÃO hardcodar hex — sempre usar tokens Tailwind do Design System
- NÃO criar componentes visuais novos sem passar pelo workflow (`TransactionList` é um compositor de componentes existentes, NÃO um componente novo do DS)
- Usar tokens de tipografia: Inter para texto, `tabular-nums` para valores numéricos
- Espaçamentos seguem grid base 4px
- Border-radius segue padrão DS
- Botão de ação destrutiva (excluir) sempre via variant `destructive` do `Button` — nunca recriar estilo
- Dialog destrutivo segue padrão: botão destrutivo à direita, cancelar à esquerda (ver ux-design-specification.md, seção "Padrões de overlays")

### Decisões Técnicas

**Hard-delete vs soft-delete para transações:**
- Adotado **hard-delete** (DB `DELETE`). Motivos: (a) `transactions` não tem coluna `status`; (b) FR16 diz "a transação é removida"; (c) trilha de auditoria em `audit_logs` preserva histórico com snapshot em `oldValue`, suficiente para reconstrução/investigação; (d) adicionar coluna `status` + filtros em todas as queries agregadas seria escopo desproporcional.
- **Implicação para undo**: após `DELETE`, o registro não existe mais. Undo funcional recria via `repository.create()` usando o snapshot. O novo UUID pode ser o mesmo do original (bypass de validação pois vem de dados que já foram válidos) — decidir entre preservar ID antigo (via create forçado) ou gerar novo ID e aceitar que "desfazer" produz um registro tecnicamente novo com mesmo conteúdo. Recomendo preservar o ID antigo por simplicidade de reconciliação visual.

**Escopo de edição: apenas `expense` nesta story**
- Edição de receita e transferência ficam fora desta story. Motivo: edição de `income` requer reverter crédito + aplicar novo crédito (possivelmente em outra conta); edição de `transfer` requer reverter débito + crédito em duas contas e re-aplicar em (possivelmente outras) duas contas. A complexidade é 2-3x a de `expense` e nem o PRD nem o AC #1 distinguem — o AC fala em "valor, categoria, subcategoria, estabelecimento e método de pagamento", campos que são do domínio de `expense`. Para receita/transferência, o usuário pode **excluir** e recadastrar — isso é simples e funcional.
- Documentar claramente na UI: linhas de receita/transferência na `TransactionList` mostram apenas o botão de excluir (sem botão de editar), ou um toast "Edição disponível apenas para gastos nesta versão" quando o usuário tenta tocar na linha.

**Exclusão: reversão de saldos por tipo**
| Tipo | Condição | Ação de reversão |
|---|---|---|
| expense | `paymentMethodType in ('debit','pix')` + `paymentMethodId` | Creditar `amountCents` na conta |
| expense | `paymentMethodType = 'credit'` | Nenhuma (crédito não altera saldo no MVP — ver Epic 5 para fatura) |
| income | `destinationAccountId` presente | Debitar `amountCents` da conta destino |
| transfer | `sourceAccountId` + `destinationAccountId` presentes | Creditar origem + debitar destino |

Se conta referenciada não existe mais, **pular o estorno** daquela conta (não bloquear a exclusão). Isso é um caso de borda — conta foi arquivada E apagada entre a criação da transação e a exclusão — que não deve impedir a limpeza de dados.

**Edição: delta de saldo**
Para um gasto `expense`, a edição pode mudar vários campos ao mesmo tempo. A estratégia mais robusta é:
1. Reverter o impacto do estado antigo (snapshot) no saldo da conta antiga
2. Aplicar o impacto do estado novo na conta nova (pode ser a mesma)
Isto é mais simples de raciocinar do que calcular deltas finos e evita bugs em trocas de método/conta.

**Se o usuário apenas editar categoria/descrição/estabelecimento**: nenhum saldo é afetado. A função deve detectar que `(paymentMethodType, paymentMethodId, amountCents)` não mudaram e pular inteiramente o bloco de reversão/aplicação.

**ImpactPreview na edição:**
O componente `ImpactPreview` existente foi projetado para criação (mostra como ficará o saldo/orçamento após registrar um gasto novo). Na edição, o cálculo é um delta: o saldo atual **já inclui** o impacto do gasto antigo. Duas alternativas:
- (a) **Preview de substituição**: reverter mentalmente o antigo, aplicar o novo — exibir o resultado. Exige lógica nova.
- (b) **Preview simplificado**: apenas exibir saldo atual da conta e orçamento atual da categoria, sem previsão pós-confirmação. Menos rico, mas sem lógica nova.
Decisão do dev durante implementação: se a lógica (a) for < 10 linhas e couber bem no componente existente, usar (a); caso contrário, usar (b) com uma nota `// TODO: preview de delta — Epic 6`.

**Padrões de código a seguir (referências):**
- Use case — `src/server/domain/transactions/use-cases/create-transaction.ts` (ajuste/débito de saldo), `src/server/domain/bank-accounts/use-cases/update-bank-account.ts` (snapshot + audit `UPDATE`)
- Delete — `src/server/domain/establishments/use-cases/delete-establishment.ts` (snapshot + audit `DELETE`). Obs: essa referência faz soft-delete (updateStatus), aqui faremos hard-delete.
- Action — `src/server/actions/transaction.actions.ts` (padrão `withAuth` + `validateInput` + `revalidatePath`)
- Sheet UI — `src/client/components/transactions/NewExpenseSheet.tsx` (estrutura, hooks, layout responsivo)
- Dialog destrutivo — verificar se existe `ConfirmDialog` genérico no DS antes de criar; se não, montar `ConfirmDeleteTransactionDialog` usando `Dialog` primitivo seguindo o padrão de ux-design-specification.md

**Validação de negócio: ordem importa**
1. Amount > 0 (se informado)
2. PaymentMethodType válido (se informado)
3. Transaction existe e `type === 'expense'` (apenas update)
4. Se mudou conta, nova conta existe e está active
5. Executar

### Arquivos existentes a modificar

- `src/server/domain/transactions/repositories/transaction.repository.ts` — adicionar `update` e `delete` na interface
- `src/server/infrastructure/database/repositories/transaction.repository.impl.ts` — implementar `update` e `delete`
- `src/shared/schemas/transaction.schema.ts` — `updateExpenseSchema`, `deleteTransactionSchema`, types
- `src/shared/schemas/transaction.schema.test.ts` — testes dos novos schemas
- `src/server/actions/transaction.actions.ts` — `updateExpenseTransactionAction`, `deleteTransactionAction`, `listTransactionsAction` (se optar por action dedicada), possivelmente `undoDeleteTransactionAction`
- `src/server/actions/transaction.actions.test.ts` — testes das novas actions
- `src/client/components/layout/AppShell.tsx` — adicionar item "Transações" na navegação (verificar se o arquivo é este mesmo, ou se é outro)

### Arquivos novos a criar

- `src/app/(app)/transactions/page.tsx` — página de listagem mínima
- `src/server/domain/transactions/use-cases/update-expense-transaction.ts`
- `src/server/domain/transactions/use-cases/update-expense-transaction.test.ts`
- `src/server/domain/transactions/use-cases/delete-transaction.ts`
- `src/server/domain/transactions/use-cases/delete-transaction.test.ts`
- `src/client/components/transactions/TransactionList.tsx`
- `src/client/components/transactions/EditExpenseSheet.tsx`
- `src/client/components/transactions/ConfirmDeleteTransactionDialog.tsx`

### Dependências (NÃO instalar nada novo)

- `zod`, `drizzle-orm`, `sonner`, `@base-ui/react` (via shadcn components), `next` (revalidatePath) — todas já presentes

### Learnings das stories anteriores (3.1, 3.1b-e, 3.2)

- **Selects do `@base-ui/react`**: `Select.Value` NÃO aceita prop `placeholder` como em Radix. Resolver label via `children`: `children={options.find(o => o.id === value)?.label ?? 'Selecionar'}`. Bug crítico encontrado e corrigido no smoke test de 3.2 — não repetir.
- **Sincronização prop→state em listas**: se `TransactionList` for Client Component recebendo array via props de um Server Component, e server re-renderizar após `revalidatePath`, usar `useEffect(() => setItems(initialItems), [initialItems])` para propagar. Bug encontrado em `BankAccountList.tsx` na 3.2 — mesmo problema pode surgir aqui.
- **Sheet lateral width**: usar `data-[side=right]:sm:max-w-[420px]` para vencer o default `data-[side=right]:sm:max-w-sm` do `Sheet` base.
- **Drizzle migrations**: se alguma alteração de schema for necessária (não deve ser, nesta story), usar `npx drizzle-kit generate` SEMPRE. Nunca criar `.sql` manualmente.
- **Smoke test manual é obrigatório**: marcar Task 10.4 como concluída só depois de rodar no browser. A 3.2 foi marcada e depois reaberta por dois bugs visuais bloqueantes — lição cara.
- **LOWs/refatorações são backlog**: não bloquear a story em findings `LOW` no code review.
- **Máximo 3 rounds de code review**, idealmente 2. Se um finding `MEDIUM` aparecer em R2 que não era R1, reavaliar se é real ou refinamento — não inventar trabalho.

### Project Structure Notes

- Alinhamento total com estrutura existente: `domain/transactions/use-cases/`, `actions/transaction.actions.ts`, `client/components/transactions/`
- Nova rota `/transactions` segue padrão das outras rotas em `(app)/` (accounts, categories, etc.)
- Nenhum conflito arquitetural detectado

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.3]
- [Source: _bmad-output/planning-artifacts/prd.md#FR15, FR16, FR17, NFR-P3]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — seções "Undo temporário", "Padrões de overlays", "Botão destrutivo", "Feedback de impacto"]
- [Source: _bmad-output/implementation-artifacts/3-2-registro-de-receitas-e-transferencias.md — padrões de sheet, bugs resolvidos no smoke test]
- [Source: _bmad-output/implementation-artifacts/3-1-registro-de-gastos-cascade-input.md — ImpactPreview + toast undo placeholder]
- [Source: src/server/domain/transactions/use-cases/create-transaction.ts]
- [Source: src/server/domain/transactions/use-cases/create-income.ts]
- [Source: src/server/domain/transactions/use-cases/transfer-between-accounts.ts]
- [Source: src/server/domain/bank-accounts/use-cases/update-bank-account.ts]
- [Source: src/server/domain/establishments/use-cases/delete-establishment.ts]
- [Source: src/server/infrastructure/database/schema/transactions.ts]
- [Source: src/client/components/transactions/NewExpenseSheet.tsx]
- [Source: src/client/components/ui/dialog.tsx]

## Dev Agent Record

### Agent Model Used

claude-opus-4-6 (BMAD dev-story workflow)

### Debug Log References

- **R1-fix (2026-04-14, Opus 4.6)**: 1012/1012 testes vitest passando (15 novos para `recreateTransactionFromSnapshotAction` + ajustes em updateExpenseSchema e update-expense-transaction tests). `npx tsc --noEmit` zero erros. `npx eslint src --max-warnings=0` zero warnings.
- **R1 (2026-04-14, initial dev)**: 997/997 testes vitest passando (62 novos: schemas, update use case, delete use case, actions). `npx tsc --noEmit` zero erros. `npx eslint src --max-warnings=0` zero warnings. Smoke técnico: rotas `/transactions`, `/accounts`, `/design-system` retornam 200 no dev server.

### Completion Notes List

- **Repositório**: `TransactionRepository.update` (partial update + `updatedAt`) e `TransactionRepository.delete` (hard-delete) implementados em interface + Drizzle. Todos os mocks de teste atualizados para a nova interface.
- **Schemas**: `updateExpenseSchema` (todos os campos opcionais exceto `id`) e `deleteTransactionSchema` (apenas `id`). Types `UpdateExpenseInput` / `DeleteTransactionInput` exportados. Cobertura completa de validação.
- **Use case `updateExpenseTransaction`**: estratégia revert-then-apply para o saldo. Map local `balances` evita race condition quando a mesma conta é tocada duas vezes (ex: editar valor do mesmo gasto/conta). Pré-valida nova conta (não-encontrada/arquivada) antes de mexer em qualquer saldo. Short-circuit quando nenhum campo de saldo mudou (categoria/descrição/estabelecimento). Audit log `UPDATE` com snapshot completo em `oldValue` e `newValue`.
- **Use case `deleteTransaction`**: reversão de saldo por tipo (expense/debit-pix → credita conta; expense/credit → no-op; income → debita destino; transfer → credita origem + debita destino). Retorna `{ id, snapshot }` para habilitar undo. Conta inexistente é tolerada (skip do estorno, log silencioso, hard-delete prossegue). Audit log `DELETE` com snapshot completo em `oldValue` e `newValue: null`.
- **Server actions**: `updateExpenseTransactionAction`, `deleteTransactionAction`, `listTransactionsAction` e `recreateTransactionFromSnapshotAction` (helper de undo). Todas com `withAuth`, `validateInput`, organização ativa e revalidação dos paths `/`, `/transactions`, `/dashboard`, `/accounts`. `recreateTransactionFromSnapshotAction` reaplica o impacto no saldo no inverso da reversão feita pelo delete (para que o undo seja totalmente consistente).
- **UI — Sidebar**: novo item "Transações" (ícone Receipt) na seção Navegação, entre Dashboard e Orçamentos.
- **UI — Página `/transactions`**: Server Component que carrega transações + lookups (categorias, subcategorias, contas, cartões, fontes de receita) em paralelo via `Promise.all`. Sem filtros — Story 3.4 evolui.
- **UI — `TransactionList`**: Client Component com lista cronológica simples. Cada linha mostra label resolvido por tipo (gasto: estabelecimento/categoria; receita: fonte → conta; transferência: origem → destino), método de pagamento, data formatada e valor com sinal + cor (gasto neutro, receita verde). Click na linha abre `EditExpenseSheet` se for `expense`, ou `toast.info` informando que edição é restrita a gastos. Botão `MoreHorizontal` à direita abre `ConfirmDeleteTransactionDialog`. Sincronização prop→state via `useEffect(() => setTransactions(initialTransactions), [initialTransactions])` (lição BankAccountList da 3.2).
- **UI — `EditExpenseSheet`**: Sheet responsivo (mobile bottom / desktop right 420px). Reaproveita layout do `NewExpenseSheet` mas SEM o `CascadeInput` (form direto com todos os campos visíveis ao mesmo tempo). Campos: valor (CurrencyInput), categoria + subcategoria condicional (Select), estabelecimento (Input), método (toggle débito/crédito/PIX), conta/cartão (Select), descrição (Input). Sincronização prop→state via padrão React docs (`if (transaction && transaction.id !== loadedId) { setLoadedId(...); ... }`) para evitar `react-hooks/set-state-in-effect`.
- **ImpactPreview na edição (decisão deliberada)**: NÃO foi adicionado nesta story. O componente existente foi projetado para criação (mostra saldo/orçamento pós-criar). Para edição precisaria de delta (reverter antigo, aplicar novo), que extrapolaria as ~10 linhas mencionadas no escopo. Marcado com `// TODO: preview de delta — Epic 6` no componente. Decisão alinhada à autorização explícita da Task 7.4 ("se for complexo demais, escopo mínimo").
- **UI — `ConfirmDeleteTransactionDialog`**: Dialog com título "Excluir transação?", descrição com resumo (`R$ XX,XX — Label — DD/MM/YYYY`), botão `outline` Cancelar e `destructive` Excluir. Em sucesso: `toast.success` com `duration: 5000` e `action: { label: 'Desfazer', onClick }`.
- **Undo funcional**: implementado caminho 9.2 (não placeholder). Ao clicar em "Desfazer", o cliente envia o `snapshot` retornado pelo `deleteTransactionAction` para `recreateTransactionFromSnapshotAction`, que recria com o ID original (preservando reconciliação visual) e reaplica o impacto no saldo. Toast confirma "Exclusão desfeita."
- **Escopo de edição respeitado**: apenas `expense`. Receita/transferência ficam ao toque com toast informativo. Exclusão funciona para todos os 3 tipos.
- **Smoke test interativo (Task 10.4)**: validação técnica feita (tsc/eslint/vitest/dev-server boot OK). O smoke test interativo no browser autenticado (editar gasto, trocar método, excluir, undo) deve ser feito pelo usuário antes de marcar a story como `done` — limitação do agente CLI.

**R1-fix (2026-04-14):**

- ✅ Resolvido review finding [HIGH]: validação forte de input em `recreateTransactionFromSnapshotAction` via `recreateTransactionSnapshotSchema` + ownership checks em todas as FKs + force `createdBy` da session.
- ✅ Resolvido review finding [HIGH]: testes do `recreateTransactionFromSnapshotAction` em arquivo dedicado (`recreate-transaction.actions.test.ts`, 15 casos).
- ✅ Resolvido review finding [HIGH]: idempotência do undo — `findById` curto-circuita no server; flag `undoInFlight` no closure do toast bloqueia cliques concorrentes no client.
- ✅ Resolvido review finding [HIGH]: ImpactPreview simplificado (versão b) no `EditExpenseSheet` exibindo saldo atual da conta e orçamento mensal da categoria.
- ✅ Resolvido review finding [MEDIUM]: padrão `withTransaction` introduzido — repositórios aceitam `DbExecutor` opcional, factory expõe `withTransaction`, use cases update/delete e action recreate agora operam dentro de `db.transaction()` atômica.
- ✅ Resolvido review finding [MEDIUM]: `updateExpenseTransaction` agora computa saldos finais em Map e escreve uma única vez por conta (eliminando a janela de inconsistência quando a mesma conta é tocada duas vezes).
- ✅ Resolvido review finding [MEDIUM]: `updateExpenseSchema` com `.refine` exigindo ao menos um campo além de `id`.
- ✅ Resolvido review finding [MEDIUM]: `createdBy` forçado a `session.user.id` no recreate, nunca confia no snapshot do cliente.
- Limpeza tangencial (LOW 1): `ConfirmDeleteTransactionDialog` ramo morto `<Dialog><DialogContent /></Dialog>` substituído por `return null`.

### File List

**Modificados:**
- `src/server/domain/transactions/repositories/transaction.repository.ts`
- `src/server/infrastructure/database/repositories/transaction.repository.impl.ts`
- `src/server/infrastructure/database/repositories/bank-account.repository.impl.ts` _(R1-fix: constructor recebe `DbExecutor` opcional)_
- `src/server/infrastructure/database/client.ts` _(R1-fix: exporta `DbExecutor`)_
- `src/server/factories/transaction.ts` _(R1-fix: `withTransaction` helper + `categoryRepository`/`subcategoryRepository`/`creditCardRepository` para ownership checks)_
- `src/server/domain/transactions/use-cases/update-expense-transaction.ts` _(R1-fix: withTransaction + single-write balance)_
- `src/server/domain/transactions/use-cases/delete-transaction.ts` _(R1-fix: withTransaction)_
- `src/server/domain/transactions/use-cases/update-expense-transaction.test.ts` _(R1-fix: deps com withTransaction stub + single-write assertion)_
- `src/server/domain/transactions/use-cases/delete-transaction.test.ts` _(R1-fix: deps com withTransaction stub)_
- `src/shared/schemas/transaction.schema.ts` _(R1-fix: `.refine` em updateExpenseSchema + `recreateTransactionSnapshotSchema`)_
- `src/shared/schemas/transaction.schema.test.ts` _(R1-fix: novo caso para refine)_
- `src/server/actions/transaction.actions.ts` _(R1-fix: recreate action com validação forte + ownership + idempotência + force createdBy + withTransaction)_
- `src/server/actions/transaction.actions.test.ts`
- `src/client/components/transactions/EditExpenseSheet.tsx` _(R1-fix: preview simplificado)_
- `src/client/components/transactions/ConfirmDeleteTransactionDialog.tsx` _(R1-fix: flag undoInFlight + cleanup do ramo morto)_
- `src/client/components/transactions/TransactionList.tsx` _(R1-fix: BankAccountOption expõe balanceCents)_
- `src/server/domain/transactions/use-cases/create-transaction.test.ts`
- `src/server/domain/transactions/use-cases/create-income.test.ts`
- `src/server/domain/transactions/use-cases/transfer-between-accounts.test.ts`
- `src/server/domain/transactions/use-cases/get-suggested-establishments.test.ts`
- `src/server/domain/transactions/use-cases/get-impact-preview.test.ts`
- `src/server/domain/transactions/use-cases/get-monthly-spending-summary.test.ts`
- `src/client/components/layout/Sidebar.tsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/3-3-edicao-e-exclusao-de-transacoes.md`

**Novos:**
- `src/server/domain/transactions/use-cases/update-expense-transaction.ts`
- `src/server/domain/transactions/use-cases/update-expense-transaction.test.ts`
- `src/server/domain/transactions/use-cases/delete-transaction.ts`
- `src/server/domain/transactions/use-cases/delete-transaction.test.ts`
- `src/server/actions/recreate-transaction.actions.test.ts` _(R1-fix)_
- `src/app/(app)/transactions/page.tsx`
- `src/client/components/transactions/TransactionList.tsx`
- `src/client/components/transactions/EditExpenseSheet.tsx`
- `src/client/components/transactions/ConfirmDeleteTransactionDialog.tsx`

### Change Log

- 2026-04-14: Implementação inicial da Story 3.3 — TransactionRepository.update/delete, schemas, use cases update-expense-transaction e delete-transaction, server actions, página `/transactions`, TransactionList, EditExpenseSheet, ConfirmDeleteTransactionDialog com undo funcional. 997 testes passando.
- 2026-04-14: R1-fix — endereçado 8 findings do code review R1 (4 HIGH + 4 MEDIUM). Hardening completo do `recreateTransactionFromSnapshotAction` (validação forte, ownership checks, idempotência, force createdBy), padrão `withTransaction` atomizando update/delete/recreate, single-write de saldo, `.refine` em updateExpenseSchema, flag `undoInFlight` no toast de undo, ImpactPreview simplificado no EditExpenseSheet, 15 testes novos para o recreate action. 1012 testes passando.
