# Story 2.5.7: Enforcement e Workflow — 4 Barreiras de Design System

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a equipe de desenvolvimento do Caderninho (dev agents, reviewers, SM),
I want ter 4 barreiras formais que garantem conformidade com o Design System em todo o ciclo de desenvolvimento,
so that nenhum componente visual seja implementado fora do padrão, eliminando dívida visual e retrabalho reativo (como aconteceu no Épico 2 e motivou toda a existência do Épico 2.5).

## Contexto

A Retrospectiva do Épico 2 (`_bmad-output/implementation-artifacts/epic-2-retro-2026-03-24.md`) identificou como problema mais grave: **Design System sistematicamente ignorado**. Dev não consultava protótipos, inventava componentes fora do padrão, e a Story 2.7 (auditoria visual) foi reativa — corrigiu desvios em vez de preveni-los.

O time acordou 4 barreiras de enforcement que esta story implementa:

1. **Barreira Story:** Task obrigatória de consultar DS e protótipos antes de implementar
2. **Barreira Dev Notes:** Seção dedicada listando protótipos e seções DS relevantes
3. **Barreira Code Review:** Critério explícito de validação visual no checklist
4. **Barreira Componente Novo:** Dev não inventa — pede → UX prototipa → DS → dev importa

**Esta é uma story de processo/documentação — NÃO há código de aplicação novo.** Os entregáveis são atualizações em templates BMAD, checklists, project-context e documentação.

**Cadeia de dependência:** 2.5.1 → 2.5.2 → 2.5.2b → 2.5.3 → 2.5.4 → 2.5.5 → 2.5.6 (done) → **2.5.7**

## Acceptance Criteria

### AC 1: Barreira 1 — Template de Story com Task Obrigatória de DS

**Given** o template de story usado pelo workflow `create-story`
**When** uma nova story com componentes visuais é criada
**Then** o template inclui uma task obrigatória numerada: "Consultar Design System e protótipos relevantes"
**And** a task lista referências específicas: página `/design-system`, protótipos em `_bmad-output/prototypes/`, componentes existentes em `src/client/components/ui/`
**And** o workflow `create-story` (instructions.xml) gera automaticamente as referências DS relevantes para a story (baseado no épico e domínio)

### AC 2: Barreira 2 — Dev Notes com Seção DS Obrigatória

**Given** o template de story
**When** a seção Dev Notes é preenchida para uma story com UI
**Then** existe uma subseção "### Design System & Protótipos" obrigatória
**And** a subseção lista: protótipos HTML relevantes (com paths), seções do DS a consultar, componentes UI existentes a reutilizar
**And** a subseção inclui regra explícita: "NÃO hardcodar hex — sempre usar tokens Tailwind"
**And** a subseção inclui regra: "NÃO criar componentes visuais novos sem que existam no DS primeiro"

### AC 3: Barreira 3 — Checklist de Code Review com Validação Visual

**Given** o checklist de code review (`_bmad/bmm/workflows/4-implementation/code-review/checklist.md`)
**When** um reviewer executa o code review de uma story com UI
**Then** o checklist inclui critérios explícitos de validação visual:
- Tokens de cor DS usados (nunca hex hardcoded)
- Border-radius segue padrão DS
- Espaçamentos seguem grid base 4px
- Componentes do DS reutilizados (nunca HTML nativo quando existe componente)
- Validação contra protótipo HTML correspondente
- Tipografia segue tokens (Inter, tabular-nums para valores)
**And** a severidade de violações visuais é classificada como MEDIUM (blocking)

### AC 4: Barreira 4 — Workflow de Componente Novo Documentado

**Given** a necessidade de criar um componente visual que não existe
**When** o dev precisa de um componente novo
**Then** existe documentação formal do workflow: dev identifica necessidade → abre issue/documenta → UX prototipa no HTML → implementa no DS com testes → dev importa
**And** esta regra está documentada no `project-context.md`
**And** esta regra está documentada no MEMORY.md do projeto

### AC 5: Project Context Atualizado

**Given** o arquivo `_bmad-output/project-context.md`
**When** as regras de enforcement são implementadas
**Then** o arquivo contém seção "### Design System Enforcement Rules" com:
- As 4 barreiras documentadas
- Path do DS: `/design-system` (rota) e `src/app/design-system/page.tsx` (código)
- Path dos protótipos: `_bmad-output/prototypes/`
- Path dos componentes UI: `src/client/components/ui/`
- Regra de tokens: nunca hex hardcoded, sempre classes Tailwind
- Regra de componente novo: workflow formal (pede → prototipa → DS → importa)
- Lista de componentes UI disponíveis atualizada

### AC 6: MEMORY.md Atualizado

**Given** o arquivo de memória persistente
**When** as regras de enforcement são documentadas
**Then** a seção "Design System & Protótipos" do MEMORY.md está atualizada com:
- Referência às 4 barreiras
- Regra: consultar DS e protótipos ANTES de codar
- Regra: componente novo = DS primeiro, nunca ad-hoc
- Path dos protótipos e componentes

### AC 7: Validação — Build e Testes Não Regridem

**Given** apenas arquivos de documentação/template foram modificados
**When** `npm run build` e `npm run test` são executados
**Then** zero erros de build
**And** zero regressões de testes (758/758 ou mais passando)

## Tasks / Subtasks

### Fase 1: Barreira 1 — Template de Story (AC: #1)

- [x] Task 1: Atualizar template de story com task DS obrigatória (AC: #1)
  - [x] 1.1: Editar `_bmad/bmm/workflows/4-implementation/create-story/template.md` — adicionar task "Consultar Design System e protótipos" como primeira task na seção Tasks/Subtasks
  - [x] 1.2: A task template deve incluir subtasks: consultar `/design-system`, verificar protótipos relevantes, listar componentes UI existentes a reutilizar
  - [x] 1.3: Adicionar seção "### Design System & Protótipos" no template de Dev Notes com placeholders para protótipos, seções DS e componentes

### Fase 2: Barreira 2 — Dev Notes Pattern (AC: #2)

- [x] Task 2: Formalizar seção DS nos Dev Notes do template (AC: #2)
  - [x] 2.1: A seção "### Design System & Protótipos" deve incluir campos template: protótipos relevantes (paths), componentes UI existentes, regras visuais obrigatórias
  - [x] 2.2: Incluir regras inline no template: "NÃO hardcodar hex", "NÃO criar componentes visuais novos sem DS", "Usar tokens Tailwind"
  - [x] 2.3: Incluir referência ao workflow de componente novo (Barreira 4)

### Fase 3: Barreira 3 — Code Review Checklist (AC: #3)

- [x] Task 3: Atualizar checklist de code review com critérios visuais (AC: #3)
  - [x] 3.1: Editar `_bmad/bmm/workflows/4-implementation/code-review/checklist.md` — adicionar seção "Visual & Design System Compliance"
  - [x] 3.2: Critérios a incluir: tokens de cor DS, border-radius padrão, espaçamentos grid 4px, componentes DS reutilizados, validação contra protótipo, tipografia (Inter, tabular-nums)
  - [x] 3.3: Classificar violações visuais como severidade MEDIUM (blocking)

### Fase 4: Barreira 4 — Workflow de Componente Novo (AC: #4)

- [x] Task 4: Documentar workflow formal de componente novo (AC: #4)
  - [x] 4.1: Criar documentação do workflow: dev identifica necessidade → documenta → UX prototipa → implementa no DS com testes e seção na página /design-system → dev importa
  - [x] 4.2: Incluir regras: componente novo nunca é criado ad-hoc em uma story de feature, sempre passa pelo DS primeiro

### Fase 5: Project Context e MEMORY (AC: #5, #6)

- [x] Task 5: Atualizar project-context.md (AC: #5)
  - [x] 5.1: Adicionar seção "### Design System Enforcement Rules" com as 4 barreiras
  - [x] 5.2: Documentar paths: `/design-system`, `_bmad-output/prototypes/`, `src/client/components/ui/`
  - [x] 5.3: Documentar regras de tokens, tipografia e componente novo
  - [x] 5.4: Listar componentes UI disponíveis atualmente

- [x] Task 6: Atualizar MEMORY.md (AC: #6)
  - [x] 6.1: Atualizar seção "Design System & Protótipos" com referência às 4 barreiras e regras canônicas

### Fase 6: Validação Final (AC: #7)

- [x] Task 7: Build e testes
  - [x] 7.1: `npm run build` — zero erros
  - [x] 7.2: `npm run test` — 758/758 passando, zero regressões

### Review Follow-ups (AI)

- [x] [AI-Review][MEDIUM] AC 1 parcial — `create-story/instructions.xml` não tem step explícito para gerar referências DS. Adicionar step que instrua o agente a: (1) escanear `_bmad-output/prototypes/` para protótipos relevantes, (2) consultar a página `/design-system`, (3) mapear componentes DS relevantes baseado no domínio da story [`_bmad/bmm/workflows/4-implementation/create-story/instructions.xml`]
- [x] [AI-Review][LOW] Data "Last Updated" desatualizada — atualizar de "2026-03-16" para data atual [`_bmad-output/project-context.md:390`]
- [x] [AI-Review][LOW] Contagem incorreta nos Completion Notes — diz "24 componentes UI" mas são 25 [`_bmad-output/implementation-artifacts/2-5-7-enforcement-e-workflow.md:240`]
- [x] [AI-Review][LOW] `rule_count: 50` no frontmatter pode estar desatualizado após adição das regras DS [`_bmad-output/project-context.md:7`]

## Dev Notes

### Natureza da Story: Processo e Documentação

Esta story é 100% de processo — modifica templates BMAD, checklists e documentação. **Nenhum código de aplicação é criado ou modificado.** Os entregáveis são:
- Templates BMAD atualizados (create-story, code-review)
- project-context.md atualizado
- MEMORY.md atualizado

### Por Que Esta Story Existe

A Retrospectiva do Épico 2 revelou que o Design System era sistematicamente ignorado pelo dev. Desvios visuais se acumularam em cada story, exigindo a Story 2.7 (auditoria reativa) e eventualmente todo o Épico 2.5. As 4 barreiras previnem que isso se repita no Épico 3 em diante.

### Acordo do Time (Fonte: Retrospectiva)

> A partir do Épico 2.5.7, toda story com UI segue:
> 1. **Story:** Task numerada obrigatória "Consultar DS e protótipos relevantes"
> 2. **Dev Notes:** Seção dedicada listando protótipos e seções do DS relevantes
> 3. **Code Review:** Critério explícito — tokens de cor, border-radius, espaçamentos, componentes do DS vs HTML nativo
> 4. **Componente novo:** Dev não inventa. Pede → Sally prototipa → implementa no DS → dev importa

### Design System & Protótipos

**Página DS:** `src/app/design-system/page.tsx` — rota `/design-system`
**Protótipos:** `_bmad-output/prototypes/` (16 protótipos HTML)

**Componentes UI existentes em `src/client/components/ui/`:**
- `button.tsx` — CVA, variants: default/secondary/ghost/outline/destructive/link
- `input.tsx` — Input base com cn()
- `label.tsx` — Label
- `card.tsx` — Card + CardHeader/CardTitle/CardDescription/CardContent/CardFooter/CardAction
- `badge.tsx` — 4 variants (default/secondary/outline/destructive)
- `currency-input.tsx` — Input monetário R$ (centavos in/out)
- `percentage-input.tsx` — Input percentual (basis points in/out)
- `empty-state.tsx` — Estado vazio com ícone + CTA
- `page-header.tsx` — H1 + description + action button
- `budget-progress-bar.tsx` — Barra de progresso de orçamento (3 variantes, 4 faixas de cor)
- `summary-card.tsx` — Card compacto de métricas (default/compact, trends)
- `impact-preview.tsx` — Preview de impacto antes/depois (integra BudgetProgressBar)
- `bottom-navigation.tsx` — Navegação mobile com FAB central
- `cascade-input.tsx` — Fluxo de registro em cascata (progressive disclosure, 4 steps)
- `skeleton.tsx`, `dialog.tsx`, `sheet.tsx`, `select.tsx`, `tabs.tsx`, `table.tsx`, `breadcrumb.tsx`

### Arquivos a Modificar

```
_bmad/bmm/workflows/4-implementation/create-story/template.md    ← EDITAR (task DS + Dev Notes section)
_bmad/bmm/workflows/4-implementation/code-review/checklist.md    ← EDITAR (critérios visuais)
_bmad-output/project-context.md                                   ← EDITAR (DS enforcement rules)
~/.claude/projects/.../memory/MEMORY.md                           ← EDITAR (DS enforcement)
```

### O Que NÃO Fazer

- **NÃO modificar código de aplicação** — esta story é 100% documentação/templates
- **NÃO alterar componentes existentes** — os componentes foram criados na 2.5.6
- **NÃO criar novos testes** — apenas validar que build/testes existentes continuam passando
- **NÃO alterar protótipos** — os protótipos foram corrigidos na 2.5.2/2.5.2b
- **NÃO inventar barreiras extras** — seguir exatamente as 4 barreiras acordadas na retro

### Lições da Story 2.5.6 (Anterior)

- Suite de testes: 758/758 passando (build limpo)
- Import path correto de `cn()`: `@/client/utils/utils` (não `@/client/lib/utils`)
- Padrão de componente: 'use client', interface explícita, named export, tokens Tailwind
- Code review convergiu em 2 rounds (R1 + R2) — seguir esse padrão

### Project Structure Notes

Apenas templates BMAD e documentação são tocados. Nenhuma alteração na árvore `src/`.

### References

- [Source: _bmad-output/implementation-artifacts/epic-2-retro-2026-03-24.md#Acordo de Time: 4 Barreiras de Design System] — Origem das 4 barreiras
- [Source: _bmad-output/implementation-artifacts/epic-2-retro-2026-03-24.md#Descoberta Significativa — Épico 2.5 Necessário] — Definição da Story 2.5.7
- [Source: _bmad/bmm/workflows/4-implementation/create-story/template.md] — Template atual de story (a ser modificado)
- [Source: _bmad/bmm/workflows/4-implementation/code-review/checklist.md] — Checklist atual de code review (a ser modificado)
- [Source: _bmad-output/project-context.md] — Project context (a ser atualizado)
- [Source: _bmad-output/implementation-artifacts/2-5-6-component-library-componentes-novos-epic-3.md] — Story anterior com padrões de componente

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

Nenhum — story de documentação sem código de aplicação.

### Completion Notes List

- Barreira 1 (Template de Story): Adicionada "Fase 0: Design System & Protótipos" como task obrigatória no template, com subtasks para consultar DS, protótipos e listar componentes existentes
- Barreira 2 (Dev Notes): Adicionada seção "### Design System & Protótipos" no Dev Notes do template com campos para protótipos, componentes, regras visuais e referência ao workflow de componente novo
- Barreira 3 (Code Review): Adicionada seção "Visual & Design System Compliance" no checklist de code review com 7 critérios de validação visual e severidade MEDIUM (blocking)
- Barreira 4 (Componente Novo): Workflow formal documentado no project-context.md — dev identifica → documenta → UX prototipa → DS implementa → dev importa
- Project Context: Nova seção "### Design System Enforcement Rules" com as 4 barreiras, paths, regras de tokens, workflow de componente novo e lista completa dos 25 componentes UI
- MEMORY.md: Seção "Design System & Protótipos" atualizada com referência às 4 barreiras e regras canônicas
- Build: zero erros; Testes: 758/758 passando (zero regressões)
- ✅ Resolved review finding [MEDIUM]: AC 1 parcial — adicionado step de análise DS no create-story/instructions.xml com scanning de protótipos, consulta ao DS e mapeamento de componentes
- ✅ Resolved review finding [LOW]: Data "Last Updated" atualizada para 2026-04-04 no project-context.md
- ✅ Resolved review finding [LOW]: Contagem de componentes corrigida de 24 para 25 nos Completion Notes
- ✅ Resolved review finding [LOW]: rule_count atualizado de 50 para 62 no frontmatter do project-context.md

### Change Log

- 2026-04-04: Implementação das 4 barreiras de Design System enforcement — templates BMAD, checklist de code review, project-context e MEMORY atualizados
- 2026-04-04: Code Review R1 — 1 MEDIUM + 3 LOWs. Action items criados. Status → in-progress
- 2026-04-04: Addressed code review findings — 4 items resolved (1 MEDIUM + 3 LOW). Build zero erros, 758/758 testes passando.

### File List

- `_bmad/bmm/workflows/4-implementation/create-story/template.md` — MODIFICADO (Task 0 DS + seção Dev Notes DS)
- `_bmad/bmm/workflows/4-implementation/code-review/checklist.md` — MODIFICADO (seção Visual & DS Compliance)
- `_bmad-output/project-context.md` — MODIFICADO (seção DS Enforcement Rules + lista de componentes)
- `~/.claude/projects/-Users-vitorcastilho-dev-caderninho/memory/MEMORY.md` — MODIFICADO (4 barreiras + regras)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — MODIFICADO (status in-progress → review)
- `_bmad/bmm/workflows/4-implementation/create-story/instructions.xml` — MODIFICADO (step DS analysis para Barreira 1 enforcement)
- `_bmad-output/implementation-artifacts/2-5-7-enforcement-e-workflow.md` — MODIFICADO (tasks, status, dev agent record, review follow-ups)
