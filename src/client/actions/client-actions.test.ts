import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, it, expect } from 'vitest';

// Code review 1.11 — componentes do navegador chamam server actions pelos
// wrappers de `@/client/actions`, que devolvem um Result de erro em vez de
// rejeitar a promise (429, rede). Este teste impede regressão.
const SRC = join(process.cwd(), 'src');
const SERVER_ACTIONS = join(SRC, 'server', 'actions');
const CLIENT_ACTIONS = join(SRC, 'client', 'actions');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path);
    return /\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

function exportedActions(file: string): string[] {
  const source = readFileSync(file, 'utf8');
  return [...source.matchAll(/export\s+(?:async\s+function|const)\s+(\w+)/g)].map((m) => m[1]);
}

describe('wrappers de server actions para o cliente', () => {
  it("nenhum componente 'use client' importa direto de @/server/actions", () => {
    const offenders = walk(SRC).filter((file) => {
      const source = readFileSync(file, 'utf8');
      return /^['"]use client['"]/m.test(source) && source.includes('@/server/actions/');
    });

    expect(offenders.map((f) => f.replace(`${SRC}/`, ''))).toEqual([]);
  });

  const serverFiles = readdirSync(SERVER_ACTIONS).filter((f) => /\.actions\.ts$/.test(f));

  it.each(serverFiles)('%s tem wrapper em @/client/actions com todas as actions', (file) => {
    const clientFile = join(CLIENT_ACTIONS, file);
    const serverExports = exportedActions(join(SERVER_ACTIONS, file));
    const clientSource = readFileSync(clientFile, 'utf8');

    for (const name of serverExports) {
      expect(clientSource).toMatch(new RegExp(`export const ${name} = withActionFallback\\(`));
    }
  });
});
