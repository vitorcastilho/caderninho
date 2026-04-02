# Story 2.5.5: Component Library — Extração de Compostos

Status: review

## Story

As a desenvolvedor do Caderninho,
I want extrair padrões visuais duplicados em componentes reutilizáveis com testes próprios e presença no Design System,
so that o Épico 3 (e futuros) importem componentes prontos ao invés de recriar código duplicado.

## Contexto

A Story 2.5.4 (Auditoria Visual Exaustiva) garantiu zero desvios visuais contra o DS unificado. Porém, **padrões idênticos estão copy-pasted em múltiplos arquivos**:

- **Input monetário (R$)**: ~15 linhas idênticas em 6+ formulários — `centsToDisplayValue`, `displayValueToCents`, `R$ ${display}`, `inputMode="numeric"`, regex de limpeza
- **Input percentual (%)**: mesmo padrão em InvestmentForm e onboarding
- **Empty state**: ~7 linhas idênticas em 5 listas — `border-dashed rounded-xl` + ícone + título + descrição + CTA
- **Page header**: H1 + descrição + botão de ação em todas as list pages

Esta story extrai esses padrões em componentes reais em `src/client/components/ui/`, com testes, renderizados na página `/design-system`.

**Cadeia de dependência:** 2.5.1 → 2.5.2 → 2.5.2b → 2.5.3 → 2.5.4 (done) → **2.5.5** → 2.5.6 → 2.5.7

## Acceptance Criteria

### AC 1: CurrencyInput — Componente Extraído

**Given** qualquer formulário que precisa de input monetário (R$)
**When** o desenvolvedor importa `<CurrencyInput>`
**Then** o componente encapsula todo o padrão: estado `displayValue`, conversão `centsToDisplayValue`/`displayValueToCents`, prefixo `R$`, `inputMode="numeric"`, regex de limpeza de não-dígitos
**And** aceita props: `value` (centavos), `onChange` (centavos), `label`, `placeholder`, `error`, `id`, `disabled`
**And** funciona controlado: recebe valor em centavos, emite mudança em centavos
**And** exibe `R$ 0,00` como valor zero (nunca truncado, sempre 2 decimais)
**And** usa `<Input>` e `<Label>` de shadcn/ui internamente
**And** está renderizado na página `/design-system` com exemplos interativos

### AC 2: PercentageInput — Componente Extraído

**Given** qualquer formulário que precisa de input percentual (%)
**When** o desenvolvedor importa `<PercentageInput>`
**Then** o componente encapsula: estado display, conversão `basisPointsToDisplayValue`/`displayValueToBasisPoints`, sufixo `%`, `inputMode="numeric"`
**And** aceita props: `value` (basis points), `onChange` (basis points), `label`, `placeholder`, `error`, `id`, `disabled`
**And** funciona controlado: recebe valor em basis points, emite mudança em basis points
**And** exibe `0,00%` como valor zero
**And** usa `<Input>` e `<Label>` de shadcn/ui internamente
**And** está renderizado na página `/design-system`

### AC 3: EmptyState — Componente Extraído

**Given** qualquer lista que precisa exibir estado vazio
**When** o desenvolvedor importa `<EmptyState>`
**Then** o componente renderiza o padrão canônico: `border-dashed rounded-xl border-border px-6 py-8 text-center` + ícone Lucide + título + descrição + CTA button
**And** aceita props: `icon` (LucideIcon), `title`, `description`, `actionLabel`, `onAction`
**And** o CTA é opcional — se não fornecido, renderiza sem botão
**And** usa tokens CSS do DS (nunca hex hardcoded)
**And** está renderizado na página `/design-system`

### AC 4: PageHeader — Componente Extraído

**Given** qualquer página de lista que tem título H1 + descrição + botão de ação
**When** o desenvolvedor importa `<PageHeader>`
**Then** o componente renderiza: `<h1>` com `text-2xl font-bold` + descrição `text-sm text-muted-foreground` + slot para action button
**And** aceita props: `title`, `description` (opcional), `children` (para botão de ação)
**And** usa layout responsivo: título e descrição à esquerda, botão à direita (desktop) ou empilhado (mobile)
**And** está renderizado na página `/design-system`

### AC 5: Substituição em Todos os Consumidores

**Given** os 4 componentes extraídos estão criados
**When** os formulários e listas existentes são refatorados
**Then** BankAccountForm, CreditCardForm, InvestmentForm, CategoryForm, IncomeSourceForm usam `<CurrencyInput>` (nunca inline)
**And** InvestmentForm usa `<PercentageInput>` (nunca inline)
**And** BankAccountList, CreditCardList, InvestmentList, IncomeSourceList, CategoryTree usam `<EmptyState>` (nunca inline)
**And** todas as 5 list pages usam `<PageHeader>` (nunca inline)
**And** os formulários do onboarding (BankAccountsStep, CreditCardsStep, CategoriesStep) usam `<CurrencyInput>` e/ou `<PercentageInput>`
**And** zero código duplicado do padrão anterior permanece

### AC 6: Testes

**Given** cada componente extraído
**When** testes são executados
**Then** `CurrencyInput` tem testes para: renderização, digitação de valor, conversão cents↔display, valor zero, onChange emite centavos
**And** `PercentageInput` tem testes para: renderização, digitação, conversão basis points↔display, valor zero, onChange emite basis points
**And** `EmptyState` tem testes para: renderização com e sem CTA, ícone correto, textos
**And** `PageHeader` tem testes para: renderização com/sem description, com/sem children
**And** `npm run build` passa sem erros
**And** `npm run test` passa sem regressões

### AC 7: Design System Page

**Given** todos os componentes extraídos
**When** a página `/design-system` é acessada
**Then** cada componente tem uma seção dedicada com exemplo interativo
**And** CurrencyInput mostra campo funcional com digitação ao vivo
**And** PercentageInput mostra campo funcional com digitação ao vivo
**And** EmptyState mostra variantes: com CTA e sem CTA
**And** PageHeader mostra variante com e sem botão de ação

## Tasks / Subtasks

### Fase 1: Criação dos Componentes (AC: #1, #2, #3, #4)

- [x]Task 1: Criar `CurrencyInput` (AC: #1)
  - [x]1.1: Criar `src/client/components/ui/currency-input.tsx`
  - [x]1.2: Props interface: `value: number` (centavos), `onChange: (cents: number) => void`, `label: string`, `placeholder?: string`, `error?: string`, `id?: string`, `disabled?: boolean`
  - [x]1.3: Lógica interna: `centsToDisplayValue`/`displayValueToCents` de `@/client/utils/currency-input`
  - [x]1.4: Usar `<Input>` + `<Label>` do shadcn/ui, `inputMode="numeric"`, prefixo `R$` no valor exibido
  - Files: `src/client/components/ui/currency-input.tsx`

- [x]Task 2: Criar `PercentageInput` (AC: #2)
  - [x]2.1: Criar `src/client/components/ui/percentage-input.tsx`
  - [x]2.2: Props interface: `value: number` (basis points), `onChange: (basisPoints: number) => void`, `label: string`, `placeholder?: string`, `error?: string`, `id?: string`, `disabled?: boolean`
  - [x]2.3: Lógica interna: `basisPointsToDisplayValue`/`displayValueToBasisPoints` de `@/client/utils/percentage-input`
  - [x]2.4: Usar `<Input>` + `<Label>` do shadcn/ui, `inputMode="numeric"`, sufixo `%`
  - Files: `src/client/components/ui/percentage-input.tsx`

- [x]Task 3: Criar `EmptyState` (AC: #3)
  - [x]3.1: Criar `src/client/components/ui/empty-state.tsx`
  - [x]3.2: Props interface: `icon: LucideIcon`, `title: string`, `description: string`, `actionLabel?: string`, `onAction?: () => void`
  - [x]3.3: Layout: `border-dashed rounded-xl border-border px-6 py-8 text-center` + ícone `size-8 text-muted-foreground/60` + título `text-sm font-medium` + descrição `text-xs text-muted-foreground` + `<Button variant="secondary" size="sm">`
  - Files: `src/client/components/ui/empty-state.tsx`

- [x]Task 4: Criar `PageHeader` (AC: #4)
  - [x]4.1: Criar `src/client/components/ui/page-header.tsx`
  - [x]4.2: Props interface: `title: string`, `description?: string`, `children?: ReactNode`
  - [x]4.3: Layout: flex row entre título/descrição e children, responsivo (empilha em mobile)
  - Files: `src/client/components/ui/page-header.tsx`

### Fase 2: Testes (AC: #6)

- [x]Task 5: Testes do CurrencyInput (AC: #6)
  - [x]5.1: Criar `src/client/components/ui/currency-input.test.tsx`
  - [x]5.2: Testar: renderização com label, digitação de valor numérico, conversão display↔cents, valor zero exibe "R$ 0,00", onChange emite centavos, disabled state
  - Files: `src/client/components/ui/currency-input.test.tsx`

- [x]Task 6: Testes do PercentageInput (AC: #6)
  - [x]6.1: Criar `src/client/components/ui/percentage-input.test.tsx`
  - [x]6.2: Testar: renderização, digitação, conversão display↔basis points, valor zero exibe "0,00%", onChange emite basis points
  - Files: `src/client/components/ui/percentage-input.test.tsx`

- [x]Task 7: Testes do EmptyState (AC: #6)
  - [x]7.1: Criar `src/client/components/ui/empty-state.test.tsx`
  - [x]7.2: Testar: renderização com CTA, renderização sem CTA (onAction/actionLabel omitidos), ícone correto, textos corretos, click no CTA chama onAction
  - Files: `src/client/components/ui/empty-state.test.tsx`

- [x]Task 8: Testes do PageHeader (AC: #6)
  - [x]8.1: Criar `src/client/components/ui/page-header.test.tsx`
  - [x]8.2: Testar: renderização com/sem description, com/sem children, H1 com classes corretas
  - Files: `src/client/components/ui/page-header.test.tsx`

### Fase 3: Substituição nos Consumidores (AC: #5)

- [x]Task 9: Substituir CurrencyInput nos formulários (AC: #5)
  - [x]9.1: BankAccountForm — substituir ~15 linhas inline por `<CurrencyInput value={balanceCents} onChange={setBalanceCents} label="Saldo inicial (R$)" />`
  - [x]9.2: CreditCardForm — substituir inline por `<CurrencyInput>` (campo limite)
  - [x]9.3: InvestmentForm — substituir inline por `<CurrencyInput>` (campo saldo)
  - [x]9.4: IncomeSourceForm — substituir inline por `<CurrencyInput>` (campo valor base)
  - [x]9.5: CategoryForm — substituir inline por `<CurrencyInput>` (campo orçamento)
  - Files: `BankAccountForm.tsx`, `CreditCardForm.tsx`, `InvestmentForm.tsx`, `IncomeSourceForm.tsx`, `CategoryForm.tsx`

- [x]Task 10: Substituir CurrencyInput no onboarding (AC: #5)
  - [x]10.1: BankAccountsStep — substituir inline por `<CurrencyInput>`
  - [x]10.2: CreditCardsStep — substituir inline por `<CurrencyInput>`
  - [x]10.3: CategoriesStep — substituir inline por `<CurrencyInput>`
  - Files: `BankAccountsStep.tsx`, `CreditCardsStep.tsx`, `CategoriesStep.tsx`

- [x]Task 11: Substituir PercentageInput (AC: #5)
  - [x]11.1: InvestmentForm — substituir inline por `<PercentageInput>`
  - Files: `InvestmentForm.tsx`

- [x]Task 12: Substituir EmptyState nas listas (AC: #5)
  - [x]12.1: BankAccountList — substituir inline por `<EmptyState icon={Building2} title="Nenhuma conta cadastrada" ... />`
  - [x]12.2: CreditCardList — substituir inline
  - [x]12.3: InvestmentList — substituir inline
  - [x]12.4: IncomeSourceList — substituir inline
  - [x]12.5: CategoryTree — substituir inline
  - Files: `BankAccountList.tsx`, `CreditCardList.tsx`, `InvestmentList.tsx`, `IncomeSourceList.tsx`, `CategoryTree.tsx`

- [x]Task 13: Substituir PageHeader nas list pages (AC: #5)
  - [x]13.1: BankAccountList — extrair H1 + description + botão "Nova Conta" para `<PageHeader>`
  - [x]13.2: CreditCardList — idem
  - [x]13.3: InvestmentList — idem
  - [x]13.4: IncomeSourceList — idem
  - [x]13.5: CategoryTree — idem
  - Files: `BankAccountList.tsx`, `CreditCardList.tsx`, `InvestmentList.tsx`, `IncomeSourceList.tsx`, `CategoryTree.tsx`

### Fase 4: Design System Page (AC: #7)

- [x]Task 14: Adicionar seções no Design System (AC: #7)
  - [x]14.1: Seção CurrencyInput — exemplo interativo com campo funcional + exibição do valor em centavos
  - [x]14.2: Seção PercentageInput — exemplo interativo com campo funcional + exibição do valor em basis points
  - [x]14.3: Seção EmptyState — variantes com CTA e sem CTA
  - [x]14.4: Seção PageHeader — variante com description + action, variante mínima
  - Files: `src/app/design-system/page.tsx`

### Fase 5: Validação Final (AC: #6)

- [x]Task 15: Build e testes
  - [x]15.1: `npm run build` — zero erros
  - [x]15.2: `npm run test` — zero regressões + novos testes passando

## Dev Notes

### Natureza da Story: Refatoração de Componentes

Esta story extrai código duplicado em componentes reutilizáveis. **Nenhuma funcionalidade nova é adicionada** — o comportamento visual deve permanecer exatamente igual antes e depois da refatoração.

### Padrão de Input Monetário — Referência Canônica

O padrão atual duplicado em 6+ formulários:

```tsx
// Estado
const [balanceDisplay, setBalanceDisplay] = useState(
  defaultValues ? centsToDisplayValue(defaultValues.balanceCents) : '0,00',
);

// No JSX
<Label htmlFor="balance">Saldo inicial (R$)</Label>
<Input
  id="balance"
  value={`R$ ${balanceDisplay}`}
  onChange={(e) => {
    const digits = e.target.value.replace(/\D/g, '');
    const cents = parseInt(digits || '0', 10);
    setBalanceDisplay(centsToDisplayValue(cents));
  }}
  placeholder="R$ 0,00"
  inputMode="numeric"
/>
```

Deve virar:

```tsx
<CurrencyInput
  value={balanceCents}
  onChange={setBalanceCents}
  label="Saldo inicial (R$)"
  error={errors.balanceCents}
/>
```

### Padrão de Empty State — Referência Canônica

O padrão duplicado em 5 listas:

```tsx
<div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-8 text-center">
  <Building2 className="size-8 text-muted-foreground/60" />
  <p className="text-sm font-medium text-foreground">Nenhuma conta cadastrada</p>
  <p className="text-xs text-muted-foreground">Cadastre suas contas bancárias...</p>
  <Button variant="secondary" size="sm" onClick={...}>Nova Conta</Button>
</div>
```

Deve virar:

```tsx
<EmptyState
  icon={Building2}
  title="Nenhuma conta cadastrada"
  description="Cadastre suas contas bancárias para acompanhar saldos."
  actionLabel="Nova Conta"
  onAction={() => setShowCreateForm(true)}
/>
```

### Componentes UI Existentes (NÃO reinventar)

Componentes base em `src/client/components/ui/`:
- `button.tsx` — CVA, 6 variants × 8 sizes
- `input.tsx` — Input base
- `label.tsx` — Label
- `card.tsx` — Card + sub-componentes
- `badge.tsx` — 4 variants
- `bank-logo.tsx` — Logos de banco (15-20 bancos BR + fallback)
- `credit-card-brand-badge.tsx` — Bandeiras de cartão
- `skeleton.tsx`, `dialog.tsx`, `sheet.tsx`, `select.tsx`, `tabs.tsx`, `table.tsx`, `breadcrumb.tsx`, `emoji-picker.tsx`, `sonner.tsx`

### Helpers de Formatação Existentes (USAR, não recriar)

- `src/client/utils/currency-input.ts` — `centsToDisplayValue()`, `displayValueToCents()`
- `src/client/utils/percentage-input.ts` — `basisPointsToDisplayValue()`, `displayValueToBasisPoints()`
- `src/client/utils/format-currency.ts` — `formatCurrency()` para exibição (leitura, não input)

### Consumidores a Refatorar (Mapa Completo)

**CurrencyInput** (6 formulários + 3 onboarding):
| Arquivo | Campo | Import atual |
|---------|-------|-------------|
| `src/client/components/bank-accounts/BankAccountForm.tsx` | Saldo inicial | `centsToDisplayValue`, `displayValueToCents` |
| `src/client/components/credit-cards/CreditCardForm.tsx` | Limite | `centsToDisplayValue`, `displayValueToCents` |
| `src/client/components/investments/InvestmentForm.tsx` | Saldo atual | `centsToDisplayValue`, `displayValueToCents` |
| `src/client/components/income-sources/IncomeSourceForm.tsx` | Valor base | `centsToDisplayValue`, `displayValueToCents` |
| `src/client/components/categories/CategoryForm.tsx` | Orçamento | `centsToDisplayValue`, `displayValueToCents` |
| `src/client/components/onboarding/steps/BankAccountsStep.tsx` | Saldo | `centsToDisplayValue`, `displayValueToCents` |
| `src/client/components/onboarding/steps/CreditCardsStep.tsx` | Limite | `centsToDisplayValue`, `displayValueToCents` |
| `src/client/components/onboarding/steps/CategoriesStep.tsx` | Orçamento | `centsToDisplayValue`, `displayValueToCents` |

**PercentageInput** (1 formulário):
| Arquivo | Campo |
|---------|-------|
| `src/client/components/investments/InvestmentForm.tsx` | Rendimento (% CDI) |

**EmptyState** (5 listas):
| Arquivo | Ícone | Título |
|---------|-------|--------|
| `src/client/components/bank-accounts/BankAccountList.tsx` | Building2 | "Nenhuma conta cadastrada" |
| `src/client/components/credit-cards/CreditCardList.tsx` | CreditCard | "Nenhum cartão cadastrado" |
| `src/client/components/investments/InvestmentList.tsx` | Landmark | "Nenhum investimento cadastrado" |
| `src/client/components/income-sources/IncomeSourceList.tsx` | Wallet | "Nenhuma fonte de receita cadastrada" |
| `src/client/components/categories/CategoryTree.tsx` | Tags | "Nenhuma classificação cadastrada" |

**PageHeader** (5 list pages — mesmos arquivos das listas acima)

### Regras de Implementação

1. **Estado controlado** — CurrencyInput e PercentageInput devem ser componentes controlados. O estado `displayValue` fica interno ao componente. O consumidor passa `value` (centavos/basis points) e recebe `onChange` (centavos/basis points).
2. **Sem estado externo de display** — o consumidor NÃO deve mais ter `useState` para `balanceDisplay`. O `<CurrencyInput>` gerencia isso internamente.
3. **Backward compatible** — o comportamento visual deve ser idêntico ao padrão inline atual. Nenhum layout, cor ou espaçamento deve mudar.
4. **Testes em jsdom** — usar `vi.stubGlobal('localStorage', ...)` se necessário (Node.js 22+ conflito). `@testing-library/react` + `@testing-library/user-event` para testes de componente.
5. **Sem novas dependências** — usar apenas o que já está no projeto.

### O Que NÃO Fazer Nesta Story

- **NÃO criar componentes do Épico 3** (CascadeInput, BudgetProgressBar, etc.) — isso é Story 2.5.6
- **NÃO alterar lógica de negócio** — apenas extração de UI duplicada
- **NÃO alterar os helpers** em `currency-input.ts` / `percentage-input.ts` — reusar como estão
- **NÃO alterar o layout/visual** de nenhuma tela — refatoração pura, mesma saída visual
- **NÃO instalar dependências novas**
- **NÃO alterar schemas, server actions ou use cases**

### Lições das Stories Anteriores

**Da Story 2.5.4 (Auditoria Visual):**
- Componentes UI em `src/client/components/ui/` seguem o padrão CVA/Radix
- Empty states canônicos: `border-dashed rounded-xl` + ícone Lucide + título + descrição + CTA
- H1 canônico: `text-2xl font-bold tracking-tight`
- Touch targets mobile ≥ 44×44px

**Da Story 2.5.3 (Unificação DS):**
- `centsToDisplayValue()` usa `toLocaleString('pt-BR')` para separador milhar ✅
- Token `--radius-input` removido — inputs usam `rounded-md` direto

**Da Story 2.5.1 (Decisões de Produto):**
- BankLogo criado em `src/client/components/ui/bank-logo.tsx` com testes — bom modelo de componente UI com testes
- Input monetário segue padrão app bancário: digita números, vírgula posiciona automaticamente

**Do Code Review (lições gerais):**
- Máximo 3 rounds de review
- LOWs e refatorações não bloqueiam — backlog
- Se pedir "criar X", especificar tudo na mesma rodada

### Convenção de Commits

- Prefixo `feat:` — mensagem em português BR
- Branch: `epic-2-5/2-5-5-component-library-extracao-de-compostos`
- PR com descrição do que foi entregue

### Project Structure Notes

Arquivos criados por esta story:
- `src/client/components/ui/currency-input.tsx` — NOVO
- `src/client/components/ui/currency-input.test.tsx` — NOVO
- `src/client/components/ui/percentage-input.tsx` — NOVO
- `src/client/components/ui/percentage-input.test.tsx` — NOVO
- `src/client/components/ui/empty-state.tsx` — NOVO
- `src/client/components/ui/empty-state.test.tsx` — NOVO
- `src/client/components/ui/page-header.tsx` — NOVO
- `src/client/components/ui/page-header.test.tsx` — NOVO

Arquivos modificados:
- `src/client/components/bank-accounts/BankAccountForm.tsx` — refatorar para usar CurrencyInput
- `src/client/components/credit-cards/CreditCardForm.tsx` — refatorar para usar CurrencyInput
- `src/client/components/investments/InvestmentForm.tsx` — refatorar para usar CurrencyInput + PercentageInput
- `src/client/components/income-sources/IncomeSourceForm.tsx` — refatorar para usar CurrencyInput
- `src/client/components/categories/CategoryForm.tsx` — refatorar para usar CurrencyInput
- `src/client/components/onboarding/steps/BankAccountsStep.tsx` — refatorar para usar CurrencyInput
- `src/client/components/onboarding/steps/CreditCardsStep.tsx` — refatorar para usar CurrencyInput
- `src/client/components/onboarding/steps/CategoriesStep.tsx` — refatorar para usar CurrencyInput
- `src/client/components/bank-accounts/BankAccountList.tsx` — refatorar para usar EmptyState + PageHeader
- `src/client/components/credit-cards/CreditCardList.tsx` — refatorar para usar EmptyState + PageHeader
- `src/client/components/investments/InvestmentList.tsx` — refatorar para usar EmptyState + PageHeader
- `src/client/components/income-sources/IncomeSourceList.tsx` — refatorar para usar EmptyState + PageHeader
- `src/client/components/categories/CategoryTree.tsx` — refatorar para usar EmptyState + PageHeader
- `src/app/design-system/page.tsx` — adicionar 4 seções novas

### Git Intelligence (Últimos Commits)

```
a82c4b8 docs: backlog de lacunas UX entre protótipos e implementação
05fc70d chore: code review R1 aprovado — story 2.5.4 done
b113279 feat: auditoria visual exaustiva — zero desvios contra DS unificado (Story 2.5.4)
2756d61 feat: unificação do design system — alinhamento com regras canônicas (Story 2.5.3)
9dddedd feat: atualização dos protótipos para modelo de categorização v2 (Story 2.5.2b)
```

A base visual está limpa (zero desvios). Esta story consolida essa base extraindo componentes reusáveis.

### References

- [Source: _bmad-output/implementation-artifacts/epic-2-retro-2026-03-24.md#Story 2.5.5] — Definição original: "CurrencyInput, PercentageInput, EmptyState, BankLogo e outros. Testes próprios, renderizados no DS, substituem código duplicado"
- [Source: _bmad-output/implementation-artifacts/2-5-4-auditoria-visual-exaustiva.md] — Padrões canônicos, componentes existentes, helpers de formatação
- [Source: _bmad-output/planning-artifacts/backlog-ux-gaps-prototipos.md] — Gaps UX que dependem do Épico 3 (não desta story)
- [Source: src/client/utils/currency-input.ts] — Helpers canônicos de conversão monetária
- [Source: src/client/utils/percentage-input.ts] — Helpers canônicos de conversão percentual
- [Source: src/client/components/bank-accounts/BankAccountForm.tsx] — Referência do padrão inline a extrair
- [Source: src/client/components/bank-accounts/BankAccountList.tsx] — Referência do empty state a extrair
- [Source: _bmad-output/project-context.md] — Regras do projeto

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

Nenhum debug necessário.

### Completion Notes List

- 4 componentes extraídos: CurrencyInput, PercentageInput, EmptyState, PageHeader
- 29 testes novos (10+8+5+6), 692 testes totais passando
- 13 arquivos consumidores refatorados (6 forms + 3 onboarding + 4 listas/tree)
- 3 seções adicionadas na página /design-system (CurrencyInput, PercentageInput, PageHeader)
- EmptyState já tinha seção no DS — reusada
- Build zero erros, testes zero regressões

### File List

**Novos:**
- `src/client/components/ui/currency-input.tsx`
- `src/client/components/ui/currency-input.test.tsx`
- `src/client/components/ui/percentage-input.tsx`
- `src/client/components/ui/percentage-input.test.tsx`
- `src/client/components/ui/empty-state.tsx`
- `src/client/components/ui/empty-state.test.tsx`
- `src/client/components/ui/page-header.tsx`
- `src/client/components/ui/page-header.test.tsx`

**Modificados:**
- `src/client/components/bank-accounts/BankAccountForm.tsx`
- `src/client/components/credit-cards/CreditCardForm.tsx`
- `src/client/components/investments/InvestmentForm.tsx`
- `src/client/components/income-sources/IncomeSourceForm.tsx`
- `src/client/components/categories/CategoryForm.tsx`
- `src/client/components/onboarding/steps/BankAccountsStep.tsx`
- `src/client/components/onboarding/steps/CreditCardsStep.tsx`
- `src/client/components/onboarding/steps/CategoriesStep.tsx`
- `src/client/components/bank-accounts/BankAccountList.tsx`
- `src/client/components/credit-cards/CreditCardList.tsx`
- `src/client/components/investments/InvestmentList.tsx`
- `src/client/components/income-sources/IncomeSourceList.tsx`
- `src/client/components/categories/CategoryTree.tsx`
- `src/app/design-system/page.tsx`
