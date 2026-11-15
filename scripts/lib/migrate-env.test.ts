import { describe, it, expect } from 'vitest';

import { parseMigrateArgs, envFileFor, describeTarget, checkTarget } from './migrate-env';

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
});

describe('checkTarget', () => {
  const STAGING_6543 = 'postgresql://u:p@aws-1-us-east-1.pooler.supabase.com:6543/postgres';
  const STAGING_5432 = 'postgresql://u:p@aws-1-us-east-1.pooler.supabase.com:5432/postgres';

  it('falha sem DATABASE_URL e diz qual arquivo conferir', () => {
    expect(checkTarget({ env: 'staging', confirmProduction: false }, undefined)).toEqual({
      ok: false,
      reason: 'DATABASE_URL não definido em .env.staging.local',
    });
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

  it('no local aceita qualquer porta (pooler 54329 ou Postgres direto)', () => {
    expect(
      checkTarget({ env: 'local', confirmProduction: false }, 'postgresql://p:p@127.0.0.1:54329/postgres'),
    ).toEqual({ ok: true });
  });

  it('recusa URL inválida', () => {
    const result = checkTarget({ env: 'local', confirmProduction: false }, 'não é url');

    expect(result.ok).toBe(false);
  });
});
