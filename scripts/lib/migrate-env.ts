/**
 * Lógica de ambiente do `db:migrate` (Story 1.13). Funções sem I/O, testadas:
 * quem lê arquivos e o `process.env` é o chamador (`scripts/migrate.ts`,
 * `drizzle.config.ts`), que repassa o conteúdo ou uma função de leitura.
 *
 * O banco é escolhido pelo ambiente — cada um com seu arquivo `.env` local —
 * em vez de uma URL colada no terminal. Staging e produção só aceitam o
 * pooler do Supabase em modo transação (porta 6543), o mesmo caminho do app
 * (Story 1.10); o local, o pooler local (54329); produção exige confirmação
 * explícita. Como staging e produção têm o mesmo host:porta no pooler
 * compartilhado, o project ref (usuário `postgres.<ref>`, ou host
 * `db.<ref>.supabase.co` no pooler dedicado) precisa ser o do ambiente.
 */

import { join } from 'node:path';

import { parse } from 'dotenv';

export type MigrateEnv = 'local' | 'staging' | 'production';

export interface MigrateArgs {
  env: MigrateEnv;
  confirmProduction: boolean;
}

export type TargetCheck = { ok: true } | { ok: false; reason: string };

export type ResolvedUrl = { ok: true; url: string; source: string } | { ok: false; reason: string };

export interface ResolveUrlInput {
  env: MigrateEnv;
  /** `DATABASE_URL` lido do arquivo do ambiente (undefined se não há arquivo ou valor). */
  fileValue: string | undefined;
  /** `DATABASE_URL` já definido no shell (no CI, vem do secret/variável do job). */
  shellValue: string | undefined;
  isCi: boolean;
}

const ENVS: readonly MigrateEnv[] = ['local', 'staging', 'production'];
const REMOTE_POOLER_PORT = '6543';
const LOCAL_POOLER_PORT = '54329';
const LOCAL_POOLER_URL = 'postgresql://postgres.pooler-dev:postgres@127.0.0.1:54329/postgres';
const CI_SOURCE = 'variável DATABASE_URL do CI';
const ENV_VALUE_REQUIRED = '--env exige um valor: local, staging ou production.';
const LOOPBACK_HOSTS: readonly string[] = ['127.0.0.1', 'localhost', '[::1]'];
const ENV_REPEATED = '--env só pode aparecer uma vez.';

/**
 * Project ref do Supabase de cada ambiente remoto — fonte única (os testes
 * importam daqui). Não é segredo (aparece no NEXT_PUBLIC_SUPABASE_URL).
 * Trocar de projeto exige atualizar só aqui.
 */
export const PROJECT_REFS: Readonly<Record<Exclude<MigrateEnv, 'local'>, string>> = {
  staging: 'bohdzhnbgeqodsgevoxm',
  production: 'qtjpozslalbqilbvyyje',
};

/**
 * Arquivo de cada ambiente. Staging e produção usam `.env.migrate.*`, só com o
 * `DATABASE_URL` (no `.gitignore`): nunca um nome que o Next carregue
 * (`.env.{modo}` / `.env.{modo}.local`). Com `.env.production.local`, todo
 * `next build`/`next start` local usaria o banco e os segredos de produção
 * (correct course 2026-11-17).
 */
const ENV_FILES: Record<MigrateEnv, string> = {
  local: '.env.local',
  staging: '.env.migrate.staging',
  production: '.env.migrate.production',
};

/**
 * Nomes antigos dos arquivos de banco remoto (até o correct course 2026-11-17).
 * O Next carrega o `.env.production.local` em todo `next build`/`next start`;
 * um arquivo esquecido (outra máquina, backup) traria de volta o banco e os
 * segredos de produção para o app local. `migrate.ts` e `next.config.ts` recusam
 * rodar enquanto algum existir.
 */
export const LEGACY_ENV_FILES = ['.env.staging.local', '.env.production.local'] as const;

const LEGACY_RENAMES: Record<(typeof LEGACY_ENV_FILES)[number], string> = {
  '.env.staging.local': ENV_FILES.staging,
  '.env.production.local': ENV_FILES.production,
};

/** Mensagem de recusa para os arquivos antigos presentes; undefined se não há nenhum. */
export function legacyEnvFilesError(present: readonly string[]): string | undefined {
  const found = LEGACY_ENV_FILES.filter((file) => present.includes(file));
  if (found.length === 0) return undefined;

  const renames = found.map((file) => `${file} → ${LEGACY_RENAMES[file]}`).join(', ');
  return `arquivo de banco remoto com o nome antigo na raiz do repositório (o Next carrega o .env.production.local em todo next build/start, com o banco e os segredos de produção). Renomeie (${renames}) e deixe nele só o DATABASE_URL.`;
}

function isMigrateEnv(value: string): value is MigrateEnv {
  return (ENVS as readonly string[]).includes(value);
}

export function parseMigrateArgs(argv: readonly string[]): MigrateArgs {
  let env: string | undefined;
  let confirmProduction = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--env') {
      if (env !== undefined) throw new Error(ENV_REPEATED);
      const value = argv[i + 1];
      if (value === undefined || value.startsWith('--')) throw new Error(ENV_VALUE_REQUIRED);
      env = value;
      i++;
    } else if (arg.startsWith('--env=')) {
      if (env !== undefined) throw new Error(ENV_REPEATED);
      env = arg.slice('--env='.length);
      if (!env) throw new Error(ENV_VALUE_REQUIRED);
    } else if (arg === '--confirm-production') {
      confirmProduction = true;
    } else if (!arg.startsWith('-')) {
      // `npm run db:migrate --env staging` (sem `--`): o npm consome o `--env`
      // e só repassa "staging" ao script — que rodaria no local em silêncio.
      throw new Error(
        `Argumento desconhecido: "${arg}". Repasse as opções ao script depois de "--": npm run db:migrate -- --env <local|staging|production>`,
      );
    } else {
      throw new Error(`Argumento desconhecido: "${arg}". Opções: --env <local|staging|production>, --confirm-production`);
    }
  }

  env ??= 'local';
  if (!isMigrateEnv(env)) {
    throw new Error(`Ambiente inválido: "${env}". Use local, staging ou production.`);
  }
  if (confirmProduction && env !== 'production') {
    throw new Error(`--confirm-production só vale com --env production (ambiente pedido: ${env}).`);
  }

  return { env, confirmProduction };
}

export function envFileFor(env: MigrateEnv): string {
  return ENV_FILES[env];
}

/** Caminho do arquivo do ambiente a partir da raiz do repositório, não do diretório atual. */
export function envFilePath(env: MigrateEnv, rootDir: string): string {
  return join(rootDir, envFileFor(env));
}

/** Usuário da URL decodificado; undefined se a codificação `%` for inválida. */
function decodedUsername(url: URL): string | undefined {
  try {
    return decodeURIComponent(url.username);
  } catch {
    return undefined;
  }
}

function refFromUser(url: URL): string | undefined {
  const user = decodedUsername(url);
  return user === undefined ? undefined : /^postgres\.(.+)$/.exec(user)?.[1];
}

function refFromHost(url: URL): string | undefined {
  return /^db\.([a-z0-9]+)\.supabase\.co$/.exec(url.hostname)?.[1];
}

/**
 * Project ref do Supabase na URL: usuário `postgres.<ref>` (pooler
 * compartilhado) ou host `db.<ref>.supabase.co` (pooler dedicado). Undefined
 * fora desses formatos.
 */
export function projectRefFromUrl(databaseUrl: string): string | undefined {
  const url = new URL(databaseUrl);
  return refFromUser(url) ?? refFromHost(url);
}

export function describeTarget(env: MigrateEnv, databaseUrl: string): string {
  const url = new URL(databaseUrl);
  // No local, `pooler-dev` é o tenant do Supavisor, não um project ref.
  const ref = env === 'local' ? undefined : projectRefFromUrl(databaseUrl);
  return `${env} → ${url.hostname}:${url.port || '5432'}${ref ? ` (projeto ${ref})` : ''}`;
}

/** `DATABASE_URL` do conteúdo do arquivo `.env` do ambiente (undefined sem arquivo ou sem a chave). */
export function databaseUrlFromEnvFile(content: string | undefined): string | undefined {
  if (content === undefined) return undefined;
  return parse(content).DATABASE_URL || undefined;
}

/**
 * Arquivo de migration remota (`.env.migrate.*`) só com o `DATABASE_URL` (AC 2):
 * os demais segredos de staging/produção ficam só na Vercel. A recusa cita só os
 * nomes das chaves, nunca os valores. O `.env.local` (app inteiro) e a URL do CI
 * (sem arquivo) não são restringidos.
 */
export function checkEnvFileKeys(env: MigrateEnv, content: string | undefined): TargetCheck {
  if (env === 'local' || content === undefined) return { ok: true };

  const extras = Object.keys(parse(content)).filter((key) => key !== 'DATABASE_URL');
  if (extras.length === 0) return { ok: true };

  return {
    ok: false,
    reason: `${envFileFor(env)} deve ter só o DATABASE_URL; remova também: ${extras.join(', ')} (os demais segredos de ${env} ficam só na Vercel)`,
  };
}

/**
 * Só o runner do GitHub Actions conta como CI: um `CI=true` exportado no
 * terminal não pode liberar o `DATABASE_URL` do shell.
 */
export function isGithubActions(processEnv: Readonly<Record<string, string | undefined>>): boolean {
  return processEnv.GITHUB_ACTIONS === 'true';
}

/**
 * Fora do CI, a URL vem **só** do arquivo do ambiente: um `DATABASE_URL`
 * exportado no shell (de outro ambiente) nunca decide o destino. No CI não há
 * arquivo e a URL vem da variável do job (secret do repositório).
 */
export function resolveDatabaseUrl({ env, fileValue, shellValue, isCi }: ResolveUrlInput): ResolvedUrl {
  if (fileValue) return { ok: true, url: fileValue, source: envFileFor(env) };
  if (isCi && shellValue) return { ok: true, url: shellValue, source: CI_SOURCE };

  return {
    ok: false,
    reason: isCi
      ? `DATABASE_URL não definido em ${envFileFor(env)} nem na ${CI_SOURCE}`
      : `DATABASE_URL não definido em ${envFileFor(env)} (fora do CI, a URL vem só do arquivo do ambiente, nunca do shell)`,
  };
}

export function checkTarget(args: MigrateArgs, databaseUrl: string, source = envFileFor(args.env)): TargetCheck {
  let url: URL;
  try {
    url = new URL(databaseUrl);
  } catch {
    return { ok: false, reason: `DATABASE_URL inválido em ${source}` };
  }

  // O Next (@next/env) expande $VAR/${VAR} do .env.local; o dotenv.parse daqui
  // não. Com `$` na URL, app e migrate falariam com bancos (ou senhas) diferentes.
  // Só vale para URL lida de arquivo: a do CI vem do secret, sem expansão nenhuma.
  if (source !== CI_SOURCE && databaseUrl.includes('$')) {
    return {
      ok: false,
      reason: `DATABASE_URL com "$" em ${source}: o Next expande $VAR nos arquivos .env e o migrate não, e as URLs do app e da migration divergiriam. Escreva a URL completa, sem variáveis, com "$" da senha codificado como %24`,
    };
  }

  if (decodedUsername(url) === undefined) {
    return { ok: false, reason: `usuário da DATABASE_URL com codificação % inválida em ${source}` };
  }

  const port = url.port || '5432';

  if (args.env === 'local' && !LOOPBACK_HOSTS.includes(url.hostname)) {
    return {
      ok: false,
      reason: `local deve apontar para o Supabase desta máquina (127.0.0.1); encontrado o host ${url.hostname} em ${source}. Use ${LOCAL_POOLER_URL}`,
    };
  }

  if (args.env === 'local' && port !== LOCAL_POOLER_PORT) {
    return {
      ok: false,
      reason: `local deve usar o pooler em modo transação (porta ${LOCAL_POOLER_PORT}), o mesmo caminho de staging e produção; encontrada a porta ${port} em ${source}. Use ${LOCAL_POOLER_URL}`,
    };
  }

  if (args.env !== 'local' && port !== REMOTE_POOLER_PORT) {
    return {
      ok: false,
      reason: `${args.env} deve usar o pooler do Supabase em modo transação (porta ${REMOTE_POOLER_PORT}), igual ao app; encontrada a porta ${port} em ${source}`,
    };
  }

  if (args.env !== 'local') {
    const expected = PROJECT_REFS[args.env];
    const userRef = refFromUser(url);
    const hostRef = refFromHost(url);
    if (userRef && hostRef && userRef !== hostRef) {
      return {
        ok: false,
        reason: `a URL em ${source} mistura projetos: usuário postgres.${userRef} e host db.${hostRef}.supabase.co`,
      };
    }
    const ref = userRef ?? hostRef;
    if (!ref) {
      return {
        ok: false,
        reason: `${args.env} exige uma URL do Supabase que identifique o project ref (${expected}): usuário postgres.<ref> no pooler compartilhado ou host db.<ref>.supabase.co no pooler dedicado; a URL em ${source} não tem nenhum dos dois`,
      };
    }
    if (ref !== expected) {
      return {
        ok: false,
        reason: `${args.env} é o projeto ${expected}, mas a URL em ${source} é do projeto ${ref}`,
      };
    }
  }

  if (args.env === 'production' && !args.confirmProduction) {
    return { ok: false, reason: 'migration em produção exige --confirm-production' };
  }

  return { ok: true };
}

/**
 * URL do drizzle-kit (`db:push`, `db:studio`): só o banco local,
 * com as regras do `db:migrate --env local` — `.env.local` (nunca o shell fora
 * do CI) e o pooler 54329. Um `db:push` nunca altera staging/produção sem migration.
 */
export function drizzleKitDatabaseUrl(
  envLocalContent: string | undefined,
  processEnv: Readonly<Record<string, string | undefined>>,
): string {
  const env: MigrateEnv = 'local';
  const resolved = resolveDatabaseUrl({
    env,
    fileValue: databaseUrlFromEnvFile(envLocalContent),
    shellValue: processEnv.DATABASE_URL,
    isCi: isGithubActions(processEnv),
  });
  if (!resolved.ok) throw new Error(`drizzle-kit cancelado: ${resolved.reason}`);

  const check = checkTarget({ env, confirmProduction: false }, resolved.url, resolved.source);
  if (!check.ok) throw new Error(`drizzle-kit cancelado: ${check.reason}`);

  return resolved.url;
}

/**
 * `dbCredentials` do `drizzle.config.ts`. A URL só é lida e validada quando o
 * drizzle-kit a usa: o `db:generate` (que não conecta no banco) funciona sem
 * `.env.local`, e `db:push`/`db:studio` continuam presos ao pooler local.
 */
export function drizzleKitCredentials(
  readEnvLocal: () => string | undefined,
  processEnv: Readonly<Record<string, string | undefined>>,
): { readonly url: string } {
  return {
    get url() {
      return drizzleKitDatabaseUrl(readEnvLocal(), processEnv);
    },
  };
}
