# Story 3.1e: Side Sheets e Emoji Picker na Tela de Categorias

Status: ready-for-dev

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

- [ ] Task 0: Consultar proto-14 e DS
  - [ ] 0.1: Ler `_bmad-output/prototypes/proto-14-categorias.html` — side sheet de edição
  - [ ] 0.2: Verificar componente `emoji-picker.tsx` no DS — API e uso

### Fase 1: Trocar Dialog por Sheet

- [ ] Task 1: Migrar forms de Dialog para Sheet
  - [ ] 1.1: CategoryTree.tsx — trocar todos os `<Dialog>` por `<Sheet>` com `side="right"` e width 420px
  - [ ] 1.2: Ajustar headers dos sheets (SheetHeader + SheetTitle)
  - [ ] 1.3: Testar que abrir/fechar funciona corretamente

### Fase 2: Integrar Emoji Picker

- [ ] Task 2: Usar emoji-picker.tsx nos forms
  - [ ] 2.1: EstablishmentForm — trocar Input de emoji por botão 48x48 que abre emoji picker
  - [ ] 2.2: CategoryForm — mesmo ajuste
  - [ ] 2.3: SubcategoryForm — mesmo ajuste

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
