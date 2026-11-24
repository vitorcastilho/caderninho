# Caderninho — regras para o Claude Code

## Processo BMAD (obrigatório)
Este projeto é desenvolvido com agentes e workflows BMAD. O Claude nunca assume o processo por conta própria.

- Criar story → `/bmad-bmm-create-story`. Implementar → `/bmad-bmm-dev-story`.
  Revisar → `/bmad-bmm-code-review`. Mudar o rumo → `/bmad-bmm-correct-course`.
  Sempre invocados de verdade (comando digitado pelo PO ou, com o sim dele, ferramenta Skill)
  e seguidos pelo `workflow.xml`, nunca "imitando o formato".
- Se um pedido implicar criar, implementar, revisar ou alterar story fora de um workflow
  em andamento, PARE e pergunte qual workflow usar. Nunca escolha um atalho em silêncio.
- Não pular passos nem checklists de um workflow. Se um passo parecer não se aplicar, pergunte.
- Arquivos de story e `sprint-status.yaml` só são alterados por um workflow BMAD.

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

## Git
- Desenvolvimento só em branches na pasta principal do projeto, trocando com `git switch`.
  Nunca usar `git worktree` nem cópias do repositório em outras pastas: o PO acompanha pelo VS Code.
- Antes de trocar de branch, conferir `git status`; havendo mudanças do PO, perguntar.

## Limites das proteções
As regras acima têm três camadas (Stories 1.14 e 1.15): este arquivo; os hooks `PreToolUse`
(`.claude/settings.json` → `.claude/hooks/`): `bmad-story-guard.mjs`, que bloqueia escrita em
stories e no `sprint-status.yaml` fora do workflow BMAD permitido, `remote-db-guard.mjs`, que
bloqueia comandos e arquivos de bancos remotos, e `bmad-skill-guard.mjs`, que pede a confirmação
do PO antes de o Claude invocar uma skill BMAD; e o job de CI `bmad-process`.
Elas não cobrem tudo:

- O hook só reconhece no `Bash` os padrões de escrita conhecidos (`>`, `>>`, `>|`, `tee`, `cp`, `mv`,
  `sed -i`/`--in-place`, `perl -i`, `truncate`, `rm`, `git checkout|restore|mv|rm`, `python`/`node`
  citando o arquivo), acompanhando `cd` dentro do próprio comando. Outras formas (ex.: `awk -i`,
  `dd`, `rsync`, troca de branch com a story alterada) não são detectadas.
- A leitura do `workflow.yaml` pelo menu de um agente BMAD conta como invocação enquanto o
  agente estiver ativo, ou seja, até um workflow ser invocado direto (comando ou Skill).
- Entradas de subagentes não liberam escrita; o hook olha só a sessão principal.
- O hook considera o último workflow invocado até outro ser invocado (não sabe quando um
  workflow terminou). Neste intervalo, valem as regras deste arquivo.
- Bancos remotos: o hook reconhece o migrate remoto só quando o comando do trecho é um executor
  (`npm`, `pnpm`, `yarn`, `npx`, `tsx`, `node`, `bun`, `bunx`, `ts-node`, `sh`, `bash`, `zsh`, `env`,
  `time`, `nohup`, `timeout`, `xargs`), com o arquivo `migrate` com ou sem extensão; bloqueia os nomes
  dos quatro arquivos e globs ou chaves que os alcancem (`.env*`, `.*staging`, `.[e]nv.migrate.*`,
  `{README.md,.env.migrate.staging}`) em qualquer comando, inclusive em buscas (para procurar o texto,
  use `env\.migrate`); busca recursiva (`grep -r|-R`, `rgrep`, `rg -u|--no-ignore|--hidden`, `rg -g|--glob|--iglob`
  com glob que alcança os arquivos, `git grep --no-index` ou `--untracked --no-exclude-standard`) sem caminho
  ou sobre `.`, um diretório pai, caminho absoluto, `~` ou variável (busque num subdiretório, ex.:
  `grep -rn x src`, ou use a ferramenta `Grep`); ferramenta `Grep` com `glob` que alcança os arquivos
  (semântica do ripgrep: `*staging`, `*`, `**/*.local`), salvo com `path` num subdiretório da sessão;
  `shopt -s dotglob`, `-O dotglob`, `GLOBIGNORE=` e `setopt globdots`; expansão de chaves com mais de
  1000 alternativas; hosts `*.pooler.supabase.com`/`*.supabase.co`;
  `supabase link`/`--linked`/`--db-url`/`--project-ref`/`--project-id`/`db push|pull|dump`
  (inclusive `supabase@<versão>` e dentro de `( … )`, `$( … )` ou crases).
  Não cobre: URL remota já exportada numa variável do shell, nome do arquivo montado por variável
  (ex.: `F=.env.migrate; cat $F.staging`), scripts que leem os arquivos por conta
  própria, outras ferramentas que percorrem diretórios (`find … -exec`, `tar`), busca recursiva depois
  de um `cd` para fora do projeto, que o hook não acompanha (ex.: `cd .. && grep -r x caderninho`,
  `cd / && grep -rn x home/…/caderninho`), `vercel env pull`, servidores MCP de banco, `Grep` sem `glob`
  (o ripgrep respeita o `.gitignore`, onde estão os arquivos; um `glob` positivo passaria por cima dele,
  por isso o hook confere o `glob`), prefixos fora da lista de executores (ex.: `sudo`, `command`,
  `nice`, `exec` antes do migrate) e subcomandos do CLI `supabase` que usam o projeto linkado por
  padrão (ex.: `migration list|repair`, `inspect db …`; hoje sem projeto linkado, e `link` é bloqueado).
  A divisão em trechos não respeita aspas: texto entre aspas com `;`, `&&`, `|`, `(`, `$(` ou quebra
  de linha antes de um migrate remoto é bloqueado (ex.: `echo "a; npx tsx migrate.ts --env staging"`).
  Para commit e PR com esses textos, use `git commit -F <arquivo>` e `gh pr create --body-file <arquivo>`.
- Skill BMAD: o hook pede confirmação a cada invocação pela ferramenta Skill; o comando digitado
  pelo PO não passa por ele. Em `bypassPermissions`/`dontAsk`, bloqueia. Não vê o Claude "assumindo"
  uma etapa sem a Skill (ex.: seguir um `workflow.yaml` lido sem agente): a Camada 1 e o hook da
  1.14 cobrem.
- Sem proteção de branch (plano gratuito do GitHub), o CI vermelho avisa mas não bloqueia o merge.
