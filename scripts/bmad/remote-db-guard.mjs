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

// Nome de arquivo de banco remoto como palavra ou fim de caminho (inclusive depois de =, <, >, :, aspas).
const ENV_FILE_RE =
  /(?:^|[\s/=:<>('"])(\.env\.(?:migrate\.(?:staging|production)|(?:staging|production)\.local))(?=$|[\s'"`;|&)>])/;
// Glob que começa por .env e contém *, ?, [ ou { (ex.: `cat .env*`, `source .env.migrate.*`,
// `cat .env.migrate.{staging,production}`).
const ENV_GLOB_RE = /(?:^|[\s/=:<>('"])\.env[^\s'"`;|&)]*[*?[{]/;
// Subshell `( … )`, substituição `$( … )` e crases: o conteúdo é conferido como trecho próprio.
const SUBSHELL_SPLIT = /\$\(|[()`]/;
// Hosts remotos do Supabase (com subdomínio; "supabase.com" sozinho passa).
const HOST_RES = [/[a-z0-9-]+\.pooler\.supabase\.com\b/i, /\b[a-z0-9-]+\.supabase\.co\b/i];
const ASSIGNMENT_RE = /^[A-Za-z_][A-Za-z0-9_]*=/;
// Palavras-chave do shell que podem vir antes do comando do trecho (`if true; then npx …`).
const SHELL_KEYWORDS = new Set(['if', 'then', 'else', 'elif', 'do', 'while', 'until', '{', '!']);
// `&` simples (comando em segundo plano), sem pegar `&&`, `&>`, `>&` (ex.: `2>&1`).
const BACKGROUND_SPLIT = /(?<![&>])&(?![&>])/;
// Fim do valor do --env colado a redirecionamento, `&` ou pipe (`--env staging>out.log`).
const VALUE_END = /[<>&|]/;
// Palavras entre o executor e o pacote: `pnpm exec supabase`, `pnpm dlx supabase`, `npm x supabase`.
const RUNNER_WORDS = new Set(['exec', 'dlx', 'run', 'x']);
const SUPABASE_DB_REMOTE = new Set(['push', 'pull', 'dump']);

const ALLOW = /** @type {const} */ ({ blocked: false });
/** @param {string} reason @returns {Classification} */
const block = (reason) => ({ blocked: true, reason });

/**
 * @param {string} segment
 * @returns {string[]} tokens sem aspas, sem as atribuições `VAR=valor` e as palavras-chave do shell iniciais
 */
function segmentTokens(segment) {
  const tokens = segment.trim().split(/\s+/).filter(Boolean).map(unquote);
  let i = 0;
  while (i < tokens.length && (ASSIGNMENT_RE.test(tokens[i]) || SHELL_KEYWORDS.has(tokens[i]))) i++;
  return tokens.slice(i);
}

/** @param {string | undefined} value @returns {string | null} ambiente remoto, ou `$…` quando vem de variável */
function remoteValue(value) {
  const v = (value ?? '').split(VALUE_END)[0];
  if (REMOTE_ENVS.has(v)) return v;
  return v.startsWith('$') ? v : null;
}

/** @param {string[]} tokens @returns {string | null} ambiente remoto pedido por --env */
function remoteEnv(tokens) {
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const env = t === '--env' ? remoteValue(tokens[i + 1]) : t.startsWith('--env=') ? remoteValue(t.slice('--env='.length)) : null;
    if (env) return env;
  }
  return null;
}

/** (a) migrate remoto executado. @param {string[]} tokens @returns {string | null} */
function migrateReason(tokens) {
  if (!EXECUTORS.has(path.basename(tokens[0] ?? ''))) return null;
  if (!tokens.some((t) => t === 'db:migrate' || t.endsWith('migrate.ts'))) return null;
  const env = remoteEnv(tokens);
  if (!env) return null;
  // Valor vindo de variável pode ser staging ou produção: tratado como remoto (code review 1.15).
  return env.startsWith('$') ? 'roda o migrate com --env vindo de variável' : `roda o migrate em ${env}`;
}

/** `supabase`, `/caminho/supabase` ou `supabase@<versão>` (npx/bunx). @param {string | undefined} token */
const isSupabase = (token) => /^supabase(?:@\S*)?$/.test(path.basename(token ?? ''));

/** (d) CLI supabase apontando para o projeto remoto. @param {string[]} tokens @returns {string | null} */
function supabaseReason(tokens) {
  let i = 0;
  if (!isSupabase(tokens[0])) {
    if (!EXECUTORS.has(path.basename(tokens[0] ?? ''))) return null;
    i = 1;
    while (i < tokens.length && (tokens[i].startsWith('-') || /^\d+$/.test(tokens[i]) || RUNNER_WORDS.has(tokens[i]))) i++;
    if (!isSupabase(tokens[i])) return null;
  }
  const args = tokens.slice(i + 1);
  // Subcomandos em qualquer posição: opções com valor (`--workdir .`) e
  // `npx -p supabase supabase …` deslocam o 1º posicional (code review 1.15).
  const positional = args.filter((a) => !a.startsWith('-'));
  if (positional.includes('link')) return 'CLI supabase em banco remoto (link)';
  if (args.includes('--linked')) return 'CLI supabase em banco remoto (--linked)';
  if (args.some((a) => a === '--db-url' || a.startsWith('--db-url='))) return 'CLI supabase em banco remoto (--db-url)';
  const db = positional.indexOf('db');
  const sub = db >= 0 ? positional.slice(db + 1).find((a) => SUPABASE_DB_REMOTE.has(a)) : undefined;
  if (sub && !args.includes('--local')) return `CLI supabase em banco remoto (db ${sub})`;
  return null;
}

/** @param {string} command @returns {Classification} */
function classifyCommand(command) {
  // `&` simples também separa comandos (`sleep 1 & npx tsx …`); o SEGMENT_SPLIT da 1.14 fica intocado.
  for (const segment of command.split(SEGMENT_SPLIT).flatMap((s) => s.split(BACKGROUND_SPLIT))) {
    // O trecho inteiro e cada pedaço de subshell/substituição: o trecho inteiro
    // mantém casos como `npx tsx $(pwd)/scripts/migrate.ts`, e os pedaços pegam
    // `(npx tsx …)`, `echo $(npx tsx …)` e crases (code review da 1.15).
    for (const piece of [segment, ...segment.split(SUBSHELL_SPLIT)]) {
      const tokens = segmentTokens(piece);
      const reason = migrateReason(tokens) ?? supabaseReason(tokens);
      if (reason) return block(reason);
    }
  }
  // Nomes montados com aspas ou barra invertida (`.env.migrate.sta"ging"`,
  // `.env.migrate.stag\ing`) são conferidos também no comando sem elas.
  for (const text of [command, command.replace(/['"\\]/g, '')]) {
    const file = text.match(ENV_FILE_RE);
    if (file) return block(`cita ${file[1]}`);
    if (ENV_GLOB_RE.test(text)) return block('cita um glob de arquivos .env');
  }
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
