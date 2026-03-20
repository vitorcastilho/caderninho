# Story 2.4: Categorias, Subcategorias e Classificações de Essencialidade

Status: ready-for-dev

## Story

As a authenticated user,
I want to organize my expenses into a hierarchical category structure with essentiality classifications,
So that I can budget by category and understand where my money goes.

## Acceptance Criteria

### Classificações de Essencialidade (FR39, FR40)

1. 7 classificações padrão disponíveis na primeira vez: Essenciais, Qualidade de Vida, Investimentos, Proteção, Doações, Impostos e Obrigações, Dívidas (FR39)
2. Pode criar novas classificações personalizadas (FR40)
3. Pode renomear classificações — nome altera, histórico preservado (FR40)
4. Pode mesclar classificações — migra categorias para outra classificação, desativa a original (FR40)
5. Pode arquivar classificações — inativa, histórico preservado, pode reativar (FR40)
6. Classificações nunca são excluídas definitivamente (FR40)
7. Lista mostra classificações ordenadas por `displayOrder`, com contagem de categorias ativas

### Categorias e Subcategorias (FR5, FR38)

8. Pode criar categorias associadas a uma classificação de essencialidade (FR5, FR38)
9. Pode criar subcategorias dentro de categorias (FR38)
10. A mesma subcategoria (nome) pode existir em categorias diferentes (FR38)
11. Pode definir orçamento mensal por categoria — valor fixo OU faixa min-max (FR5)
12. Pode editar nome, classificação e orçamento de qualquer categoria (FR6)
13. Pode editar nome de subcategorias (FR6)
14. Pode arquivar categorias e subcategorias (FR6)
15. Pode reativar categorias e subcategorias arquivadas

### Hierarquia (FR38)

16. Hierarquia de 4 níveis: classificação de essencialidade → categoria → subcategoria → estabelecimento/contexto (FR38)
17. Nota: o 4º nível (estabelecimento) é resolvido nas transações (Epic 3), não nesta story

### Infraestrutura

18. Schemas Drizzle para `essentiality_classifications`, `categories`, `subcategories` com RLS e FK para organizations
19. Schemas Zod correspondentes em `src/shared/schemas/`
20. Server Action + Use Case + Repository seguindo Clean Architecture (mesmo padrão Story 2.1-2.3)
21. Testes unitários escritos antes da implementação (TDD)
22. Valores monetários de orçamento armazenados em centavos (inteiros)
23. Trilha de auditoria registrada para toda mutação (CREATE, UPDATE, ARCHIVE, REACTIVATE, MERGE)

## Tasks / Subtasks

### Módulo: Classificações de Essencialidade

- [ ] Task 1: Criar schema Drizzle para `essentiality_classifications` + migration (AC: #18)
  - [ ] 1.1 Criar `src/server/infrastructure/database/schema/essentiality-classifications.ts`
  - [ ] 1.2 Atualizar `src/server/infrastructure/database/schema/index.ts`
  - [ ] 1.3 Executar `npm run db:generate` + aplicar migration
  - [ ] 1.4 Escrever testes do schema

- [ ] Task 2: Criar schema Zod para classificações (AC: #19)
  - [ ] 2.1 Criar `src/shared/schemas/essentiality-classification.schema.ts`
  - [ ] 2.2 Escrever testes TDD

- [ ] Task 3: Criar repository interface e implementação para classificações (AC: #20)
  - [ ] 3.1 Interface em `src/server/domain/categories/repositories/classification.repository.ts`
  - [ ] 3.2 Implementação em `src/server/infrastructure/database/repositories/classification.repository.impl.ts`
  - [ ] 3.3 Escrever testes TDD

- [ ] Task 4: Criar use cases para classificações (AC: #1-#7, #20, #23)
  - [ ] 4.1 `seed-default-classifications.ts` + `.test.ts` — cria os 7 padrões se não existirem
  - [ ] 4.2 `create-classification.ts` + `.test.ts`
  - [ ] 4.3 `update-classification.ts` + `.test.ts` (renomear)
  - [ ] 4.4 `merge-classifications.ts` + `.test.ts` — migra categorias, arquiva a original
  - [ ] 4.5 `archive-classification.ts` + `.test.ts` — bloquear se tiver categorias ativas
  - [ ] 4.6 `reactivate-classification.ts` + `.test.ts`
  - [ ] 4.7 `list-classifications.ts` + `.test.ts` — incluir contagem de categorias

- [ ] Task 5: Criar factory e Server Actions para classificações (AC: #20)
  - [ ] 5.1 Criar `src/server/factories/category.ts` (factory compartilhada para os 3 repos)
  - [ ] 5.2 Criar `src/server/actions/classification.actions.ts`
  - [ ] 5.3 Escrever testes TDD

### Módulo: Categorias

- [ ] Task 6: Criar schema Drizzle para `categories` + migration (AC: #18, #22)
  - [ ] 6.1 Criar `src/server/infrastructure/database/schema/categories.ts`
  - [ ] 6.2 Atualizar `src/server/infrastructure/database/schema/index.ts`
  - [ ] 6.3 Executar `npm run db:generate` + aplicar migration
  - [ ] 6.4 Escrever testes do schema

- [ ] Task 7: Criar schema Zod para categorias (AC: #19)
  - [ ] 7.1 Criar `src/shared/schemas/category.schema.ts` com `.refine()` para budget (min <= max)
  - [ ] 7.2 Escrever testes TDD

- [ ] Task 8: Criar repository interface e implementação para categorias (AC: #20)
  - [ ] 8.1 Interface em `src/server/domain/categories/repositories/category.repository.ts`
  - [ ] 8.2 Implementação com query para contar categorias por classificação
  - [ ] 8.3 Escrever testes TDD

- [ ] Task 9: Criar use cases para categorias (AC: #8, #11-#14, #20, #23)
  - [ ] 9.1 `create-category.ts` + `.test.ts` — validar que classificação existe e está ativa
  - [ ] 9.2 `update-category.ts` + `.test.ts` — pode mudar classificação (reclassificação)
  - [ ] 9.3 `archive-category.ts` + `.test.ts` — bloquear se tiver subcategorias ativas
  - [ ] 9.4 `reactivate-category.ts` + `.test.ts`
  - [ ] 9.5 `list-categories.ts` + `.test.ts` — filtrar por classificação, incluir subcategorias
  - [ ] 9.6 `get-category.ts` + `.test.ts`

- [ ] Task 10: Criar Server Actions para categorias (AC: #20)
  - [ ] 10.1 Criar `src/server/actions/category.actions.ts`
  - [ ] 10.2 Escrever testes TDD

### Módulo: Subcategorias

- [ ] Task 11: Criar schema Drizzle para `subcategories` + migration (AC: #18)
  - [ ] 11.1 Criar `src/server/infrastructure/database/schema/subcategories.ts`
  - [ ] 11.2 Atualizar `src/server/infrastructure/database/schema/index.ts`
  - [ ] 11.3 Executar `npm run db:generate` + aplicar migration
  - [ ] 11.4 Escrever testes do schema

- [ ] Task 12: Criar schema Zod para subcategorias (AC: #19)
  - [ ] 12.1 Criar `src/shared/schemas/subcategory.schema.ts`
  - [ ] 12.2 Escrever testes TDD

- [ ] Task 13: Criar repository interface e implementação para subcategorias (AC: #20)
  - [ ] 13.1 Interface em `src/server/domain/categories/repositories/subcategory.repository.ts`
  - [ ] 13.2 Implementação
  - [ ] 13.3 Escrever testes TDD

- [ ] Task 14: Criar use cases para subcategorias (AC: #9, #10, #13-#15, #20, #23)
  - [ ] 14.1 `create-subcategory.ts` + `.test.ts` — validar que categoria existe e está ativa
  - [ ] 14.2 `update-subcategory.ts` + `.test.ts`
  - [ ] 14.3 `archive-subcategory.ts` + `.test.ts`
  - [ ] 14.4 `reactivate-subcategory.ts` + `.test.ts`
  - [ ] 14.5 `list-subcategories.ts` + `.test.ts` — filtrar por categoria
  - [ ] 14.6 `get-subcategory.ts` + `.test.ts`

- [ ] Task 15: Criar Server Actions para subcategorias (AC: #20)
  - [ ] 15.1 Criar `src/server/actions/subcategory.actions.ts`
  - [ ] 15.2 Escrever testes TDD

### UI

- [ ] Task 16: Criar componentes de UI para gestão de categorias (AC: #1-#16)
  - [ ] 16.1 Criar página `src/app/(app)/categories/page.tsx` (Server Component)
  - [ ] 16.2 Criar `src/app/(app)/categories/loading.tsx` (Skeleton)
  - [ ] 16.3 Criar `src/client/components/categories/ClassificationSection.tsx` — seção por classificação com accordion
  - [ ] 16.4 Criar `src/client/components/categories/ClassificationForm.tsx` — criar/editar classificação
  - [ ] 16.5 Criar `src/client/components/categories/ClassificationMergeDialog.tsx` — dialog de merge
  - [ ] 16.6 Criar `src/client/components/categories/CategoryForm.tsx` — criar/editar categoria com inputs de orçamento
  - [ ] 16.7 Criar `src/client/components/categories/CategoryCard.tsx` — card de categoria com orçamento e subcategorias
  - [ ] 16.8 Criar `src/client/components/categories/SubcategoryForm.tsx` — criar/editar subcategoria
  - [ ] 16.9 Criar `src/client/components/categories/CategoryTree.tsx` — visão hierárquica completa

- [ ] Task 17: Adicionar link na Sidebar (AC: #16)
  - [ ] 17.1 Adicionar link "Categorias" na Sidebar (ícone Tags ou FolderTree)

- [ ] Task 18: Validação final (AC: #1-#23)
  - [ ] 18.1 `npm run build` — compila sem erros
  - [ ] 18.2 `npm test` — todos passando, zero regressões
  - [ ] 18.3 `npm run lint` — 0 erros novos
  - [ ] 18.4 CRUD completo funcional para os 3 módulos
  - [ ] 18.5 Seed das 7 classificações funcional
  - [ ] 18.6 Merge de classificações funcional
  - [ ] 18.7 Budget fixo e faixa funcionais
  - [ ] 18.8 Auditoria registrada para todas as mutações

## Dev Notes

### ALERTA CRITICO: Seguir Blueprint das Stories 2.1-2.3

As Stories 2.1 (bank accounts), 2.2 (credit cards) e 2.3 (investments + income sources) são o **blueprint completo** para esta story. O padrão de Clean Architecture foi estabelecido e validado em code reviews com R2 approval. Seguir EXATAMENTE o mesmo padrão para os três módulos.

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

Todas as funcionalidades usam dependências já instaladas. NÃO instalar nenhum pacote adicional. shadcn/ui já tem: button, input, label, card, dialog, skeleton, sonner (toast), select, badge, tabs.

Se precisar do componente `accordion` do shadcn para a visualização por classificação: `npx shadcn@latest add accordion` — essa é a única exceção possível de install. Se falhar (shadcn v4 com @base-ui/react), usar Collapsible (já instalado) como fallback.

### ALERTA: Três Entidades, UM Domínio

Esta story cria TRÊS entidades num único domínio `categories`:
1. `essentiality_classifications` — classificações de essencialidade (nível 1 da hierarquia)
2. `categories` — categorias com orçamento (nível 2)
3. `subcategories` — subcategorias (nível 3)

O 4º nível (estabelecimento/contexto) é resolvido na transação (Epic 3), **NÃO nesta story**.

Estrutura do domínio:
```
src/server/domain/categories/
  repositories/
    classification.repository.ts       → Interface
    category.repository.ts             → Interface
    subcategory.repository.ts          → Interface
  use-cases/
    seed-default-classifications.ts + .test.ts
    create-classification.ts + .test.ts
    update-classification.ts + .test.ts
    merge-classifications.ts + .test.ts
    archive-classification.ts + .test.ts
    reactivate-classification.ts + .test.ts
    list-classifications.ts + .test.ts
    create-category.ts + .test.ts
    update-category.ts + .test.ts
    archive-category.ts + .test.ts
    reactivate-category.ts + .test.ts
    list-categories.ts + .test.ts
    get-category.ts + .test.ts
    create-subcategory.ts + .test.ts
    update-subcategory.ts + .test.ts
    archive-subcategory.ts + .test.ts
    reactivate-subcategory.ts + .test.ts
    list-subcategories.ts + .test.ts
    get-subcategory.ts + .test.ts
```

### ALERTA: Schema de Classificações de Essencialidade

| Campo | Tipo DB | Tipo TS | Validação | Notas |
|---|---|---|---|---|
| `id` | text PK | string | uuid | UUID v4 |
| `name` | text notNull | string | min(1), max(100) | Nome da classificação |
| `display_order` | integer notNull | number | int(), min(0) | Ordem de exibição na lista |
| `status` | text notNull default 'active' | 'active' \| 'archived' | — | Soft delete |
| `organization_id` | text FK notNull | string | — | FK para organizations |
| `created_at` | timestamp tz notNull | Date | defaultNow | — |
| `updated_at` | timestamp tz notNull | Date | defaultNow | — |

**7 Classificações Padrão (FR39):**

| # | Nome | Display Order |
|---|---|---|
| 1 | Essenciais | 1 |
| 2 | Qualidade de Vida | 2 |
| 3 | Investimentos | 3 |
| 4 | Proteção | 4 |
| 5 | Doações | 5 |
| 6 | Impostos e Obrigações | 6 |
| 7 | Dívidas | 7 |

**Seed via use case `seed-default-classifications`:**
- Verificar se já existem classificações para a organização
- Se não existirem, criar as 7 padrões em sequência
- Se já existirem (mesmo que 0 ativas — pode ter sido tudo arquivado), NÃO re-seedar
- Chamar no `page.tsx` de categorias (ou via Server Action na carga da página)

### ALERTA: Schema de Categorias

| Campo | Tipo DB | Tipo TS | Validação | Notas |
|---|---|---|---|---|
| `id` | text PK | string | uuid | UUID v4 |
| `name` | text notNull | string | min(1), max(100) | Nome da categoria |
| `classification_id` | text FK notNull | string | uuid | FK para essentiality_classifications |
| `budget_min_cents` | integer | number \| null | int(), min(0), optional | Orçamento mínimo (ou fixo se max=min). Null = sem orçamento |
| `budget_max_cents` | integer | number \| null | int(), min(0), optional | Orçamento máximo (range). Null = orçamento fixo (usa min) |
| `status` | text notNull default 'active' | 'active' \| 'archived' | — | Soft delete |
| `organization_id` | text FK notNull | string | — | FK para organizations |
| `created_at` | timestamp tz notNull | Date | defaultNow | — |
| `updated_at` | timestamp tz notNull | Date | defaultNow | — |

**Modelo de Orçamento:**
- **Sem orçamento:** `budget_min_cents = null`, `budget_max_cents = null`
- **Orçamento fixo:** `budget_min_cents = valor`, `budget_max_cents = null` (ou `budget_max_cents = budget_min_cents`)
- **Orçamento faixa:** `budget_min_cents = min`, `budget_max_cents = max` (onde max > min)

**Validação Zod `.refine()`:**
```typescript
.refine(
  (data) => {
    if (data.budgetMaxCents != null && data.budgetMinCents == null) return false;
    if (data.budgetMaxCents != null && data.budgetMinCents != null && data.budgetMaxCents < data.budgetMinCents) return false;
    return true;
  },
  { message: 'Orçamento máximo deve ser maior ou igual ao mínimo' }
)
```

**CRITICO — Campo `default_payment_method_id`:**
- Este campo será adicionado na **Story 2.5**, NÃO nesta story
- NÃO incluir nenhuma referência a métodos de pagamento no schema de categorias

### ALERTA: Schema de Subcategorias

| Campo | Tipo DB | Tipo TS | Validação | Notas |
|---|---|---|---|---|
| `id` | text PK | string | uuid | UUID v4 |
| `name` | text notNull | string | min(1), max(100) | Nome da subcategoria |
| `category_id` | text FK notNull | string | uuid | FK para categories |
| `status` | text notNull default 'active' | 'active' \| 'archived' | — | Soft delete |
| `organization_id` | text FK notNull | string | — | FK para organizations |
| `created_at` | timestamp tz notNull | Date | defaultNow | — |
| `updated_at` | timestamp tz notNull | Date | defaultNow | — |

**NOTA — Subcategoria duplicada em categorias diferentes (FR38):**
- "A mesma subcategoria pode existir em categorias diferentes" — isso significa que o mesmo NOME pode existir em categorias diferentes. Cada instância é um registro separado na tabela `subcategories` com `category_id` diferente.
- NÃO há restrição de unicidade no nome — apenas em (`name`, `category_id`, `organization_id`) com status `active` para evitar duplicata na MESMA categoria.

### ALERTA: Drizzle Schemas

```typescript
// src/server/infrastructure/database/schema/essentiality-classifications.ts
import { sql } from 'drizzle-orm';
import { pgTable, pgPolicy, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';

export const essentialityClassifications = pgTable('essentiality_classifications', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  displayOrder: integer('display_order').notNull(),
  status: text('status').notNull().default('active'),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, () => [
  pgPolicy('essentiality_classifications_org_isolation', {
    for: 'all',
    using: sql`organization_id = current_setting('app.organization_id', true)`,
  }),
]);
```

```typescript
// src/server/infrastructure/database/schema/categories.ts
import { sql } from 'drizzle-orm';
import { pgTable, pgPolicy, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';
import { essentialityClassifications } from './essentiality-classifications';

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  classificationId: text('classification_id')
    .notNull()
    .references(() => essentialityClassifications.id),
  budgetMinCents: integer('budget_min_cents'),
  budgetMaxCents: integer('budget_max_cents'),
  status: text('status').notNull().default('active'),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, () => [
  pgPolicy('categories_org_isolation', {
    for: 'all',
    using: sql`organization_id = current_setting('app.organization_id', true)`,
  }),
]);
```

```typescript
// src/server/infrastructure/database/schema/subcategories.ts
import { sql } from 'drizzle-orm';
import { pgTable, pgPolicy, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';
import { categories } from './categories';

export const subcategories = pgTable('subcategories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  categoryId: text('category_id')
    .notNull()
    .references(() => categories.id),
  status: text('status').notNull().default('active'),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, () => [
  pgPolicy('subcategories_org_isolation', {
    for: 'all',
    using: sql`organization_id = current_setting('app.organization_id', true)`,
  }),
]);
```

### ALERTA: Use Case Especial — seed-default-classifications

```typescript
const DEFAULT_CLASSIFICATIONS = [
  { name: 'Essenciais', displayOrder: 1 },
  { name: 'Qualidade de Vida', displayOrder: 2 },
  { name: 'Investimentos', displayOrder: 3 },
  { name: 'Proteção', displayOrder: 4 },
  { name: 'Doações', displayOrder: 5 },
  { name: 'Impostos e Obrigações', displayOrder: 6 },
  { name: 'Dívidas', displayOrder: 7 },
] as const;

export async function seedDefaultClassifications(
  deps: { repository: ClassificationRepository; auditLogger: AuditLogger },
  params: { organizationId: string; userId: string },
): Promise<Result<EssentialityClassification[]>> {
  // Verificar se já existem classificações (qualquer status)
  const existing = await deps.repository.countByOrganization(params.organizationId);
  if (existing > 0) {
    // Já seedado — retornar as existentes
    const all = await deps.repository.findAllByOrganization(params.organizationId, true);
    return ok(all);
  }

  // Criar as 7 padrões
  const created: EssentialityClassification[] = [];
  for (const def of DEFAULT_CLASSIFICATIONS) {
    const classification = await deps.repository.create({
      id: crypto.randomUUID(),
      name: def.name,
      displayOrder: def.displayOrder,
      organizationId: params.organizationId,
    });
    created.push(classification);
  }

  // Uma entrada de auditoria para o seed completo
  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'SEED',
    entityType: 'essentiality_classification',
    entityId: 'batch',
    oldValue: null,
    newValue: { count: created.length, names: created.map(c => c.name) },
  });

  return ok(created);
}
```

### ALERTA: Use Case Especial — merge-classifications (FR40)

```typescript
/**
 * Mescla classificação `sourceId` na classificação `targetId`:
 * 1. Migra todas as categorias ativas de source → target
 * 2. Arquiva a classificação source
 *
 * NOTA: No estágio atual (Story 2.4), não existem transações.
 * Quando transações existirem (Epic 3+), as visualizações são
 * baseadas em categoria → classificação, então migrar as categorias
 * já cobre a reclassificação retroativa automaticamente.
 */
export async function mergeClassifications(
  deps: {
    classificationRepository: ClassificationRepository;
    categoryRepository: CategoryRepository;
    auditLogger: AuditLogger;
  },
  params: {
    sourceId: string;
    targetId: string;
    organizationId: string;
    userId: string;
  },
): Promise<Result<{ migratedCount: number }>> {
  // Validar source existe e está ativa
  // Validar target existe e está ativa
  // Validar source !== target
  // Migrar categorias: UPDATE categories SET classification_id = target WHERE classification_id = source
  // Arquivar source
  // Auditoria com detalhes do merge
}
```

**Edge cases do merge:**
- Source e target são a mesma classificação → INVALID_MERGE
- Source não existe → CLASSIFICATION_NOT_FOUND
- Target não existe → CLASSIFICATION_NOT_FOUND
- Source está arquivada → CLASSIFICATION_ALREADY_ARCHIVED
- Target está arquivada → TARGET_CLASSIFICATION_ARCHIVED
- Source sem categorias → merge funciona (só arquiva source)

### ALERTA: Use Case — archive-classification

Ao arquivar uma classificação:
- **Se tiver categorias ativas:** bloquear com erro `CLASSIFICATION_HAS_ACTIVE_CATEGORIES` e mensagem "Esta classificação possui categorias ativas. Mova-as para outra classificação antes de arquivar, ou use a função mesclar."
- **Se tiver apenas categorias arquivadas ou nenhuma:** permitir arquivamento

### ALERTA: Use Case — archive-category

Ao arquivar uma categoria:
- **Se tiver subcategorias ativas:** bloquear com erro `CATEGORY_HAS_ACTIVE_SUBCATEGORIES` e mensagem "Esta categoria possui subcategorias ativas. Arquive-as primeiro ou mova-as para outra categoria."
- **Se tiver apenas subcategorias arquivadas ou nenhuma:** permitir arquivamento

### ALERTA: Input de Orçamento — Padrão Monetário Estabelecido

Reutilizar `centsToDisplayValue` e `displayValueToCents` de `src/client/utils/currency-input.ts`:
- Input com `inputMode="numeric"`, prefixo "R$"
- Dois campos de orçamento: "Mínimo" e "Máximo" (ou só "Valor" quando fixo)
- Toggle ou selector: "Valor fixo" / "Faixa (min-max)"
- Quando fixo: mostrar só 1 input, gravar em `budgetMinCents` (budgetMaxCents = null ou = min)
- Quando faixa: mostrar 2 inputs (min e max)

### ALERTA: Constantes para Labels

```typescript
// src/shared/constants/category.constants.ts
export const DEFAULT_CLASSIFICATION_NAMES = [
  'Essenciais',
  'Qualidade de Vida',
  'Investimentos',
  'Proteção',
  'Doações',
  'Impostos e Obrigações',
  'Dívidas',
] as const;
```

### ALERTA: Use Cases — Dependency Injection

Seguir EXATAMENTE o padrão das Stories 2.1-2.3:

```typescript
// ✅ CORRETO
export async function createCategory(
  deps: { repository: CategoryRepository; classificationRepository: ClassificationRepository; auditLogger: AuditLogger },
  params: CreateCategoryParams,
): Promise<Result<Category>> {
  // Validar que classificação existe e está ativa
  const classification = await deps.classificationRepository.findById(
    params.classificationId,
    params.organizationId,
  );
  if (!classification) {
    return err('CLASSIFICATION_NOT_FOUND', 'Classificação de essencialidade não encontrada.');
  }
  if (classification.status === 'archived') {
    return err('CLASSIFICATION_ARCHIVED', 'Não é possível criar categoria em uma classificação arquivada.');
  }
  // ... criar categoria
}
```

**NOTA:** `createCategory` precisa do `classificationRepository` para validar a FK. Da mesma forma, `createSubcategory` precisa do `categoryRepository`.

### ALERTA: Factory Compartilhada

```typescript
// src/server/factories/category.ts
import { DrizzleClassificationRepository } from '@/server/infrastructure/database/repositories/classification.repository.impl';
import { DrizzleCategoryRepository } from '@/server/infrastructure/database/repositories/category.repository.impl';
import { DrizzleSubcategoryRepository } from '@/server/infrastructure/database/repositories/subcategory.repository.impl';
import { logAudit } from '@/server/infrastructure/audit/audit.service';

const classificationRepository = new DrizzleClassificationRepository();
const categoryRepository = new DrizzleCategoryRepository();
const subcategoryRepository = new DrizzleSubcategoryRepository();

export const classificationDeps = {
  repository: classificationRepository,
  auditLogger: logAudit,
};

export const categoryDeps = {
  repository: categoryRepository,
  classificationRepository,
  auditLogger: logAudit,
};

export const subcategoryDeps = {
  repository: subcategoryRepository,
  categoryRepository,
  auditLogger: logAudit,
};

// Para merge: precisa de ambos os repos
export const mergeDeps = {
  classificationRepository,
  categoryRepository,
  auditLogger: logAudit,
};
```

### ALERTA: Server Actions — Padrão com withAuth

Seguir o mesmo padrão exato de `income-source.actions.ts`:

```typescript
'use server';

import { withAuth } from '@/server/infrastructure/auth/with-auth';
import { validateInput } from '@/server/infrastructure/validation/validate';
import { err } from '@/shared/types/result';

// Helper reutilizável (copiar de income-source.actions.ts)
function getOrganizationId(session: { session: { activeOrganizationId?: string | null } }) {
  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) return null;
  return organizationId;
}
```

**CRITICO**: `listClassificationsAction`, `listCategoriesAction` e `listSubcategoriesAction` DEVEM passar `includeArchived: true`.

### ALERTA: Página de Categorias — Seed na Carga

O `page.tsx` deve chamar o seed de classificações padrão antes de renderizar:

```typescript
// src/app/(app)/categories/page.tsx
export default async function CategoriesPage() {
  // Seed classificações padrão (idempotente — só cria se não existirem)
  await seedDefaultClassificationsAction();

  // Carregar dados
  const classifications = await listClassificationsAction();
  const categories = await listCategoriesAction();
  const subcategories = await listSubcategoriesAction();

  // ... render
}
```

### Error Codes

**Classificações:**

| Código | Mensagem | Quando |
|---|---|---|
| `VALIDATION_ERROR` | Mensagem do Zod em pt-BR | Dados inválidos |
| `UNAUTHORIZED` | Sessão inválida. Faça login novamente. | Sem sessão |
| `NO_ACTIVE_ORGANIZATION` | Nenhuma organização ativa. | Sem activeOrganizationId |
| `CLASSIFICATION_NOT_FOUND` | Classificação não encontrada. | findById retorna null |
| `CLASSIFICATION_ALREADY_ARCHIVED` | Esta classificação já está arquivada. | Tentar arquivar archived |
| `CLASSIFICATION_ALREADY_ACTIVE` | Esta classificação já está ativa. | Tentar reativar active |
| `CLASSIFICATION_HAS_ACTIVE_CATEGORIES` | Esta classificação possui categorias ativas. Mova-as para outra classificação antes de arquivar. | Tentar arquivar com categorias ativas |
| `INVALID_MERGE` | Não é possível mesclar uma classificação consigo mesma. | sourceId === targetId |
| `TARGET_CLASSIFICATION_ARCHIVED` | A classificação de destino está arquivada. | target.status === 'archived' |

**Categorias:**

| Código | Mensagem | Quando |
|---|---|---|
| `CATEGORY_NOT_FOUND` | Categoria não encontrada. | findById retorna null |
| `CATEGORY_ALREADY_ARCHIVED` | Esta categoria já está arquivada. | Tentar arquivar archived |
| `CATEGORY_ALREADY_ACTIVE` | Esta categoria já está ativa. | Tentar reativar active |
| `CATEGORY_HAS_ACTIVE_SUBCATEGORIES` | Esta categoria possui subcategorias ativas. Arquive-as primeiro. | Tentar arquivar com subcategorias ativas |
| `CLASSIFICATION_ARCHIVED` | Não é possível criar categoria em uma classificação arquivada. | Classificação target arquivada |

**Subcategorias:**

| Código | Mensagem | Quando |
|---|---|---|
| `SUBCATEGORY_NOT_FOUND` | Subcategoria não encontrada. | findById retorna null |
| `SUBCATEGORY_ALREADY_ARCHIVED` | Esta subcategoria já está arquivada. | Tentar arquivar archived |
| `SUBCATEGORY_ALREADY_ACTIVE` | Esta subcategoria já está ativa. | Tentar reativar active |
| `CATEGORY_ARCHIVED` | Não é possível criar subcategoria em uma categoria arquivada. | Categoria target arquivada |

### Dependências desta Story

**Depende de (já implementado):**
- Story 1.1: Projeto inicializado com estrutura base
- Story 1.3: Supabase + Drizzle configurado + migrations
- Story 1.4: Better Auth com Organizations (session, activeOrganizationId)
- Story 1.6: logAudit, withAuth, RLS base
- Story 1.7: logger, validateInput, ok/err helpers, common schemas
- Story 2.1: Blueprint de Clean Architecture, factory pattern, AuditLogger interface, formatCurrency, centsToDisplayValue/displayValueToCents
- Story 2.2: Padrão confirmado em code review R2, currency-input.ts
- Story 2.3: Padrão de dois módulos no mesmo domínio, percentage-input utils

**É dependência de (stories futuras):**
- Story 2.5: Configuração de método de pagamento padrão por categoria (adiciona campo na tabela)
- Story 2.6: Onboarding — etapa 3 revisa categorias sugeridas com valores base editáveis
- Story 3.1: Registro de gastos — seleciona categoria, subcategoria
- Story 3.5: Reclassificação retroativa de categorias (muda classificação de uma categoria)
- Story 3.6: Acompanhamento de orçamento por categoria (usa budgetMinCents/budgetMaxCents)
- Story 6.2: Drill-down analítico pela hierarquia completa

### Inteligência da Story 2.3 (Previous Story)

**Infraestrutura já pronta (NÃO reimplementar):**
- `src/server/infrastructure/audit/audit.service.ts` → `logAudit()` — fail-safe
- `src/server/infrastructure/auth/with-auth.ts` → `withAuth()` — Result Pattern
- `src/server/infrastructure/validation/validate.ts` → `validateInput()` — Zod + Result
- `src/shared/types/result.ts` → `ok()`, `err()` — helpers
- `src/server/infrastructure/logging/logger.ts` → `logger.info()`, `.warn()`, `.error()`
- `src/shared/schemas/common.schema.ts` → `idSchema`, `amountCentsSchema`
- `src/server/domain/shared/types/audit-logger.ts` → `AuditLogger` type
- `src/client/utils/format-currency.ts` → `formatCurrency()` — centavos para "R$ X,XX"
- `src/client/utils/currency-input.ts` → `centsToDisplayValue()`, `displayValueToCents()` — input monetário

**Lições aprendidas (Stories 2.1-2.3):**
1. **[CRITICAL] `.returning()` obrigatório** em Drizzle UPDATE
2. **[HIGH] Use cases NÃO importam de infrastructure** — DI via `deps`
3. **[HIGH] Server Actions usam factory** — composition root
4. **[HIGH] `listAction` includeArchived: true** — UI mostra toggle
5. **[MEDIUM] `loading.tsx` obrigatório** em cada rota
6. **[LOW] Import ordering** — External → Shared → Server → Client
7. **[HIGH] Validar FK antes de criar** — verificar que entidade pai existe e está ativa
8. **[MEDIUM] Enum labels em constantes** — nunca exibir valor raw na UI
9. **[HIGH] `lastBalanceUpdate` auto-atualizado** — quando campo dependente muda, atualizar campo de tracking
10. **[MEDIUM] Guards bidirecionais** — validar transições em ambas as direções

### shadcn/ui — Componentes Já Disponíveis

Já instalados: button, input, label, card, dialog, skeleton, sonner (toast), select, badge, tabs, switch, collapsible

Componentes potencialmente necessários:
- **accordion** — para expandir/colapsar classificações na hierarquia. Se não instalado: `npx shadcn@latest add accordion`. Fallback: usar `collapsible` (já instalado).
- **separator** — para separar seções. Já está disponível.

### O Que NÃO Fazer Nesta Story

- **NÃO implementar** método de pagamento padrão por categoria — vem na Story 2.5
- **NÃO implementar** reclassificação retroativa com recálculo de métricas — vem na Story 3.5
- **NÃO implementar** drill-down analítico — vem na Story 6.2
- **NÃO implementar** o 4º nível (estabelecimento/contexto) — vem no Epic 3
- **NÃO implementar** BudgetProgressBar — vem na Story 3.6
- **NÃO usar** floating-point para orçamentos — sempre integer centavos
- **NÃO implementar** exclusão permanente — sempre soft delete (archive)
- **NÃO implementar** real-time updates
- **NÃO instalar** pacotes novos (verificar accordion — é a única exceção possível)
- **NÃO criar** `tailwind.config.ts`
- **NÃO alterar** tabelas existentes (bank_accounts, credit_cards, investments, income_sources, auth tables)

### NOTA: Migrations — Três Tabelas Dependentes

Esta story cria TRÊS tabelas com dependências (FK):
1. `essentiality_classifications` — sem dependência
2. `categories` — FK para `essentiality_classifications`
3. `subcategories` — FK para `categories`

Recomendação: executar `db:generate` após criar cada schema, gerando migrations separadas em ordem.

### UI — Visão Hierárquica

A tela de categorias deve mostrar a hierarquia completa:

```
┌─────────────────────────────────────┐
│ Categorias                     [+]  │
├─────────────────────────────────────┤
│ ▼ Essenciais (3 categorias)    ⚙️   │
│   ├─ Moradia     R$ 2.200      [+] │
│   │  ├─ Aluguel                     │
│   │  └─ Condomínio                  │
│   ├─ Alimentação R$ 2.500-3.000 [+]│
│   │  ├─ Supermercado                │
│   │  └─ Feira                       │
│   └─ Transporte  R$ 800        [+] │
│      └─ Combustível                 │
│                                     │
│ ▼ Qualidade de Vida (2 cat.)   ⚙️   │
│   ├─ Restaurante R$ 1.500      [+] │
│   │  ├─ Fast Food                   │
│   │  └─ Delivery                    │
│   └─ Lazer       R$ 500        [+] │
│                                     │
│ ▶ Investimentos (0 cat.)       ⚙️   │
│ ▶ Proteção (0 cat.)            ⚙️   │
│ ...                                 │
└─────────────────────────────────────┘
```

- [+] ao lado da classificação: adicionar categoria
- [+] ao lado da categoria: adicionar subcategoria
- ⚙️ ao lado da classificação: renomear, mesclar, arquivar
- Tap na categoria: editar (nome, classificação, orçamento)
- Tap na subcategoria: editar (nome)

### Project Structure Notes

**Arquivos a criar — Classificações:**
- `src/server/infrastructure/database/schema/essentiality-classifications.ts`
- `src/server/infrastructure/database/schema/essentiality-classifications.test.ts`
- `src/shared/schemas/essentiality-classification.schema.ts`
- `src/shared/schemas/essentiality-classification.schema.test.ts`
- `src/server/domain/categories/repositories/classification.repository.ts`
- `src/server/infrastructure/database/repositories/classification.repository.impl.ts`
- `src/server/infrastructure/database/repositories/classification.repository.impl.test.ts`
- `src/server/domain/categories/use-cases/seed-default-classifications.ts` + `.test.ts`
- `src/server/domain/categories/use-cases/create-classification.ts` + `.test.ts`
- `src/server/domain/categories/use-cases/update-classification.ts` + `.test.ts`
- `src/server/domain/categories/use-cases/merge-classifications.ts` + `.test.ts`
- `src/server/domain/categories/use-cases/archive-classification.ts` + `.test.ts`
- `src/server/domain/categories/use-cases/reactivate-classification.ts` + `.test.ts`
- `src/server/domain/categories/use-cases/list-classifications.ts` + `.test.ts`
- `src/server/actions/classification.actions.ts`
- `src/server/actions/classification.actions.test.ts`

**Arquivos a criar — Categorias:**
- `src/server/infrastructure/database/schema/categories.ts`
- `src/server/infrastructure/database/schema/categories.test.ts`
- `src/shared/schemas/category.schema.ts`
- `src/shared/schemas/category.schema.test.ts`
- `src/server/domain/categories/repositories/category.repository.ts`
- `src/server/infrastructure/database/repositories/category.repository.impl.ts`
- `src/server/infrastructure/database/repositories/category.repository.impl.test.ts`
- `src/server/domain/categories/use-cases/create-category.ts` + `.test.ts`
- `src/server/domain/categories/use-cases/update-category.ts` + `.test.ts`
- `src/server/domain/categories/use-cases/archive-category.ts` + `.test.ts`
- `src/server/domain/categories/use-cases/reactivate-category.ts` + `.test.ts`
- `src/server/domain/categories/use-cases/list-categories.ts` + `.test.ts`
- `src/server/domain/categories/use-cases/get-category.ts` + `.test.ts`
- `src/server/actions/category.actions.ts`
- `src/server/actions/category.actions.test.ts`

**Arquivos a criar — Subcategorias:**
- `src/server/infrastructure/database/schema/subcategories.ts`
- `src/server/infrastructure/database/schema/subcategories.test.ts`
- `src/shared/schemas/subcategory.schema.ts`
- `src/shared/schemas/subcategory.schema.test.ts`
- `src/server/domain/categories/repositories/subcategory.repository.ts`
- `src/server/infrastructure/database/repositories/subcategory.repository.impl.ts`
- `src/server/infrastructure/database/repositories/subcategory.repository.impl.test.ts`
- `src/server/domain/categories/use-cases/create-subcategory.ts` + `.test.ts`
- `src/server/domain/categories/use-cases/update-subcategory.ts` + `.test.ts`
- `src/server/domain/categories/use-cases/archive-subcategory.ts` + `.test.ts`
- `src/server/domain/categories/use-cases/reactivate-subcategory.ts` + `.test.ts`
- `src/server/domain/categories/use-cases/list-subcategories.ts` + `.test.ts`
- `src/server/domain/categories/use-cases/get-subcategory.ts` + `.test.ts`
- `src/server/actions/subcategory.actions.ts`
- `src/server/actions/subcategory.actions.test.ts`

**Arquivos a criar — Compartilhados:**
- `src/shared/constants/category.constants.ts` (DEFAULT_CLASSIFICATION_NAMES)
- `src/server/factories/category.ts` (factory compartilhada para os 3 repos)

**Arquivos a criar — UI:**
- `src/client/components/categories/ClassificationSection.tsx`
- `src/client/components/categories/ClassificationForm.tsx`
- `src/client/components/categories/ClassificationMergeDialog.tsx`
- `src/client/components/categories/CategoryForm.tsx`
- `src/client/components/categories/CategoryCard.tsx`
- `src/client/components/categories/SubcategoryForm.tsx`
- `src/client/components/categories/CategoryTree.tsx`
- `src/app/(app)/categories/page.tsx`
- `src/app/(app)/categories/loading.tsx`

**Arquivos a modificar:**
- `src/server/infrastructure/database/schema/index.ts` (exports de essentialityClassifications, categories, subcategories)
- `src/client/components/layout/Sidebar.tsx` (link Categorias)

**Arquivos que NÃO devem ser modificados:**
- Schemas existentes (bank-accounts, credit-cards, investments, income-sources, auth)
- `package.json` (nenhum pacote novo, exceto possível accordion)
- `src/app/globals.css`
- `next.config.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.4: Categorias, Subcategorias e Classificações de Essencialidade]
- [Source: _bmad-output/planning-artifacts/prd.md#FR5, FR6, FR38, FR39, FR40]
- [Source: _bmad-output/planning-artifacts/architecture.md#Clean Architecture + DDD]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture — Precisão Financeira]
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Hierarquia 4 Níveis]
- [Source: _bmad-output/project-context.md]
- [Source: _bmad-output/implementation-artifacts/2-3-cadastro-de-investimentos-e-fontes-de-receita.md]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
