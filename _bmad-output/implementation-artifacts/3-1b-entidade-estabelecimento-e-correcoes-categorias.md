# Story 3.1b: Entidade Estabelecimento e Correções de Categorias

Status: review

## Story

As a user,
I want establishments to be proper entities in the category hierarchy (4th level) and payment method defaults to work correctly,
so that my expense registration flow uses accurate pre-configured data and I can manage establishments within categories.

## Acceptance Criteria

1. **Given** o usuário acessa a tela de categorias **When** expande uma subcategoria **Then** vê os estabelecimentos associados a ela como nível 4 da hierarquia, cada um com nome, emoji, badge "auto"/"manual", e contagem de visitas (FR38)

2. **Given** o usuário clica em "+ Estabelecimento" numa subcategoria **When** preenche nome e emoji **Then** o estabelecimento é criado como "manual" e aparece na lista da subcategoria

3. **Given** o usuário edita um estabelecimento **When** altera nome, emoji ou subcategoria **Then** as alterações são salvas e o histórico de transações é preservado

4. **Given** o usuário exclui um estabelecimento **When** confirma a exclusão **Then** o estabelecimento é removido mas o histórico de transações é preservado (transação mantém o nome como texto)

5. **Given** a subcategoria tem método de pagamento padrão configurado como "cartão de crédito" **When** o usuário abre o cascade input e seleciona essa subcategoria **Then** o cartão de crédito correto vem pré-selecionado (hoje falha porque `credit_card` ≠ `credit`)

6. **Given** a subcategoria tem método de pagamento padrão configurado como PIX **When** o usuário abre o cascade input e seleciona essa subcategoria **Then** a conta PIX correta vem pré-selecionada (hoje falha porque PIX ID não tem prefixo `pix-`)

7. **Given** o usuário registra um gasto com um estabelecimento que não existe como entidade **When** a transação é confirmada **Then** o estabelecimento é auto-criado como entidade com source="auto" vinculado à subcategoria (FR14)

8. **Given** o usuário está no passo 4 do cascade input (estabelecimento) **When** seleciona a subcategoria **Then** vê os estabelecimentos cadastrados naquela subcategoria como chips selecionáveis + campo para digitar um novo

## Tasks / Subtasks

### Fase 0: Design System & Protótipos (Obrigatória para stories com UI)

- [x] Task 0: Consultar Design System e protótipos relevantes
  - [x] 0.1: Consultar página `/design-system` (`src/app/design-system/page.tsx`) — tokens, cores, tipografia, espaçamentos
  - [x] 0.2: Verificar protótipos `_bmad-output/prototypes/proto-14-categorias.html` e `_bmad-output/prototypes/categories-ux-v2.html`
  - [x] 0.3: Listar componentes UI existentes em `src/client/components/ui/` que serão reutilizados

### Fase 1: Correções de Mismatch de Tipo de Pagamento (AC: #5, #6)

- [x] Task 1: Unificar tipo de método de pagamento no sistema inteiro
  - [x] 1.1: Alterar `src/shared/constants/category.constants.ts` — mudar `'credit_card'` para `'credit'` no array `PAYMENT_METHOD_TYPES` e no objeto `PAYMENT_METHOD_TYPE_LABELS`
  - [x] 1.2: Atualizar `src/shared/schemas/subcategory.schema.ts` que usa `PAYMENT_METHOD_TYPES` — validar que `z.enum(PAYMENT_METHOD_TYPES)` agora aceita `'credit'` ao invés de `'credit_card'`
  - [x] 1.3: Atualizar `src/client/components/categories/SubcategoryForm.tsx` — select de método de pagamento deve usar `'credit'` como value (não `'credit_card'`)
  - [x] 1.4: Atualizar `src/client/components/categories/CategoryForm.tsx` — mesmo ajuste se usa método de pagamento
  - [x] 1.5: Gerar migration Drizzle para atualizar dados existentes no banco: `UPDATE subcategories SET default_payment_method_type = 'credit' WHERE default_payment_method_type = 'credit_card'`
  - [x] 1.6: Atualizar testes existentes de subcategoria que referenciam `'credit_card'`

- [x] Task 2: Resolver convenção de PIX ID
  - [x] 2.1: Na `src/client/components/transactions/NewExpenseSheet.tsx`, ao construir a lista de `paymentMethods`, PIX usa ID `pix-${acc.id}`. Este é o formato canônico para diferenciar d��bito/PIX da mesma conta
  - [x] 2.2: Na `src/client/components/categories/SubcategoryForm.tsx`, ao salvar método de pagamento PIX, garantir que o ID salvo use o mesmo formato `pix-${bankAccountId}` (hoje salva ID bruto)
  - [x] 2.3: Na `src/client/components/categories/CategoryForm.tsx`, mesmo ajuste
  - [x] 2.4: No cascade input (`src/client/components/ui/cascade-input.tsx`), na função `handleSelectSubcategory`, ao ler `sub.defaultPaymentMethodId` — validar que agora match com o formato `pix-*` quando tipo é PIX
  - [x] 2.5: Gerar migration ou data-fix para subcategories existentes que têm `default_payment_method_type = 'pix'` �� prefixar o ID com `pix-`

### Fase 2: Entidade Estabelecimento — Schema e Backend (AC: #1, #2, #3, #4, #7)

- [x] Task 3: Schema do banco — tabela `establishments`
  - [x] 3.1: Criar schema Drizzle `src/server/infrastructure/database/schema/establishments.ts` com campos:
    - `id` (text PK)
    - `name` (text NOT NULL)
    - `emoji` (text, default '📍')
    - `subcategory_id` (FK subcategories, NOT NULL)
    - `source` (text: 'auto' | 'manual', NOT NULL)
    - `visit_count` (integer, default 0)
    - `last_visit_at` (timestamp with timezone, nullable)
    - `status` (text: 'active' | 'archived', default 'active')
    - `organization_id` (FK organizations, NOT NULL)
    - `created_at`, `updated_at`
  - [x] 3.2: Adicionar RLS policy `establishments_org_isolation`
  - [x] 3.3: Exportar no `schema/index.ts`
  - [x] 3.4: Gerar migration via `npx drizzle-kit generate`
  - [x] 3.5: Criar testes do schema (`establishments.test.ts`)

- [x] Task 4: Schema Zod compartilhado
  - [x] 4.1: Criar `src/shared/schemas/establishment.schema.ts` com:
    - `createEstablishmentSchema` (name, emoji?, subcategoryId)
    - `updateEstablishmentSchema` (name?, emoji?, subcategoryId?)
    - `establishmentIdSchema`
  - [x] 4.2: Criar testes `establishment.schema.test.ts`

- [x] Task 5: Domínio — Repository + Use Cases
  - [x] 5.1: Criar `src/server/domain/establishments/repositories/establishment.repository.ts` — interface EstablishmentRepository com: create, findById, findBySubcategory(subcategoryId, orgId), update, delete, incrementVisitCount(id, orgId)
  - [x] 5.2: Criar use case `create-establishment.ts` — cria com source='manual', valida nome duplicado na mesma subcategoria
  - [x] 5.3: Criar testes `create-establishment.test.ts`
  - [x] 5.4: Criar use case `update-establishment.ts`
  - [x] 5.5: Criar testes `update-establishment.test.ts`
  - [x] 5.6: Criar use case `delete-establishment.ts` — soft delete (status='archived') ou hard delete, preserva transações
  - [x] 5.7: Criar testes `delete-establishment.test.ts`
  - [x] 5.8: Criar use case `list-establishments-by-subcategory.ts`
  - [x] 5.9: Criar testes `list-establishments-by-subcategory.test.ts`
  - [x] 5.10: Criar use case `auto-create-establishment.ts` — chamado após criar transação, cria com source='auto' se não existe, incrementa visit_count se já existe
  - [x] 5.11: Criar testes `auto-create-establishment.test.ts`

- [x] Task 6: Repository Implementation
  - [x] 6.1: Criar `src/server/infrastructure/database/repositories/establishment.repository.impl.ts`

- [x] Task 7: Factory + Server Actions
  - [x] 7.1: Criar `src/server/factories/establishment.ts`
  - [x] 7.2: Criar `src/server/actions/establishment.actions.ts` com: `createEstablishmentAction`, `updateEstablishmentAction`, `deleteEstablishmentAction`, `listEstablishmentsBySubcategoryAction`

### Fase 3: Integração — Auto-criaç��o e Cascade Input (AC: #7, #8)

- [x] Task 8: Auto-criação de estabelecimento ao registrar transação
  - [x] 8.1: Modificar `create-transaction.ts` (ou o fluxo no NewExpenseSheet) para após criar a transação, chamar `auto-create-establishment` se `establishment` (texto) foi fornecido
  - [x] 8.2: Atualizar testes de create-transaction para cobrir auto-criação

- [x] Task 9: Atualizar Cascade Input para usar estabelecimentos como entidade
  - [x] 9.1: Modificar `NewExpenseSheet.tsx` — no `handleSubcategorySelect`, além de buscar sugestões, buscar estabelecimentos cadastrados da subcategoria via `listEstablishmentsBySubcategoryAction`
  - [x] 9.2: Modificar `cascade-input.tsx` — passo 4 agora mostra estabelecimentos como chips selecionáveis (vindos da entidade) + campo "Outro" para digitar nome livre
  - [x] 9.3: Manter backward compatibility — se usuário digita texto livre, funciona igual ao fluxo atual (texto salvo na transação + auto-create da entidade)

### Fase 4: Nível 4 na ��rvore de Categorias (AC: #1, #2, #3, #4)

- [x] Task 10: Expandir CategoryTree com nível Estabelecimento
  - [x] 10.1: Criar componente `src/client/components/categories/EstablishmentRow.tsx` — exibe: emoji, nome, badge source (auto/manual), contagem de visitas, botões editar/excluir
  - [x] 10.2: Criar componente `src/client/components/categories/EstablishmentForm.tsx` — form para criar/editar estabelecimento (nome, emoji)
  - [x] 10.3: Modificar `CategoryTree.tsx` — dentro de cada subcategoria renderizada, mostrar lista de estabelecimentos + botão "+ Estabelecimento"
  - [x] 10.4: No header de cada subcategoria, adicionar badge de contagem de estabelecimentos e badge de método de pagamento padrão (como no proto-14: `<span class="method-badge">VISA Latam Pass</span> 3 estabelecimentos`)
  - [x] 10.5: Carregar estabelecimentos na page (`/categories/page.tsx`) via action e passar para CategoryTree

## Dev Notes

### Contexto do Problema

A Story 3.1 implementou o cascade input com `establishment` como campo texto livre na transação. Porém, o protótipo canônico (proto-14-categorias.html) define uma **hierarquia de 4 níveis**: classificação → categoria → subcategoria → **estabelecimento como entidade**. Além disso, existem 2 bugs técnicos que quebram o fluxo de método de pagamento padrão.

### Bug 1: Mismatch `credit_card` vs `credit`

- `src/shared/constants/category.constants.ts` define `PAYMENT_METHOD_TYPES = ['credit_card', 'debit', 'pix']`
- `src/shared/schemas/transaction.schema.ts` define `paymentMethodType: z.enum(['debit', 'credit', 'pix'])`
- Quando subcategoria tem `defaultPaymentMethodType = 'credit_card'`, o cascade input não consegue fazer match com os métodos que usam `type: 'credit'`
- **Fix**: mudar constants para `'credit'` (alinhar com schema de transação, que é o domínio correto)

### Bug 2: Mismatch PIX ID

- `NewExpenseSheet.tsx:117` cria métodos PIX com `id: 'pix-${acc.id}'`
- `SubcategoryForm.tsx` salva `defaultPaymentMethodId` como ID bruto da conta (sem prefixo)
- Quando cascade input tenta encontrar `methods.find(m => m.id === sub.defaultPaymentMethodId)`, não acha porque o ID da subcategoria é `'bank-123'` mas o método é `'pix-bank-123'`
- **Fix**: SubcategoryForm deve salvar com prefixo `pix-` quando tipo é PIX

### Padrão de Método de Pagamento (Convenção Final)

Após esta story, o padrão será:
- **Débito**: `{ type: 'debit', id: '{bankAccountId}' }` — ID direto da conta
- **PIX**: `{ type: 'pix', id: 'pix-{bankAccountId}' }` — ID com prefixo para diferenciar
- **Crédito**: `{ type: 'credit', id: '{creditCardId}' }` — ID direto do cartão
- `PAYMENT_METHOD_TYPES = ['credit', 'debit', 'pix']` — sem `credit_card`

### Modelo de Dados — Estabelecimento

```
establishments
├── id: text (PK, nanoid)
├── name: text NOT NULL (ex: "Pão de Açúcar")
├── emoji: text DEFAULT '📍'
├── subcategory_id: FK → subcategories NOT NULL
├── source: text ('auto' | 'manual') NOT NULL
├── visit_count: integer DEFAULT 0
├── last_visit_at: timestamp nullable
├── status: text ('active' | 'archived') DEFAULT 'active'
├── organization_id: FK → organizations NOT NULL
├── created_at, updated_at
└── RLS: org_isolation
```

Relação: `subcategory (1) → (N) establishments`

A tabela `transactions` mantém `establishment: text` (campo texto, não FK). Isso permite:
- Backward compatibility com transações existentes
- Usuário pode digitar texto livre (não precisa existir na entidade)
- Auto-criação assíncrona da entidade após transação

### Fluxo de Auto-criação (source="auto")

1. Usuário registra gasto com establishment="Pão de Açúcar" na subcategoria "Supermercado"
2. Transação é criada com `establishment = "Pão de Açúcar"` (texto)
3. Use case `auto-create-establishment` verifica se já existe entidade com mesmo nome na mesma subcategoria
   - Se não existe: cria com `source='auto'`, `visit_count=1`, `last_visit_at=now()`
   - Se existe: incrementa `visit_count` e atualiza `last_visit_at`
4. Na próxima vez que o cascade input abrir na subcategoria "Supermercado", "Pão de Açúcar" aparece como chip selecionável

### Arquitetura — Seguir Padrões Existentes

- Domain: `src/server/domain/establishments/` (mesma estrutura que `categories/` e `transactions/`)
- Repository interface → implementation (Clean Architecture)
- Factory para DI: `src/server/factories/establishment.ts`
- Server actions: `src/server/actions/establishment.actions.ts`
- Result pattern: todos os use cases retornam `Result<T>`
- Testes TDD: mock dos repositories, testar regras de negócio isoladas
- IDs: usar `nanoid()` como nos outros domínios

### Design System & Protótipos

**Protótipos relevantes:**
- `_bmad-output/prototypes/proto-14-categorias.html` — referência canônica para hierarquia de 4 níveis, layout de estabelecimento (emoji 📍, nome, badge auto/manual, visitas, botões edit/delete), badge de método de pagamento na subcategoria, form de edição de estabelecimento
- `_bmad-output/prototypes/categories-ux-v2.html` — referência para estilo visual atualizado da árvore (buttons com texto explícito, badges pill, ações de subcategoria)
- `_bmad-output/prototypes/proto-07-cascade-input.html` — referência para o fluxo do cascade input (passo de estabelecimento)

**Componentes UI existentes a reutilizar:**
- `src/client/components/ui/badge.tsx` — para badges auto/manual e método de pagamento
- `src/client/components/ui/emoji-picker.tsx` — para seleção de emoji do estabelecimento
- `src/client/components/ui/button.tsx` — botões de ação
- `src/client/components/ui/sheet.tsx` — se form de edição usar sheet
- `src/client/components/ui/empty-state.tsx` — estado vazio quando subcategoria não tem estabelecimentos
- `src/client/components/ui/cascade-input.tsx` — componente a ser modificado no passo 4

**Regras visuais obrigatórias:**
- NÃO hardcodar hex — usar tokens Tailwind do Design System
- Seguir padrões de espaçamento e tipografia do proto-14
- Badge de source: "auto" = pill cinza, "manual" = pill azul (seguir proto-14)
- Emoji padrão de estabelecimento: 📍
- Ações de estabelecimento aparecem no hover (seguir padrão subcategory do categories-ux-v2)

### Project Structure Notes

```
src/server/domain/establishments/          # NOVO domínio
├── repositories/
│   └── establishment.repository.ts        # Interface
└── use-cases/
    ├── create-establishment.ts
    ├── create-establishment.test.ts
    ├── auto-create-establishment.ts
    ├── auto-create-establishment.test.ts
    ├── update-establishment.ts
    ├── update-establishment.test.ts
    ├── delete-establishment.ts
    ├── delete-establishment.test.ts
    ├── list-establishments-by-subcategory.ts
    └── list-establishments-by-subcategory.test.ts

src/server/infrastructure/database/
├── schema/
│   ├── establishments.ts                  # NOVO schema Drizzle
│   └── establishments.test.ts             # NOVO
└── repositories/
    └── establishment.repository.impl.ts   # NOVO implementation

src/server/factories/establishment.ts      # NOVO
src/server/actions/establishment.actions.ts # NOVO

src/shared/schemas/
├── establishment.schema.ts                # NOVO
└── establishment.schema.test.ts           # NOVO

src/client/components/categories/
├── EstablishmentRow.tsx                   # NOVO
├── EstablishmentForm.tsx                  # NOVO
├── CategoryTree.tsx                       # MODIFICADO (adicionar nível 4)
└── SubcategoryForm.tsx                    # MODIFICADO (fix PIX ID prefix)

src/shared/constants/category.constants.ts # MODIFICADO (credit_card → credit)
src/client/components/transactions/NewExpenseSheet.tsx # MODIFICADO (integração)
src/client/components/ui/cascade-input.tsx # MODIFICADO (passo 4 usa entidades)
src/app/(app)/categories/page.tsx          # MODIFICADO (carregar establishments)
```

### References

- [Source: _bmad-output/prototypes/proto-14-categorias.html] — hierarquia 4 níveis, forms de estabelecimento, badges auto/manual
- [Source: _bmad-output/planning-artifacts/epics.md#FR38] — "hierarquia de até 4 níveis (classificação → categoria → subcategoria → estabelecimento/contexto)"
- [Source: _bmad-output/planning-artifacts/epics.md#FR14] — "sistema sugere os 5 estabelecimentos mais utilizados por categoria"
- [Source: src/shared/constants/category.constants.ts] — `PAYMENT_METHOD_TYPES` com `credit_card` (bug)
- [Source: src/shared/schemas/transaction.schema.ts] — `paymentMethodType: z.enum(['debit', 'credit', 'pix'])` (correto)
- [Source: src/client/components/transactions/NewExpenseSheet.tsx:117] — PIX com prefixo `pix-`
- [Source: _bmad-output/planning-artifacts/architecture.md] — convenções de naming, Drizzle patterns, Clean Architecture

### Learnings da Story 3.1

- Drizzle migrations: SEMPRE usar `npx drizzle-kit generate`, NUNCA criar .sql manualmente
- PIX usa ID composto `pix-{bankAccountId}` no frontend para diferenciar de débito da mesma conta
- Result pattern obrigatório em todos use cases e server actions
- Testes unitários usam mock dos repositories (vi.fn()), não acessam banco
- `vi.stubGlobal` necessário para localStorage em testes jsdom

### Review Follow-ups (AI) — R1 em 2026-04-04

#### Action items desta story (fix rápidos)

- [x] [AI-Review][MEDIUM] M3: Duplicate delete action no EstablishmentForm — removido botão "Excluir" duplicado do footer, mantida apenas seção AÇÕES com card descritivo. [EstablishmentForm.tsx]
- [x] [AI-Review][MEDIUM] M5: Classificação não mostra emoji — adicionado emoji 📊 antes do nome da classificação, conforme proto-14. [ClassificationSection.tsx]
- [x] [AI-Review][MEDIUM] M6: Badge "N estabelecimentos" truncado para "N estab." — alterado para texto completo "N estabelecimento(s)". [CategoryCard.tsx]

#### Extraído para novas stories

Os seguintes findings foram extraídos para stories dedicadas com escopo menor (decisão de 2026-04-04):

**→ Story 3-1c (CascadeInput Mobile — alinhamento proto-07):** H3, H4, H5, H6, M7, M8, M9, M10, M11
**→ Story 3-1d (Budget Bars na Árvore):** H1, H2, M4
**→ Story 3-1e (Side Sheets e Emoji Picker):** M1, M2

#### LOW (backlog — não blocking)

- [ ] [AI-Review][LOW] L1: Payment method no EstablishmentForm usa two-step selection (tipo + instrumento) vs proto-14 que usa único select direto. Divergência com ganho funcional — aceitar como backlog.
- [x] [AI-Review][LOW] L2: Story Tasks/Subtasks não atualizados — corrigido: todos os tasks/subtasks marcados como [x], Dev Agent Record preenchido.

## Change Log

- **2026-04-04**: Implementação completa da story — Fases 0-4 (entidade estabelecimento, correções credit_card→credit, PIX ID prefix, árvore 4 níveis, cascade input com entidades)
- **2026-04-04**: Code review R1 — 3 MEDIUMs identificados (M3, M5, M6), demais findings extraídos para stories 3-1c/3-1d/3-1e
- **2026-04-04**: Fixes R1 — Resolvidos 3 action items MEDIUM + 1 LOW (L2): removido botão excluir duplicado (M3), adicionado emoji 📊 na classificação (M5), texto completo no badge de estabelecimentos (M6), tasks/subtasks e Dev Agent Record atualizados (L2)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

Nenhum debug necessário nesta sessão de fixes.

### Completion Notes List

- ✅ Resolvido review finding [MEDIUM] M3: Removido botão "Excluir" duplicado do footer do EstablishmentForm — mantida apenas seção AÇÕES com card descritivo e fluxo de confirmação
- ✅ Resolvido review finding [MEDIUM] M5: Adicionado emoji 📊 antes do nome da classificação no header da ClassificationSection, conforme proto-14
- ✅ Resolvido review finding [MEDIUM] M6: Alterado badge de contagem de estabelecimentos de "N estab." para "N estabelecimento(s)" com plural correto
- ✅ Resolvido review finding [LOW] L2: Todos os tasks/subtasks marcados como [x], Dev Agent Record preenchido
- Todos os 861 testes passando (119 arquivos), zero regressões
- Build Next.js compilando sem erros

### File List

**Modificados (fixes R1):**
- `src/client/components/categories/EstablishmentForm.tsx` — removido botão "Excluir" duplicado do footer (M3)
- `src/client/components/categories/ClassificationSection.tsx` — adicionado emoji 📊 no header da classificação (M5)
- `src/client/components/categories/CategoryCard.tsx` — badge de estabelecimentos com texto completo (M6)

**Criados (implementação original):**
- `src/server/infrastructure/database/schema/establishments.ts`
- `src/server/infrastructure/database/schema/establishments.test.ts`
- `src/shared/schemas/establishment.schema.ts`
- `src/shared/schemas/establishment.schema.test.ts`
- `src/server/domain/establishments/repositories/establishment.repository.ts`
- `src/server/domain/establishments/use-cases/create-establishment.ts`
- `src/server/domain/establishments/use-cases/create-establishment.test.ts`
- `src/server/domain/establishments/use-cases/update-establishment.ts`
- `src/server/domain/establishments/use-cases/update-establishment.test.ts`
- `src/server/domain/establishments/use-cases/delete-establishment.ts`
- `src/server/domain/establishments/use-cases/delete-establishment.test.ts`
- `src/server/domain/establishments/use-cases/list-establishments-by-subcategory.ts`
- `src/server/domain/establishments/use-cases/list-establishments-by-subcategory.test.ts`
- `src/server/domain/establishments/use-cases/auto-create-establishment.ts`
- `src/server/domain/establishments/use-cases/auto-create-establishment.test.ts`
- `src/server/infrastructure/database/repositories/establishment.repository.impl.ts`
- `src/server/factories/establishment.ts`
- `src/server/actions/establishment.actions.ts`
- `src/client/components/categories/EstablishmentRow.tsx`
- `src/client/components/categories/EstablishmentForm.tsx`

**Modificados (implementação original):**
- `src/shared/constants/category.constants.ts` — credit_card → credit
- `src/shared/schemas/subcategory.schema.ts`
- `src/client/components/categories/SubcategoryForm.tsx` — PIX ID prefix
- `src/client/components/categories/CategoryForm.tsx` — PIX ID prefix
- `src/client/components/categories/CategoryTree.tsx` — nível 4 estabelecimentos
- `src/client/components/categories/ClassificationSection.tsx` — props de establishments
- `src/client/components/categories/CategoryCard.tsx` — subcategoria com estabelecimentos
- `src/client/components/transactions/NewExpenseSheet.tsx` — auto-criação e cascade input
- `src/client/components/ui/cascade-input.tsx` — chips de estabelecimento
- `src/app/(app)/categories/page.tsx` — carregamento de establishments
- `src/server/infrastructure/database/schema/index.ts` — export establishments
