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
 * @param {string} rawPath @param {ClassifyContext} ctx
 */
function toProjectRelative(rawPath, ctx) {
  const abs = path.resolve(ctx.cwd, rawPath);
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

/** Remove aspas simples/duplas das pontas de um token. @param {string} token */
function unquote(token) {
  return token.replace(/^['"]|['"]$/g, '');
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

/**
 * Destinos de escrita do comando (o que é alvo de >, >>, tee, cp, mv, sed -i…).
 * @param {string} command
 * @returns {{ targets: string[], scriptWrites: boolean }}
 */
function writeDestinations(command) {
  const targets = [];
  // Redirecionamentos: "> alvo" e ">> alvo" (ignora 2>&1, &>…, >&2)
  for (const m of command.matchAll(/(^|[^0-9&>])>>?\s*(?!&)(['"]?)([^\s'";|&]+)\2/g)) targets.push(m[3]);
  // tee [-a] alvo
  for (const m of command.matchAll(/\btee\s+(?:-a\s+)?(['"]?)([^\s'";|&]+)\1/g)) targets.push(m[2]);

  let scriptWrites = false;
  for (const segment of command.split(/&&|\|\||;|\||\n/)) {
    const tokens = segment.trim().split(/\s+/).filter(Boolean).map(unquote);
    if (tokens.length === 0) continue;
    const [cmd, ...args] = tokens;
    const operands = args.filter((a) => !a.startsWith('-'));
    if ((cmd === 'cp' || cmd === 'mv') && operands.length >= 2) targets.push(operands[operands.length - 1]);
    if ((cmd === 'sed' || cmd === 'perl') && args.some((a) => /^-i/.test(a) || /^-[a-zA-Z]*i/.test(a))) targets.push(...operands);
    if (cmd === 'truncate' || cmd === 'rm') targets.push(...operands);
    if (/^(python3?|node)$/.test(cmd)) scriptWrites = true;
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
    const mentions = protectedMentions(command, ctx);
    if (mentions.length === 0) return { kind: 'other', action: 'read', path: '' };

    const { targets, scriptWrites } = writeDestinations(command);
    const written = targets
      .map((t) => toProjectRelative(t, ctx))
      .filter((r) => r && kindOf(r.rel) !== 'other');
    const hit = written[0] ?? (scriptWrites ? mentions[0] : null);
    if (!hit) return { kind: kindOf(mentions[0].rel), action: 'read', path: mentions[0].rel };
    return { kind: kindOf(hit.rel), action: ctx.exists(hit.abs) ? 'edit' : 'create', path: hit.rel };
  }

  return { kind: 'other', action: 'read', path: '' };
}

/** @param {string} text */
function commandNames(text) {
  return [...text.matchAll(/<command-name>\/bmad-([a-z0-9-]+)<\/command-name>/g)].map((m) => m[1]);
}

const WORKFLOW_PATH_RE = /_bmad\/bmm\/workflows\/4-implementation\/([a-z-]+)\/workflow\.yaml/g;

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

  const register = (/** @type {string} */ name) => {
    if (name.startsWith('agent-')) agentActive = true;
    else if (name.startsWith('bmm-') && WORKFLOWS.includes(name.slice(4))) last = name.slice(4);
  };

  for (const line of lines) {
    if (!line.includes('bmad')) continue;
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
        } else if ((block.name === 'Read' || block.name === 'Bash') && agentActive) {
          const text = String(block.name === 'Read' ? input.file_path ?? '' : input.command ?? '');
          for (const m of text.matchAll(WORKFLOW_PATH_RE)) if (WORKFLOWS.includes(m[1])) last = m[1];
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
