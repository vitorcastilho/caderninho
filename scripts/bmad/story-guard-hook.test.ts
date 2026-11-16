import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, it, expect, beforeAll } from 'vitest';

// Story 1.14 — integração do entrypoint `.claude/hooks/bmad-story-guard.mjs`:
// recebe o JSON do PreToolUse no stdin, sai 0 (passa) ou 2 (bloqueia, motivo no stderr).
const HOOK = join(process.cwd(), '.claude', 'hooks', 'bmad-story-guard.mjs');
const FIXTURES = join(__dirname, '__fixtures__');

let project: string;

beforeAll(() => {
  project = mkdtempSync(join(tmpdir(), 'bmad-guard-'));
  mkdirSync(join(project, '_bmad-output', 'implementation-artifacts'), { recursive: true });
  writeFileSync(join(project, '_bmad-output', 'implementation-artifacts', '1-9-x.md'), '# 1.9\n');
});

function runHook(input: unknown) {
  const result = spawnSync('node', [HOOK], {
    input: typeof input === 'string' ? input : JSON.stringify(input),
    env: { ...process.env, CLAUDE_PROJECT_DIR: project },
    encoding: 'utf8',
  });
  return { code: result.status, stderr: result.stderr, stdout: result.stdout };
}

function transcript(name: string) {
  const dest = join(project, name);
  copyFileSync(join(FIXTURES, name), dest);
  return dest;
}

describe('hook bmad-story-guard (entrypoint)', () => {
  it('bloqueia com exit 2 e motivo no stderr', () => {
    const r = runHook({
      hook_event_name: 'PreToolUse',
      tool_name: 'Write',
      tool_input: { file_path: join(project, '_bmad-output/implementation-artifacts/1-12-nova.md'), content: '#' },
      cwd: project,
      transcript_path: transcript('apos-correct-course.jsonl'),
    });
    expect(r.code).toBe(2);
    expect(r.stderr).toContain('Bloqueado pelo processo BMAD');
    expect(r.stderr).toContain('correct-course');
  });

  it('permite com exit 0 e sem saída', () => {
    const r = runHook({
      hook_event_name: 'PreToolUse',
      tool_name: 'Edit',
      tool_input: { file_path: join(project, '_bmad-output/implementation-artifacts/1-9-x.md') },
      cwd: project,
      transcript_path: transcript('skill-dev-story.jsonl'),
    });
    expect(r.code).toBe(0);
    expect(r.stdout).toBe('');
    expect(r.stderr).toBe('');
  });

  it('arquivo comum passa mesmo sem transcript', () => {
    const r = runHook({ tool_name: 'Write', tool_input: { file_path: join(project, 'src/a.ts') }, cwd: project });
    expect(r.code).toBe(0);
  });

  it('transcript ausente bloqueia alvo protegido', () => {
    const r = runHook({
      tool_name: 'Edit',
      tool_input: { file_path: join(project, '_bmad-output/implementation-artifacts/1-9-x.md') },
      cwd: project,
      transcript_path: join(project, 'nao-existe.jsonl'),
    });
    expect(r.code).toBe(2);
    expect(r.stderr).toMatch(/transcript/);
  });

  it('entrada inválida que cita arquivo protegido bloqueia; sem citar, passa', () => {
    expect(runHook('{"quebrado": _bmad-output/implementation-artifacts/1-9-x.md').code).toBe(2);
    expect(runHook('não é json').code).toBe(0);
  });
});
