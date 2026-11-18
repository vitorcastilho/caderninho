import { describe, it, expect } from 'vitest';

import { decideSkill, invalidSkillInputDecision } from './skill-guard.mjs';

// Story 1.15 — Camada 2: Skill BMAD chamada pelo Claude abre a confirmação
// nativa do Claude Code (ask). O caso real de 2026-11-16: o PO avisou que a
// story "voltou para review" e o Claude invocou bmad-bmm-code-review sozinho.
const skill = (name: unknown, permission_mode?: string) =>
  decideSkill({ tool_name: 'Skill', tool_input: { skill: name, args: '' }, permission_mode });

describe('decideSkill', () => {
  it('caso real: bmad-bmm-code-review em modo auto recebe ask (nunca passa direto)', () => {
    expect(skill('bmad-bmm-code-review', 'auto')).toEqual({
      decision: 'ask',
      reason:
        'Processo BMAD: o Claude quer invocar bmad-bmm-code-review por conta própria. ' +
        'Confirme só se você pediu esta etapa (CLAUDE.md, "Quem conduz").',
    });
  });

  it.each(['default', 'acceptEdits', 'auto', 'plan', undefined])('modo %s → ask', (mode) => {
    expect(skill('bmad-bmm-dev-story', mode)).toMatchObject({ decision: 'ask' });
  });

  it.each(['bypassPermissions', 'dontAsk'])('modo %s → deny', (mode) => {
    expect(skill('bmad-bmm-create-story', mode)).toEqual({
      decision: 'deny',
      reason: 'Bloqueado pelo processo BMAD: invocar bmad-bmm-create-story exige o sim do PO. Peça ao PO para digitar /bmad-bmm-create-story.',
    });
  });

  it.each([
    'bmad-help',
    'bmad-agent-bmm-dev',
    'bmad-party-mode',
    'meu-plugin:bmad-bmm-code-review',
    '/bmad-bmm-code-review',
    // code review 1.15 (2ª rodada): nome sem normalização
    ' bmad-help',
    'bmad-help ',
    'BMAD-help',
    'Meu-Plugin:BMAD-bmm-code-review',
    ' /Bmad-bmm-dev-story',
  ])(
    'qualquer skill BMAD (agentes, plugins) → ask: %s',
    (name) => {
      expect(skill(name, 'default')).toMatchObject({ decision: 'ask' });
    },
  );

  it.each(['simplify', 'vercel:deploy', 'code-review', 'my-bmad-tool', '', 42, undefined])(
    'skill que não é BMAD → none: %s',
    (name) => {
      expect(skill(name, 'auto')).toEqual({ decision: 'none' });
    },
  );

  it('modo desconhecido ainda pede confirmação', () => {
    expect(skill('bmad-help', 'algum-modo-novo')).toMatchObject({ decision: 'ask' });
  });

  it('entrada sem tool_input → none', () => {
    expect(decideSkill({})).toEqual({ decision: 'none' });
  });
});

describe('invalidSkillInputDecision (falha segura, AC 6)', () => {
  it('bloqueia entrada inválida que cita bmad-', () => {
    expect(invalidSkillInputDecision('{"skill": "bmad-bmm-code-review"')).toMatchObject({ decision: 'deny' });
  });

  it('permite entrada inválida sem bmad-', () => {
    expect(invalidSkillInputDecision('{"skill": "simplify"')).toEqual({ decision: 'none' });
    expect(invalidSkillInputDecision('')).toEqual({ decision: 'none' });
  });
});
