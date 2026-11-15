# Story 1.14: Proteções do processo BMAD

Status: ready-for-dev

<!-- Criada pelo create-story (invocado) em 2026-11-15, a partir do correct course de processo: _bmad-output/planning-artifacts/sprint-change-proposal-2026-11-15-processo.md (Proposta 5). Primeira da fila aprovada na Proposta 6. -->

## Story

As a PO,
I want que o projeto impeça o Claude Code de criar, implementar ou revisar stories fora dos workflows BMAD,
so that o processo nunca seja assumido em silêncio no meio do nosso trabalho.

## Contexto (por que esta story existe)

Em 2026-11-15 o Claude Code criou as Stories 1.12 e 1.13 e implementou a 1.13 (PR #51) sem invocar `create-story`/`dev-story`, e fez o code review das 1.9–1.11 "no formato" do workflow sem invocá-lo. Também trabalhou em `git worktree` fora da pasta do PO, que não conseguia acompanhar no VS Code. Nada no projeto impedia isso. Esta story cria três camadas independentes de proteção e alinha as regras de processo escritas.

## Acceptance Criteria

1. **Camada 1 — `CLAUDE.md`.** **Given** qualquer sessão do Claude Code no repositório **When** a sessão inicia **Then** o `CLAUDE.md` da raiz carrega as regras (texto na seção "Conteúdo exato do CLAUDE.md"): criar/implementar/revisar/mudar o rumo de stories só pelos workflows BMAD invocados; fora disso, parar e perguntar; não pular passos/checklists; story e `sprint-status.yaml` só alterados por workflow; **desenvolvimento só em branches na pasta principal, nunca `git worktree`**.

2. **Camada 2 — hook bloqueia escrita fora de workflow.** **Given** o hook `PreToolUse` registrado em `.claude/settings.json` para `Write|Edit|MultiEdit|Bash` **When** a ferramenta tenta escrever num **arquivo de story** (`_bmad-output/implementation-artifacts/<n>-<n>…-*.md`) ou no `sprint-status.yaml` **Then** a ação só passa se o **último workflow BMAD invocado** na sessão permitir:
   - **criar** arquivo de story novo → último workflow = `create-story`
   - **editar** story existente → último workflow ∈ {`create-story`, `dev-story`, `code-review`}
   - `sprint-status.yaml` → último workflow ∈ {`create-story`, `dev-story`, `code-review`, `correct-course`, `sprint-planning`, `retrospective`}
   **And** fora disso o hook sai com código 2 e a mensagem: `Bloqueado pelo processo BMAD: <ação> em <arquivo> exige o workflow <permitidos>, mas o último invocado foi <último|nenhum>. Invoque o workflow BMAD correspondente ou pergunte ao usuário.`

3. **Camada 2 — só invocações reais contam.** **Given** o transcript da sessão (`transcript_path` da entrada do hook) **When** o hook procura o último workflow **Then** contam apenas:
   - (a) comando digitado pelo usuário: entrada `type: "user"` com `<command-name>/bmad-bmm-<workflow></command-name>`;
   - (b) ferramenta Skill: `tool_use` com `name: "Skill"` e `input.skill` = `bmad-bmm-<workflow>`;
   - (c) leitura do `_bmad/bmm/workflows/4-implementation/<workflow>/workflow.yaml` (`Read.file_path` ou `Bash.command`) **somente se um agente BMAD estiver ativo** — antes dela, na sessão, houve `/bmad-agent-…` digitado ou Skill `bmad-agent-…` (é o caminho legítimo dos menus dos agentes).
   **And** nunca contam: texto do assistente que cita um workflow, conteúdo de `tool_result` (ex.: um arquivo lido que lista caminhos de workflows), entradas de subagente (`isSidechain: true`).

4. **Camada 2 — testes reproduzem o caso real.** **Given** transcripts sintéticos (fixtures) **When** os testes rodam **Then** são bloqueados: criar a 1.12/1.13 depois de um `correct-course`; editar story depois de `cat .../code-review/workflow.yaml` **sem** agente ativo; escrever story via `Bash` (`python3`, `sed -i`, `>`, `tee`, `cp`, `mv`, `rm`) fora de workflow; criar story depois de `dev-story`. **And** são permitidos: `git show …sprint-status.yaml > /tmp/x` e `… 2>&1` sem workflow (leitura); criar story depois de Skill `bmad-bmm-create-story`; criar depois de `/bmad-agent-bmm-sm` + leitura do `create-story/workflow.yaml`; editar depois de `dev-story`/`code-review`; `sprint-status.yaml` depois de `correct-course`; ler story via `Bash` (`cat`, `grep`, `git show`, `git diff`); qualquer arquivo que não seja story/sprint-status.

5. **Camada 2 — falhas seguras.** **Given** um arquivo protegido **When** o transcript não pode ser lido ou a entrada do hook é inválida **Then** o hook bloqueia (exit 2) com mensagem que explica o motivo. **And** para arquivos não protegidos o hook nunca bloqueia (exit 0, sem saída). **And** o hook roda com `node` puro (sem `tsx`), dentro do timeout configurado, lendo o transcript de forma eficiente (filtra linhas pelo texto `bmad-` antes de `JSON.parse`).

6. **Camada 3 — CI `bmad-process`.** **Given** uma PR para `staging` ou `main` **When** o job `bmad-process` roda **Then** para cada arquivo de story **adicionado ou alterado na PR**: se `Status: review` → exige Dev Agent Record preenchido (`### Agent Model Used` com valor que não seja o placeholder `{{agent_model_name_version}}`, `### Completion Notes List` com ao menos um item, `### File List` com ao menos um item); se `Status: done` → exige registro de code review (`Review Follow-ups (AI)`, `Senior Developer Review (AI)` ou item `[AI-Review]`). **And** se faltar algo o job falha listando `<story>: <o que falta>`. **And** stories não alteradas na PR não são verificadas (histórico não é reprocessado). **And** na PR de release `staging → main` todas as stories do épico entram no diff — o job as verifica normalmente (ex.: 1.10/1.11 em `review` passam se o Dev Agent Record estiver preenchido).

7. **Regras escritas alinhadas.** **Given** `_bmad-output/project-context.md` **When** um agente lê as regras de desenvolvimento **Then** a seção "Development Workflow Rules → Git & Branching" reflete o fluxo atual (branch a partir de `staging` na pasta principal, PR para `staging`, release `staging → main` com merge commit ao fim do épico, sem worktrees) e aponta para o `CLAUDE.md`. O texto "Ao iniciar um novo épico: criar branch nova a partir de `main`" sai.

8. **Limites documentados.** **Given** o `CLAUDE.md` e o README **When** alguém lê sobre as proteções **Then** estão documentados: o hook do `Bash` reconhece só os padrões de escrita listados; entradas de subagentes não liberam escrita; sem proteção de branch (plano gratuito), o CI vermelho avisa mas não bloqueia o merge; depois que um workflow termina, o hook continua considerando-o o "último" até outro ser invocado (a Camada 1 cobre esse intervalo).

9. **Validação.** **Given** a story está completa **When** a validação roda **Then** TDD (testes vermelhos antes de cada implementação, saída no Debug Log), `npx tsc --noEmit` 0 erros, `npm run lint` 0 warnings, `npx vitest run` 100%, `next build` ok, CI da PR verde (incluindo o job novo) **And** o hook é testado de verdade nesta sessão (Task 6): uma escrita protegida sem workflow é bloqueada.

## Tasks / Subtasks

<!-- Sem UI: a Fase 0 (Design System & Protótipos) não se aplica. -->

- [ ] Task 1 (AC: #2, #3, #4, #5): lógica do guard com TDD — `scripts/bmad/story-guard.mjs`
  - [ ] 1.1 Fixtures de transcript sintéticas (JSONL mínimo com os formatos reais da seção "Formato do transcript") em `scripts/bmad/__fixtures__/`. **Nunca** copiar trechos do transcript real (contém dados privados).
  - [ ] 1.2 Testes vermelhos em `scripts/bmad/story-guard.test.ts` para todos os casos do AC 4 e AC 5; colar a saída vermelha no Debug Log
  - [ ] 1.3 Implementar funções puras exportadas: `classifyTarget(toolName, toolInput, projectDir)` → `{ kind: 'story' | 'sprint-status' | 'other', action: 'create' | 'edit' | 'read', path }`; `findLastWorkflow(transcriptLines)` → `{ workflow | null }`; `decide(target, lastWorkflow)` → `{ allow: true } | { allow: false, reason }`
  - [ ] 1.4 Verde + refatorar
- [ ] Task 2 (AC: #2, #5): entrada do hook — `.claude/hooks/bmad-story-guard.mjs`
  - [ ] 2.1 Lê o JSON do stdin, chama as funções do 1.3, sai `0` (sem saída) ou `2` (mensagem no stderr)
  - [ ] 2.2 `.claude/settings.json` (versionado): `PreToolUse`, `matcher: "Write|Edit|MultiEdit|Bash"`, comando em forma exec com `${CLAUDE_PROJECT_DIR}`, `timeout` explícito
  - [ ] 2.3 Teste de integração do entrypoint: rodar o script com `child_process` passando JSON no stdin e transcript fixture; conferir exit code e stderr
- [ ] Task 3 (AC: #1, #8): `CLAUDE.md` na raiz com o conteúdo exato abaixo + seção "Limites das proteções"
- [ ] Task 4 (AC: #6): job de CI `bmad-process`
  - [ ] 4.1 Testes vermelhos em `scripts/bmad/check-story-process.test.ts` (story `review` completa/incompleta, story `done` com/sem review, placeholder do Agent Model, story não alterada ignorada)
  - [ ] 4.2 `scripts/bmad/check-story-process.ts` (lógica pura + CLI que recebe a lista de arquivos alterados)
  - [ ] 4.3 Job `bmad-process` em `.github/workflows/ci.yml`, só em `pull_request`: `actions/checkout@v4` com `fetch-depth: 0`; arquivos alterados via `git diff --name-only --diff-filter=AM origin/${{ github.base_ref }}...HEAD`; roda o CLI
- [ ] Task 5 (AC: #7, #8): documentação
  - [ ] 5.1 `_bmad-output/project-context.md` → "Development Workflow Rules → Git & Branching" atualizado (AC 7)
  - [ ] 5.2 README: seção curta "Processo BMAD e proteções" (as três camadas e os limites)
- [ ] Task 6 (AC: #9): validação
  - [ ] 6.1 `npx tsc --noEmit`, `npm run lint`, `npx vitest run`, `npx next build`
  - [ ] 6.2 Teste real do hook: o Claude Code carrega os hooks no início da sessão e pede revisão de hooks alterados fora dela — o PO abre `/hooks` para aprovar o hook novo (ou reinicia a sessão). Depois, tentar uma escrita protegida sem workflow ativo e registrar o bloqueio (exit 2 + mensagem) no Debug Log; e uma leitura (`cat` da story) que deve passar
  - [ ] 6.3 PR para `staging`; CI verde, incluindo `bmad-process`

## Dev Notes

### Conteúdo exato do CLAUDE.md (Camada 1)

Texto aprovado pelo PO na Proposta 5, acrescido da regra de worktrees aprovada em seguida:

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

## Git
- Desenvolvimento só em branches na pasta principal do projeto, trocando com `git switch`.
  Nunca usar `git worktree` nem cópias do repositório em outras pastas: o PO acompanha pelo VS Code.
- Antes de trocar de branch, conferir `git status`; havendo mudanças do PO, perguntar.
```

Depois dele, a seção "Limites das proteções" (AC 8).

### Formato do transcript (verificado na sessão de 2026-11-15)

- Arquivo JSONL; cada linha é um objeto com `type` (`user`, `assistant`, e vários outros a ignorar: `system`, `attachment`, `mode` etc.) e `isSidechain` (boolean).
- **Comando digitado:** `type: "user"`, `message.content` string (ou bloco `text`) contendo `<command-message>bmad-bmm-create-story</command-message>\n<command-name>/bmad-bmm-create-story</command-name>`.
- **Skill:** `type: "assistant"`, `message.content[]` com `{ "type": "tool_use", "name": "Skill", "input": { "skill": "bmad-bmm-code-review", "args": "…" } }`.
- **Leitura de workflow:** `tool_use` com `name: "Bash"` e `input.command` contendo o caminho, ou `name: "Read"` e `input.file_path`.
- **Resultados de ferramenta** chegam em entradas `type: "user"` com blocos `tool_result` — **não** contam (um `cat sm.md` devolve todos os caminhos de workflow do menu).
- O transcript desta sessão tem ~12 MB e cresce: **classificar o alvo primeiro** e só ler o transcript quando ele for protegido (a grande maioria das chamadas de `Bash`/`Edit` sai em `exit 0` sem tocar no transcript). Ao ler, filtrar linhas pela substring `bmad-` antes do `JSON.parse` e percorrer em ordem, guardando o último evento.

### Contrato do hook (code.claude.com/docs/en/hooks, consultado em 2026-11-15)

- Entrada (stdin, JSON): `session_id`, `transcript_path`, `cwd`, `permission_mode`, `hook_event_name: "PreToolUse"`, `tool_name`, `tool_input`, `tool_use_id`; em subagentes, `agent_id`/`agent_type`.
- `tool_input`: `Write` → `file_path`, `content`; `Edit`/`MultiEdit` → `file_path`; `Bash` → `command`.
- **Bloquear:** `exit 2` + motivo no **stderr** (o Claude recebe o motivo). `exit 0` sem saída = sem decisão (fluxo normal de permissões).
- `settings.json`: `{"hooks":{"PreToolUse":[{"matcher":"Write|Edit|MultiEdit|Bash","hooks":[{"type":"command","command":"node","args":["${CLAUDE_PROJECT_DIR}/.claude/hooks/bmad-story-guard.mjs"],"timeout":10}]}]}}` — a doc recomenda forma exec (`command` + `args`) com placeholder de caminho. `matcher` com só letras e `|` é nome exato.
- `cwd` acompanha `cd`; `${CLAUDE_PROJECT_DIR}` é a raiz fixa — normalizar caminhos de story relativos a ela.
- **Timeout não bloqueia por padrão** em `PreToolUse`: manter o script rápido. A doc não confirma o comportamento em modos `auto`/`bypassPermissions` — por isso a Task 6.2 testa de verdade nesta sessão (modo `auto`).

### Detecção de alvo (Task 1.3)

- Story: caminho relativo à raiz casando `^_bmad-output/implementation-artifacts/\d+-\d+[a-z]?(-\d+[a-z]?)?-[^/]+\.md$` (cobre `1-14-…`, `3-4e-…`, `2-5-2b-…`). Sprint-status: `_bmad-output/implementation-artifacts/sprint-status.yaml`.
- `Write`: alvo inexistente → `create`; existente → `edit`. `Edit`/`MultiEdit` → `edit`.
- `Bash`: é escrita quando o caminho protegido é o **destino** da operação:
  - redirecionamento `> caminho` / `>> caminho` ou `tee [-a] caminho` (o protegido é o alvo; `2>&1` e `> /tmp/x` não contam);
  - `cp`/`mv` cujo último argumento é o caminho protegido; `sed -i`, `perl -i`, `truncate`, `rm` com o caminho protegido como operando;
  - `python`/`python3`/`node -e` com o caminho protegido em qualquer parte do comando (o script pode escrever nele — bloquear).
  Comandos só de leitura passam, mesmo citando o caminho: `cat`, `grep`, `head`, `sed -n`, `git show`, `git diff`, `git log`, e **leitura com redirecionamento para fora** (ex.: `git show origin/staging:_bmad-output/implementation-artifacts/sprint-status.yaml > /tmp/ss.yaml` — caso real desta sessão, deve passar). Caminho protegido de destino que não existe → `create`.
- Caminhos relativos no `Bash` são resolvidos a partir do `cwd` da entrada do hook e depois tornados relativos a `${CLAUDE_PROJECT_DIR}`; `Write`/`Edit` usam `file_path` (absoluto).
- Não tentar ser perfeito no `Bash` — o limite é documentado (AC 8); a Camada 1 e o CI completam.

### Arquitetura e padrões a seguir

- **TDD obrigatório** (project-context, Testing Rules): teste antes, vermelho registrado, depois implementação.
- **Testes co-localizados** e lógica em funções puras testáveis (padrão da Story 1.13: `scripts/lib/migrate-env.ts` + teste).
- **Node 22.16 local / 22 no CI**: sem execução nativa de TypeScript — o hook precisa ser `.mjs`. O `tsconfig` tem `allowJs: true`, então os testes `.ts` importam o `.mjs`. Se o import gerar erro de tipos, criar `story-guard.d.mts` em vez de desligar checagens.
- **ESLint** (`npm run lint`) cobre o repositório inteiro, incluindo `scripts/` e `.claude/hooks/`.
- **CI** (`.github/workflows/ci.yml`): o job novo segue o padrão dos jobs existentes (checkout, setup-node 22 com cache npm, `npm ci`). A concorrência já cancela só execuções de PR.
- **Sem segredos em log**: o job `bmad-process` não lê `.env`; o hook não imprime conteúdo do transcript, só nomes de workflow e caminhos.

### Aprendizados das stories anteriores (1.10, 1.11, 1.13)

- A 1.13 (PR #51, ainda aberta) mexe em `.github/workflows/ci.yml` (jobs `migrations` e `deploy-migrations`, concorrência). **Esta story também mexe no `ci.yml`**: partir de `staging` atualizada e, se a #51 entrar antes, rebasear antes de abrir a PR.
- A #52 (correct course de processo) e a #51 alteram os mesmos trechos do `epics.md`/`sprint-status.yaml`; esta branch nasceu da #52 — rebasear em `staging` depois do merge dela.
- O CI só prova o que roda nele (1.13): por isso o job `bmad-process` precisa rodar de verdade na PR desta story, e o hook precisa ser testado na sessão (Task 6.2).
- Mensagens e documentação em português, como no resto do projeto.

### Git intelligence (últimos commits em `staging`)

- `b8eb08a` docs 1.10 (validação 6543), `9e07574` fix review 1.9–1.11 + Story 1.12, `9d04709` correct course da hierarquia, `51c2398` docs 3.4d/e/f, `1015c43` Story 3.4f. Padrão: commit em português, prefixo convencional (`feat:`, `fix:`, `docs:`, `ci:`), **sem** trailer `Co-Authored-By` e PR **sem** rodapé "Generated with Claude Code" (preferência do PO, 2026-11-15).

### Project Structure Notes

- Novos: `CLAUDE.md`, `.claude/settings.json`, `.claude/hooks/bmad-story-guard.mjs`, `scripts/bmad/story-guard.mjs`, `scripts/bmad/story-guard.test.ts`, `scripts/bmad/__fixtures__/*.jsonl`, `scripts/bmad/check-story-process.ts`, `scripts/bmad/check-story-process.test.ts`.
- Alterados: `.github/workflows/ci.yml`, `_bmad-output/project-context.md`, `README.md`.
- `.claude/commands/` (comandos BMAD) não muda. `.claude/settings.local.json` (se existir, pessoal) não é versionado nem alterado.

### References

- [Source: _bmad-output/planning-artifacts/sprint-change-proposal-2026-11-15-processo.md#Proposta-5]
- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.14] e Regras de Processo
- [Source: _bmad-output/project-context.md#Testing-Rules], [#Development-Workflow-Rules]
- [Source: .github/workflows/ci.yml]
- [Source: code.claude.com/docs/en/hooks] (contrato do PreToolUse, consultado em 2026-11-15)
- [Source: _bmad-output/implementation-artifacts/1-13-ambiente-local-igual-staging-e-producao.md] (padrão scripts/lib + teste; CI)

## Decisões do PO na criação (2026-11-15 — ambas confirmadas)

1. **AC 3 refinado em relação ao épico:** o épico diz que a leitura do `workflow.yaml` conta como invocação. Isso **não** barraria o caso real das edições de review nas 1.9–1.11 (foi feito `cat .../code-review/workflow.yaml` sem invocar o workflow). Esta story exige que a leitura do `workflow.yaml` só conte com um agente BMAD ativo. **Confirmado pelo PO.**
2. **Janela depois do workflow:** o hook considera o último workflow invocado até outro ser invocado (não sabe quando um workflow "terminou"). A Camada 1 cobre esse intervalo; está documentado no AC 8. **Aceito pelo PO.**

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- 2026-11-15 (create-story): Ultimate context engine analysis completed - comprehensive developer guide created. Criada pelo workflow `create-story` invocado, a partir da Proposta 5 do correct course de processo; inclui a regra de worktrees aprovada pelo PO.

### File List
