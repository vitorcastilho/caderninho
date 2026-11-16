// Story 1.14 — Camada 3 das proteções do processo BMAD (job de CI `bmad-process`).
//
// Confere as stories alteradas numa PR:
// - `review` (ou `done`): Dev Agent Record preenchido pelo dev-story
// - `done`: registro de code review
// Uso: git diff --name-only --diff-filter=AMR origin/<base>...HEAD | npx tsx scripts/bmad/check-story-process.ts
import { readFileSync } from 'node:fs';

const STORY_RE = /^_bmad-output\/implementation-artifacts\/\d+-\d+[a-z]?(?:-\d+[a-z]?)?-[^/]+\.md$/;
// Registro de review só conta como cabeçalho ou item de lista no início da linha:
// a mesma expressão citada no texto (ex.: o AC 6 da 1.14) não conta.
const REVIEW_RECORD_RE =
  /^#{2,4} +(?:Review Follow-ups \(AI\)|Senior Developer Review \(AI\))|^\s*[-*] +(?:\[[ xX]\] +)?\[AI-Review\]/m;

/**
 * Conteúdo de uma seção `### Título` até o próximo cabeçalho. Só casa o
 * cabeçalho no início da linha — o título citado no texto (ex.: num AC) não conta.
 */
function section(content: string, title: string): string {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const heading = new RegExp(`^### ${escaped}[ \\t]*$`, 'm').exec(content);
  if (!heading) return '';
  const rest = content.slice(heading.index + heading[0].length);
  const next = rest.search(/\n#{2,3} /);
  return next === -1 ? rest : rest.slice(0, next);
}

function hasListItem(text: string): boolean {
  return /^\s*[-*] \S/m.test(text);
}

export function checkStory(content: string): string[] {
  const status = content.match(/^Status:\s*(\S+)/m)?.[1] ?? '';
  if (status !== 'review' && status !== 'done') return [];

  const problems: string[] = [];
  const model = section(content, 'Agent Model Used').trim();
  if (!model || model.includes('{{')) problems.push('Agent Model Used vazio ou com o placeholder do template');
  if (!hasListItem(section(content, 'Completion Notes List'))) problems.push('Completion Notes List sem itens');
  if (!hasListItem(section(content, 'File List'))) problems.push('File List sem itens');

  if (status === 'done' && !REVIEW_RECORD_RE.test(content)) {
    problems.push(
      'status done sem registro de code review (Review Follow-ups (AI), Senior Developer Review (AI) ou [AI-Review])',
    );
  }
  return problems;
}

export function storyFilesFrom(changed: readonly string[]): string[] {
  return changed.map((f) => f.trim()).filter((f) => STORY_RE.test(f));
}

export function checkChangedFiles(changed: readonly string[], read: (path: string) => string): string[] {
  return storyFilesFrom(changed).flatMap((file) => checkStory(read(file)).map((problem) => `${file}: ${problem}`));
}

// CLI: lista de arquivos alterados no stdin (uma por linha).
if (process.argv[1]?.endsWith('check-story-process.ts')) {
  const changed = readFileSync(0, 'utf8').split('\n');
  const stories = storyFilesFrom(changed);
  const problems = checkChangedFiles(changed, (p) => readFileSync(p, 'utf8'));

  console.log(`Stories alteradas nesta PR: ${stories.length}`);
  for (const file of stories) console.log(`  - ${file}`);

  if (problems.length > 0) {
    console.error('\nStories fora do processo BMAD (create-story → dev-story → code-review):');
    for (const problem of problems) console.error(`  ✗ ${problem}`);
    process.exit(1);
  }
  console.log('Processo BMAD ok.');
}
