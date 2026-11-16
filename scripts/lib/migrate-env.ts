/**
 * Lógica de ambiente do `db:migrate` (Story 1.13). Funções puras, testadas.
 *
 * O banco é escolhido pelo ambiente — cada um com seu arquivo `.env` local —
 * em vez de uma URL colada no terminal. Staging e produção só aceitam o
 * pooler do Supabase em modo transação (porta 6543), o mesmo caminho do app
 * (Story 1.10); o local, o pooler local (54329); produção exige confirmação
 * explícita.
 */

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

const ENV_FILES: Record<MigrateEnv, string> = {
  local: '.env.local',
  staging: '.env.staging.local',
  production: '.env.production.local',
};

function isMigrateEnv(value: string): value is MigrateEnv {
  return (ENVS as readonly string[]).includes(value);
}

export function parseMigrateArgs(argv: readonly string[]): MigrateArgs {
  let env = 'local';
  let confirmProduction = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--env') {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith('--')) throw new Error(ENV_VALUE_REQUIRED);
      env = value;
      i++;
    } else if (arg.startsWith('--env=')) {
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

  if (!isMigrateEnv(env)) {
    throw new Error(`Ambiente inválido: "${env}". Use local, staging ou production.`);
  }

  return { env, confirmProduction };
}

export function envFileFor(env: MigrateEnv): string {
  return ENV_FILES[env];
}

export function describeTarget(env: MigrateEnv, databaseUrl: string): string {
  const url = new URL(databaseUrl);
  return `${env} → ${url.hostname}:${url.port || '5432'}`;
}

/** `DATABASE_URL` do conteúdo do arquivo `.env` do ambiente (undefined sem arquivo ou sem a chave). */
export function databaseUrlFromEnvFile(content: string | undefined): string | undefined {
  if (content === undefined) return undefined;
  return parse(content).DATABASE_URL || undefined;
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

  const port = url.port || '5432';

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

  if (args.env === 'production' && !args.confirmProduction) {
    return { ok: false, reason: 'migration em produção exige --confirm-production' };
  }

  return { ok: true };
}
