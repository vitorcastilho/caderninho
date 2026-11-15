import { describe, it, expect } from 'vitest';

import { checkStory, storyFilesFrom, checkChangedFiles } from './check-story-process';

// Story 1.14 — Camada 3: o CI confere que stories alteradas numa PR passaram
// pelos workflows (dev-story → Dev Agent Record; code-review → registro de review).
function story(status: string, devRecord: string, extra = '') {
  return `# Story 9.9: X\n\nStatus: ${status}\n\n## Tasks / Subtasks\n\n- [x] Task 1\n${extra}\n## Dev Agent Record\n\n${devRecord}`;
}

const FULL_RECORD = `### Agent Model Used\n\nClaude Opus 5.5\n\n### Debug Log References\n\n### Completion Notes List\n\n- Implementado X\n\n### File List\n\n- src/x.ts\n`;
const TEMPLATE_RECORD = `### Agent Model Used\n\n{{agent_model_name_version}}\n\n### Debug Log References\n\n### Completion Notes List\n\n### File List\n`;

describe('checkStory', () => {
  it('story em review com Dev Agent Record completo passa', () => {
    expect(checkStory(story('review', FULL_RECORD))).toEqual([]);
  });

  it('story em review com o Dev Agent Record do template falha nos três itens', () => {
    expect(checkStory(story('review', TEMPLATE_RECORD))).toEqual([
      'Agent Model Used vazio ou com o placeholder do template',
      'Completion Notes List sem itens',
      'File List sem itens',
    ]);
  });

  it('story em done sem registro de code review falha', () => {
    expect(checkStory(story('done', FULL_RECORD))).toEqual([
      'status done sem registro de code review (Review Follow-ups (AI), Senior Developer Review (AI) ou [AI-Review])',
    ]);
  });

  it.each([
    '### Review Follow-ups (AI)\n\n- [x] item\n',
    '## Senior Developer Review (AI) — 2026-11-15\n\nAprovado.\n',
    '- [x] [AI-Review][LOW] algo\n',
  ])('story em done com registro de review passa: %s', (review) => {
    expect(checkStory(story('done', FULL_RECORD, review))).toEqual([]);
  });

  it('story em done também exige o Dev Agent Record', () => {
    expect(checkStory(story('done', TEMPLATE_RECORD, '### Review Follow-ups (AI)\n'))).toHaveLength(3);
  });

  // Achado no dogfooding da Story 1.14: o AC 6 cita "`### Agent Model Used`" no texto,
  // e a busca por indexOf pegava a citação em vez do cabeçalho real.
  it('ignora títulos citados no meio do texto e lê só os cabeçalhos de linha', () => {
    const extra = 'AC: exige `### Agent Model Used` preenchido, `### Completion Notes List` e `### File List` com itens.\n';
    expect(checkStory(story('review', FULL_RECORD, extra))).toEqual([]);
  });

  it.each(['backlog', 'ready-for-dev', 'in-progress'])('status %s não é verificado', (status) => {
    expect(checkStory(story(status, TEMPLATE_RECORD))).toEqual([]);
  });
});

describe('storyFilesFrom', () => {
  it('filtra só arquivos de story da lista de alterados', () => {
    expect(
      storyFilesFrom([
        '_bmad-output/implementation-artifacts/1-14-protecoes-do-processo-bmad.md',
        '_bmad-output/implementation-artifacts/3-4e-subcategorias.md',
        '_bmad-output/implementation-artifacts/sprint-status.yaml',
        '_bmad-output/planning-artifacts/epics.md',
        'src/proxy.ts',
        '',
      ]),
    ).toEqual([
      '_bmad-output/implementation-artifacts/1-14-protecoes-do-processo-bmad.md',
      '_bmad-output/implementation-artifacts/3-4e-subcategorias.md',
    ]);
  });
});

describe('checkChangedFiles', () => {
  it('lista "<story>: <o que falta>" só para as stories alteradas com problema', () => {
    const files: Record<string, string> = {
      '_bmad-output/implementation-artifacts/1-1-ok.md': story('review', FULL_RECORD),
      '_bmad-output/implementation-artifacts/1-2-ruim.md': story('done', FULL_RECORD),
    };
    expect(checkChangedFiles(Object.keys(files), (p) => files[p])).toEqual([
      '_bmad-output/implementation-artifacts/1-2-ruim.md: status done sem registro de code review (Review Follow-ups (AI), Senior Developer Review (AI) ou [AI-Review])',
    ]);
  });
});
