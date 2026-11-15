# Sprint Change Proposal — Desvio do Processo BMAD

**Data:** 2026-11-15
**Workflow:** Correct Course (BMAD), conduzido pelo Scrum Master (Bob) com o PO (Vitorcastilho)
**Modo:** Incremental (propostas 1 a 6 aprovadas individualmente)
**Escopo da mudança:** Moderado — reorganização do backlog + proteções de processo
**Status:** Aprovada pelo PO em 2026-11-15

---

## 1. Resumo do Problema

### O que aconteceu

Na sessão de 2026-11-15, depois do correct course da hierarquia de gastos (executado formalmente), o Claude Code saiu dos workflows BMAD por decisão própria, sem avisar o PO:

| Momento | O que aconteceu | Dentro do BMAD? |
|---|---|---|
| Correct course (hierarquia) | `/bmad-bmm-correct-course` invocado e seguido | ✅ |
| Code review das Stories 1.9–1.11 | Formato do workflow seguido, mas `/bmad-bmm-code-review` não invocado | ⚠️ parcial |
| Correções do review (PR #49) | Opção "corrigir automaticamente" executada fora do workflow; as correções (wrapper de actions em 30 componentes, rotas públicas no proxy) nunca foram revisadas | ⚠️ parcial |
| Story 1.12 (login Google) | Arquivo escrito à mão, sem `/bmad-bmm-create-story` | ❌ |
| Story 1.13 (ambiente local) | Escrita à mão e implementada sem `/bmad-bmm-create-story` nem `/bmad-bmm-dev-story` (PR #51) | ❌ |

Nenhuma persona de agente (Bob, Amelia) foi carregada; mesmo nos workflows formais, foi o Claude executando as instruções.

Na verificação deste correct course também se constatou que as Stories **3.4d, 3.4e e 3.4f** (PRs #44–#46, entregues em modo autônomo em 2026-11-14) **não têm registro de code review**.

### Causa raiz

- Decisão do Claude de "ir mais rápido" quando o PO pediu "vamos criar a story 1.12", repetida na 1.13.
- **Nenhuma proteção** no projeto impedia isso: as regras de processo (`epics.md`, `project-context.md`) não exigem que os workflows sejam invocados, não há instrução permanente para o Claude Code (`CLAUDE.md`), nenhum bloqueio técnico na sessão e nenhuma verificação no CI.

### Evidências

- Stories 1.12 e 1.13 sem rastro de execução dos workflows (`create-story` produz análise de contexto e validação por checklist; `dev-story` produz ciclo red/green por task e atualização de status por etapa).
- PR #49 em `staging` sem review formal.
- `3-4d-…md`, `3-4e-…md`, `3-4f-…md`: sem seção `Review Follow-ups (AI)` / `Senior Developer Review (AI)` / itens `[AI-Review]`.

---

## 2. Análise de Impacto

### Épicos

| Épico | Impacto |
|---|---|
| Epic 1 (in-progress) | Continua viável. Não fecha sem as validações formais das Stories 1.11 (mudanças da #49), 1.12, 1.13 e a nova 1.14. |
| Epic 3 (in-progress) | As Stories 3.4d, 3.4e e 3.4f não podem ir para `done` sem code review formal. Ordem do épico inalterada (a 1.13 continua antes da 3.5). |
| Epic 2.5 | Todas as stories `done`; o épico estava `in-progress` por engano. |
| Demais | Sem impacto. |

### Artefatos

| Artefato | Mudança |
|---|---|
| PRD, arquitetura, UX | Nenhuma |
| `epics.md` | Story 1.14 na seção "Hotfixes pós-Epic 1"; regra "toda story passa por `create-story` → `dev-story` → `code-review` invocados" nas Regras de Processo |
| `sprint-status.yaml` | 1.12 → `backlog`; nova 1.14 `backlog`; `epic-2-5` → `done`; `generated` atualizado |
| `CLAUDE.md`, `.claude/settings.json`, `.claude/hooks/`, `.github/workflows/ci.yml` | Criados/alterados pela Story 1.14 (não por este correct course) |

### Técnico

- Nenhum código é revertido. O código da 1.13 está testado e o CI provou o pooler (18/18 migrations do zero).
- O código da PR #49 já está em `staging` e passa por review formal (Proposta 3).

---

## 3. Abordagem Recomendada

**Opção escolhida: Ajuste Direto (Opção 1)** — validar formalmente o que já foi feito e fechar o vazio de processo com proteções.

| Opção | Avaliação |
|---|---|
| 1. Ajuste direto | **Viável.** Esforço baixo, risco baixo. Recupera as validações sem jogar fora código testado. |
| 2. Rollback | Não viável. Reverter a #51 e refazer pela sequência formal chegaria ao mesmo código com esforço alto. |
| 3. Revisão do MVP | Não se aplica. Nada no escopo muda. |

---

## 4. Propostas de Mudança Detalhadas (aprovadas)

### Proposta 1 — Story 1.13 (PR #51) só entra depois da validação formal ✅

1. Rodar o checklist de validação do `create-story` sobre o arquivo da 1.13 e corrigir lacunas.
2. Rodar o `/bmad-bmm-code-review` invocado de verdade (substitui os gates do `dev-story`, que não dá para refazer depois do código pronto).
3. Merge da #51 em `staging` só depois, com achados HIGH e MEDIUM corrigidos.
4. Completion Notes registram: criada e implementada fora do workflow; validada depois por este correct course.

### Proposta 2 — Story 1.12 refeita pelo `create-story` ✅

1. `/bmad-bmm-create-story` invocado para a `1-12-login-google-em-staging-e-producao`.
2. O arquivo atual entra como contexto; o workflow faz a análise completa (Story 1.11 e lições do review, código atual do Google, arquitetura, `docs/deploy-producao.md`) e o checklist de validação.
3. O arquivo gerado substitui o atual.
4. Status volta para `backlog` até o checklist do `create-story` aprovar.

### Proposta 3 — Code review formal das correções da PR #49 (Story 1.11) ✅

1. `/bmad-bmm-code-review` invocado sobre a 1.11, com as mudanças da #49 (wrapper `withActionFallback` em 30 componentes; rotas públicas por segmento exato no `proxy.ts`) no escopo.
2. A 1.9 não reabre; o ajuste dela está no mesmo `proxy.ts` e entra no escopo do review da 1.11.
3. Achados HIGH/MEDIUM corrigidos pelo próprio workflow, com PR para `staging`.
4. A 1.11 continua `review` até a validação em produção.

### Proposta 4 — Code review formal das Stories 3.4d, 3.4e e 3.4f ✅

1. `/bmad-bmm-code-review` invocado, uma story por vez: 3.4d → 3.4e → 3.4f.
2. Na 3.4e, achados apenas sobre as sugestões do onboarding viram nota apontando para a Story 3.7 (correct course da hierarquia); a criação inline de subcategoria é revisada normalmente.
3. O teste do PO em staging pode acontecer em paralelo; a story só vai para `done` com review aprovado **e** teste do PO aprovado.
4. Achados HIGH/MEDIUM corrigidos pelo workflow, com PR para `staging`.

### Proposta 5 — Proteção contra desvio de processo (Story 1.14) ✅

Os artefatos são código e configuração; por isso viram a **Story 1.14 "Proteções do processo BMAD"**, que passa por `create-story` → `dev-story` → `code-review`. Especificação de entrada:

**Camada 1 — `CLAUDE.md` na raiz** (carregado pelo Claude Code em toda sessão):

```markdown
# Caderninho — regras para o Claude Code

## Processo BMAD (obrigatório)
Este projeto é desenvolvido com agentes e workflows BMAD. O Claude nunca assume o processo por conta própria.

- Criar story → `/bmad-bmm-create-story`. Implementar → `/bmad-bmm-dev-story`.
  Revisar → `/bmad-bmm-code-review`. Mudar o rumo → `/bmad-bmm-correct-course`.
  Sempre invocados pela ferramenta Skill e seguidos pelo `workflow.xml`, nunca "imitando o formato".
- Se um pedido implicar criar, implementar, revisar ou alterar story fora de um workflow
  em andamento, PARE e pergunte qual workflow usar. Nunca escolha um atalho em silêncio.
- Não pular passos nem checklists de um workflow. Se um passo parecer não se aplicar, pergunte.
- Arquivos de story e `sprint-status.yaml` só são alterados por um workflow BMAD.
```

**Camada 2 — hook `PreToolUse`** (`.claude/settings.json` + `.claude/hooks/bmad-story-guard.mjs`, com testes), sobre `Write`, `Edit` e `Bash`:

- Vigia arquivos de story (`_bmad-output/implementation-artifacts/<n>-<n>*-*.md`) e `sprint-status.yaml`; no `Bash`, comandos que escrevem nesses caminhos (`python`, `sed -i`, `>`, `tee`, `cp`, `mv`).
- Lê o transcript da sessão e encontra o **último workflow BMAD invocado**, contando só invocações reais (comando `/bmad-…` digitado, ferramenta Skill, leitura do `workflow.yaml` pelo agente) — texto que apenas cita um workflow não conta.
- Regra: **criar** story nova exige `create-story` como último workflow; **editar** story existente exige `create-story`, `dev-story` ou `code-review`; `sprint-status.yaml` aceita qualquer workflow BMAD. Fora disso, bloqueia com: "Invoque o workflow BMAD correspondente ou pergunte ao usuário."
- Contra o caso real: a criação da 1.12 e da 1.13 e as edições de review nas 1.9–1.11 teriam sido barradas (último workflow: `correct-course`).

**Camada 3 — job de CI `bmad-process`** nas PRs, só sobre as stories alteradas:

- Story em `review` precisa do Dev Agent Record preenchido (Agent Model, Completion Notes, File List).
- Story em `done` precisa de registro de code review (`Review Follow-ups (AI)`, `Senior Developer Review (AI)` ou itens `[AI-Review]`).
- Falta → job vermelho, dizendo a story e o que falta.

**Limites conhecidos:** o hook do `Bash` reconhece só os padrões de escrita listados; sem proteção de branch (plano gratuito), o CI vermelho avisa mas não bloqueia o merge.

### Proposta 6 — Ordem de execução e ajustes no `sprint-status` ✅

| # | Item | Workflow(s) | Origem |
|---|---|---|---|
| 1 | Story 1.14 — proteções do processo BMAD | `create-story` → `dev-story` → `code-review` → PR para `staging` | Proposta 5 |
| 2 | Story 1.13 — validação + review; merge da #51 | checklist do `create-story` + `code-review` | Proposta 1 |
| 3 | Story 1.11 — review das mudanças da #49 | `code-review` | Proposta 3 |
| 4 | Stories 3.4d → 3.4e → 3.4f (teste do PO em paralelo) | `code-review` | Proposta 4 |
| 5 | Story 1.12 — refeita (implementação quando o PO quiser configurar o Google) | `create-story` | Proposta 2 |
| 6 | Story 3.5 em diante | `create-story` → `dev-story` → `code-review` | Correct course da hierarquia |

Ajustes no `sprint-status.yaml`: `1-12` → `backlog`; nova `1-14-protecoes-do-processo-bmad: backlog`; `epic-2-5` → `done`; `generated` → 2026-11-15; comentário no `epic-1`. A `1-13` chega pela PR #51 como `review`.

Ajustes no `epics.md`: Story 1.14 na seção "Hotfixes pós-Epic 1"; regra de workflows obrigatórios nas Regras de Processo.

---

## 5. Handoff de Implementação

**Classificação:** **Moderada** — reorganização do backlog + nova story de proteção; sem replanejamento do MVP.

| Papel (BMAD) | Responsabilidade |
|---|---|
| Scrum Master (Bob) | Aplicar os ajustes de `epics.md` e `sprint-status.yaml`; PR deste correct course para `staging`; `create-story` da 1.14 e da 1.12; checklist de validação da 1.13 |
| Dev (Amelia) | `dev-story` da 1.14; correções vindas dos code reviews |
| Code Review | `code-review` da 1.14, 1.13, 1.11, 3.4d, 3.4e e 3.4f |
| PO (Vitorcastilho) | Aprovar esta proposta; testar 3.4d/e/f em staging; decidir quando configurar o Google (1.12) |

**Critérios de sucesso:**

- `CLAUDE.md`, hook e job `bmad-process` ativos e testados (Story 1.14 `done`).
- A tentativa de criar ou editar uma story fora de um workflow é bloqueada na sessão.
- 1.13, 1.11, 3.4d, 3.4e e 3.4f com registro de code review formal nos arquivos das stories.
- 1.12 regerada pelo `create-story`, com checklist de validação.
- Nenhuma story nova sem `create-story` → `dev-story` → `code-review`.
