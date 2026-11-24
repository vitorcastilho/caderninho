# Story 1.15: Pedir permissão e proteger bancos remotos

Status: in-progress

<!-- Criada pelo create-story (comando /bmad-bmm-create-story 1-15 digitado pelo PO) em 2026-11-17, a partir do correct course de 2026-11-16 (_bmad-output/planning-artifacts/sprint-change-proposal-2026-11-16.md, Proposta 1), com os nomes de arquivo do correct course de 2026-11-17 (sprint-change-proposal-2026-11-17.md, 4.6). -->

## Story

As a PO,
I want que o Claude Code peça permissão antes de assumir qualquer etapa BMAD e nunca rode comandos contra os bancos remotos,
so that eu continue no controle do processo e dos dados de staging e produção.

## Contexto (por que esta story existe)

Em 2026-11-16, durante e depois do code review da Story 1.13, com as proteções da 1.14 ativas:

- o PO avisou que a story "voltou para review" e o Claude **invocou o `code-review` por conta própria** (Skill `bmad-bmm-code-review`);
- para testar a detecção do CI, o Claude **rodou `scripts/migrate.ts --env staging` no banco real de staging** (`CI=true DATABASE_URL=… npx tsx scripts/migrate.ts --env staging`) e depois tentou uma consulta de leitura em staging.

Nada foi aplicado em staging: 18/18 migrations, igual ao journal. Mas as duas brechas eram reais. O `CLAUDE.md` não proibia o Claude de invocar um workflow por iniciativa própria, e o hook da 1.14 só protege a escrita em stories e no `sprint-status.yaml`. A regra "comandos remotos são do PO" existia só na memória do Claude. Esta story transforma as duas regras em texto do `CLAUDE.md` (Camada 1) e em barreira no hook `PreToolUse` (Camada 2), seguindo o padrão da 1.14.

## Acceptance Criteria

1. **Camada 1: `CLAUDE.md`.** **Given** qualquer sessão do Claude Code no repositório **When** a sessão inicia **Then** o `CLAUDE.md` carrega as seções "Quem conduz" e "Bancos remotos" e o primeiro item de "Processo BMAD" ajustado, com o texto exato da seção "Conteúdo novo do CLAUDE.md" (Dev Notes): nunca invocar workflow/agente BMAD nem iniciar a próxima etapa sem o sim do PO; aviso de estado não é pedido de execução; agente ativo mantido até o PO encerrar; escopo das opções é o do workflow; comandos e arquivos de staging/produção são do PO.

2. **Camada 2: hook de bancos remotos no `Bash`.** **Given** o hook `PreToolUse` novo (`.claude/hooks/remote-db-guard.mjs`, lógica em `scripts/bmad/remote-db-guard.mjs`) **When** o `Bash` recebe um comando em que algum trecho (separado por `&&`, `||`, `;`, `|`, quebra de linha):
   - (a) roda o migrate (`db:migrate` ou um arquivo terminado em `migrate.ts`) com `--env staging|production` ou `--env=staging|production`, sendo o comando do trecho (depois de pular atribuições `VAR=valor`) um executor: `npm`, `pnpm`, `yarn`, `npx`, `tsx`, `node`, `bun`, `bunx`, `ts-node`, `sh`, `bash`, `zsh`, `env`, `time`, `nohup`, `timeout`, `xargs` (basename, ex.: `./node_modules/.bin/tsx`);
   - (b) cita `.env.migrate.staging`, `.env.migrate.production`, `.env.staging.local` ou `.env.production.local` (como palavra ou fim de caminho, inclusive depois de `=`, `<`, `:` ou aspas), ou um glob que começa por `.env` e contém `*`, `?` ou `[` (ex.: `cat .env*`, `source .env.migrate.*`);
   - (c) cita um host remoto do Supabase: `<algo>.pooler.supabase.com` ou `<algo>.supabase.co`;
   - (d) roda o CLI `supabase` com `link`, `--linked`, `--db-url`, ou `db push|pull|dump` sem `--local`;

   **Then** o hook sai com código 2 e a mensagem `Comandos em bancos remotos são do PO: <motivo>. Passe o comando para o PO rodar.` **And** passam (exit 0, sem saída): `npm run db:migrate`, `npm run db:migrate -- --env local`, `npm run db:reset:local`, `npm run db:start|stop|status`, `supabase start|stop|status|db reset` (local), `npx vitest run …`, e textos que só citam o migrate remoto sem executá-lo (`grep -n "db:migrate -- --env staging" README.md`, `git commit -m "… --env staging …"`, `gh pr create --body "… --env production …"`, `echo …`).

3. **Camada 2: arquivos de banco remoto nas ferramentas de arquivo.** **Given** o mesmo hook, registrado também para `Read|Grep|Write|Edit|MultiEdit` **When** `Read`/`Write`/`Edit`/`MultiEdit` têm `file_path` cujo nome é um dos quatro arquivos do AC 2(b), ou `Grep` tem `path` com um desses nomes ou `glob` que começa por `.env` **Then** o hook bloqueia com a mesma mensagem. **And** `.env.local`, `.env.example` e qualquer outro arquivo passam.

4. **Camada 2: Skill BMAD só com o sim do PO.** **Given** o hook `PreToolUse` novo para `Skill` (`.claude/hooks/bmad-skill-guard.mjs`, lógica em `scripts/bmad/skill-guard.mjs`) **When** o Claude chama a ferramenta Skill com `tool_input.skill` começando por `bmad-` (workflows, agentes e demais skills BMAD; aceitar prefixo de plugin `<nome>:bmad-…`) **Then**:
   - em `permission_mode` `default`, `acceptEdits`, `auto` ou `plan` (ou ausente): o hook sai 0 com o JSON `{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"Processo BMAD: o Claude quer invocar <skill> por conta própria. Confirme só se você pediu esta etapa (CLAUDE.md, \"Quem conduz\")."}}`, que abre a confirmação nativa do Claude Code. É essa confirmação que conta como "confirmação explícita" do PO;
   - em `bypassPermissions` ou `dontAsk` (a confirmação pode não aparecer): sai 2 com `Bloqueado pelo processo BMAD: invocar <skill> exige o sim do PO. Peça ao PO para digitar /<skill>.`;
   - Skill que não é BMAD (ex.: `simplify`, `vercel:deploy`): sai 0 sem saída.
   **And** o comando `/bmad-…` digitado pelo PO não passa por este hook (a documentação de hooks: "typing `/skillname` directly bypasses `PreToolUse`"), então continua funcionando sem confirmação extra.

5. **Testes dos casos reais de 2026-11-16 (TDD).** **Given** os testes co-localizados **When** rodam **Then** é bloqueado o caso real `CI=true DATABASE_URL=postgresql://postgres.ref:senha@aws-1-us-east-2.pooler.supabase.com:6543/postgres npx tsx scripts/migrate.ts --env staging` (por (a) e por (c)), e também `npm run db:migrate -- --env production --confirm-production`, `npx tsx scripts/migrate.ts --env=staging`, `cd scripts && npx tsx migrate.ts --env staging`, `cat .env.migrate.staging`, `source .env.migrate.production && psql "$DATABASE_URL"`, `psql "postgresql://…@db.ref.supabase.co:5432/postgres"`, `npx supabase db push`, `Read` de `/repo/.env.migrate.production`; **And** o caso real "voltou para review" → Skill `bmad-bmm-code-review` em modo `auto` recebe `ask` (nunca passa direto); **And** todos os casos permitidos do AC 2 e AC 3 passam.

6. **Falha segura e desempenho.** **Given** os dois hooks novos **When** a entrada é inválida **Then** bloqueiam (exit 2) só se o texto bruto citar algo protegido (nome de arquivo do AC 2(b), `--env staging|production` ou `bmad-`); senão saem 0. **And** nenhum dos dois lê o transcript (decisão só pela entrada da ferramenta), rodam com `node` puro (`.mjs`, Node 22.16 não executa TypeScript) e têm `timeout` explícito no `settings.json`. **And** o hook da 1.14 (`bmad-story-guard`) e seus 83 testes continuam como estão.

7. **Limites documentados.** **Given** o `CLAUDE.md` e o README **When** alguém lê sobre as proteções **Then** a seção "Limites das proteções" do `CLAUDE.md` e a seção "Processo BMAD e proteções" do README citam os hooks novos e o que eles não cobrem (texto em Dev Notes, "Limites a documentar").

8. **Validação.** **Given** a story está completa **When** a validação roda **Then** TDD com a saída vermelha no Debug Log, `npx tsc --noEmit` 0 erros, `npm run lint` 0 avisos, `npx vitest run` 100%, `npx next build` ok, CI da PR verde (`ci` e `bmad-process`) **And** os hooks são testados de verdade na sessão (Task 6), sem nenhum comando que alcance staging ou produção se o hook falhar.

## Tasks / Subtasks

<!-- Sem UI: a Fase 0 (Design System & Protótipos) não se aplica. -->

- [x] Task 1 (AC: #2, #3, #5, #6): lógica do guard de bancos remotos com TDD, `scripts/bmad/remote-db-guard.mjs`
  - [x] 1.1 Testes vermelhos em `scripts/bmad/remote-db-guard.test.ts` (todos os bloqueios e permissões dos AC 2, 3 e 5, em `it.each`); colar a saída vermelha no Debug Log
  - [x] 1.2 Exportar de `scripts/bmad/story-guard.mjs` o `SEGMENT_SPLIT` e o `unquote` e reutilizá-los (não duplicar a divisão de trechos)
  - [x] 1.3 Implementar funções puras: `classifyRemoteAccess(toolName, toolInput)` → `{ blocked: false } | { blocked: true, reason }` e `evaluateRemote(input)` → `Decision` (mesmo formato `{ allow } | { allow: false, reason }` da 1.14)
  - [x] 1.4 Verde + refatorar
- [x] Task 2 (AC: #4, #5, #6): lógica do guard de Skill com TDD, `scripts/bmad/skill-guard.mjs`
  - [x] 2.1 Testes vermelhos em `scripts/bmad/skill-guard.test.ts`: `ask` nos modos `default`/`acceptEdits`/`auto`/`plan`/ausente; `deny` em `bypassPermissions`/`dontAsk`; sem decisão para Skill não BMAD; prefixo de plugin; caso real (`bmad-bmm-code-review`, modo `auto`) → `ask`
  - [x] 2.2 Implementar `decideSkill(input)` → `{ decision: 'none' } | { decision: 'ask', reason } | { decision: 'deny', reason }`
  - [x] 2.3 Verde + refatorar
- [x] Task 3 (AC: #2, #3, #4, #6): entrypoints e registro
  - [x] 3.1 `.claude/hooks/remote-db-guard.mjs` e `.claude/hooks/bmad-skill-guard.mjs`, no molde de `.claude/hooks/bmad-story-guard.mjs` (stdin → decisão → exit 0/2; o de Skill imprime o JSON `ask` no stdout com exit 0)
  - [x] 3.2 `.claude/settings.json`: manter a entrada atual e acrescentar duas em `PreToolUse` (ver "settings.json final")
  - [x] 3.3 Teste de integração com `child_process` (como `scripts/bmad/story-guard-hook.test.ts`): bloqueio do caso real do migrate (exit 2, stderr com "Comandos em bancos remotos são do PO"); comando comum (exit 0, sem saída); Skill BMAD → stdout com o JSON `ask`; Skill BMAD em `bypassPermissions` → exit 2; entradas inválidas (AC 6)
- [x] Task 4 (AC: #1, #7): `CLAUDE.md` com o conteúdo novo e a seção "Limites das proteções" atualizada
- [x] Task 5 (AC: #7): README ("Processo BMAD e proteções": linhas dos hooks novos na tabela e limites) e `_bmad-output/project-context.md` ("Git & Branching": item apontando para "Quem conduz" e "Bancos remotos" do `CLAUDE.md`)
- [x] Task 6 (AC: #8): validação
  - [x] 6.1 `npx tsc --noEmit`, `npm run lint`, `npx vitest run`, `npx next build`
  - [x] 6.2 Teste real na sessão. O Claude Code carrega os hooks no início da sessão: o PO abre `/hooks` (ou reinicia a sessão) antes. **Só comandos inofensivos se o hook não estiver ativo:**
    - `npx tsx scripts/nao-existe/migrate.ts --env staging` → deve ser bloqueado (sem hook, falha por arquivo inexistente, sem conectar em nada);
    - `test -f .env.migrate.staging` → deve ser bloqueado (sem hook, não imprime nada);
    - `Read` de `.env.migrate.staging` **não** é usado no teste (sem hook, mostraria a URL);
    - Skill `bmad-help`: **avisar o PO antes**; deve aparecer a confirmação nativa e o PO recusa;
    - `npm run db:status` e `cat README.md` → passam.
    Registrar resultados no Debug Log.
  - [x] 6.3 PR para `staging`; CI verde

### Review Follow-ups (AI)

- [x] [AI-Review][High] Subshell escapa da regra (a)/(d): `(npx tsx scripts/migrate.ts --env staging)`, `echo $(npx tsx … --env staging)` e a forma com crases passam, porque o 1º token vira `(npx`/`$(npx`, fora de `EXECUTORS`. Tirar `(`, `$(` e a crase do início do token (e tratar o conteúdo de `$(…)`/crases como trecho) [scripts/bmad/remote-db-guard.mjs:53-58, :72]
- [x] [AI-Review][High] `npx supabase@latest db push` e `npx supabase@2 link …` passam: `supabaseReason` compara o basename com `'supabase'` exato. Aceitar `supabase@<versão>` [scripts/bmad/remote-db-guard.mjs:81-86]
- [x] [AI-Review][Medium] Expansão de chaves escapa da regra (b): `cat .env.migrate.{staging,production}` e `cat .env.{migrate.staging,x}` passam, porque `ENV_GLOB_RE` só reconhece `*`, `?`, `[`. Incluir `{` [scripts/bmad/remote-db-guard.mjs:40]
- [x] [AI-Review][Medium] Redirecionamento colado ao nome passa: `echo x >.env.migrate.staging` e `echo x>>.env.migrate.production` (o lookbehind do `ENV_FILE_RE` aceita `<` mas não `>`), permitindo sobrescrever as credenciais do PO [scripts/bmad/remote-db-guard.mjs:38]
- [x] [AI-Review][Medium] Testes das variações acima ausentes (subshell, crases, `supabase@x`, chaves, `>` colado): acrescentar ao `it.each` com TDD (vermelho no Debug Log) [scripts/bmad/remote-db-guard.test.ts]
- [x] [AI-Review][Low] Falsos positivos contra o AC 2 ("passam … `echo …`"): `echo "a; npx tsx migrate.ts --env staging"` e `git commit -m` com quebra de linha real antes do migrate remoto são bloqueados, porque o `SEGMENT_SPLIT` ignora aspas. Corrigir ou documentar nos limites [scripts/bmad/remote-db-guard.mjs:101; CLAUDE.md "Limites das proteções"]
- [x] [AI-Review][Low] Subcomandos do CLI `supabase` que usam o projeto linkado por padrão passam (`migration list`, `migration repair`, `inspect db …`). Hoje o risco é baixo (sem `project-ref` em `supabase/.temp`, `link` bloqueado); documentar nos limites [CLAUDE.md; README.md]
- [x] [AI-Review][Low] Prefixos fora da lista de executores (`sudo`, `command`, `nice`, `exec`) antes do migrate remoto passam; segue o AC, mas citar os exemplos em "Limites das proteções" [CLAUDE.md; README.md]

#### 2ª rodada (code review de 2026-11-17, depois dos follow-ups)

- [x] [AI-Review][High] Palavras-chave do shell e `&` simples escapam da regra (a): `if true; then npx tsx scripts/migrate.ts --env staging; fi`, `for e in x; do npx tsx … --env staging; done`, `{ npx tsx … --env staging; }`, `! npx tsx … --env staging` e `sleep 1 & npx tsx … --env staging` passam (1º token `then`/`do`/`{`/`!`/`sleep`; `&` simples fora do `SEGMENT_SPLIT`). Pular palavras-chave (`then`, `do`, `else`, `elif`, `{`, `!`) e dividir também por `&` simples (não `&&`, `&>`, `>&`) [scripts/bmad/remote-db-guard.mjs:56-61, :105-115]
- [x] [AI-Review][Medium] `--env` com variável passa: `for e in staging production; do npm run db:migrate -- --env $e; done` e `E=staging; npx tsx scripts/migrate.ts --env $E`. No migrate, tratar como remoto o valor de `--env` que começa por `$` [scripts/bmad/remote-db-guard.mjs:64-71]
- [x] [AI-Review][Medium] Redirecionamento ou `&` colado ao valor do `--env` passa: `… --env staging>out.log`, `… --env staging&` (token `staging>out.log`). Cortar o valor em `>`, `<`, `&`, `|` antes de comparar [scripts/bmad/remote-db-guard.mjs:64-71]
- [x] [AI-Review][Medium] Nome de arquivo montado com aspas ou barra invertida escapa da regra (b): `cat .env.migrate.sta"ging"`, `cat ".env.migrate."staging`, `cat .env.migrate.stag\ing`. Aplicar `ENV_FILE_RE`/`ENV_GLOB_RE` também ao comando sem aspas e sem `\` [scripts/bmad/remote-db-guard.mjs:116-118]
- [x] [AI-Review][Medium] Opção com valor antes do subcomando escapa da regra (d): `supabase --workdir . db push` e `npx -p supabase supabase db push` (1º posicional vira `.`/`supabase`). Procurar `link` e `db` + `push|pull|dump` em qualquer posição dos argumentos; testes com TDD para todos os itens desta rodada no `it.each` [scripts/bmad/remote-db-guard.mjs:90-99; scripts/bmad/remote-db-guard.test.ts]
- [x] [AI-Review][Low] `isBmadSkill` não normaliza o nome: `' bmad-help'` e `BMAD-help` recebem `none`. Aplicar `trim()` e `toLowerCase()` antes de comparar [scripts/bmad/skill-guard.mjs:17-22]
- [x] [AI-Review][Low] Follow-ups da 1ª rodada ainda não commitados: o "CI verde" do AC 8 (PR #54) vale para `15b099e`. Commitar, dar push e conferir o CI de novo [AC 8]

#### 3ª rodada (code review de 2026-11-17, depois dos follow-ups da 2ª rodada)

- [x] [AI-Review][High] Busca recursiva lê os arquivos de banco remoto sem citar o nome: `grep -rn DATABASE_URL .`, `grep -rn pooler .` e `rg --no-ignore …` passam (o `grep -r` não respeita o `.gitignore` e imprime a URL de staging com a senha). Os limites só citam a ferramenta `Grep`. Bloquear `grep -r|-R` e `rg -u|--no-ignore|--hidden` sobre a raiz ou um diretório pai, ou ao menos documentar nos limites (AC 7) [scripts/bmad/remote-db-guard.mjs:125-146; CLAUDE.md "Limites das proteções"]
- [x] [AI-Review][High] Migrate sem extensão passa: `npx tsx scripts/migrate --env staging` (o `tsx` resolve a entrada sem extensão; conferido com arquivo inofensivo). Aceitar `migrate` com ou sem extensão (ex.: `/(^|\/)migrate(\.[cm]?[tj]s)?$/`) [scripts/bmad/remote-db-guard.mjs:92]
- [x] [AI-Review][Medium] Valor do `--env` montado com `\` ou crase passa: `--env stag\ing`, `--env=prod\uction`, `` --env `echo staging` ``. Tirar `\` do valor antes de comparar e tratar valor começando por crase como dinâmico (igual ao `$`) [scripts/bmad/remote-db-guard.mjs:73-77]
- [x] [AI-Review][Medium] Nome do arquivo dentro de chaves passa: `cat {.env.migrate.staging,README.md}`, `cat {README.md,.env.migrate.production}` (falta `{`/`,` no lookbehind e `,`/`}` no lookahead do `ENV_FILE_RE`) [scripts/bmad/remote-db-guard.mjs:37-38]
- [x] [AI-Review][Medium] Glob que não começa por `.env` literal passa e não está nos limites: `cat .*staging`, `cat .e*.staging`, `cat .[e]nv.migrate.staging`. Sugestão (resolve também o item das chaves): para cada token com `*?[{`, testar `path.matchesGlob(nome, token)` contra `REMOTE_ENV_FILES`; testes com TDD para todos os itens desta rodada no `it.each` [scripts/bmad/remote-db-guard.mjs:41, :139-143; scripts/bmad/remote-db-guard.test.ts]
- [x] [AI-Review][Low] `supabase … --project-ref`/`--project-id` (ex.: `supabase gen types typescript --project-id …`, que lê o schema remoto) passa e não está nos limites. Bloquear ou documentar [scripts/bmad/remote-db-guard.mjs:103-122; CLAUDE.md]
- [x] [AI-Review][Low] Mensagem de `deny` da Skill usa o nome cru: `' BMAD-help'` gera "digitar `/ BMAD-help`". Usar o nome normalizado na mensagem [scripts/bmad/skill-guard.mjs:28-31, :41]
- [x] [AI-Review][Low] Nome montado por variável passa: `F=.env.migrate; cat $F.staging`. Documentar nos limites [CLAUDE.md "Limites das proteções"]

#### 4ª rodada (code review de 2026-11-17, depois dos follow-ups da 3ª rodada)

- [x] [AI-Review][High] `rg` com glob positivo lê os arquivos de banco remoto: no ripgrep, `-g`/`--glob`/`--iglob` passa por cima do `.gitignore` e do filtro de ocultos (conferido com arquivo inofensivo ignorado). `rg -g '*staging' DATABASE_URL`, `rg --glob=*.production …`, `rg -g '*' …`, `rg -g '*.{staging,production}' …` passam: `searchReason` só olha `-u`/`--hidden`/`--no-ignore`. Avaliar os globs do `rg` com a semântica do ripgrep (sem a regra do `.` inicial, `--iglob` sem diferenciar maiúsculas, `**/`) contra `REMOTE_ENV_FILES`, sem caminho ou com caminho que alcança a raiz [scripts/bmad/remote-db-guard.mjs:229-235]
- [x] [AI-Review][High] Ferramenta `Grep` com `glob` (repassado ao `rg --glob`) passa: `glob: '*staging'`, `'*'`, `'**/*staging'`, `'*.{staging,production}'`. `globRegex` aplica a regra do shell (nome com `.` inicial só casa com glob que começa por `.`), que não vale no ripgrep; os testes fixam a semântica errada. Corrigir junto do item acima, com TDD (casos `rg -g` e `Grep` + `glob: '*…'` no `it.each`) e ajustar a justificativa do limite "`Grep` sem `path`/`glob`" [scripts/bmad/remote-db-guard.mjs:313, :406-414; scripts/bmad/remote-db-guard.test.ts; CLAUDE.md]
- [x] [AI-Review][Medium] Expansão de chaves exponencial: `echo {a,b}…` com 20 grupos leva 2,4 s no guard e ~22 grupos passam do `timeout: 10`; hook com timeout não bloqueia, então `echo {a,b}×25; cat .[e]nv.migrate.staging` passa (contraria o AC 6). Limitar o número de alternativas (ex.: 1000) e bloquear acima do limite; teste de desempenho [scripts/bmad/remote-db-guard.mjs:281-302, :377]
- [x] [AI-Review][Medium] `git grep --untracked --no-exclude-standard DATABASE_URL` lê arquivos ignorados (conferido) e passa; os limites citam só `git grep --no-index`. Bloquear ou documentar [scripts/bmad/remote-db-guard.mjs:213-238; CLAUDE.md "Limites das proteções"]
- [x] [AI-Review][Low] `shopt -s dotglob` e `GLOBIGNORE=…` fazem `cat *staging` e `grep -rn x *` alcançarem os arquivos com `.` inicial (conferido no bash); o guard supõe o padrão do shell. Bloquear essas formas ou documentar [scripts/bmad/remote-db-guard.mjs:313; CLAUDE.md]
- [x] [AI-Review][Low] Limite do `cd` estreito demais: além de `cd .. && grep -r x caderninho`, qualquer `cd` para fora do projeto passa (ex.: `cd / && grep -rn x home/…/caderninho`). Ampliar a redação [CLAUDE.md "Limites das proteções"]
- [x] [AI-Review][Low] Follow-ups da 3ª rodada não commitados: o "CI verde" do AC 8 vale para `b16acb7`. Commitar, dar push e conferir o CI de novo [AC 8]

#### 5ª rodada (code review de 2026-11-17, depois dos follow-ups da 4ª rodada)

- [ ] [AI-Review][High] Nomes gerados durante a execução escapam do guard e não estão nos limites: `ls -A | xargs grep DATABASE_URL`, `git ls-files -o -i --exclude-standard | xargs cat`, `git status --ignored --porcelain | cut -c4- | xargs cat`, `cat $(ls -A | grep migrate)` e `git add -f . && git diff --cached` (este também deixa o segredo pronto para commit e push) passam. Bloquear as formas comuns (`ls -a|-A` ou `git ls-files -o|-i`/`git status --ignored` alimentando `xargs`, `git add -f|--force` sem caminho ou sobre a raiz) e documentar a classe ("nomes produzidos em tempo de execução") em "Limites das proteções" [scripts/bmad/remote-db-guard.mjs:472-501; CLAUDE.md]
- [ ] [AI-Review][Medium] Expansões que viram texto vazio montam o nome ou o valor do `--env`: `cat .env.migrate.staging$NOPE`, `.env.migrate.sta$()ging`, `` .env.migrate.sta``ging ``, `.env.migrate.sta$''ging`, `cat $'\x2eenv.migrate.staging'`; `--env staging$NOPE`, `--env sta$()ging`, `--env stag$'i'ng`. Tratar como dinâmico (remoto) valor do `--env` que contenha `$` ou crase; conferir os nomes também com essas expansões removidas e `$'…'` decodificado; testes com TDD no `it.each` [scripts/bmad/remote-db-guard.mjs:124-130, :489-493; scripts/bmad/remote-db-guard.test.ts]
- [ ] [AI-Review][Medium] Prefixos e `xargs` deixam o migrate remoto passar: `eval npx tsx scripts/migrate.ts --env staging` (builtin, fora dos limites), `stdbuf`, `watch`, `corepack pnpm db:migrate --env staging`; `echo staging | xargs -I{} npx tsx scripts/migrate.ts --env {}` e `… | xargs npx tsx scripts/migrate.ts --env`. Incluir `eval`; com `xargs`, tratar `--env` sem valor ou com `{}` como dinâmico; documentar os demais prefixos [scripts/bmad/remote-db-guard.mjs:31-34, :133-150; CLAUDE.md]
- [x] [AI-Review][Medium] Abordagem no limite: 5ª rodada de casos que escapam de uma lista de bloqueio sobre o texto do shell (guard com 589 linhas, analisador de shell feito à mão). Levar ao PO a proposta de um `/bmad-bmm-correct-course` para avaliar um controle no nível do sistema (tirar os `.env.migrate.*` da pasta do repositório, decisão da Story 1.13, ou sandbox do Claude Code bloqueando a leitura desses arquivos), com o hook como segunda camada. Fora do escopo desta story: registrar a decisão do PO no Dev Agent Record [scripts/bmad/remote-db-guard.mjs]
- [ ] [AI-Review][Low] Outras ferramentas de busca não cobertas nem documentadas: `ag -u`, `ag --hidden --skip-vcs-ignores`, `ugrep -r`, `ack`, e `RIPGREP_CONFIG_PATH=… rg` com config que ative `--no-ignore`. Documentar nos limites (ou bloquear) [CLAUDE.md "Limites das proteções"]
- [ ] [AI-Review][Low] Hosts não são conferidos no comando sem aspas, ao contrário dos nomes: `psql -h aws-1.pooler.supa""base.com` passa. Aplicar `HOST_RES` também ao texto sem aspas e sem `\` [scripts/bmad/remote-db-guard.mjs:499]
- [ ] [AI-Review][Low] O item "Bancos remotos" de "Limites das proteções" virou um bullet único de ~30 linhas, carregado em toda sessão e difícil de conferir contra o código. Dividir em "Bloqueia" e "Não cobre", um exemplo por item [CLAUDE.md]

## Dev Notes

### Conteúdo novo do CLAUDE.md (Camada 1)

Base: Proposta 1 do correct course de 2026-11-16, com os nomes de arquivo do correct course de 2026-11-17. O primeiro item de "Processo BMAD" muda (hoje diz "Sempre invocados pela ferramenta Skill", o que contradiz "Quem conduz"):

```markdown
- Criar story → `/bmad-bmm-create-story`. Implementar → `/bmad-bmm-dev-story`.
  Revisar → `/bmad-bmm-code-review`. Mudar o rumo → `/bmad-bmm-correct-course`.
  Sempre invocados de verdade (comando digitado pelo PO ou, com o sim dele, ferramenta Skill)
  e seguidos pelo `workflow.xml`, nunca "imitando o formato".
```

Novas seções, logo depois de "Processo BMAD" e antes de "Git":

```markdown
## Quem conduz
- O PO conduz o processo. O Claude nunca invoca um workflow ou agente BMAD, nem começa
  a próxima etapa, por iniciativa própria: pergunta "posso assumir?" e espera o sim.
  Aviso de estado ("voltou para review", "merge feito") não é pedido de execução.
- Com um agente BMAD ativo, o Claude mantém a persona até o PO encerrar o agente.
- O escopo de uma opção de workflow é o que o workflow diz; ampliar exige perguntar.

## Bancos remotos
- O Claude nunca executa comandos contra staging ou produção, nem "só para testar" ou "só leitura":
  `db:migrate -- --env staging|production`, `scripts/migrate.ts --env staging|production`,
  clientes SQL ou CLI `supabase` apontando para os projetos remotos.
- O Claude não lê nem altera `.env.migrate.staging`/`.env.migrate.production` (nem os nomes
  antigos `.env.staging.local`/`.env.production.local`). Quem roda é o PO: o Claude passa o comando.
```

### Limites a documentar (AC 7)

Acrescentar em "Limites das proteções" do `CLAUDE.md` (a frase de abertura passa de "três camadas (Story 1.14)" para "três camadas (Stories 1.14 e 1.15)" e cita os três hooks):

- Bancos remotos: o hook reconhece o migrate remoto só quando o comando do trecho é um dos executores listados; nomes dos quatro arquivos e globs `.env*` em qualquer comando, inclusive em buscas (para procurar o texto, use `env\.migrate`); hosts `*.pooler.supabase.com`/`*.supabase.co`; `supabase link`/`--linked`/`--db-url`/`db push|pull|dump`. Não cobre: URL remota já exportada numa variável do shell, scripts que leem os arquivos por conta própria, `vercel env pull`, servidores MCP de banco, `Grep` sem `path`/`glob` que percorra a raiz (os arquivos estão no `.gitignore`).
- Skill BMAD: o hook pede confirmação a cada invocação pela ferramenta Skill; o comando digitado pelo PO não passa por ele. Em `bypassPermissions`/`dontAsk`, bloqueia. Não vê o Claude "assumindo" uma etapa sem a Skill (ex.: seguir um `workflow.yaml` lido sem agente): a Camada 1 e o hook da 1.14 cobrem.

No README, a tabela ganha uma linha por hook novo; a frase de limites continua apontando para o `CLAUDE.md`.

### settings.json final

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit|Bash",
        "hooks": [{ "type": "command", "command": "node", "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/bmad-story-guard.mjs"], "timeout": 10 }]
      },
      {
        "matcher": "Bash|Read|Grep|Write|Edit|MultiEdit",
        "hooks": [{ "type": "command", "command": "node", "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/remote-db-guard.mjs"], "timeout": 10 }]
      },
      {
        "matcher": "Skill",
        "hooks": [{ "type": "command", "command": "node", "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/bmad-skill-guard.mjs"], "timeout": 10 }]
      }
    ]
  }
}
```

Hooks separados (em vez de crescer o `bmad-story-guard`): cada um com uma responsabilidade, sem leitura de transcript nos novos, e os testes da 1.14 intactos. Quando hooks divergem, a precedência é `deny` > `ask` > `allow`.

### Contrato do hook (code.claude.com/docs/en/hooks, consultado em 2026-11-17)

- **Bloquear:** exit 2 + motivo no stderr (é o que a 1.14 usa). JSON no stdout só é lido com exit 0.
- **Perguntar ao PO:** exit 0 com `{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"…"}}`. "`ask` prompts the user to confirm." No modo `auto`: "a PreToolUse hook's `ask` normally sends the tool call to the permission prompt, and the classifier doesn't decide it." A doc **não** descreve `ask` em `bypassPermissions`, por isso o `deny` nesse modo (e em `dontAsk`).
- **Skill:** "A `PreToolUse` hook matching the `Skill` tool fires only when Claude calls the tool, but typing `/skillname` directly bypasses `PreToolUse`." O `tool_input` da Skill tem `skill` (ex.: `"bmad-bmm-code-review"`) e `args` (formato visto nos transcripts).
- **Entrada:** `permission_mode` ∈ `default`, `plan`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`. `Read`: `file_path` (sempre absoluto). `Grep`: `pattern`, `path`, `glob`, `output_mode`. `Write`/`Edit`/`MultiEdit`: `file_path`.
- **Matcher:** só letras e `|` = nomes exatos (`Skill` casa só a ferramenta Skill).

### Por que `ask` e não ler a última mensagem do PO (viabilidade do AC do épico)

O épico deixou para o `create-story` decidir como reconhecer "comando `/bmad-…` ou confirmação explícita". Transcripts reais analisados (sem copiar conteúdo):

- Mensagens do PO são entradas `type: "user"` com `origin.kind: "human"` e sem `isMeta`. Comandos aparecem como `<command-name>/bmad-…</command-name>`; a expansão do comando é uma entrada `isMeta: true`; resultados de ferramenta são `type: "user"` com blocos `tool_result`.
- Como o comando digitado nunca passa pelo hook de Skill, **toda** chamada da Skill vista pelo hook é iniciativa do Claude. Resta distinguir "confirmação explícita" no texto livre ("sim, troca a base para staging e roda o code review", "pode", "1"), o que é heurística frágil: falso positivo libera, falso negativo trava sem saída (o Claude pergunta, o PO diz "sim", e a Skill continua bloqueada).
- O `ask` transforma a confirmação em um clique do PO na janela nativa: determinístico, sem ler o transcript, cobre o caso real (o PO veria a janela e recusaria). Custo: quando o PO já pediu em texto, confirma mais uma vez.

### Detecção no `Bash` (Task 1)

- Dividir por trecho com o `SEGMENT_SPLIT` da 1.14 (exportar; não duplicar). Tokens por espaço e `unquote` por token (`"npm` → `npm`), como em `writeDestinations`.
- Comando do trecho: primeiro token depois de pular `NOME=valor` (regex `^[A-Za-z_][A-Za-z0-9_]*=`); comparar o **basename** com a lista de executores do AC 2(a). `cd` não importa aqui: o nome do arquivo basta.
- Migrate: algum token igual a `db:migrate` ou terminado em `migrate.ts`; env remoto: token `--env` seguido de `staging|production`, ou `--env=staging|production`.
- Nomes de arquivo (b) e hosts (c): regex sobre o **comando inteiro** (inclui heredocs e strings). Sugestão: `/(?:^|[\s\/=:<('"])\.env\.(?:migrate\.(?:staging|production)|(?:staging|production)\.local)(?=$|[\s'"`;|&)>])/` e `/(?:^|[\s\/=:<('"])\.env[^\s'"`;|&)]*[*?[]/`; hosts: `/[a-z0-9-]+\.pooler\.supabase\.com\b/i` e `/\b[a-z0-9-]+\.supabase\.co\b/i` (com subdomínio; `supabase.com` sozinho, como no texto "docs do supabase.com", passa).
- `supabase` (d): basename `supabase`, ou `npx supabase`; bloquear `link`, `--linked`, `--db-url=` / `--db-url`, e `db push|pull|dump` sem `--local`. `start`, `stop`, `status`, `db reset` (sem `--linked`) passam: são o banco local (`package.json`: `db:start`, `db:reset:local`).
- **Atenção ao heredoc:** `\n` divide trechos, então uma linha `npx tsx scripts/migrate.ts --env staging` dentro de um heredoc é tratada como execução. Para criar fixtures e testes com esses textos, use a ferramenta `Write`, nunca `cat <<EOF`/`python3 - <<EOF` (a 1.14 já tropeçou em heredoc na Task 6.2).
- **Atenção ao commit e à PR desta story:** a mensagem e a descrição vão citar `.env.migrate.*` e hosts. Com o hook ativo, `git commit -m "…"` e `gh pr create --body "…"` com esses textos são bloqueados (as regras (b) e (c) valem para o comando inteiro). Escrever o texto num arquivo do scratchpad com `Write` e usar `git commit -F <arquivo>` / `gh pr create --body-file <arquivo>`. Pelo mesmo motivo, `git check-ignore .env.migrate.staging` é bloqueado: conferir o `.gitignore` com outro nome do padrão (ex.: `git check-ignore -v .env.migrate.x`).

### Arquitetura e padrões a seguir

- **TDD obrigatório** (project-context, Testing Rules): teste antes, vermelho registrado, depois implementação.
- Lógica pura em `scripts/bmad/*.mjs`, entrypoint fino em `.claude/hooks/*.mjs`, testes `.ts` co-localizados importando o `.mjs` (`allowJs`), como na 1.14. Se o import gerar erro de tipos, criar `.d.mts` em vez de desligar checagens.
- **Sem segredos em log:** as mensagens dos hooks citam o motivo (ex.: "cita .env.migrate.staging", "host remoto do Supabase"), **nunca** o comando inteiro (pode conter a URL com senha, como no caso real).
- `ESLint` cobre `scripts/` e `.claude/hooks/`. Mensagens e documentação em português.
- Nada muda em `scripts/migrate.ts`, `scripts/lib/migrate-env.ts`, no CI (`deploy-migrations` roda no GitHub Actions, onde não há hook) nem em `.claude/commands/`. `.claude/settings.local.json` (pessoal) não é versionado nem alterado.

### Aprendizados da Story 1.14 (anterior)

- O hook novo só vale depois que a sessão o carrega: a 1ª tentativa da Task 6.2 da 1.14 não bloqueou por isso. Por isso a Task 6.2 desta story usa só comandos que não fazem mal se o hook ainda não estiver ativo.
- Citar um caminho dentro de um heredoc liberou/afetou a decisão do guard na 1.14; aqui o efeito é o contrário (bloqueio). Fixtures e testes pela ferramenta `Write`.
- O code review da 1.14 achou variações que escapavam (`>|`, `--in-place`, `cd … &&`, `~`/`$VAR`): cobrir aqui as variações equivalentes (`--env=`, `cd scripts && npx tsx migrate.ts`, caminho com `./`, aspas, prefixo `VAR=valor`).
- Dogfooding: rodar o próprio `check-story-process` nesta story antes do `review` (a 1.14 descobriu um falso positivo assim).
- Fixtures sintéticas: nunca copiar trechos do transcript real (dados privados). Esta story não precisa de fixture de transcript: os hooks novos não leem o transcript.

### Git intelligence

- Últimos commits em `main`/`staging`: `2152903` Story 1.13 (#51, migrate por ambiente, `.env.migrate.*`), `4d347f2` Story 1.14 (#53, hook e `bmad-process`), `5a68463` correct course do desvio (#52). Padrão: português, prefixo convencional (`feat:`, `fix:`, `docs:`, `ci:`), **sem** `Co-Authored-By` e PR **sem** "Generated with Claude Code" (preferência do PO).
- Branch atual: `feat/1-15-pedir-permissao-e-proteger-bancos-remotos`, a partir de `staging` com a 1.13 e a 1.14. PR para `staging`.
- A 1.13 já trocou os nomes (`ENV_FILES`, `LEGACY_ENV_FILES` em `scripts/lib/migrate-env.ts`); os arquivos `.env.migrate.*` existem na máquina do PO. Não reutilizar o `migrate-env.ts` no hook (é TS; o hook é `.mjs` puro): repetir os quatro nomes no guard, com comentário apontando para `ENV_FILES`/`LEGACY_ENV_FILES`.

### Project Structure Notes

- Novos: `scripts/bmad/remote-db-guard.mjs`, `scripts/bmad/remote-db-guard.test.ts`, `scripts/bmad/skill-guard.mjs`, `scripts/bmad/skill-guard.test.ts`, `.claude/hooks/remote-db-guard.mjs`, `.claude/hooks/bmad-skill-guard.mjs`, teste de integração dos entrypoints (ex.: `scripts/bmad/guard-hooks.test.ts`).
- Alterados: `scripts/bmad/story-guard.mjs` (só `export` de `SEGMENT_SPLIT` e `unquote`), `.claude/settings.json`, `CLAUDE.md`, `README.md`, `_bmad-output/project-context.md`.
- `epics.md` não muda: a regra de processo e a Story 1.15 já foram registradas pelo correct course (Proposta 2).

### References

- [Source: _bmad-output/planning-artifacts/sprint-change-proposal-2026-11-16.md#Proposta-1]
- [Source: _bmad-output/planning-artifacts/sprint-change-proposal-2026-11-17.md#4.6]
- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.15] e "Regras de Processo"
- [Source: _bmad-output/implementation-artifacts/1-14-protecoes-do-processo-bmad.md] (hook, padrão de testes, Task 6.2)
- [Source: scripts/bmad/story-guard.mjs] (`SEGMENT_SPLIT`, `unquote`, `writeDestinations`)
- [Source: scripts/lib/migrate-env.ts] (`ENV_FILES`, `LEGACY_ENV_FILES`, `parseMigrateArgs` aceita `--env x` e `--env=x`)
- [Source: code.claude.com/docs/en/hooks] (PreToolUse decision control, `ask` no modo auto, Skill e `/skillname`; consultado em 2026-11-17)

## Decisões do PO na criação (a confirmar)

1. **Critério da Skill (AC 4):** em vez de interpretar a última mensagem do PO, o hook pede a confirmação nativa (`ask`) em toda Skill BMAD chamada pelo Claude; em `bypassPermissions`/`dontAsk`, bloqueia. Motivo na seção "Por que `ask`".
2. **Ferramentas de arquivo (AC 3):** o épico fala só do `Bash`; o `Read` do `.env.migrate.*` expõe a mesma URL. Incluídos `Read`, `Grep`, `Write`, `Edit`, `MultiEdit`.
3. **Além do épico (AC 2(c) e (d)):** hosts remotos do Supabase e CLI `supabase` remoto, porque a regra "Bancos remotos" cita clientes SQL e o caso real incluiu uma consulta de leitura em staging.
4. **Falso positivo aceito:** buscas que citam os nomes dos arquivos (ex.: `grep -rn .env.migrate.staging docs/`) são bloqueadas; use `env\.migrate`. Documentado nos limites.

## Dev Agent Record

### Agent Model Used

Claude Opus 5.5 (claude-opus-5-5)

### Debug Log References

- Task 1.1/2.1 (vermelho, com stubs que só exportam as funções): `npx vitest run scripts/bmad/remote-db-guard.test.ts scripts/bmad/skill-guard.test.ts` → `Test Files 2 failed (2)`, `Tests 82 failed | 50 passed (132)` (os 50 que passaram são os casos "permitido", que o stub atende). Antes dos stubs: `Cannot find module './remote-db-guard.mjs'` / `'./skill-guard.mjs'`. Exemplos: `× caso real: bmad-bmm-code-review em modo auto recebe ask (nunca passa direto)`, `× modo bypassPermissions → deny`.
- Task 1.4 (verde): `remote-db-guard.test.ts` 108/108. Task 2.3 (verde): `skill-guard.test.ts` 24/24.
- Task 3.3 (vermelho): `guard-hooks.test.ts` → `Tests 9 failed (9)` (entrypoints inexistentes, `settings.json` sem os hooks novos). Verde: `scripts/bmad` 224/224.
- Task 6.1: `npx tsc --noEmit` apontou `tool_name` fora do tipo JSDoc de `decideSkill` no teste; corrigido o `@param` (sem desligar checagem) → 0 erros. `npm run lint` 0 avisos. `npx vitest run` 151 arquivos, 1501 testes ok. Testes da 1.14 (`story-guard`, `story-guard-hook`, `check-story-process`): 83/83. `npx next build` ok.
- Task 6.2 (sessão real, depois de o PO abrir `/hooks` e a sessão recarregar os hooks): `npx tsx scripts/nao-existe/migrate.ts --env staging` → bloqueado (`PreToolUse:Bash hook error: … remote-db-guard.mjs: Comandos em bancos remotos são do PO: roda o migrate em staging. Passe o comando para o PO rodar.`); `test -f .env.migrate.staging` → bloqueado (`… cita .env.migrate.staging …`); `npm run db:status` e `cat README.md` → passaram; Skill `bmad-help` (PO avisado antes) → abriu a confirmação nativa e o PO recusou ("funcionou"). `Read` do arquivo de banco remoto não foi usado no teste, como manda a story.
- Task 6.3: PR #54 para `staging`; CI verde (`ci`, `Processo BMAD (stories alteradas)`, `Migrations do zero`; `Migrations no banco do ambiente` pulado, como esperado em PR).
- Follow-ups do code review (vermelho): `npx vitest run scripts/bmad/remote-db-guard.test.ts` → `Tests 16 failed | 125 passed (141)`; ex.: `× bloqueia: (npx tsx scripts/migrate.ts --env staging)`, `× bloqueia: npx supabase@latest db push`, `× bloqueia: cat .env.migrate.{staging,production}`, `× bloqueia: echo x >.env.migrate.staging`. Verde: 141/141.
- Follow-ups (validação): `npx tsc --noEmit` 0 erros; `npm run lint` 0 avisos; `npx vitest run` 151 arquivos, 1534 testes ok; testes da 1.14: 83/83; `npx next build` ok. Sessão real: `echo $(npx tsx scripts/nao-existe/migrate.ts --env staging)` → bloqueado (`Comandos em bancos remotos são do PO: roda o migrate em staging.`).
- Follow-ups da 2ª rodada (vermelho): `npx vitest run scripts/bmad/remote-db-guard.test.ts scripts/bmad/skill-guard.test.ts` → `Tests 32 failed | 176 passed (208)`; ex.: `× bloqueia: if true; then npx tsx scripts/migrate.ts --env staging; fi`, `× bloqueia: sleep 1 & npx tsx scripts/migrate.ts --env staging`, `× bloqueia: E=staging; npx tsx scripts/migrate.ts --env $E`, `× bloqueia: npx tsx scripts/migrate.ts --env staging>out.log`, `× bloqueia: cat .env.migrate.sta"ging"`, `× bloqueia: supabase --workdir . db push`, `× qualquer skill BMAD (agentes, plugins) → ask: BMAD-help`. Verde: `scripts/bmad` 300/300.
- Follow-ups da 2ª rodada (validação): `npx tsc --noEmit` 0 erros; `npm run lint` 0 avisos; `npx vitest run` 151 arquivos, 1577 testes ok; testes da 1.14: 83/83; `npx next build` ok. Sessão real: `if true; then npx tsx scripts/nao-existe/migrate.ts --env staging; fi` → bloqueado (`Comandos em bancos remotos são do PO: roda o migrate em staging.`).
- Follow-ups da 2ª rodada (commit e CI): `be7c0bb` (follow-ups da 1ª e da 2ª rodada) no push da PR #54; CI verde (`ci`, `Processo BMAD (stories alteradas)`, `Migrations do zero`; `Migrations no banco do ambiente` pulado, como esperado em PR). `check-story-process` local: "Processo BMAD ok."
- Follow-ups da 3ª rodada (vermelho): `npx vitest run scripts/bmad/remote-db-guard.test.ts scripts/bmad/skill-guard.test.ts` → `Tests 48 failed | 236 passed (284)`; ex.: `× bloqueia: grep -rn DATABASE_URL .`, `× bloqueia: rg --no-ignore DATABASE_URL`, `× bloqueia: npx tsx scripts/migrate --env staging`, `× bloqueia: npx tsx scripts/migrate.ts --env stag\ing`, `× bloqueia: cat {README.md,.env.migrate.production}`, `× bloqueia: cat .[e]nv.migrate.staging`, `× bloqueia: supabase gen types typescript --project-id abcdefgh`, `× deny usa o nome normalizado: " BMAD-help"`. Casos do `Grep` acrescentados depois (`glob: '.*staging'` etc.): `remote-db-guard.test.ts` → `Tests 47 failed | 209 passed (256)`. Verde: `scripts/bmad` 381/381.
- Follow-ups da 3ª rodada (validação): `npx tsc --noEmit` 0 erros; `npm run lint` 0 avisos; `npx vitest run` 151 arquivos, 1658 testes ok; testes da 1.14: 83/83; `npx next build` ok; `check-story-process` local: "Processo BMAD ok.". Sessão real: `grep -rn <texto inexistente> .` → bloqueado (`busca recursiva que alcança os arquivos de banco remoto …`); `npx tsx scripts/nao-existe/migrate --env staging` → bloqueado (`roda o migrate em staging`); `test -f .[e]nv.migrate.staging` → bloqueado (`cita um glob que alcança .env.migrate.staging`); `grep -rn <texto inexistente> scripts/bmad` → passou.
- Follow-ups da 4ª rodada (vermelho): `npx vitest run scripts/bmad/remote-db-guard.test.ts` (com `-t` excluindo os 4 casos de chaves exponenciais, que travariam o guard antigo por 2^25+ alternativas) → `Tests 28 failed | 268 passed | 4 skipped (300)`; ex.: `× bloqueia: rg -g '*staging' DATABASE_URL`, `× bloqueia: rg --iglob '*STAGING' DATABASE_URL`, `× bloqueia: git grep --untracked --no-exclude-standard DATABASE_URL`, `× bloqueia: git grep --no-index DATABASE_URL`, `× bloqueia: shopt -s dotglob; cat *staging`, `× bloqueia: GLOBIGNORE=x; cat *staging`, `× bloqueia Grep {"pattern":"DATABASE_URL","glob":"*staging"}`, `× Grep com glob em subdiretório do cwd passa; na raiz ou fora dela, bloqueia`. Verde: `scripts/bmad` 425/425 (inclusive `{a,b}`×40 decidido em menos de 1 s).
- Follow-ups da 4ª rodada (validação): `npx tsc --noEmit` 0 erros; `npm run lint` 0 avisos; `npx vitest run` 151 arquivos, 1702 testes ok; testes da 1.14: 83/83; `npx next build` ok. Sessão real: `rg -g '*staging' <texto inexistente>` → bloqueado (`busca recursiva que alcança os arquivos de banco remoto …`); `git grep --no-index <texto inexistente>` → bloqueado (mesmo motivo); `rg -g '*.ts' -c <texto inexistente> scripts/bmad` → passou. A ferramenta `Grep` não estava disponível na sessão: o caso dela fica coberto pelos testes.
- Follow-ups da 4ª rodada (commit e CI): `fdd5684` (follow-ups da 3ª e da 4ª rodada) no push da PR #54. 1ª execução: `ci` e `Processo BMAD (stories alteradas)` verdes; `Migrations do zero` falhou por infraestrutura (`error from registry: Data limit exceeded` ao baixar a imagem do Postgres do Supabase, antes de qualquer migration). Job refeito (`gh run rerun --failed`): verde. `Migrations no banco do ambiente` pulado, como esperado em PR.

### Completion Notes List

- 2026-11-17 (create-story): Ultimate context engine analysis completed - comprehensive developer guide created. Criada pelo workflow `create-story` invocado pelo PO, a partir da Proposta 1 do correct course de 2026-11-16 e do 4.6 do correct course de 2026-11-17.
- 2026-11-17 (dev-story): o PO confirmou as 4 "Decisões do PO na criação" antes da implementação.
- Guard de bancos remotos (`scripts/bmad/remote-db-guard.mjs`): `classifyRemoteAccess`/`evaluateRemote`/`invalidInputDecision`, puras e sem transcript. No `Bash`, divide os trechos com o `SEGMENT_SPLIT` da 1.14 e tira as aspas com o `unquote` (agora exportados); pula `VAR=valor` e compara o basename do executor; detecta migrate com `--env x`/`--env=x` remoto e o CLI `supabase` remoto (inclusive via `npx`/`bunx`/`pnpm exec`). Nomes dos quatro arquivos, globs `.env*` e hosts do Supabase por regex no comando inteiro. `Read`/`Write`/`Edit`/`MultiEdit` pelo basename do `file_path`; `Grep` por `path` e `glob` (`.env` no início de um segmento do glob, inclusive `**/.env*`). Os motivos nunca repetem o comando.
- Guard de Skill (`scripts/bmad/skill-guard.mjs`): `decideSkill` → `ask` para skill BMAD (aceita `/` inicial e prefixo de plugin) em qualquer modo, menos `bypassPermissions`/`dontAsk` (`deny`); skill que não é BMAD → `none`. Modo desconhecido → `ask` (mais seguro que liberar).
- Entrypoints finos em `.claude/hooks/` (stdin → decisão; o de Skill imprime o JSON `ask` com exit 0) e registro no `.claude/settings.json` com `node` e `timeout: 10`, mantendo o hook da 1.14.
- `CLAUDE.md` com "Quem conduz", "Bancos remotos", primeiro item de "Processo BMAD" ajustado e "Limites das proteções" com os hooks novos; README (tabela e frase de abertura) e `project-context.md` ("Git & Branching").
- Testes: 108 (remote-db-guard) + 24 (skill-guard) + 9 (integração dos entrypoints e `settings.json`). Hooks testados de verdade na sessão (Task 6.2).
- 2026-11-17 (dev-story, follow-ups do code review):
  - ✅ Resolved review finding [High]: subshell escapava das regras (a)/(d). `classifyCommand` confere o trecho inteiro **e** cada pedaço separado por `(`, `)`, `$(` e crase (`SUBSHELL_SPLIT`); manter o trecho inteiro preserva casos já bloqueados, como `npx tsx $(pwd)/scripts/migrate.ts --env staging`. `SEGMENT_SPLIT` da 1.14 intocado.
  - ✅ Resolved review finding [High]: `supabase@<versão>` (npx/bunx/pnpm dlx) reconhecido como CLI (`isSupabase`).
  - ✅ Resolved review finding [Medium]: `{` incluído no `ENV_GLOB_RE` (expansão de chaves).
  - ✅ Resolved review finding [Medium]: `>` incluído no lookbehind do `ENV_FILE_RE` e do `ENV_GLOB_RE` (`>.env…`, `>>.env…`, `&>.env…`).
  - ✅ Resolved review finding [Medium]: 20 casos novos de bloqueio e 7 de permissão no `it.each` (TDD, vermelho no Debug Log).
  - ✅ Resolved review finding [Low]: falso positivo com aspas **documentado** (não corrigido) em "Limites das proteções" do `CLAUDE.md`, com a saída `git commit -F`/`gh pr create --body-file`; corrigir exigiria um analisador de shell próprio no lugar do `SEGMENT_SPLIT` reutilizado (Task 1.2). Teste fixa o comportamento.
  - ✅ Resolved review finding [Low]: subcomandos do CLI `supabase` que usam o projeto linkado documentados nos limites; teste fixa o comportamento.
  - ✅ Resolved review finding [Low]: prefixos `sudo`/`command`/`nice`/`exec` documentados nos limites; teste fixa o comportamento. O README não mudou: a frase de limites continua apontando para o `CLAUDE.md` (Dev Notes, "Limites a documentar").
- 2026-11-17 (dev-story, follow-ups da 2ª rodada do code review):
  - ✅ Resolved review finding [High]: palavras-chave do shell e `&` simples. `segmentTokens` pula `then`, `do`, `else`, `elif`, `{`, `!` e também `if`, `while`, `until` (mesmo problema: `if npx tsx … --env production; then`), misturados com `VAR=valor`. `classifyCommand` divide cada trecho também por `&` simples (`BACKGROUND_SPLIT`, sem `&&`, `&>`, `>&`); o `SEGMENT_SPLIT` da 1.14 continua intocado.
  - ✅ Resolved review finding [Medium]: valor do `--env` que começa por `$` (`$e`, `$E`, `"${E}"`) é tratado como remoto, com o motivo "roda o migrate com --env vindo de variável" (sem repetir o comando).
  - ✅ Resolved review finding [Medium]: valor do `--env` cortado em `<`, `>`, `&`, `|` antes de comparar (`staging>out.log`, `staging&`, `--env=production>>log`).
  - ✅ Resolved review finding [Medium]: `ENV_FILE_RE`/`ENV_GLOB_RE` conferidos também no comando sem aspas e sem `\` (`.env.migrate.sta"ging"`, `".env.migrate."staging`, `.env.migrate.stag\ing`, `.e"nv"*`).
  - ✅ Resolved review finding [Medium]: CLI `supabase`: `link` e `db` seguido de `push|pull|dump` procurados em qualquer posição dos argumentos (`supabase --workdir . db push`, `npx -p supabase supabase db push`); `--local` continua liberando. 30 casos novos de bloqueio e 10 de permissão no `it.each` (TDD, vermelho no Debug Log).
  - ✅ Resolved review finding [Low]: `isBmadSkill` aplica `trim()` e `toLowerCase()` antes de comparar; 5 casos novos no `skill-guard.test.ts`.
- 2026-11-17 (dev-story, follow-ups da 3ª rodada do code review):
  - ✅ Resolved review finding [High]: busca recursiva **bloqueada** (não só documentada). `searchReason` reconhece `grep`/`egrep`/`fgrep` com `-r`/`-R`/`--recursive`/`--dereference-recursive`/`-d recurse`, `rgrep`, e `rg` com `-u`/`-.`/`--unrestricted`/`--hidden`/`--no-ignore*`, inclusive atrás de `timeout`/`env`/`xargs`…; separa opções (com valor) e caminhos no estilo getopt, e bloqueia sem caminho ou com caminho que alcança a raiz (`.`, `./`, `..`, absoluto, `~`, `$…`, chaves). Subdiretório relativo (`src`, `.github`) passa. Limites (`find … -exec`, `git grep --no-index`, `cd .. && grep -r x caderninho`) documentados no `CLAUDE.md`; linha do README atualizada.
  - ✅ Resolved review finding [High]: `MIGRATE_RE` aceita `migrate` com ou sem extensão (`.ts`, `.mts`, `.cjs`, `.js`…) e o `db:migrate`.
  - ✅ Resolved review finding [Medium]: valor do `--env` sem `\` antes de comparar (`stag\ing`); valor começando por crase é dinâmico, como o `$` (motivo "roda o migrate com --env vindo de variável ou comando").
  - ✅ Resolved review finding [Medium]: nomes dentro de chaves resolvidos pela regra de globs (item abaixo), com expansão de chaves própria (aninhadas, fora de aspas).
  - ✅ Resolved review finding [Medium]: regra de globs com `shellWords` (aspas e `\` tornam o caractere literal, como no shell), `expandBraces` e `globRegex` (`*`, `?`, `[…]`, `[!…]`; nome com `.` inicial só casa com glob que começa por `.`), testados contra `REMOTE_ENV_FILES` pelo último segmento do caminho. Não usei `path.matchesGlob`: no Node 22.16 ele imprime `ExperimentalWarning`. Mesma regra aplicada ao `glob` da ferramenta `Grep`. Falsos positivos evitados e testados: `grep -n ".*" README.md`, `sed -n 's/.*//p'`, `rm -rf .next/*`, `ls src/{client,server}`.
  - ✅ Resolved review finding [Low]: CLI `supabase` com `--project-ref`/`--project-id` (com espaço ou `=`) **bloqueado**, junto de `--linked`/`--db-url`; `CLAUDE.md` atualizado.
  - ✅ Resolved review finding [Low]: `bmadSkillName` devolve o nome normalizado, usado nas mensagens de `deny` e de `ask`.
  - ✅ Resolved review finding [Low]: `F=.env.migrate; cat $F.staging` documentado em "Limites das proteções"; teste fixa o comportamento.
- 2026-11-17 (dev-story, follow-ups da 4ª rodada do code review):
  - ✅ Resolved review finding [High]: `rg -g|--glob|--iglob` com glob positivo que alcança os arquivos é **bloqueado** (sem caminho ou com caminho que alcança a raiz). `ripgrepGlobTarget` avalia o glob com a semântica do ripgrep: sem a regra do `.` inicial, `**` (inclusive `**/` casando zero diretórios), `/` inicial ancorando na raiz, `\` escapando, chaves, `!` inicial excluindo (não alcança), `--iglob` e `--glob-case-insensitive` sem diferenciar maiúsculas. `globRegex` ganhou o modo `ripgrep`; a regra do shell continua para os globs do `Bash`.
  - ✅ Resolved review finding [High]: ferramenta `Grep` com `glob` usa a mesma semântica do ripgrep (`*staging`, `*`, `**/*staging`, `*.{staging,production}`, `*.local` bloqueados). Com `path` num subdiretório do `cwd` da sessão (entrada `cwd` do hook, novo 3º parâmetro opcional de `classifyRemoteAccess`) passa; sem `cwd`, `path` é tratado como raiz. Justificativa do limite "`Grep` sem `glob`" reescrita no `CLAUDE.md`.
  - ✅ Resolved review finding [Medium]: expansão de chaves com orçamento de `MAX_BRACE_ALTERNATIVES` (1000) por chamada, compartilhado entre os globs do `Bash`, do `rg` e da ferramenta `Grep`; acima dele, bloqueia ("expansão de chaves grande demais para conferir"). Teste de desempenho com `{a,b}`×40 abaixo de 1 s.
  - ✅ Resolved review finding [Medium]: `git grep` com `--no-index` (sem `--exclude-standard`) ou `--untracked`/`--no-index` com `--no-exclude-standard` **bloqueado** sem caminho ou sobre a raiz (pula opções globais do git, como `--no-pager` e `-C x`); `git grep --untracked`, `--no-index --exclude-standard` e `--no-index … src` passam. `git grep --no-index` saiu da lista "Não cobre" do `CLAUDE.md`.
  - ✅ Resolved review finding [Low]: `shopt -s dotglob`, `-O dotglob`, `GLOBIGNORE=` e `setopt globdots` **bloqueados**; `shopt -s nullglob` e `echo GLOBIGNORE` passam.
  - ✅ Resolved review finding [Low]: follow-ups da 3ª e da 4ª rodada commitados (`fdd5684`), push na PR #54 e CI conferido de novo (verde; um job refeito por falha de infraestrutura do registro de imagens).
  - ✅ Resolved review finding [Low]: limite do `cd` reescrito no `CLAUDE.md` ("busca recursiva depois de um `cd` para fora do projeto, que o hook não acompanha", com os dois exemplos); teste fixa `cd / && grep -rn … home/x/caderninho`.
- 2026-11-17 (dev-story, follow-ups da 5ª rodada do code review):
  - ✅ Resolved review finding [Medium]: proposta levada ao PO. Decisão do PO: **correct course antes** dos demais follow-ups da 5ª rodada (`/bmad-bmm-correct-course`, a ser invocado pelo PO), porque um controle no nível do sistema (arquivos `.env.migrate.*` fora da pasta do repositório ou sandbox do Claude Code) pode mudar o que vale a pena corrigir no hook. O dev-story parou (HALT) com os outros 6 itens da 5ª rodada pendentes; nenhum código foi alterado.

### File List

- `.claude/hooks/remote-db-guard.mjs` (novo)
- `.claude/hooks/bmad-skill-guard.mjs` (novo)
- `.claude/settings.json`
- `scripts/bmad/remote-db-guard.mjs` (novo)
- `scripts/bmad/remote-db-guard.test.ts` (novo)
- `scripts/bmad/skill-guard.mjs` (novo)
- `scripts/bmad/skill-guard.test.ts` (novo)
- `scripts/bmad/guard-hooks.test.ts` (novo)
- `scripts/bmad/story-guard.mjs`
- `CLAUDE.md`
- `README.md`
- `_bmad-output/project-context.md`
- `_bmad-output/implementation-artifacts/1-15-pedir-permissao-e-proteger-bancos-remotos.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-11-17: Story criada pelo `create-story` (comando do PO); decisões de criação listadas para confirmação do PO.
- 2026-11-17: Implementação pelo `dev-story`: hooks `remote-db-guard` e `bmad-skill-guard` com TDD, `CLAUDE.md` (Quem conduz, Bancos remotos, limites), README e project-context.
- 2026-11-17: Code review (`/bmad-bmm-code-review 1-15`, comando do PO): 2 High, 3 Medium, 3 Low; o PO escolheu criar action items ("Review Follow-ups (AI)"). Status → in-progress.
- 2026-11-17: Addressed code review findings - 8 items resolved (Date: 2026-11-17). `dev-story` (comando do PO): subshell/crases, `supabase@<versão>`, chaves e `>` colado no `remote-db-guard` com TDD; 3 limites documentados no `CLAUDE.md`. Status → review.
- 2026-11-17: Code review, 2ª rodada (`/bmad-bmm-code-review 1-15`, comando do PO): 1 High, 4 Medium, 2 Low; o PO escolheu criar action items ("Review Follow-ups (AI)", 2ª rodada). Status → in-progress.
- 2026-11-17: Addressed code review findings - 7 items resolved (Date: 2026-11-17). `dev-story` (comando do PO), 2ª rodada: palavras-chave do shell e `&` simples, `--env` com variável ou colado a redirecionamento, nomes `.env.migrate.*` montados com aspas/`\`, subcomando do `supabase` em qualquer posição e nome da Skill normalizado, com TDD; commit, push e CI da PR #54 conferido de novo. Status → review.
- 2026-11-17: Code review, 3ª rodada (`/bmad-bmm-code-review 1-15`, comando do PO): 2 High, 3 Medium, 3 Low; o PO escolheu criar action items ("Review Follow-ups (AI)", 3ª rodada). Status → in-progress.
- 2026-11-17: Addressed code review findings - 8 items resolved (Date: 2026-11-17). `dev-story` (comando do PO), 3ª rodada: busca recursiva (`grep -r`, `rg --no-ignore`…) sobre a raiz, migrate sem extensão, `--env` com `\` ou crase, globs e chaves que alcançam os arquivos (Bash e `Grep`), `supabase --project-ref|--project-id` e nome normalizado nas mensagens da Skill, com TDD; limites no `CLAUDE.md` e linha do README. Status → review.
- 2026-11-17: Code review, 4ª rodada (`/bmad-bmm-code-review 1-15`, comando do PO): 2 High, 2 Medium, 3 Low; o PO escolheu criar action items ("Review Follow-ups (AI)", 4ª rodada). Status → in-progress.
- 2026-11-17: Addressed code review findings - 7 items resolved (Date: 2026-11-17). `dev-story` (comando do PO), 4ª rodada: globs do `rg -g|--glob|--iglob` e da ferramenta `Grep` com a semântica do ripgrep, limite de 1000 alternativas na expansão de chaves, `git grep --no-index`/`--untracked --no-exclude-standard`, `dotglob`/`GLOBIGNORE`/`globdots` bloqueados, com TDD; limites do `CLAUDE.md` (`Grep` sem `glob`, `cd` para fora do projeto); commit, push e CI da PR #54 conferido de novo. Status → review.
- 2026-11-17: Code review, 5ª rodada (`/bmad-bmm-code-review 1-15`, comando do PO): 1 High, 3 Medium, 3 Low; o PO escolheu criar action items ("Review Follow-ups (AI)", 5ª rodada). Status → in-progress.
