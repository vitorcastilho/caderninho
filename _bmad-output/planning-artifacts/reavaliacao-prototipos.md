# Reavaliação Completa dos Protótipos — Documento de Saída

**Story:** 2.5.2
**Data:** 2026-03-25
**Status:** Concluído

---

## 1. Tabela de Regras Canônicas

> Referência completa em: `_bmad-output/planning-artifacts/regras-canonicas-prototipos.md`

| Aspecto | Regra Canônica | Exemplo |
|---------|---------------|---------|
| Valores monetários | `R$ X.XXX,XX` — sempre 2 decimais, espaço após R$ | `R$ 3.000,00` |
| Percentuais | `XX,XX%` — sempre 2 decimais | `25,03%` |
| Sidebar desktop | 220px expandido, 56px colapsado. 2 seções: Navegação (4 itens) + Configurações (5 itens). Footer com avatar + nome + papel | Sidebar canônico de `Sidebar.tsx` |
| Bottom nav mobile | 5 itens: Dashboard, Cartões, Registrar (FAB 48px), Checklist, Projeção. Altura 56px | Bottom nav canônico de `BottomNavigation.tsx` |
| Fonte | Inter (400, 500, 600, 700). `font-variant-numeric: tabular-nums` **apenas** em elementos de valor | Números alinhados em colunas |
| Paleta | Stone & Indigo. `--bg: #FAFAF9`, `--primary: #4F46E5`, `--text-primary: #1C1917` | Variáveis CSS canônicas em `globals.css` |
| Espaçamento | Múltiplos de 4px: 4, 8, 12, 16, 20, 24, 32, 40, 48 | Nunca 6, 9, 10, 14 |
| Border-radius | `--radius-card: 12px`, `--radius-button: 8px`, `--radius-card-inner: 8px` | Tokens em CSS variables |

---

## 2. Inventário Completo com Findings

### 2.1 Protótipos Canônicos (16 arquivos)

| # | Arquivo | Tela | Breakpoints | Status Anterior | Findings Corrigidos |
|---|---------|------|-------------|-----------------|---------------------|
| 01 | `proto-01-login.html` | Login | Mobile + Desktop | Precisava corrigir | CSS vars, spacing (6→8, 14→16), font-variant-numeric global removido |
| 02 | `proto-02-signup.html` | Cadastro | Mobile + Desktop | Precisava corrigir | CSS vars, spacing (6→8, 10→12), btn radius |
| 03 | `proto-03-link-account.html` | Vincular Contas | Mobile + Desktop | Precisava corrigir | **Sidebar substituído**, **bottom nav substituído**, spacing, CSS vars |
| 04 | `proto-04-permissions.html` | Permissões | Mobile + Desktop (2 frames) | Precisava corrigir | **Sidebar substituído**, **bottom nav substituído** (2x), spacing (20+ fixes) |
| 05 | `proto-05-dashboard-desktop.html` | Dashboard (Desktop) | Desktop | Precisava corrigir | **Sidebar substituído**, **valores monetários** (~20), font-variant-numeric seletivo, spacing |
| 06 | `proto-06-dashboard-mobile.html` | Dashboard (Mobile) | Mobile | Precisava corrigir | **Bottom nav:** "Orçamentos"→"Cartões", valores monetários (~15), spacing |
| 07 | `proto-07-cascade-input.html` | Registro de Gasto | Mobile (5 states) + Desktop | Precisava corrigir | **Keypad: vírgula removida** (estilo app bancário), valores monetários (~12), spacing |
| 08 | `proto-08-onboarding.html` | Onboarding (5 etapas) | Mobile + Desktop | Precisava corrigir | Valores monetários em inputs, **acentos corrigidos** (~30), spacing, CSS vars |
| 09 | `proto-09-budgets.html` | Orçamentos | Desktop + Mobile | Precisava corrigir | **Sidebar substituído**, **bottom nav substituído**, **centenas de valores monetários** (treemap + tooltips + JS), percentuais, spacing |
| 10 | `proto-10-checklist.html` | Checklist Mensal | Desktop + Mobile | Precisava corrigir | **Sidebar substituído**, **bottom nav substituído**, valores monetários (~25), percentuais, JS corrigido, spacing |
| 11 | `proto-11-projection.html` | Projeção Futura | Desktop + Mobile | Precisava corrigir | **Sidebar substituído** (width 240→220), **bottom nav substituído** (height 72→56), valores monetários, percentuais, JS corrigido |
| 12 | `proto-12-credit-card.html` | Cartão de Crédito | Desktop + Mobile | Precisava corrigir | **Sidebar completamente reconstruído** (removidos cards de banco), **bottom nav substituído** (5 itens diferentes→canônico), valores monetários (~30), font-variant-numeric seletivo, spacing (20+ fixes) |
| 13 | `proto-13-reconciliation.html` | Reconciliação de Fatura | Desktop + Mobile | Precisava corrigir | **Sidebar substituído**, **bottom nav substituído**, font-variant-numeric, JS `formatBRL` corrigido, valores estáticos mobile (~20), spacing |
| 14 | `proto-14-settings.html` | Configurações / Categorias | Desktop + Mobile | Precisava corrigir | **Sidebar substituído** (260→220px), **bottom nav substituído**, valores monetários (~18 desktop + ~16 mobile), font-variant-numeric, spacing (9→8, 14→16) |
| 15 | `proto-15-drill-down.html` | Drill-down Analítico | Mobile (4 níveis) + Desktop | Precisava corrigir | **~50 valores monetários**, **~35 percentuais**, **JS treeData inteiro** (~40 data points), valores negativos, insight text, font-variant-numeric seletivo |
| 16 | `categories-ux-v2.html` | Categorias UX v2 | Mobile (componente) | Precisava corrigir | **Paleta Purple/Neutral → Indigo/Stone** (7 variáveis CSS), **Inter font adicionada**, `#fafafa`→`var(--bg)`, spacing |

### 2.2 Protótipos Exploratórios (12 arquivos)

| Arquivo | Classificação | Decisão |
|---------|--------------|---------|
| `design-system-comparison.html` | Comparação DS antes/depois | **ARQUIVAR** — decisão tomada (Stone & Indigo) |
| `ux-design-directions.html` | Exploração de direções UX | **ARQUIVAR** — decisões incorporadas aos protótipos canônicos |
| `visual-bank-accounts-v2.html` | Variação visual de contas | **ARQUIVAR** — proto-03/04 são canônicos |
| `visual-cascade-input.html` | Variação do cascade input | **ARQUIVAR** — proto-07 é canônico |
| `visual-category-detail.html` | Detalhe de categoria | **MANTER** — útil para Epic 3+ |
| `visual-categories-redesign.html` | Redesign de categorias | **ARQUIVAR** — categories-ux-v2 é canônico |
| `visual-categories-settings.html` | Config de categorias | **MANTER** — complementa proto-14 |
| `visual-credit-card-detail.html` | Detalhe do cartão | **MANTER** — útil para Epic 5 |
| `visual-dashboard-widgets.html` | Widgets do dashboard | **MANTER** — útil para Epic 6 |
| `visual-drill-down-tree.html` | Árvore drill-down | **MANTER** — complementa proto-15 |
| `visual-onboarding-flow.html` | Fluxo de onboarding | **ARQUIVAR** — proto-08 é canônico |
| `visual-reconciliation-flow.html` | Fluxo de reconciliação | **MANTER** — útil para Epic 5 |

**Resumo:** 6 para ARQUIVAR, 6 para MANTER.

---

## 3. Lista de Protótipos Corrigidos

### Todos os 16 protótipos canônicos foram corrigidos:

**Correções aplicadas em TODOS:**
- CSS variables canônicas adicionadas (`--primary-fg`, `--radius-button`, `--radius-card`)
- `font-variant-numeric: tabular-nums` removido do body, aplicado seletivamente
- Font-family padronizado com `system-ui`
- Espaçamento corrigido para múltiplos de 4px

**Sidebar desktop substituído em 10 protótipos:**
proto-03, proto-04, proto-05, proto-09, proto-10, proto-11, proto-12, proto-13, proto-14 (+ proto-15 não tem sidebar por ser componente)

**Bottom nav mobile substituído em 10 protótipos:**
proto-03, proto-04, proto-06, proto-09, proto-10, proto-11, proto-12, proto-13, proto-14 (+ proto-15 não tem bottom nav por ser componente)

**Valores monetários corrigidos em 14 protótipos:**
proto-05, proto-06, proto-07, proto-08, proto-09, proto-10, proto-11, proto-12, proto-13, proto-14, proto-15 (+ proto-01/02 não têm valores, proto-03/04 não têm valores)

**Percentuais corrigidos em 5 protótipos:**
proto-05, proto-09, proto-10, proto-11, proto-15

**Correção especial — Keypad:** proto-07 — botão de vírgula removido, estilo "app bancário"
**Correção especial — Paleta:** categories-ux-v2 — Purple/Neutral → Indigo/Stone completo

---

## 4. Protótipos Novos Criados

**Nenhum.** Todas as telas canônicas já cobriam ambos os breakpoints:
- proto-01 a proto-04: Mobile + Desktop no mesmo arquivo
- proto-05 (desktop) + proto-06 (mobile): Par Dashboard
- proto-07: Mobile (5 states) + Desktop
- proto-08: Mobile (5 etapas) + Desktop
- proto-09 a proto-14: Desktop + Mobile no mesmo arquivo
- proto-15: Mobile (4 níveis) + Desktop (componente)
- categories-ux-v2: Suplementar ao proto-14

---

## 5. Mapeamento Protótipo → Tela → Epic/Story

| Protótipo | Tela do App | Epic | Story |
|-----------|-------------|------|-------|
| `proto-01-login.html` | Login | Epic 1 | 1-4 (Registro e Login) |
| `proto-02-signup.html` | Cadastro | Epic 1 | 1-4 (Registro e Login) |
| `proto-03-link-account.html` | Vincular Contas / Usuários | Epic 8 | 8-1 (Convite de Membros) |
| `proto-04-permissions.html` | Permissões de Conta | Epic 8 | 8-2 (Permissões Granulares) |
| `proto-05-dashboard-desktop.html` | Dashboard (Desktop) | Epic 6 | 6-1 (Dashboard Principal) |
| `proto-06-dashboard-mobile.html` | Dashboard (Mobile) | Epic 6 | 6-1 (Dashboard Principal) |
| `proto-07-cascade-input.html` | Registro de Gasto (Cascade) | Epic 3 | 3-1 (Registro de Gastos) |
| `proto-08-onboarding.html` | Onboarding (Setup Inicial) | Epic 2 | 2-6 (Onboarding) |
| `proto-09-budgets.html` | Orçamentos por Categoria | Epic 3 | 3-6 (Acompanhamento de Orçamento) |
| `proto-10-checklist.html` | Checklist Mensal | Epic 4 | 4-3 (Checklist Mensal) |
| `proto-11-projection.html` | Projeção Futura | Epic 7 | 7-3 (Margem Disponível Projetada) |
| `proto-12-credit-card.html` | Cartão de Crédito (Fatura) | Epic 5 | 5-1 a 5-4 (Cartão e Reconciliação) |
| `proto-13-reconciliation.html` | Reconciliação de Fatura | Epic 5 | 5-3 / 5-4 (Reconciliação) |
| `proto-14-settings.html` | Configurações / Categorias | Epic 2 | 2-4 (Categorias e Subcategorias) |
| `proto-15-drill-down.html` | Drill-down Analítico | Epic 6 | 6-2 (Drill-down pela Hierarquia) |
| `categories-ux-v2.html` | Categorias UX (Suplementar) | Epic 2 | 2-4 (Categorias e Subcategorias) |

---

## 6. Artefatos Produzidos

| Artefato | Caminho |
|----------|---------|
| Regras canônicas | `_bmad-output/planning-artifacts/regras-canonicas-prototipos.md` |
| Snippets canônicos (sidebar, bottom nav, CSS vars) | `_bmad-output/planning-artifacts/snippets-canonicos-prototipos.md` |
| Documento de saída (este arquivo) | `_bmad-output/planning-artifacts/reavaliacao-prototipos.md` |
| 16 protótipos HTML corrigidos | `_bmad-output/prototypes/proto-*.html` + `categories-ux-v2.html` |
