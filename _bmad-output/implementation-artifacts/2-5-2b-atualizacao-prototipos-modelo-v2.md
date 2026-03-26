# Story 2.5.2b: Atualização dos Protótipos para Modelo de Categorização v2

Status: backlog

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a equipe de desenvolvimento do Caderninho,
I want atualizar os protótipos proto-07, proto-08 e proto-15 para refletir o modelo de categorização v2 (4 níveis customizáveis),
so that os protótipos sejam fonte de verdade visual consistente com as decisões de produto aprovadas antes de implementar os épicos 3, 4 e 6.

## Contexto

A Story 2.5.1 aprovou o modelo de categorização v2 (`decisao-modelo-categorizacao-v2.md`), que muda fundamentalmente a hierarquia de categorias:

**Modelo anterior:** Classificação (enum fixo de 4 tipos) → Categoria → Subcategoria
**Modelo v2:** Classificação (customizável) → Categoria → Subcategoria (com método de pagamento) → Estabelecimento (aprendido do uso)

A Seção 6 do documento de decisão lista 5 protótipos impactados. Desses:

| Protótipo | Impacto | Status após Story 2.5.2 |
|-----------|---------|--------------------------|
| proto-14 (Configurações) | Redesign aba Categorias | **FEITO** — AI-14 + AI-15 aplicados |
| proto-09 (Orçamentos) | Treemap multi-nível | **FEITO** — Treemap refatorado com 4 níveis |
| **proto-07 (Cascade input)** | Hierarquia de seleção | **GAP** — AI-5 só tratou Bônus/parcelamento |
| **proto-08 (Onboarding)** | Classificações customizáveis | **GAP** — AI-6/AI-7 só trataram cosmética |
| **proto-15 (Drill-down)** | Hierarquia de 4 níveis | **GAP** — AI-16 só adicionou gráfico de tendência |

Esta story fecha os 3 gaps restantes.

**Cadeia de dependência:** 2.5.1 (done) → 2.5.2 (done) → **2.5.2b** → 2.5.3 → 2.5.4 → 2.5.5 → 2.5.6 → 2.5.7

## Acceptance Criteria

### AC 1: Proto-07 — Cascade Input com Hierarquia de 4 Níveis

**Given** o proto-07 mostra categorias como chips flat (sem hierarquia) no Estado 2
**When** o protótipo é atualizado para o modelo v2
**Then** o Estado 2 mostra classificações como tabs/pills horizontais no topo (Essenciais fixos, Essenciais variáveis, Qualidade de vida, etc.)
**And** abaixo das tabs, as categorias da classificação selecionada aparecem como chips (emoji + nome)
**And** a classificação "Essenciais variáveis" vem pré-selecionada (mais frequente) com suas categorias visíveis: 🍽 Alimentação, 🚗 Transporte
**And** as categorias usam os dados reais do PO (seção 4 do documento de decisão)
**And** ao selecionar uma categoria, se ela tiver subcategorias, um novo passo intermediário (Estado 2b) mostra as subcategorias como chips
**And** o Estado 2b mostra subcategorias com badge de método sugerido (ex: "Supermercado [VISA Latam Pass]")
**And** o fluxo total continua ≤ 5 toques (classificação é 1 toque, categoria é 1 toque, subcategoria é 1 toque = 3 toques no Estado 2, compatível com o target de ~5s)

**Given** o Estado 3a mostra "Onde?" com chips de estabelecimento
**When** o protótipo é atualizado
**Then** os estabelecimentos sugeridos correspondem à subcategoria selecionada (não mais à categoria)
**And** ex: se subcategoria = "Supermercado", os chips são: Pão de Açúcar, Bistek, Angeloni, + Outro
**And** ex: se subcategoria = "Fast Food", os chips são: McDonald's, Burger King, Subway, + Outro
**And** o método de pagamento é pré-selecionado seguindo a prioridade do modelo v2:
1. Estabelecimento tem padrão aprendido? → Sugere método do estabelecimento
2. Estabelecimento novo? → Sugere método da subcategoria
3. Sem método definido? → Usuário escolhe manualmente

**Given** o desktop (Side Sheet 400px) mostra todos os campos de uma vez
**When** o protótipo desktop é atualizado
**Then** o campo de categoria mostra um dropdown agrupado por classificação (optgroup) ou 2 selects encadeados (classificação → categoria)
**And** um select/chips de subcategoria aparece condicionalmente quando a categoria tem subcategorias
**And** os estabelecimentos sugeridos filtram pela subcategoria selecionada

### AC 2: Proto-08 — Onboarding com Classificações Customizáveis

**Given** a Etapa 4 do proto-08 mostra 2 grupos fixos (Essenciais, Qualidade de Vida) com categorias flat
**When** o protótipo é atualizado para o modelo v2
**Then** a Etapa 4 mostra as 6 classificações do PO como seções colapsáveis:

| Classificação | Emoji | Orçamento | Categorias incluídas |
|--------------|-------|-----------|---------------------|
| Essenciais fixos | 📊 | R$ 6.000,00 | Moradia (R$ 4.000,00), Assinaturas (R$ 200,00) |
| Essenciais variáveis | 📊 | R$ 8.000,00 | Alimentação (R$ 5.500,00), Transporte (R$ 1.500,00) |
| Qualidade de vida | 📊 | R$ 4.000,00 | Restaurante (R$ 2.000,00), Viagem (R$ 2.000,00) |
| Investimentos | 📊 | — | Educação (R$ 2.800,00) |
| Proteção | 📊 | — | Seguros (R$ 500,00) |
| Imprevistos | 📊 | R$ 1.000,00 | (sem categorias pré-definidas) |

**And** cada seção de classificação tem: nome editável, emoji editável, orçamento editável (opcional), botão ×/remover
**And** dentro de cada classificação, as categorias mostram: emoji, nome, orçamento (editável), e um indicador de subcategorias (ex: "3 subcategorias")
**And** subcategorias NÃO precisam ser detalhadas no onboarding (simplificação — configuração detalhada fica no proto-14 Settings)
**And** um botão "+ Adicionar classificação" aparece após a última seção
**And** o subtítulo muda de "Sugerimos categorias com base nos mais comuns" para "Configure suas classificações e categorias. Você pode personalizar tudo depois."

**Given** o texto introdutório implica classificações fixas
**When** o protótipo é atualizado
**Then** o texto deixa claro que classificações são customizáveis: "Organize seus gastos em classificações — crie quantas quiser"

**Given** o método de pagamento aparece em cada categoria na Etapa 4
**When** o protótipo é atualizado para o modelo v2
**Then** o método de pagamento é REMOVIDO do nível de categoria (no modelo v2, método fica na subcategoria)
**And** no onboarding, o usuário configura apenas: classificação → categoria → orçamento
**And** configuração de subcategorias e métodos é encaminhada para Settings (proto-14)

**Given** as mesmas mudanças se aplicam ao layout desktop
**When** o desktop é atualizado
**Then** o desktop reflete a mesma estrutura (classificações como seções, categorias dentro, sem método)

### AC 3: Proto-15 — Drill-down com Dados do Modelo v2

**Given** o proto-15 usa 3 classificações genéricas (Essencial, Qualidade de Vida, Não Essencial) que não correspondem ao modelo v2
**When** o protótipo é atualizado
**Then** o Nível 2 (Essencialidade) mostra as 6 classificações do PO com dados consistentes com o proto-09 (treemap):

| Classificação | Valor | % |
|--------------|-------|---|
| Essenciais fixos | R$ 3.581,00 | 24,69% |
| Essenciais variáveis | R$ 5.085,00 | 35,06% |
| Qualidade de vida | R$ 2.350,00 | 16,20% |
| Investimentos | R$ 2.680,00 | 18,48% |
| Proteção | R$ 480,00 | 3,31% |
| Imprevistos | R$ 350,00 | 2,41% |
| **Total** | **R$ 14.526,00** | **100,00%** |

**And** o Nível 3 (Categorias) mostra categorias correspondentes à classificação selecionada, com os mesmos dados do proto-09
**And** o Nível 4 (Subcategorias/Estabelecimentos) mostra subcategorias com estabelecimentos expandíveis, com os mesmos dados do proto-09
**And** os dados são matematicamente consistentes entre proto-09 e proto-15 (mesmos totais, mesmas categorias, mesmos valores)

**Given** o mobile storyboard do proto-15 mostra 4 frames progressivos
**When** os dados são atualizados
**Then** Frame 2 (Essencialidade) mostra as 6 classificações com barras proporcionais
**And** Frame 3 (Categorias dentro de Qualidade de Vida) mostra: Restaurante (R$ 2.000,00) e Viagem (R$ 350,00) — dados do proto-09
**And** Frame 4 (Subcategorias + Estabelecimentos dentro de Restaurante) mostra: Fast Food, Delivery, Jantar fora — com estabelecimentos expandidos

**Given** o desktop (side panel) tem uma árvore interativa
**When** os dados são atualizados
**Then** a árvore reflete a hierarquia completa de 4 níveis com os mesmos dados
**And** o breadcrumb mostra a navegação: Gastos do Mês › [Classificação] › [Categoria] › [Subcategoria]

### AC 4: Consistência de Dados Cross-Prototype

**Given** os protótipos 07, 08, 09, 14 e 15 todos referenciam categorias/classificações
**When** todos estão atualizados
**Then** as mesmas 6 classificações aparecem em todos (nomes e emojis idênticos)
**And** as mesmas categorias aparecem dentro de cada classificação (nomes e emojis idênticos)
**And** os valores de orçamento em proto-08 e proto-14 são consistentes com os dados de gasto realizado em proto-09 e proto-15
**And** os estabelecimentos que aparecem em proto-07 (sugestões) são os mesmos que aparecem em proto-15 (drill-down nível 4)

## Tasks / Subtasks

### Parte 1: Proto-07 — Cascade Input com Hierarquia

- [ ] Task 1: Atualizar Estado 2 mobile com classificações e categorias (AC: #1)
  - [ ] 1.1: Adicionar pills horizontais de classificação no topo do Estado 2
  - [ ] 1.2: Reorganizar chips de categoria para filtrar pela classificação selecionada
  - [ ] 1.3: Criar Estado 2b com subcategorias (entre Estado 2 e Estado 3a)
  - [ ] 1.4: Atualizar step-indicator para refletir novo passo (ou manter 4 dots se 2+2b contam como 1)

- [ ] Task 2: Atualizar Estado 3a mobile com estabelecimentos por subcategoria (AC: #1)
  - [ ] 2.1: Trocar chips de estabelecimento genéricos por dados específicos da subcategoria selecionada
  - [ ] 2.2: Atualizar método de pagamento pré-selecionado para seguir a prioridade v2

- [ ] Task 3: Atualizar desktop Side Sheet (AC: #1)
  - [ ] 3.1: Adicionar select/optgroup de classificação → categoria
  - [ ] 3.2: Adicionar campo de subcategoria condicional
  - [ ] 3.3: Atualizar sugestões de estabelecimento

### Parte 2: Proto-08 — Onboarding Classificações Customizáveis

- [ ] Task 4: Redesign da Etapa 4 mobile (AC: #2)
  - [ ] 4.1: Substituir 2 grupos fixos por 6 classificações colapsáveis do PO
  - [ ] 4.2: Adicionar campos de nome/emoji/orçamento editáveis por classificação
  - [ ] 4.3: Remover select de método de pagamento das categorias
  - [ ] 4.4: Adicionar indicador de subcategorias (contagem) em cada categoria
  - [ ] 4.5: Adicionar botão "+ Adicionar classificação"
  - [ ] 4.6: Atualizar textos introdutórios para refletir customizabilidade

- [ ] Task 5: Redesign da Etapa 4 desktop (AC: #2)
  - [ ] 5.1: Aplicar mesma estrutura do mobile no layout desktop
  - [ ] 5.2: Remover badges de método das categorias desktop

### Parte 3: Proto-15 — Drill-down com Dados v2

- [ ] Task 6: Atualizar dados do Nível 2 — Classificações (AC: #3)
  - [ ] 6.1: Substituir 3 classificações genéricas por 6 classificações do PO
  - [ ] 6.2: Atualizar valores e percentuais para corresponder ao proto-09

- [ ] Task 7: Atualizar dados dos Níveis 3 e 4 (AC: #3)
  - [ ] 7.1: Atualizar categorias dentro de cada classificação
  - [ ] 7.2: Atualizar subcategorias e estabelecimentos
  - [ ] 7.3: Garantir que dados do drill-down Qualidade de Vida → Restaurante → Fast Food correspondem ao proto-09

- [ ] Task 8: Atualizar mobile storyboard frames (AC: #3)
  - [ ] 8.1: Redesign Frame 2 com 6 classificações
  - [ ] 8.2: Atualizar Frame 3 e Frame 4 com dados v2

- [ ] Task 9: Atualizar desktop side panel (AC: #3)
  - [ ] 9.1: Atualizar árvore interativa com hierarquia completa de 4 níveis
  - [ ] 9.2: Atualizar breadcrumbs

### Parte 4: Validação Cross-Prototype

- [ ] Task 10: Validar consistência de dados entre protótipos (AC: #4)
  - [ ] 10.1: Verificar que as 6 classificações são idênticas em proto-07, 08, 09, 14, 15
  - [ ] 10.2: Verificar que categorias dentro de cada classificação são idênticas
  - [ ] 10.3: Verificar que estabelecimentos em proto-07 correspondem aos de proto-15
  - [ ] 10.4: Verificar consistência matemática dos valores entre proto-09 e proto-15

## Dev Notes

### Natureza da Story: UX/Design — Não é Código de Produção

Assim como a Story 2.5.2, esta story é **primariamente UX/Design**. O output são protótipos HTML corrigidos em `_bmad-output/prototypes/`. **NÃO** envolve mudanças no código de produção (src/).

### Dados de Referência Canônicos (Seção 4 do Documento de Decisão)

Todos os protótipos devem usar os mesmos dados do PO:

```
📊 Essenciais fixos [R$ 6.000,00]
  🏠 Moradia [R$ 4.000,00]
    ├─ Aluguel [R$ 2.200,00] [Débito Itaú]
    ├─ Condomínio [R$ 800,00] [Débito Itaú]
    ├─ Luz [Débito Itaú]
    └─ Internet [R$ 158,00] [PDA Visa]
  📱 Assinaturas [R$ 200,00]
    ├─ Streaming [Latam Pass Visa]
    └─ Apps [Latam Pass Visa]

📊 Essenciais variáveis [R$ 8.000,00]
  🍽 Alimentação [R$ 5.500,00]
    ├─ Supermercado [R$ 3.000,00] [Latam Pass Visa]
    │    └─ Pão de Açúcar, Bistek, Angeloni...
    ├─ Restaurante trabalho [R$ 1.500,00] [PDA Visa]
    │    └─ Da Terra, Frango e Fritas...
    └─ Feira/Hortifruti [R$ 500,00] [Latam Pass Visa]
         └─ Feira do bairro...
  🚗 Transporte [R$ 1.500,00]
    ├─ Gasolina [R$ 600,00] [Latam Pass Visa]
    ├─ Estacionamento [R$ 300,00] [PDA Visa]
    ├─ Pedágio [R$ 200,00] [Débito Itaú - ConectCar]
    └─ Manutenção [R$ 400,00] [PDA Visa]

📊 Qualidade de vida [R$ 4.000,00]
  🍔 Restaurante [R$ 2.000,00]
    ├─ Fast Food [R$ 500,00] [PDA Visa]
    │    └─ McDonald's, Burger King, Subway...
    ├─ Delivery [R$ 800,00] [PDA Visa]
    │    └─ iFood, Rappi...
    └─ Jantar fora [R$ 700,00] [PDA Visa]
         └─ Outback, Cantina Italiana...
  ✈️ Viagem [R$ 2.000,00]
    ├─ Hospedagem [Latam Pass Visa]
    ├─ Alimentação viagem [PDA Visa]
    ├─ Transporte viagem [Latam Pass Visa]
    └─ Passeios [PDA Visa]

📊 Investimentos
  📈 Educação [R$ 2.800,00]
    ├─ Cursos [Débito Itaú]
    └─ Livros [Latam Pass Visa]

📊 Proteção
  🛡 Seguros [R$ 500,00]
    ├─ Seguro carro [Débito Itaú]
    └─ Plano saúde [Boleto]

📊 Imprevistos [R$ 1.000,00]
  (sem categorias pré-definidas)
```

### Prioridade de Método de Pagamento (para proto-07)

```
1. Estabelecimento tem padrão aprendido?  → Sugere o método do estabelecimento
2. Estabelecimento novo (sem padrão)?     → Sugere o método da subcategoria
3. Sem subcategoria com método definido?  → Usuário escolhe manualmente
```

### Dados de Gasto Realizado para Proto-09/Proto-15

O proto-09 já foi refatorado com dados de gasto realizado vs. orçamento. Os dados do proto-15 DEVEM corresponder ao proto-09:

| Classificação | Gasto realizado | Orçamento |
|--------------|----------------|-----------|
| Essenciais fixos | R$ 3.581,00 | R$ 6.000,00 |
| Essenciais variáveis | R$ 5.085,00 | R$ 8.000,00 |
| Qualidade de vida | R$ 2.350,00 | R$ 4.000,00 |
| Investimentos | R$ 2.680,00 | R$ 2.800,00 |
| Proteção | R$ 480,00 | R$ 500,00 |
| Imprevistos | R$ 350,00 | R$ 1.000,00 |
| **Total** | **R$ 14.526,00** | **R$ 22.300,00** |

### UX: Proto-07 Deve Continuar Rápido

O cascade input tem target de ~5 segundos / ≤ 5 toques. A adição de classificação + subcategoria NÃO deve criar estados extras obrigatórios. Abordagem recomendada:

**Mobile:**
- Estado 2: Pills de classificação no topo (1 toque) + chips de categorias filtradas (1 toque) → transiciona para Estado 2b
- Estado 2b: Chips de subcategoria (1 toque) → transiciona para Estado 3
- Total: 3 toques para classificação + categoria + subcategoria = dentro do budget

**Desktop:**
- Selects encadeados num único painel (classificação → categoria → subcategoria em 3 dropdowns)
- Ou: dropdown agrupado por classificação (1 select com optgroups)

### Lições da Story 2.5.2 (Previous Story Intelligence)

- Refatoração do treemap (proto-09) foi feita com dados consistentes entre 6 views — mesmo padrão deve ser usado no proto-15
- O `drillMap` + `drillMeta` do proto-09 é uma boa referência de dados canônicos para 4 níveis
- AI-14 e AI-15 já refizeram o proto-14 com a hierarquia v2 — usar como referência de padrão visual (seções de classificação, subcategorias com método)
- Agentes paralelos para protótipos diferentes funcionam bem, mas validação cross-prototype deve ser manual (sequencial)

### Project Structure Notes

- Todas as mudanças são em `_bmad-output/prototypes/` — zero impacto no código de produção
- Nenhum arquivo novo — apenas edição dos 3 protótipos existentes
- Nenhum conflito com a estrutura do projeto

### References

- [Source: _bmad-output/planning-artifacts/decisao-modelo-categorizacao-v2.md] — Documento de decisão do modelo v2 (seção 4: dados reais, seção 6: impacto nos protótipos)
- [Source: _bmad-output/implementation-artifacts/2-5-2-action-items-review.md] — Action items AI-1 a AI-16 (já executados na 2.5.2)
- [Source: _bmad-output/implementation-artifacts/2-5-2-reavaliacao-completa-dos-prototipos.md] — Story 2.5.2 (predecessor)
- [Source: _bmad-output/prototypes/proto-07-cascade-input.html] — Cascade input atual (4 estados + Bônus integrado)
- [Source: _bmad-output/prototypes/proto-08-onboarding.html] — Onboarding atual (5 etapas)
- [Source: _bmad-output/prototypes/proto-15-drill-down.html] — Drill-down atual (4 frames mobile + desktop side panel)
- [Source: _bmad-output/prototypes/proto-09-budgets.html] — Treemap refatorado com 4 níveis (dados de referência para proto-15)
- [Source: _bmad-output/prototypes/proto-14-settings.html] — Settings com categorias v2 (referência visual para classificações)

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
