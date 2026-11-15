/**
 * Lógica de ambiente do `db:migrate` (Story 1.13). Funções puras, testadas.
 *
 * O banco é escolhido pelo ambiente — cada um com seu arquivo `.env` local —
 * em vez de uma URL colada no terminal. Staging e produção só aceitam o
 * pooler do Supabase em modo transação (porta 6543), o mesmo caminho do app
 * (Story 1.10); produção exige confirmação explícita.
 */

export type MigrateEnv = 'local' | 'staging' | 'production';

export interface MigrateArgs {
  env: MigrateEnv;
  confirmProduction: boolean;
}

export type TargetCheck = { ok: true } | { ok: false; reason: string };

const ENVS: readonly MigrateEnv[] = ['local', 'staging', 'production'];
const REMOTE_POOLER_PORT = '6543';

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
    if (arg === '--env') env = argv[++i] ?? '';
    else if (arg.startsWith('--env=')) env = arg.slice('--env='.length);
    else if (arg === '--confirm-production') confirmProduction = true;
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

export function checkTarget(args: MigrateArgs, databaseUrl: string | undefined): TargetCheck {
  if (!databaseUrl) {
    return { ok: false, reason: `DATABASE_URL não definido em ${envFileFor(args.env)}` };
  }

  let url: URL;
  try {
    url = new URL(databaseUrl);
  } catch {
    return { ok: false, reason: `DATABASE_URL inválido em ${envFileFor(args.env)}` };
  }

  if (args.env !== 'local' && url.port !== REMOTE_POOLER_PORT) {
    return {
      ok: false,
      reason: `${args.env} deve usar o pooler do Supabase em modo transação (porta ${REMOTE_POOLER_PORT}), igual ao app; encontrada a porta ${url.port || '5432'}`,
    };
  }

  if (args.env === 'production' && !args.confirmProduction) {
    return { ok: false, reason: 'migration em produção exige --confirm-production' };
  }

  return { ok: true };
}
