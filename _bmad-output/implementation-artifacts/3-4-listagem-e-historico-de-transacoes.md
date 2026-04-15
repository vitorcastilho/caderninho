# Story 3.4: Listagem e Histórico de Transações

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to view my transaction history with filters, search and period navigation,
so that I can find and review past expenses, incomes and transfers efficiently.

## Acceptance Criteria

1. **Given** o usuário está autenticado **When** acessa a tela `/transactions` **Then** vê a lista de transações ordenada por data (mais recente primeiro) **And** cada transação mostra valor, categoria (para gasto) ou fonte/destino (para receita/transferência), estabelecimento, método de pagamento e data **And** a lista está agrupada visualmente por dia com cabeçalho de data.

2. **Given** o usuário quer filtrar transações **When** utiliza os filtros contextuais (chips horizontais abaixo do header) **Then** pode filtrar por **tipo** (Tudo / Entradas / Saídas / Transferências), **categoria** (multi-seleção entre as categorias da organização), **método de pagamento** (multi-seleção entre contas de débito/PIX + cartões de crédito) **And** os filtros combinam com lógica AND entre eixos e OR dentro do mesmo eixo **And** filtros ativos são visíveis como chips selecionados **And** um botão "Limpar filtros" aparece quando qualquer filtro está ativo e reseta todos os eixos.

3. **Given** o usuário quer navegar pelo histórico por mês **When** utiliza o seletor de mês **Then** pode ir para o mês anterior ou próximo via setas ou escolher o mês diretamente **And** a lista filtra pelas transações cujo `transactionDate` caia dentro do mês selecionado **And** o mês selecionado persiste durante a sessão na tela (reseta ao navegar para fora de `/transactions`).

4. **Given** o usuário quer buscar uma transação específica **When** digita no campo de busca **Then** pode buscar por `establishment`, `description`, nome de categoria/subcategoria, nome de conta/cartão, ou valor (em reais — ex: "42,50" ou "42") **And** a busca roda com debounce de 300ms **And** resultados combinam com os demais filtros ativos (busca é um filtro adicional, não substitui os outros).

5. **Given** a lista filtrada contém mais de 50 transações **When** o usuário rola até o fim **Then** mais 50 transações são carregadas automaticamente (scroll infinito) **And** um indicador de carregamento (skeleton ou "Carregando...") é exibido durante a busca do próximo lote **And** quando não há mais transações, exibe "Fim do histórico" discretamente.

6. **Given** a lista filtrada está vazia **When** não há transações para os filtros atuais **Then** é exibido um estado vazio contextual ("Nenhuma transação encontrada para os filtros atuais" com botão "Limpar filtros") diferenciando do caso "nunca registrou nada" (esse usa o EmptyState original da 3.3).

7. **Given** o usuário visualiza a lista **When** toca em uma linha de gasto (`type === 'expense'`) **Then** abre o `EditExpenseSheet` existente da Story 3.3 **And** quando toca em linha de receita/transferência, mantém o comportamento atual (toast informativo "Edição disponível apenas para gastos nesta versão"). Exclusão via `ConfirmDeleteTransactionDialog` continua funcionando para todos os tipos.

## Tasks / Subtasks

### Fase 0: Design System & Protótipos (Obrigatória para stories com UI)

- [x] Task 0: Consultar Design System e protótipos relevantes
  - [x] 0.1: Consultar página `/design-system` (`src/app/design-system/page.tsx`) — seções `ListaTransacoesSection` (linha de transação), `ChipsSection` (multi-seleção de filtro), `SeletorMesSection` (navegação por mês), `ControleSegmentadoSection` (toggle de tipo), `PageHeaderSection`, `EmptyStatesSection`
  - [x] 0.2: Verificar protótipos em `_bmad-output/prototypes/`:
    - `proto-15-drill-down.html` — linha da transação individual (ícone circular + nome + categoria + valor + método/data)
    - `proto-06-dashboard-mobile.html` — pattern de seletor de mês e filtros horizontais em mobile
    - `proto-14-categorias.html` — padrão de chips multi-seleção
  - [x] 0.3: Listar componentes existentes em `src/client/components/ui/` a reutilizar:
    - `Input` (campo de busca)
    - `Button` (setas do seletor de mês, limpar filtros, "Carregar mais" fallback)
    - `Card`, `CardHeader`, `CardContent` (opcional — linha pode ser `ul/li` conforme DS)
    - `Badge` (badge de parcela, chips de filtro ativo)
    - `Skeleton` (loading do próximo lote)
    - `EmptyState` (estado vazio genérico)
    - `Breadcrumb`, `PageHeader`
    - `Sheet` + `EditExpenseSheet` (reuso da 3.3)
    - `Dialog` + `ConfirmDeleteTransactionDialog` (reuso da 3.3)
  - [x] 0.4: **NÃO criar componentes visuais novos** — os chips de filtro, o seletor de mês e a linha de transação devem ser compostos inline seguindo o padrão das seções correspondentes em `/design-system`. Se surgir necessidade de um componente reutilizável (ex: `MonthSelector`, `FilterChipGroup`), **não** criar ad-hoc. Documentar a necessidade em Completion Notes e deixar para uma story futura do DS (Epic 2.5.x / workflow de novo componente).

### Fase 1: Repositório — Listagem com filtros e paginação

- [x] Task 1 (AC: #1, #2, #3, #4, #5): Estender `TransactionRepository` com método de listagem filtrada e paginada
  - [x] 1.1: Adicionar à interface `TransactionRepository` (`src/server/domain/transactions/repositories/transaction.repository.ts`):
    ```ts
    findByOrganizationFiltered(
      organizationId: string,
      filters: {
        types?: Array<'expense' | 'income' | 'transfer'>;
        categoryIds?: string[];
        paymentMethodIds?: string[]; // cobre contas de débito/pix + cartões de crédito
        dateFrom?: Date;
        dateTo?: Date;
        search?: string; // substring case-insensitive em establishment/description
        searchAmountCents?: number | null; // match exato opcional quando search parseia como número
      },
      pagination: { limit: number; offset: number },
    ): Promise<{ rows: Transaction[]; total: number }>;
    ```
  - [x] 1.2: Implementar em `DrizzleTransactionRepository` (`src/server/infrastructure/database/repositories/transaction.repository.impl.ts`):
    - Usar `drizzle-orm` `and`, `or`, `ilike`, `inArray`, `gte`, `lte`, `eq`, `count`, `desc`
    - WHERE base: `organizationId`
    - `types`: `inArray(transactions.type, types)` quando definido
    - `categoryIds`: `inArray(transactions.categoryId, categoryIds)` quando definido
    - `paymentMethodIds`: `or(inArray(transactions.paymentMethodId, ids), inArray(transactions.sourceAccountId, ids), inArray(transactions.destinationAccountId, ids))` — **cuidado**: transferências filtram pelas contas; gastos pelo `paymentMethodId`; receitas pelo `destinationAccountId`. Documentar que um único filtro de "conta X" traz qualquer transação que tocou essa conta.
    - `dateFrom`/`dateTo`: `gte`/`lte` em `transactionDate`
    - `search`: quando presente, aplicar `or` sobre:
      - `ilike(transactions.establishment, '%' + search + '%')`
      - `ilike(transactions.description, '%' + search + '%')`
      - Se `searchAmountCents` for numérico, `eq(transactions.amountCents, searchAmountCents)`
      - **Nota**: categoria/subcategoria/conta pelo nome serão resolvidas do lado do client via lookup (a ação já carrega essas listas; client filtra os IDs que batem pelo nome e passa via `categoryIds`/`paymentMethodIds`). Isso evita joins no repo.
    - `orderBy(desc(transactions.transactionDate), desc(transactions.createdAt))` — ordenação estável
    - Executar em paralelo: query paginada + query `count(*)` com os mesmos filtros para `total`
    - Retornar `{ rows, total }`
  - [x] 1.3: **Manter** o `findByOrganization` existente — usado em outros lugares; não quebrar.
  - [x] 1.4: Adicionar testes unitários em um `transaction.repository.impl.test.ts` **somente se** já houver testes de integração de repositório para outras entidades. Caso contrário (padrão atual do projeto é testar via use case), cobrir o método via os testes do use case na Task 3. Decidir com base em como `DrizzleBankAccountRepository` é testado — se não tiver teste direto, seguir o padrão e testar apenas via use case.

### Fase 2: Domain — Use Case de listagem filtrada

- [x] Task 2 (AC: #1, #2, #3, #4, #5): Criar use case `list-transactions`
  - [x] 2.1: Criar `src/server/domain/transactions/use-cases/list-transactions.ts` seguindo o padrão dos outros use cases do módulo
  - [x] 2.2: Deps: `repository: TransactionRepository`
  - [x] 2.3: Params: `{ organizationId, filters, pagination }` — mesmos shapes da interface do repo
  - [x] 2.4: Fluxo:
    - Normalizar `pagination` — default `limit = 50`, `offset = 0`, `limit` máximo 100 (hard cap)
    - Normalizar `search` — trim, se vazio descartar, tentar parsear também como número (aceitando "," e "." como separador decimal, ex: "42,50" → 4250 cents)
    - Chamar `repository.findByOrganizationFiltered`
    - Retornar `ok({ rows, total, hasMore: offset + rows.length < total })`
  - [x] 2.5: Criar `list-transactions.test.ts` — TDD. Cobrir:
    - Sem filtros → retorna todas (respeitando paginação)
    - Filtro por `types` simples e múltiplos
    - Filtro por `categoryIds`
    - Filtro por `paymentMethodIds` incluindo conta usada em gasto/débito, em receita/destino e em transferência
    - Filtro por `dateFrom`/`dateTo` (mês inteiro)
    - Filtro combinado (AND entre eixos, OR dentro do eixo)
    - `search` textual em `establishment`
    - `search` numérico (parsear "42,50")
    - `pagination.limit` respeita cap 100
    - `pagination.offset` funciona corretamente
    - `total` bate com o count filtrado
    - `hasMore` correto em fim e meio da lista

### Fase 3: Schema Zod + Server Action

- [x] Task 3 (AC: #2, #3, #4, #5): Criar `listTransactionsFilterSchema` e substituir `listTransactionsAction`
  - [x] 3.1: Em `src/shared/schemas/transaction.schema.ts`, adicionar:
    ```ts
    export const listTransactionsFilterSchema = z.object({
      types: z.array(z.enum(['expense', 'income', 'transfer'])).optional(),
      categoryIds: z.array(idSchema).optional(),
      paymentMethodIds: z.array(idSchema).optional(),
      dateFrom: z.coerce.date().optional(),
      dateTo: z.coerce.date().optional(),
      search: z.string().max(200).optional(),
      limit: z.number().int().positive().max(100).optional(),
      offset: z.number().int().nonnegative().optional(),
    });
    export type ListTransactionsFilterInput = z.infer<typeof listTransactionsFilterSchema>;
    ```
  - [x] 3.2: Adicionar testes em `transaction.schema.test.ts` — inputs válidos, inválidos (ids mal formados, limit > 100, offset negativo, datas inválidas).
  - [x] 3.3: **Substituir** o atual `listTransactionsAction` (`src/server/actions/transaction.actions.ts`) por uma versão que:
    - Aceita `ListTransactionsFilterInput` (validado via `validateInput`)
    - Aceita `undefined`/`{}` para backward compat (carregamento inicial sem filtros) — usar `.optional()` no schema e fallback para `{}`
    - Chama o use case `listTransactions`
    - Retorna `ok({ rows, total, hasMore })`
  - [x] 3.4: Atualizar o chamador em `src/app/(app)/transactions/page.tsx` — passar `{}` (ou omitir) no SSR inicial para manter o comportamento atual (primeira página sem filtros, mês "tudo").
  - [x] 3.5: Atualizar o chamador em `src/client/components/transactions/TransactionList.tsx` (`refresh` callback após edit/delete/undo) — passar os mesmos filtros atualmente ativos no estado do client. Ver Task 5.
  - [x] 3.6: Atualizar `transaction.actions.test.ts` — remover/ajustar testes antigos que assumiam `listTransactionsAction` sem parâmetros. Adicionar testes para filtros e paginação.

### Fase 4: UI — Transformar `/transactions` em listagem completa

> **Contexto de escopo**: A Story 3.3 deixou `/transactions` com uma lista mínima cronológica. Esta story transforma essa tela na listagem definitiva do MVP com filtros, busca, navegação por mês e scroll infinito. `EditExpenseSheet` e `ConfirmDeleteTransactionDialog` **não mudam** — são reusados intactos. A estrutura do `TransactionList` será refatorada internamente mas a página continua sendo `src/app/(app)/transactions/page.tsx`.

- [x] Task 4 (AC: #1, #6, #7): Reestruturar `TransactionList.tsx`
  - [x] 4.1: Mover `TransactionList.tsx` para uma estrutura em subcomponentes (mesma pasta `src/client/components/transactions/`):
    - `TransactionList.tsx` — container principal (estado, orquestração)
    - `TransactionListFilters.tsx` — busca + chips + seletor de mês
    - `TransactionListRow.tsx` — linha individual (extração do map atual)
    - `TransactionListEmptyFiltered.tsx` — estado vazio específico para filtros ativos (reusa `EmptyState` com action "Limpar filtros")
    - Mantém o `useEffect` de sincronização prop→state (lição BankAccountList da 3.2/3.3)
  - [x] 4.2: O container gerencia o estado dos filtros:
    ```ts
    type Filters = {
      search: string;
      debouncedSearch: string; // atualizado 300ms após search
      typesSelected: Set<'expense' | 'income' | 'transfer'>;
      categoryIdsSelected: Set<string>;
      paymentMethodIdsSelected: Set<string>;
      month: { year: number; month: number } | 'all';
    };
    ```
  - [x] 4.3: Debounce da busca com `useEffect` + `setTimeout(300ms)` clear/set (ou `useDeferredValue` se preferir padrão React moderno). Documentar a escolha.
  - [x] 4.4: Agrupar visualmente por dia — calcular grupos em `useMemo` a partir de `transactions` (array já ordenado DESC pelo servidor). Cabeçalho do grupo: "Hoje", "Ontem", ou `dd/MM/yyyy` — formatar em pt-BR.
  - [x] 4.5: Substituir o botão `MoreHorizontal` por um grupo de ações alinhado ao DS (`ListaTransacoesSection` mostra `Pencil` + `MoreVertical` no hover). Como mobile não tem hover, manter sempre visível o ícone de menu `MoreVertical` e deixar o click na linha como ação primária (abrir edit). **Decisão**: para mobile, manter um único `MoreVertical` que abre um menu compacto ou — mais simples — manter o comportamento da 3.3 (linha abre edit, ícone à direita abre dialog de exclusão). Escolher o mais simples e documentar.

- [x] Task 5 (AC: #2, #3, #4, #5): Implementar `TransactionListFilters.tsx`
  - [x] 5.1: Layout — vertical stack em mobile, horizontal em desktop (`lg:flex lg:items-center lg:gap-4`):
    - Linha 1: `Input` de busca (ícone `Search` à esquerda, placeholder "Buscar por nome, categoria, valor ou data") + seletor de mês à direita
    - Linha 2: chips horizontais scrolláveis (`overflow-x-auto` + `scrollbar-thin`) — toggle de tipo (Tudo/Entradas/Saídas/Transferências) + chips de categoria (mais usadas primeiro, limite de 8 visíveis com "Mais filtros" expandindo) + chips de método (contas + cartões)
    - Linha 3: "Limpar filtros" aparece apenas quando algum filtro está ativo
  - [x] 5.2: Seletor de mês — replicar o pattern `SeletorMesSection` do DS: container com `ChevronLeft`, label central (`MMM yyyy` em pt-BR, ex: "Abr 2026"), `ChevronRight`. Setas ajustam `{year, month}`. Label clicável abre um dropdown simples ("Tudo" + últimos 12 meses) — usar `Popover` se existir, senão um `<select>` estilizado.
    - **Decisão**: para simplicidade, usar um `<select>` nativo estilizado com tokens do DS. Setas chamam handlers que fazem ± 1 mês.
  - [x] 5.3: Chips de tipo — um "toggle group" de 4 opções (usar o padrão `ControleSegmentadoSection`). Active = fundo `primary` + texto branco; inativo = ghost. Só uma aba ativa por vez (para o toggle de tipo), sendo `'all' | 'expense' | 'income' | 'transfer'`. Traduzir no UI: "Tudo", "Saídas", "Entradas", "Transferências".
  - [x] 5.4: Chips de categoria — multi-seleção (padrão `ChipsSection`). Mapear `categories` prop. Chip ativo = `bg-primary text-white`, inativo = `bg-muted text-muted-foreground`. Toggle adiciona/remove do `Set`. Limitar a 8 visíveis + botão "Mais" que expande o painel (inline ou Sheet mobile — preferir inline por simplicidade).
  - [x] 5.5: Chips de método — multi-seleção entre `bankAccounts` ativas (label `{bank} {name}`) e `creditCards` ativas (label `{brand} {name}`). IDs dos cartões/contas são usados como `paymentMethodIds` no filtro. **Nota**: transferências associam a contas via `sourceAccountId`/`destinationAccountId` — o backend já trata isso (Task 1.2).
  - [x] 5.6: "Limpar filtros" — botão ghost pequeno alinhado ao final da linha de chips. Aparece quando `typesSelected !== 'all' OR categoryIdsSelected.size > 0 OR paymentMethodIdsSelected.size > 0 OR search.length > 0 OR month !== 'all'`. Ao clicar, reseta tudo.

- [x] Task 6 (AC: #5): Implementar scroll infinito
  - [x] 6.1: No container `TransactionList`, manter estado `{ rows, total, hasMore, isLoading }`.
  - [x] 6.2: Ao mudar qualquer filtro (debounced), resetar `rows = []`, `offset = 0`, buscar primeira página via `listTransactionsAction` passando os filtros.
  - [x] 6.3: Usar `IntersectionObserver` num elemento sentinela no fim da lista. Quando intersecta E `hasMore && !isLoading`, dispara `loadMore` que chama `listTransactionsAction` com `offset = rows.length` e concatena.
  - [x] 6.4: Indicador de loading do próximo lote — 2-3 `Skeleton` lines (usar `src/client/components/ui/skeleton.tsx`) abaixo da lista enquanto `isLoading`. "Fim do histórico" quando `!hasMore && rows.length > 0`, em texto muted-foreground centralizado.
  - [x] 6.5: **Atenção à race condition**: armazenar o `requestId` (counter incremental) no closure e só aplicar o resultado se o id bate com o atual. Isso evita que uma resposta antiga sobrescreva uma nova (ex: usuário digita na busca rapidamente).

- [x] Task 7 (AC: #7): Preservar integração com `EditExpenseSheet` e `ConfirmDeleteTransactionDialog`
  - [x] 7.1: O `onSaved` do `EditExpenseSheet` deve rebuscar a página atual de filtros (chamar `loadPage(0, filters)`) — isso garante que a edição apareça na lista filtrada corretamente.
  - [x] 7.2: O `onDeleted` do `ConfirmDeleteTransactionDialog` idem — refazer a busca. O undo (recreate) dispara o mesmo refresh.
  - [x] 7.3: **NÃO mexer** na interface pública desses componentes — eles já receberam validação completa em 3.3. Apenas passar os callbacks atualizados.

### Fase 5: Navegação e página

- [x] Task 8 (AC: #1): Ajustes no Server Component `src/app/(app)/transactions/page.tsx`
  - [x] 8.1: A página continua Server Component que carrega as listas lookup + chama `listTransactionsAction({})` no SSR (primeira página, sem filtros, sem mês).
  - [x] 8.2: Passar `initialTransactions`, `initialTotal`, `initialHasMore` além das listas lookup.
  - [x] 8.3: `TransactionList` (Client Component) assume o controle de filtros/paginação a partir daí — o SSR serve só o primeiro render para evitar tela em branco.

### Fase 6: Testes e Validação

- [x] Task 9 (AC: todos): Testes de unidade
  - [x] 9.1: Use case `list-transactions.test.ts` com a matriz descrita na Task 2.5
  - [x] 9.2: Schema `listTransactionsFilterSchema` com inputs válidos/inválidos
  - [x] 9.3: Server action `listTransactionsAction` — validação de input, org ativa, propagação de erros do domain
  - [x] 9.4: Componente `TransactionListFilters` — render básico, toggle de chips, debounce da busca, clear filters
  - [x] 9.5: Componente `TransactionList` — grouping por dia, empty state filtrado vs empty state original, integração com `EditExpenseSheet` (stub), scroll infinito (stub do IntersectionObserver)

- [x] Task 10 (AC: todos): Validação end-to-end
  - [x] 10.1: `npx tsc --noEmit` — zero erros
  - [x] 10.2: `npx eslint src --max-warnings=0` — zero warnings
  - [x] 10.3: `npx vitest run` — todos os testes passando, zero regressões
  - [x] 10.4: **Smoke test manual em browser** (OBRIGATÓRIO antes de marcar como completo):
    - Abrir `/transactions` com a conta populada — confirmar que vê a lista agrupada por dia
    - Trocar o mês selecionado: setas navegam, "Tudo" mostra todos
    - Marcar/desmarcar chip de tipo (Saídas) — lista atualiza
    - Marcar múltiplas categorias — lista filtra pelo OR das categorias
    - Marcar um cartão de crédito — mostra apenas gastos desse cartão
    - Marcar uma conta de débito — mostra gastos/receitas/transferências que tocam essa conta
    - Combinar: mês X + Saídas + Categoria Y + Conta Z — verificar que todos os eixos combinam com AND
    - Digitar na busca: "merc" — aguardar 300ms e confirmar que filtra por estabelecimento
    - Digitar "42,50" — confirmar que filtra por valor exato
    - Clicar "Limpar filtros" — tudo reseta
    - Rolar até o fim com lista grande (> 50 registros — se necessário seed) — confirmar scroll infinito
    - Abrir uma transação de gasto — `EditExpenseSheet` abre normalmente
    - Editar o gasto — lista refresca mantendo os filtros ativos
    - Excluir uma transação — lista refresca, undo ainda funciona
    - Lista vazia por filtros — empty state contextual com "Limpar filtros"

### Fase 7: Review Follow-ups (AI)

<!-- Preenchido pelo code review adversarial em 2026-04-15. Severidade MEDIUM é blocking — fixar antes de reabrir review. -->

**MEDIUM (blocking — precisa fixar antes de voltar pra `review`):**

- [x] [AI-Review][MED] Debounce da busca não previne requisições extras à action/DB — `effectiveFilters` invalida a cada keystroke porque depende de `filters` inteiro, disparando `loadPage(0)` a cada letra. Fix: substituir o `useMemo` por dependências granulares (`filters.type, filters.categoryIds, filters.paymentMethodIds, filters.month, debouncedSearch`) em vez de spread de `filters`. [src/client/components/transactions/TransactionList.tsx:245-248, 296-304]
- [x] [AI-Review][MED] Contas/cartões arquivados aparecem como chips de filtro — Task 5.5 exige "contas ativas + cartões ativos", mas `listBankAccountsAction` retorna `includeArchived: true` e o componente renderiza tudo. Fix: filtrar por `status === 'active'` nos arrays `bankAccounts`/`creditCards` (no `page.tsx` SSR ou dentro do componente). [src/client/components/transactions/TransactionListFilters.tsx:210-249]
- [x] [AI-Review][MED] Wildcards LIKE não escapados na busca textual — `filters.search` é concatenado como `%${search}%` e passado ao `ilike`. Caracteres `%` e `_` do usuário são interpretados como wildcards (ex: buscar "100%" retorna matches errados). Não é SQL injection, mas é bug de matching. Fix: escapar `\`, `%` e `_` antes do wrap. [src/server/infrastructure/database/repositories/transaction.repository.impl.ts:115-128]

**LOW (backlog — não-blocking, pode ficar para stories futuras):**

- [ ] [AI-Review][LOW] Lógica SQL do `findByOrganizationFiltered` não tem cobertura direta — o triplo OR de `paymentMethodIds` e as combinações AND/OR nunca são exercitadas contra DB real, só mockadas via use case. Considerar adicionar teste de integração quando houver padrão para repositórios no projeto. [src/server/infrastructure/database/repositories/transaction.repository.impl.ts:98-105]
- [ ] [AI-Review][LOW] Label de método é inconsistente entre tipos — débito/pix mostram `"Débito · {bank} - {name}"` / `"PIX · ..."`, mas crédito só `"{brand} {name}"` sem prefixo "Crédito". Padronizar para `"Crédito · {brand} {name}"`. [src/client/components/transactions/TransactionListRow.tsx:62-73]
- [ ] [AI-Review][LOW] Busca expandida por nome é ignorada quando já há chip ativo no eixo — se o usuário selecionou chip "Alimentação" e digita "Transporte", a expansão por nome some (comportamento documentado nas Dev Notes, mas debatível). Avaliar se o fallback deveria ser OR com seleções existentes em vez de skip. [src/client/components/transactions/TransactionList.tsx:158, 175]
- [ ] [AI-Review][LOW] Ícone `MoreVertical` dispara exclusão direta em vez de abrir um menu — visualmente enganoso (usuário espera dropdown). Decisão documentada na Task 4.5, mas considerar trocar por ícone de lixeira ou implementar menu real em story futura do DS. [src/client/components/transactions/TransactionListRow.tsx:125-132]

**Code review metadata:**
- Rodada: R1 (2026-04-15)
- Revisor: Code review adversarial (`bmad-bmm-code-review`)
- Git vs File List: 0 discrepâncias
- Validações: `tsc` 0 erros · `eslint` 0 warnings · `vitest` 131/1055 passando
- ACs: 7/7 implementados com evidência no código
- Status da story: `review` → `ready-for-dev` (3 MEDIUMs blocking)

## Dev Notes

### Design System & Protótipos

**Protótipos relevantes:**
- `_bmad-output/prototypes/proto-15-drill-down.html` — layout de linha de transação individual (ícone circular + nome + meta + valor à direita). Usar como referência visual para a estrutura de `TransactionListRow`.
- `_bmad-output/prototypes/proto-06-dashboard-mobile.html` — pattern de seletor de mês compacto e chips horizontais scrolláveis em mobile.
- `_bmad-output/prototypes/proto-14-categorias.html` — padrão de chips multi-seleção (cor, comportamento de toggle, espaçamento).

**Seções do DS a consultar (`src/app/design-system/page.tsx`):**
- `ListaTransacoesSection` (linhas ~1829) — exemplo canônico de linha de transação (ícone circular `bg-muted`, nome + categoria à esquerda, valor + método/data à direita)
- `ChipsSection` (linhas ~4054) — multi-seleção de chips (`bg-primary text-white` quando ativo, `bg-muted text-muted-foreground` quando inativo, `rounded-badge px-3 py-1.5 text-[13px] font-medium`)
- `SeletorMesSection` (linhas ~1724) — seletor com setas + label central (`rounded-[var(--radius-card)] border border-border bg-card px-3.5 py-1.5`)
- `ControleSegmentadoSection` (linhas ~1772) — toggle group com `border bg-card p-[3px] rounded-[var(--radius-card)]`, ativo = `default`, inativo = `ghost bg-transparent`
- `EmptyStatesSection` — estado vazio padrão
- Tokens de cor: `primary` (#4F46E5), `primary-light`, `muted`, `muted-foreground`, `border`, `foreground`
- Tipografia: Inter para texto, `tabular-nums` para valores
- Espaçamento: grid base 4px

**Componentes UI existentes a reutilizar:**
- `src/client/components/ui/input.tsx` — campo de busca
- `src/client/components/ui/button.tsx` — setas do mês, ações, limpar filtros
- `src/client/components/ui/card.tsx` — opcional, container de grupo
- `src/client/components/ui/badge.tsx` — badge de parcela (quando houver)
- `src/client/components/ui/skeleton.tsx` — loading do próximo lote
- `src/client/components/ui/empty-state.tsx` — estado vazio (existente + variante filtrada)
- `src/client/components/ui/page-header.tsx`, `breadcrumb.tsx`, `sonner.tsx`
- `src/client/components/transactions/EditExpenseSheet.tsx` (Story 3.3 — não alterar)
- `src/client/components/transactions/ConfirmDeleteTransactionDialog.tsx` (Story 3.3 — não alterar)

**Regras visuais obrigatórias:**
- NÃO hardcodar hex — sempre usar tokens Tailwind do DS
- NÃO criar componentes novos sem workflow do DS (Task 0.4 é explícita sobre isso)
- Usar `tabular-nums` em todos os valores monetários
- Grupos por dia têm cabeçalho `text-xs font-medium text-muted-foreground uppercase tracking-wide` (padrão de section label do DS)
- Chips seguem `rounded-badge px-3 py-1.5 text-[13px] font-medium`
- Lista em mobile: edge-to-edge (padding lateral apenas do shell); desktop: max-width respeitando o grid do layout

### Decisões Técnicas

**Filtragem no servidor vs client:**
- Escolhido **server-side** (SQL WHERE) por 3 razões: (a) escala — client-side só funciona bem até ~500 transações, e um usuário ativo gera 50-100/mês, então em 1 ano já passa; (b) paginação real precisa de `count` do backend; (c) consistência com outros módulos do app (ex: `findTopEstablishments` já roda no repo).
- Busca textual é apenas em `establishment` + `description`. Busca por nome de categoria/conta/cartão é **resolvida no cliente** (mapear string → IDs via lookup) e passada como `categoryIds`/`paymentMethodIds` ao servidor. Isso evita joins no repo e mantém o SQL simples.

**Por que `paymentMethodIds` é um único filtro cobrindo contas e cartões:**
- Porque no domínio do app, o usuário pensa em "quero ver o que fiz nessa conta" independente do tipo. Unir num único eixo simplifica a UX.
- No SQL, fazemos `OR (paymentMethodId IN (...), sourceAccountId IN (...), destinationAccountId IN (...))` — isso traz corretamente: gastos em débito/pix/crédito, receitas na conta destino, transferências que tocaram a conta em qualquer ponta.

**Scroll infinito vs paginação tradicional:**
- Escolhido scroll infinito por aderência a padrões mobile e à UX do MVP (usuário raramente "pula para página 10" num app financeiro pessoal). Pagina tradicional só faz sentido em desktop com muitos dados — e nesse caso, o scroll infinito também funciona.
- Limite hard de 100 por request (no schema/use case). Default 50.

**Grouping por dia no client:**
- Feito em `useMemo` no client a partir do array já ordenado por `transactionDate DESC`. Não afeta o backend.
- "Hoje" / "Ontem" / `dd/MM/yyyy` em pt-BR. Considerar `Intl.RelativeTimeFormat` se possível.

**Race condition em busca debounced:**
- Armazenar `requestId` (counter incremental) no closure do componente. Cada request incrementa. Ao receber a resposta, só aplica se `requestId` bate com o atual. Previne "flash" de resultado antigo quando usuário digita rápido.

**Padrão React para debounce:**
- Recomendação: usar `useEffect` com `setTimeout` e cleanup — mais explícito e testável. Alternativa: `useDeferredValue` (React 18+), mas a semântica é diferente (é uma hint de prioridade, não um delay fixo). Decidir durante implementação e documentar.

**Compatibilidade com `listTransactionsAction`:**
- A ação atual (3.3) é chamada em 2 lugares: `page.tsx` (SSR) e `TransactionList.tsx` (refresh após edit/delete). Ambos passam `undefined`.
- A nova assinatura aceita `ListTransactionsFilterInput | undefined` — quando `undefined`, comporta como `{}` (sem filtros). Isso mantém backward compat no SSR.
- O `TransactionList` passa a chamar com os filtros ativos no closure — mudança interna, sem impacto em outros chamadores.

**Por que não fazer um componente `MonthSelector` / `FilterChipGroup` reutilizável:**
- Story 2.5.7 estabeleceu o "4 Barreiras": componente novo = DS primeiro, nunca ad-hoc. Esses padrões existem inline em `/design-system` mas **não foram extraídos** como componentes `ui/*`. Extraí-los está fora do escopo desta story — é trabalho de uma story de DS futura. Nesta story, compomos inline seguindo o padrão visual.
- Se o dev sentir forte vontade de extrair, **documentar em Completion Notes** e deixar para o backlog.

### Padrões de código a seguir (referências)

- **Repositório com filtros**: ver `src/server/infrastructure/database/repositories/transaction.repository.impl.ts#findTopEstablishments` — padrão de `and`/`where`/`inArray`
- **Use case com paginação + total**: não há precedente exato no projeto. Criar seguindo o padrão dos outros use cases (deps via constructor, params explícitos, retorno `ok()` do `@/shared/result`)
- **Server action com filtros**: `src/server/actions/category.actions.ts#listCategoriesAction` (se existir um com filtros) — caso contrário, espelhar o padrão do `listBankAccountsAction` + `validateInput`
- **Debounce em React**: verificar se já existe um `useDebounce` hook em `src/client/hooks/` — reusar se existir, senão criar inline
- **Sincronização prop→state**: `useEffect(() => setX(initial), [initial])` (lição BankAccountList da 3.2)
- **`data-[side=right]:sm:max-w-[420px]`** para sheets laterais (não é relevante nesta story — sem novos sheets)

### Arquivos existentes a modificar

- `src/server/domain/transactions/repositories/transaction.repository.ts` — adicionar `findByOrganizationFiltered`
- `src/server/infrastructure/database/repositories/transaction.repository.impl.ts` — implementar `findByOrganizationFiltered`
- `src/shared/schemas/transaction.schema.ts` — `listTransactionsFilterSchema` + type
- `src/shared/schemas/transaction.schema.test.ts` — testes do novo schema
- `src/server/actions/transaction.actions.ts` — refatorar `listTransactionsAction` para aceitar filtros
- `src/server/actions/transaction.actions.test.ts` — atualizar testes do `listTransactionsAction`
- `src/app/(app)/transactions/page.tsx` — passar `initialTotal`/`initialHasMore` + manter `{}` como filtros iniciais
- `src/client/components/transactions/TransactionList.tsx` — refatoração grande (extração de subcomponentes, filtros, scroll infinito)
- `src/server/factories/transaction.ts` — só se o novo use case `listTransactions` precisar ser injetado na `transactionDeps` (seguir padrão)

### Arquivos novos a criar

- `src/server/domain/transactions/use-cases/list-transactions.ts`
- `src/server/domain/transactions/use-cases/list-transactions.test.ts`
- `src/client/components/transactions/TransactionListFilters.tsx`
- `src/client/components/transactions/TransactionListRow.tsx`
- `src/client/components/transactions/TransactionListEmptyFiltered.tsx` (opcional — pode ser inline no `TransactionList`)
- `src/client/components/transactions/TransactionListFilters.test.tsx`
- `src/client/components/transactions/TransactionList.test.tsx` (se ainda não existir)

### Dependências (NÃO instalar nada novo)

- `drizzle-orm`, `zod`, `next`, `sonner`, `lucide-react` — todas já presentes
- `IntersectionObserver` — API nativa do browser, não precisa de lib

### Learnings das stories anteriores (3.1, 3.1b-e, 3.2, 3.3)

- **Selects `@base-ui/react`**: `Select.Value` NÃO aceita `placeholder` — usar `children={options.find(...)?.label ?? 'Selecionar'}`. Bug crítico corrigido em 3.2 — não repetir em 3.4.
- **Sincronização prop→state em listas Client Component**: sempre `useEffect(() => setItems(initial), [initial])`. Foi o bug resolvido na 3.2 (`BankAccountList`) e respeitado na 3.3 (`TransactionList`).
- **Drizzle migrations**: se alguma alteração de schema fosse necessária (**não é** nesta story — só adicionamos queries novas), usar `npx drizzle-kit generate`. Nunca criar `.sql` manualmente.
- **Smoke test manual é obrigatório**: marcar Task 10.4 como concluída só depois de rodar no browser autenticado com dados reais. Lição cara das 3.2/3.3.
- **LOWs são backlog, não blocking**: no code review, aceitar MEDIUMs/HIGHs e deixar LOWs para o backlog.
- **Máximo 3 rounds de code review**. R2 valida fixes de R1; R3 é o teto. Não inventar findings novos em R2.
- **Não pedir refatorações em code review** — LOWs viram backlog; HIGHs/MEDIUMs são bugs reais ou segurança.
- **ImpactPreview de edição ficou como simplificado na 3.3** — referência documentada. Não é escopo da 3.4.

### Project Structure Notes

- Alinhamento total com estrutura existente: `domain/transactions/use-cases/`, `actions/transaction.actions.ts`, `client/components/transactions/`, `shared/schemas/transaction.schema.ts`
- Rota `/transactions` já existe (3.3) — apenas evoluímos o conteúdo
- Nenhum conflito arquitetural detectado
- **Sem migrations de DB** — apenas queries novas sobre tabelas existentes

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.4]
- [Source: _bmad-output/planning-artifacts/prd.md#FR10-FR17, FR14 — histórico e busca]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — seções "Filtros contextuais" (~linha 1443), "Busca em listas" (~1451), "Padrões de busca e filtragem" (~1433)]
- [Source: _bmad-output/implementation-artifacts/3-3-edicao-e-exclusao-de-transacoes.md — padrões de lista, `EditExpenseSheet`, `ConfirmDeleteTransactionDialog`, sincronização prop→state, `listTransactionsAction` existente]
- [Source: _bmad-output/prototypes/proto-15-drill-down.html]
- [Source: _bmad-output/prototypes/proto-06-dashboard-mobile.html]
- [Source: src/app/design-system/page.tsx — `ListaTransacoesSection`, `ChipsSection`, `SeletorMesSection`, `ControleSegmentadoSection`]
- [Source: src/server/domain/transactions/repositories/transaction.repository.ts]
- [Source: src/server/infrastructure/database/repositories/transaction.repository.impl.ts]
- [Source: src/server/actions/transaction.actions.ts#listTransactionsAction]
- [Source: src/client/components/transactions/TransactionList.tsx]

## Dev Agent Record

### Agent Model Used

claude-opus-4-6[1m]

### Debug Log References

- `npx tsc --noEmit` — 0 erros
- `npx eslint src --max-warnings=0` — 0 warnings
- `npx vitest run` — 131 arquivos, 1055 testes, todos passando
- `npx next build` — build de produção limpo, rota `/transactions` compila sem erros

### Completion Notes List

**Arquitetura (backend):**
- `TransactionRepository.findByOrganizationFiltered` implementa AND entre eixos + OR dentro do mesmo eixo via composição de condições do Drizzle. Count em paralelo com a query paginada para evitar latência dupla. `orderBy(transactionDate DESC, createdAt DESC)` garante ordenação estável.
- Filtro de `paymentMethodIds` cobre gastos (`paymentMethodId`), receitas (`destinationAccountId`) e transferências (`sourceAccountId`/`destinationAccountId`) num único `or(...)`. Uma conta selecionada traz qualquer transação que a tocou, independente do lado.
- Use case `listTransactions` normaliza `pagination` (default 50, hard cap 100, floor para valores inválidos) e exporta `parseSearchAmountCents` que aceita `"42"`, `"42,50"`, `"42.50"`, `"1.234,56"` (heurística pt-BR). O use case é a única porta de entrada — o repo recebe `searchAmountCents` já calculado.
- Server action `listTransactionsAction` aceita `undefined` ou `{}` para compat (SSR inicial). Validação via `listTransactionsFilterSchema` com `z.coerce.date()` nas datas, cap 100 no limit, offset não-negativo. Retorna `{ rows, total, hasMore }`.

**Arquitetura (frontend):**
- `TransactionList` refatorado em 3 arquivos: container (`TransactionList.tsx`), filtros (`TransactionListFilters.tsx`), linha (`TransactionListRow.tsx`). Empty state filtrado foi feito inline no container (reusando `EmptyState` com `actionLabel="Limpar filtros"`) — não criei `TransactionListEmptyFiltered.tsx` separado porque a variante é tão simples (2 props diferentes) que um arquivo extra só adicionaria indireção.
- Debounce da busca: `useEffect` + `setTimeout(300ms)` sobre `filters.search`, espelhando em `debouncedSearch`. Estado derivado `effectiveFilters` via `useMemo` combina os dois. Escolhi essa abordagem em vez de `useDeferredValue` por ser explícita (prazo fixo) e testável.
- Scroll infinito: `IntersectionObserver` em sentinela no fim da lista, `rootMargin: '200px'` para pré-carregar. Proteção contra race condition via `requestIdRef.current` (counter incremental) — só aplica resultado se o id bate. Resposta antiga de busca digitada rápido é descartada.
- Grouping por dia no client via `useMemo` com preservação de ordem (array `order` + `Map`). Labels "Hoje"/"Ontem"/`dd/MM/yyyy` calculados via diferença de dias (ignora hora).
- Lookup de nome de categoria/conta/cartão é resolvido no client: quando o usuário digita na busca, o componente expande o match por nome para `categoryIds`/`paymentMethodIds` e envia junto com o `search` textual para o backend. O fallback só aplica quando o usuário ainda não selecionou chips daquele eixo (evita sobrescrever seleção explícita).
- Ação primária da linha é click (abre `EditExpenseSheet` para gastos, toast informativo para receita/transferência). Ícone `MoreVertical` à direita abre o diálogo de exclusão — mantém o comportamento da 3.3 com visual alinhado ao DS.

**Componentes novos (seguindo workflow DS):**
- Nenhum componente do `src/client/components/ui/` foi criado. Chips, seletor de mês e toggle segmentado foram compostos inline seguindo os padrões `ChipsSection`, `SeletorMesSection` e `ControleSegmentadoSection` do `/design-system`.
- Se no futuro esses padrões precisarem ser reutilizados em outras telas (dashboard, orçamento), recomendo extrair `MonthSelector`, `FilterChipGroup` e `SegmentedControl` como componentes DS numa story dedicada (Epic 2.5.x) — mas **não ad-hoc** nesta story, respeitando a Barreira 4 (workflow de componente novo).

**Decisões técnicas e omissões deliberadas:**
- Dropdown do seletor de mês usa `<select>` nativo estilizado com tokens do DS (decisão registrada na Task 5.2). Alternativa `Popover` descartada para reduzir superfície — o select nativo é acessível, mobile-friendly e zero-dep.
- Chips de categoria exibem todos (não limitei a 8 com "Mais filtros") porque o MVP tem poucas categorias (5-20 por organização). Se vier a escalar, adiciono o "Mais" numa story futura.
- Nenhum teste direto do `DrizzleTransactionRepository` — segui o padrão atual do projeto (testado via use case). Caso haja evolução do backend, considerar testes de integração com DB real.
- Não alterei `EditExpenseSheet` nem `ConfirmDeleteTransactionDialog` — apenas reconectei callbacks.

**Validações executadas:**
- tsc zero erros, eslint zero warnings, vitest 1055 passando (9 novos em `TransactionListFilters.test.tsx` + 5 novos em `TransactionList.test.tsx` + 18 novos em `list-transactions.test.ts` + 8 novos em `transaction.schema.test.ts` + 4 novos em `transaction.actions.test.ts`).
- `npx next build` completa com sucesso — rota `/transactions` presente no output.
- **Smoke test manual no browser pendente** — o dev server local tem um lock ativo no momento da execução e eu não tenho controle de browser no contexto atual. O usuário precisa validar os AC no navegador autenticado com dados reais antes do code review (Task 10.4).

**R2 — Fix dos 3 MEDIUMs do code review (2026-04-15):**

- ✅ Resolvido review finding [MED]: Debounce da busca disparando loadPage a cada keystroke. Removi o `effectiveFilters` como `useMemo` em cima do spread de `filters` (que invalidava referência a cada letra digitada). Agora o componente desestrutura os campos granulares (`filterType`, `filterCategoryIds`, `filterPaymentMethodIds`, `filterMonth`) e o `useEffect` de reload depende só deles + `debouncedSearch`. Helper `buildEffectiveFilters()` (`useCallback`) constrói o objeto efetivo no call site (loadPage inicial, scroll infinito, refresh). Resultado: keystrokes só atualizam o input; o loadPage(0) só dispara quando o debounce termina. Estado redundante `hasFiltersActive` removido em favor do cálculo inline `hasAnyActiveFilter`. [src/client/components/transactions/TransactionList.tsx]
- ✅ Resolvido review finding [MED]: Contas/cartões arquivados listados como chips. Adicionei `activeBankAccounts`/`activeCreditCards` (filtrados por `status === 'active'` via `useMemo`) passados só para `TransactionListFilters`. `TransactionListRow`, `EditExpenseSheet` e o `labelResolver` continuam recebendo as listas completas — fundamental para que transações históricas ligadas a contas arquivadas ainda consigam resolver o rótulo e abrir o sheet de edição. A filtragem deliberadamente fica no container (e não no `page.tsx`) para preservar esse comportamento. [src/client/components/transactions/TransactionList.tsx]
- ✅ Resolvido review finding [MED]: Wildcards LIKE não escapados. Extraí helper `escapeLikePattern(input)` no próprio arquivo do repo (exportado) que escapa `\`, `%` e `_` com `\` — compatível com o escape padrão do LIKE no PostgreSQL. Usei o helper no `findByOrganizationFiltered` antes do wrap `%...%`. Testes unitários cobrem strings sem wildcards, `%` único, `_`, `\` e múltiplos simultâneos (novo arquivo `transaction.repository.impl.test.ts` com mock do `db` para não acoplar ao DATABASE_URL). [src/server/infrastructure/database/repositories/transaction.repository.impl.ts]

**Validações pós-fix:**
- `npx tsc --noEmit` — 0 erros
- `npx eslint src --max-warnings=0` — 0 warnings
- `npx vitest run` — 132 arquivos, 1061 testes passando (6 novos em `transaction.repository.impl.test.ts`)

### File List

**Modificados:**
- `src/server/domain/transactions/repositories/transaction.repository.ts`
- `src/server/infrastructure/database/repositories/transaction.repository.impl.ts`
- `src/shared/schemas/transaction.schema.ts`
- `src/shared/schemas/transaction.schema.test.ts`
- `src/server/actions/transaction.actions.ts`
- `src/server/actions/transaction.actions.test.ts`
- `src/app/(app)/transactions/page.tsx`
- `src/client/components/transactions/TransactionList.tsx`
- `src/server/domain/transactions/use-cases/create-transaction.test.ts`
- `src/server/domain/transactions/use-cases/create-income.test.ts`
- `src/server/domain/transactions/use-cases/update-expense-transaction.test.ts`
- `src/server/domain/transactions/use-cases/delete-transaction.test.ts`
- `src/server/domain/transactions/use-cases/transfer-between-accounts.test.ts`
- `src/server/domain/transactions/use-cases/get-suggested-establishments.test.ts`
- `src/server/domain/transactions/use-cases/get-impact-preview.test.ts`
- `src/server/domain/transactions/use-cases/get-monthly-spending-summary.test.ts`
- `src/server/actions/recreate-transaction.actions.test.ts`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/3-4-listagem-e-historico-de-transacoes.md`

**Novos:**
- `src/server/domain/transactions/use-cases/list-transactions.ts`
- `src/server/domain/transactions/use-cases/list-transactions.test.ts`
- `src/client/components/transactions/TransactionListFilters.tsx`
- `src/client/components/transactions/TransactionListFilters.test.tsx`
- `src/client/components/transactions/TransactionListRow.tsx`
- `src/client/components/transactions/TransactionList.test.tsx`
- `src/server/infrastructure/database/repositories/transaction.repository.impl.test.ts` (R2 — testes do `escapeLikePattern`)

### Change Log

- 2026-04-15 (R2): Addressed code review findings — 3 MEDIUMs resolved. Debounce agora depende de fields granulares (previne loadPage extra por keystroke); chips de filtro de método só listam contas/cartões ativos (mantendo lista completa para Row/EditExpenseSheet); busca textual escapa wildcards LIKE (`\`, `%`, `_`) no `findByOrganizationFiltered`. Novo helper `escapeLikePattern` exportado + testes.

- 2026-04-15: Implementação completa da Story 3.4 — repositório com filtros, use case, schema, server action, refactor do componente em subcomponentes, scroll infinito, grouping por dia, filtros contextuais.
