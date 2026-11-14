# Story 3.4f: Cards no mobile, acessibilidade em /categories e itens "Em breve" na navegação

Status: review

<!-- Encontrado no smoke test da 3.4c em staging (2026-11-14). Decisões do usuário: fonte menor no compacto; itens "Em breve". -->

## Story

As a usuário do Caderninho,
I want ver os valores dos cards inteiros no celular, navegar por /categories com teclado e leitor de tela, e não cair em páginas 404 pela navegação,
so that a interface fica legível, acessível e sem becos sem saída.

## Acceptance Criteria

1. **Given** os cards de resumo em 375px **When** os valores vão até ~R$ 99.999,99 **Then** aparecem inteiros (antes: "R$ 5.000,..."). Desktop inalterado (`md:text-xl`).
2. **Given** `/categories` **When** navegado por teclado/leitor de tela **Then** os botões de ícone têm nome que cita o item ("Adicionar subcategoria em Supermercado", "Editar categoria Supermercado", "Editar subcategoria Padaria", "Adicionar estabelecimento em Padaria", "Adicionar categoria em Essenciais", "Editar classificação Essenciais", "Editar estabelecimento …") **And** expandir/recolher é um `<button>` com `aria-expanded` ("Expandir/Recolher {nome}").
3. **Given** as telas Orçamentos, Checklist e Projeção (épicos 4, 6, 7) ainda não existem **When** a sidebar e a navegação mobile renderizam **Then** esses itens aparecem desabilitados com "Em breve" (`aria-disabled`), sem link — sem 404 e sem prefetch.

## Tasks / Subtasks

- [x] Task 1 (AC: #1): testes em `transaction-summary-cards.test.tsx` (vermelho 2) → valor com `text-xs tracking-tight` no mobile/compacto, `md:text-xl` no desktop; `data-slot` no valor.
- [x] Task 2 (AC: #2): `CategoryCard.a11y.test.tsx` (vermelho 3) → `aria-label` com nome nos botões de ícone de `CategoryCard`, `ClassificationSection`, `EstablishmentRow`; chevron vira `<button aria-expanded>` (clique na linha continua funcionando com mouse).
- [x] Task 3 (AC: #3): testes em `Sidebar.test.tsx` / `BottomNavigation.test.tsx` (vermelho 2) → `comingSoon` nos itens; renderiza `<span aria-disabled>` com selo "Em breve" (sidebar) / `sr-only` "(em breve)" (mobile). Dois testes antigos usavam Checklist como "link inativo" e passaram a usar Transações/Cartões.
- [x] Task 4: `tsc` 0, `eslint` 0, `vitest` 141 arquivos / 1179 testes, `next build` ok.
- [ ] Task 5: PR → `staging`, merge, validar em staging (375px sem corte, nomes acessíveis, sem 404 de prefetch).

## Dev Notes

- A navegação mobile tem Checklist e Projeção nos slots; com ambos "Em breve" sobram Dashboard, Cartões e o FAB. Trocar os slots (ex.: Transações) é decisão de produto — não feita aqui.
- Sem migration, sem dependência nova.

## Dev Agent Record

### Agent Model Used

Claude Opus 5.5 (claude-opus-5-5)

### Debug Log References

- Vermelho: cards 2, categories a11y 3, navegação 2. Verde: 1179/1179; build ok.

### Completion Notes List

- Linhas expansíveis de /categories continuam clicáveis com mouse; o botão do chevron dá o acesso por teclado sem aninhar interativos.

### File List

- `src/client/components/ui/transaction-summary-cards.tsx` / `.test.tsx`
- `src/client/components/categories/CategoryCard.tsx`, `ClassificationSection.tsx`, `EstablishmentRow.tsx`
- `src/client/components/categories/CategoryCard.a11y.test.tsx` (novo)
- `src/client/components/layout/Sidebar.tsx` / `.test.tsx`
- `src/client/components/layout/BottomNavigation.tsx` / `.test.tsx`
- `_bmad-output/implementation-artifacts/3-4f-ajustes-mobile-a11y-e-sidebar.md` (novo)
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-11-14 — Implementada com TDD. Status: review.
