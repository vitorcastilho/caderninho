# Story 3.4d: Busca por nomes relacionados + empty state de primeiro uso

Status: review

<!-- Encontrado no smoke test da 3.4c em staging (2026-11-14): cenário 27 + pendência baixa. -->

## Story

As a usuário da tela `/transactions`,
I want encontrar transações buscando pelo nome da conta, cartão, categoria, subcategoria ou fonte de receita, e ver uma mensagem de primeiro uso quando ainda não registrei nada,
so that a busca encontra o que eu espero e a tela vazia não me manda "limpar filtros" que eu nunca apliquei.

## Acceptance Criteria

1. **Given** um gasto pago com o cartão "Visa Platinum" **When** busco "platinum" ou "visa" **Then** ele aparece na lista e nos cards (antes: nenhum resultado — cenário 27 do smoke test).
2. **Given** a busca textual **When** o termo casa o nome de categoria, subcategoria, conta (nome ou banco), cartão (nome ou bandeira) ou fonte de receita da organização **Then** a transação entra no resultado, no **mesmo OR** de estabelecimento/descrição/valor — nunca como filtro AND.
3. **Given** as subconsultas de nome **When** executadas **Then** são recortadas pela organização ativa (sem casar nomes de outra organização).
4. **Given** lista e summary **When** recebem a mesma busca **Then** usam o mesmo `buildFilterConditions` (totais = soma das linhas).
5. **Given** um usuário sem nenhuma transação (em qualquer mês) **When** abre `/transactions` (mês corrente selecionado) **Then** vê "Nenhuma transação registrada ainda", não "Nenhuma transação encontrada · Limpar filtros".
6. **Given** um usuário com transações em outros meses **When** o mês atual está vazio **Then** continua vendo o empty state de filtro com "Limpar filtros".

## Tasks / Subtasks

- [x] Task 1 (AC: #1–#4): teste em `transaction.repository.impl.test.ts` (SQL via `PgDialect`: subconsultas em `categories`, `subcategories`, `bank_accounts`, `credit_cards`, `income_sources`, recortadas por org, dentro do único bloco de busca). Vermelho → verde.
- [x] Task 2 (AC: #1–#4): `buildFilterConditions` acrescenta `<coluna> in (select id from <tabela> where organization_id = ? and (<nome> ilike ? ...))` ao OR da busca.
- [x] Task 3 (AC: #2): `TransactionList` manda a busca crua (`filtersToActionInput` sem expansão por nome no client). Teste: buscar "nubank" não gera `paymentMethodIds`. Vermelho → verde.
- [x] Task 4 (AC: #5, #6): `page.tsx` calcula `hasAnyTransactions` (`listTransactionsAction({ limit: 1 })`, em paralelo); `TransactionList` mostra o empty state de primeiro uso quando `false`. Testes para os dois casos.
- [x] Task 5: consulta real no Postgres local — "platinum"/"visa" → Posto Shell; "itaú" → transferência; "saúde" → Farmácia; "salário" → receitas; lista e agregação coerentes.
- [x] Task 6: `tsc` 0, `eslint src` 0, `vitest` 139 arquivos / 1163 testes, `next build` ok.
- [ ] Task 7: PR → `staging`, merge, validar em `caderninho-staging.vercel.app` (cenário 27).

## Dev Notes

- Causa do cenário 27: `filtersToActionInput` (client, desde a 3.4) convertia nomes que casavam a busca em `categoryIds`/`paymentMethodIds`. No servidor esses filtros eram AND com o `ilike` em estabelecimento/descrição — o resultado só podia encolher.
- Performance: subconsultas pequenas (tabelas de cadastro por organização); só entram quando há busca.
- Sem migration, sem dependência nova.

## Dev Agent Record

### Agent Model Used

Claude Opus 5.5 (claude-opus-5-5)

### Debug Log References

- Vermelho: repository (1), client busca crua (1), empty state primeiro uso (1). O caso "mês vazio com transações em outros meses" já passava.
- Teste antigo `"amount_cents" = $4` ajustado para `$\d+` (posições de parâmetro mudaram com as subconsultas).
- Verde: 1163/1163. Consulta real no Postgres local conferida (ver Task 5).

### Completion Notes List

- `filtersToActionInput` ficou sem dependências de cadastros; `loadPage` sem deps.

### File List

- `src/server/infrastructure/database/repositories/transaction.repository.impl.ts`
- `src/server/infrastructure/database/repositories/transaction.repository.impl.test.ts`
- `src/client/components/transactions/TransactionList.tsx`
- `src/client/components/transactions/TransactionList.test.tsx`
- `src/app/(app)/transactions/page.tsx`
- `_bmad-output/implementation-artifacts/3-4d-busca-por-nomes-relacionados-e-empty-state.md` (novo)
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-11-14 — Implementada com TDD. Status: review.
