# Story 2.5.1: Decisões de Produto e Ajustes de Modelo

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a usuário do Caderninho,
I want que as decisões de produto tomadas na retrospectiva do Épico 2 sejam implementadas — override de pagamento por subcategoria, débito como extensão de conta bancária, e logos de bancos —,
so that o modelo de dados e a experiência visual estejam prontos e corretos antes de iniciar o registro de transações (Épico 3).

## Contexto

Esta story implementa 3 decisões de produto documentadas na retrospectiva do Épico 2 (`epic-2-retro-2026-03-24.md`) e no documento de itens para discussão (`itens-para-discussao-pm.md`):

1. **Override de método de pagamento por subcategoria (Opção B)** — Manter o default na categoria como fallback e adicionar override na subcategoria. Hierarquia: subcategoria override → categoria fallback → nenhum.
2. **Débito = conta bancária (Opção B)** — Não criar entidade separada para cartão de débito. O método de pagamento "débito" aponta para a conta bancária. Ajustar labels e copy nas telas.
3. **BankLogo** — Componente de logo de bancos brasileiros com cor institucional e sigla estilizada. Fallback para iniciais genéricas.

**Cadeia de dependência:** Esta é a primeira story do Épico 2.5 e desbloqueia todas as seguintes (2.5.2 → 2.5.3 → ... → 2.5.7).

## Acceptance Criteria

### AC 1: Override de método de pagamento por subcategoria

**Given** o usuário tem categorias com subcategorias cadastradas
**When** edita uma subcategoria
**Then** pode configurar um método de pagamento padrão (cartão de crédito, débito, Pix) específico para aquela subcategoria
**And** se a subcategoria tem override configurado, ele prevalece sobre o default da categoria pai
**And** se a subcategoria NÃO tem override, o default da categoria pai é usado como fallback
**And** se nem subcategoria nem categoria têm default, nenhum método é pré-selecionado
**And** a hierarquia é: subcategoria override → categoria fallback → nenhum

### AC 2: Validação do método de pagamento na subcategoria

**Given** o usuário configura um método de pagamento na subcategoria
**When** o método de pagamento referenciado é arquivado (conta ou cartão)
**Then** a validação rejeita com mensagem de erro clara ("Conta/cartão não encontrado ou arquivado")
**And** a validação segue o mesmo padrão já existente na categoria (use case `create-category.ts` linhas 41-55)

### AC 3: Débito = conta bancária (labels e copy)

**Given** o sistema exibe opções de método de pagamento
**When** o usuário seleciona "Débito"
**Then** as opções de instrumento mostram contas bancárias (não cartões)
**And** o label exibe o formato: "Banco - Nome da conta" (ex: "Itaú - Conta corrente")
**And** em NENHUM lugar do app existe referência a "cartão de débito" como entidade separada
**And** o ajuste é apenas de labels/copy — nenhuma mudança de schema é necessária para este item (já funciona assim no código atual)

### AC 4: Componente BankLogo

**Given** o app exibe contas bancárias (lista, cards, onboarding, seleção de método de pagamento)
**When** o banco é um dos ~15-20 bancos brasileiros mais conhecidos
**Then** exibe badge com cor institucional do banco + sigla estilizada
**And** o tamanho é configurável via prop `size` (sm, md, lg)

**Given** o banco NÃO é reconhecido
**When** o componente renderiza
**Then** exibe fallback com iniciais do nome do banco em fundo neutro

### AC 5: BankLogo integrado nas telas existentes

**Given** o componente BankLogo está implementado
**When** as telas de contas bancárias são renderizadas
**Then** `BankAccountCard` usa `BankLogo` no lugar do texto simples do banco
**And** `BankAccountsStep` (onboarding) usa `BankLogo` no lugar das iniciais cortadas
**And** o padrão visual é análogo ao `CreditCardBrandBadge` já existente para cartões

### AC 6: Testes (TDD)

**Given** as mudanças no backend
**When** os testes são executados
**Then** `create-subcategory.test.ts` cobre: criar subcategoria com/sem override, validar cartão/conta existente, rejeitar cartão/conta arquivado
**And** `update-subcategory.test.ts` cobre: adicionar override, alterar override, remover override (set null)
**And** `BankLogo.test.tsx` cobre: render de bancos conhecidos com cor correta, render de fallback para bancos desconhecidos
**And** testes existentes de categoria continuam passando sem modificação

## Tasks / Subtasks

### Parte 1: Override de Método de Pagamento por Subcategoria (Backend)

- [x] Task 1: Criar migration para adicionar campos à tabela subcategories (AC: #1, #2)
  - [x] 1.1: Adicionar `default_payment_method_type text` à tabela `subcategories`
  - [x] 1.2: Adicionar `default_payment_method_id text` à tabela `subcategories`
  - [x] 1.3: Arquivo: `src/server/infrastructure/database/migrations/0011_*.sql`

- [x] Task 2: Atualizar schema Drizzle da tabela subcategories (AC: #1)
  - [x] 2.1: Adicionar campos `defaultPaymentMethodType` e `defaultPaymentMethodId` em `src/server/infrastructure/database/schema/subcategories.ts`
  - [x] 2.2: Seguir o padrão exato de `categories.ts` (text nullable)

- [x] Task 3: Atualizar schema Zod de subcategoria (AC: #1, #2)
  - [x] 3.1: Adicionar `defaultPaymentMethodType` e `defaultPaymentMethodId` ao `createSubcategorySchema` e `updateSubcategorySchema`
  - [x] 3.2: Adicionar refinement de validação (paymentMethodRefine) — copiar padrão de `category.schema.ts`
  - [x] 3.3: Arquivo: `src/shared/schemas/subcategory.schema.ts`

- [x] Task 4: Atualizar tipo e interface do SubcategoryRepository (AC: #1, #2)
  - [x] 4.1: Adicionar campos `defaultPaymentMethodType` e `defaultPaymentMethodId` ao tipo `Subcategory`
  - [x] 4.2: Atualizar assinatura de `create()` para aceitar payment method params
  - [x] 4.3: Atualizar assinatura de `update()` para aceitar payment method params (atualmente só aceita `{ name: string }`)
  - [x] 4.4: Arquivo: `src/server/domain/categories/repositories/subcategory.repository.ts`

- [x] Task 5: Atualizar implementação DrizzleSubcategoryRepository (AC: #1, #2)
  - [x] 5.1: Passar novos campos no `create()` e `update()`
  - [x] 5.2: Seguir padrão de `category.repository.impl.ts`
  - [x] 5.3: Arquivo: `src/server/infrastructure/database/repositories/subcategory.repository.impl.ts`

- [x] Task 6: Atualizar use cases de subcategoria (AC: #1, #2)
  - [x] 6.1: `create-subcategory.ts` — Adicionar validação de payment method (verificar se cartão/conta existe e não está arquivado)
  - [x] 6.2: `update-subcategory.ts` — Adicionar validação de payment method no update
  - [x] 6.3: Injetar `creditCardRepository` e `bankAccountRepository` nas deps dos use cases (via factory)
  - [x] 6.4: Seguir padrão exato de `create-category.ts` linhas 41-55

- [x] Task 7: Atualizar server actions de subcategoria (AC: #1, #2)
  - [x] 7.1: `subcategory.actions.ts` — Passar campos de payment method do form para o use case
  - [x] 7.2: Seguir padrão de `category.actions.ts`

- [x] Task 8: Escrever testes TDD para as mudanças backend (AC: #6)
  - [x] 8.1: `create-subcategory.test.ts` — Novos cenários: com override, sem override, cartão inválido, conta arquivada
  - [x] 8.2: `update-subcategory.test.ts` — Novos cenários: adicionar, alterar, remover override
  - [x] 8.3: Garantir que testes existentes de categoria continuam passando

### Parte 2: Override de Método de Pagamento por Subcategoria (Frontend)

- [x] Task 9: Atualizar SubcategoryForm com seleção de método de pagamento (AC: #1, #3)
  - [x] 9.1: Adicionar UI de seleção de tipo de pagamento (Select com opções: Nenhum, Cartão de crédito, Débito, Pix)
  - [x] 9.2: Adicionar seletor condicional de instrumento (lista de cartões ou contas conforme tipo)
  - [x] 9.3: Receber props `bankAccounts` e `creditCards` para popular os seletores
  - [x] 9.4: Seguir padrão visual e de interação de `CategoryForm.tsx` (linhas 290-355)
  - [x] 9.5: Arquivo: `src/client/components/categories/SubcategoryForm.tsx`

- [x] Task 10: Passar dados de contas/cartões para SubcategoryForm (AC: #1)
  - [x] 10.1: No componente pai que renderiza SubcategoryForm, buscar e passar listas de contas e cartões ativos
  - [x] 10.2: Verificar se `CategoryCard.tsx` ou `ClassificationSection.tsx` é o pai que monta o dialog de subcategoria

### Parte 3: Componente BankLogo

- [x] Task 11: Criar componente BankLogo (AC: #4)
  - [x] 11.1: Criar `src/client/components/ui/bank-logo.tsx`
  - [x] 11.2: Definir `BANK_MAP` com ~15-20 bancos brasileiros: Nubank, Itaú, Bradesco, BB, Santander, Inter, C6, Caixa, Sicoob, Sicredi, Original, BTG, Safra, PagBank, Neon, Next, Mercado Pago, PicPay
  - [x] 11.3: Cada entrada tem: `color` (cor institucional), `bgColor` (cor de fundo), `label` (sigla curta)
  - [x] 11.4: `resolveBankIdentity(bankName: string)` — match por nome (case-insensitive, parcial)
  - [x] 11.5: Prop `size`: sm (24px), md (32px), lg (40px)
  - [x] 11.6: Fallback: iniciais do nome do banco em fundo `bg-muted`
  - [x] 11.7: Seguir padrão de `CreditCardBrandBadge` (`src/client/components/ui/credit-card-brand-badge.tsx`)

- [x] Task 12: Escrever testes para BankLogo (AC: #6)
  - [x] 12.1: `bank-logo.test.tsx` — render de bancos conhecidos (Nubank, Itaú, etc.)
  - [x] 12.2: Verificar cores corretas por banco
  - [x] 12.3: Verificar fallback para bancos desconhecidos
  - [x] 12.4: Verificar variantes de tamanho

### Parte 4: Integração BankLogo nas Telas Existentes

- [x] Task 13: Integrar BankLogo no BankAccountCard (AC: #5)
  - [x] 13.1: Substituir texto simples `{account.bank}` pelo componente `<BankLogo>`
  - [x] 13.2: Arquivo: `src/client/components/bank-accounts/BankAccountCard.tsx`

- [x] Task 14: Integrar BankLogo no BankAccountsStep do onboarding (AC: #5)
  - [x] 14.1: Substituir `{account.bank.slice(0, 2)}` pelo componente `<BankLogo>`
  - [x] 14.2: Arquivo: `src/client/components/onboarding/steps/BankAccountsStep.tsx`

### Parte 5: Verificação e Labels (Débito = Conta Bancária)

- [x] Task 15: Auditar labels de "débito" no app (AC: #3)
  - [x] 15.1: Buscar todas as referências a "cartão de débito" no código e substituir por "débito" (sem "cartão")
  - [x] 15.2: Verificar que `PAYMENT_METHOD_TYPE_LABELS.debit` já diz "Débito" (e não "Cartão de débito")
  - [x] 15.3: Garantir que a seleção de instrumento para débito mostra contas bancárias (já funciona — apenas confirmar)

### Parte 6: Build e Validação

- [x] Task 16: Rodar todos os testes e build (AC: #6)
  - [x] 16.1: `npx vitest run` — todos os testes passando (97 arquivos, 661 testes)
  - [x] 16.2: `npx next build` — build sem erros
  - [x] 16.3: Verificação visual das telas modificadas

## Dev Notes

### Padrões a seguir (referências no código existente)

| Mudança | Referência no código |
|---------|---------------------|
| Schema Drizzle subcategories | `src/server/infrastructure/database/schema/categories.ts` (campos defaultPaymentMethod*) |
| Schema Zod subcategory | `src/shared/schemas/category.schema.ts` (refinement paymentMethodRefine) |
| Repository interface | `src/server/domain/categories/repositories/category.repository.ts` (tipo + métodos) |
| Repository impl | `src/server/infrastructure/database/repositories/category.repository.impl.ts` |
| Use case validação | `src/server/domain/categories/use-cases/create-category.ts` (linhas 41-55) |
| Server action | `src/server/actions/category.actions.ts` |
| UI seleção de pagamento | `src/client/components/categories/CategoryForm.tsx` (linhas 290-355) |
| BankLogo pattern | `src/client/components/ui/credit-card-brand-badge.tsx` |

### Arquivos de teste existentes que NÃO devem quebrar

- `src/server/domain/categories/use-cases/create-category.test.ts`
- `src/server/domain/categories/use-cases/update-category.test.ts`
- `src/server/domain/categories/use-cases/create-subcategory.test.ts` (será expandido)
- `src/server/domain/categories/use-cases/update-subcategory.test.ts` (será expandido)
- `src/client/components/categories/*.test.tsx` (se existirem)

### Decisão importante: NÃO mudar schema de cartões/contas

A decisão "débito = conta bancária" **NÃO** requer mudança de schema. O código já funciona assim:
- `CategoryForm.tsx` linhas 123-127: quando `paymentType === 'debit'`, mostra contas bancárias
- `PAYMENT_METHOD_TYPE_LABELS.debit` já diz "Débito"
- Apenas verificar se existem labels incorretos em outros lugares

### BankLogo — Bancos e cores de referência

| Banco | Cor Institucional | Sigla |
|-------|------------------|-------|
| Nubank | #820AD1 (roxo) | Nu |
| Itaú | #003399 → #EC7000 (azul/laranja) | Itaú |
| Bradesco | #CC092F (vermelho) | Brad |
| Banco do Brasil | #FFFF00 → #003882 (amarelo/azul) | BB |
| Santander | #CC0000 (vermelho) | San |
| Inter | #FF7A00 (laranja) | Inter |
| C6 Bank | #242424 (preto) | C6 |
| Caixa | #005CA9 (azul) | CEF |
| Sicoob | #003641 (verde escuro) | Sic |
| Sicredi | #33A02C (verde) | Sicr |
| Original | #006400 (verde) | Orig |
| BTG Pactual | #091D42 (navy) | BTG |
| Safra | #003366 (azul escuro) | Safra |
| PagBank | #00A868 (verde) | Pag |
| Neon | #0066FF (azul) | Neon |
| Next | #00E676 (verde claro) | Next |
| Mercado Pago | #009EE3 (azul) | MP |
| PicPay | #21C25E (verde) | Pic |

### Migration: próximo número

O último migration existente deve ser verificado em `src/server/infrastructure/database/migrations/`. Usar o próximo número sequencial (provavelmente `0011`).

### Workaround drizzle-kit migrate

**ATENÇÃO** (documentado na retro): `drizzle-kit migrate` pode travar sem erro. Se isso acontecer:
1. Gerar o SQL com `npx drizzle-kit generate`
2. Aplicar manualmente via `psql` contra o banco local
3. Verificar que a migration foi registrada na tabela `__drizzle_migrations`

### Project Structure Notes

- Alinhamento total com a estrutura unificada do projeto
- Novos arquivos: 1 migration, 1 componente `BankLogo`, 1 teste `BankLogo`
- Arquivos modificados: ~10-12 arquivos existentes (schemas, repos, use cases, actions, forms, cards)
- Nenhum conflito detectado com variances anteriores

### Design System — Consultar ANTES de implementar

- **Página `/design-system`** — seção de Badges, Formulários, Cores/Tokens
- **Protótipos relevantes:**
  - `_bmad-output/prototypes/proto-02-link-account.html` (contas bancárias)
  - `_bmad-output/prototypes/proto-14-categories-ux-v2.html` (categorias/subcategorias)
- **Padrão visual do BankLogo:** Análogo ao `CreditCardBrandBadge` — badge inline com cor + texto

### References

- [Source: _bmad-output/implementation-artifacts/epic-2-retro-2026-03-24.md#Descoberta Significativa] — Definição do Épico 2.5 e Story 2.5.1
- [Source: _bmad-output/itens-para-discussao-pm.md#1] — Override de método de pagamento: Opção B
- [Source: _bmad-output/itens-para-discussao-pm.md#PM-1] — BankLogo: proposta e escopo
- [Source: _bmad-output/itens-para-discussao-pm.md#PM-2] — Débito = conta bancária: Opção B
- [Source: src/server/infrastructure/database/schema/categories.ts] — Schema Drizzle com payment method (referência)
- [Source: src/shared/schemas/category.schema.ts] — Zod schema com refinement (referência)
- [Source: src/server/domain/categories/use-cases/create-category.ts:41-55] — Validação payment method (referência)
- [Source: src/client/components/categories/CategoryForm.tsx:290-355] — UI seleção payment method (referência)
- [Source: src/client/components/ui/credit-card-brand-badge.tsx] — Padrão para BankLogo
- [Source: src/client/components/bank-accounts/BankAccountCard.tsx] — Onde integrar BankLogo
- [Source: src/client/components/onboarding/steps/BankAccountsStep.tsx] — Onde integrar BankLogo (onboarding)
- [Source: _bmad-output/project-context.md] — Regras gerais do projeto (Result Pattern, TDD, Clean Architecture)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

Nenhum problema encontrado durante a implementação.

### Completion Notes List

- ✅ Migration 0011 criada: `default_payment_method_type` e `default_payment_method_id` na tabela `subcategories`
- ✅ Schema Drizzle atualizado seguindo padrão exato de `categories.ts`
- ✅ Schema Zod atualizado com `paymentMethodRefine` e `updatePaymentMethodRefine` (copiado de `category.schema.ts`)
- ✅ Repository interface e implementação atualizados com novos campos em `create()` e `update()`
- ✅ Use cases `create-subcategory` e `update-subcategory` com validação de payment method (padrão `create-category.ts` linhas 41-55)
- ✅ Factory `subcategoryDeps` atualizada com `bankAccountRepository` e `creditCardRepository`
- ✅ Server action `createSubcategoryAction` passando `defaultPaymentMethodType/Id` com coalescência para null
- ✅ `SubcategoryForm` com UI completa de seleção de payment method (Select tipo + Select instrumento condicional)
- ✅ `CategoryTree` passando `bankAccounts` e `creditCards` para `SubcategoryForm` nos dialogs de create e edit
- ✅ Interfaces `Subcategory` atualizadas em `CategoryTree`, `ClassificationSection` e `CategoryCard`
- ✅ Componente `BankLogo` com 18 bancos brasileiros mapeados, fallback por iniciais, prop `size` (sm/md/lg)
- ✅ `BankAccountCard` integrado com `BankLogo` (logo + nome do banco)
- ✅ `BankAccountsStep` (onboarding) integrado com `BankLogo` (substituiu iniciais cortadas)
- ✅ Auditoria de labels: zero referências a "cartão de débito" — `PAYMENT_METHOD_TYPE_LABELS.debit` = "Débito"
- ✅ 661 testes passando (97 arquivos), zero regressões
- ✅ Build Next.js 16.1.6 sem erros
- ✅ Testes expandidos: create-subcategory (11 testes), update-subcategory (9 testes), bank-logo (11 testes)

### Change Log

- 2026-03-24: Implementação completa da Story 2.5.1 — override de payment method por subcategoria, componente BankLogo, integração nas telas existentes, auditoria de labels de débito

### File List

**Novos:**
- `src/server/infrastructure/database/migrations/0011_subcategory_payment_method.sql`
- `src/client/components/ui/bank-logo.tsx`
- `src/client/components/ui/bank-logo.test.tsx`

**Modificados:**
- `src/server/infrastructure/database/schema/subcategories.ts`
- `src/shared/schemas/subcategory.schema.ts`
- `src/server/domain/categories/repositories/subcategory.repository.ts`
- `src/server/infrastructure/database/repositories/subcategory.repository.impl.ts`
- `src/server/domain/categories/use-cases/create-subcategory.ts`
- `src/server/domain/categories/use-cases/create-subcategory.test.ts`
- `src/server/domain/categories/use-cases/update-subcategory.ts`
- `src/server/domain/categories/use-cases/update-subcategory.test.ts`
- `src/server/factories/category.ts`
- `src/server/actions/subcategory.actions.ts`
- `src/client/components/categories/SubcategoryForm.tsx`
- `src/client/components/categories/CategoryTree.tsx`
- `src/client/components/categories/ClassificationSection.tsx`
- `src/client/components/categories/CategoryCard.tsx`
- `src/client/components/bank-accounts/BankAccountCard.tsx`
- `src/client/components/onboarding/steps/BankAccountsStep.tsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
