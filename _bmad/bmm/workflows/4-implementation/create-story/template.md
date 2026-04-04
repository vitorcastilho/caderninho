# Story {{epic_num}}.{{story_num}}: {{story_title}}

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a {{role}},
I want {{action}},
so that {{benefit}}.

## Acceptance Criteria

1. [Add acceptance criteria from epics/PRD]

## Tasks / Subtasks

### Fase 0: Design System & Protótipos (Obrigatória para stories com UI)

- [ ] Task 0: Consultar Design System e protótipos relevantes
  - [ ] 0.1: Consultar página `/design-system` (`src/app/design-system/page.tsx`) — tokens, cores, tipografia, espaçamentos
  - [ ] 0.2: Verificar protótipos relevantes em `_bmad-output/prototypes/` — identificar o(s) protótipo(s) HTML correspondente(s) à story
  - [ ] 0.3: Listar componentes UI existentes em `src/client/components/ui/` que serão reutilizados — NÃO criar componentes novos ad-hoc

### Fase 1+: Tasks de Implementação

- [ ] Task 1 (AC: #)
  - [ ] Subtask 1.1
- [ ] Task 2 (AC: #)
  - [ ] Subtask 2.1

## Dev Notes

- Relevant architecture patterns and constraints
- Source tree components to touch
- Testing standards summary

### Design System & Protótipos

**Protótipos relevantes:**
- `_bmad-output/prototypes/{{prototipo_relevante}}.html` — {{descrição}}

**Seções do DS a consultar:**
- {{seções relevantes da página /design-system}}

**Componentes UI existentes a reutilizar:**
- `src/client/components/ui/{{componente}}.tsx` — {{uso}}

**Regras visuais obrigatórias:**
- NÃO hardcodar hex — sempre usar tokens Tailwind do Design System
- NÃO criar componentes visuais novos sem que existam no DS primeiro
- Usar tokens de tipografia: Inter para texto, tabular-nums para valores numéricos
- Espaçamentos seguem grid base 4px
- Border-radius segue padrão DS
- Componente novo necessário? Seguir workflow formal: dev identifica necessidade → documenta → UX prototipa → implementa no DS com testes → dev importa

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
- Detected conflicts or variances (with rationale)

### References

- Cite all technical details with source paths and sections, e.g. [Source: docs/<file>.md#Section]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
