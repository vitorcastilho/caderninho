// Story 1.14 — Camada 2 das proteções do processo BMAD.
//
// Decide se uma ferramenta do Claude Code (Write, Edit, MultiEdit, Bash) pode
// escrever num arquivo de story ou no sprint-status.yaml, conforme o último
// workflow BMAD realmente invocado na sessão. Funções puras; a leitura do
// stdin e do transcript fica em `.claude/hooks/bmad-story-guard.mjs`.
//
// JavaScript puro (Node 22 não executa TypeScript): é rodado direto pelo hook.

import path from 'node:path';

/** @typedef {'story' | 'sprint-status' | 'other'} TargetKind */
/** @typedef {'create' | 'edit' | 'read'} TargetAction */
/** @typedef {{ kind: TargetKind, action: TargetAction, path: string }} Target */
/** @typedef {{ allow: true } | { allow: false, reason: string }} Decision */
/** @typedef {{ projectDir: string, cwd: string, exists: (absPath: string) => boolean }} ClassifyContext */

export const WORKFLOWS = [
  'create-story',
  'dev-story',
  'code-review',
  'correct-course',
  'sprint-planning',
  'sprint-status',
  'retrospective',
];

const ARTIFACTS = '_bmad-output/implementation-artifacts/';
const STORY_RE = /^_bmad-output\/implementation-artifacts\/\d+-\d+[a-z]?(?:-\d+[a-z]?)?-[^/]+\.md$/;
const SPRINT_STATUS = `${ARTIFACTS}sprint-status.yaml`;

const ALLOWED = {
  'story:create': ['create-story'],
  'story:edit': ['create-story', 'dev-story', 'code-review'],
  'sprint-status:create': ['create-story', 'dev-story', 'code-review', 'correct-course', 'sprint-planning', 'retrospective'],
  'sprint-status:edit': ['create-story', 'dev-story', 'code-review', 'correct-course', 'sprint-planning', 'retrospective'],
};

const ACTION_LABEL = { create: 'criar', edit: 'editar' };

/**
 * Caminho relativo à raiz do projeto, ou null se estiver fora dele.
 * Caminho que começa por `~` ou por variável (`$CLAUDE_PROJECT_DIR`, `${PWD}`…)
 * não é expandido aqui: se citar `_bmad-output/`, é tratado como relativo à raiz
 * (code review da 1.14 — antes escapava como "fora do projeto").
 * @param {string} rawPath @param {ClassifyContext} ctx @param {string} [cwd]
 */
function toProjectRelative(rawPath, ctx, cwd = ctx.cwd) {
  let target = rawPath.replace(/['"]/g, '');
  let base = cwd;
  if (/^[~$]/.test(target)) {
    const fromRoot = target.indexOf('_bmad-output/');
    if (fromRoot === -1) return null;
    target = target.slice(fromRoot);
    base = ctx.projectDir;
  }
  const abs = path.resolve(base, target);
  const rel = path.relative(ctx.projectDir, abs);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return null;
  return { abs, rel: rel.split(path.sep).join('/') };
}

/** @param {string | null} rel @returns {TargetKind} */
function kindOf(rel) {
  if (!rel) return 'other';
  if (rel === SPRINT_STATUS) return 'sprint-status';
  if (STORY_RE.test(rel)) return 'story';
  return 'other';
}

/** Remove aspas simples/duplas do token. @param {string} token */
export function unquote(token) {
  return token.replace(/['"]/g, '');
}

/**
 * Todos os caminhos citados no comando que apontam para algo protegido.
 * @param {string} command @param {ClassifyContext} ctx
 */
function protectedMentions(command, ctx) {
  const found = [];
  const re = /[^\s'"=:(]*_bmad-output\/implementation-artifacts\/[^\s'"`;|&)]+|[^\s'"=:(]*implementation-artifacts\/[^\s'"`;|&)]+/g;
  for (const match of command.matchAll(re)) {
    const resolved = toProjectRelative(match[0], ctx);
    if (resolved && kindOf(resolved.rel) !== 'other') found.push(resolved);
  }
  return found;
}

// Separadores de comandos: &&, ||, ;, | (menos o de ">|") e quebra de linha.
export const SEGMENT_SPLIT = /&&|\|\||;|(?<!>)\||\n/;
// Subcomandos do git que sobrescrevem, movem ou apagam arquivos do working tree.
const GIT_WRITES = new Set(['checkout', 'restore', 'mv', 'rm']);

/**
 * Destinos de escrita do comando (o que é alvo de >, >>, >|, tee, cp, mv,
 * sed -i, git checkout/restore/mv/rm…), já resolvidos pelo cwd de cada trecho
 * (acompanha `cd` dentro do próprio comando).
 * @param {string} command @param {ClassifyContext} ctx
 * @returns {{ targets: Array<{ abs: string, rel: string }>, scriptWrites: boolean }}
 */
function writeDestinations(command, ctx) {
  const targets = [];
  let scriptWrites = false;
  let cwd = ctx.cwd;

  for (const segment of command.split(SEGMENT_SPLIT)) {
    const raw = [];
    // Redirecionamentos: "> alvo", ">> alvo", ">| alvo" (ignora 2>&1, &>…, >&2)
    for (const m of segment.matchAll(/(^|[^0-9&>])>[>|]?\s*(?!&)(['"]?)([^\s'";|&]+)\2/g)) raw.push(m[3]);
    // tee [-a] alvo
    for (const m of segment.matchAll(/\btee\s+(?:-a\s+)?(['"]?)([^\s'";|&]+)\1/g)) raw.push(m[2]);

    const tokens = segment.trim().split(/\s+/).filter(Boolean).map(unquote);
    const [cmd, ...args] = tokens;
    const operands = args.filter((a) => !a.startsWith('-'));
    if (cmd === 'cd') {
      cwd = operands[0] ? path.resolve(cwd, operands[0]) : ctx.projectDir;
      continue;
    }
    if ((cmd === 'cp' || cmd === 'mv') && operands.length >= 2) raw.push(operands[operands.length - 1]);
    if (
      (cmd === 'sed' || cmd === 'perl') &&
      args.some((a) => /^-[a-zA-Z]*i/.test(a) || a.startsWith('--in-place'))
    ) {
      raw.push(...operands);
    }
    if (cmd === 'truncate' || cmd === 'rm') raw.push(...operands);
    if (cmd === 'git' && GIT_WRITES.has(operands[0] ?? '')) raw.push(...operands.slice(1));
    if (cmd && /^(python3?|node)$/.test(cmd)) scriptWrites = true;

    for (const t of raw) {
      const resolved = toProjectRelative(t, ctx, cwd);
      if (resolved && kindOf(resolved.rel) !== 'other') targets.push(resolved);
    }
  }
  return { targets, scriptWrites };
}

/**
 * Classifica o alvo de uma chamada de ferramenta.
 * @param {string} toolName
 * @param {Record<string, unknown>} toolInput
 * @param {ClassifyContext} ctx
 * @returns {Target}
 */
export function classifyTarget(toolName, toolInput, ctx) {
  if (toolName === 'Write' || toolName === 'Edit' || toolName === 'MultiEdit') {
    const filePath = typeof toolInput.file_path === 'string' ? toolInput.file_path : '';
    const resolved = filePath ? toProjectRelative(filePath, ctx) : null;
    const kind = kindOf(resolved?.rel ?? null);
    if (kind === 'other' || !resolved) return { kind: 'other', action: 'edit', path: filePath };
    const action = toolName === 'Write' && !ctx.exists(resolved.abs) ? 'create' : 'edit';
    return { kind, action, path: resolved.rel };
  }

  if (toolName === 'Bash') {
    const command = typeof toolInput.command === 'string' ? toolInput.command : '';
    const { targets, scriptWrites } = writeDestinations(command, ctx);
    const mentions = protectedMentions(command, ctx);
    const hit = targets[0] ?? (scriptWrites ? mentions[0] : undefined);
    if (hit) return { kind: kindOf(hit.rel), action: ctx.exists(hit.abs) ? 'edit' : 'create', path: hit.rel };
    if (mentions.length > 0) return { kind: kindOf(mentions[0].rel), action: 'read', path: mentions[0].rel };
    return { kind: 'other', action: 'read', path: '' };
  }

  return { kind: 'other', action: 'read', path: '' };
}

/** @param {string} text */
function commandNames(text) {
  return [...text.matchAll(/<command-name>\/bmad-([a-z0-9-]+)<\/command-name>/g)].map((m) => m[1]);
}

// Caminho do workflow.yaml, também na forma com chaves: .../correct-course/{workflow.yaml,instructions.md}
const WORKFLOW_PATH_RE =
  /_bmad\/bmm\/workflows\/4-implementation\/([a-z-]+)\/(?:workflow\.yaml|\{[^}]*\bworkflow\.yaml\b[^}]*\})/g;

// Comandos de leitura: só eles contam como "o agente carregou o workflow".
// Um python/mkdir/echo que apenas cita o caminho não conta (achado da Task 6.2).
const READ_COMMANDS = new Set(['cat', 'head', 'tail', 'less', 'more', 'bat', 'wc', 'sed', 'awk', 'grep']);

/** @param {string} filePath @returns {string | null} */
function workflowFromPath(filePath) {
  let found = null;
  for (const m of filePath.matchAll(WORKFLOW_PATH_RE)) if (WORKFLOWS.includes(m[1])) found = m[1];
  return found;
}

/** Último workflow lido por um comando de leitura do Bash. @param {string} command @returns {string | null} */
function workflowReadByCommand(command) {
  let found = null;
  for (const segment of command.split(SEGMENT_SPLIT)) {
    const first = segment.trim().split(/\s+/)[0] ?? '';
    if (READ_COMMANDS.has(first)) found = workflowFromPath(segment) ?? found;
  }
  return found;
}

/**
 * Último workflow BMAD realmente invocado na sessão.
 * Contam: comando digitado (/bmad-bmm-…), ferramenta Skill (bmad-bmm-…) e
 * leitura do workflow.yaml quando um agente BMAD (/bmad-agent-…) está ativo.
 * Não contam: texto do assistente, tool_result, entradas de subagente.
 * @param {Iterable<string>} lines linhas JSONL do transcript
 * @returns {string | null}
 */
export function findLastWorkflow(lines) {
  let last = null;
  let agentActive = false;

  // Um workflow invocado direto (comando ou Skill) encerra o contexto do agente:
  // depois dele, ler um workflow.yaml só volta a contar se um agente for invocado
  // de novo (code review da 1.14 — antes o agente valia a sessão inteira).
  const register = (/** @type {string} */ name) => {
    if (name.startsWith('agent-')) agentActive = true;
    else if (name.startsWith('bmm-') && WORKFLOWS.includes(name.slice(4))) {
      last = name.slice(4);
      agentActive = false;
    }
  };

  for (const line of lines) {
    if (!line.includes('bmad-') && !line.includes('_bmad/')) continue;
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    if (!entry || entry.isSidechain) continue;
    const content = entry.message?.content;

    if (entry.type === 'user') {
      if (typeof content === 'string') commandNames(content).forEach(register);
      else if (Array.isArray(content)) {
        for (const block of content) {
          if (block?.type === 'text' && typeof block.text === 'string') commandNames(block.text).forEach(register);
        }
      }
    } else if (entry.type === 'assistant' && Array.isArray(content)) {
      for (const block of content) {
        if (block?.type !== 'tool_use') continue;
        const input = block.input ?? {};
        if (block.name === 'Skill' && typeof input.skill === 'string' && input.skill.startsWith('bmad-')) {
          register(input.skill.slice('bmad-'.length));
        } else if (block.name === 'Read' && agentActive) {
          const wf = workflowFromPath(String(input.file_path ?? ''));
          if (wf) last = wf;
        } else if (block.name === 'Bash' && agentActive) {
          const wf = workflowReadByCommand(String(input.command ?? ''));
          if (wf) last = wf;
        }
      }
    }
  }
  return last;
}

/**
 * @param {Target} target
 * @param {string | null} lastWorkflow
 * @returns {Decision}
 */
export function decide(target, lastWorkflow) {
  if (target.kind === 'other' || target.action === 'read') return { allow: true };
  const allowed = ALLOWED[`${target.kind}:${target.action}`];
  if (lastWorkflow && allowed.includes(lastWorkflow)) return { allow: true };
  return {
    allow: false,
    reason:
      `Bloqueado pelo processo BMAD: ${ACTION_LABEL[target.action]} ${target.path} exige o workflow ` +
      `${allowed.join(', ')}, mas o último invocado foi ${lastWorkflow ?? 'nenhum'}. ` +
      'Invoque o workflow BMAD correspondente ou pergunte ao usuário.',
  };
}

/**
 * Avaliação completa de uma entrada do hook. Só lê o transcript quando o alvo
 * é protegido; se não conseguir ler, bloqueia (falha segura).
 * @param {{ tool_name?: string, tool_input?: Record<string, unknown>, cwd?: string, transcript_path?: string }} input
 * @param {{ projectDir: string, exists: (p: string) => boolean, readTranscript: (p: string) => Iterable<string> }} deps
 * @returns {Decision}
 */
export function evaluate(input, deps) {
  const ctx = { projectDir: deps.projectDir, cwd: input.cwd || deps.projectDir, exists: deps.exists };
  const target = classifyTarget(input.tool_name ?? '', input.tool_input ?? {}, ctx);
  if (target.kind === 'other' || target.action === 'read') return { allow: true };

  let lines;
  try {
    lines = deps.readTranscript(input.transcript_path ?? '');
  } catch {
    return {
      allow: false,
      reason: `Bloqueado pelo processo BMAD: não foi possível ler o transcript da sessão para conferir o workflow ativo antes de alterar ${target.path}. Pergunte ao usuário.`,
    };
  }
  return decide(target, findLastWorkflow(lines));
}
