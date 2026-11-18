#!/usr/bin/env node
// Story 1.15 — hook PreToolUse do Claude Code: bancos remotos são do PO.
// Lê a entrada do hook no stdin. Sai 0 sem saída (deixa o fluxo normal seguir)
// ou 2 com o motivo no stderr (bloqueia a ferramenta). Não lê o transcript.
// A lógica está em scripts/bmad/remote-db-guard.mjs. Ver CLAUDE.md.

import { readFileSync } from 'node:fs';

import { evaluateRemote, invalidInputDecision } from '../../scripts/bmad/remote-db-guard.mjs';

function readStdin() {
  try {
    return readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

const raw = readStdin();

let decision;
try {
  const input = JSON.parse(raw);
  decision = input && typeof input === 'object' ? evaluateRemote(input) : invalidInputDecision(raw);
} catch {
  decision = invalidInputDecision(raw);
}

if (!decision.allow) {
  process.stderr.write(`${decision.reason}\n`);
  process.exit(2);
}
process.exit(0);
