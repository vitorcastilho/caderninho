# Story 3.1e: Side Sheets e Emoji Picker na Tela de Categorias

Status: done

## Origem

Extraída da R1 code review da Story 3.1b em 2026-04-04. Findings: M1, M2.

## Story

As a user,
I want category/subcategory/establishment edit forms to open as side sheets (not centered dialogs) and use the emoji picker component,
so that the editing experience matches the prototype and I can select emojis visually.

## Acceptance Criteria

1. **Given** o usuário clica em editar classificação/categoria/subcategoria/estabelecimento **When** o form abre **Then** é um side sheet de 420px que desliza pela direita com overlay — NÃO um Dialog modal centralizado [M1]

2. **Given** o usuário vê o campo de emoji no form **When** clica no botão de emoji (48x48) **Then** abre o emoji picker do DS — NÃO é um input de texto [M2]

## Tasks / Subtasks

### Fase 0: Design System & Protótipos

- [x] Task 0: Consultar proto-14 e DS
  - [x] 0.1: Ler `_bmad-output/prototypes/proto-14-categorias.html` — side sheet de edição
  - [x] 0.2: Verificar componente `emoji-picker.tsx` no DS — API e uso

### Fase 1: Trocar Dialog por Sheet

- [x] Task 1: Migrar forms de Dialog para Sheet
  - [x] 1.1: CategoryTree.tsx — trocar todos os `<Dialog>` por `<Sheet>` com `side="right"` e width 420px
  - [x] 1.2: Ajustar headers dos sheets (SheetHeader + SheetTitle)
  - [x] 1.3: Testar que abrir/fechar funciona corretamente

### Fase 2: Integrar Emoji Picker

- [x] Task 2: Usar emoji-picker.tsx nos forms
  - [x] 2.1: EstablishmentForm — trocar Input de emoji por botão 48x48 que abre emoji picker
  - [x] 2.2: CategoryForm — mesmo ajuste
  - [x] 2.3: SubcategoryForm — mesmo ajuste

## Dev Notes

### Design System & Protótipos

**Protótipo canônico:** `_bmad-output/prototypes/proto-14-categorias.html`

- Side sheets de edição: 420px, desliza pela direita, overlay
- Emoji picker: botão trigger 48x48 mostrando emoji atual, abre picker ao clicar
- Componente `src/client/components/ui/emoji-picker.tsx` JÁ EXISTE — só precisa integrar

### Arquivos principais a modificar

- `src/client/components/categories/CategoryTree.tsx` — Dialog → Sheet
- `src/client/components/categories/EstablishmentForm.tsx` — emoji picker
- `src/client/components/categories/CategoryForm.tsx` — emoji picker
- `src/client/components/categories/SubcategoryForm.tsx` — emoji picker

### Referências

- Proto-14: `_bmad-output/prototypes/proto-14-categorias.html`
- Emoji picker existente: `src/client/components/ui/emoji-picker.tsx`
- Findings originais: Story 3.1b R1 (M1, M2)

## Dev Agent Record

### Implementation Plan

- Task 1: Migrar 9 formulários de `<Dialog>` para `<Sheet side="right">` com width 420px em CategoryTree.tsx. Os 3 dialogs de confirmação de arquivamento foram mantidos como Dialog (são confirmações modais rápidas, não formulários de edição).
- Task 2: Substituir `<Input>` de emoji por `<EmojiPicker>` nos 3 forms (EstablishmentForm, CategoryForm, SubcategoryForm). Ajustado tamanho do botão trigger de 40x40 para 48x48 (h-12 w-12) conforme protótipo.

### Completion Notes

- Todos os formulários de create/edit agora abrem como side sheets deslizando pela direita com overlay
- EmojiPicker integrado em todos os forms — botão 48x48 que abre picker visual por categorias
- Testes unitários criados para EmojiPicker (6 testes): renderização, tamanho 48x48, abertura/fechamento, seleção de emoji, navegação entre categorias
- 123 test files, 911 testes passando, zero regressões
- TypeScript e ESLint sem erros
- ✅ Resolved review finding [MEDIUM]: Conflito de especificidade CSS no SheetContent — className agora usa `data-[side=right]:sm:max-w-[420px]` para mesma especificidade que o base
- LOWs (cores hardcoded e acessibilidade do emoji picker) são pré-existentes — aceitos como backlog

## File List

- `src/client/components/categories/CategoryTree.tsx` — modificado (Dialog → Sheet para 9 formulários)
- `src/client/components/categories/EstablishmentForm.tsx` — modificado (Input → EmojiPicker)
- `src/client/components/categories/CategoryForm.tsx` — modificado (Input → EmojiPicker)
- `src/client/components/categories/SubcategoryForm.tsx` — modificado (Input → EmojiPicker)
- `src/client/components/ui/emoji-picker.tsx` — modificado (botão trigger h-10 w-10 → h-12 w-12)
- `src/client/components/ui/emoji-picker.test.tsx` — novo (6 testes unitários)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — modificado (status da story)

## Review Follow-ups (AI)

### R1 — 2026-04-10

- [x] [AI-Review][MEDIUM] Conflito de especificidade CSS no SheetContent — `data-[side=right]:sm:max-w-sm` (384px) do Sheet base vence `sm:max-w-[420px]` passado via className. Sheets podem estar 384px em vez de 420px. Fix: usar `data-[side=right]:w-[420px] data-[side=right]:sm:max-w-[420px]` ou alterar o componente Sheet. [CategoryTree.tsx:320]
- [x] [AI-Review][LOW] Emoji picker usa cores hardcoded (`border-stone-200`, `bg-white`, `bg-indigo-100`) em vez de tokens DS. Pré-existente — backlog. [emoji-picker.tsx]
- [x] [AI-Review][LOW] Emoji picker sem atributos de acessibilidade (`aria-expanded`, `aria-haspopup`, `role`). Pré-existente — backlog. [emoji-picker.tsx]
- [x] [AI-Review][LOW] sprint-status.yaml alterado mas não listado no File List da story.

## Change Log

- 2026-04-10: Implementação completa — Dialog → Sheet (9 forms), EmojiPicker integrado (3 forms), botão trigger 48x48, testes unitários adicionados
- 2026-04-10: R1 code review — 1 MEDIUM, 3 LOW. Action items criados.
- 2026-04-10: R1 fixes — MEDIUM (especificidade CSS SheetContent) corrigido: `sm:max-w-[420px]` → `data-[side=right]:sm:max-w-[420px]` para vencer `data-[side=right]:sm:max-w-sm` do base. LOWs aceitos como backlog (pré-existentes). File List atualizado.
- 2026-04-10: R2 code review — APROVADO. Todos os fixes da R1 validados, ACs implementados, tasks completos. Story → done.
