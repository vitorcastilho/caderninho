---
title: 'Página de Design System'
slug: 'design-system-page'
created: '2026-03-20'
status: 'review'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['Next.js 16', 'React 19', 'Tailwind CSS v4', 'shadcn/ui v4 + Base UI', 'CVA']
files_to_modify: ['src/app/design-system/page.tsx', 'src/app/design-system/layout.tsx', 'src/app/globals.css', 'src/client/components/ui/button.tsx', 'src/client/components/ui/dialog.tsx', 'src/client/components/ui/input.tsx', 'src/client/components/ui/select.tsx', 'src/client/components/ui/sheet.tsx', 'src/client/components/ui/tabs.tsx']
code_patterns: ['route groups (app)/(auth)', 'client components com useState', 'CSS tokens em globals.css']
test_patterns: []
---

# Tech-Spec: Página de Design System

**Created:** 2026-03-20

## Overview

### Problem Statement

Não existe referência visual centralizada dos componentes e padrões do app Caderninho. Análise de 27 protótipos HTML revelou **dezenas de inconsistências** entre protótipos — cores primárias diferentes (`#4F46E5` vs `#6d28d9`), input border-radius variando (6px vs 8px), padding de botões sem padrão, badges com 3 tamanhos diferentes, sidebar com 3 larguras (220px, 240px, 260px), e 2 padrões distintos de lista colapsável sem definição canônica.

Sem um design system documentado, tanto dev quanto UX perdem tempo corrigindo discrepâncias que poderiam ser evitadas.

### Solution

Criar uma rota `/design-system` (visível apenas em ambiente de desenvolvimento) que renderiza os componentes reais do projeto como um catálogo vivo. A página serve como referência obrigatória para desenvolvimento de novas telas e como local de validação de novos componentes pela UX.

### Scope

**In Scope:**
- Cores/tokens (primary, secondary, destructive, muted, status colors: positive, attention, alert, critical, info)
- Tipografia (tamanhos, pesos, line-heights — h1, h2, h3, body, caption, label)
- Botões (todos 6 variants × 8 sizes + estados hover/disabled/loading)
- Cards (border-radius, shadow, border, padding)
- Inputs, selects, labels, badges
- Padrão de lista colapsável (header + itens expandíveis — definir UM padrão canônico)
- Empty states (borda tracejada, CTA, hints)
- Dropdown menus (seta, separador, itens destrutivos)
- Cursores (pointer em interativos, default em texto, text em inputs)
- Espaçamento/density modes (spacious vs compact)
- Regra de processo: dev obrigatoriamente consulta o design system

**Out of Scope:**
- Dark mode (ainda não ativo no app)
- Componentes de domínio específico (BankAccountCard, InvestmentForm, CategoryCard, etc.)
- Storybook ou ferramenta externa
- Testes automatizados para a página de design system

## Context for Development

### Codebase Patterns

- **Tailwind v4**: config via CSS (`@theme {}` e `@theme inline {}`), NÃO usar `tailwind.config.ts`
- **shadcn/ui v4**: usa `@base-ui/react` (não Radix), estilo "base-nova"
- **CVA**: class-variance-authority para variantes de componentes (ex: Button)
- **Route groups**: `(app)` para dashboard, `(auth)` para login/registro
- **CSS tokens**: definidos em `src/app/globals.css` com variáveis CSS customizadas
- **Density modes**: `data-density="spacious"` vs `"compact"` no body

### Decisões de Design Confirmadas (de `ux-design-directions.html`)

| Aspecto | Decisão |
|---------|---------|
| Paleta | Stone & Indigo (`#4F46E5` primary, `#FAFAF9` bg, `#1C1917` text) |
| Tipografia | Inter, pesos 400/500/600/700 |
| Layout Desktop | Sidebar 220px + Content flex |
| Densidade | Spacious (padrão) + Compact (configurável) |
| Ordem colunas | Orçamento → Gasto → Resta |
| Cursores | `cursor-default` no body, `cursor-pointer` em botões/interativos |
| Transição padrão | 150ms ease |
| Card border-radius | 12px (`rounded-card`) |
| Input border-radius | 8px (`--radius-button`, `rounded-md` no componente) |

### Inconsistências dos Protótipos (input para o Design System)

As seguintes inconsistências foram encontradas nos 27 protótipos e devem ser **resolvidas** pelo design system, documentando o valor canônico:

**HIGH — O design system deve definir o valor correto:**
1. Primary color: `#4F46E5` (canônico) — `categories-ux-v2` usa `#6d28d9` (errado)
2. Input border-radius: padronizado em 8px (`--radius-button`, `rounded-md`) — protótipos variavam 6px/8px, 8px é o canônico
3. Input border-width: componente usa `1px` — proto-02 usa `1.5px`
4. Botão primary padding: variedade enorme entre protótipos — componente CVA é o canônico
5. Botão disabled: usar `opacity-50` + `pointer-events-none` (padrão do componente)
6. Badge tamanhos: componente tem 4 variants — protótipos usam ad-hoc
7. Card shadow: componente não tem shadow por padrão — decidir se hover-only ou sempre
8. Lista colapsável: 2 padrões nos protótipos — definir UM canônico

**MEDIUM — Documentar no design system:**
9. Sidebar width: 220px (canônico de `ux-design-directions`)
10. Form-group gap: padronizar
11. Overlay opacity: padronizar 0.25 (bg-black/25) + backdrop-blur-sm
12. Cor `--info`: adicionar ao globals.css (`#3B82F6`, bg `#DBEAFE`, text `#1E40AF`)

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `src/app/globals.css` | Todos os tokens CSS (cores, radius, density, status) |
| `src/client/components/ui/button.tsx` | Button com CVA (6 variants × 8 sizes) |
| `src/client/components/ui/input.tsx` | Input component |
| `src/client/components/ui/select.tsx` | Select component (Base UI) |
| `src/client/components/ui/card.tsx` | Card component |
| `src/client/components/ui/badge.tsx` | Badge component |
| `src/client/components/ui/dialog.tsx` | Dialog/modal component |
| `src/client/components/ui/label.tsx` | Label component |
| `src/client/components/ui/table.tsx` | Table component |
| `src/client/components/ui/tabs.tsx` | Tabs component |
| `src/client/components/ui/skeleton.tsx` | Skeleton loading |
| `src/client/components/ui/sheet.tsx` | Sheet (drawer) component |
| `src/app/layout.tsx` | Root layout (cursor-default, density) |

### Technical Decisions

- A rota `/design-system` deve ser uma rota standalone (fora dos route groups `(app)` e `(auth)`) para não herdar sidebar/header
- Em produção, a rota não aparece no sidebar (já é o caso, pois não está em navItems)
- A página renderiza componentes reais importados de `@/client/components/ui/` — não são mockups
- Página única com navegação interna via anchor links (scroll to section)
- Se o projeto crescer, pode ser dividida em sub-rotas futuramente

### Regra de Processo — Design System First

**Regra obrigatória integrada ao ciclo de desenvolvimento:**

1. Na **criação da story**, verificar se todos os componentes de UI necessários existem no design system
2. Se o componente/padrão **existe** → dev usa exatamente como documentado
3. Se o componente/padrão **não existe** → criar e validar o componente no design system **faz parte da entrega da story** (acceptance criteria)
4. Se durante o desenvolvimento surgir um componente não previsto (edge case) → criá-lo no design system antes de fechar a story
5. Essa regra deve ser registrada no `CLAUDE.md` e/ou `MEMORY.md` para ser seguida automaticamente pelo SM na criação de stories e pelo dev na implementação

## Implementation Plan

### Inventário de Componentes

**Button** (`button.tsx`) — 6 variants × 8 sizes:
- Variants: `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`
- Sizes: `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`
- Base: `@base-ui/react/button` + CVA, cursor-pointer no base

**Input** (`input.tsx`) — Componente simples:
- Props: `className`, herda `React.ComponentProps<"input">`
- Styles: `h-9`, `rounded-lg`, `border-border`, `focus-visible:ring-ring/50`

**Select** (`select.tsx`) — Base UI, 6 sub-componentes:
- `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`
- Trigger: `h-9`, `rounded-lg`, `border-border`, seta ChevronDown

**Card** (`card.tsx`) — 5 slots:
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- Base: `rounded-card`, `bg-card`, `border`, `text-card-foreground`

**Badge** (`badge.tsx`) — 4 variants via CVA:
- Variants: `default`, `secondary`, `outline`, `destructive`
- Base: `rounded-lg`, `text-xs`, `font-medium`

**Dialog** (`dialog.tsx`) — Base UI, 7 sub-componentes:
- `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`

**Label** (`label.tsx`) — `text-sm`, `font-medium`, `peer-disabled:opacity-50`

**Table** (`table.tsx`) — 7 sub-componentes:
- `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`

**Tabs** (`tabs.tsx`) — 4 sub-componentes:
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`

**Skeleton** (`skeleton.tsx`) — `animate-pulse`, `rounded-md`, `bg-primary/10`

**Sheet** (`sheet.tsx`) — Drawer lateral, 7 sub-componentes, posições via CVA

**Sonner/Toaster** (`sonner.tsx`) — Wrapper do `sonner`

### Tasks

- [x] Task 1: Criar estrutura da rota `/design-system`
  - File: `src/app/design-system/layout.tsx`
  - Action: Criar layout standalone (sem sidebar/header) com título "Design System — Caderninho", navegação lateral fixa com anchor links para cada seção, e container com max-width
  - File: `src/app/design-system/page.tsx`
  - Action: Criar page.tsx como client component ("use client") que importa e renderiza todas as seções — necessário por causa dos ~15 useState para interatividade (toggles, dialogs, collapsibles, density, etc.)
  - Notes: Rota fora dos route groups `(app)` e `(auth)`. Client component justificado pela quantidade de seções interativas

- [x] Task 2: Seção Cores/Tokens
  - File: `src/app/design-system/page.tsx`
  - Action: Renderizar swatches de todas as cores CSS definidas em `globals.css`. Organizar em grupos: Neutros (bg, surface, border, text-primary/secondary/tertiary), Primária (primary, primary-hover, primary-light), Semânticas (positive, attention, alert, critical, info com bg/text variants), Destrutiva (destructive). Cada swatch mostra: nome da variável CSS, valor hex, e preview colorido
  - Notes: Ler valores de `globals.css` para documentação. Incluir `--info` se já existir, senão registrar como pendência

- [x] Task 3: Seção Tipografia
  - File: `src/app/design-system/page.tsx`
  - Action: Renderizar exemplos reais de cada nível tipográfico usando classes Tailwind: H1 (text-2xl/font-bold), H2 (text-xl/font-semibold), H3 (text-lg/font-semibold), H4 (text-base/font-medium), Body (text-sm), Small (text-xs/text-muted-foreground), Label (text-sm/font-medium via componente Label). Usar texto em português relevante ao app. Mostrar `tabular-nums` para valores monetários
  - Notes: Font-family: Inter. Usa escala Tailwind padrão (aproximações dos valores de `ux-design-directions.html`)

- [x] Task 4: Seção Botões
  - File: `src/app/design-system/page.tsx`
  - Action: Renderizar grid com todos os 6 variants (`default`, `outline`, `secondary`, `ghost`, `destructive`, `link`) × 8 sizes (`default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`). Para cada combinação, mostrar: estado normal, hover (documentar cor), disabled (`disabled` prop), e loading (com texto "Salvando..."). Importar `Button` real de `@/client/components/ui/button`
  - Notes: Usar componente real, não mockup. O grid pode ser uma tabela ou grid CSS

- [x] Task 5: Seção Cards
  - File: `src/app/design-system/page.tsx`
  - Action: Renderizar exemplos de Card com diferentes composições: Card simples (apenas CardContent), Card completo (CardHeader + CardTitle + CardDescription + CardContent), Card com ações no header. Documentar: `rounded-card` (12px), `bg-card`, `border`, sem shadow por padrão
  - Notes: Importar `Card` e sub-componentes reais

- [x] Task 6: Seção Formulários
  - File: `src/app/design-system/page.tsx`
  - Action: Renderizar exemplos de: Input (default, focus, error com `aria-invalid`, disabled), Select com opções, Label associado a Input, Input com prefixo (R$) estilo monetário (`inputMode="numeric"`). Mostrar estados visuais lado a lado
  - Notes: Importar componentes reais. Documentar padrão de input monetário (referência: `BankAccountForm.tsx`)

- [x] Task 7: Seção Badges
  - File: `src/app/design-system/page.tsx`
  - Action: Renderizar os 4 variants do Badge (`default`, `secondary`, `outline`, `destructive`) com textos de exemplo relevantes (ex: "Ativo", "Pendente", "3 categorias", "Atrasado")
  - Notes: Importar `Badge` real

- [x] Task 8: Seção Dialogs
  - File: `src/app/design-system/page.tsx`
  - Action: Renderizar exemplo interativo de Dialog com: DialogTrigger (botão que abre), DialogContent com DialogHeader (título + descrição), DialogFooter com botões Cancelar (outline) e Confirmar (destructive). Incluir exemplo de confirmação destrutiva (ex: "Arquivar categoria")
  - Notes: `'use client'` necessário para interatividade do dialog. Pode ser um componente separado importado na page

- [x] Task 9: Seção Tabelas
  - File: `src/app/design-system/page.tsx`
  - Action: Renderizar Table com dados de exemplo (3-4 linhas) com: TableHeader, TableBody, TableRow, TableHead, TableCell. Usar dados financeiros fictícios para contextualizar (nome, valor, status)
  - Notes: Importar componentes reais de Table

- [x] Task 10: Seção Tabs
  - File: `src/app/design-system/page.tsx`
  - Action: Renderizar Tabs com 3 abas de exemplo (ex: "Visual", "Lista", "Timeline") com conteúdo simples em cada TabsContent
  - Notes: Importar componentes reais de Tabs

- [x] Task 11: Seção Empty States
  - File: `src/app/design-system/page.tsx`
  - Action: Renderizar o padrão canônico de empty state: container com `border border-dashed border-border rounded-lg`, texto descritivo centralizado, botão CTA (secondary), e hint text (muted). Exemplo: "Nenhuma categoria ainda" + botão "+ Adicionar categoria" + hint "Ex: Moradia, Alimentação..."
  - Notes: Seguir padrão já implementado em `ClassificationSection.tsx`

- [x] Task 12: Seção Lista Colapsável
  - File: `src/app/design-system/page.tsx`
  - Action: Renderizar o padrão canônico de lista colapsável com: header clicável (chevron ▼ que rotaciona -90° ao colapsar, título, spacer, badge de contagem, ações), body com itens que podem ter sub-itens indentados (28px margin-left). Documentar: chevron DOWN = expandido, chevron LEFT = colapsado. Sub-itens com dot bullet (4px circle). Ações de sub-itens aparecem só no hover
  - Notes: `'use client'` necessário para toggle. Definir este como o ÚNICO padrão de lista colapsável do app

- [x] Task 13: Seção Cursores
  - File: `src/app/design-system/page.tsx`
  - Action: Renderizar 3 zonas interativas demonstrando: `cursor-pointer` (botões, links, elementos clicáveis), `cursor-default` (texto, labels, áreas não interativas — padrão do body), `cursor-text` (inputs em focus). Cada zona com label descritivo e borda visual
  - Notes: Documentar regra: body = cursor-default, Button = cursor-pointer, Input = cursor-text

- [x] Task 14: Seção Espaçamento/Density
  - File: `src/app/design-system/page.tsx`
  - Action: Renderizar toggle entre `data-density="spacious"` e `data-density="compact"` com um card de exemplo que muda visualmente entre os dois modos. Documentar a escala de espaçamento usada: 4px, 8px, 12px, 16px, 20px, 24px, 32px
  - Notes: `'use client'` necessário para toggle. Usar `DensityProvider` existente como referência

- [x] Task 15: Seção Skeleton Loading
  - File: `src/app/design-system/page.tsx`
  - Action: Renderizar exemplos de Skeleton em diferentes formatos: linha de texto, card completo, avatar circular. Mostrar animação pulse em ação
  - Notes: Importar `Skeleton` real

### Acceptance Criteria

- [x] AC 1: Given ambiente de desenvolvimento, when acessar `/design-system`, then a página renderiza com todas as 14 seções visíveis e navegáveis por anchor links
- [x] AC 2: Given a seção de cores, when visualizar, then todas as cores do `globals.css` são mostradas com swatches, nome da variável CSS e valor hex
- [x] AC 3: Given a seção de botões, when visualizar, then todos os 6 variants e 8 sizes são renderizados agrupados por tipo (variantes, tamanhos, ícones, estados), incluindo disabled e loading
- [x] AC 4: Given a seção de formulários, when visualizar, then Input, Select e Label são renderizados em estados default, focus, error e disabled
- [x] AC 5: Given a seção de lista colapsável, when clicar no header, then o body colapsa/expande com animação do chevron (▼ → ◀)
- [x] AC 6: Given a seção de density, when alternar entre spacious e compact, then o card de exemplo muda de espaçamento visualmente
- [x] AC 7: Given a seção de cursores, when passar o mouse nas 3 zonas, then o cursor muda corretamente (pointer, default, text)
- [x] AC 8: Given a seção de empty states, when visualizar, then o padrão canônico é exibido com borda tracejada, CTA e hint
- [x] AC 9: Given qualquer componente na página, when inspecionar, then é o componente real importado de `@/client/components/ui/` (não mockup)
- [x] AC 10: Given a rota `/design-system`, when verificar em produção, then a rota NÃO aparece no sidebar de navegação

### Review Action Items (R1 — 2026-03-23)

**🔴 HIGH — Deve fixar antes de fechar a story:**

- [x] **[H1] Swatch da seção Cores deve mostrar variável CSS e valor hex**
  - Arquivo: `src/app/design-system/page.tsx` — componente `Swatch` (linha 72) e `CoresSection` (linha 141)
  - Problema: AC 2 exige "nome da variável CSS e valor hex". Atualmente o Swatch só mostra preview colorido + label curto (ex: "background"). Um dev não consegue saber que a variável é `--background` e o valor é `#FAFAF9`
  - Fix: Alterar o componente `Swatch` para receber e exibir o nome da variável CSS (ex: `--background`) e o valor hex (ex: `#FAFAF9`) como texto. Atualizar todas as chamadas em `CoresSection` para passar esses dados
  - AC validado: AC 2

**🟢 LOW — Backlog (não blocking, implementar quando conveniente):**

- [x] **[L1] Botões: layout agrupado ao invés de grid 6×8**
  - AC 3 menciona "grid com todos os 6 variants × 8 sizes". Implementação agrupa por tipo (variants, sizes, ícones, estados) — mais usável, mas não é matriz cruzada. Todos os variants e sizes estão visíveis individualmente
  - Sugestão: Manter layout atual (mais legível) e atualizar AC 3 para refletir

- [x] **[L2] Border-radius Input/Button: 8px vs spec 6px**
  - `globals.css`: `--radius-button` mudou de 6px→8px. `button.tsx` e `input.tsx`: `rounded-lg`→`rounded-md`. Tech-spec dizia 6px mas dev padronizou em 8px
  - Sugestão: Se 8px é o valor definitivo, atualizar tech-spec inconsistência #2

- [x] **[L3] Tipografia com tamanhos Tailwind aproximados**
  - H2 = text-xl (20px) vs spec 18px/600. H3 = text-lg (18px) vs spec 14px/700. Label sem uppercase/tracking 0.5px
  - Sugestão: Avaliar se vale criar custom sizes ou aceitar equivalentes Tailwind

- [x] **[L4] Page.tsx inteira como "use client"**
  - Tech-spec diz "server component que importa". Implementação usa `"use client"` no topo por causa dos hooks de interatividade (useState em ~15 seções)
  - Sugestão: Extrair seções interativas em client components separados e manter page como server component. Ou aceitar e atualizar tech-spec

- [x] **[L5] 7 arquivos UI alterados não documentados em `files_to_modify`**
  - globals.css, button.tsx, dialog.tsx, input.tsx, select.tsx, sheet.tsx, tabs.tsx foram modificados para corrigir inconsistências (cursor-pointer, overlay, radius) mas não estão em `files_to_modify`
  - Sugestão: Atualizar `files_to_modify` no tech-spec para incluir todos os arquivos tocados

### Auditoria de Cobertura — Protótipos vs Design System (R2 — 2026-03-23)

**🔴 HIGH — Componentes faltantes no DS (existem nos protótipos mas não no catálogo):**

- [x] **[A-H1] Toast/Sonner** (proto-04)
  - Arquivo: `src/app/design-system/page.tsx`
  - Problema: O protótipo 04 usa toast/notificações de ação (ex: "Transação salva"), mas o DS não tem seção demonstrando o componente Sonner/Toast
  - Fix: Adicionar seção "Toast / Notificações" ao DS renderizando exemplos reais do Sonner (success, error, info, com action button)

- [x] **[A-H2] Progress Ring (circular)** (proto-10, visual-checklist)
  - Arquivo: `src/app/design-system/page.tsx`
  - Problema: Protótipos usam SVG circular com stroke-dasharray para mostrar progresso (ex: checklist 7/12 = 58%). DS só tem barras de progresso lineares
  - Fix: Adicionar seção "Progress Ring" ou expandir "Barras de Progresso" com variante circular SVG

- [x] **[A-H3] Password strength indicator** (proto-02)
  - Arquivo: `src/app/design-system/page.tsx`
  - Problema: Proto-02 (cadastro) tem barra de força de senha com 4 segmentos coloridos (fraca/média/forte/muito forte). Não documentado no DS
  - Fix: Adicionar na seção "Formulários" um exemplo de input de senha com indicador de força

- [x] **[A-H4] Card brands Elo/Amex/Hiper** (proto-08)
  - Arquivo: `src/app/design-system/page.tsx`
  - Problema: Seção "Card Cartão de Crédito" só mostra Visa e Mastercard. Proto-08 (onboarding) define Elo, Amex e Hiper com estilos específicos
  - Fix: Adicionar as 3 bandeiras faltantes na seção existente

- [x] **[A-H5] Input valid state (borda verde)** (proto-02)
  - Arquivo: `src/app/design-system/page.tsx`
  - Problema: Seção "Formulários" mostra estados default, focus, error e disabled, mas não mostra o estado "válido" com borda verde usado no proto-02
  - Fix: Adicionar variante "valid/success" ao showcase de inputs

- [x] **[A-H6] Dropdown / Context Menu** (categories-ux-v2, proto-14)
  - Arquivo: `src/app/design-system/page.tsx`
  - Problema: Protótipos usam menus contextuais (seta apontando para ícone, itens, separador, item destrutivo em vermelho). O DS não tem seção para Dropdown Menu
  - Fix: Adicionar seção "Dropdown Menu" renderizando o componente real com variantes (item normal, separador, item destrutivo)

- [x] **[A-H7] Credit Card Hero Visual** (proto-12, visual-credit-card-detail)
  - Arquivo: `src/app/design-system/page.tsx`
  - Problema: Proto-12 tem card visual com gradiente indigo, chip dourado, número com letter-spacing, flag — é um componente complexo e central. Não documentado no DS
  - Fix: Adicionar seção "Card Cartão Hero" ou expandir a existente "Card Cartão de Crédito" com a variante hero/visual

**🔴 HIGH — Inconsistências internas no DS:**

- [x] **[A-H8] Sidebar width 224px vs 220px canônico**
  - Arquivo: `src/app/design-system/layout.tsx`
  - Problema: O layout usa `w-56` (224px) mas o protótipo canônico (proto-10) e a seção MenuLateral dentro do próprio DS mostram 220px. Inconsistência entre o frame e o conteúdo
  - Fix: Alterar `w-56` para `w-[220px]` e `ml-56` para `ml-[220px]` no layout.tsx

- [x] **[A-H9] Native `<button>` onde deveria usar `<Button>` component**
  - Arquivo: `src/app/design-system/page.tsx` — seções SeletorMes, ControleSegmentado, ColunaMensal, CLItem
  - Problema: Várias seções usam `<button>` HTML nativo ao invés do `<Button>` do shadcn/ui. O DS deveria ser referência de uso correto dos componentes
  - Fix: Substituir `<button>` nativo por `<Button>` component em todas as seções afetadas

**🟡 MEDIUM — Inconsistências menores:**

- [x] **[A-M1] Mixed border-radius approaches**
  - Arquivo: `src/app/design-system/page.tsx`
  - Problema: Algumas seções usam tokens CSS (`rounded-[var(--radius-card)]`), outras usam classes Tailwind diretas (`rounded-lg`, `rounded-xl`). Falta consistência
  - Fix: Padronizar uso de tokens CSS de border-radius onde existirem tokens definidos

- [x] **[A-M2] Hardcoded colors em vez de tokens**
  - Arquivo: `src/app/design-system/page.tsx`
  - Problema: Algumas seções usam cores hardcoded (ex: `bg-indigo-600`, `text-red-500`) em vez dos tokens semânticos definidos em globals.css
  - Fix: Substituir cores hardcoded por tokens semânticos (ex: `bg-primary`, `text-critical`)

- [x] **[A-M3] Loading button text inconsistente**
  - Arquivo: `src/app/design-system/page.tsx`
  - Problema: Seção de botões mostra estado loading mas o texto durante loading varia entre seções. Definir padrão canônico
  - Fix: Padronizar texto de loading buttons (ex: "Salvando..." com spinner)

## Additional Context

### Dependencies

- Nenhuma dependência externa nova — usa apenas componentes já existentes no projeto
- Depende dos componentes em `src/client/components/ui/` estarem funcionando corretamente

### Testing Strategy

- Sem testes automatizados para a página de design system (é uma página de documentação visual)
- Validação manual: abrir `/design-system` e verificar se todos os componentes renderizam corretamente
- Verificar que a página não aparece no sidebar em produção

### Notes

- A página serve como "source of truth" visual — se o componente muda, a página reflete automaticamente
- Futuramente pode ser expandida para incluir dark mode, componentes de domínio, e guidelines de UX writing
- A cor `--info` (`#3B82F6`) pode precisar ser adicionada ao `globals.css` se ainda não existir
- O padrão de lista colapsável definido aqui será o padrão canônico — todas as telas existentes devem convergir para ele
- Após implementação, a Story 2.4 (Categorias) deve ser revisitada para alinhar com o design system
