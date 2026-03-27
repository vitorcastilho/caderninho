# Story 2.5.3: Unificação do Design System

Status: done

## Story

As a equipe de desenvolvimento do Caderninho,
I want atualizar a página `/design-system` e os tokens CSS para refletir as regras canônicas consolidadas nos protótipos corrigidos (Stories 2.5.2 e 2.5.2b),
so that o design system implementado seja a fonte única de verdade visual — eliminando divergências entre protótipos, tokens e componentes.

## Contexto

As Stories 2.5.2 e 2.5.2b corrigiram todos os 16+ protótipos HTML e documentaram regras canônicas completas em:
- `_bmad-output/planning-artifacts/regras-canonicas-prototipos.md` — 22 tabelas de regras (tipografia, cores, espaçamento, componentes)
- `_bmad-output/planning-artifacts/snippets-canonicos-prototipos.md` — CSS variables block, sidebar, bottom nav, formatação

A página `/design-system` foi criada na Story 1.2 e expandida na Story 2.7 (auditoria visual), mas **antes** das regras canônicas serem formalizadas. Gaps esperados:
1. Seções faltantes (Convenções de Formatação, Responsividade/Breakpoints, Ícones)
2. Valores de tokens que podem divergir das regras canônicas
3. Seções existentes que não cobrem todos os estados/variantes documentados

**Cadeia de dependência:** 2.5.1 (done) → 2.5.2 (done) → 2.5.2b (done) → **2.5.3** → 2.5.4 → 2.5.5 → 2.5.6 → 2.5.7

## Acceptance Criteria

### AC 1: Gap Analysis Completa

**Given** as regras canônicas em `regras-canonicas-prototipos.md` (22 tabelas)
**When** comparadas com a página `/design-system` e `globals.css`
**Then** uma lista documentada de todos os gaps é produzida antes de iniciar correções
**And** a lista separa: (a) tokens faltantes no `globals.css`, (b) seções faltantes no DS page, (c) seções existentes com cobertura incompleta

### AC 2: Tokens CSS Alinhados com Regras Canônicas

**Given** os tokens canônicos definidos em `regras-canonicas-prototipos.md` e `snippets-canonicos-prototipos.md`
**When** comparados com `src/app/globals.css`
**Then** todos os tokens canônicos existem no `globals.css` (nenhum faltante)
**And** os valores hex são idênticos (ex: `--color-positive: #22C55E`, não uma variação)
**And** qualquer token novo é adicionado na seção `@theme` correta (inline para shadcn/ui, estático para Caderninho)

### AC 3: Seção "Convenções de Formatação" Adicionada

**Given** as regras de formatação monetária e percentual são críticas e cross-cutting
**When** a nova seção é adicionada ao DS page
**Then** documenta e demonstra visualmente:
- Valores monetários: `R$ X.XXX,XX` (2 decimais, espaço após R$, negativo `-R$ X.XXX,XX`)
- Percentuais: `XX,XX%` (2 decimais, vírgula decimal)
- `font-variant-numeric: tabular-nums` aplicado seletivamente (não no body)
- Zero: `R$ 0,00` e `0,00%` (nunca `R$ 0` ou `0%`)
- Input monetário: estilo app bancário (digita "1978" → `R$ 19,78`)
- Input percentual: mesmo padrão (digita "2503" → `25,03%`)

### AC 4: Seção "Responsividade / Breakpoints" Adicionada

**Given** as regras de breakpoints e layout responsivo
**When** a nova seção é adicionada ao DS page
**Then** documenta e demonstra visualmente:
- Mobile: `< 768px` — bottom nav + layout vertical + sheets full-screen
- Tablet: `768px – 1023px` — sidebar recolhida 56px + 2 colunas
- Desktop: `≥ 1024px` — sidebar expandida 220px + layout horizontal
- Cada tela canônica TEM versão mobile E desktop separadas
- Touch targets mínimo `44×44px` em mobile

### AC 5: Seção "Ícones" Adicionada

**Given** a biblioteca de ícones é Lucide React (exclusivamente)
**When** a nova seção é adicionada ao DS page
**Then** documenta:
- Biblioteca: Lucide React (exclusivamente)
- Tamanho padrão: `size-4` (16px) inline, `size-5` (20px) nav
- Stroke width: 1.5px (padrão Lucide)
- Cores: semânticas via Tailwind (`text-primary`, `text-muted-foreground`, etc.)
- Catálogo dos ícones usados no app (sidebar + bottom nav + ações comuns)

### AC 6: Seções Existentes Atualizadas

**Given** as seções já existentes no DS page
**When** comparadas com as regras canônicas
**Then** cada seção existente cobre TODOS os estados e variantes documentados nas regras canônicas
**And** exemplos visuais usam valores consistentes com os protótipos corrigidos
**And** especificamente:
- Badges: tamanhos `h-5`, `rounded-4xl` (pill), todas as variantes semânticas (positive, attention, alert, critical, info)
- Barras de progresso: container `h-1.5`, cores por faixa (<70% verde, 70-85% amarelo, 85-100% laranja, >100% vermelho)
- Cards: `ring-1 ring-foreground/10` (não box-shadow pesado), CardAction no canto superior direito
- Empty states: `border border-dashed border-border rounded-xl` + ícone + título + descrição + CTA
- Inputs: label SEMPRE acima (nunca placeholder como label), campos opcionais marcados `"(opcional)"`

### AC 7: Zero Divergências entre DS e Canonical Rules

**Given** a story finalizada
**When** qualquer regra canônica é consultada
**Then** a página `/design-system` demonstra visualmente essa regra com componentes reais
**And** os tokens CSS em `globals.css` refletem os valores canônicos
**And** o DS é a fonte única de verdade (protótipos e regras canônicas são referência, DS é implementação)

## Tasks / Subtasks

### Fase 1: Gap Analysis (AC: #1)

- [x] Task 1: Auditar tokens CSS — `globals.css` vs regras canônicas
  - [x] 1.1: Comparar todos os tokens de cor (neutros, primária, semânticas, estruturais, gráficos) com tabela 6 das regras canônicas
  - [x] 1.2: Comparar tokens de espaçamento (density modes) com tabela 7
  - [x] 1.3: Comparar tokens de border-radius com regras canônicas (botões 8px, cards 12px, badges 100px, inputs 6px)
  - [x] 1.4: Verificar tokens de sidebar (220px expandido, 56px recolhido) e bottom nav (56px, FAB 48px)
  - [x] 1.5: Documentar todos os gaps encontrados em lista organizada

- [x] Task 2: Auditar seções do DS page vs regras canônicas
  - [x] 2.1: Mapear cada tabela das regras canônicas (22 tabelas) para uma seção do DS page
  - [x] 2.2: Identificar tabelas sem seção correspondente (gaps de cobertura)
  - [x] 2.3: Identificar seções com cobertura incompleta (estados/variantes faltantes)
  - [x] 2.4: Documentar lista de gaps organizada por prioridade

### Fase 2: Tokens CSS (AC: #2)

- [x] Task 3: Corrigir/adicionar tokens faltantes no `globals.css`
  - [x] 3.1: Adicionar tokens faltantes identificados na Task 1
  - [x] 3.2: Corrigir valores divergentes (se houver)
  - [x] 3.3: Manter organização por seção (inline para shadcn, estático para Caderninho)

### Fase 3: Novas Seções no DS Page (AC: #3, #4, #5)

- [x] Task 4: Criar seção "Convenções de Formatação" (AC: #3)
  - [x] 4.1: Seção com exemplos visuais de valores monetários (R$ com 2 decimais, negativo, zero)
  - [x] 4.2: Exemplos visuais de percentuais (%, 2 decimais, zero)
  - [x] 4.3: Demonstração de `tabular-nums` — coluna alinhada vs sem `tabular-nums`
  - [x] 4.4: Demonstração de input monetário estilo bancário (digitar números → formatação automática)
  - [x] 4.5: Demonstração de input percentual estilo bancário
  - [x] 4.6: Posicionar na seção "Fundamentos" (após Tipografia, antes de Cursores)

- [x] Task 5: Criar seção "Responsividade / Breakpoints" (AC: #4)
  - [x] 5.1: Documentação visual dos 3 breakpoints (mobile < 768px, tablet 768-1023px, desktop ≥ 1024px)
  - [x] 5.2: Diagrama ou cards mostrando layout de cada breakpoint (bottom nav vs sidebar, colunas)
  - [x] 5.3: Touch targets mínimos (44×44px mobile)
  - [x] 5.4: Posicionar na seção "Fundamentos" (após Espaçamento)

- [x] Task 6: Criar seção "Ícones" (AC: #5)
  - [x] 6.1: Documentação: Lucide React, tamanhos padrão, stroke width, cores semânticas
  - [x] 6.2: Catálogo visual dos ícones em uso no app (renderizar os ícones Lucide reais)
  - [x] 6.3: Posicionar na seção "Fundamentos" (após Responsividade)

### Fase 4: Atualização de Seções Existentes (AC: #6)

- [x] Task 7: Atualizar seção de Badges
  - [x] 7.1: Garantir que todos os variants semânticos (positive, attention, alert, critical, info) são demonstrados
  - [x] 7.2: Garantir tamanho `h-5`, `rounded-4xl` (pill), `text-xs font-medium`, `px-2`
  - [x] 7.3: Se o componente `badge.tsx` não tiver variantes semânticas, documentar como compor com classes

- [x] Task 8: Atualizar seção de Barras de Progresso
  - [x] 8.1: Garantir container `h-1.5 w-full rounded-full bg-muted`
  - [x] 8.2: Demonstrar as 4 faixas de cor: <70% positive, 70-85% attention, 85-100% alert, >100% critical
  - [x] 8.3: Label com `text-sm font-semibold tabular-nums` + cor semântica

- [x] Task 9: Verificar e atualizar demais seções contra regras canônicas
  - [x] 9.1: Cards — verificar `ring-1 ring-foreground/10`, CardAction, subcomponentes
  - [x] 9.2: Empty states — verificar `rounded-xl`, ícone Lucide, padrão completo
  - [x] 9.3: Inputs — verificar label acima, `"(opcional)"`, estado válido com borda verde
  - [x] 9.4: Dialogs/Sheets — verificar overlay `bg-black/25 backdrop-blur-sm`, click fora, Escape
  - [x] 9.5: Tabelas — verificar `text-right tabular-nums` para numéricos, cores semânticas para gasto/renda
  - [x] 9.6: Skeleton — verificar que replica layout real, `bg-muted`, transição `fade-in 200ms`

### Fase 5: Validação Final (AC: #7)

- [x] Task 10: Validação cruzada DS ↔ Regras Canônicas
  - [x] 10.1: Percorrer cada tabela do `regras-canonicas-prototipos.md` e verificar cobertura no DS
  - [x] 10.2: Confirmar que nenhuma regra canônica ficou sem representação visual no DS
  - [x] 10.3: Rodar `npm run build` e `npm run test` para confirmar zero regressões

### Review Follow-ups R1 (AI)

- [x] [AI-Review][HIGH] FormatacaoMoneyInput sem separador de milhar — demos de input monetário usam `(cents / 100).toFixed(2).replace(".", ",")` que não insere pontos de milhar. Para valores ≥ R$ 1.000,00 exibe "R$ 1000,00" ao invés de "R$ 1.000,00". Usar helper existente `centsToDisplayValue` de `src/client/utils/currency-input.ts` que já formata com `toLocaleString('pt-BR')`. Afeta: `FormatacaoMoneyInput` (page.tsx:275), `handleMoneyInput` em FormulariosSection (page.tsx:639), e `FormatacaoPercentInput` (page.tsx:300) [page.tsx:275,639,300]
- [x] [AI-Review][MEDIUM] Labels das Barras de Progresso sem `tabular-nums` — regra canônica (tabela 15) exige "text-sm font-semibold tabular-nums + cor semântica". A nota de spec no rodapé da seção documenta corretamente, mas os 4 labels reais não aplicam a classe. Adicionar `tabular-nums` nos spans de percentual [page.tsx:1264,1273,1282,1291]
- [x] [AI-Review][MEDIUM] Token `--radius-input: 8px` contradiz regras canônicas (6px) e é dead code — regras canônicas tabela 10 dizem `rounded-md (6px)`, Input component usa `rounded-md` e não referencia o token. Opções: (a) remover o token, ou (b) corrigir para 6px, ou (c) se 8px foi decisão consciente, atualizar regras canônicas e fazer o Input component usar o token

## Dev Notes

### Natureza da Story: Código de Produção (não protótipos)

Diferente das Stories 2.5.2 e 2.5.2b (que eram UX/Design), esta story **modifica código de produção**:
- `src/app/globals.css` — tokens CSS
- `src/app/design-system/page.tsx` — DS page (novas seções + atualizações)
- Possivelmente componentes em `src/client/components/ui/` se gaps forem encontrados

### Arquivos a Consultar ANTES de Codar

| Arquivo | Propósito |
|---------|-----------|
| `_bmad-output/planning-artifacts/regras-canonicas-prototipos.md` | 22 tabelas de regras — referência mestre para gap analysis |
| `_bmad-output/planning-artifacts/snippets-canonicos-prototipos.md` | CSS variables, sidebar HTML/CSS, bottom nav HTML/CSS |
| `src/app/globals.css` | Tokens CSS atuais |
| `src/app/design-system/page.tsx` | DS page atual (~45 seções) |
| `_bmad-output/implementation-artifacts/tech-spec-design-system-page.md` | Tech spec original + action items resolvidos |
| `_bmad-output/implementation-artifacts/2-7-auditoria-visual-design-system.md` | Auditoria visual anterior (padrões estabelecidos) |

### Componentes UI Existentes (NÃO reinventar)

Componentes em `src/client/components/ui/`:
- `button.tsx` — CVA, 6 variants × 8 sizes
- `input.tsx`, `select.tsx`, `label.tsx` — Formulários
- `card.tsx` — Card + CardHeader/Title/Description/Content/Footer/Action
- `badge.tsx` — 4 variants (default, secondary, outline, destructive)
- `dialog.tsx`, `sheet.tsx` — Modais e drawers
- `table.tsx` — Tabelas
- `tabs.tsx` — Abas
- `skeleton.tsx` — Loading
- `sonner.tsx` — Toast/notificações
- `breadcrumb.tsx` — Breadcrumbs
- `emoji-picker.tsx` — Picker de emojis
- `bank-logo.tsx` — Logos de banco
- `credit-card-brand-badge.tsx` — Bandeiras de cartão

### Seções Atuais do DS Page (referência para posicionamento)

```
Fundamentos:
  CoresSection, TipografiaSection, CursoresSection, EspacamentoSection

Componentes base:
  BotoesSection, FormulariosSection, BadgesSection, CardsSection,
  TabelasSection, TabsSection, DialogsSection, DropdownMenuSection,
  ToastSection, SkeletonSection

Controles:
  ToggleSwitchSection, ChipsSection, DividerTextoSection,
  BreadcrumbsSection, StepIndicatorSection

Composições:
  BannersSection, SummaryCardsSection, BarrasProgressoSection,
  ProgressRingSection, CardsOrcamentoSection, BarraResumoSection,
  SeletorMesSection, ControleSegmentadoSection, ListaTransacoesSection,
  ChecklistSection, ParcelasAtivasSection, CardCartaoCreditoSection,
  CardCartaoHeroSection, ListaColapsavelSection, EmptyStatesSection

Visualizações:
  GraficoBarrasSection, GradeTimelineSection, TreemapSection,
  MapaGastosSection, TooltipDetalheSection, LegendaSection,
  ColunaMensalSection, PainelSimulacaoSection

Layout & Navegação:
  MenuLateralSection, BottomNavigationSection, BottomSheetSection
```

Novas seções devem ser inseridas nos grupos lógicos:
- "Convenções de Formatação" → Fundamentos (após TipografiaSection)
- "Responsividade / Breakpoints" → Fundamentos (após EspacamentoSection)
- "Ícones" → Fundamentos (após Responsividade)

### Padrões de Código no DS Page

O DS page é `"use client"` por causa dos ~15 `useState` para interatividade. Cada seção é um componente funcional separado declarado no mesmo arquivo. Helper components `Section` e `Swatch` são usados para padronizar.

```tsx
// Padrão para nova seção:
function NovaSectionSection() {
  return (
    <Section id="nova-section" title="Nova Section">
      {/* conteúdo */}
    </Section>
  )
}
```

### O Que NÃO Fazer Nesta Story

- **NÃO alterar telas do app** (Contas, Cartões, Categorias, etc.) — isso é Story 2.5.4
- **NÃO extrair componentes compostos** (CurrencyInput, EmptyState, etc.) — isso é Story 2.5.5
- **NÃO criar componentes novos para Epic 3** (CascadeInput, etc.) — isso é Story 2.5.6
- **NÃO modificar protótipos HTML** — eles são referência, não output desta story
- **NÃO instalar dependências novas** — usar apenas o que já existe no projeto

### Convenção de Commits

- Prefixo `feat:` ou `chore:` — mensagem em português BR
- Branch: `epic-2-5/2-5-3-unificacao-do-design-system`
- PR com descrição do que foi entregue

### Project Structure Notes

Arquivos que esta story potencialmente modifica:
- `src/app/globals.css` — adição/correção de tokens
- `src/app/design-system/page.tsx` — novas seções + atualizações de existentes
- `src/client/components/ui/badge.tsx` — possível adição de variantes semânticas (se gap confirmado na Task 1)

Nenhum conflito com a estrutura do projeto. Todos os arquivos são de UI/apresentação.

### Lições das Stories Anteriores

**Da Story 2.7 (Auditoria Visual):**
- A auditoria visual seguiu o padrão: fase de investigação (Tasks 1-8) → fase de correções (Tasks 9-13)
- Mesma abordagem recomendada aqui: primeiro gap analysis (Fase 1), depois correções (Fases 2-4)
- `tabular-nums` deve ser aplicado seletivamente, não no body inteiro

**Da Story 1.2 (Design System):**
- DS page é client component ("use client") por causa dos hooks de interatividade
- Passou por 7 rounds de code review (aprendemos a convergir em 2 rounds depois)
- Swatches mostram variável CSS + valor hex + preview colorido (padrão já implementado)

**Da Tech-Spec do DS (inconsistências resolvidas):**
- Primary color: `#4F46E5` (canônico) — já corrigido
- Input border-radius: padronizado em 8px — já corrigido
- Sidebar: 220px — já corrigido (A-H8)
- Botão `<button>` nativo → `<Button>` — já corrigido (A-H9)
- Cores hardcoded → tokens semânticos — já corrigido (A-M2)

### Git Intelligence (Últimos Commits Relevantes)

```
9dddedd feat: atualização dos protótipos para modelo de categorização v2 (Story 2.5.2b)
9308f83 chore: finalizar code review R2 da Story 2.5.2
7dce442 feat: reavaliação completa dos 16 protótipos HTML (Story 2.5.2)
96d0c9f feat: decisões de produto e ajustes de modelo (Story 2.5.1)
2751cb2 feat: onboarding — setup inicial guiado com melhorias de UX (Story 2.6)
```

### Regras Canônicas — Tabelas de Referência Rápida

Para facilitar a gap analysis, as 22 tabelas das regras canônicas cobrem:

1. Valores Monetários
2. Percentuais
3. Sidebar Desktop (220px)
4. Bottom Navigation Mobile (56px)
5. Fonte/Tipografia (Inter, escala completa)
6. Paleta de Cores (Stone & Indigo + semânticas)
7. Espaçamento Base (4px, density modes)
8. Breakpoints (mobile/tablet/desktop)
9. Botões (variantes, tamanhos, estados)
10. Inputs (altura, radius, estados, label pattern)
11. Cards (radius, border, padding, subcomponentes)
12. Empty States (border dashed, ícone + título + CTA)
13. Skeleton Screens (pulse, shapes, transição)
14. Badges e Status (pill, semânticas)
15. Barras de Progresso (faixas de cor)
16. Dialogs e Sheets (overlay, radius, click fora)
17. Dropdown Menu (largura, items, destructive)
18. Tabelas (header, rows, numéricos)
19. Toast/Notificações (Sonner, posição, variantes)
20. Ícones (Lucide, tamanhos, stroke)
21. Acessibilidade (contraste, touch targets, focus ring)
22. Checklist de Validação (checklist final para protótipos)

### References

- [Source: _bmad-output/planning-artifacts/regras-canonicas-prototipos.md] — 22 tabelas de regras canônicas (referência mestre)
- [Source: _bmad-output/planning-artifacts/snippets-canonicos-prototipos.md] — CSS variables, sidebar, bottom nav (referência de implementação)
- [Source: _bmad-output/implementation-artifacts/tech-spec-design-system-page.md] — Tech spec do DS page (decisões, inventário de componentes)
- [Source: _bmad-output/implementation-artifacts/2-7-auditoria-visual-design-system.md] — Auditoria visual anterior (padrões já corrigidos)
- [Source: _bmad-output/implementation-artifacts/2-5-2b-atualizacao-prototipos-modelo-v2.md] — Story predecessor (gaps fechados nos protótipos)
- [Source: _bmad-output/implementation-artifacts/epic-2-retro-2026-03-24.md#story-253] — Definição na retrospectiva do Epic 2
- [Source: src/app/globals.css] — Tokens CSS atuais
- [Source: src/app/design-system/page.tsx] — DS page atual (~45 seções)
- [Source: _bmad-output/project-context.md] — Regras do projeto (Tailwind v4 via CSS, shadcn/ui v4, Clean Architecture)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

Nenhum problema de debug encontrado. Build e testes passaram na primeira tentativa.

### Completion Notes List

- **Gap Analysis (Tasks 1-2):** Tokens CSS 99% alinhados — apenas `--radius-input: 8px` faltava. 3 seções faltantes (Formatação, Responsividade, Ícones). 6 seções existentes com cobertura incompleta (Badges, Barras de Progresso, Empty States, Formulários, Tipografia, Skeleton).
- **Token Fix (Task 3):** Adicionado `--radius-input: 8px` no bloco `@theme` do `globals.css`.
- **Novas Seções (Tasks 4-6):** Criadas 3 novas seções completas no DS page — FormatacaoSection (tabelas de formato R$/%, demo tabular-nums, inputs bancários), ResponsividadeSection (3 breakpoints com cards visuais + tabela mobile vs desktop), IconesSection (specs + tamanhos visuais + catálogo de 21 ícones do app).
- **Atualizações (Tasks 7-9):** BadgesSection expandida com tabela de specs (h-5, rounded-4xl, text-xs, px-2). BarrasProgressoSection corrigida (faixas <70%/70-85%/85-100%/>100% + specs de container/label). EmptyStatesSection ganhou ícone Lucide + título separado + descrição + spec inline. FormulariosSection ganhou campo "(opcional)". TipografiaSection ganhou Display (28px bold), Caption (11px), Mono. SkeletonSection ganhou Loader2 spinner + spec inline com regras de animate-pulse/fade-in/optimistic UI.
- **Validação (Task 10):** 22/22 tabelas canônicas cobertas no DS. Build OK. 97 test files, 663 testes passando, zero regressões.
- ✅ Resolved review finding [HIGH]: FormatacaoMoneyInput sem separador de milhar — substituído formatação manual por `centsToDisplayValue` em FormatacaoMoneyInput, FormatacaoPercentInput e handleMoneyInput (FormulariosSection). Agora valores ≥ R$ 1.000,00 exibem corretamente com pontos de milhar.
- ✅ Resolved review finding [MEDIUM]: Labels das Barras de Progresso sem `tabular-nums` — adicionada classe `tabular-nums` nos 5 spans de percentual (4 semânticos + 1 fixo).
- ✅ Resolved review finding [MEDIUM]: Token `--radius-input: 8px` dead code — removido do `globals.css`. Input component usa `rounded-md` (Tailwind) diretamente, token nunca era referenciado.

### File List

- `src/app/globals.css` — removido token dead code `--radius-input: 8px`
- `src/app/design-system/page.tsx` — 3 novas seções (Formatação, Responsividade, Ícones) + 6 seções atualizadas + fix de formatação monetária com `centsToDisplayValue` + `tabular-nums` nos labels de barras de progresso + import de `centsToDisplayValue`
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — status atualizado para in-progress → review
- `_bmad-output/implementation-artifacts/2-5-3-unificacao-do-design-system.md` — tasks marcadas, review follow-ups resolvidos, status, dev agent record

### Change Log

- **2026-03-27:** Implementação completa da Story 2.5.3 — Gap analysis + correção de token CSS + 3 novas seções no DS (Formatação, Responsividade, Ícones) + 6 seções existentes atualizadas para alinhar com regras canônicas. Zero divergências entre DS e canonical rules. Build e testes OK.
- **2026-03-27:** Code Review R1 — 1 HIGH, 2 MEDIUM, 3 LOW encontrados. Action items criados para H1 (input monetário sem separador de milhar), M1 (tabular-nums faltando nas barras de progresso), M2 (token --radius-input contradiz canonical rules e é dead code). LOWs aceitos como backlog. Status → ready-for-dev.
- **2026-03-27:** Fixes do Code Review R1 — 3 action items resolvidos: (H1) formatação monetária usando `centsToDisplayValue` com separador de milhar, (M1) `tabular-nums` adicionado nos labels de barras de progresso, (M2) token `--radius-input` dead code removido. Build OK, 663 testes passando.
- **2026-03-27:** Code Review R2 — Validação dos 3 fixes do R1. Todos aprovados: (H1) `centsToDisplayValue` usado nos 3 locais com `toLocaleString('pt-BR')`, (M1) `tabular-nums` presente nos 5 spans de percentual, (M2) token `--radius-input` removido do `globals.css`. Nenhum finding novo. Story → done.
