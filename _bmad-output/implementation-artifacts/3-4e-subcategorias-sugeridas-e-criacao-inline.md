# Story 3.4e: Subcategorias sugeridas no onboarding + criação no Novo Gasto

Status: review

<!-- Encontrado no smoke test da 3.4c em staging (2026-11-14). Decisão do usuário: A + B. -->

## Story

As a usuário novo do Caderninho,
I want que as categorias do onboarding já venham com subcategorias e com o emoji certo, e poder criar uma subcategoria direto no Novo Gasto,
so that consigo registrar o primeiro gasto sem passar por /categories e nunca fico travado numa categoria vazia.

## Acceptance Criteria

1. **Given** o onboarding **When** o usuário confirma as categorias sugeridas **Then** cada uma é criada com o emoji exibido (🛒, 🏠, ⛽, 📱, 🎓, 🍕) — antes todas ficavam 📁.
2. **Given** o onboarding **When** uma categoria sugerida é criada **Then** suas subcategorias sugeridas também são criadas:
   - 🛒 Supermercado: Compra do mês · Reposição da semana · Padaria · Hortifrúti · Açougue
   - 🏠 Moradia: Aluguel · Condomínio · Luz · Água · Gás · IPTU
   - ⛽ Gasolina: Abastecimento · Estacionamento · Lavagem
   - 📱 Internet/Telefone: Internet de casa · Celular · Streaming
   - 🎓 Educação: Mensalidade · Curso · Material escolar · Livros
   - 🍕 Restaurante: Delivery · Almoço no trabalho · Jantar fora · Café/lanche
3. **Given** a etapa de categorias do onboarding **When** exibida **Then** cada sugestão mostra as subcategorias que vêm junto.
4. **Given** uma sugestão desmarcada **When** o usuário avança **Then** nem a categoria nem as subcategorias dela são criadas.
5. **Given** o Novo Gasto (desktop e mobile) **When** o usuário escolhe uma categoria **Then** aparece "+ Nova subcategoria"; ao digitar o nome e criar, a subcategoria é salva, selecionada e o registro continua (sem sair do formulário e sem perder o valor).
6. **Given** o `CascadeInput` sem `onCreateSubcategory` **When** renderizado **Then** se comporta como antes (DS retrocompatível).

## Tasks / Subtasks

- [x] Task 1 (AC: #5, #6): testes em `cascade-input.test.tsx` (desktop com e sem subcategorias, nome vazio, mobile, sem callback). Vermelho (4) → verde.
- [x] Task 2 (AC: #5, #6): `CascadeInput` ganha `onCreateSubcategory` e o bloco "+ Nova subcategoria" (input + "Criar", Enter cria); desktop mostra a seção de subcategoria sempre que há categoria e o callback existe.
- [x] Task 3 (AC: #5): `NewExpenseSheet` persiste via `createSubcategoryAction`, acrescenta à lista local, toast de sucesso/erro.
- [x] Task 4 (AC: #1–#4): testes novos em `CategoriesStep.test.tsx`. Vermelho (3) → verde.
- [x] Task 5 (AC: #1–#3): `onboarding-suggestions.ts` com `subcategories`; `CategoriesStep` envia `emoji`, cria as subcategorias de cada categoria criada e lista os nomes na sugestão.
- [x] Task 6: `tsc` 0, `eslint` 0, `vitest` 140 arquivos / 1172 testes, `next build` ok.
- [x] Task 7: PR #45 → `staging` (merge `69eb2fa`). Staging com usuário novo, 9/9: onboarding lista as subcategorias; empty state de primeiro uso; primeiro gasto Supermercado › Padaria sem passar por /categories (linha com 🛒); "+ Nova subcategoria" criou "Feira" e o gasto foi registrado; /categories com emojis certos e Supermercado/Moradia com 6 itens.

## Dev Notes

- Causa do 📁: `CategoriesStep` chamava `createCategoryAction` sem `emoji` (o schema aceita; default do banco é 📁).
- Categorias customizadas criadas no onboarding não ganham subcategorias automáticas — o "+ Nova subcategoria" no Novo Gasto cobre esse caso.
- Sem migration, sem dependência nova.

## Dev Agent Record

### Agent Model Used

Claude Opus 5.5 (claude-opus-5-5)

### Debug Log References

- Vermelho: cascade 4 failed / 40 passed; onboarding 3 failed / 1 passed (o caso "desmarcada" já passava).
- Verde: 1172/1172; build ok.

### Completion Notes List

- Criação das subcategorias em paralelo após as categorias; falhas contadas e avisadas por toast.

### File List

- `src/client/components/ui/cascade-input.tsx` / `.test.tsx`
- `src/client/components/transactions/NewExpenseSheet.tsx`
- `src/client/components/onboarding/steps/CategoriesStep.tsx`
- `src/client/components/onboarding/steps/CategoriesStep.test.tsx` (novo)
- `src/shared/constants/onboarding-suggestions.ts`
- `_bmad-output/implementation-artifacts/3-4e-subcategorias-sugeridas-e-criacao-inline.md` (novo)
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-11-14 — Implementada com TDD. Status: review.
- 2026-11-14 — Validada em staging (PR #45). Aguardando teste do usuário.
