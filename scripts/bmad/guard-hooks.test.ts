import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, it, expect } from 'vitest';

// Story 1.15 — integração dos entrypoints `.claude/hooks/remote-db-guard.mjs` e
// `.claude/hooks/bmad-skill-guard.mjs`: recebem o JSON do PreToolUse no stdin.
const HOOKS = join(process.cwd(), '.claude', 'hooks');
const REAL_CASE =
  'CI=true DATABASE_URL=postgresql://postgres.ref:senha@aws-1-us-east-2.pooler.supabase.com:6543/postgres npx tsx scripts/migrate.ts --env staging';

function runHook(file: string, input: unknown) {
  const result = spawnSync('node', [join(HOOKS, file)], {
    input: typeof input === 'string' ? input : JSON.stringify(input),
    encoding: 'utf8',
  });
  return { code: result.status, stderr: result.stderr, stdout: result.stdout };
}

describe('hook remote-db-guard (entrypoint)', () => {
  const run = (input: unknown) => runHook('remote-db-guard.mjs', input);

  it('bloqueia o caso real do migrate com exit 2 e motivo no stderr, sem repetir a URL', () => {
    const r = run({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: REAL_CASE }, permission_mode: 'auto' });
    expect(r.code).toBe(2);
    expect(r.stderr).toContain('Comandos em bancos remotos são do PO');
    expect(r.stderr).toContain('Passe o comando para o PO rodar.');
    expect(r.stderr).not.toContain('senha');
    expect(r.stdout).toBe('');
  });

  it('bloqueia Read do arquivo de produção', () => {
    const r = run({ tool_name: 'Read', tool_input: { file_path: '/repo/.env.migrate.production' } });
    expect(r.code).toBe(2);
  });

  it('comando comum passa com exit 0 e sem saída', () => {
    const r = run({ tool_name: 'Bash', tool_input: { command: 'npm run db:status' } });
    expect(r).toEqual({ code: 0, stderr: '', stdout: '' });
  });

  it('entrada inválida: bloqueia se citar algo protegido; senão passa (AC 6)', () => {
    expect(run('{"command": "cat .env.migrate.staging"').code).toBe(2);
    expect(run('{"command": "npx tsx scripts/migrate.ts --env production').code).toBe(2);
    expect(run('{"command": "npm run lint"').code).toBe(0);
    expect(run('').code).toBe(0);
  });
});

describe('hook bmad-skill-guard (entrypoint)', () => {
  const run = (input: unknown) => runHook('bmad-skill-guard.mjs', input);

  it('Skill BMAD em modo auto: exit 0 com o JSON ask no stdout', () => {
    const r = run({ hook_event_name: 'PreToolUse', tool_name: 'Skill', tool_input: { skill: 'bmad-bmm-code-review', args: '' }, permission_mode: 'auto' });
    expect(r.code).toBe(0);
    expect(r.stderr).toBe('');
    expect(JSON.parse(r.stdout)).toEqual({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason:
          'Processo BMAD: o Claude quer invocar bmad-bmm-code-review por conta própria. Confirme só se você pediu esta etapa (CLAUDE.md, "Quem conduz").',
      },
    });
  });

  it('Skill BMAD em bypassPermissions: exit 2 com o motivo no stderr', () => {
    const r = run({ tool_name: 'Skill', tool_input: { skill: 'bmad-help' }, permission_mode: 'bypassPermissions' });
    expect(r.code).toBe(2);
    expect(r.stderr).toContain('Peça ao PO para digitar /bmad-help.');
    expect(r.stdout).toBe('');
  });

  it('Skill que não é BMAD passa com exit 0 e sem saída', () => {
    const r = run({ tool_name: 'Skill', tool_input: { skill: 'simplify' }, permission_mode: 'default' });
    expect(r).toEqual({ code: 0, stderr: '', stdout: '' });
  });

  it('entrada inválida: bloqueia se citar bmad-; senão passa (AC 6)', () => {
    expect(run('{"skill": "bmad-bmm-code-review"').code).toBe(2);
    expect(run('{"skill": "simplify"').code).toBe(0);
  });
});

describe('.claude/settings.json', () => {
  const settings = JSON.parse(readFileSync(join(process.cwd(), '.claude', 'settings.json'), 'utf8'));
  const entries: Array<{ matcher: string; hooks: Array<{ command: string; args: string[]; timeout: number }> }> =
    settings.hooks.PreToolUse;
  const find = (file: string) => entries.find((e) => e.hooks.some((h) => h.args.some((a) => a.endsWith(file))));

  it('mantém o hook da 1.14 e registra os dois novos com node e timeout explícito', () => {
    expect(find('bmad-story-guard.mjs')?.matcher).toBe('Write|Edit|MultiEdit|Bash');
    expect(find('remote-db-guard.mjs')?.matcher).toBe('Bash|Read|Grep|Write|Edit|MultiEdit');
    expect(find('bmad-skill-guard.mjs')?.matcher).toBe('Skill');
    for (const entry of entries) {
      for (const hook of entry.hooks) {
        expect(hook.command).toBe('node');
        expect(hook.timeout).toBeGreaterThan(0);
      }
    }
  });
});
