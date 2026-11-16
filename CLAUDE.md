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

## Limites das proteções
As regras acima têm três camadas (Story 1.14): este arquivo; o hook `PreToolUse`
(`.claude/settings.json` → `.claude/hooks/bmad-story-guard.mjs`), que bloqueia escrita em
stories e no `sprint-status.yaml` fora do workflow BMAD permitido; e o job de CI `bmad-process`.
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
- Sem proteção de branch (plano gratuito do GitHub), o CI vermelho avisa mas não bloqueia o merge.
