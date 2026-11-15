# Sprint Change Proposal — Hierarquia de Gastos

**Data:** 2026-11-15
**Workflow:** Correct Course (BMAD) — conduzido pelo Scrum Master com o PO (Vitorcastilho)
**Modo:** Incremental (cada edição aprovada individualmente ou em bloco pelo PO)
**Escopo da mudança:** Moderado — reorganização do backlog do Epic 3 + correção de documentos-base
**Status:** Aguardando aprovação final do PO

---

## 1. Resumo do Problema

### O que aconteceu

Durante a revisão da Story 3.4e (subcategorias sugeridas no onboarding), o PO identificou que o sistema confunde os níveis da hierarquia de gastos. O onboarding sugere **Supermercado** e **Gasolina** como **categorias**, quando são **subcategorias** de **Alimentação** e **Transporte**. A 3.4e acrescentou subcategorias sobre essa base errada (ex.: "Supermercado › Padaria", "Gasolina › Estacionamento").

### Definição correta (PO, 2026-11-15)

```
Essenciais                      ← classificação
  Alimentação  [R$ 3.000]       ← categoria
    Supermercado                ← subcategoria
      Pão de Açúcar             ← estabelecimento (opcional)
      Fort Atacadista
    Padaria
      Padaria do seu Zé
    Hortifruti
      Direto do campo
  Transporte                    ← categoria
    Gasolina                    ← subcategoria
      Posto da esquina
    Pedágio                     ← subcategoria, sem estabelecimento
    Estacionamento              ← subcategoria, sem estabelecimento
```

- Orçamento **e** método de pagamento são **opcionais em todos os 4 níveis**.
- Toda transação de gasto tem classificação, categoria e subcategoria; o **estabelecimento é opcional**.

### Causa raiz

O modelo correto **já tinha sido decidido e aprovado** em `decisao-modelo-categorizacao-v2.md` (2026-03-25), com os mesmos exemplos. A decisão foi aplicada aos **protótipos** (Story 2.5.2b — `proto-07`, `proto-08`, `proto-09` estão corretos) e parcialmente ao **schema**, mas **nunca foi levada aos documentos-base** que as stories leem:

| Documento | Estado antes deste correct-course |
|---|---|
| PRD | FR5 "orçamento por categoria — ex: supermercado R$2.500 a R$3.000"; Jornada 1 "toca Supermercado"; Jornada 3 e 8 com subcategorias como categorias; FR71 "método por categoria" |
| Épicos | FR5, Story 2.4, 2.5, 3.1 e 3.6 "por categoria" |
| UX | Registro rápido com `[Supermercado] [Gasolina]` como categorias; "método padrão por categoria"; exemplos de cards misturando níveis |
| Arquitetura | Só "hierarquia 4 níveis", sem descrever onde ficam orçamento, método e obrigatoriedades |

Cada story posterior leu esses documentos e repetiu o erro. O onboarding implementado (Story 2.6) não seguiu o `proto-08`.

### Evidências

- `src/shared/constants/onboarding-suggestions.ts` (staging): `Supermercado`, `Gasolina` como categorias.
- Schema (staging): `essentiality_classifications` sem orçamento e sem método; `subcategories` sem orçamento; `establishments` sem separação entre método definido e aprendido.
- `transactions.establishment` já é opcional e o Novo Gasto já exige subcategoria (corretos).

---

## 2. Análise de Impacto

### Épicos

| Épico | Impacto |
|---|---|
| Epic 2 (done) | Stories 2.4, 2.5 e 2.6 entregaram o modelo pela metade. Não reabre: recebem notas de correção e a correção vira stories novas no Epic 3. |
| Epic 3 (in-progress) | 3 stories novas (3.5–3.7); antigas 3.5 e 3.6 renumeradas para 3.8 e 3.9 (a 3.9 reescrita como orçamento multinível). 3.4e: a criação inline continua; as sugestões são substituídas pela 3.7. |
| Epic 4 (backlog) | Story 4.1: recorrente passa a ter categoria **e subcategoria**. |
| Epic 6 (backlog) | Story 6.1: gasto por nível da hierarquia (FR30, FR72). Drill-down (6.2) já estava correto. |
| Epics 5, 7, 8, 9 | Sem impacto. |

Nenhum épico fica obsoleto; nenhum épico novo é necessário.

### Artefatos

| Artefato | Mudança |
|---|---|
| `prd.md` | Jornadas 1, 3 e 8; must-haves 2, 7 e 16; FR5, FR13, FR14, FR30, FR38, FR60, FR71 reescritos; **FR72 novo** (saldo não alocado e barra neutra) |
| `epics.md` | Inventário de FRs, mapa de cobertura, regras de processo (fluxo `staging`), notas em 2.4/2.5/2.6/3.1, 4.1, 6.1 e Epic 3 com stories 3.5–3.9 |
| `ux-design-specification.md` | Fluxo de registro com subcategoria e **atalho de subcategorias frequentes**; regra de método; tela do registro rápido; exemplos de cards/lista; fluxogramas; cores 60/80/100 |
| `architecture.md` | Nova seção "Modelo da Hierarquia de Gastos"; tabelas de domínio |
| `decisao-modelo-categorizacao-v2.md` | Adendo v2.1 (método em todos os níveis, regra de preenchimento, obrigatoriedades) |
| `project-context.md` | Regra para agentes de dev: nunca usar subcategoria como categoria |
| `sprint-status.yaml` | Stories 3.5–3.9 renumeradas/criadas |

### Técnico

- **Schema:** orçamento e método na classificação; orçamento na subcategoria; método definido vs. aprendido no estabelecimento. Categoria mantém orçamento e método.
- **Domínio:** nova função pura `resolve-payment-method` (FR71); agregação de orçamento multinível sem dupla contagem (FR60/FR72).
- **Dados:** sistema **não lançado** — bancos de staging e produção serão **zerados** (sem migração de dados). Staging no deploy da Story 3.5; produção na release do Epic 3. Depois do lançamento, apenas migrations que preservam dados.
- **Deploy:** nenhum deploy em produção até o Epic 3 estar concluído em staging sem pendências.

---

## 3. Abordagem Recomendada

**Opção escolhida: Ajuste Direto (Opção 1)** — corrigir os documentos-base e adicionar stories corretivas ao Epic 3, em ordem lógica de execução.

| Opção | Avaliação |
|---|---|
| 1. Ajuste direto | **Viável.** Esforço médio, risco baixo. Mantém o escopo do MVP. |
| 2. Rollback | Não viável. Reverter 2.4–2.6 e 3.4e desfaria trabalho correto (classificações, estabelecimentos, criação inline). |
| 3. Revisão do MVP | Não necessária. O MVP fica igual; a mudança torna o modelo coerente com o que já fora decidido. |

**Justificativa:** o modelo correto já existia e os protótipos estão certos; o que faltou foi propagar a decisão. Corrigir os documentos primeiro garante que as próximas stories (criadas a partir deles) não repitam o erro. A numeração segue a ordem de execução, e nenhuma story posterior "completa" uma anterior.

**Esforço estimado:** 5 stories (3.5–3.9), sendo 3.8 e 3.9 já previstas no backlog. **Risco:** baixo (sem dados reais a migrar). **Impacto no cronograma:** o Epic 3 ganha 3 stories antes da release para `main`.

---

## 4. Propostas de Mudança Detalhadas (aprovadas)

### 4.1 PRD (P1–P12 — aprovadas)

- **P1 Jornada 1:** "toca Alimentação › Supermercado"; Latam Pass preenchido pelo hábito; impacto em Supermercado e Alimentação.
- **P2 Jornada 3:** almoço corrigido de "Alimentação › Supermercado" para "Alimentação › Restaurante trabalho"; reclassificação da categoria "Assinaturas".
- **P3 Jornada 8:** categorias de Qualidade de Vida: Restaurante, Viagem, Assinaturas, Lazer, Compras pessoais (soma mantida em R$5.400).
- **P4 Must-have 2:** hierarquia de 4 níveis com orçamento e método opcionais em qualquer nível.
- **P5 Must-have 7:** total por nível; drill-down a partir da classificação.
- **P6 Must-have 16:** "Orçamento multinível" com saldo não alocado.
- **P7 FR5:** cadastro dos 4 níveis com orçamento e método opcionais (ex.: Essenciais → Alimentação → Supermercado → Pão de Açúcar).
- **P8 FR13:** impacto em todos os níveis com orçamento.
- **P9 FR14:** estabelecimentos sugeridos por subcategoria.
- **P10 FR38:** definição de cada nível; subcategoria obrigatória; estabelecimento opcional (ex.: Transporte › Pedágio sem estabelecimento).
- **P11 FR71:** regra de preenchimento do método (definido > hábito de 3 usos seguidos, do mais específico ao mais geral), atalhos "último usado" e "padrão do nível acima", sugestão de padrão após 90 dias como o mais usado (inclusive para trocar um padrão existente).
- **P12 FR30/FR60 + FR72 novo:** barras por nível; saldo não alocado; barra neutra para nível sem orçamento.

### 4.2 Épicos (E1–E7 — aprovadas)

- **E1** inventário de FRs e mapa de cobertura (inclui FR72).
- **E2** notas de correção em 2.4, 2.5, 2.6 (e 3.1).
- **E3** Story 4.1: categoria e subcategoria no recorrente.
- **E4** Story 6.1: gasto por nível da hierarquia.
- **E5** regras de processo: branch a partir de `staging`, PR para `staging`, release `staging → main` só com épico concluído (merge commit).
- **E6** Epic 3 — nova sequência:

| Nº | Story | Origem |
|---|---|---|
| 3.5 | Hierarquia completa — orçamento e método opcionais nos 4 níveis (schema, `/categories`, reset de staging) | nova |
| 3.6 | Registro rápido — subcategorias frequentes e método de pagamento (FR71, FR14) | nova |
| 3.7 | Onboarding com a hierarquia correta (lista final aprovada pelo PO na story) | nova; substitui as sugestões da 3.4e |
| 3.8 | Reclassificação retroativa de categorias (exemplo "Assinaturas") | era 3.5 |
| 3.9 | Acompanhamento de orçamento multinível (FR60, FR72, FR13) | era 3.6, reescrita |

- **E7** `sprint-status.yaml` atualizado com as chaves acima.

### 4.3 UX (U1–U7 — aprovadas)

- **U1** fluxo Valor → Categoria → Subcategoria → Estabelecimento (opcional) → Pagamento → Parcelas.
- **U2** regra de método (FR71); estabelecimentos por subcategoria.
- **U3** Momento 1: "toca Gasolina (atalho de subcategoria frequente)".
- **U4** registro rápido com **subcategorias frequentes** como atalho ("Supermercado · Alimentação"), pagamento com atalhos e impacto em todos os níveis. *(Decisão do PO: subcategorias frequentes primeiro.)*
- **U5** exemplos de cards e lista com categorias reais; camadas de detalhe por nível.
- **U6** fluxogramas de registro e onboarding.
- **U7** cores da barra alinhadas ao DS e ao `proto-09`: verde ≤ 60%, amarelo ≤ 80%, laranja ≤ 100%, vermelho > 100%.

### 4.4 Arquitetura e outros (A1, A2, O1, O2 — aprovadas)

- **A1** seção "Modelo da Hierarquia de Gastos" (tabelas, campos opcionais, obrigatoriedades, regra do método como função pura, orçamento multinível sem dupla contagem, política de dados).
- **A2** tabelas de domínio atualizadas.
- **O1** adendo v2.1 na decisão de modelo.
- **O2** regra no `project-context.md`.

---

## 5. Handoff de Implementação

**Classificação:** **Moderada** — reorganização do backlog + correção de documentos; sem replanejamento do MVP.

| Papel (BMAD) | Responsabilidade |
|---|---|
| Scrum Master (Bob) | Merge desta proposta em `staging` (PR de docs); criar as stories 3.5 a 3.9 com `create-story`, **na ordem**, a partir dos documentos corrigidos |
| PO (Vitorcastilho) | Aprovar a lista de sugestões do onboarding na Story 3.7; testar 3.4d/e/f e cada story nova em staging; autorizar o reset de produção na release |
| Dev (Amelia) | `dev-story` com TDD; PR para `staging`; reset do banco de staging na 3.5 |
| Code Review | `code-review` de cada story antes do merge em `staging` |

**Sequência:**

1. PR de documentação (`docs/correct-course-hierarquia` → `staging`).
2. Stories 3.5 → 3.6 → 3.7 → 3.8 → 3.9, cada uma: create-story → dev-story → code-review → PR para `staging` → validação em staging.
3. Epic 3 sem pendências em staging → PR `staging → main` (merge commit) → reset do banco de produção → validação em produção.

**Critérios de sucesso:**

- Nenhum documento, seed, sugestão ou teste usa subcategoria como categoria.
- Orçamento e método configuráveis (e removíveis) nos 4 níveis em `/categories`.
- Registro rápido: atalho de subcategoria frequente + método preenchido conforme FR71 (cenários Alelo/Latam Pass cobertos por testes).
- Onboarding cria a hierarquia correta e permite o primeiro gasto sem passar por `/categories`.
- Orçamento multinível com saldo não alocado e sem dupla contagem no disponível livre.
