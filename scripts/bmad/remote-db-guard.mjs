// Story 1.15 — Camada 2: bancos remotos são do PO.
//
// Decide se uma ferramenta do Claude Code (Bash, Read, Grep, Write, Edit,
// MultiEdit) alcança os bancos de staging ou produção: migrate remoto, arquivos
// com a URL do banco remoto, hosts do Supabase e CLI `supabase` remoto.
// Funções puras, sem leitura de transcript; a leitura do stdin fica em
// `.claude/hooks/remote-db-guard.mjs`. Ver CLAUDE.md, "Bancos remotos".
//
// JavaScript puro (Node 22 não executa TypeScript): é rodado direto pelo hook.
// Os motivos nunca repetem o comando (ele pode trazer a URL com senha).

import path from 'node:path';

import { SEGMENT_SPLIT, unquote } from './story-guard.mjs';

/** @typedef {{ blocked: false } | { blocked: true, reason: string }} Classification */
/** @typedef {{ allow: true } | { allow: false, reason: string }} Decision */

// Mesmos nomes de ENV_FILES (staging/production) e LEGACY_ENV_FILES em
// scripts/lib/migrate-env.ts; repetidos aqui porque o hook é .mjs puro.
export const REMOTE_ENV_FILES = [
  '.env.migrate.staging',
  '.env.migrate.production',
  '.env.staging.local',
  '.env.production.local',
];

const REMOTE_ENVS = new Set(['staging', 'production']);

// Comandos que executam o que vem depois (AC 2(a)); comparados pelo basename.
const EXECUTORS = new Set([
  'npm', 'pnpm', 'yarn', 'npx', 'tsx', 'node', 'bun', 'bunx', 'ts-node',
  'sh', 'bash', 'zsh', 'env', 'time', 'nohup', 'timeout', 'xargs',
]);

// Nome de arquivo de banco remoto como palavra ou fim de caminho (inclusive depois de =, <, :, aspas).
const ENV_FILE_RE =
  /(?:^|[\s/=:<('"])(\.env\.(?:migrate\.(?:staging|production)|(?:staging|production)\.local))(?=$|[\s'"`;|&)>])/;
// Glob que começa por .env e contém *, ? ou [ (ex.: `cat .env*`, `source .env.migrate.*`).
const ENV_GLOB_RE = /(?:^|[\s/=:<('"])\.env[^\s'"`;|&)]*[*?[]/;
// Hosts remotos do Supabase (com subdomínio; "supabase.com" sozinho passa).
const HOST_RES = [/[a-z0-9-]+\.pooler\.supabase\.com\b/i, /\b[a-z0-9-]+\.supabase\.co\b/i];
const ASSIGNMENT_RE = /^[A-Za-z_][A-Za-z0-9_]*=/;
// Palavras entre o executor e o pacote: `pnpm exec supabase`, `pnpm dlx supabase`, `npm x supabase`.
const RUNNER_WORDS = new Set(['exec', 'dlx', 'run', 'x']);
const SUPABASE_DB_REMOTE = new Set(['push', 'pull', 'dump']);

const ALLOW = /** @type {const} */ ({ blocked: false });
/** @param {string} reason @returns {Classification} */
const block = (reason) => ({ blocked: true, reason });

/** @param {string} segment @returns {string[]} tokens sem aspas e sem as atribuições `VAR=valor` iniciais */
function segmentTokens(segment) {
  const tokens = segment.trim().split(/\s+/).filter(Boolean).map(unquote);
  let i = 0;
  while (i < tokens.length && ASSIGNMENT_RE.test(tokens[i])) i++;
  return tokens.slice(i);
}

/** @param {string[]} tokens @returns {string | null} ambiente remoto pedido por --env */
function remoteEnv(tokens) {
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === '--env' && REMOTE_ENVS.has(tokens[i + 1] ?? '')) return tokens[i + 1];
    if (t.startsWith('--env=') && REMOTE_ENVS.has(t.slice('--env='.length))) return t.slice('--env='.length);
  }
  return null;
}

/** (a) migrate remoto executado. @param {string[]} tokens @returns {string | null} */
function migrateReason(tokens) {
  if (!EXECUTORS.has(path.basename(tokens[0] ?? ''))) return null;
  if (!tokens.some((t) => t === 'db:migrate' || t.endsWith('migrate.ts'))) return null;
  const env = remoteEnv(tokens);
  return env ? `roda o migrate em ${env}` : null;
}

/** (d) CLI supabase apontando para o projeto remoto. @param {string[]} tokens @returns {string | null} */
function supabaseReason(tokens) {
  let i = 0;
  const first = path.basename(tokens[0] ?? '');
  if (first !== 'supabase') {
    if (!EXECUTORS.has(first)) return null;
    i = 1;
    while (i < tokens.length && (tokens[i].startsWith('-') || /^\d+$/.test(tokens[i]) || RUNNER_WORDS.has(tokens[i]))) i++;
    if (path.basename(tokens[i] ?? '') !== 'supabase') return null;
  }
  const args = tokens.slice(i + 1);
  const positional = args.filter((a) => !a.startsWith('-'));
  if (positional[0] === 'link') return 'CLI supabase em banco remoto (link)';
  if (args.includes('--linked')) return 'CLI supabase em banco remoto (--linked)';
  if (args.some((a) => a === '--db-url' || a.startsWith('--db-url='))) return 'CLI supabase em banco remoto (--db-url)';
  if (positional[0] === 'db' && SUPABASE_DB_REMOTE.has(positional[1] ?? '') && !args.includes('--local')) {
    return `CLI supabase em banco remoto (db ${positional[1]})`;
  }
  return null;
}

/** @param {string} command @returns {Classification} */
function classifyCommand(command) {
  for (const segment of command.split(SEGMENT_SPLIT)) {
    const tokens = segmentTokens(segment);
    const reason = migrateReason(tokens) ?? supabaseReason(tokens);
    if (reason) return block(reason);
  }
  const file = command.match(ENV_FILE_RE);
  if (file) return block(`cita ${file[1]}`);
  if (ENV_GLOB_RE.test(command)) return block('cita um glob de arquivos .env');
  if (HOST_RES.some((re) => re.test(command))) return block('cita um host remoto do Supabase');
  return ALLOW;
}

/** @param {unknown} value @returns {string | null} nome do arquivo de banco remoto, se for um */
function remoteFileName(value) {
  if (typeof value !== 'string' || !value) return null;
  const name = path.basename(value);
  return REMOTE_ENV_FILES.includes(name) ? name : null;
}

/**
 * Classifica uma chamada de ferramenta.
 * @param {string} toolName
 * @param {Record<string, unknown>} toolInput
 * @returns {Classification}
 */
export function classifyRemoteAccess(toolName, toolInput) {
  if (toolName === 'Bash') {
    return typeof toolInput.command === 'string' ? classifyCommand(toolInput.command) : ALLOW;
  }
  if (toolName === 'Read' || toolName === 'Write' || toolName === 'Edit' || toolName === 'MultiEdit') {
    const name = remoteFileName(toolInput.file_path);
    return name ? block(`cita ${name}`) : ALLOW;
  }
  if (toolName === 'Grep') {
    const name = remoteFileName(toolInput.path);
    if (name) return block(`cita ${name}`);
    if (typeof toolInput.glob === 'string' && /(?:^|[/{,])\.env/.test(toolInput.glob)) {
      return block('cita um glob de arquivos .env');
    }
  }
  return ALLOW;
}

/** @param {string} reason @returns {Decision} */
const deny = (reason) => ({ allow: false, reason: `Comandos em bancos remotos são do PO: ${reason}. Passe o comando para o PO rodar.` });

/**
 * Avaliação completa de uma entrada do hook (já em JSON).
 * @param {{ tool_name?: unknown, tool_input?: unknown }} input
 * @returns {Decision}
 */
export function evaluateRemote(input) {
  const toolInput = input.tool_input && typeof input.tool_input === 'object' ? /** @type {Record<string, unknown>} */ (input.tool_input) : {};
  const result = classifyRemoteAccess(typeof input.tool_name === 'string' ? input.tool_name : '', toolInput);
  return result.blocked ? deny(result.reason) : { allow: true };
}

/**
 * Entrada do hook que não é JSON válido: bloqueia só se o texto bruto citar
 * algo protegido (falha segura, AC 6).
 * @param {string} raw
 * @returns {Decision}
 */
export function invalidInputDecision(raw) {
  const mentionsFile = REMOTE_ENV_FILES.some((name) => raw.includes(name));
  if (mentionsFile || /--env[=\s]+(?:staging|production)\b/.test(raw)) {
    return deny('entrada do hook inválida citando banco remoto');
  }
  return { allow: true };
}
