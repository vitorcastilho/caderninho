# Story 3.1c: CascadeInput Mobile — Alinhamento com Proto-07

Status: review

## Origem

Extraída da R1 code review da Story 3.1b em 2026-04-04. Findings: H3, H4, H5, H6, M7, M8, M9, M10, M11.

## Story

As a user,
I want the expense registration flow to match the rapid cascade input prototype (proto-07),
so that I can register expenses in ~5 seconds with a mobile-optimized experience using selection-driven navigation.

## Acceptance Criteria

1. **Given** o usuário abre "Novo Gasto" no mobile **When** o sheet aparece **Then** é um bottom sheet (sobe de baixo, overlay escura, handle bar, border-radius 20px topo) — NÃO um side sheet lateral [H6]

2. **Given** o usuário está no State 1 (Valor) **When** vê a tela **Then** há um teclado numérico customizado 3×4 com teclas de 52px para digitar o valor (estilo app bancário) — NÃO um input de texto [H5]

3. **Given** o usuário seleciona uma classificação pill **When** toca nela **Then** as categorias filtradas aparecem automaticamente SEM precisar clicar "Avançar". Selecionar uma categoria avança para subcategoria automaticamente. O fluxo é selection-driven. [H4]

4. **Given** o usuário está no State 2b (Subcategoria) **When** vê os chips de subcategoria **Then** cada chip mostra o nome + badge do método de pagamento sugerido com ícone da bandeira do cartão (VISA/Mastercard) [M8]

5. **Given** o usuário está no State 3a (Onde/Pagamento) **When** vê o campo "Onde?" **Then** os estabelecimentos cadastrados aparecem como chips selecionáveis (chip-sm) + chip "+ Outro" para texto livre. NÃO é um input de texto. [H3/AC#8, M11]

6. **Given** o usuário registra um gasto com estabelecimento que não existe como entidade **When** a transação é confirmada **Then** o estabelecimento é auto-criado com source="auto" [H3/AC#7]

7. **Given** o pagamento selecionado é cartão de crédito **When** o usuário vê a tela de pagamento **Then** aparece installment strip (à vista, 1x, 2x, 3x, 4x) com resultado calculado e nota de comprometimento [M9]

8. **Given** o usuário avançou por todos os states **When** vê o summary bar **Then** mostra valor em 18px bold + separador · + categoria como pill indigo com emoji [M7]

9. **Given** o usuário está no State 4 (Confirmar) **When** vê a tela **Then** mostra confirm-amount grande (28px bold), breadcrumb visual (Categoria → Subcategoria → Estabelecimento + ícone cartão), btn-confirm full-width, "Cancelar" como text link — NÃO tabela dl/dd com dois botões iguais [M10]

## Tasks / Subtasks

### Fase 0: Design System & Protótipos

- [x] Task 0: Consultar proto-07-cascade-input.html e DS
  - [x] 0.1: Ler `_bmad-output/prototypes/proto-07-cascade-input.html` — TODOS os 6 states mobile + desktop
  - [x] 0.2: Consultar página `/design-system` — tokens, componentes existentes
  - [x] 0.3: Listar componentes UI existentes que serão reutilizados ou criados

### Fase 1: Bottom Sheet Mobile

- [x] Task 1: Criar variante bottom-sheet ou adaptar Sheet para mobile
  - [x] 1.1: No mobile, sheet sobe de baixo (overlay escura 45%, handle bar, border-radius 20px topo)
  - [x] 1.2: No desktop, manter side sheet lateral (400px) como está
  - [x] 1.3: Atualizar NewExpenseSheet.tsx para usar a variante correta por breakpoint

### Fase 2: Keypad Numérico

- [x] Task 2: Criar componente NumericKeypad
  - [x] 2.1: Grid 3×4 com teclas 0-9 + backspace, altura 52px
  - [x] 2.2: Lógica de formatação monetária (digitar "8700" mostra "R$ 87,00")
  - [x] 2.3: Integrar no State 1 do CascadeInput (mobile only — desktop mantém input)

### Fase 3: Fluxo Selection-Driven

- [x] Task 3: Remover botões Avançar/Voltar e implementar avanço automático
  - [x] 3.1: State 1→2: após digitar valor, botão único "Continuar" (ou auto-advance)
  - [x] 3.2: State 2→2b: selecionar category chip avança automaticamente para subcategoria
  - [x] 3.3: State 2b→3a: selecionar subcategory chip avança automaticamente para onde/pagamento
  - [x] 3.4: Manter possibilidade de voltar (swipe ou tap no summary bar, NÃO botão "Voltar")

### Fase 4: Estabelecimentos como Chips + Auto-criação

- [x] Task 4: "Onde?" com chips selecionáveis
  - [x] 4.1: Buscar estabelecimentos cadastrados da subcategoria + sugestões do histórico
  - [x] 4.2: Renderizar como chip-sm selecionáveis + chip "+ Outro" que abre input
  - [x] 4.3: Implementar auto-criação de estabelecimento (source="auto") ao confirmar transação com nome novo
  - [x] 4.4: Atualizar create-transaction use case para chamar auto-create-establishment

### Fase 5: Installment Strip

- [x] Task 5: UI de parcelamento quando método é crédito
  - [x] 5.1: Criar componente InstallmentStrip (à vista, 1x, 2x, 3x, 4x)
  - [x] 5.2: Mostrar resultado calculado (ex: "2x de R$ 43,50") e meses
  - [x] 5.3: Nota de comprometimento total no cartão

### Fase 6: Ajustes Visuais

- [x] Task 6: Summary bar, card brand icons, tela de confirmação
  - [x] 6.1: Summary bar com summary-amount (18px bold) + summary-cat (pill indigo)
  - [x] 6.2: Card brand icons (VISA/Mastercard) nos chips de subcategoria e pagamento
  - [x] 6.3: Tela de confirmação: confirm-amount 28px, breadcrumb visual, btn-confirm full-width

## Dev Notes

### Design System & Protótipos

**Protótipo canônico:** `_bmad-output/prototypes/proto-07-cascade-input.html`

- **State 1 (Valor):** bottom-sheet, teclado 3×4, step dots, valor com cursor piscante
- **State 2 (Classificação & Categoria):** summary bar, classification pills horizontais scrolláveis, category chips 2-col com emoji
- **State 2b (Subcategoria):** chips com chip-method (ícone bandeira + nome cartão)
- **State 3a (Pagamento à Vista):** "Onde?" com chip-sm, payment-selector com brand icon + "Sugerido pela subcategoria...", impact preview com budget bar
- **State 3b (Parcelamento):** installment-strip (à vista/1x/2x/3x/4x), resultado calculado, nota comprometimento
- **State 4 (Confirmar):** confirm-amount 28px, breadcrumb, impact preview, btn-confirm full-width + "Cancelar" text link
- **Desktop:** side sheet 400px com todos os campos visíveis (NÃO é multi-step)

### Arquivos principais a modificar

- `src/client/components/ui/cascade-input.tsx` — refazer completamente
- `src/client/components/transactions/NewExpenseSheet.tsx` — bottom sheet mobile
- `src/server/domain/transactions/use-cases/create-transaction.ts` — auto-criação
- Novos componentes: NumericKeypad, InstallmentStrip (ou inline)

### Referências

- Proto-07: `_bmad-output/prototypes/proto-07-cascade-input.html`
- Findings originais: Story 3.1b R1 (H3, H4, H5, H6, M7, M8, M9, M10, M11)

## File List

### Novos

| Arquivo | Descrição |
|---------|-----------|
| `src/client/hooks/use-is-mobile.ts` | Hook com `useSyncExternalStore` para detectar viewport mobile (<640px) |
| `src/client/components/ui/numeric-keypad.tsx` | Teclado numérico 3×4 com teclas de 52px + backspace |
| `src/client/components/ui/numeric-keypad.test.tsx` | 5 testes para NumericKeypad |
| `src/client/components/ui/installment-strip.tsx` | Strip de parcelas (À vista, 1x–4x) com resultado calculado |
| `src/client/components/ui/installment-strip.test.tsx` | 9 testes para InstallmentStrip |

### Modificados

| Arquivo | Descrição da mudança |
|---------|---------------------|
| `src/client/components/ui/cascade-input.tsx` | Reescrita completa — dual rendering mobile (wizard 5 steps) / desktop (single pane) |
| `src/client/components/ui/cascade-input.test.tsx` | Reescrita completa — 37 testes (mobile + desktop) |
| `src/client/components/transactions/NewExpenseSheet.tsx` | Bottom sheet mobile (side="bottom", 85dvh, rounded-t-20px) + side sheet desktop |
| `src/client/components/ui/sheet.tsx` | Adicionada prop `overlayClassName` ao SheetContent |
| `_bmad-output/implementation-artifacts/sprint-status.yaml` | Status atualizado para review |

## Change Log

| Data | Mudança |
|------|---------|
| 2026-04-04 | Implementação completa das 7 fases (0-6) — bottom sheet, numeric keypad, selection-driven flow, establishment chips, installment strip, summary bar, tela confirmação |

## Dev Agent Record

### Decisões de implementação

1. **Dual rendering via prop `isMobile`**: CascadeInput recebe `isMobile` como prop (injetada pelo NewExpenseSheet via `useIsMobile()`). Mobile renderiza wizard multi-step, desktop renderiza single pane.

2. **`useSyncExternalStore` para detecção mobile**: Hook `useIsMobile` usa `useSyncExternalStore` ao invés de useState+useEffect — é o padrão React-idiomatic para subscrição a APIs externas (media queries). SSR-safe com fallback `false`.

3. **Summary bar como botão de voltar**: Ao invés de botão "Voltar" explícito, o summary bar é clicável e volta ao step anterior. Implementado como `<button>` com `onClick={() => setCurrentStep(prev - 1)}`.

4. **Auto-advance selection-driven**: `handleSelectCategory` e `handleSelectSubcategory` chamam `setCurrentStep()` quando `isMobile=true`. No desktop, seleção apenas atualiza o estado.

5. **Step indicator com barras**: Step ativo = barra larga (h-2 w-5 bg-indigo-600), step concluído = círculo menor (opacity-40), step pendente = círculo cinza.

6. **React Compiler**: Removido `useCallback` de `handleSelectPayment` — React Compiler gerencia memoização automaticamente. ESLint `react-compiler/react-compiler` flaggeou incompatibilidade de deps.

7. **Tasks 4.3 e 4.4 já implementadas**: A auto-criação de estabelecimento (`autoCreateEstablishment`) já estava implementada em `transaction.actions.ts` (Story 3.1b). O CascadeInput apenas passa o nome do estabelecimento via `onConfirm`.

8. **Sheet `overlayClassName`**: Adicionada prop ao `SheetContent` para permitir customização do overlay (mobile usa `bg-black/45`). Mudança mínima e retrocompatível.

### Validações

- 891 testes passando (121 arquivos)
- TypeScript compila sem erros
- ESLint passa sem warnings
