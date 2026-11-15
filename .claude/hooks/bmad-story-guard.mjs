#!/usr/bin/env node
// Story 1.14 — hook PreToolUse do Claude Code (Camada 2 das proteções BMAD).
// Lê a entrada do hook no stdin. Sai 0 sem saída (deixa o fluxo normal seguir)
// ou 2 com o motivo no stderr (bloqueia a ferramenta). A lógica está em
// scripts/bmad/story-guard.mjs. Ver CLAUDE.md.

import { existsSync, readFileSync } from 'node:fs';

import { evaluate } from '../../scripts/bmad/story-guard.mjs';

function readStdin() {
  try {
    return readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function block(reason) {
  process.stderr.write(`${reason}\n`);
  process.exit(2);
}

const raw = readStdin();

let input;
try {
  input = JSON.parse(raw);
} catch {
  // Entrada inválida: só bloqueia se ela citar um arquivo protegido (falha segura).
  if (raw.includes('implementation-artifacts')) {
    block('Bloqueado pelo processo BMAD: entrada do hook inválida envolvendo arquivo de story ou sprint-status. Pergunte ao usuário.');
  }
  process.exit(0);
}

const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();

const decision = evaluate(input, {
  projectDir,
  exists: (p) => existsSync(p),
  readTranscript: (p) => {
    if (!p) throw new Error('transcript_path ausente');
    return readFileSync(p, 'utf8').split('\n');
  },
});

if (!decision.allow) block(decision.reason);
process.exit(0);
