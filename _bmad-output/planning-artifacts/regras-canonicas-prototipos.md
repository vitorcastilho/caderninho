# Regras Canônicas para Protótipos HTML — Caderninho

**Data:** 2026-03-24
**Fonte:** Design System implementado (`/design-system`), UX Design Specification, Arquitetura, Sidebar/BottomNav implementados
**Propósito:** Toda correção ou criação de protótipo HTML DEVE seguir estas regras. Nenhum protótipo é considerado correto se violar qualquer item abaixo.

---

## Tabela de Regras Canônicas

### 1. Valores Monetários

| Aspecto | Regra Canônica | Exemplo |
|---------|---------------|---------|
| Formato de exibição | Sempre com **2 decimais**, separador de milhar com ponto, decimal com vírgula | `R$ 3.000,00` |
| Prefixo | `R$` com espaço antes do valor | `R$ 149,99` |
| Valores negativos | Sinal antes do `R$` | `-R$ 500,00` |
| Fonte | Inter com `font-variant-numeric: tabular-nums` | Números alinhados em colunas |
| Input | Estilo app bancário — usuário digita só números, vírgula posiciona automaticamente | Digitar "1978" → `R$ 19,78` |
| Armazenamento | Integer cents (divisão por 100 apenas na apresentação) | `14999` → `R$ 149,99` |
| Zero | Exibir `R$ 0,00` (nunca `R$ 0` ou `R$ -`) | `R$ 0,00` |

### 2. Percentuais

| Aspecto | Regra Canônica | Exemplo |
|---------|---------------|---------|
| Formato de exibição | Sempre com **2 decimais**, símbolo `%` como sufixo | `25,03%` |
| Separador decimal | Vírgula | `99,50%` |
| Input | Mesmo padrão bancário — digita números, vírgula automática | Digitar "2503" → `25,03%` |
| Zero | Exibir `0,00%` | `0,00%` |
| Fonte | Inter com `tabular-nums` quando em colunas/comparações | Alinhamento visual |

### 3. Sidebar Desktop

| Aspecto | Regra Canônica | Implementação |
|---------|---------------|---------------|
| Presença | **Mesmo sidebar** em TODOS os protótipos desktop | Nenhuma variação permitida |
| Largura expandida | `220px` | `w-[220px]` |
| Largura recolhida | `56px` | `w-[56px]` |
| Background | `bg-sidebar` (#FAFAF9) | Stone-50 |
| Border | `border-r border-sidebar-border` (#E7E5E4) | Stone-200 |
| Transição | `200ms ease-in-out` | Animação suave |
| **Seções** | | |
| Logo | Ícone ✎ + "Caderninho" em `text-base font-bold text-primary` | Indigo-600 |
| Navegação | Dashboard (LayoutDashboard), Orçamentos (PiggyBank), Checklist (CheckSquare), Projeção (TrendingUp) | 4 itens |
| Configurações | Contas (Building2), Cartões (CreditCard), Investimentos (Landmark), Receitas (Wallet), Categorias (Tags) | 5 itens |
| Separadores | `mx-4 my-1 h-px bg-border` entre seções | Stone-200 |
| Labels de seção | `text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary` | Stone-400 |
| Item ativo | `bg-primary-light text-primary font-semibold` | Indigo bg + text |
| Item inativo | `text-text-secondary` com hover `bg-background text-foreground` | Stone-500 |
| Ícones | `size-[18px]` | 18px uniformes |
| Texto item | `text-[13px] font-medium` com `gap-[10px]` | 13px |
| Padding item | `px-3 py-2` | 12px × 8px |
| Border-radius item | `rounded-button` (8px) | Consistente |
| Usuário (footer) | Avatar `size-8` círculo bg-primary + nome `text-[13px] font-semibold` + role `text-[11px] text-text-tertiary` | "Administrador" |
| Logout | Ícone LogOut `size-[18px]` + texto `text-[13px]` quando expandido | Ghost button |
| Toggle | ChevronLeft/Right `size-[18px]` (visível apenas em lg+) | Recolher/expandir |

### 4. Bottom Navigation Mobile

| Aspecto | Regra Canônica | Implementação |
|---------|---------------|---------------|
| Presença | **Mesma bottom nav** em TODOS os protótipos mobile | Nenhuma variação permitida |
| Altura | `56px` (`h-14`) | Fixa |
| Posição | `fixed bottom-0 left-0 right-0 z-50` | Fixa no fundo |
| Background | `bg-card` (#FFFFFF) com `border-t border-border` | Card + borda topo |
| **Itens (5)** | | |
| 1. Dashboard | Ícone LayoutDashboard + "Dashboard" | Link normal |
| 2. Cartões | Ícone CreditCard + "Cartões" | Link normal |
| 3. Registrar | **FAB** — Ícone Plus, `size-12` (48px), `rounded-full`, `bg-primary`, `-mt-4` elevado, `shadow-lg` | Botão flutuante central |
| 4. Checklist | Ícone CheckSquare + "Checklist" | Link normal |
| 5. Projeção | Ícone TrendingUp + "Projeção" | Link normal |
| Ícones | `size-5` (20px) | Uniformes |
| Texto | `text-[10px] font-medium` | 10px |
| Item ativo | `text-primary` (Indigo) | Cor primária |
| Item inativo | `text-muted-foreground` (Stone-500) | Neutro |
| Touch target | `min-w-[75px] min-h-[44px]` | Acessibilidade |
| FAB feedback | `active:scale-95` | Feedback tátil |
| Distribuição | `justify-around` | Espaçamento uniforme |

### 5. Fonte / Tipografia

| Aspecto | Regra Canônica | Exemplo |
|---------|---------------|---------|
| Font family | **Inter** (sempre, sem exceção) | `font-family: 'Inter', sans-serif` |
| Valores financeiros | `font-variant-numeric: tabular-nums` obrigatório | Colunas alinhadas |
| **Escala** | | |
| H1 (título página) | `24px / font-weight 700 (bold)` | "Dashboard" |
| H2 (subtítulo) | `20px / font-weight 600 (semibold)` | "Orçamentos" |
| H3 (seção) | `18px / font-weight 600 (semibold)` | "Alimentação" |
| H4 (label grande) | `16px / font-weight 500 (medium)` | "Total gasto" |
| Body (texto padrão) | `14px / font-weight 400 (regular)` | Texto corrido |
| Small (metadado) | `12px / font-weight 400 / color muted-foreground` | "Última atualização" |
| Label (form) | `14px / font-weight 500 (medium)` | "Nome da conta" |
| Display (valor grande) | `28-32px / font-weight 700 (bold)` | "R$ 12.500,00" |
| Caption | `11-12px / font-weight 400-500` | "Resta R$ 878,00" |
| Mono | `ui-monospace, SFMono-Regular, Menlo, Consolas` | Dados técnicos |

### 6. Paleta de Cores

| Token | Valor Hex | Uso |
|-------|-----------|-----|
| **Neutros (Stone)** | | |
| `background` | `#FAFAF9` | Background geral (stone-50) |
| `muted` / `secondary` | `#F5F5F4` | Background secundário (stone-100) |
| `border` / `input` | `#E7E5E4` | Bordas, inputs (stone-200) |
| `text-tertiary` | `#A8A29E` | Texto auxiliar, placeholders (stone-400) |
| `text-secondary` / `muted-foreground` | `#78716C` | Labels, descrições (stone-500) |
| `foreground` | `#1C1917` | Texto principal (stone-900) |
| **Primária (Indigo)** | | |
| `primary-light` | `#EEF2FF` | Background badges, item ativo (indigo-50) |
| `primary` | `#4F46E5` | Ações, links, FAB, progresso (indigo-600) |
| `primary-hover` | `#4338CA` | Hover em primary (indigo-700) |
| `primary-foreground` | `#FFFFFF` | Texto sobre primary |
| **Semânticas** | | |
| `positive` | `#22C55E` / bg `#DCFCE7` / text `#166534` | Dentro do planejado, confirmação |
| `attention` | `#EAB308` / bg `#FEF9C3` / text `#854D0E` | Atenção, limite próximo |
| `alert` | `#F97316` / bg `#FFF7ED` / text `#9A3412` | Aviso, regra de ouro |
| `critical` / `destructive` | `#DC2626` / bg `#FEE2E2` / text `#991B1B` | Estourou, erro, atrasado |
| `info` | `#3B82F6` / bg `#DBEAFE` / text `#1E40AF` | Informativo |
| **Estruturais** | | |
| `card` / `surface` | `#FFFFFF` | Cards, modais |
| `ring` | `#4F46E5` | Focus ring (indigo) |
| **Gráficos (Indigo scale)** | | |
| `chart-1` | `#4F46E5` | Série principal |
| `chart-2` | `#6366F1` | Série 2 |
| `chart-3` | `#818CF8` | Série 3 |
| `chart-4` | `#A5B4FC` | Série 4 |
| `chart-5` | `#C7D2FE` | Série 5 |

### 7. Espaçamento Base

| Aspecto | Regra Canônica | Valores |
|---------|---------------|---------|
| Unidade base | **4px** — toda medida é múltiplo de 4 | `4, 8, 12, 16, 20, 24, 32` px |
| **Densidade Spacious** (padrão) | | |
| Card padding | `20px` | `p-5` |
| Gap entre elementos | `16px` | `gap-4` |
| Line padding | `10px` | `py-2.5` |
| Barra de progresso | `8px` altura | `h-2` |
| **Densidade Compact** | | |
| Card padding | `12px` | `p-3` |
| Gap entre elementos | `8px` | `gap-2` |
| Line padding | `4px` | `py-1` |
| Barra de progresso | `4px` altura | `h-1` |
| **Layout** | | |
| Grid desktop | 3 colunas, `gap: 12px` | `grid-cols-3 gap-3` |
| Grid mobile | 1 coluna, stack vertical | `grid-cols-1` |
| Entre seções | `24px` | `space-y-6` |
| Card content | `16px` | `space-y-4` |
| Form fields | `8px` label↔input | `gap-2` |

### 8. Breakpoints

| Aspecto | Regra Canônica | Detalhes |
|---------|---------------|---------|
| Mobile | `< 768px` (sm) | Bottom nav + layout vertical + sheets full-screen |
| Tablet | `768px – 1023px` (md) | Sidebar recolhida 60px + 2 colunas |
| Desktop | `≥ 1024px` (lg) | Sidebar expandida 220px + layout horizontal |
| **Obrigatoriedade** | Cada tela canônica tem versão **mobile E desktop** separadas | 2 protótipos por tela |
| Mobile layout | Stack vertical, cards full-width, bottom nav | Touch-first |
| Desktop layout | Sidebar + grid multi-coluna | Gestão/análise |

### 9. Botões

| Aspecto | Regra Canônica | Visual |
|---------|---------------|--------|
| Estilo | **shadcn/ui** — nunca HTML nativo | Estilizados com variantes |
| **Variantes** | | |
| Default (primary) | `bg-primary text-white` | Indigo sólido |
| Secondary | `bg-secondary text-foreground` | Stone-100 fundo |
| Outline | `border-border bg-background` hover `bg-muted` | Borda + transparente |
| Ghost | Sem fundo, hover `bg-muted` | Apenas texto |
| Destructive | `bg-destructive/10 text-destructive` | Vermelho sutil |
| Link | Texto com underline hover | Texto puro |
| **Tamanhos** | | |
| xs | `h-6 px-2 text-xs` | 24px altura |
| sm | `h-7 px-2.5 text-[0.8rem]` | 28px altura |
| default | `h-8 px-2.5 text-sm` | 32px altura |
| lg | `h-9 px-2.5 text-sm` | 36px altura |
| icon | `size-8` (32px) | Quadrado |
| **Estados** | | |
| Disabled | `opacity-50 pointer-events-none` | Esmaecido |
| Focus | `border-ring ring-3 ring-ring/50` | Anel indigo |
| Active | `translate-y-px` | Micro-press |
| Border-radius | `8px` (radius-button) | Consistente |
| **Regra** | Máximo 1 botão primary por contexto visível | Hierarquia clara |

### 10. Inputs

| Aspecto | Regra Canônica | Visual |
|---------|---------------|--------|
| Estilo | **shadcn/ui** — nunca HTML nativo | Estilizados |
| Altura | `h-8` (32px) | Compacto |
| Border-radius | `rounded-md` (6px) | Consistente |
| Border | `border-input` (#E7E5E4) | Stone-200 |
| Padding | `px-2.5 py-1` | 10px × 4px |
| Texto | `text-base` mobile, `text-sm` desktop | 16px / 14px |
| Placeholder | `text-muted-foreground` | Stone-500 |
| **Label** | **Sempre ACIMA do campo** (nunca placeholder como label) | Pattern obrigatório |
| Campos opcionais | `"(opcional)"` no label | Marcação explícita |
| Focus | `border-ring ring-3 ring-ring/50` | Anel indigo |
| Inválido | `border-destructive ring-3 ring-destructive/20` | Anel vermelho |
| Disabled | `bg-input/50 opacity-50 cursor-not-allowed` | Esmaecido |
| Monetário | `inputMode="numeric"`, prefixo "R$" no valor | App bancário |
| Percentual | `inputMode="numeric"`, sufixo "%" no valor | App bancário |

### 11. Cards

| Aspecto | Regra Canônica | Visual |
|---------|---------------|--------|
| Border-radius | `rounded-xl` (12px para card principal) | Consistente |
| Background | `bg-card` (#FFFFFF) | Branco |
| Border | `ring-1 ring-foreground/10` (sutil, não shadow pesado) | Quase invisível |
| Padding (default) | `py-4`, content `px-4` | 16px |
| Padding (sm) | `py-3`, content `px-3` | 12px |
| Gap interno | `gap-4` (default), `gap-3` (sm) | 16px / 12px |
| **Subcomponentes** | | |
| CardHeader | `px-4 gap-1 rounded-t-xl` | Topo do card |
| CardTitle | `text-base font-medium` (default), `text-sm` (sm) | 16px / 14px |
| CardDescription | `text-sm text-muted-foreground` | 14px stone-500 |
| CardContent | `px-4` (default), `px-3` (sm) | Corpo |
| CardFooter | `border-t bg-muted/50 p-4 rounded-b-xl` | Rodapé com borda |
| CardAction | Posicionado no canto superior direito | Ações rápidas |

### 12. Estados Vazios (Empty States)

| Aspecto | Regra Canônica | Visual |
|---------|---------------|--------|
| Container | `border border-dashed border-border rounded-xl` | Borda tracejada |
| Padding | `px-6 py-8` | 24px × 32px |
| Alinhamento | `text-center flex flex-col items-center gap-3` | Centralizado |
| Mensagem | `text-sm text-muted-foreground` | 14px stone-500 |
| CTA | Button `variant="secondary" size="sm"` | Botão secundário |
| Dica | `text-xs text-muted-foreground` | 12px auxiliar |
| Ícone | Lucide, monocromático, tamanho `size-8` a `size-12` | Contextual |
| **Padrão** | Ícone + título + descrição + CTA (quando há ação) | Sempre com ação sugerida |

### 13. Skeleton Screens (Loading States)

| Aspecto | Regra Canônica | Visual |
|---------|---------------|--------|
| Obrigatoriedade | **Toda tela** tem loading state — nunca tela em branco | Sempre skeleton |
| Animação | Pulse animation (padrão Tailwind) | `animate-pulse` |
| Shapes | `rounded-full` para avatares, `rounded-md` para retângulos | Contextual |
| Background | `bg-muted` (#F5F5F4) | Stone-100 |
| Larguras | Variadas para simular conteúdo: `w-32`, `w-48`, `w-full`, `w-1/2` | Natural |
| Alturas | `h-3` texto, `h-4` labels, `h-8` inputs, `h-2.5` barras | Proporcional |
| Estrutura | Replica o layout real com placeholders | Fiel à tela final |
| Transição | Skeleton → conteúdo com `fade-in 200ms ease` | Suave |
| Spinner | `Loader2` com `animate-spin` para ações pontuais | Salvando, calculando |
| Regra | Transições < 300ms NÃO mostram loading (optimistic UI) | UX fluida |

---

## Regras Adicionais de Consistência

### Badges e Status

| Aspecto | Regra | Visual |
|---------|-------|--------|
| Border-radius | `rounded-4xl` (pill/100%) | Arredondado total |
| Altura | `h-5` (20px) | Compacto |
| Texto | `text-xs font-medium` | 12px |
| Padding | `px-2` | 8px horizontal |
| Ativa | `bg-positive-bg text-positive-text` | Verde |
| Pendente | `bg-attention-bg text-attention-text` | Amarelo |
| Atrasada | `bg-alert-bg text-alert-text` | Laranja |
| Cancelada/Crítica | `bg-critical-bg text-critical-text` | Vermelho |
| Informativo | `bg-info-bg text-info-text` | Azul |

### Barras de Progresso (Orçamento)

| Aspecto | Regra | Visual |
|---------|-------|--------|
| Container | `h-1.5 w-full rounded-full bg-muted` | 6px, Stone-100 |
| Fill | `h-full rounded-full transition-all` | Animado |
| < 70% | `bg-positive` (#22C55E) | Verde |
| 70-85% | `bg-attention` (#EAB308) | Amarelo |
| 85-100% | `bg-alert` (#F97316) | Laranja |
| > 100% | `bg-critical` (#DC2626) | Vermelho |
| Label | `text-sm font-semibold tabular-nums` + cor semântica | Valor numérico |

### Dialogs e Sheets

| Aspecto | Regra | Visual |
|---------|-------|--------|
| Overlay | `bg-black/25 backdrop-blur-sm` | 25% opacidade + blur |
| Border-radius | `rounded-xl` (12px) | Consistente com cards |
| Botão fechar | Sempre presente (X) | Canto superior direito |
| Click fora | Fecha o dialog/sheet | Padrão |
| Escape | Fecha o dialog/sheet | Padrão |
| Desktop | Dialog centralizado ou Sheet lateral (400px) | Contextual |
| Mobile | Dialog centralizado ou Sheet bottom full-screen | Touch-friendly |

### Dropdown Menu

| Aspecto | Regra | Visual |
|---------|-------|--------|
| Largura | `w-48` (192px) mínimo | Padrão |
| Border-radius | `rounded-xl` (12px) | Cards pattern |
| Background | `bg-popover` (#FFFFFF) | Branco |
| Shadow | `shadow-md` | Elevação média |
| Item padding | `px-2.5 py-2 text-sm rounded-md` | 10px × 8px |
| Item hover | `hover:bg-muted` | Stone-100 |
| Destructive | `text-critical hover:bg-critical-bg` | Vermelho |
| Ícone | `size-4 text-muted-foreground` com `gap-2` | 16px |

### Tabelas

| Aspecto | Regra | Visual |
|---------|-------|--------|
| Header | `text-sm font-semibold text-foreground` | Bold |
| Body row | `border-b hover:bg-muted/50` | Hover sutil |
| Cell | `px-4 py-3 text-sm` | 16px × 12px |
| Numérico | `text-right tabular-nums` | Alinhado direita |
| Status | Inline badges (ver seção Badges) | Semântico |
| Gasto | `text-critical` | Vermelho |
| Renda | `text-positive` | Verde |

### Toast / Notificações (Sonner)

| Aspecto | Regra | Visual |
|---------|-------|--------|
| Border-radius | `rounded-[10px]` | Padrão radius |
| Border + bg | `border bg-popover` | Branco com borda |
| Shadow | `shadow-sm` | Leve |
| Padding | `px-4 py-3` | 16px × 12px |
| Ícone | `size-4` com cor semântica | 16px |
| Texto | `text-sm` | 14px |
| Sucesso | CheckCircle2 verde | Confirmação |
| Erro | AlertTriangle vermelho | Falha |
| Warning | AlertTriangle amarelo | Atenção |
| Info | Clock azul | Informativo |
| Posição desktop | Bottom-right, empilha | Não obstrui |
| Posição mobile | Bottom-center, acima da bottom nav | Acessível |

---

## Regras de Ícones

| Aspecto | Regra |
|---------|-------|
| Biblioteca | **Lucide React** (exclusivamente) |
| Tamanho padrão | `size-4` (16px) para inline, `size-5` (20px) para nav |
| Stroke width | 1.5px (padrão Lucide) |
| Cores | Semânticas via classes Tailwind (`text-primary`, `text-muted-foreground`, etc.) |

---

## Regras de Acessibilidade nos Protótipos

| Aspecto | Regra |
|---------|-------|
| Contraste | WCAG 2.1 AA (mín 4.5:1 texto, 3:1 elementos grandes) |
| Touch targets | Mínimo `44×44px` em mobile |
| Focus ring | `2px` indigo outline com offset |
| Cor como indicador | **Nunca** é o único indicador — sempre com ícone ou texto |
| Labels | Sempre visíveis (nunca apenas placeholder) |
| ARIA | Roles e labels descritivos em componentes interativos |

---

## Checklist Rápido para Validação de Protótipos

Antes de considerar um protótipo como "correto", verificar:

- [ ] Valores monetários com 2 decimais? (`R$ 3.000,00`, não `R$ 3.000`)
- [ ] Percentuais com 2 decimais? (`25,03%`, não `25%`)
- [ ] Sidebar desktop correto? (mesmo sidebar canônico em todos)
- [ ] Bottom nav mobile correta? (mesma bottom nav canônica em todos)
- [ ] Fonte Inter? (não Arial, Helvetica, etc.)
- [ ] `tabular-nums` em valores financeiros?
- [ ] Paleta Stone & Indigo? (não cores ad-hoc)
- [ ] Espaçamento múltiplo de 4px?
- [ ] Botões estilo shadcn/ui? (não HTML nativo)
- [ ] Labels acima dos inputs? (não placeholder como label)
- [ ] Cards com `ring-1 ring-foreground/10`? (não box-shadow pesado)
- [ ] Empty states com ícone + título + descrição + CTA?
- [ ] Skeleton screens presentes?
- [ ] Touch targets ≥ 44px em mobile?
- [ ] Breakpoints corretos? (mobile < 768px, desktop ≥ 1024px)
