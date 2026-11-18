// Story 1.15 — Camada 2: o Claude não invoca etapa BMAD por conta própria.
//
// O comando `/bmad-…` digitado pelo PO não passa por PreToolUse (docs de hooks:
// "typing `/skillname` directly bypasses PreToolUse"). Toda chamada da
// ferramenta Skill vista aqui é, portanto, iniciativa do Claude: para skills
// BMAD, o hook pede a confirmação nativa do Claude Code (`ask`). Nos modos em
// que a confirmação pode não aparecer, bloqueia. Sem leitura de transcript.
// Ver CLAUDE.md, "Quem conduz". A leitura do stdin fica em
// `.claude/hooks/bmad-skill-guard.mjs`.

/** @typedef {{ decision: 'none' } | { decision: 'ask', reason: string } | { decision: 'deny', reason: string }} SkillDecision */

// Modos em que o `ask` pode não abrir a confirmação (a doc não descreve).
const NO_PROMPT_MODES = new Set(['bypassPermissions', 'dontAsk']);

/**
 * @param {unknown} value
 * @returns {string | null} nome normalizado (sem espaços, em minúsculas, sem `/` inicial) se for skill BMAD,
 *   aceitando prefixo de plugin `<nome>:`; senão `null`
 */
function bmadSkillName(value) {
  if (typeof value !== 'string') return null;
  const name = value.trim().toLowerCase().replace(/^\//, '');
  const bare = name.slice(name.lastIndexOf(':') + 1);
  return bare.startsWith('bmad-') ? name : null;
}

/** @param {string} skill nome normalizado @returns {SkillDecision} */
const deny = (skill) => ({
  decision: 'deny',
  reason: `Bloqueado pelo processo BMAD: invocar ${skill} exige o sim do PO. Peça ao PO para digitar /${skill}.`,
});

/**
 * @param {{ tool_name?: unknown, tool_input?: unknown, permission_mode?: unknown }} input entrada do hook PreToolUse da Skill
 * @returns {SkillDecision}
 */
export function decideSkill(input) {
  const toolInput = input.tool_input && typeof input.tool_input === 'object' ? /** @type {Record<string, unknown>} */ (input.tool_input) : {};
  // Mensagens com o nome normalizado (`' BMAD-help'` → `bmad-help`; code review 1.15).
  const name = bmadSkillName(toolInput.skill);
  if (!name) return { decision: 'none' };
  if (typeof input.permission_mode === 'string' && NO_PROMPT_MODES.has(input.permission_mode)) return deny(name);
  return {
    decision: 'ask',
    reason:
      `Processo BMAD: o Claude quer invocar ${name} por conta própria. ` +
      'Confirme só se você pediu esta etapa (CLAUDE.md, "Quem conduz").',
  };
}

/**
 * Entrada que não é JSON válido: bloqueia só se citar `bmad-` (falha segura, AC 6).
 * @param {string} raw
 * @returns {SkillDecision}
 */
export function invalidSkillInputDecision(raw) {
  if (raw.includes('bmad-')) {
    return { decision: 'deny', reason: 'Bloqueado pelo processo BMAD: entrada do hook inválida citando uma skill BMAD. Peça ao PO para digitar o comando.' };
  }
  return { decision: 'none' };
}
