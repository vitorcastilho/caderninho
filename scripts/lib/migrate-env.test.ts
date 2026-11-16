import { describe, it, expect } from 'vitest';

import { parseMigrateArgs, envFileFor, describeTarget, checkTarget, resolveDatabaseUrl } from './migrate-env';

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
  it('descreve host e porta sem expor usuário nem senha', () => {
    const text = describeTarget(
      'staging',
      'postgresql://postgres.abc:SuperSecreta@aws-1-us-east-1.pooler.supabase.com:6543/postgres',
    );

    expect(text).toBe('staging → aws-1-us-east-1.pooler.supabase.com:6543');
    expect(text).not.toContain('SuperSecreta');
    expect(text).not.toContain('postgres.abc');
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

describe('checkTarget', () => {
  const STAGING_6543 = 'postgresql://u:p@aws-1-us-east-1.pooler.supabase.com:6543/postgres';
  const STAGING_5432 = 'postgresql://u:p@aws-1-us-east-1.pooler.supabase.com:5432/postgres';

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
    const result = checkTarget({ env: 'production', confirmProduction: false }, STAGING_6543);

    expect(result.ok).toBe(false);
    expect(!result.ok && result.reason).toMatch(/--confirm-production/);
  });

  it('aceita produção na 6543 com --confirm-production', () => {
    expect(checkTarget({ env: 'production', confirmProduction: true }, STAGING_6543)).toEqual({ ok: true });
  });

  it('no local aceita o pooler em modo transação (54329)', () => {
    expect(
      checkTarget({ env: 'local', confirmProduction: false }, 'postgresql://p:p@127.0.0.1:54329/postgres'),
    ).toEqual({ ok: true });
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
