import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, it, expect } from 'vitest';

import { classifyTarget, findLastWorkflow, decide, evaluate } from './story-guard.mjs';

// Story 1.14 — Camada 2: o hook bloqueia escrita em stories e no sprint-status
// fora dos workflows BMAD. Os casos reproduzem o desvio real de 2026-11-15.
const ROOT = '/repo';
const STORY_NEW = `${ROOT}/_bmad-output/implementation-artifacts/1-12-login-google-em-staging-e-producao.md`;
const STORY_OLD = `${ROOT}/_bmad-output/implementation-artifacts/1-9-hotfix-cookie-sessao-https-no-proxy.md`;
const SPRINT = `${ROOT}/_bmad-output/implementation-artifacts/sprint-status.yaml`;
const EXISTING = new Set([STORY_OLD, SPRINT]);
const exists = (p: string) => EXISTING.has(p);
const ctx = { projectDir: ROOT, cwd: ROOT, exists };

function fixture(name: string): string[] {
  return readFileSync(join(__dirname, '__fixtures__', name), 'utf8').split('\n').filter(Boolean);
}

function run(toolName: string, toolInput: Record<string, unknown>, transcript: string) {
  return evaluate(
    { tool_name: toolName, tool_input: toolInput, cwd: ROOT, transcript_path: transcript },
    { projectDir: ROOT, exists, readTranscript: (name: string) => fixture(name) },
  );
}

describe('classifyTarget', () => {
  it('Write numa story que não existe é criação', () => {
    expect(classifyTarget('Write', { file_path: STORY_NEW }, ctx)).toMatchObject({ kind: 'story', action: 'create' });
  });

  it('Edit numa story existente é edição', () => {
    expect(classifyTarget('Edit', { file_path: STORY_OLD }, ctx)).toMatchObject({ kind: 'story', action: 'edit' });
  });

  it('reconhece stories com sufixo e subnível (3-4e, 2-5-2b)', () => {
    for (const name of ['3-4e-subcategorias.md', '2-5-2b-atualizacao-prototipos.md']) {
      const target = classifyTarget('Write', { file_path: `${ROOT}/_bmad-output/implementation-artifacts/${name}` }, ctx);
      expect(target.kind).toBe('story');
    }
  });

  it('sprint-status.yaml é protegido', () => {
    expect(classifyTarget('Edit', { file_path: SPRINT }, ctx).kind).toBe('sprint-status');
  });

  it('arquivos comuns não são protegidos', () => {
    expect(classifyTarget('Write', { file_path: `${ROOT}/src/proxy.ts` }, ctx).kind).toBe('other');
    expect(classifyTarget('Write', { file_path: `${ROOT}/_bmad-output/planning-artifacts/epics.md` }, ctx).kind).toBe('other');
  });

  it('caminho fora do projeto não é protegido', () => {
    expect(
      classifyTarget('Write', { file_path: '/outro/_bmad-output/implementation-artifacts/1-1-x.md' }, ctx).kind,
    ).toBe('other');
  });

  describe('Bash', () => {
    const bash = (command: string) => classifyTarget('Bash', { command }, ctx);

    it.each([
      `python3 - <<'EOF'\np='_bmad-output/implementation-artifacts/1-9-hotfix-cookie-sessao-https-no-proxy.md'\nEOF`,
      `sed -i 's/review/done/' _bmad-output/implementation-artifacts/sprint-status.yaml`,
      `echo x > _bmad-output/implementation-artifacts/1-9-hotfix-cookie-sessao-https-no-proxy.md`,
      `echo x >> _bmad-output/implementation-artifacts/sprint-status.yaml`,
      `echo x | tee -a _bmad-output/implementation-artifacts/sprint-status.yaml`,
      `cp /tmp/x.md _bmad-output/implementation-artifacts/1-9-hotfix-cookie-sessao-https-no-proxy.md`,
      `mv /tmp/x.md "_bmad-output/implementation-artifacts/1-9-hotfix-cookie-sessao-https-no-proxy.md"`,
      `rm _bmad-output/implementation-artifacts/1-9-hotfix-cookie-sessao-https-no-proxy.md`,
      `node -e "fs.writeFileSync('_bmad-output/implementation-artifacts/sprint-status.yaml','')"`,
      // Code review da 1.14: variações dos padrões documentados que passavam como leitura
      `echo x >| _bmad-output/implementation-artifacts/sprint-status.yaml`,
      `sed --in-place 's/a/b/' _bmad-output/implementation-artifacts/sprint-status.yaml`,
      `sed --in-place=.bak 's/a/b/' _bmad-output/implementation-artifacts/sprint-status.yaml`,
      `cd _bmad-output/implementation-artifacts && sed -i s/a/b/ 1-9-hotfix-cookie-sessao-https-no-proxy.md`,
      `sed -i s/a/b/ ~/caderninho/_bmad-output/implementation-artifacts/sprint-status.yaml`,
      `sed -i s/a/b/ "$CLAUDE_PROJECT_DIR"/_bmad-output/implementation-artifacts/sprint-status.yaml`,
      `sed -i s/a/b/ \${CLAUDE_PROJECT_DIR}/_bmad-output/implementation-artifacts/sprint-status.yaml`,
      // Code review da 1.14: git que sobrescreve, move ou apaga a story
      `git checkout origin/staging -- _bmad-output/implementation-artifacts/sprint-status.yaml`,
      `git restore _bmad-output/implementation-artifacts/1-9-hotfix-cookie-sessao-https-no-proxy.md`,
      `git restore --source=origin/staging -- _bmad-output/implementation-artifacts/sprint-status.yaml`,
      `git mv _bmad-output/implementation-artifacts/1-9-hotfix-cookie-sessao-https-no-proxy.md /tmp/x.md`,
      `git rm _bmad-output/implementation-artifacts/1-9-hotfix-cookie-sessao-https-no-proxy.md`,
    ])('escrita: %s', (command) => {
      expect(bash(command).action).not.toBe('read');
      expect(bash(command).kind).not.toBe('other');
    });

    it.each([
      `cat _bmad-output/implementation-artifacts/1-9-hotfix-cookie-sessao-https-no-proxy.md`,
      `grep -n Status _bmad-output/implementation-artifacts/sprint-status.yaml`,
      `sed -n 1,20p _bmad-output/implementation-artifacts/sprint-status.yaml 2>&1`,
      // Caso real desta sessão: leitura redirecionada para fora do projeto
      `git show origin/staging:_bmad-output/implementation-artifacts/sprint-status.yaml > /tmp/ss.yaml`,
      `git diff origin/staging -- _bmad-output/implementation-artifacts/1-9-hotfix-cookie-sessao-https-no-proxy.md`,
      `cp _bmad-output/implementation-artifacts/sprint-status.yaml /tmp/backup.yaml`,
      `git checkout staging && cat _bmad-output/implementation-artifacts/sprint-status.yaml`,
      `git log --oneline -- _bmad-output/implementation-artifacts/sprint-status.yaml | head -5`,
      `cd _bmad-output/implementation-artifacts && cat 1-9-hotfix-cookie-sessao-https-no-proxy.md`,
    ])('leitura: %s', (command) => {
      expect(bash(command).action).toBe('read');
    });

    it('comando sem caminho protegido não é protegido', () => {
      expect(bash('npm test > /tmp/out.txt').kind).toBe('other');
    });

    it('destino protegido inexistente é criação', () => {
      expect(bash(`echo x > _bmad-output/implementation-artifacts/1-12-login-google.md`)).toMatchObject({
        kind: 'story',
        action: 'create',
      });
    });

    it('resolve caminho relativo pelo cwd', () => {
      const target = classifyTarget(
        'Bash',
        { command: 'sed -i s/a/b/ implementation-artifacts/sprint-status.yaml' },
        { ...ctx, cwd: `${ROOT}/_bmad-output` },
      );
      expect(target).toMatchObject({ kind: 'sprint-status', action: 'edit' });
    });
  });
});

describe('findLastWorkflow', () => {
  it('comando /bmad-bmm-… digitado conta', () => {
    expect(findLastWorkflow(fixture('apos-correct-course.jsonl'))).toBe('correct-course');
  });

  it('ferramenta Skill conta', () => {
    expect(findLastWorkflow(fixture('skill-create-story.jsonl'))).toBe('create-story');
  });

  it('leitura do workflow.yaml SEM agente ativo não conta (caso real do review "no formato")', () => {
    expect(findLastWorkflow(fixture('cat-code-review-sem-agente.jsonl'))).toBe('correct-course');
  });

  it('leitura do workflow.yaml COM agente BMAD ativo conta (menu do agente)', () => {
    expect(findLastWorkflow(fixture('agente-sm-menu-create-story.jsonl'))).toBe('create-story');
  });

  // Achado na Task 6.2 (teste real): um Bash que só CITA o caminho do workflow
  // (ex.: heredoc de python criando fixtures) liberou a criação de story.
  it('Bash que só cita o caminho do workflow.yaml não conta, mesmo com agente ativo', () => {
    expect(findLastWorkflow(fixture('agente-citacao-em-bash.jsonl'))).toBe('dev-story');
  });

  it('leitura do workflow.yaml com chaves (wc -l …/{workflow.yaml,…}) conta com agente ativo', () => {
    expect(findLastWorkflow(fixture('agente-leitura-com-chaves.jsonl'))).toBe('correct-course');
  });

  // Code review da 1.14: o agente ficava "ativo" a sessão inteira. Um workflow
  // invocado direto encerra o contexto do agente; a leitura seguinte não conta.
  it('workflow invocado direto encerra o agente: leitura posterior do workflow.yaml não conta', () => {
    expect(findLastWorkflow(fixture('agente-depois-workflow-direto.jsonl'))).toBe('sprint-status');
  });

  it('agente invocado de novo volta a valer para a leitura do menu', () => {
    expect(findLastWorkflow(fixture('agente-reativado.jsonl'))).toBe('dev-story');
  });

  it('texto do assistente, tool_result e subagente não contam', () => {
    expect(findLastWorkflow(fixture('so-citacoes.jsonl'))).toBeNull();
  });

  it('sem workflow nenhum', () => {
    expect(findLastWorkflow(fixture('vazio.jsonl'))).toBeNull();
  });
});

describe('decide', () => {
  // classifyTarget entrega o caminho relativo à raiz — é ele que aparece na mensagem
  const story = (action: 'create' | 'edit') => ({
    kind: 'story' as const,
    action,
    path: '_bmad-output/implementation-artifacts/1-12-login-google-em-staging-e-producao.md',
  });

  it('criar story exige create-story', () => {
    expect(decide(story('create'), 'create-story').allow).toBe(true);
    expect(decide(story('create'), 'dev-story').allow).toBe(false);
  });

  it('editar story aceita create-story, dev-story e code-review', () => {
    for (const wf of ['create-story', 'dev-story', 'code-review']) expect(decide(story('edit'), wf).allow).toBe(true);
    expect(decide(story('edit'), 'correct-course').allow).toBe(false);
    expect(decide(story('edit'), null).allow).toBe(false);
  });

  it('sprint-status aceita qualquer workflow BMAD, mas não "nenhum"', () => {
    const target = { kind: 'sprint-status' as const, action: 'edit' as const, path: SPRINT };
    expect(decide(target, 'correct-course').allow).toBe(true);
    expect(decide(target, null).allow).toBe(false);
  });

  it('mensagem diz ação, arquivo, workflows permitidos e o último invocado', () => {
    const result = decide(story('create'), 'correct-course');
    expect(!result.allow && result.reason).toBe(
      'Bloqueado pelo processo BMAD: criar _bmad-output/implementation-artifacts/1-12-login-google-em-staging-e-producao.md exige o workflow create-story, mas o último invocado foi correct-course. Invoque o workflow BMAD correspondente ou pergunte ao usuário.',
    );
  });

  it('leitura e arquivos comuns sempre passam', () => {
    expect(decide({ kind: 'story', action: 'read', path: STORY_OLD }, null).allow).toBe(true);
    expect(decide({ kind: 'other', action: 'edit', path: '/repo/src/x.ts' }, null).allow).toBe(true);
  });
});

describe('evaluate — casos reais de 2026-11-15', () => {
  it('BLOQUEIA criar a 1.12 depois de um correct-course', () => {
    expect(run('Write', { file_path: STORY_NEW, content: '#' }, 'apos-correct-course.jsonl').allow).toBe(false);
  });

  it('BLOQUEIA editar a 1.9 depois de cat do code-review sem agente', () => {
    expect(run('Edit', { file_path: STORY_OLD }, 'cat-code-review-sem-agente.jsonl').allow).toBe(false);
  });

  it('BLOQUEIA editar story via python3 fora de workflow', () => {
    const cmd = `python3 - <<'EOF'\nopen('_bmad-output/implementation-artifacts/1-9-hotfix-cookie-sessao-https-no-proxy.md','w')\nEOF`;
    expect(run('Bash', { command: cmd }, 'apos-correct-course.jsonl').allow).toBe(false);
  });

  it('BLOQUEIA criar story depois de dev-story', () => {
    expect(run('Write', { file_path: STORY_NEW, content: '#' }, 'skill-dev-story.jsonl').allow).toBe(false);
  });

  it('PERMITE criar story depois de Skill create-story', () => {
    expect(run('Write', { file_path: STORY_NEW, content: '#' }, 'skill-create-story.jsonl').allow).toBe(true);
  });

  it('PERMITE criar story pelo menu do agente SM', () => {
    expect(run('Write', { file_path: STORY_NEW, content: '#' }, 'agente-sm-menu-create-story.jsonl').allow).toBe(true);
  });

  it('PERMITE editar story depois de code-review e sprint-status depois de correct-course', () => {
    expect(run('Edit', { file_path: STORY_OLD }, 'skill-code-review.jsonl').allow).toBe(true);
    expect(run('Edit', { file_path: SPRINT }, 'apos-correct-course.jsonl').allow).toBe(true);
  });

  it('PERMITE ler e redirecionar leitura para fora sem workflow', () => {
    const cmd = 'git show origin/staging:_bmad-output/implementation-artifacts/sprint-status.yaml > /tmp/ss.yaml';
    expect(run('Bash', { command: cmd }, 'vazio.jsonl').allow).toBe(true);
  });

  it('não lê o transcript quando o alvo não é protegido', () => {
    let reads = 0;
    const result = evaluate(
      { tool_name: 'Write', tool_input: { file_path: '/repo/src/a.ts' }, cwd: ROOT, transcript_path: 'x' },
      { projectDir: ROOT, exists, readTranscript: () => { reads++; return []; } },
    );
    expect(result.allow).toBe(true);
    expect(reads).toBe(0);
  });

  it('BLOQUEIA alvo protegido quando o transcript não pode ser lido (falha segura)', () => {
    const result = evaluate(
      { tool_name: 'Edit', tool_input: { file_path: STORY_OLD }, cwd: ROOT, transcript_path: '/nao/existe.jsonl' },
      { projectDir: ROOT, exists, readTranscript: () => { throw new Error('ENOENT'); } },
    );
    expect(result.allow).toBe(false);
    expect(!result.allow && result.reason).toMatch(/transcript/);
  });
});
