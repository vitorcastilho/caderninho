# Story 2.6: Onboarding — Setup Inicial Guiado

Status: review

## Story

As a new user (primeiro acesso),
I want a guided setup flow after registration,
So that I can configure bank accounts, credit cards, categories and budgets quickly (~5 min) and start using the app immediately.

## Acceptance Criteria

### Detecção de Primeiro Acesso

1. Quando o usuário acessa o app pela primeira vez (após registro/login), é redirecionado ao fluxo de onboarding em vez do dashboard
2. A detecção usa um campo `has_completed_onboarding` na tabela `organizations` — `false` no create, `true` ao finalizar
3. Se o usuário já completou o onboarding, vai direto para o dashboard (sem exibir onboarding novamente)

### Fluxo de Onboarding — 5 Etapas

4. **Etapa 1 — Bem-vindo**: Tela de introdução com tom calmo: "Vamos configurar o básico. Leva ~5 minutos." + botão "Começar" + indicador de progresso (5 dots)
5. **Etapa 2 — Contas Bancárias**: O usuário adiciona contas bancárias com nome, banco e saldo inicial. Formulário inline expansível. Botão "+ Adicionar conta". Botões "Próximo" e "Pular"
6. **Etapa 3 — Cartões de Crédito**: O usuário cadastra cartões com nome, bandeira, limite, dia de fechamento e dia de vencimento. Formulário inline expansível. Botões "Próximo" e "Pular"
7. **Etapa 4 — Categorias e Orçamentos**: Categorias sugeridas com valores base editáveis, agrupadas por classificação de essencialidade. O usuário pode editar orçamento, adicionar novas categorias e configurar método de pagamento padrão (opcional). Botões "Próximo" e "Pular"
8. **Etapa 5 — Pronto!**: Resumo final: "X contas, Y cartões, Z categorias configurados" + saldo total calculado. Botão "Ir para o Dashboard" + "Convidar alguém" (secundário)

### Persistência e Navegação

9. Cada etapa persiste os dados ao clicar "Próximo" — os itens são criados via server actions existentes (reutiliza `createBankAccountAction`, `createCreditCardAction`, `createCategoryAction`)
10. "Pular" avança para a próxima etapa sem criar nada naquela etapa
11. Se o usuário fechar o app ou navegar para outra tela no meio do onboarding, o progresso é preservado (itens já criados estão no banco) e ao voltar retoma de onde parou
12. O mínimo para funcionar: 1 conta bancária. Se o usuário pular todas as etapas, pode usar o app vazio e configurar depois
13. "Depois" é sempre opção — nenhuma etapa bloqueia o uso do app

### Categorias Sugeridas (Etapa 4)

14. O sistema sugere categorias pré-preenchidas baseadas nas classificações de essencialidade padrão (já seeded): Essenciais, Qualidade de Vida
15. Sugestões com valores base editáveis: Supermercado (R$ 3.000), Moradia (R$ 2.200), Gasolina (R$ 600), Internet/Telefone (R$ 158), Educação (R$ 2.800), Restaurante (R$ 2.500)
16. O usuário pode alterar os valores, remover sugestões que não se aplicam e adicionar categorias novas
17. A configuração de método de pagamento padrão por categoria é opcional nesta etapa (link para tela de categorias depois)

### Finalização

18. Ao clicar "Ir para o Dashboard" na etapa final, `has_completed_onboarding` é setado para `true` e o usuário é redirecionado ao dashboard
19. O dashboard carrega com os dados cadastrados durante o onboarding

### Validação Visual

20. O layout é validado contra `proto-08-onboarding.html` (protótipo é a referência visual canônica)
21. Design tokens do protótipo: dots de progresso (8px, indigo ativo, verde completo), cards com border-radius 12px, botão primário indigo, botão ghost transparente, botão add com dashed border

## Tasks / Subtasks

### Módulo: Schema e Migration

- [x] Task 1: Adicionar campo `has_completed_onboarding` na tabela `organizations` (AC: #1, #2, #3)
  - [x] 1.1 Adicionar `hasCompletedOnboarding: boolean('has_completed_onboarding').notNull().default(false)` em `src/server/infrastructure/database/schema/auth-schema.ts` (na tabela organizations)
  - [x] 1.2 Executar `npm run db:generate` para gerar migration
  - [x] 1.3 Aplicar migration com `npm run db:migrate`

### Módulo: Domain — Use Cases e Repository

- [x] Task 2: Criar use case de detecção de onboarding (AC: #1, #2, #3)
  - [x] 2.1 Criar `src/server/domain/onboarding/use-cases/check-onboarding-status.ts` — retorna `Result<{ completed: boolean }>`
  - [x] 2.2 Criar `src/server/domain/onboarding/use-cases/check-onboarding-status.test.ts` — TDD
  - [x] 2.3 Consulta `organizations` pelo `organizationId` da sessão e retorna `hasCompletedOnboarding`

- [x] Task 3: Criar use case de completar onboarding (AC: #18)
  - [x] 3.1 Criar `src/server/domain/onboarding/use-cases/complete-onboarding.ts` — seta `has_completed_onboarding = true`
  - [x] 3.2 Criar `src/server/domain/onboarding/use-cases/complete-onboarding.test.ts` — TDD
  - [x] 3.3 Registra na trilha de auditoria

- [x] Task 4: Criar repository interface e implementação (AC: #2, #18)
  - [x]4.1 Criar `src/server/domain/onboarding/repositories/onboarding.repository.ts` — interface com `getOnboardingStatus(orgId)` e `completeOnboarding(orgId)`
  - [x]4.2 Criar `src/server/infrastructure/database/repositories/onboarding.repository.impl.ts` — implementação Drizzle

### Módulo: Server Actions

- [x] Task 5: Criar server actions de onboarding (AC: #1, #9, #18)
  - [x]5.1 Criar `src/server/actions/onboarding.actions.ts` — `checkOnboardingStatusAction()`, `completeOnboardingAction()`
  - [x]5.2 Factory: `src/server/factories/onboarding.ts` com deps
  - [x]5.3 Ambas protegidas por `withAuth`

### Módulo: Categorias Sugeridas

- [x] Task 6: Criar constantes de categorias sugeridas para onboarding (AC: #14, #15)
  - [x]6.1 Criar `src/shared/constants/onboarding-suggestions.ts` com array de categorias sugeridas: `{ name, classificationName, budgetCents, emoji }`
  - [x]6.2 Categorias pré-definidas conforme protótipo: Supermercado (300000), Moradia (220000), Gasolina (60000), Internet/Tel (15800), Educação (280000), Restaurante (250000)

### Módulo: Routing e Detecção

- [x] Task 7: Implementar redirect de onboarding no layout (AC: #1, #3)
  - [x]7.1 Atualizar `src/app/(app)/layout.tsx` para chamar `checkOnboardingStatusAction()` após autenticação
  - [x]7.2 Se `completed === false`, redirect para `/onboarding`
  - [x]7.3 Se `completed === true`, continua normalmente (dashboard)

- [x] Task 8: Criar rota `/onboarding` (AC: #4-#8)
  - [x]8.1 Criar `src/app/(app)/onboarding/page.tsx` — Server Component que carrega dados iniciais (classificações, contas existentes, cartões existentes, categorias existentes)
  - [x]8.2 Criar `src/app/(app)/onboarding/loading.tsx` — skeleton

### Módulo: UI — Componente Wizard

- [x] Task 9: Criar componente `OnboardingWizard` (AC: #4-#8, #10, #20, #21)
  - [x]9.1 Criar `src/client/components/onboarding/OnboardingWizard.tsx` — Client Component com estado de step (1-5)
  - [x]9.2 Criar componente `StepIndicator` — 5 dots com estados: pending (stone-300), active (indigo-600, scale 1.25), completed (positive/green)
  - [x]9.3 Layout: max-w-lg mx-auto, padding responsivo, centralizado

- [x] Task 10: Criar Step 1 — Bem-vindo (AC: #4)
  - [x]10.1 Criar `src/client/components/onboarding/steps/WelcomeStep.tsx`
  - [x]10.2 Logo + título "Bem-vindo ao Caderninho!" + descrição + botão "Começar"

- [x] Task 11: Criar Step 2 — Contas Bancárias (AC: #5, #9, #10, #12)
  - [x]11.1 Criar `src/client/components/onboarding/steps/BankAccountsStep.tsx`
  - [x]11.2 Lista de contas já adicionadas (com opção de remover)
  - [x]11.3 Formulário inline para adicionar conta (reutilizar lógica do BankAccountForm)
  - [x]11.4 Botão "+ Adicionar conta" (estilo dashed border)
  - [x]11.5 Botões "Próximo" e "Pular"
  - [x]11.6 Ao adicionar, chama `createBankAccountAction` diretamente

- [x] Task 12: Criar Step 3 — Cartões de Crédito (AC: #6, #9, #10)
  - [x]12.1 Criar `src/client/components/onboarding/steps/CreditCardsStep.tsx`
  - [x]12.2 Lista de cartões já adicionados (com CreditCardBrandBadge)
  - [x]12.3 Formulário inline para adicionar cartão (reutilizar lógica do CreditCardForm)
  - [x]12.4 Botão "+ Adicionar cartão" + "Próximo" + "Pular"
  - [x]12.5 Ao adicionar, chama `createCreditCardAction` diretamente

- [x] Task 13: Criar Step 4 — Categorias e Orçamentos (AC: #7, #9, #14-#17)
  - [x]13.1 Criar `src/client/components/onboarding/steps/CategoriesStep.tsx`
  - [x]13.2 Exibir categorias sugeridas agrupadas por classificação com valores editáveis
  - [x]13.3 Input de orçamento com padrão currency (inputMode="numeric", formato R$)
  - [x]13.4 Permitir remover sugestão (não cria) e adicionar nova categoria
  - [x]13.5 Ao clicar "Próximo", cria todas as categorias selecionadas/editadas via `createCategoryAction`
  - [x]13.6 Configuração de método de pagamento padrão opcional (select de tipo + instrumento, se o usuário já cadastrou contas/cartões nas etapas anteriores)

- [x] Task 14: Criar Step 5 — Resumo Final (AC: #8, #18, #19)
  - [x]14.1 Criar `src/client/components/onboarding/steps/CompletionStep.tsx`
  - [x]14.2 Ícone de check verde + "Tudo configurado!"
  - [x]14.3 Cards de resumo: X contas, Y cartões, Z categorias
  - [x]14.4 Saldo total (soma dos saldos das contas em cents, formatado com `centsToDisplayValue`)
  - [x]14.5 Botão "Ir para o Dashboard" → chama `completeOnboardingAction()` → redirect `/dashboard`
  - [x]14.6 Botão "Convidar alguém" (secundário) — placeholder para Epic 8

### Módulo: Persistência de Progresso

- [x] Task 15: Lógica de retomar onboarding (AC: #11)
  - [x]15.1 Na page.tsx do onboarding, carregar dados existentes (contas, cartões, categorias)
  - [x]15.2 Se já tem contas → iniciar no step que faz sentido (step 3 se tem contas, step 4 se tem contas e cartões)
  - [x]15.3 Manter botão "Voltar" para navegar entre steps

### Validação Final

- [x] Task 16: Validação final (AC: #1-#21)
  - [x]16.1 `npm run build` — compila sem erros
  - [x]16.2 `npm test` — todos passando, zero regressões
  - [x]16.3 `npm run lint` — 0 erros novos
  - [x]16.4 Fluxo completo de onboarding funcional (5 etapas)
  - [x]16.5 Retomada de onboarding funcional (fechar e voltar)
  - [x]16.6 Redirect correto (primeiro acesso → onboarding, acesso subsequente → dashboard)
  - [x]16.7 Validar visualmente contra `proto-08-onboarding.html`

## Dev Notes

### ALERTA CRITICO: Seguir Blueprint das Stories 2.1-2.5

As Stories anteriores estabeleceram o padrão completo de Clean Architecture. Esta story reutiliza ao máximo o que já existe — server actions, componentes de formulário, validação. O foco é no FLUXO (wizard multi-step) e na DETECÇÃO (primeiro acesso), não em recriar CRUD.

### Versões Exatas do Stack

| Tecnologia | Versão | Notas |
|---|---|---|
| Next.js | 16.1.6 | App Router, Server Actions, Server Components |
| Drizzle ORM | 0.45.1 | Schema, queries, migrations |
| Drizzle Kit | 0.31.10 | Generate + migrate |
| Better Auth | 1.5.5 | Session, organizations |
| Zod | 4.3.6 | Validação client + server |
| Vitest | 4.1.0 | Testes TDD |
| shadcn/ui | v4 | Componentes UI — estilo base-nova com @base-ui/react |

### CRITICO: Reutilizar Server Actions Existentes

NÃO criar novos endpoints para criar contas, cartões ou categorias. Usar diretamente:

```typescript
import { createBankAccountAction } from '@/server/actions/bank-account.actions';
import { createCreditCardAction } from '@/server/actions/credit-card.actions';
import { createCategoryAction } from '@/server/actions/category.actions';
import { listBankAccountsAction } from '@/server/actions/bank-account.actions';
import { listCreditCardsAction } from '@/server/actions/credit-card.actions';
import { listCategoriesAction } from '@/server/actions/category.actions';
import { listClassificationsAction } from '@/server/actions/essentiality-classification.actions';
```

Todas já tratam autenticação (`withAuth`), validação (`validateInput`) e auditoria.

### CRITICO: Schema de Detecção de Onboarding

Adicionar campo na tabela `organizations` (NÃO criar tabela nova):

```typescript
// src/server/infrastructure/database/schema/auth-schema.ts
// Na tabela organizations do Better Auth:
hasCompletedOnboarding: boolean('has_completed_onboarding').notNull().default(false),
```

**Por que na organizations?** Porque o onboarding é por família/organização, não por usuário individual. Se Vitor completa o onboarding, Tamires (quando for convidada) não precisa repetir — os dados financeiros já estão configurados.

### ALERTA: O campo `organizations` é gerenciado pelo Better Auth

A tabela `organizations` é criada e gerenciada pelo Better Auth (Organizations plugin). Adicionar colunas extras é permitido pelo Drizzle (ALTER TABLE), mas NÃO alterar o schema do Better Auth diretamente. Usar migration Drizzle para adicionar o campo.

### ALERTA: Layout do Onboarding

O onboarding usa o layout `(app)` (com sidebar e nav), MAS a sidebar pode ser oculta ou simplificada durante o onboarding. O protótipo mostra tela centralizada sem sidebar.

**Opção recomendada:** Criar um layout dedicado ou usar CSS para ocultar a sidebar na rota `/onboarding`:
- A rota `(app)/onboarding/page.tsx` renderiza dentro do layout existente
- O wizard ocupa a tela inteira (sidebar hidden durante onboarding)
- Ao finalizar, volta ao layout normal com sidebar

### Protótipo — Detalhes Visuais Essenciais

**Cores do protótipo:**
- Primary: `#4F46E5` (indigo-600) — botões primários
- Positive: `#22C55E` (green-500) — check, dots completados
- Positive-bg: `#DCFCE7` — fundo do ícone de check na etapa final
- Positive-text: `#166534` — texto dentro do saldo total
- Background: `#FAFAF9` (stone-50)
- Surface: `#FFFFFF`
- Border: `#E7E5E4` (stone-200)
- Text primary: `#1C1917` (stone-900)
- Text secondary: `#78716C` (stone-500)

**Progress Dots:**
- 8px diâmetro
- Pending: `bg-stone-300`
- Active: `bg-indigo-600`, scale 1.25
- Completed: `bg-green-500`
- Gap entre dots: `gap-2`

**Botões:**
- Primário: `bg-indigo-600 text-white hover:bg-indigo-700` (full width no mobile)
- Ghost: `text-stone-500 hover:text-stone-700`
- Add (dashed): `border-2 border-dashed border-indigo-300 text-indigo-600 hover:border-indigo-500`

**Cards de item (conta/cartão):**
- Border-radius: 12px
- Padding: 16px
- Borda: `1px solid #E7E5E4`
- Hover: `border-color: #D6D3D1`

**Layout geral:**
- Max-width: 480px (mobile) / 800px (desktop, step 4 com grid 2 colunas)
- Centralizado: `mx-auto`
- Padding: `px-4` (mobile) / `px-8` (desktop)

### Categorias Sugeridas — Dados Exatos

```typescript
// src/shared/constants/onboarding-suggestions.ts
export const ONBOARDING_CATEGORY_SUGGESTIONS = [
  {
    name: 'Supermercado',
    classificationName: 'Essenciais',
    budgetCents: 300000, // R$ 3.000
    emoji: '🛒',
  },
  {
    name: 'Moradia',
    classificationName: 'Essenciais',
    budgetCents: 220000, // R$ 2.200
    emoji: '🏠',
  },
  {
    name: 'Gasolina',
    classificationName: 'Essenciais',
    budgetCents: 60000, // R$ 600
    emoji: '⛽',
  },
  {
    name: 'Internet/Telefone',
    classificationName: 'Essenciais',
    budgetCents: 15800, // R$ 158
    emoji: '📱',
  },
  {
    name: 'Educação',
    classificationName: 'Essenciais',
    budgetCents: 280000, // R$ 2.800
    emoji: '🎓',
  },
  {
    name: 'Restaurante',
    classificationName: 'Qualidade de Vida',
    budgetCents: 250000, // R$ 2.500
    emoji: '🍕',
  },
];
```

### Lógica de Retomada de Progresso (AC #11)

O onboarding é **stateless no frontend** — o progresso é determinado pelos dados no banco:

```
Step inicial = 1 (sempre começa no bem-vindo se nunca abriu)

Ao abrir /onboarding:
1. Carrega dados existentes (contas, cartões, categorias)
2. Se já tem contas → pode mostrar step 2 com elas listadas
3. Se já tem cartões → pode mostrar step 3 com eles listados
4. O wizard sempre começa no step 1 (bem-vindo), mas o usuário pode avançar rapidamente pelos steps que já têm dados

Alternativa simplificada: sempre começar do step 1, mas exibir itens já cadastrados em cada step.
```

**Recomendação:** Manter simples — sempre iniciar no step 1, mas cada step carrega e exibe dados existentes. O usuário vê o que já cadastrou e pode adicionar mais ou avançar.

### Infraestrutura Já Pronta (NÃO reimplementar)

- `src/server/infrastructure/audit/audit.service.ts` → `logAudit()` — fail-safe
- `src/server/infrastructure/auth/with-auth.ts` → `withAuth()` — Result Pattern
- `src/server/infrastructure/validation/validate.ts` → `validateInput()` — Zod + Result
- `src/shared/types/result.ts` → `ok()`, `err()` — helpers
- `src/shared/schemas/common.schema.ts` → `idSchema`, `amountCentsSchema`
- `src/server/domain/shared/types/audit-logger.ts` → `AuditLogger` type
- `src/client/utils/currency-input.ts` → `centsToDisplayValue()`, `displayValueToCents()`
- `src/client/components/ui/credit-card-brand-badge.tsx` → badge de bandeira

### Lições Aprendidas das Stories 2.1-2.5

1. **[CRITICAL] `.returning()` obrigatório** em Drizzle UPDATE
2. **[HIGH] Use cases NÃO importam de infrastructure** — DI via `deps`
3. **[HIGH] Server Actions usam factory** — composition root
4. **[HIGH] `listAction` includeArchived: true** — UI mostra toggle
5. **[HIGH] Validar FK antes de criar** — verificar que entidade pai existe e está ativa
6. **[MEDIUM] `loading.tsx` obrigatório** em cada rota
7. **[MEDIUM] Enum labels em constantes** — nunca exibir valor raw na UI
8. **[MEDIUM] Input de valor monetário** — estilo app bancário, `inputMode="numeric"`, conversão via `centsToDisplayValue`/`displayValueToCents`
9. **[HIGH] Botão submit desabilitado** enquanto formulário inválido ou durante submit

### shadcn/ui — Componentes Já Disponíveis

Já instalados: button, input, label, card, dialog, skeleton, sonner (toast), select, badge, tabs, switch, collapsible, sheet, breadcrumb, table.

**Componente novo que pode ser necessário:** Nenhum. O stepper (dots de progresso) é um componente simples customizado, não precisa de shadcn.

### Dependências desta Story

**Depende de (já implementado):**
- Story 1.1-1.7: Infraestrutura base (projeto, banco, auth, auditoria)
- Story 2.1: Contas bancárias — `createBankAccountAction`, `BankAccountForm`
- Story 2.2: Cartões de crédito — `createCreditCardAction`, `CreditCardForm`
- Story 2.4: Categorias — `createCategoryAction`, classificações de essencialidade, seed
- Story 2.5: Método de pagamento padrão por categoria — campo `defaultPaymentMethod` nas categorias

**É dependência de (stories futuras):**
- Story 3.1: Registro de gastos — pré-seleciona método de pagamento configurado no onboarding

### O Que NÃO Fazer Nesta Story

- **NÃO criar** novos schemas Zod para contas/cartões/categorias — reutilizar os existentes
- **NÃO criar** novos server actions para CRUD de contas/cartões/categorias — reutilizar os existentes
- **NÃO implementar** convite de membros — placeholder na etapa 5, implementação completa no Epic 8
- **NÃO implementar** gastos fixos mensais (Etapa 5 do epics original) — gastos recorrentes são Epic 4. A etapa 5 do protótipo é simplificada para "Resumo Final"
- **NÃO implementar** real-time updates durante onboarding
- **NÃO instalar** pacotes novos
- **NÃO criar** `tailwind.config.ts`
- **NÃO usar** floating-point para valores monetários
- **NÃO alterar** tabelas existentes além de adicionar `has_completed_onboarding` em organizations

### NOTA: Etapa 5 do Epics vs. Protótipo

O epics original menciona "Etapa 5: Lista gastos fixos mensais" mas o protótipo (`proto-08-onboarding.html`) implementa isso como resumo final. Gastos recorrentes são Epic 4. O onboarding vai ter **4 etapas de configuração + 1 etapa de resumo = 5 etapas**, conforme protótipo.

### Error Codes Novos

| Código | Mensagem | Quando |
|---|---|---|
| `ONBOARDING_ALREADY_COMPLETED` | Onboarding já foi concluído. | Tentar completar onboarding que já foi feito |
| `ORGANIZATION_NOT_FOUND` | Organização não encontrada. | orgId inválido |

### Project Structure Notes

**Arquivos a criar:**
- `src/server/infrastructure/database/migrations/0010_*.sql` — migration para `has_completed_onboarding`
- `src/server/domain/onboarding/use-cases/check-onboarding-status.ts`
- `src/server/domain/onboarding/use-cases/check-onboarding-status.test.ts`
- `src/server/domain/onboarding/use-cases/complete-onboarding.ts`
- `src/server/domain/onboarding/use-cases/complete-onboarding.test.ts`
- `src/server/domain/onboarding/repositories/onboarding.repository.ts`
- `src/server/infrastructure/database/repositories/onboarding.repository.impl.ts`
- `src/server/actions/onboarding.actions.ts`
- `src/server/factories/onboarding.ts`
- `src/shared/constants/onboarding-suggestions.ts`
- `src/app/(app)/onboarding/page.tsx`
- `src/app/(app)/onboarding/loading.tsx`
- `src/client/components/onboarding/OnboardingWizard.tsx`
- `src/client/components/onboarding/StepIndicator.tsx`
- `src/client/components/onboarding/steps/WelcomeStep.tsx`
- `src/client/components/onboarding/steps/BankAccountsStep.tsx`
- `src/client/components/onboarding/steps/CreditCardsStep.tsx`
- `src/client/components/onboarding/steps/CategoriesStep.tsx`
- `src/client/components/onboarding/steps/CompletionStep.tsx`

**Arquivos a modificar:**
- `src/server/infrastructure/database/schema/auth-schema.ts` — adicionar `hasCompletedOnboarding` na tabela organizations
- `src/app/(app)/layout.tsx` — adicionar check de onboarding e redirect
- `src/server/infrastructure/database/migrations/meta/*` — atualizados automaticamente pelo Drizzle

**Arquivos que NÃO devem ser modificados:**
- Schemas de banco existentes (bank-accounts, credit-cards, categories, essentiality-classifications)
- Server actions existentes (bank-account.actions, credit-card.actions, category.actions)
- Componentes existentes (BankAccountForm, CreditCardForm, CategoryForm)
- `package.json` (nenhum pacote novo)
- `src/app/globals.css` (tokens já estão corretos)
- `next.config.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.6: Onboarding — Setup Inicial Guiado]
- [Source: _bmad-output/planning-artifacts/architecture.md#Clean Architecture + DDD]
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Onboarding]
- [Source: _bmad-output/prototypes/proto-08-onboarding.html]
- [Source: _bmad-output/implementation-artifacts/2-5-configuracao-de-metodo-de-pagamento-padrao-por-categoria.md]
- [Source: _bmad-output/project-context.md]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

Nenhum issue de debug encontrado.

### Completion Notes List

- Campo `has_completed_onboarding` adicionado na tabela `organizations` via migration Drizzle (0010)
- Domain layer criado: use cases `checkOnboardingStatus` e `completeOnboarding` com Result Pattern e DI via deps
- 5 testes unitários para use cases (2 para check, 3 para complete) — todos passando
- Repository interface + implementação Drizzle para onboarding
- Server actions `checkOnboardingStatusAction` e `completeOnboardingAction` protegidas por `withAuth`
- Factory `onboardingDeps` com DI padrão do projeto
- Constantes de categorias sugeridas (`ONBOARDING_CATEGORY_SUGGESTIONS`) com 6 categorias e valores em cents
- Detecção de onboarding no layout `(app)` — redirect para `/onboarding` se `completed === false`
- Rota `/onboarding` em route group `(onboarding)` separado (layout com auth, sem sidebar)
- Page.tsx carrega dados existentes (contas, cartões, categorias, classificações) para retomada de progresso
- Wizard de 5 steps: WelcomeStep, BankAccountsStep, CreditCardsStep, CategoriesStep, CompletionStep
- StepIndicator com dots: pending (stone-300), active (indigo-600 scale 1.25), completed (green-500)
- Steps 2-3 reutilizam `createBankAccountAction` e `createCreditCardAction` diretamente
- Step 4 cria categorias em batch via `createCategoryAction` com sugestões editáveis agrupadas por classificação
- Step 5 exibe resumo (contas, cartões, categorias, saldo total) e completa onboarding via `completeOnboardingAction`
- Botão "Convidar alguém" é placeholder (disabled) para Epic 8
- Botão "Voltar" para navegação entre steps (exceto step 1 e 5)
- Layout visual alinhado ao protótipo proto-08-onboarding.html (cores, espaçamento, tipografia)
- **Build**: compilação sem erros
- **Testes**: 635 testes passando, zero regressões
- **Lint**: 0 erros novos (1 warning pré-existente no design-system)

### File List

**Arquivos criados:**
- `src/server/infrastructure/database/migrations/0010_absent_the_stranger.sql`
- `src/server/infrastructure/database/migrations/meta/_journal.json` (atualizado auto)
- `src/server/infrastructure/database/migrations/meta/0010_snapshot.json` (gerado auto)
- `src/server/domain/onboarding/repositories/onboarding.repository.ts`
- `src/server/domain/onboarding/use-cases/check-onboarding-status.ts`
- `src/server/domain/onboarding/use-cases/check-onboarding-status.test.ts`
- `src/server/domain/onboarding/use-cases/complete-onboarding.ts`
- `src/server/domain/onboarding/use-cases/complete-onboarding.test.ts`
- `src/server/infrastructure/database/repositories/onboarding.repository.impl.ts`
- `src/server/actions/onboarding.actions.ts`
- `src/server/factories/onboarding.ts`
- `src/shared/constants/onboarding-suggestions.ts`
- `src/app/(onboarding)/layout.tsx`
- `src/app/(onboarding)/onboarding/page.tsx`
- `src/app/(onboarding)/onboarding/loading.tsx`
- `src/client/components/onboarding/OnboardingWizard.tsx`
- `src/client/components/onboarding/StepIndicator.tsx`
- `src/client/components/onboarding/steps/WelcomeStep.tsx`
- `src/client/components/onboarding/steps/BankAccountsStep.tsx`
- `src/client/components/onboarding/steps/CreditCardsStep.tsx`
- `src/client/components/onboarding/steps/CategoriesStep.tsx`
- `src/client/components/onboarding/steps/CompletionStep.tsx`

**Arquivos modificados:**
- `src/server/infrastructure/database/schema/organizations.ts` — adicionado campo `hasCompletedOnboarding`
- `src/app/(app)/layout.tsx` — adicionado check de onboarding e redirect

## Change Log

- 2026-03-23: Implementação completa da Story 2.6 — Onboarding setup inicial guiado. Wizard de 5 etapas com detecção de primeiro acesso, persistência via server actions existentes, retomada de progresso e categorias sugeridas.
