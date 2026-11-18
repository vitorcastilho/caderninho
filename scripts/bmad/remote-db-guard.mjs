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
// Opções do CLI supabase que apontam para um projeto remoto (`supabase gen types --project-id …`).
const SUPABASE_REMOTE_OPTIONS = ['--linked', '--db-url', '--project-ref', '--project-id'];
// Arquivo do migrate, com ou sem extensão (o tsx resolve `scripts/migrate`), e o script `db:migrate`.
const MIGRATE_RE = /(?:^|[^a-z])migrate(?:\.[cm]?[tj]s)?$/i;

// Busca recursiva (code review 1.15, 3ª rodada): `grep -r` não respeita o .gitignore,
// e `rg` com as opções abaixo também lê arquivos ignorados ou ocultos.
const GREP_COMMANDS = new Set(['grep', 'egrep', 'fgrep', 'rgrep']);
const GREP_SHORT_VALUE = new Set(['A', 'B', 'C', 'm', 'e', 'f', 'd', 'D']);
const GREP_LONG_VALUE = new Set([
  '--regexp', '--file', '--include', '--exclude', '--exclude-dir', '--exclude-from', '--max-count',
  '--context', '--after-context', '--before-context', '--directories', '--devices', '--label',
]);
const RG_SHORT_VALUE = new Set(['A', 'B', 'C', 'e', 'f', 'g', 't', 'T', 'm', 'M', 'j', 'r', 'E', 'd']);
const RG_LONG_VALUE = new Set([
  '--regexp', '--file', '--glob', '--iglob', '--type', '--type-not', '--max-count', '--max-columns',
  '--threads', '--replace', '--encoding', '--context', '--after-context', '--before-context', '--max-depth',
  '--max-filesize', '--ignore-file', '--sort', '--sortr', '--type-add', '--color', '--colors', '--pre', '--pre-glob',
]);
// Opções do rg com glob (code review 1.15, 4ª rodada): glob positivo passa por cima
// do .gitignore e do filtro de ocultos.
const RG_GLOB_OPTIONS = new Set(['-g', '--glob', '--iglob']);
// `git grep` (code review 1.15, 4ª rodada): opções globais do git com valor e opções do grep com valor.
const GIT_GLOBAL_VALUE = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace']);
const GIT_GREP_SHORT_VALUE = new Set(['A', 'B', 'C', 'e', 'f', 'm']);
const GIT_GREP_LONG_VALUE = new Set([
  '--max-depth', '--threads', '--context', '--after-context', '--before-context', '--max-count',
]);
// Comandos que só envolvem outro (`timeout 5 grep -r …`), com suas opções e números.
const WRAPPERS = new Set(['time', 'nohup', 'timeout', 'env', 'xargs', 'nice', 'command', 'sudo', 'exec']);
// Separadores de palavra do shell (fora de aspas) para a regra de globs.
const WORD_BREAK = /[\s;|&<>()`=:]/;
// Opções do shell que fazem globs alcançarem arquivos com `.` inicial (code review 1.15, 4ª rodada).
const DOTGLOB_RES = [
  /(?:\bshopt\b[^;&|\n]*|-O\s*)\bdotglob\b/,
  /(?:^|[\s;&|(])GLOBIGNORE=/,
  /\bsetopt\b[^;&|\n]*\bglob_?dots\b/i,
];
// Limite de alternativas da expansão de chaves por chamada: `{a,b}` repetido cresce
// 2^n, e um hook que estoura o timeout não bloqueia (code review 1.15, 4ª rodada).
export const MAX_BRACE_ALTERNATIVES = 1000;

/** Expansão de chaves acima de MAX_BRACE_ALTERNATIVES: a chamada é bloqueada. */
class TooManyAlternatives extends Error {}

/** @typedef {{ left: number }} BraceBudget alternativas que ainda podem ser geradas */
/** @returns {BraceBudget} */
const newBudget = () => ({ left: MAX_BRACE_ALTERNATIVES });

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

/**
 * @param {string | undefined} value
 * @returns {string | null} ambiente remoto, ou o valor cru quando vem de variável (`$…`) ou comando (crase)
 */
function remoteValue(value) {
  const raw = (value ?? '').split(VALUE_END)[0];
  if (raw.startsWith('$') || raw.startsWith('`')) return raw;
  // `stag\ing` vira `staging` no shell (code review 1.15, 3ª rodada).
  const v = raw.replace(/\\/g, '');
  return REMOTE_ENVS.has(v) ? v : null;
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
  if (!tokens.some((t) => MIGRATE_RE.test(t))) return null;
  const env = remoteEnv(tokens);
  if (!env) return null;
  // Valor vindo de variável ou comando pode ser staging ou produção: tratado como remoto (code review 1.15).
  return REMOTE_ENVS.has(env) ? `roda o migrate em ${env}` : 'roda o migrate com --env vindo de variável ou comando';
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
  const option = SUPABASE_REMOTE_OPTIONS.find((o) => args.some((a) => a === o || a.startsWith(`${o}=`)));
  if (option) return `CLI supabase em banco remoto (${option})`;
  const db = positional.indexOf('db');
  const sub = db >= 0 ? positional.slice(db + 1).find((a) => SUPABASE_DB_REMOTE.has(a)) : undefined;
  if (sub && !args.includes('--local')) return `CLI supabase em banco remoto (db ${sub})`;
  return null;
}

/**
 * Separa opções e argumentos posicionais de um comando no estilo getopt.
 * @param {string[]} args
 * @param {Set<string>} shortValue letras de opção curta que recebem valor
 * @param {Set<string>} longValue opções longas que recebem valor no token seguinte
 */
function parseOptions(args, shortValue, longValue) {
  /** @type {Array<[string, string | undefined]>} */
  const options = [];
  /** @type {string[]} */
  const positionals = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--') {
      positionals.push(...args.slice(i + 1));
      break;
    }
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      const name = eq >= 0 ? a.slice(0, eq) : a;
      options.push([name, eq >= 0 ? a.slice(eq + 1) : longValue.has(name) ? args[++i] : undefined]);
    } else if (a.startsWith('-') && a.length > 1) {
      for (let j = 1; j < a.length; j++) {
        const letter = a[j];
        if (shortValue.has(letter)) {
          options.push([`-${letter}`, j + 1 < a.length ? a.slice(j + 1) : args[++i]]);
          break;
        }
        options.push([`-${letter}`, undefined]);
      }
    } else {
      positionals.push(a);
    }
  }
  const patternGiven = options.some(([o]) => ['-e', '-f', '--regexp', '--file'].includes(o));
  return { options, paths: patternGiven ? positionals : positionals.slice(1) };
}

/**
 * Caminho de busca que alcança a raiz do projeto: `.`, `./`, `..`, absoluto, `~`, variável, chaves.
 * Subdiretórios relativos (`src`, `./scripts`, `.github`) passam: os arquivos de banco ficam na raiz.
 * @param {string} p
 */
function isBroadPath(p) {
  let rel = p;
  while (rel.startsWith('./')) rel = rel.slice(2);
  if (rel === '' || rel === '.' || /^[/~$`{]/.test(rel)) return true;
  return rel.split('/').includes('..');
}

/** Pula os comandos que envolvem outro (`timeout 5`, `env X=1`, `nice -n 10`). @param {string[]} tokens */
function unwrap(tokens) {
  let i = 0;
  while (i < tokens.length && WRAPPERS.has(path.basename(tokens[i]))) {
    i++;
    while (i < tokens.length && (tokens[i].startsWith('-') || /^\d+[smhd]?$/.test(tokens[i]) || ASSIGNMENT_RE.test(tokens[i]))) i++;
  }
  return tokens.slice(i);
}

/**
 * Arquivo de banco remoto alcançado por algum glob positivo do rg (`-g`, `--glob`, `--iglob`).
 * @param {Array<[string, string | undefined]>} options
 * @param {BraceBudget} budget
 * @returns {string | null}
 */
function rgGlobTarget(options, budget) {
  const caseInsensitive = options.some(([o]) => o === '--glob-case-insensitive');
  for (const [o, v] of options) {
    if (!RG_GLOB_OPTIONS.has(o) || v === undefined) continue;
    const name = ripgrepGlobTarget(v, budget, caseInsensitive || o === '--iglob');
    if (name) return name;
  }
  return null;
}

/**
 * `git grep` que lê arquivos ignorados: `--no-index` sem `--exclude-standard`, ou
 * `--untracked`/`--no-index` com `--no-exclude-standard`.
 * @param {string[]} args argumentos depois de `git`
 * @returns {{ reaches: boolean, paths: string[] }}
 */
function gitGrep(args) {
  let i = 0;
  while (i < args.length && args[i].startsWith('-')) i += GIT_GLOBAL_VALUE.has(args[i]) ? 2 : 1;
  if (args[i] !== 'grep') return { reaches: false, paths: [] };
  const { options, paths } = parseOptions(args.slice(i + 1), GIT_GREP_SHORT_VALUE, GIT_GREP_LONG_VALUE);
  const has = (/** @type {string} */ name) => options.some(([o]) => o === name);
  const noIndex = has('--no-index');
  const reaches = (noIndex && !has('--exclude-standard')) || ((noIndex || has('--untracked')) && has('--no-exclude-standard'));
  return { reaches, paths };
}

/**
 * Busca recursiva (grep/rg/git grep) que alcança os arquivos de banco remoto.
 * @param {string[]} tokens @param {BraceBudget} budget @returns {string | null}
 */
function searchReason(tokens, budget) {
  const [cmd, ...args] = unwrap(tokens);
  const name = path.basename(cmd ?? '');
  let reaches = false;
  /** @type {string[]} */
  let paths = [];
  if (name === 'git') {
    ({ reaches, paths } = gitGrep(args));
  } else if (GREP_COMMANDS.has(name)) {
    const parsed = parseOptions(args, GREP_SHORT_VALUE, GREP_LONG_VALUE);
    paths = parsed.paths;
    reaches =
      name === 'rgrep' ||
      parsed.options.some(
        ([o, v]) =>
          ['-r', '-R', '--recursive', '--dereference-recursive'].includes(o) ||
          ((o === '-d' || o === '--directories') && v === 'recurse'),
      );
  } else if (name === 'rg') {
    const parsed = parseOptions(args, RG_SHORT_VALUE, RG_LONG_VALUE);
    paths = parsed.paths;
    reaches =
      parsed.options.some(
        ([o]) => o === '-u' || o === '-.' || o === '--unrestricted' || o === '--hidden' || o.startsWith('--no-ignore'),
      ) || rgGlobTarget(parsed.options, budget) !== null;
  }
  if (!reaches || (paths.length > 0 && !paths.some(isBroadPath))) return null;
  return 'busca recursiva que alcança os arquivos de banco remoto (use a ferramenta Grep ou um subdiretório)';
}

/** @typedef {{ ch: string, literal: boolean }} ShellChar caractere e se está entre aspas ou escapado */

/**
 * Palavras do comando como o shell as vê para glob: aspas e `\` tornam o
 * caractere literal; separadores fora de aspas dividem palavras.
 * @param {string} command
 * @returns {ShellChar[][]}
 */
function shellWords(command) {
  /** @type {ShellChar[][]} */
  const words = [];
  /** @type {ShellChar[]} */
  let current = [];
  /** @type {string | null} */
  let quote = null;
  for (let i = 0; i < command.length; i++) {
    const ch = command[i];
    if (quote) {
      if (ch === quote) quote = null;
      else if (quote === '"' && ch === '\\' && i + 1 < command.length) current.push({ ch: command[++i], literal: true });
      else current.push({ ch, literal: true });
    } else if (ch === "'" || ch === '"') {
      quote = ch;
    } else if (ch === '\\' && i + 1 < command.length) {
      current.push({ ch: command[++i], literal: true });
    } else if (WORD_BREAK.test(ch)) {
      if (current.length) words.push(current);
      current = [];
    } else {
      current.push({ ch, literal: false });
    }
  }
  if (current.length) words.push(current);
  return words;
}

/**
 * Expansão de chaves do shell (`{a,b}`, inclusive aninhadas) fora de aspas.
 * Lança TooManyAlternatives quando passa do orçamento.
 * @param {ShellChar[]} word
 * @param {BraceBudget} budget
 * @returns {ShellChar[][]}
 */
function expandBraces(word, budget) {
  for (let open = 0; open < word.length; open++) {
    if (word[open].literal || word[open].ch !== '{') continue;
    let depth = 0;
    /** @type {number[]} */
    const commas = [];
    for (let j = open; j < word.length; j++) {
      if (word[j].literal) continue;
      const { ch } = word[j];
      if (ch === '{') depth++;
      else if (ch === ',' && depth === 1) commas.push(j);
      else if (ch === '}' && --depth === 0) {
        if (!commas.length) break;
        const bounds = [open, ...commas, j];
        return bounds
          .slice(0, -1)
          .flatMap((b, k) =>
            expandBraces([...word.slice(0, open), ...word.slice(b + 1, bounds[k + 1]), ...word.slice(j + 1)], budget),
          );
      }
    }
  }
  if (--budget.left < 0) throw new TooManyAlternatives();
  return [word];
}

const escapeRe = (/** @type {string} */ s) => s.replace(/[.*+?^${}()|[\]\\/-]/g, '\\$&');

/**
 * Regex de um glob (`*`, `?`, `[…]`); caracteres literais são escapados.
 * Shell (padrão): um nome que começa por `.` só casa se o glob começar por `.`.
 * Ripgrep (`ripgrep: true`): sem essa regra, com `**` (seguido de `/`, casa também zero diretórios) e
 * `ignoreCase` para `--iglob`.
 * @param {ShellChar[]} segment
 * @param {{ ripgrep?: boolean, ignoreCase?: boolean }} [mode]
 * @returns {RegExp | null}
 */
function globRegex(segment, { ripgrep = false, ignoreCase = false } = {}) {
  if (!ripgrep && segment[0]?.ch !== '.') return null;
  let re = '';
  for (let i = 0; i < segment.length; i++) {
    const { ch, literal } = segment[i];
    const doubleStar = ripgrep && !literal && ch === '*' && segment[i + 1]?.ch === '*' && !segment[i + 1].literal;
    if (literal) re += escapeRe(ch);
    else if (doubleStar && segment[i + 2]?.ch === '/') {
      re += '(?:.*/)?';
      i += 2;
    } else if (doubleStar) {
      re += '.*';
      i += 1;
    } else if (ch === '*') re += '[^/]*';
    else if (ch === '?') re += '[^/]';
    else if (ch === '[') {
      let j = i + 1;
      if (segment[j]?.ch === '!' || segment[j]?.ch === '^') j++;
      if (segment[j]?.ch === ']') j++;
      while (j < segment.length && segment[j].ch !== ']') j++;
      if (j >= segment.length) {
        re += '\\[';
        continue;
      }
      const body = segment.slice(i + 1, j).map((c) => c.ch).join('');
      re += `[${body.replace(/^!/, '^').replace(/[\\\]]/g, '\\$&')}]`;
      i = j;
    } else re += escapeRe(ch);
  }
  return new RegExp(`^${re}$`, ignoreCase ? 'i' : '');
}

/**
 * Nome de arquivo de banco remoto alcançado por uma palavra com glob ou chaves
 * (`.*staging`, `.[e]nv.migrate.staging`, `{README.md,.env.migrate.production}`).
 * @param {ShellChar[]} word
 * @param {BraceBudget} budget
 * @returns {string | null}
 */
function globTarget(word, budget) {
  const alternatives = expandBraces(word, budget);
  const hasGlob = (/** @type {ShellChar[]} */ w) => w.some((c) => !c.literal && '*?['.includes(c.ch));
  if (alternatives.length === 1 && !hasGlob(word)) return null;
  for (const alt of alternatives) {
    const lastSlash = alt.findLastIndex((c) => c.ch === '/');
    const re = globRegex(alt.slice(lastSlash + 1));
    const name = re && REMOTE_ENV_FILES.find((n) => re.test(n));
    if (name) return name;
  }
  return null;
}

/**
 * Glob do ripgrep (`rg -g`, ferramenta Grep) que alcança um arquivo de banco remoto
 * na raiz da busca. Semântica do .gitignore: sem a regra do `.` inicial, `**`, `/`
 * inicial ancora na raiz, `\` escapa, `!` inicial exclui (não alcança nada).
 * @param {string} glob
 * @param {BraceBudget} budget
 * @param {boolean} ignoreCase
 * @returns {string | null}
 */
function ripgrepGlobTarget(glob, budget, ignoreCase) {
  if (glob.startsWith('!')) return null;
  /** @type {ShellChar[]} */
  const chars = [];
  for (let i = glob.startsWith('/') ? 1 : 0; i < glob.length; i++) {
    if (glob[i] === '\\' && i + 1 < glob.length) chars.push({ ch: glob[++i], literal: true });
    else chars.push({ ch: glob[i], literal: false });
  }
  for (const alt of expandBraces(chars, budget)) {
    const re = globRegex(alt, { ripgrep: true, ignoreCase });
    const name = re && REMOTE_ENV_FILES.find((n) => re.test(n));
    if (name) return name;
  }
  return null;
}

/** @param {string} command @returns {Classification} */
function classifyCommand(command) {
  try {
    return classifyCommandWithin(command, newBudget());
  } catch (error) {
    if (error instanceof TooManyAlternatives) return block('expansão de chaves grande demais para conferir');
    throw error;
  }
}

/** @param {string} command @param {BraceBudget} budget @returns {Classification} */
function classifyCommandWithin(command, budget) {
  // `&` simples também separa comandos (`sleep 1 & npx tsx …`); o SEGMENT_SPLIT da 1.14 fica intocado.
  for (const segment of command.split(SEGMENT_SPLIT).flatMap((s) => s.split(BACKGROUND_SPLIT))) {
    // O trecho inteiro e cada pedaço de subshell/substituição: o trecho inteiro
    // mantém casos como `npx tsx $(pwd)/scripts/migrate.ts`, e os pedaços pegam
    // `(npx tsx …)`, `echo $(npx tsx …)` e crases (code review da 1.15).
    for (const piece of [segment, ...segment.split(SUBSHELL_SPLIT)]) {
      const tokens = segmentTokens(piece);
      const reason = migrateReason(tokens) ?? supabaseReason(tokens) ?? searchReason(tokens, budget);
      if (reason) return block(reason);
    }
  }
  if (DOTGLOB_RES.some((re) => re.test(command))) {
    return block('muda a expansão de globs para alcançar arquivos ocultos (dotglob, GLOBIGNORE, globdots)');
  }
  // Nomes montados com aspas ou barra invertida (`.env.migrate.sta"ging"`,
  // `.env.migrate.stag\ing`) são conferidos também no comando sem elas.
  for (const text of [command, command.replace(/['"\\]/g, '')]) {
    const file = text.match(ENV_FILE_RE);
    if (file) return block(`cita ${file[1]}`);
    if (ENV_GLOB_RE.test(text)) return block('cita um glob de arquivos .env');
  }
  // Globs e chaves que alcançam os arquivos sem começar por `.env` literal (code review 1.15, 3ª rodada).
  for (const word of shellWords(command)) {
    const name = globTarget(word, budget);
    if (name) return block(`cita um glob que alcança ${name}`);
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
 * `path` da ferramenta Grep é um subdiretório do cwd (não alcança os arquivos da raiz).
 * Sem cwd, não dá para saber: tratado como raiz.
 * @param {unknown} searchPath @param {string | undefined} cwd
 */
function isSubdirOf(searchPath, cwd) {
  if (typeof searchPath !== 'string' || !searchPath || !cwd) return false;
  const rel = path.relative(cwd, path.resolve(cwd, searchPath));
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
}

/**
 * Glob da ferramenta Grep (repassado ao `rg --glob`). @param {Record<string, unknown>} toolInput
 * @param {string | undefined} cwd @returns {Classification}
 */
function classifyGrepGlob(toolInput, cwd) {
  const glob = toolInput.glob;
  if (typeof glob !== 'string') return ALLOW;
  if (/(?:^|[/{,])\.env/.test(glob)) return block('cita um glob de arquivos .env');
  if (isSubdirOf(toolInput.path, cwd)) return ALLOW;
  try {
    const name = ripgrepGlobTarget(glob, newBudget(), false);
    return name ? block(`cita um glob que alcança ${name}`) : ALLOW;
  } catch (error) {
    if (error instanceof TooManyAlternatives) return block('expansão de chaves grande demais para conferir');
    throw error;
  }
}

/**
 * Classifica uma chamada de ferramenta.
 * @param {string} toolName
 * @param {Record<string, unknown>} toolInput
 * @param {string} [cwd] diretório da sessão (entrada `cwd` do hook), usado pelo glob da ferramenta Grep
 * @returns {Classification}
 */
export function classifyRemoteAccess(toolName, toolInput, cwd) {
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
    return classifyGrepGlob(toolInput, cwd);
  }
  return ALLOW;
}

/** @param {string} reason @returns {Decision} */
const deny = (reason) => ({ allow: false, reason: `Comandos em bancos remotos são do PO: ${reason}. Passe o comando para o PO rodar.` });

/**
 * Avaliação completa de uma entrada do hook (já em JSON).
 * @param {{ tool_name?: unknown, tool_input?: unknown, cwd?: unknown }} input
 * @returns {Decision}
 */
export function evaluateRemote(input) {
  const toolInput = input.tool_input && typeof input.tool_input === 'object' ? /** @type {Record<string, unknown>} */ (input.tool_input) : {};
  const cwd = typeof input.cwd === 'string' ? input.cwd : undefined;
  const result = classifyRemoteAccess(typeof input.tool_name === 'string' ? input.tool_name : '', toolInput, cwd);
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
