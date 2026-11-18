#!/usr/bin/env node
// Story 1.15 — hook PreToolUse da ferramenta Skill: etapa BMAD só com o sim do PO.
// Lê a entrada do hook no stdin. Skill BMAD: exit 0 com o JSON `ask` no stdout
// (abre a confirmação nativa do Claude Code) ou exit 2 com o motivo no stderr
// em bypassPermissions/dontAsk. Outras skills: exit 0 sem saída. Não lê o
// transcript. A lógica está em scripts/bmad/skill-guard.mjs. Ver CLAUDE.md.

import { readFileSync } from 'node:fs';

import { decideSkill, invalidSkillInputDecision } from '../../scripts/bmad/skill-guard.mjs';

function readStdin() {
  try {
    return readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

const raw = readStdin();

let result;
try {
  const input = JSON.parse(raw);
  result = input && typeof input === 'object' ? decideSkill(input) : invalidSkillInputDecision(raw);
} catch {
  result = invalidSkillInputDecision(raw);
}

if (result.decision === 'deny') {
  process.stderr.write(`${result.reason}\n`);
  process.exit(2);
}
if (result.decision === 'ask') {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason: result.reason,
      },
    }),
  );
}
process.exit(0);
