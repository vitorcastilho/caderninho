# Story 1.2: Design System e Layout Responsivo

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want a consistent and responsive interface,
So that I can use the app comfortably on both desktop and mobile.

## Acceptance Criteria

1. shadcn/ui esta instalado com componentes base: Button, Input, Card, Sheet, Dialog, Sonner (toast), Tabs, Badge, Select, Table
2. Design tokens estao configurados no Tailwind v4 (`@theme {}`): paleta Stone & Indigo, fonte Inter com `tabular-nums`, espacamento base 4px
3. Sidebar colapsavel funciona no desktop (220px expandida, 56px recolhida) com transicao animada ~200ms
4. Bottom navigation com FAB central (48px) funciona no mobile (< 768px)
5. 3 breakpoints estao configurados: mobile (< 768px), tablet (768-1023px), desktop (>= 1024px)
6. Skeleton screens sao exibidos durante carregamento (nunca tela em branco)
7. Modo de densidade configuravel (compacto/espacado) esta implementado
8. O layout e validado contra os prototipos `proto-05-dashboard-desktop.html` e `proto-06-dashboard-mobile.html`
9. A UX valida o layout implementado

## Tasks / Subtasks

- [x] Task 1: Instalar e configurar shadcn/ui (AC: #1)
  - [x] 1.1 Executar `npx shadcn@latest init` com Tailwind v4 e estilo "new-york"
  - [x] 1.2 Adicionar componentes base: `npx shadcn@latest add button input card sheet dialog sonner tabs badge select table`
  - [x] 1.3 Verificar que os componentes estao em `src/client/components/ui/`
  - [x] 1.4 Configurar `components.json` com alias `@/client/components` (nao o padrao `@/components`)
- [x] Task 2: Configurar design tokens no Tailwind v4 (AC: #2)
  - [x] 2.1 Configurar paleta Stone & Indigo em `src/app/globals.css` via `@theme {}`
  - [x] 2.2 Configurar escala semantica de status (positive, attention, alert, critical)
  - [x] 2.3 Configurar fonte Inter via `next/font/google` em `layout.tsx`
  - [x] 2.4 Aplicar `font-variant-numeric: tabular-nums` para valores financeiros
  - [x] 2.5 Configurar espacamento base 4px como tokens
  - [x] 2.6 Configurar border-radius tokens (6px buttons, 8px cards internos, 10-12px cards principais)
  - [x] 2.7 Escrever testes para utilitarios de formatacao se aplicavel (TDD)
- [x] Task 3: Implementar Sidebar colapsavel (AC: #3)
  - [x] 3.1 Criar `src/client/components/layout/Sidebar.tsx`
  - [x] 3.2 Implementar estado expandido (220px) com labels visiveis e secoes com separador
  - [x] 3.3 Implementar estado recolhido (56px) com apenas icones e tooltip no hover
  - [x] 3.4 Implementar transicao animada ~200ms
  - [x] 3.5 Persistir estado collapsed/expanded em localStorage
  - [x] 3.6 Esconder sidebar no mobile (< 768px)
  - [x] 3.7 Escrever testes para logica de toggle/persistencia (TDD)
- [x] Task 4: Implementar Bottom Navigation com FAB (AC: #4)
  - [x] 4.1 Criar `src/client/components/layout/BottomNavigation.tsx`
  - [x] 4.2 Implementar 5 itens: Dashboard, Orcamentos, Registrar (FAB +), Checklist, Projecao
  - [x] 4.3 Implementar FAB central (48px) como botao de acao principal
  - [x] 4.4 Implementar indicador de item ativo (indigo) e inativo (cinza)
  - [x] 4.5 Exibir apenas no mobile (< 768px)
  - [x] 4.6 Implementar badge de notificacao (para futuro uso)
  - [x] 4.7 Escrever testes para navegacao ativa/inativa (TDD)
- [x] Task 5: Configurar breakpoints e layout responsivo (AC: #5)
  - [x] 5.1 Criar `src/app/(app)/layout.tsx` com logica responsiva (sidebar desktop, bottom nav mobile)
  - [x] 5.2 Configurar breakpoints Tailwind: sm (< 768px), md (768-1023px), lg (>= 1024px)
  - [x] 5.3 Implementar grid de conteudo: desktop 3 colunas gap 12px, mobile 1 coluna
  - [x] 5.4 Tablet: sidebar colapsada (60px, icones only)
- [x] Task 6: Implementar skeleton screens (AC: #6)
  - [x] 6.1 Criar componente `src/client/components/ui/Skeleton.tsx` (se shadcn/ui nao incluir)
  - [x] 6.2 Criar `src/app/(app)/dashboard/loading.tsx` com skeleton do dashboard
  - [x] 6.3 Estabelecer padrao de loading.tsx para futuras rotas
- [x] Task 7: Implementar modo de densidade configuravel (AC: #7)
  - [x] 7.1 Criar provider de densidade em `src/client/components/layout/DensityProvider.tsx`
  - [x] 7.2 Implementar modo Compacto: padding 12px, gap 8px, linhas 4px, barras 4px
  - [x] 7.3 Implementar modo Espacado: padding 20px, gap 16px, linhas 10px, barras 8px
  - [x] 7.4 Persistir preferencia em localStorage
  - [x] 7.5 Aplicar via CSS custom properties ou data attributes
  - [x] 7.6 Escrever testes para toggle de densidade e persistencia (TDD)
- [x] Task 8: Validacao visual contra prototipos (AC: #8, #9)
  - [x] 8.1 Comparar layout desktop com `proto-05-dashboard-desktop.html`
  - [x] 8.2 Comparar layout mobile com `proto-06-dashboard-mobile.html`
  - [x] 8.3 Verificar que sidebar, bottom nav, grid e tokens alinham com prototipos
  - [x] 8.4 Documentar diferencas e justificativas
- [x] Task 9: Validacao final
  - [x] 9.1 `npm run dev` funciona com o design system
  - [x] 9.2 `npm run build` compila sem erros
  - [x] 9.3 `npm test` roda e passa (todos os testes novos e existentes)
  - [x] 9.4 Layout responsivo funciona nos 3 breakpoints
  - [x] 9.5 Sidebar toggle funciona e persiste
  - [x] 9.6 Bottom nav funciona no mobile
  - [x] 9.7 Densidade alterna corretamente
  - [x] 9.8 Skeleton screens exibidos durante carregamento

## Dev Notes

### Versoes Exatas do Stack (Story 1.2)

| Tecnologia | Versao | Notas |
|---|---|---|
| shadcn/ui | latest (2026) | Componentes copiados para o projeto, customizaveis |
| Inter | Google Fonts | Via `next/font/google`, `tabular-nums` obrigatorio |
| Tailwind CSS | 4.2.1 | Ja instalado (Story 1.1). Config via CSS `@theme {}` |
| Next.js | 16.1.6 | Ja instalado. App Router, Turbopack padrao |
| Vitest | 4.1.0 | Ja instalado e configurado |

### ALERTA CRITICO: Tailwind CSS v4 — Config via CSS

A arquitetura menciona `tailwind.config.ts`, mas **Tailwind v4 nao usa arquivos de configuracao JS/TS**. Toda configuracao e feita via CSS:

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  /* Design tokens aqui — gera utilities automaticamente */
  --color-primary: #4F46E5;  /* -> bg-primary, text-primary */
  --font-sans: 'Inter', sans-serif;  /* -> font-sans */
}
```

**`@theme` vs `@theme inline` — Distincao CRITICA:**
- `@theme {}` — valores embutidos como CSS custom properties no `:root`. Usar para tokens estaticos (cores, radius, spacing).
- `@theme inline {}` — valores inlined diretamente nas utilities. Usar APENAS quando referenciando CSS variables definidas em outro lugar (ex: `var(--font-inter)` do next/font, ou variaveis shadcn/ui no `:root`).

**O `globals.css` atual ja tem `@theme inline {}` do create-next-app. Substituir pela configuracao completa do Caderninho.**

### ALERTA: shadcn/ui — Toast e "sonner"

O componente de toast no shadcn/ui agora se chama **sonner** (usa a lib Sonner internamente). O comando correto e `npx shadcn@latest add sonner`, NAO `toast`. O shadcn/ui init instala automaticamente: `tailwind-merge`, `clsx`, `class-variance-authority`, `lucide-react`, `tw-animate-css`.

### ALERTA: shadcn/ui — OKLCH vs HEX

O shadcn/ui com Tailwind v4 usa formato **OKLCH** para cores (ex: `oklch(0.55 0.15 250)`). Os design tokens da UX spec estao em HEX. Ao configurar o `globals.css`, usar os valores HEX da UX spec nos tokens customizados do Caderninho (paleta Stone & Indigo), e deixar os tokens padrao do shadcn/ui em OKLCH. A paleta do projeto tem prioridade sobre os defaults do shadcn.

### ALERTA: shadcn/ui com Path Aliases Customizados

O projeto usa aliases customizados (`@/client/components/ui/` em vez do padrao `@/components/ui/`). Ao inicializar o shadcn/ui, configurar o `components.json` para usar:

```json
{
  "aliases": {
    "components": "@/client/components",
    "ui": "@/client/components/ui",
    "hooks": "@/client/hooks",
    "lib": "@/client/utils"
  }
}
```

### ALERTA: Next.js 16 — Fonte Inter

Carregar Inter via `next/font/google` no `layout.tsx`:

```typescript
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
```

**Substituir a fonte Geist atual (padrao do create-next-app) por Inter.**

### Design Tokens Completos (da UX Spec)

**Paleta Stone & Indigo:**

| Token CSS | Valor | Uso |
|---|---|---|
| `--bg` | `#FAFAF9` (stone-50) | Background geral |
| `--surface` | `#FFFFFF` | Cards, modais, containers |
| `--border` | `#E7E5E4` (stone-200) | Bordas padrao |
| `--border-hover` | `#D6D3D1` (stone-300) | Bordas em hover/focus |
| `--text-primary` | `#1C1917` (stone-900) | Texto principal, titulos, valores |
| `--text-secondary` | `#78716C` (stone-500) | Labels, descricoes |
| `--text-tertiary` | `#A8A29E` (stone-400) | Texto auxiliar, placeholders |
| `--primary` | `#4F46E5` (indigo-600) | Acoes, links, elementos ativos |
| `--primary-hover` | `#4338CA` (indigo-700) | Hover em elementos primarios |
| `--primary-light` | `#EEF2FF` (indigo-50) | Background de badges e destaques |

**Escala semantica de status:**

| Token CSS | Valor | Uso |
|---|---|---|
| `--positive` / `--positive-bg` / `--positive-text` | `#22C55E` / `#DCFCE7` / `#166534` | Dentro do planejado, confirmacoes |
| `--attention` / `--attention-bg` / `--attention-text` | `#EAB308` / `#FEF9C3` / `#854D0E` | Proximo do limite, atencao |
| `--alert` / `--alert-bg` | `#F97316` / `#FFF7ED` | Regra de ouro comprometida |
| `--critical` / `--critical-bg` / `--critical-text` | `#DC2626` / `#FEE2E2` / `#991B1B` | Estourou, mes negativo |

**Tipografia Inter:**

| Nivel | Tamanho | Peso | Uso |
|---|---|---|---|
| Display | 28-32px | 700 | Valores financeiros grandes |
| Titulo | 18-20px | 600-700 | Titulos de pagina, secao |
| Subtitulo | 15-16px | 600 | Valores em linhas de resumo |
| Corpo | 13-14px | 400-500 | Texto geral, labels |
| Caption | 11-12px | 400-500 | Texto auxiliar, breadcrumbs |
| Label | 10-11px | 500 | Titulos de cards (uppercase, letter-spacing 0.5px) |

**`font-variant-numeric: tabular-nums`** — OBRIGATORIO em todos os valores financeiros para alinhamento em colunas.

**Espacamento base 4px:**

Toda medida e multiplo de 4: 4, 8, 12, 16, 20, 24, 28, 32.

**Border-radius:**

| Contexto | Valor |
|---|---|
| Buttons | 6px |
| Cards internos | 8px |
| Cards principais | 10-12px |
| Badges/Chips | 100px (full round) |
| Mobile frames | 24px |

### Especificacoes de Layout

**Sidebar (Desktop >= 1024px):**
- Expandida: 220px de largura, labels visiveis, secoes com separador
- Recolhida: 56px, apenas icones, tooltip no hover
- Transicao animada ~200ms
- Estado persistido em localStorage
- Conteudo: grid flexivel ao lado

**Sidebar (Tablet 768-1023px):**
- Sempre recolhida: 60px, icones sem label, expand on hover

**Bottom Navigation (Mobile < 768px):**
- Altura: 56px
- FAB central: 48px de diametro
- 5 itens: Dashboard, Orcamentos, Registrar (FAB +), Checklist, Projecao
- Touch targets: minimo 44x44px, largura minima ~75px por item
- Item ativo: cor indigo, inativo: cinza

**Grid de Conteudo:**
- Desktop: 3 colunas, gap 12px, cards podem ocupar span 2 ou span 3
- Tablet: 2 colunas, container max-width com padding lateral
- Mobile: 1 coluna, cards full-width, gap 12px

### Modo de Densidade

| Modo | Padding cards | Gap entre cards | Padding linhas | Barras | Uso ideal |
|---|---|---|---|---|---|
| Compacto | 12px | 8px | 4px | 4px | Desktop gestao, power users |
| Espacado | 20px | 16px | 10px | 8px | Mobile, consulta casual |

Implementar via CSS custom properties ou `data-density` attribute no `<html>` ou `<body>`:

```css
[data-density="compact"] {
  --density-card-padding: 12px;
  --density-gap: 8px;
  --density-line-padding: 4px;
  --density-bar-height: 4px;
}

[data-density="spacious"] {
  --density-card-padding: 20px;
  --density-gap: 16px;
  --density-line-padding: 10px;
  --density-bar-height: 8px;
}
```

### Skeleton Screens

- Cada rota sob `(app)/` DEVE ter um `loading.tsx`
- Nunca exibir tela em branco durante carregamento
- Skeletons devem replicar a estrutura visual do conteudo final
- Transicao skeleton -> conteudo: fade-in 200ms ease

### Acessibilidade (WCAG 2.1 AA)

- Contraste minimo: 4.5:1 texto normal, 3:1 texto grande
- Touch targets minimo 44x44px no mobile
- Focus ring: 2px indigo outline com 2px offset
- Skip link: "Pular para conteudo principal" como primeiro elemento focavel
- HTML semantico: `<nav>`, `<main>`, `<section>`, `<aside>`
- ARIA roles: `navigation` na sidebar/bottom nav, `aria-current="page"` no item ativo
- `prefers-reduced-motion: reduce` — desativar animacoes
- Cor NUNCA e o unico indicador — sempre acompanhada de icone ou texto

### Animacoes e Transicoes

| Elemento | Propriedade | Duracao | Easing |
|---|---|---|---|
| Sidebar expandir/recolher | width + opacity | 200ms | ease |
| Hover/Focus | cor e sombra | 150ms | ease |
| Skeleton -> conteudo | Fade-in | 200ms | ease |

**Respeitar `prefers-reduced-motion`.**

### Inteligencia da Story Anterior (1.1)

**O que ja existe e DEVE ser preservado:**
- Projeto Next.js 16.1.6 + TypeScript 5.9.3 + Tailwind CSS v4 + React 19.2.3
- Turbopack como bundler padrao
- Estrutura Clean Architecture + DDD em `src/server/`, `src/client/`, `src/shared/`, `src/app/`
- Path aliases: `@/*`, `@/server/*`, `@/client/*`, `@/shared/*`, `@/app/*`
- Result<T> em `src/shared/types/result.ts`
- Vitest 4.1.0 configurado com globals e path aliases
- `.env.example` com variaveis documentadas
- `html lang="pt-BR"` no layout.tsx
- Fontes atuais: Geist Sans e Geist Mono (SUBSTITUIR por Inter)
- globals.css com `@theme inline {}` basico (SUBSTITUIR pela config completa)

**Aprendizados do code review da Story 1.1:**
- Manter aliases sincronizados entre `tsconfig.json` e `vitest.config.ts` (comentario SYNC)
- Usar `import.meta.dirname` em vez de `__dirname` em contexto ESM (Vitest config)
- Testar imports via path aliases (`@/shared/types`)
- Coverage exclui arquivos de tipo (preparar para coverage real nesta story)
- ESLint `globalIgnores` adiciona patterns, nao faz override

**Commits recentes (padrao a seguir):**
```
feat: initialize Next.js project with Clean Architecture structure (Story 1.1)
fix: resolve all code review findings for Story 1.1 (7/7 issues)
fix: resolve code review rounds 2-3 for Story 1.1
```

### Estrutura de Arquivos a Criar/Modificar

**Novos arquivos:**
- `components.json` (raiz) — config do shadcn/ui
- `src/client/components/ui/*.tsx` — componentes shadcn/ui (10 componentes)
- `src/client/components/ui/skeleton.tsx` — skeleton (se nao incluido no shadcn)
- `src/client/components/layout/Sidebar.tsx`
- `src/client/components/layout/BottomNavigation.tsx`
- `src/client/components/layout/Header.tsx`
- `src/client/components/layout/DensityProvider.tsx`
- `src/app/(app)/layout.tsx` — layout responsivo com sidebar + bottom nav
- `src/app/(app)/dashboard/page.tsx` — pagina placeholder
- `src/app/(app)/dashboard/loading.tsx` — skeleton screen

**Arquivos a modificar:**
- `src/app/globals.css` — SUBSTITUIR config Tailwind v4 com tokens completos
- `src/app/layout.tsx` — SUBSTITUIR Geist por Inter, adicionar DensityProvider
- `package.json` — novas dependencias do shadcn/ui (se houver)

**Arquivos que NAO devem ser modificados:**
- `src/shared/types/result.ts` — intacto
- `src/shared/types/result.test.ts` — intacto
- `vitest.config.ts` — intacto (ja tem aliases corretos)
- `tsconfig.json` — intacto (aliases ja corretos)
- `.env.example` — intacto

### O Que NAO Fazer Nesta Story

- **NAO instalar** Drizzle ORM, Supabase, Better Auth, Zod, React Hook Form, Playwright
- **NAO criar** schemas de banco, migrations, RLS
- **NAO criar** rotas de autenticacao (login, register)
- **NAO implementar** componentes customizados do dominio (CascadeInput, BudgetProgressBar, etc.)
- **NAO criar** `tailwind.config.ts` (Tailwind v4 nao usa)
- **NAO implementar** logica de negocio em componentes de layout
- **NAO adicionar** dark mode (estruturar tokens para futuro, mas nao implementar)
- **NAO instalar** bibliotecas de graficos (Recharts, Nivo, D3) — isso e para stories futuras

### Escopo Exato

Esta story configura o **design system base e layout responsivo**:
1. shadcn/ui instalado com 10 componentes base
2. Design tokens (cores, tipografia, espacamento) configurados via Tailwind v4 CSS
3. Fonte Inter carregada e configurada
4. Layout responsivo: sidebar (desktop) + bottom nav (mobile) + grid
5. 3 breakpoints funcionando
6. Skeleton screens como padrao de carregamento
7. Densidade configuravel (compacto/espacado)
8. Validacao visual contra prototipos

### Prototipos de Referencia

Os prototipos HTML sao a fonte da verdade visual:
- **Desktop:** `_bmad-output/planning-artifacts/proto-05-dashboard-desktop.html`
- **Mobile:** `_bmad-output/planning-artifacts/proto-06-dashboard-mobile.html`

O dev DEVE abrir estes arquivos no browser e comparar com a implementacao.

### Project Structure Notes

- shadcn/ui componentes ficam em `src/client/components/ui/` (NAO no padrao `src/components/ui/`)
- Componentes de layout ficam em `src/client/components/layout/`
- O layout `(app)/` usa route groups do Next.js — futuras rotas autenticadas ficam dentro
- `(auth)/` sera criado em stories futuras para login/register

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Design System Foundation]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules — Loading States]
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns — Organizacao do Projeto]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Visual Design Foundation]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Design System Foundation]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Component Strategy]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Responsive Design & Accessibility]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Breakpoint Strategy]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2: Design System e Layout Responsivo]
- [Source: _bmad-output/project-context.md#Framework Rules — Tailwind CSS v4]
- [Source: _bmad-output/implementation-artifacts/1-1-inicializacao-do-projeto-e-estrutura-base.md#Dev Notes]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- localStorage mock necessario nos testes (jsdom do Node.js 22+ conflita com localStorage nativo)
- shadcn/ui v4 usa estilo "base-nova" com @base-ui/react (nao mais @radix-ui)
- shadcn init cria arquivos em caminhos padrao — necessario reconfigurar components.json e re-adicionar componentes

### Completion Notes List

- **Task 1:** shadcn/ui instalado com 10+1 componentes (button, input, card, sheet, dialog, sonner, tabs, badge, select, table, skeleton) em `src/client/components/ui/`. components.json configurado com aliases customizados.
- **Task 2:** Design tokens Stone & Indigo configurados em globals.css via `@theme {}` e `@theme inline {}`. Escala semantica de status (positive, attention, alert, critical). Fonte Inter via next/font. Spacing base 4px e border-radius tokens. 7 testes para cn().
- **Task 3:** Sidebar colapsavel implementada. Desktop (>=1024px): toggle 220px/56px com persistencia localStorage. Tablet (768-1023px): sempre colapsada 60px. Mobile (<768px): escondida. 7 testes para useSidebarState hook.
- **Task 4:** Bottom Navigation com FAB central (48px). 5 itens com indicador ativo/inativo. Visivel apenas no mobile (<768px). 5 testes para renderizacao e aria-current.
- **Task 5:** Layout responsivo `(app)/layout.tsx` integrando sidebar + bottom nav + grid (1/2/3 colunas). Dashboard placeholder com cards usando density tokens.
- **Task 6:** Skeleton component adicionado via shadcn. loading.tsx do dashboard replica estrutura visual. Padrao estabelecido para futuras rotas.
- **Task 7:** DensityProvider com context React. Modos compact/spacious aplicados via `data-density` attribute no body. Persistencia localStorage. 5 testes.
- **Task 8:** Comparacao com proto-05 e proto-06. Design tokens, sidebar, bottom nav e grid alinham. Diferencas documentadas e justificadas.
- **Task 9:** Build compila, 27 testes passam, lint sem erros.

### Implementation Plan

Abordagem TDD (Red-Green-Refactor):
1. shadcn/ui init + reconfig aliases
2. Design tokens completos via CSS (@theme + @theme inline + :root)
3. Hook useSidebarState com TDD → Sidebar component
4. BottomNavigation com TDD → 5 itens + FAB
5. Layout responsivo (app) com breakpoints
6. Skeleton screens
7. DensityProvider com TDD → context + data-density
8. Validacao visual contra prototipos
9. Validacao final (build + tests + lint)

### File List

**Novos arquivos:**
- `components.json` — config shadcn/ui com aliases customizados
- `src/client/utils/utils.ts` — utilitario cn() (tailwind-merge + clsx)
- `src/client/utils/utils.test.ts` — 7 testes para cn()
- `src/client/hooks/use-sidebar-state.ts` — hook de estado sidebar com localStorage
- `src/client/hooks/use-sidebar-state.test.ts` — 7 testes para useSidebarState
- `src/client/components/layout/Sidebar.tsx` — sidebar colapsavel responsiva
- `src/client/components/layout/BottomNavigation.tsx` — bottom nav mobile com FAB
- `src/client/components/layout/BottomNavigation.test.tsx` — 5 testes para BottomNavigation
- `src/client/components/layout/DensityProvider.tsx` — provider de densidade com context
- `src/client/components/layout/DensityProvider.test.tsx` — 5 testes para DensityProvider
- `src/client/components/ui/button.tsx` — shadcn button
- `src/client/components/ui/input.tsx` — shadcn input
- `src/client/components/ui/card.tsx` — shadcn card
- `src/client/components/ui/sheet.tsx` — shadcn sheet
- `src/client/components/ui/dialog.tsx` — shadcn dialog
- `src/client/components/ui/sonner.tsx` — shadcn sonner (toast)
- `src/client/components/ui/tabs.tsx` — shadcn tabs
- `src/client/components/ui/badge.tsx` — shadcn badge
- `src/client/components/ui/select.tsx` — shadcn select
- `src/client/components/ui/table.tsx` — shadcn table
- `src/client/components/ui/skeleton.tsx` — shadcn skeleton
- `src/app/(app)/layout.tsx` — layout responsivo com sidebar + bottom nav
- `src/app/(app)/dashboard/page.tsx` — dashboard placeholder
- `src/app/(app)/dashboard/loading.tsx` — skeleton screen do dashboard

**Arquivos modificados:**
- `src/app/globals.css` — design tokens Stone & Indigo completos, density, status colors
- `src/app/layout.tsx` — Inter font, DensityProvider wrapper
- `package.json` — dependencias shadcn/ui (class-variance-authority, clsx, lucide-react, etc.)

**Arquivos removidos:**
- `src/client/utils/.gitkeep` — substituido por utils.ts
- `src/client/hooks/.gitkeep` — substituido por use-sidebar-state.ts
- `src/client/components/ui/.gitkeep` — substituido por componentes shadcn

### Change Log

- 2026-03-16: Implementacao completa da Story 1.2 — Design System e Layout Responsivo. shadcn/ui com 11 componentes, design tokens Stone & Indigo, sidebar colapsavel, bottom nav mobile com FAB, layout responsivo 3 breakpoints, skeleton screens, modo de densidade configuravel. 27 testes (24 novos + 3 existentes).
