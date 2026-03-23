# Story 2.5: Configuração de Método de Pagamento Padrão por Categoria

Status: review

## Story

As a authenticated user,
I want to set a default payment method per category,
So that common purchases are registered faster with fewer taps.

## Acceptance Criteria

### Configuração de Método de Pagamento Padrão (FR71)

1. O usuário pode editar uma categoria e configurar um método de pagamento padrão: cartão de crédito, débito ou Pix (FR71)
2. O tipo de pagamento determina o instrumento: cartão de crédito referencia a tabela `credit_cards`, débito e Pix referenciam a tabela `bank_accounts`
3. O método de pagamento padrão é opcional — pode ser `null` (sem padrão)
4. Se tipo e ID forem preenchidos, o instrumento referenciado deve existir e estar ativo na organização
5. Se o instrumento referenciado for arquivado posteriormente, o padrão permanece salvo mas é ignorado na UI de registro de transação (o select volta ao estado "nenhum selecionado") — tratamento no Epic 3
6. A configuração funciona como pré-seleção: quando o usuário selecionar essa categoria ao registrar um gasto (Epic 3), o método de pagamento vem pré-selecionado automaticamente — o usuário só confirma ou altera quando for exceção

### Persistência

7. Campo `default_payment_method_type` (`text`, nullable) na tabela `categories`: valores possíveis `'credit_card'`, `'debit'`, `'pix'`
8. Campo `default_payment_method_id` (`text`, nullable) na tabela `categories`: ID do cartão de crédito ou conta bancária
9. Ambos os campos são `null` juntos ou preenchidos juntos — nunca um sem o outro
10. Sem FK nativa (referência polimórfica) — validação de existência no use case

### Infraestrutura

11. Migration Drizzle para `ALTER TABLE categories` adicionando os 2 campos
12. Schemas Zod atualizados (create + update) com os novos campos e refinamento de consistência
13. Repository, use cases e actions atualizados para propagar os novos campos
14. Validação no backend: verificar que o instrumento referenciado existe e está ativo
15. Trilha de auditoria registra alteração do método de pagamento padrão
16. Testes unitários para todos os novos caminhos (TDD)

### UI

17. Na tela de categorias, o formulário de criar/editar categoria ganha uma nova seção "Método de pagamento padrão"
18. Select de tipo: "Nenhum", "Cartão de crédito", "Débito", "Pix"
19. Quando tipo selecionado, exibe segundo Select com os cartões ou contas disponíveis (ativos)
20. Ao salvar, persiste tipo + ID (ou null + null se "Nenhum")
21. Na lista de categorias (CategoryCard), exibe badge com o nome do método de pagamento padrão configurado (ex: "Latam Pass" ou "Itaú - Débito")

## Tasks / Subtasks

### Módulo: Schema e Migration

- [x] Task 1: Atualizar schema Drizzle `categories` + gerar migration (AC: #7, #8, #11)
  - [x] 1.1 Adicionar `defaultPaymentMethodType` e `defaultPaymentMethodId` em `src/server/infrastructure/database/schema/categories.ts`
  - [x] 1.2 Executar `npm run db:generate` para gerar migration
  - [x] 1.3 Aplicar migration com `npm run db:migrate`
  - [x] 1.4 Atualizar testes do schema

### Módulo: Schemas Zod

- [x] Task 2: Atualizar schemas Zod de categoria (AC: #9, #12)
  - [x] 2.1 Adicionar campos nos schemas `createCategorySchema` e `updateCategorySchema` em `src/shared/schemas/category.schema.ts`
  - [x] 2.2 Adicionar `.refine()` para consistência: ambos null ou ambos preenchidos; se type = credit_card, ID deve ser UUID; se type = debit/pix, ID deve ser UUID
  - [x] 2.3 Atualizar testes TDD em `category.schema.test.ts`

### Módulo: Domain (Repository + Use Cases)

- [x] Task 3: Atualizar repository interface e implementação (AC: #10, #13)
  - [x] 3.1 Adicionar campos no tipo `Category` em `src/server/domain/categories/repositories/category.repository.ts`
  - [x] 3.2 Atualizar assinaturas de `create()` e `update()` para incluir os novos campos
  - [x] 3.3 Atualizar `DrizzleCategoryRepository` em `src/server/infrastructure/database/repositories/category.repository.impl.ts`
  - [x] 3.4 Atualizar testes do repository

- [x] Task 4: Atualizar use case `create-category` (AC: #10, #14, #15, #16)
  - [x] 4.1 Aceitar `defaultPaymentMethodType` e `defaultPaymentMethodId` nos params
  - [x] 4.2 Se preenchidos, validar que o instrumento existe e está ativo (chamar bankAccountRepository ou creditCardRepository via deps)
  - [x] 4.3 Incluir novos campos no audit log
  - [x] 4.4 Atualizar testes TDD

- [x] Task 5: Atualizar use case `update-category` (AC: #10, #14, #15, #16)
  - [x] 5.1 Aceitar `defaultPaymentMethodType` e `defaultPaymentMethodId` nos campos atualizáveis
  - [x] 5.2 Se preenchidos, validar que o instrumento existe e está ativo
  - [x] 5.3 Permitir "limpar" o default passando `null` para ambos
  - [x] 5.4 Incluir novos campos no audit log (oldValue/newValue)
  - [x] 5.5 Atualizar testes TDD

- [x] Task 6: Atualizar factory para injetar novos repositories (AC: #14)
  - [x] 6.1 Importar `DrizzleBankAccountRepository` e `DrizzleCreditCardRepository` em `src/server/factories/category.ts`
  - [x] 6.2 Adicionar `bankAccountRepository` e `creditCardRepository` ao `categoryDeps`
  - [x] 6.3 Ajustar testes se necessário

### Módulo: Server Actions

- [x] Task 7: Atualizar category.actions.ts (AC: #13)
  - [x] 7.1 `createCategoryAction`: os novos campos já passam via spread do `validation.data` — apenas garantir que o schema Zod os inclui
  - [x] 7.2 `updateCategoryAction`: idem
  - [x] 7.3 Atualizar testes se houver

### Módulo: UI

- [x] Task 8: Carregar dados de contas e cartões na página de categorias (AC: #17, #19)
  - [x] 8.1 Atualizar `src/app/(app)/categories/page.tsx` para chamar `listBankAccountsAction` e `listCreditCardsAction`
  - [x] 8.2 Passar contas e cartões como props para `CategoryTree`

- [x] Task 9: Atualizar CategoryForm com seção de método de pagamento (AC: #17-#20)
  - [x] 9.1 Adicionar props `bankAccounts` e `creditCards` ao `CategoryForm`
  - [x] 9.2 Adicionar Select de tipo de pagamento ("Nenhum", "Cartão de crédito", "Débito", "Pix")
  - [x] 9.3 Adicionar Select condicional de instrumento (lista de cartões ou contas, filtrando apenas ativos)
  - [x] 9.4 Gerenciar estado: ao trocar tipo, limpar ID selecionado
  - [x] 9.5 Enviar `defaultPaymentMethodType` e `defaultPaymentMethodId` na action

- [x] Task 10: Exibir badge de método de pagamento no CategoryCard (AC: #21)
  - [x] 10.1 Propagar dados de contas/cartões até `CategoryCard` via props
  - [x] 10.2 Resolver o nome do instrumento a partir do ID
  - [x] 10.3 Exibir badge: tipo + nome (ex: "💳 Latam Pass", "🏦 Itaú - Débito", "📱 Itaú - Pix")

- [x] Task 11: Propagar props em CategoryTree e ClassificationSection (AC: #17)
  - [x] 11.1 Atualizar `CategoryTree.tsx` para receber e propagar `bankAccounts` e `creditCards`
  - [x] 11.2 Atualizar `ClassificationSection.tsx` idem

### Validação Final

- [x] Task 12: Validação final (AC: #1-#21)
  - [x] 12.1 `npm run build` — compila sem erros
  - [x] 12.2 `npm test` — todos passando, zero regressões (94 arquivos, 627 testes)
  - [x] 12.3 `npm run lint` — 0 erros novos
  - [x] 12.4 CRUD de categoria com método de pagamento padrão funcional
  - [x] 12.5 Auditoria registrada para mutações com novos campos
  - [x] 12.6 Validação backend bloqueia instrumento inexistente/arquivado

## Dev Notes

### ALERTA CRITICO: Seguir Blueprint das Stories 2.1-2.4

As Stories anteriores estabeleceram o padrão completo de Clean Architecture. Esta story é uma **extensão incremental** — adiciona campos a uma entidade existente. Seguir EXATAMENTE o mesmo padrão.

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

### CRITICO: Nenhum Pacote Novo Necessário

Todas as funcionalidades usam dependências já instaladas. NÃO instalar nenhum pacote adicional. shadcn/ui já tem: button, input, label, card, dialog, skeleton, sonner (toast), select, badge, tabs, switch, collapsible.

### Modelo de Dados — Referência Polimórfica

O método de pagamento padrão usa referência polimórfica (type + id):

```
default_payment_method_type: 'credit_card' | 'debit' | 'pix' | null
default_payment_method_id: text | null  → ID do credit_card ou bank_account
```

| Type | Referencia | Tabela |
|---|---|---|
| `credit_card` | ID do cartão de crédito | `credit_cards` |
| `debit` | ID da conta bancária | `bank_accounts` |
| `pix` | ID da conta bancária | `bank_accounts` |
| `null` | `null` | — (sem padrão) |

**Por que não FK nativa?** Porque o mesmo campo aponta para duas tabelas diferentes (polimórfico). A validação de existência é feita no use case.

**Invariante:** `type` e `id` são SEMPRE ambos `null` ou ambos preenchidos. Nunca um sem o outro.

### ALERTA: Schema Drizzle — Alteração na Tabela `categories`

```typescript
// src/server/infrastructure/database/schema/categories.ts
// ADICIONAR estes 2 campos à definição existente:

defaultPaymentMethodType: text('default_payment_method_type'),  // 'credit_card' | 'debit' | 'pix' | null
defaultPaymentMethodId: text('default_payment_method_id'),      // UUID do instrumento | null
```

**NÃO** adicionar `.references()` — é polimórfico, a validação é no código.

### ALERTA: Schema Zod — Refinamento de Consistência

```typescript
// Em createCategorySchema e updateCategorySchema:
const paymentMethodTypes = ['credit_card', 'debit', 'pix'] as const;

// Campos adicionais:
defaultPaymentMethodType: z.enum(paymentMethodTypes).nullable().optional(),
defaultPaymentMethodId: idSchema.nullable().optional(),

// Refinamento:
.refine(
  (data) => {
    const hasType = data.defaultPaymentMethodType != null;
    const hasId = data.defaultPaymentMethodId != null;
    return hasType === hasId; // ambos null ou ambos preenchidos
  },
  { message: 'Tipo e instrumento de pagamento devem ser preenchidos juntos' },
)
```

### ALERTA: Validação no Use Case — Verificar Instrumento Existe e Está Ativo

```typescript
// Em create-category.ts e update-category.ts:
if (params.defaultPaymentMethodType && params.defaultPaymentMethodId) {
  if (params.defaultPaymentMethodType === 'credit_card') {
    const card = await deps.creditCardRepository.findById(
      params.defaultPaymentMethodId, params.organizationId
    );
    if (!card) return err('PAYMENT_METHOD_NOT_FOUND', 'Cartão de crédito não encontrado.');
    if (card.status === 'archived') return err('PAYMENT_METHOD_ARCHIVED', 'Este cartão de crédito está arquivado.');
  } else {
    // debit ou pix → bank_account
    const account = await deps.bankAccountRepository.findById(
      params.defaultPaymentMethodId, params.organizationId
    );
    if (!account) return err('PAYMENT_METHOD_NOT_FOUND', 'Conta bancária não encontrada.');
    if (account.status === 'archived') return err('PAYMENT_METHOD_ARCHIVED', 'Esta conta bancária está arquivada.');
  }
}
```

### ALERTA: Factory — Novos Repositories Necessários

```typescript
// src/server/factories/category.ts — ADICIONAR:
import { DrizzleBankAccountRepository } from '@/server/infrastructure/database/repositories/bank-account.repository.impl';
import { DrizzleCreditCardRepository } from '@/server/infrastructure/database/repositories/credit-card.repository.impl';

const bankAccountRepository = new DrizzleBankAccountRepository();
const creditCardRepository = new DrizzleCreditCardRepository();

export const categoryDeps = {
  repository: categoryRepository,
  classificationRepository,
  bankAccountRepository,      // NOVO
  creditCardRepository,        // NOVO
  auditLogger: logAudit,
};
```

### ALERTA: UI — CategoryForm Nova Seção

O `CategoryForm.tsx` deve ganhar uma nova seção após o orçamento:

```
┌─────────────────────────────────────────┐
│ Criar/Editar Categoria                  │
├─────────────────────────────────────────┤
│ Nome: [________________]                │
│ Classificação: [Select ▼]              │
│                                         │
│ Tipo de orçamento: ○ Fixo ○ Faixa      │
│ Valor: R$ [_________]                   │
│                                         │
│ ── Método de pagamento padrão ────────  │
│ Tipo: [Nenhum           ▼]             │
│   → (ao selecionar "Cartão de crédito") │
│ Cartão: [Latam Pass     ▼]             │
│   → (ao selecionar "Débito" ou "Pix")   │
│ Conta: [Itaú            ▼]             │
│                                         │
│              [Cancelar] [Salvar]        │
└─────────────────────────────────────────┘
```

**Comportamento:**
- "Nenhum" selecionado: sem segundo Select, envia null/null
- "Cartão de crédito" selecionado: mostra Select com cartões ativos
- "Débito" selecionado: mostra Select com contas ativas
- "Pix" selecionado: mostra Select com contas ativas
- Ao trocar o tipo: limpa o ID selecionado

### ALERTA: Página de Categorias — Carregar Contas e Cartões

```typescript
// src/app/(app)/categories/page.tsx — ADICIONAR:
import { listBankAccountsAction } from '@/server/actions/bank-account.actions';
import { listCreditCardsAction } from '@/server/actions/credit-card.actions';

export default async function CategoriesPage() {
  // ... seed e loads existentes ...

  // NOVO: carregar instrumentos de pagamento
  const bankAccountsResult = await listBankAccountsAction(undefined);
  const creditCardsResult = await listCreditCardsAction(undefined);

  const bankAccounts = bankAccountsResult.success ? bankAccountsResult.data : [];
  const creditCards = creditCardsResult.success ? creditCardsResult.data : [];

  return (
    <CategoryTree
      classifications={...}
      categories={...}
      subcategories={...}
      bankAccounts={bankAccounts}    // NOVO
      creditCards={creditCards}       // NOVO
    />
  );
}
```

### ALERTA: Badge no CategoryCard

Exibir o método de pagamento padrão como badge:
- Se `defaultPaymentMethodType === 'credit_card'`: `"💳 {nome do cartão}"`
- Se `defaultPaymentMethodType === 'debit'`: `"🏦 {nome do banco} - Débito"`
- Se `defaultPaymentMethodType === 'pix'`: `"📱 {nome do banco} - Pix"`
- Se `null`: não exibir badge

**NOTA:** O badge é informativo. A funcionalidade de pré-seleção automática será implementada na Story 3.1 (Registro de Gastos).

### Error Codes Novos

| Código | Mensagem | Quando |
|---|---|---|
| `PAYMENT_METHOD_NOT_FOUND` | Cartão de crédito não encontrado. / Conta bancária não encontrada. | Instrumento referenciado não existe |
| `PAYMENT_METHOD_ARCHIVED` | Este cartão de crédito está arquivado. / Esta conta bancária está arquivada. | Instrumento referenciado está archived |
| `INVALID_PAYMENT_METHOD` | Tipo e instrumento de pagamento devem ser preenchidos juntos. | type sem id ou id sem type |

### Payment Method Type Constants

```typescript
// src/shared/constants/category.constants.ts — ADICIONAR:
export const PAYMENT_METHOD_TYPES = ['credit_card', 'debit', 'pix'] as const;
export type PaymentMethodType = typeof PAYMENT_METHOD_TYPES[number];

export const PAYMENT_METHOD_TYPE_LABELS: Record<PaymentMethodType, string> = {
  credit_card: 'Cartão de crédito',
  debit: 'Débito',
  pix: 'Pix',
};
```

### Dependências desta Story

**Depende de (já implementado):**
- Story 1.1-1.7: Infraestrutura base (projeto, banco, auth, auditoria, validação)
- Story 2.1: Contas bancárias (tabela `bank_accounts`, repository, actions)
- Story 2.2: Cartões de crédito (tabela `credit_cards`, repository, actions)
- Story 2.4: Categorias (tabela `categories`, repository, use cases, actions, UI) — **base principal**

**É dependência de (stories futuras):**
- Story 2.6: Onboarding — etapa 4 configura pagamento padrão por categoria
- Story 3.1: Registro de gastos — pré-seleciona método de pagamento da categoria

### Inteligência da Story 2.4 (Previous Story)

**Infraestrutura já pronta (NÃO reimplementar):**
- `src/server/infrastructure/audit/audit.service.ts` → `logAudit()` — fail-safe
- `src/server/infrastructure/auth/with-auth.ts` → `withAuth()` — Result Pattern
- `src/server/infrastructure/validation/validate.ts` → `validateInput()` — Zod + Result
- `src/shared/types/result.ts` → `ok()`, `err()` — helpers
- `src/shared/schemas/common.schema.ts` → `idSchema`, `amountCentsSchema`
- `src/server/domain/shared/types/audit-logger.ts` → `AuditLogger` type
- `src/server/factories/category.ts` → factory com repos de classificação, categoria, subcategoria
- `src/client/utils/currency-input.ts` → `centsToDisplayValue()`, `displayValueToCents()`

**Lições aprendidas (Stories 2.1-2.4):**
1. **[CRITICAL] `.returning()` obrigatório** em Drizzle UPDATE
2. **[HIGH] Use cases NÃO importam de infrastructure** — DI via `deps`
3. **[HIGH] Server Actions usam factory** — composition root
4. **[HIGH] `listAction` includeArchived: true** — UI mostra toggle
5. **[HIGH] Validar FK antes de criar** — verificar que entidade pai existe e está ativa
6. **[MEDIUM] `loading.tsx` obrigatório** em cada rota (já existe para categorias)
7. **[MEDIUM] Enum labels em constantes** — nunca exibir valor raw na UI
8. **[MEDIUM] Guards bidirecionais** — validar transições em ambas as direções

### shadcn/ui — Componentes Já Disponíveis

Já instalados: button, input, label, card, dialog, skeleton, sonner (toast), select, badge, tabs, switch, collapsible

**Nenhum componente novo necessário** — o Select existente atende para tipo de pagamento e instrumento.

### O Que NÃO Fazer Nesta Story

- **NÃO implementar** a pré-seleção automática no fluxo de registro de transação — vem na Story 3.1
- **NÃO implementar** invalidação automática quando instrumento é arquivado — tratamento na UI de transação (Epic 3)
- **NÃO implementar** real-time updates
- **NÃO instalar** pacotes novos
- **NÃO criar** `tailwind.config.ts`
- **NÃO alterar** tabelas existentes (bank_accounts, credit_cards, essentiality_classifications, subcategories, auth tables)
- **NÃO usar** floating-point
- **NÃO adicionar** FK nativa para os campos polimórficos — a validação é no código

### NOTA: Escopo Reduzido

Esta é uma story focada e incremental:
- **Backend:** 2 colunas novas + validação no use case
- **Frontend:** 1 seção nova no form + 1 badge no card
- **Estimativa de complexidade:** Baixa-Média (comparada com Story 2.4 que criou 3 módulos inteiros)

### Project Structure Notes

**Arquivos a modificar:**
- `src/server/infrastructure/database/schema/categories.ts` — +2 campos
- `src/shared/schemas/category.schema.ts` — +campos nos schemas create/update + refine
- `src/shared/schemas/category.schema.test.ts` — +testes para novos campos
- `src/server/domain/categories/repositories/category.repository.ts` — +campos no tipo + assinaturas
- `src/server/infrastructure/database/repositories/category.repository.impl.ts` — +campos no create/update
- `src/server/infrastructure/database/repositories/category.repository.impl.test.ts` — +testes
- `src/server/domain/categories/use-cases/create-category.ts` — +validação de payment method
- `src/server/domain/categories/use-cases/create-category.test.ts` — +testes
- `src/server/domain/categories/use-cases/update-category.ts` — +validação de payment method
- `src/server/domain/categories/use-cases/update-category.test.ts` — +testes
- `src/server/factories/category.ts` — +bankAccountRepository, creditCardRepository
- `src/server/actions/category.actions.ts` — campos passam via spread (mudança mínima)
- `src/app/(app)/categories/page.tsx` — +carregar contas e cartões
- `src/client/components/categories/CategoryTree.tsx` — +propagar props
- `src/client/components/categories/ClassificationSection.tsx` — +propagar props
- `src/client/components/categories/CategoryForm.tsx` — +seção de payment method
- `src/client/components/categories/CategoryCard.tsx` — +badge de payment method

**Arquivos a criar:**
- `src/server/infrastructure/database/migrations/0009_*.sql` — migration gerada pelo Drizzle

**Arquivos a modificar (constantes):**
- `src/shared/constants/category.constants.ts` — +PAYMENT_METHOD_TYPES, PAYMENT_METHOD_TYPE_LABELS

**Arquivos que NÃO devem ser modificados:**
- Schemas de banco existentes (bank-accounts, credit-cards, essentiality-classifications, subcategories, auth)
- `package.json` (nenhum pacote novo)
- `src/app/globals.css`
- `next.config.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.5: Configuração de Método de Pagamento Padrão por Categoria]
- [Source: _bmad-output/planning-artifacts/prd.md#FR71]
- [Source: _bmad-output/planning-artifacts/architecture.md#Clean Architecture + DDD]
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Método de pagamento padrão por categoria]
- [Source: _bmad-output/implementation-artifacts/2-4-categorias-subcategorias-e-classificacoes-de-essencialidade.md]
- [Source: _bmad-output/project-context.md]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

Nenhum bloqueio ou debug necessário durante a implementação.

### Completion Notes List

- Adicionados 2 campos (`default_payment_method_type`, `default_payment_method_id`) na tabela `categories` via migration Drizzle
- Constantes `PAYMENT_METHOD_TYPES` e `PAYMENT_METHOD_TYPE_LABELS` criadas em `category.constants.ts`
- Schemas Zod atualizados com validação de consistência (ambos null ou ambos preenchidos) via `.refine()`
- Repository interface e implementação atualizados para propagar os novos campos em `create()` e `update()`
- Use cases `create-category` e `update-category` agora validam existência e status ativo do instrumento referenciado (cartão de crédito ou conta bancária)
- Factory `categoryDeps` recebe `bankAccountRepository` e `creditCardRepository` como novas dependências
- Server actions propagam os novos campos via spread do validation data
- Página de categorias carrega contas bancárias e cartões de crédito em paralelo
- `CategoryForm` ganha nova seção "Método de pagamento padrão" com Select de tipo e Select condicional de instrumento
- `CategoryCard` exibe badge com nome do método de pagamento padrão configurado
- Props propagadas por toda a árvore: `page.tsx` → `CategoryTree` → `ClassificationSection` → `CategoryCard`/`CategoryForm`
- Testes adicionados: 10 novos testes de schema Zod, 7 novos testes de create-category, 5 novos testes de update-category
- Todos os testes existentes atualizados para incluir os novos campos no tipo `Category` (6 arquivos de teste)
- 94 arquivos de teste, 627 testes, todos passando, zero regressões

### Change Log

- 2026-03-23: Implementação completa da Story 2.5 — Configuração de método de pagamento padrão por categoria

### File List

**Criados:**
- `src/server/infrastructure/database/migrations/0009_colossal_speedball.sql`

**Modificados:**
- `src/server/infrastructure/database/schema/categories.ts`
- `src/shared/constants/category.constants.ts`
- `src/shared/schemas/category.schema.ts`
- `src/shared/schemas/category.schema.test.ts`
- `src/server/domain/categories/repositories/category.repository.ts`
- `src/server/infrastructure/database/repositories/category.repository.impl.ts`
- `src/server/infrastructure/database/repositories/category.repository.impl.test.ts`
- `src/server/domain/categories/use-cases/create-category.ts`
- `src/server/domain/categories/use-cases/create-category.test.ts`
- `src/server/domain/categories/use-cases/update-category.ts`
- `src/server/domain/categories/use-cases/update-category.test.ts`
- `src/server/domain/categories/use-cases/archive-category.test.ts`
- `src/server/domain/categories/use-cases/create-subcategory.test.ts`
- `src/server/domain/categories/use-cases/get-category.test.ts`
- `src/server/domain/categories/use-cases/list-categories.test.ts`
- `src/server/domain/categories/use-cases/reactivate-category.test.ts`
- `src/server/factories/category.ts`
- `src/server/actions/category.actions.ts`
- `src/app/(app)/categories/page.tsx`
- `src/client/components/categories/CategoryTree.tsx`
- `src/client/components/categories/ClassificationSection.tsx`
- `src/client/components/categories/CategoryForm.tsx`
- `src/client/components/categories/CategoryCard.tsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/2-5-configuracao-de-metodo-de-pagamento-padrao-por-categoria.md`
