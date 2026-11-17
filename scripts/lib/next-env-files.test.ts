import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { envFileFor } from './migrate-env';

// Story 1.13, Task 9.4 (correct course 2026-11-17): os arquivos da migration
// remota não podem ser carregados pelo Next. Com `.env.production.local`, todo
// `next build`/`next start` local usava o banco e os segredos de produção.
//
// O `loadEnvConfig` roda num processo filho: no vitest `NODE_ENV=test`, e nesse
// modo o Next nem tenta ler `.env.production*` (o teste passaria sem testar
// nada); além disso, o resultado fica em cache e reescreve o `process.env`.
// O `@next/env` vem pelo `next` instalado (não é dependência direta).
const nextRequire = createRequire(createRequire(import.meta.url).resolve('next/package.json'));
const NEXT_ENV_MODULE = nextRequire.resolve('@next/env');

const LOAD_SCRIPT = `
const { loadEnvConfig } = require(process.argv[1]);
const { loadedEnvFiles } = loadEnvConfig(process.cwd(), process.argv[2] === 'dev', { info() {}, error() {} });
process.stdout.write(JSON.stringify(loadedEnvFiles.map((f) => f.path)));
`;

/** Arquivos que o Next carrega em `cwd` (modo produção = `next build`/`next start`; dev = `next dev`). */
function filesLoadedByNext(cwd: string, mode: 'production' | 'dev'): string[] {
  const out = execFileSync(process.execPath, ['-e', LOAD_SCRIPT, NEXT_ENV_MODULE, mode], {
    cwd,
    env: { NODE_ENV: mode === 'dev' ? 'development' : 'production' },
    encoding: 'utf8',
  });
  return JSON.parse(out) as string[];
}

describe('arquivos .env carregados pelo Next', () => {
  let dir: string;
  const MIGRATE_FILES = [envFileFor('staging'), envFileFor('production')];

  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), 'next-env-files-'));
    for (const file of [...MIGRATE_FILES, '.env.local', '.env.production.local']) {
      writeFileSync(join(dir, file), 'DATABASE_URL=postgresql://u:p@exemplo.invalid:6543/postgres\n');
    }
  });

  afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('controle positivo: em modo produção o Next carrega o .env.production.local (por isso o nome antigo era perigoso)', () => {
    expect(filesLoadedByNext(dir, 'production')).toEqual(['.env.production.local', '.env.local']);
  });

  it('em modo produção (next build/start) o Next não carrega os arquivos de migration remota', () => {
    const loaded = filesLoadedByNext(dir, 'production');

    for (const file of MIGRATE_FILES) expect(loaded).not.toContain(file);
  });

  it('em modo desenvolvimento (next dev) o Next também não carrega os arquivos de migration remota', () => {
    const loaded = filesLoadedByNext(dir, 'dev');

    expect(loaded).toContain('.env.local');
    for (const file of MIGRATE_FILES) expect(loaded).not.toContain(file);
  });
});
