# Story 3.4c: Refatoração da tela `/transactions` com novos componentes DS + summary backend

Status: backlog

<!-- Bloqueada pela Story 3.4b (componentes DS precisam estar prontos). Ao iniciar, mover para ready-for-dev (no sprint-status.yaml e no Status acima). -->
<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a usuário da tela `/transactions`,
I want a tela usar os novos componentes do Design System (linha de transação canônica, cards de resumo do período, barra de filtros + sheet), com totais agregados do backend respeitando os filtros ativos,
so that vejo de relance quanto gastei/recebi/transferi no período filtrado, com a melhor experiência visual e padrões reutilizáveis em todo o app.

## Acceptance Criteria

1. **Given** o usuário acessa `/transactions` **When** a página renderiza **Then** vê 3 cards de resumo (Saídas/Entradas/Transferências) acima da barra de filtros mostrando totais e counts agregados pelo backend para o período filtrado **And** os cards atualizam a cada mudança de filtro (tipo, mês, categoria, método, busca) **And** a query do summary roda em paralelo com a listagem (Promise.all no SSR e no refresh) — sem latência adicional perceptível.

2. **Given** o backend precisa expor a agregação **When** o consumer chama `getTransactionPeriodSummaryAction(filters)` **Then** retorna `{ expense: { totalCents, count }, income: { totalCents, count }, transfer: { totalCents, count } }` **And** os filtros aplicados (tipo, categoria, método, data, busca) refletem no resultado igual ao `listTransactionsAction` **And** uma única query agregada SQL é executada (`GROUP BY type` + `SUM` + `count`) sem queries N+1.

3. **Given** o usuário visualiza a lista **When** cada transação renderiza **Then** usa o componente `TransactionRow` (`@/client/components/ui/transaction-row`) com `type` correspondente, ícone correto (emoji da categoria para `expense`; lucide `ArrowDownLeft` para `income`; lucide `ArrowLeftRight` para `transfer`), `primary`/`secondary` corretos, `method` formatado (`{bank} · {name}` para débito/pix; `{brand} {name}` para crédito; ausente para transferência), `transferEndpoints` para transferências, `onClick` abre `EditExpenseSheet` (gastos) ou toast informativo (receita/transferência), `onAction` abre `ConfirmDeleteTransactionDialog` — comportamento idêntico ao da Story 3.4 atual.

4. **Given** o usuário usa filtros **When** vê a barra **Then** usa `TransactionFiltersBar` com busca, segmented control de tipo, pílula de mês (com seleção via `<select>` nativo ou `Popover` — escolha do consumer) e botão "Filtros" com badge de count **And** ao clicar "Filtros" abre `TransactionFiltersSheet` com listas de Categoria e Método de Pagamento checkboxáveis (multi-seleção, estado local, commit no Aplicar) **And** abaixo da barra renderiza chips de filtros ativos (categorias + métodos selecionados) com botão "Limpar tudo" que **só** limpa categorias + métodos (mantém tipo/mês/busca intactos).

5. **Given** os componentes ad-hoc da Story 3.4 não devem mais existir **When** a refatoração estiver completa **Then** os arquivos `src/client/components/transactions/TransactionListRow.tsx`, `TransactionListFilters.tsx` e `TransactionListFilters.test.tsx` são deletados **And** todos os imports antigos foram migrados para os componentes DS de `@/client/components/ui/` **And** `npx tsc --noEmit` continua passando.

6. **Given** os comportamentos da 3.4 devem ser preservados **When** o smoke test manual roda **Then** scroll infinito funciona (IntersectionObserver, `requestId` race-safe), agrupamento por dia continua ("Hoje"/"Ontem"/`dd/MM/yyyy`), debounce 300ms na busca, edit/delete refresca a lista e o summary com os filtros atuais, undo de delete funciona, empty state filtrado mostra "Limpar filtros" — todos os 7 ACs originais da Story 3.4 continuam passando.

7. **Given** o `emoji` da categoria é necessário para o ícone das linhas de gasto **When** o `TransactionList` recebe `categories` **Then** a interface `CategoryOption` inclui `emoji?: string`, e o `buildIcon` helper usa `cat.emoji` quando presente, fallback para letra inicial maiúscula da categoria, fallback final `?`.

8. **Given** a action de summary é nova **When** os testes rodam **Then** há cobertura unitária para o use case `getTransactionPeriodSummary` (filtros aplicados, count e total corretos por tipo, retorno de zeros quando vazio, validação dos filtros), para o método `aggregateByTypeForOrganizationFiltered` do repository (mockado), e para o action `getTransactionPeriodSummaryAction` (validação, org ativa, propagação de erros).

9. **Given** a story está completa **When** a validação roda **Then** `npx tsc --noEmit` 0 erros, `npx eslint src --max-warnings=0` 0 warnings, `npx vitest run` 100% passando, `npx next build` limpa **And** smoke test manual em browser autenticado com dados reais valida todos os ACs sem regressões.

## Tasks / Subtasks

### Fase 0: Design System & Protótipos (Obrigatória para stories com UI)

- [ ] Task 0: Consultar Design System e protótipos relevantes
  - [ ] 0.1: **Pré-requisito:** Story 3.4b deve estar `done` — os 4 componentes DS (`TransactionRow`, `TransactionSummaryCards`, `TransactionFiltersBar`, `TransactionFiltersSheet`) precisam existir em `src/client/components/ui/`. Confirmar antes de iniciar.
  - [ ] 0.2: Ler protótipo canônico `_bmad-output/prototypes/proto-18-tela-transacoes.html` — visual de referência da tela final
  - [ ] 0.3: Ler spec completa `_bmad-output/prototypes/proto-18-tela-transacoes-spec.md` — esta story implementa as **seções 6, 7, 9** da spec (backend + consumer + arquivos deletados)
  - [ ] 0.4: Consultar `/design-system` no browser — testar os 3 componentes novos da 3.4b interativamente para entender props e comportamento
  - [ ] 0.5: Confirmar componentes UI a importar (todos vêm da 3.4b):
    - `TransactionRow` de `@/client/components/ui/transaction-row`
    - `TransactionSummaryCards` de `@/client/components/ui/transaction-summary-cards`
    - `TransactionFiltersBar` de `@/client/components/ui/transaction-filters-bar`
    - `TransactionFiltersSheet` de `@/client/components/ui/transaction-filters-sheet`
  - [ ] 0.6: **NÃO criar componentes UI novos nesta story** — todo o visual já está em DS. Esta story só refatora `TransactionList.tsx` e cria backend.

### Fase 1: Backend — Repository com agregação por tipo

- [ ] Task 1 (AC: #2): Estender `TransactionRepository` com método de agregação filtrada
  - [ ] 1.1: Adicionar à interface em `src/server/domain/transactions/repositories/transaction.repository.ts`:
    ```ts
    aggregateByTypeForOrganizationFiltered(
      organizationId: string,
      filters: {
        types?: Array<'expense' | 'income' | 'transfer'>;
        categoryIds?: string[];
        paymentMethodIds?: string[];
        dateFrom?: Date;
        dateTo?: Date;
        search?: string;
        searchAmountCents?: number | null;
      },
    ): Promise<Array<{ type: 'expense' | 'income' | 'transfer'; totalCents: number; count: number }>>;
    ```
  - [ ] 1.2: Implementar em `DrizzleTransactionRepository` (`src/server/infrastructure/database/repositories/transaction.repository.impl.ts`):
    - Reusar a função interna que monta o WHERE de `findByOrganizationFiltered` (extrair como helper privado se necessário, **respeitando o escape de LIKE** com `escapeLikePattern` já existente da Story 3.4 R2)
    - Query Drizzle:
      ```ts
      const results = await this.executor
        .select({
          type: transactions.type,
          totalCents: sql<number>`COALESCE(SUM(${transactions.amountCents}), 0)`.as('total_cents'),
          count: count(),
        })
        .from(transactions)
        .where(and(...conditions))
        .groupBy(transactions.type);
      ```
    - Retornar mapped: `{ type, totalCents: Number(r.totalCents), count: Number(r.count) }`. Tipos cast para `'expense' | 'income' | 'transfer'`.
  - [ ] 1.3: **DRY**: idealmente extrair o builder de WHERE em um helper privado dentro do `repository.impl.ts` (ex: `buildFilterConditions(orgId, filters)`) e usar tanto em `findByOrganizationFiltered` quanto em `aggregateByTypeForOrganizationFiltered`. Isso garante consistência de filtros entre listagem e summary. **Se a refatoração ficar muito invasiva, deixar para uma story de cleanup futura** — comentar com `// TODO: extrair builder compartilhado` e seguir.
  - [ ] 1.4: Adicionar testes em `transaction.repository.impl.test.ts` (já existe da 3.4 R2):
    - 6+ casos cobrindo: sem filtros (3 tipos), filtro por tipo, filtro por categoria, filtro por método, filtro por período, filtro combinado, busca textual com escape

### Fase 2: Domain — Use case `getTransactionPeriodSummary`

- [ ] Task 2 (AC: #2): Criar use case
  - [ ] 2.1: Criar `src/server/domain/transactions/use-cases/get-transaction-period-summary.ts`:
    ```ts
    export interface GetTransactionPeriodSummaryParams {
      organizationId: string;
      filters: {
        types?: TransactionTypeFilter[];
        categoryIds?: string[];
        paymentMethodIds?: string[];
        dateFrom?: Date;
        dateTo?: Date;
        search?: string;
        searchAmountCents?: number | null;
      };
    }
    export interface TransactionPeriodSummary {
      expense: { totalCents: number; count: number };
      income: { totalCents: number; count: number };
      transfer: { totalCents: number; count: number };
    }
    export async function getTransactionPeriodSummary(
      deps: { repository: TransactionRepository },
      params: GetTransactionPeriodSummaryParams
    ): Promise<Result<TransactionPeriodSummary>> {
      const rows = await deps.repository.aggregateByTypeForOrganizationFiltered(
        params.organizationId,
        params.filters,
      );
      const summary: TransactionPeriodSummary = {
        expense:  { totalCents: 0, count: 0 },
        income:   { totalCents: 0, count: 0 },
        transfer: { totalCents: 0, count: 0 },
      };
      for (const r of rows) summary[r.type] = { totalCents: r.totalCents, count: r.count };
      return ok(summary);
    }
    ```
  - [ ] 2.2: **Reusar** o helper `parseSearchAmountCents` exportado pelo `list-transactions.ts` (ou refatorar para módulo compartilhado se ambos usarem) para parsear "42,50" → 4250. Isso garante consistência: o que filtra na lista também filtra no summary.
  - [ ] 2.3: Criar `get-transaction-period-summary.test.ts`:
    - Sem dados → retorna 3 tipos com totalCents=0, count=0
    - Com dados → soma e count corretos por tipo
    - Filtros aplicados (mock do repo retornando subset filtrado) — propaga corretamente
    - Mesmo input de filtro que `listTransactions` produz → mesmo set de transações considerado (regressão guard)

### Fase 3: Server action

- [ ] Task 3 (AC: #2): Criar `getTransactionPeriodSummaryAction`
  - [ ] 3.1: Em `src/server/actions/transaction.actions.ts`, adicionar:
    ```ts
    export const getTransactionPeriodSummaryAction = withAuth(async (session, input: unknown) => {
      const validation = validateInput(listTransactionsFilterSchema.optional(), input);
      if (!validation.success) return validation;
      const organizationId = getOrganizationId(session);
      if (!organizationId) {
        return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa.');
      }
      const filters = validation.data ?? {};
      // parsear searchAmountCents igual ao listTransactionsAction
      const searchAmountCents = filters.search
        ? parseSearchAmountCents(filters.search)
        : null;
      return getTransactionPeriodSummary(transactionDeps, {
        organizationId,
        filters: { ...filters, searchAmountCents },
      });
    });
    ```
  - [ ] 3.2: Reusar `listTransactionsFilterSchema` (já existe da 3.4) — **NÃO** criar schema duplicado. As propriedades `limit` e `offset` do schema serão **ignoradas** (summary não pagina) — ou usar `omit({ limit: true, offset: true })` para um schema dedicado. Decidir e documentar.
  - [ ] 3.3: Adicionar `getTransactionPeriodSummary` em `transactionDeps` (`src/server/factories/transaction.ts`) se o padrão de injeção for via factory.
  - [ ] 3.4: Adicionar testes em `transaction.actions.test.ts`:
    - Validação de input inválido
    - Org ativa ausente
    - Propagação de erro do domain
    - Caminho feliz (mock do use case)

### Fase 4: SSR — `page.tsx`

- [ ] Task 4 (AC: #1): Atualizar `src/app/(app)/transactions/page.tsx`
  - [ ] 4.1: Adicionar `getTransactionPeriodSummaryAction({})` ao `Promise.all` existente:
    ```ts
    const [tx, summary, accounts, cards, ...] = await Promise.all([
      listTransactionsAction({}),
      getTransactionPeriodSummaryAction({}),
      listBankAccountsAction(undefined),
      listCreditCardsAction(undefined),
      listIncomeSourcesAction(undefined),
      listCategoriesAction(undefined),
    ]);
    ```
  - [ ] 4.2: Passar `initialSummary={summary.data}` para `<TransactionList />`. Definir o tipo no `TransactionList` props.
  - [ ] 4.3: Garantir que `categories.data` carrega `emoji` (confirmado pela 3.4b) — se algum mapeamento intermediário desconsiderar `emoji`, ajustar.
  - [ ] 4.4: Tratar erro do `summary` graciosamente — se `summary` falhar mas a lista funcionar, renderizar a tela com `initialSummary` undefined e o componente mostra cards zerados ou skeleton.

### Fase 5: Client — Refatoração do `TransactionList.tsx`

- [ ] Task 5 (AC: #3, #4, #6, #7): Refatorar `src/client/components/transactions/TransactionList.tsx`
  - [ ] 5.1: Adicionar prop `initialSummary?: TransactionPeriodSummary` e estado `const [summary, setSummary] = useState(initialSummary)`. Sincronização prop→state via `useEffect(() => setSummary(initialSummary), [initialSummary])` (lição 3.2/3.3).
  - [ ] 5.2: Estender `CategoryOption` interface com `emoji?: string`.
  - [ ] 5.3: Substituir o map atual `transactions.map(tx => <TransactionListRow ... />)` por `<TransactionRow ... />` usando os helpers:
    - `buildIcon(tx, categories)` (spec 7.2) — emoji ou letra para gasto, lucide para receita/transferência
    - `buildMethod(tx, bankAccounts, creditCards)` (spec 7.2) — formatação de método
    - `buildPrimary(tx)` — `establishment` para gasto, "Receita" ou similar para income, undefined para transfer
    - `buildSecondary(tx, categories, incomeSources)` — nome da categoria para gasto, fonte de receita ou label para income, "Transferência" para transfer
    - `buildTransferEndpoints(tx, bankAccounts)` — só para transferência: source/destination com bank
  - [ ] 5.4: Substituir `<TransactionListFilters .../>` por:
    ```tsx
    <TransactionFiltersBar
      search={filters.search}
      type={filters.type}
      month={filters.month}
      activeFiltersCount={filters.categoryIds.size + filters.paymentMethodIds.size}
      onSearchChange={(v) => setFilters(f => ({ ...f, search: v }))}
      onTypeChange={(t) => setFilters(f => ({ ...f, type: t }))}
      onMonthChange={(m) => setFilters(f => ({ ...f, month: m }))}
      onOpenAdvancedFilters={() => setSheetOpen(true)}
    />
    <TransactionFiltersSheet
      open={sheetOpen}
      onOpenChange={setSheetOpen}
      categories={categories}
      paymentMethods={paymentMethods}
      selectedCategoryIds={filters.categoryIds}
      selectedPaymentMethodIds={filters.paymentMethodIds}
      onApply={({ categoryIds, paymentMethodIds }) => {
        setFilters(f => ({ ...f, categoryIds, paymentMethodIds }));
        setSheetOpen(false);
      }}
      onClear={...}
    />
    ```
  - [ ] 5.5: Renderizar `<TransactionSummaryCards ...summary />` **acima** do `TransactionFiltersBar`. Variante de loading enquanto refetch acontece (`isSummaryLoading`).
  - [ ] 5.6: Adicionar fetch do summary no `loadPage(0, ...)` e em paralelo com `listTransactionsAction`:
    ```ts
    const [pageRes, summaryRes] = await Promise.all([
      listTransactionsAction({ ...effectiveFilters, limit: 50, offset }),
      getTransactionPeriodSummaryAction(effectiveFilters),
    ]);
    if (requestId === requestIdRef.current) {
      setSummary(summaryRes.data ?? undefined);
      // ... resto do handling
    }
  ```
  - [ ] 5.7: **NÃO** refetch o summary em `loadMore` (scroll infinito) — summary não muda quando carrega mais páginas, só quando filtros mudam.
  - [ ] 5.8: Renderizar chips de filtros ativos abaixo do `TransactionFiltersBar` (spec 4.4):
    ```tsx
    {(filters.categoryIds.size > 0 || filters.paymentMethodIds.size > 0) && (
      <div className="flex flex-wrap gap-1.5 items-center mt-3">
        {Array.from(filters.categoryIds).map(catId => {
          const cat = categories.find(c => c.id === catId);
          if (!cat) return null;
          return (
            <Chip key={catId} onRemove={() => toggleCategory(catId)}>
              {cat.emoji} {cat.name}
            </Chip>
          );
        })}
        {Array.from(filters.paymentMethodIds).map(...)}
        <button onClick={clearAdvancedFilters} className="text-xs italic text-muted-foreground ml-2 hover:text-foreground">
          Limpar tudo
        </button>
      </div>
    )}
    ```
  - [ ] 5.9: `clearAdvancedFilters()` zera APENAS `categoryIds` e `paymentMethodIds`. Mantém `type`, `month`, `search` intactos (spec 5.3).
  - [ ] 5.10: Manter o resto do `TransactionList`:
    - Debounce da busca (300ms)
    - Scroll infinito com IntersectionObserver
    - `requestId` race-safe
    - Agrupamento por dia ("Hoje"/"Ontem"/`dd/MM/yyyy`)
    - `EditExpenseSheet` para gastos, toast informativo para receita/transferência
    - `ConfirmDeleteTransactionDialog` para deleção
    - `onSaved` e `onDeleted` callbacks rebuscam a página atual com `loadPage(0)`

### Fase 6: Deleção dos componentes ad-hoc

- [ ] Task 6 (AC: #5): Deletar arquivos não usados
  - [ ] 6.1: Confirmar via `grep -r 'TransactionListRow' src/` que não há mais imports de `TransactionListRow`. Se houver, migrar antes de deletar.
  - [ ] 6.2: Deletar `src/client/components/transactions/TransactionListRow.tsx`
  - [ ] 6.3: Confirmar via `grep -r 'TransactionListFilters' src/` que não há mais imports.
  - [ ] 6.4: Deletar `src/client/components/transactions/TransactionListFilters.tsx`
  - [ ] 6.5: Deletar `src/client/components/transactions/TransactionListFilters.test.tsx`
  - [ ] 6.6: Rodar `npx tsc --noEmit` para confirmar zero erros (nada importava esses arquivos).

### Fase 7: Atualização dos testes do `TransactionList`

- [ ] Task 7 (AC: #6, #9): Adaptar `TransactionList.test.tsx`
  - [ ] 7.1: Atualizar mocks para incluir `categories` com `emoji`, `initialSummary`, e novos props.
  - [ ] 7.2: Mockar os 4 componentes DS importados (ou usar render real — decidir):
    - **Render real** é melhor (testa integração), mas pode quebrar se algum DOM/hook do componente DS não funcionar em jsdom. Tentar primeiro.
    - Se complicado: mockar com `vi.mock('@/client/components/ui/transaction-row', ...)` retornando placeholders.
  - [ ] 7.3: Adicionar testes:
    - Render dos cards de summary com `initialSummary` correto
    - Mudança de filtro dispara refetch do summary (via spy/mock do `getTransactionPeriodSummaryAction`)
    - Chips ativos aparecem abaixo da barra quando há `categoryIds`/`paymentMethodIds` selecionados
    - "Limpar tudo" zera só categorias+métodos
    - `TransactionRow` recebe icons corretos (emoji para gasto, lucide para outros)
    - Comportamento de edit/delete continua funcionando (regressão da 3.4)
  - [ ] 7.4: **Manter** os testes da 3.4 que ainda fazem sentido (scroll infinito, debounce, agrupamento).

### Fase 8: Validação

- [ ] Task 8 (AC: #9): Validações finais
  - [ ] 8.1: `npx tsc --noEmit` — 0 erros
  - [ ] 8.2: `npx eslint src --max-warnings=0` — 0 warnings
  - [ ] 8.3: `npx vitest run` — 100% passando, sem regressões
  - [ ] 8.4: `npx next build` — build limpa
  - [ ] 8.5: **Smoke test manual em `/transactions`** (OBRIGATÓRIO):
    - 3 cards de summary aparecem com totais corretos do mês inicial
    - Mudar tipo (Saídas) → cards atualizam mostrando só saídas
    - Mudar mês → cards atualizam
    - Abrir Sheet de filtros, marcar 2 categorias → cards atualizam após Aplicar; chips aparecem abaixo da barra
    - Clicar "Limpar tudo" → categorias/métodos limpam, mas o tipo "Saídas" e o mês permanecem
    - Buscar "merc" → cards atualizam considerando a busca
    - Buscar "42,50" → cards atualizam pelo valor
    - Linha de gasto: clicar abre `EditExpenseSheet`; clicar no `MoreVertical` abre confirm dialog (não abre o sheet de edição) — testar `stopPropagation`
    - Linha de receita: clicar mostra toast informativo; clicar no `MoreVertical` abre confirm
    - Linha de transferência: vê `BankLogo` x2 + nomes dos bancos (em mobile < 380px nomes somem); clicar mostra toast; `MoreVertical` abre confirm
    - Editar um gasto → lista E summary refrescam mantendo filtros ativos
    - Excluir uma transação → lista E summary refrescam; undo funciona
    - Scroll infinito carrega mais páginas (mas summary NÃO refetcha — confirma economia)
    - Lista vazia por filtros → empty state com "Limpar filtros"
    - Resize para mobile (~375px) → cards compactos aparecem, segmented mostra "Transf." abreviado, transferência colapsa nomes dos bancos
  - [ ] 8.6: Commit + push + PR conforme MEMORY.md (`epic-3/3-4c-refatoracao-tela-transacoes`).

### Fase 9: Review Follow-ups (AI)

<!-- Será preenchido pelo code review adversarial. Severidade MEDIUM/HIGH é blocking. -->

## Dev Notes

### Design System & Protótipos

**Protótipos relevantes:**
- `_bmad-output/prototypes/proto-18-tela-transacoes.html` — visual canônico da tela final
- `_bmad-output/prototypes/proto-18-tela-transacoes-spec.md` — **fonte canônica**, esta story implementa as **seções 6, 7, 9** (backend + consumer + arquivos deletados)

**Componentes DS a importar (vindos da Story 3.4b):**
- `src/client/components/ui/transaction-row.tsx` — `TransactionRow` para cada item da lista
- `src/client/components/ui/transaction-summary-cards.tsx` — `TransactionSummaryCards` acima dos filtros
- `src/client/components/ui/transaction-filters-bar.tsx` — `TransactionFiltersBar` (busca + segmented + pílula mês + botão filtros)
- `src/client/components/ui/transaction-filters-sheet.tsx` — `TransactionFiltersSheet` (categoria + método em side sheet)

**Componentes UI já existentes (continuam usando):**
- `src/client/components/transactions/EditExpenseSheet.tsx` (Story 3.3 — não alterar)
- `src/client/components/transactions/ConfirmDeleteTransactionDialog.tsx` (Story 3.3 — não alterar)
- `src/client/components/ui/empty-state.tsx` — empty state para lista vazia filtrada
- `src/client/components/ui/page-header.tsx`, `breadcrumb.tsx`, `sonner.tsx` — toast informativo

**Componente novo necessário?**
- **Não.** Toda a UI vem da 3.4b. Esta story é **pure consumer + backend**. Se durante a implementação surgir necessidade visual nova (ex: chip remover ainda não existe como componente), seguir o workflow:
  1. Documentar em Completion Notes
  2. Decidir: criar como subcomponente interno do `TransactionList.tsx` (rápido) OU pausar e criar workflow DS (correto, mas adia)
  3. Recomendado: subcomponente interno + flag para futura extração se for usado em outras telas

**Regras visuais obrigatórias:**
- NÃO hardcodar hex — usar tokens do DS (incluindo `--color-negative` adicionado pela 3.4b)
- NÃO criar variações dos componentes DS — se a prop não existe, é decisão do DS, não consumer
- Componente novo necessário? Workflow formal (ver bloco acima)

### Decisões Técnicas

**Por que summary é uma action separada (e não embutida no `listTransactions`):**
- (a) Separation of concerns: paginação é uma coisa, agregação é outra
- (b) Summary não muda em scroll infinito (só em mudança de filtro) — economia de queries
- (c) Cacheável independentemente
- (d) Reutilizável em outras telas (dashboard, drill-down)

**Por que summary roda em paralelo (Promise.all) e não em sequência:**
- Latência total = max(listQuery, summaryQuery) em vez de soma. Como ambas tocam a mesma tabela com filtros similares, custos são parecidos. Sem ganho em sequenciar.

**Estado local do `summary` no `TransactionList`:**
- `useState(initialSummary)` + `useEffect(() => setSummary(initial), [initial])` (sync com SSR)
- Em mudanças de filtro, refetch via `Promise.all([listAction, summaryAction])` no `loadPage(0)`
- Race condition: usar o mesmo `requestIdRef` da listagem — só commita se `requestId` ainda é o atual. Isso evita summary antigo sobrescrever novo se usuário mudar filtros rápido.

**`getTransactionPeriodSummaryAction({})` no SSR — retorno vazio é problema?**
- Não. Sem filtros, retorna totais de **todas** as transações da org. Se o objetivo for "totais do mês atual" no SSR, passar `{ dateFrom, dateTo }` do mês atual. Decidir: se a tela inicializa com mês "todos" (Story 3.4 começa assim), summary inicial cobre tudo. Se inicializar com mês atual (decisão de produto), passar `{ dateFrom, dateTo }`.
- **Decisão da spec proto-18:** parece que cards mostram "Saídas no mês" — então deveriam refletir o mês selecionado. Se o estado inicial é "todos os meses", o label "no mês" fica enganoso. Conversar com UX se for caso. **Manter "todos" como default** (alinhado com 3.4) e ajustar label do componente DS se necessário em uma próxima rodada.

**Helpers `buildIcon`/`buildMethod`/`buildPrimary`/`buildSecondary`/`buildTransferEndpoints`:**
- Manter no mesmo arquivo `TransactionList.tsx` (ou em `transaction-list-helpers.ts` adjacente). Não exportar para o DS — são lógica de domínio do consumer, não props gerais.
- Cobrir com testes unitários (ou indiretamente via `TransactionList.test.tsx`).

**Por que `clearAdvancedFilters` (chip "Limpar tudo") só limpa categorias+métodos:**
- Tipo, mês e busca têm UIs próprias visíveis na barra. Se o usuário quer limpar esses, ele clica diretamente no controle correspondente (clica em "Tudo" no segmented, escolhe "todos os meses", apaga a busca). "Limpar tudo" abaixo dos chips é especificamente para "limpar os filtros avançados que abri no sheet".

**Reutilização do `escapeLikePattern` (Story 3.4 R2):**
- O helper já está exportado em `src/server/infrastructure/database/repositories/transaction.repository.impl.ts`. Reusar dentro de `aggregateByTypeForOrganizationFiltered` para escape consistente.

**Refatoração do builder de WHERE (DRY):**
- `findByOrganizationFiltered` e `aggregateByTypeForOrganizationFiltered` compartilham 100% do WHERE. Extrair `buildFilterConditions(orgId, filters): SQL[]` é a coisa certa.
- Se a refatoração se mostrar invasiva (mudanças nos testes existentes), fazer em commit separado dentro desta story para facilitar review. Ou deixar como TODO para uma story de cleanup.

**Tratamento de erro do summary:**
- Se `summaryRes.success === false`, manter `summary` no último valor conhecido (ou `undefined`) — **não** travar a tela. Usuário ainda vê a lista.
- Toast opcional de erro (decidir UX).

### Padrões de código a seguir (referências)

- **Use case com agregação:** ver `src/server/domain/transactions/use-cases/get-monthly-spending-summary.ts` (provavelmente faz algo similar)
- **Server action delegando para use case:** ver `src/server/actions/transaction.actions.ts#listTransactionsAction` (já existe)
- **Refatoração com Promise.all no SSR:** padrão já em uso em `src/app/(app)/transactions/page.tsx` da Story 3.4
- **Componente DS controlado:** ver os 4 componentes criados na 3.4b
- **Sincronização prop→state:** `useEffect(() => setX(initial), [initial])` — lição BankAccountList da 3.2
- **Race condition em fetch:** padrão `requestIdRef.current` da Story 3.4

### Arquivos novos a criar

- `src/server/domain/transactions/use-cases/get-transaction-period-summary.ts`
- `src/server/domain/transactions/use-cases/get-transaction-period-summary.test.ts`

### Arquivos existentes a modificar

- `src/server/domain/transactions/repositories/transaction.repository.ts` — adicionar `aggregateByTypeForOrganizationFiltered` à interface
- `src/server/infrastructure/database/repositories/transaction.repository.impl.ts` — implementar; possivelmente extrair `buildFilterConditions` helper compartilhado com `findByOrganizationFiltered`
- `src/server/infrastructure/database/repositories/transaction.repository.impl.test.ts` — adicionar testes da agregação
- `src/server/actions/transaction.actions.ts` — adicionar `getTransactionPeriodSummaryAction`
- `src/server/actions/transaction.actions.test.ts` — adicionar testes da nova action
- `src/server/factories/transaction.ts` (se aplicável) — incluir `getTransactionPeriodSummary` em `transactionDeps`
- `src/app/(app)/transactions/page.tsx` — adicionar `getTransactionPeriodSummaryAction({})` ao Promise.all + passar `initialSummary`
- `src/client/components/transactions/TransactionList.tsx` — refatoração principal (importa 4 componentes DS, adiciona summary state, helpers `buildIcon`/`buildMethod`/etc, chips ativos, "Limpar tudo")
- `src/client/components/transactions/TransactionList.test.tsx` — adaptar para novos componentes e summary

### Arquivos a deletar

- `src/client/components/transactions/TransactionListRow.tsx`
- `src/client/components/transactions/TransactionListFilters.tsx`
- `src/client/components/transactions/TransactionListFilters.test.tsx`

### Dependências (NÃO instalar nada novo)

- Nenhuma. Tudo já está em uso.

### Learnings das stories anteriores (3.4 + 3.4b)

- **Race condition em fetch debounced** — usar `requestIdRef.current` (counter incremental) e só aplicar resultado se id bate. Aplicar **também** ao summary no `Promise.all`.
- **Chips de filtro de método só de contas/cartões ativos** — Story 3.4 R2 estabeleceu que `activeBankAccounts`/`activeCreditCards` (filtrados por `status === 'active'`) são passados aos componentes de filtro, mas listas completas vão para `TransactionRow`/`EditExpenseSheet` para resolver labels históricos. Manter esse padrão. Adaptar para passar `activeBankAccounts`/`activeCreditCards` ao novo `TransactionFiltersSheet` (via helper `buildPaymentMethodOptions`) — listas completas continuam disponíveis para `buildMethod` em `TransactionRow`.
- **Escape de wildcards LIKE** — usar `escapeLikePattern` no `aggregateByType`. Já testado, só reutilizar.
- **Selects `@base-ui/react`**: `Select.Value` NÃO aceita `placeholder`. Lição da 3.2.
- **localStorage mock necessário em testes JSDOM** — Node 22+ (CLAUDE.md).
- **Drizzle migrations**: `npx drizzle-kit generate` — esta story NÃO precisa de migration (só queries novas sobre tabelas existentes).
- **Smoke test manual é obrigatório** — não marcar `Task 8.5` como concluído sem rodar no browser.
- **Não pedir refatorações em code review** — LOWs viram backlog. Pré-validar a refatoração do `buildFilterConditions` para não virar discussão posterior.
- **Não criar findings novos em R2** — R2 valida fixes de R1.
- **`useEffect(() => setX(initial), [initial])`** para sync prop→state em listas Client Component.

### Project Structure Notes

- Alinhamento total com estrutura: `domain/transactions/use-cases/`, `actions/transaction.actions.ts`, `client/components/transactions/`
- Rota `/transactions` já existe — só refatora conteúdo do `TransactionList`
- **Sem migrations de DB** — apenas queries novas sobre tabelas existentes
- 3 arquivos serão deletados; 8 arquivos modificados; 2 arquivos novos

### References

- [Source: _bmad-output/prototypes/proto-18-tela-transacoes-spec.md] — **fonte canônica** desta story (seções 6, 7, 9)
- [Source: _bmad-output/prototypes/proto-18-tela-transacoes.html] — visual canônico da tela final
- [Source: _bmad-output/implementation-artifacts/3-4-listagem-e-historico-de-transacoes.md] — Story 3.4 (lista de filtros e ad-hocs a remover; padrões de race condition, debounce, scroll infinito a manter)
- [Source: _bmad-output/implementation-artifacts/3-4b-componentes-ds-transacoes.md] — Story 3.4b (componentes DS importados aqui — pré-requisito)
- [Source: _bmad-output/implementation-artifacts/3-3-edicao-e-exclusao-de-transacoes.md] — `EditExpenseSheet` e `ConfirmDeleteTransactionDialog` (não alterar)
- [Source: src/server/domain/transactions/use-cases/list-transactions.ts] — `parseSearchAmountCents` helper a reutilizar
- [Source: src/server/infrastructure/database/repositories/transaction.repository.impl.ts] — `escapeLikePattern` (R2 da 3.4) + `findByOrganizationFiltered` (base do WHERE a compartilhar)
- [Source: src/server/actions/transaction.actions.ts] — `listTransactionsAction` + `listTransactionsFilterSchema`
- [Source: src/app/(app)/transactions/page.tsx] — Promise.all + props para `TransactionList`
- [Source: src/client/components/transactions/TransactionList.tsx] — alvo principal da refatoração

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
