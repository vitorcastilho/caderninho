import { describe, it, expect, vi } from 'vitest';

import {
  parseMigrateArgs,
  envFileFor,
  describeTarget,
  checkTarget,
  resolveDatabaseUrl,
  databaseUrlFromEnvFile,
  isGithubActions,
  drizzleKitDatabaseUrl,
  drizzleKitCredentials,
  projectRefFromUrl,
  PROJECT_REFS,
} from './migrate-env';

// Project refs vêm do próprio módulo: uma só fonte, o teste não diverge do código.
const STAGING_REF = PROJECT_REFS.staging;
const PRODUCTION_REF = PROJECT_REFS.production;
const POOLER_HOST = 'aws-1-us-east-1.pooler.supabase.com';

// Story 1.13 — `db:migrate` escolhe o banco pelo ambiente (arquivo .env do
// ambiente), nunca por URL colada no terminal, e recusa destinos perigosos.
describe('parseMigrateArgs', () => {
  it('sem argumentos usa o ambiente local (compatível com o uso atual)', () => {
    expect(parseMigrateArgs([])).toEqual({ env: 'local', confirmProduction: false });
  });

  it('aceita --env staging e --env=production', () => {
    expect(parseMigrateArgs(['--env', 'staging']).env).toBe('staging');
    expect(parseMigrateArgs(['--env=production']).env).toBe('production');
  });

  it('lê --confirm-production', () => {
    expect(parseMigrateArgs(['--env', 'production', '--confirm-production'])).toEqual({
      env: 'production',
      confirmProduction: true,
    });
  });

  it('recusa ambiente desconhecido', () => {
    expect(() => parseMigrateArgs(['--env', 'prod'])).toThrow(/local, staging ou production/);
  });

  it('recusa --env sem valor', () => {
    expect(() => parseMigrateArgs(['--env'])).toThrow(/--env exige um valor/);
    expect(() => parseMigrateArgs(['--env', '--confirm-production'])).toThrow(/--env exige um valor/);
    expect(() => parseMigrateArgs(['--env='])).toThrow(/--env exige um valor/);
  });

  it('recusa argumento desconhecido (ex.: flag com erro de digitação)', () => {
    expect(() => parseMigrateArgs(['--env', 'production', '--confim-production'])).toThrow(
      /Argumento desconhecido: "--confim-production"/,
    );
  });

  it('recusa argumento solto e lembra do "--" do npm (npm run db:migrate --env staging)', () => {
    expect(() => parseMigrateArgs(['staging'])).toThrow(/npm run db:migrate -- --env/);
  });
});

describe('envFileFor', () => {
  it('mapeia cada ambiente para o seu arquivo', () => {
    expect(envFileFor('local')).toBe('.env.local');
    expect(envFileFor('staging')).toBe('.env.staging.local');
    expect(envFileFor('production')).toBe('.env.production.local');
  });
});

describe('describeTarget', () => {
  it('descreve host, porta e projeto sem expor a senha', () => {
    const text = describeTarget('staging', `postgresql://postgres.${STAGING_REF}:SuperSecreta@${POOLER_HOST}:6543/postgres`);

    expect(text).toBe(`staging → ${POOLER_HOST}:6543 (projeto ${STAGING_REF})`);
    expect(text).not.toContain('SuperSecreta');
  });

  it('no local não cita projeto (pooler-dev é o tenant do Supavisor, não um project ref)', () => {
    expect(describeTarget('local', 'postgresql://postgres.pooler-dev:postgres@127.0.0.1:54329/postgres')).toBe(
      'local → 127.0.0.1:54329',
    );
  });

  it('usa a porta padrão 5432 quando a URL não tem porta', () => {
    expect(describeTarget('staging', 'postgresql://u:p@db.example.com/postgres')).toBe('staging → db.example.com:5432');
  });
});

describe('resolveDatabaseUrl', () => {
  const FILE_URL = 'postgresql://u:p@arquivo.example.com:6543/postgres';
  const SHELL_URL = 'postgresql://u:p@shell.example.com:6543/postgres';

  it('fora do CI usa o DATABASE_URL do arquivo do ambiente, mesmo com outro no shell', () => {
    expect(resolveDatabaseUrl({ env: 'staging', fileValue: FILE_URL, shellValue: SHELL_URL, isCi: false })).toEqual({
      ok: true,
      url: FILE_URL,
      source: '.env.staging.local',
    });
  });

  it('fora do CI recusa usar o DATABASE_URL do shell quando falta o arquivo (ou o valor nele)', () => {
    const result = resolveDatabaseUrl({ env: 'staging', fileValue: undefined, shellValue: SHELL_URL, isCi: false });

    expect(result.ok).toBe(false);
    expect(!result.ok && result.reason).toMatch(/DATABASE_URL não definido em \.env\.staging\.local/);
  });

  it('no CI (sem arquivo) usa o DATABASE_URL da variável do job', () => {
    expect(resolveDatabaseUrl({ env: 'production', fileValue: undefined, shellValue: SHELL_URL, isCi: true })).toEqual({
      ok: true,
      url: SHELL_URL,
      source: 'variável DATABASE_URL do CI',
    });
  });

  it('no CI o arquivo do ambiente, se existir, ainda prevalece', () => {
    const result = resolveDatabaseUrl({ env: 'local', fileValue: FILE_URL, shellValue: SHELL_URL, isCi: true });

    expect(result.ok && result.url).toBe(FILE_URL);
  });

  it('no CI sem arquivo nem variável, diz o que falta', () => {
    const result = resolveDatabaseUrl({ env: 'staging', fileValue: undefined, shellValue: '', isCi: true });

    expect(result.ok).toBe(false);
    expect(!result.ok && result.reason).toMatch(/DATABASE_URL não definido/);
  });
});

describe('databaseUrlFromEnvFile', () => {
  it('sem arquivo não há valor', () => {
    expect(databaseUrlFromEnvFile(undefined)).toBeUndefined();
  });

  it('lê o DATABASE_URL do conteúdo do arquivo (com aspas e comentários)', () => {
    const content = '# banco\nNEXT_PUBLIC_APP_URL=http://localhost:3000\nDATABASE_URL="postgresql://u:p@h:6543/postgres"\n';

    expect(databaseUrlFromEnvFile(content)).toBe('postgresql://u:p@h:6543/postgres');
  });

  it('arquivo sem DATABASE_URL não tem valor', () => {
    expect(databaseUrlFromEnvFile('BETTER_AUTH_SECRET=x\n')).toBeUndefined();
  });
});

describe('isGithubActions', () => {
  it('reconhece o runner do GitHub Actions', () => {
    expect(isGithubActions({ GITHUB_ACTIONS: 'true', CI: 'true' })).toBe(true);
  });

  it('CI=true sozinho (exportado no terminal) não libera o DATABASE_URL do shell', () => {
    expect(isGithubActions({ CI: 'true' })).toBe(false);
    expect(isGithubActions({})).toBe(false);
  });
});

// drizzle-kit (`db:push`, `db:studio`) só no banco local, com as mesmas regras do
// `db:migrate --env local` (correção feita depois da 2ª rodada do code review da 1.13).
describe('drizzleKitDatabaseUrl', () => {
  const POOLER = 'postgresql://postgres.pooler-dev:postgres@127.0.0.1:54329/postgres';
  const REMOTE = 'postgresql://postgres.abc:x@aws-1-us-east-1.pooler.supabase.com:6543/postgres';

  it('usa o DATABASE_URL do .env.local, ignorando o do shell', () => {
    expect(drizzleKitDatabaseUrl(`DATABASE_URL=${POOLER}\n`, { DATABASE_URL: REMOTE })).toBe(POOLER);
  });

  it('sem .env.local recusa o DATABASE_URL do shell', () => {
    expect(() => drizzleKitDatabaseUrl(undefined, { DATABASE_URL: REMOTE })).toThrow(
      /drizzle-kit cancelado: DATABASE_URL não definido em \.env\.local/,
    );
  });

  it('recusa .env.local apontando para um banco remoto (6543)', () => {
    expect(() => drizzleKitDatabaseUrl(`DATABASE_URL=${REMOTE}\n`, {})).toThrow(/drizzle-kit cancelado: .*54329/);
  });

  it('no GitHub Actions, sem arquivo, aceita a variável do job (só o pooler local)', () => {
    expect(drizzleKitDatabaseUrl(undefined, { GITHUB_ACTIONS: 'true', DATABASE_URL: POOLER })).toBe(POOLER);
    expect(() => drizzleKitDatabaseUrl(undefined, { GITHUB_ACTIONS: 'true', DATABASE_URL: REMOTE })).toThrow(
      /54329/,
    );
  });
});

// O `db:generate` não conecta no banco: a URL só é lida e validada quando o
// drizzle-kit a usa (`db:push`, `db:studio`) — um clone novo sem `.env.local` gera migrations.
describe('drizzleKitCredentials', () => {
  const POOLER = 'postgresql://postgres.pooler-dev:postgres@127.0.0.1:54329/postgres';

  it('não lê o .env.local nem valida ao montar o config', () => {
    const readEnvLocal = vi.fn(() => undefined);

    expect(() => drizzleKitCredentials(readEnvLocal, {})).not.toThrow();
    expect(readEnvLocal).not.toHaveBeenCalled();
  });

  it('valida quando a URL é usada', () => {
    const credentials = drizzleKitCredentials(() => undefined, { DATABASE_URL: POOLER });

    expect(() => credentials.url).toThrow(/drizzle-kit cancelado: DATABASE_URL não definido em \.env\.local/);
  });

  it('devolve a URL do .env.local quando válida', () => {
    expect(drizzleKitCredentials(() => `DATABASE_URL=${POOLER}\n`, {}).url).toBe(POOLER);
  });
});

describe('projectRefFromUrl', () => {
  it('extrai o project ref do usuário postgres.<ref> do pooler', () => {
    expect(projectRefFromUrl(`postgresql://postgres.${STAGING_REF}:p@${POOLER_HOST}:6543/postgres`)).toBe(STAGING_REF);
  });

  it('extrai o project ref do host db.<ref>.supabase.co do pooler dedicado (usuário postgres)', () => {
    expect(projectRefFromUrl(`postgresql://postgres:p@db.${STAGING_REF}.supabase.co:6543/postgres`)).toBe(STAGING_REF);
  });

  it('sem o formato postgres.<ref> não há ref', () => {
    expect(projectRefFromUrl('postgresql://postgres:p@db.example.com:6543/postgres')).toBeUndefined();
    expect(projectRefFromUrl('postgresql://u:p@db.example.com/postgres')).toBeUndefined();
  });
});

describe('checkTarget', () => {
  const STAGING_6543 = `postgresql://postgres.${STAGING_REF}:p@${POOLER_HOST}:6543/postgres`;
  const STAGING_5432 = `postgresql://postgres.${STAGING_REF}:p@${POOLER_HOST}:5432/postgres`;
  const PRODUCTION_6543 = `postgresql://postgres.${PRODUCTION_REF}:p@${POOLER_HOST}:6543/postgres`;

  it('recusa staging com a URL do projeto de produção (mesmo host e porta)', () => {
    const result = checkTarget({ env: 'staging', confirmProduction: false }, PRODUCTION_6543);

    expect(result.ok).toBe(false);
    expect(!result.ok && result.reason).toMatch(new RegExp(`${STAGING_REF}.*${PRODUCTION_REF}`));
  });

  it('recusa produção com a URL do projeto de staging, mesmo com --confirm-production', () => {
    const result = checkTarget({ env: 'production', confirmProduction: true }, STAGING_6543);

    expect(result.ok).toBe(false);
    expect(!result.ok && result.reason).toMatch(new RegExp(`${PRODUCTION_REF}.*${STAGING_REF}`));
  });

  it('recusa staging/produção sem project ref no usuário', () => {
    const result = checkTarget(
      { env: 'staging', confirmProduction: false },
      `postgresql://postgres:p@${POOLER_HOST}:6543/postgres`,
    );

    expect(result.ok).toBe(false);
    expect(!result.ok && result.reason).toMatch(/project ref/);
    expect(!result.ok && result.reason).toMatch(/postgres\.<ref>.*db\.<ref>\.supabase\.co/);
  });

  it('aceita staging pelo pooler dedicado (db.<ref>.supabase.co:6543, usuário postgres)', () => {
    expect(
      checkTarget({ env: 'staging', confirmProduction: false }, `postgresql://postgres:p@db.${STAGING_REF}.supabase.co:6543/postgres`),
    ).toEqual({ ok: true });
  });

  it('recusa produção pelo pooler dedicado do projeto de staging', () => {
    const result = checkTarget(
      { env: 'production', confirmProduction: true },
      `postgresql://postgres:p@db.${STAGING_REF}.supabase.co:6543/postgres`,
    );

    expect(result.ok).toBe(false);
  });

  it('cita a origem da URL na mensagem de erro', () => {
    const result = checkTarget({ env: 'staging', confirmProduction: false }, STAGING_5432, 'variável DATABASE_URL do CI');

    expect(!result.ok && result.reason).toMatch(/variável DATABASE_URL do CI/);
  });

  it('aceita staging na porta 6543 (pooler em modo transação)', () => {
    expect(checkTarget({ env: 'staging', confirmProduction: false }, STAGING_6543)).toEqual({ ok: true });
  });

  it('recusa staging/produção fora da porta 6543', () => {
    const result = checkTarget({ env: 'staging', confirmProduction: false }, STAGING_5432);

    expect(result.ok).toBe(false);
    expect(!result.ok && result.reason).toMatch(/6543/);
  });

  it('recusa produção sem --confirm-production', () => {
    const result = checkTarget({ env: 'production', confirmProduction: false }, PRODUCTION_6543);

    expect(result.ok).toBe(false);
    expect(!result.ok && result.reason).toMatch(/--confirm-production/);
  });

  it('aceita produção na 6543 com --confirm-production', () => {
    expect(checkTarget({ env: 'production', confirmProduction: true }, PRODUCTION_6543)).toEqual({ ok: true });
  });

  it('no local aceita o pooler em modo transação (54329)', () => {
    expect(
      checkTarget({ env: 'local', confirmProduction: false }, 'postgresql://p:p@127.0.0.1:54329/postgres'),
    ).toEqual({ ok: true });
  });

  it('no local aceita localhost e ::1 na 54329', () => {
    expect(checkTarget({ env: 'local', confirmProduction: false }, 'postgresql://p:p@localhost:54329/postgres')).toEqual({
      ok: true,
    });
    expect(checkTarget({ env: 'local', confirmProduction: false }, 'postgresql://p:p@[::1]:54329/postgres')).toEqual({
      ok: true,
    });
  });

  it('no local recusa host remoto, mesmo na 54329', () => {
    const result = checkTarget({ env: 'local', confirmProduction: false }, 'postgresql://p:p@db.example.com:54329/postgres');

    expect(result.ok).toBe(false);
    expect(!result.ok && result.reason).toMatch(/127\.0\.0\.1/);
  });

  it('no local recusa a conexão direta (54322) e indica a URL do pooler', () => {
    const result = checkTarget({ env: 'local', confirmProduction: false }, 'postgresql://p:p@127.0.0.1:54322/postgres');

    expect(result.ok).toBe(false);
    expect(!result.ok && result.reason).toMatch(/54329/);
  });

  it('recusa URL inválida', () => {
    const result = checkTarget({ env: 'local', confirmProduction: false }, 'não é url');

    expect(result.ok).toBe(false);
  });
});
