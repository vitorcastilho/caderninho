import { describe, it, expect } from 'vitest';

import { classifyRemoteAccess, evaluateRemote, invalidInputDecision } from './remote-db-guard.mjs';

// Story 1.15 — Camada 2: o hook bloqueia comandos e leituras que alcançam os
// bancos remotos (staging e produção). Os casos reproduzem o desvio real de
// 2026-11-16 (migrate rodado pelo Claude em staging). URLs e refs são sintéticos.
const REAL_CASE =
  'CI=true DATABASE_URL=postgresql://postgres.ref:senha@aws-1-us-east-2.pooler.supabase.com:6543/postgres npx tsx scripts/migrate.ts --env staging';

const bash = (command: string) => classifyRemoteAccess('Bash', { command });

describe('classifyRemoteAccess — Bash bloqueado', () => {
  it.each([
    // caso real de 2026-11-16 e variações (AC 5)
    REAL_CASE,
    'npm run db:migrate -- --env production --confirm-production',
    'npx tsx scripts/migrate.ts --env=staging',
    'cd scripts && npx tsx migrate.ts --env staging',
    'cat .env.migrate.staging',
    'source .env.migrate.production && psql "$DATABASE_URL"',
    'psql "postgresql://postgres:x@db.ref.supabase.co:5432/postgres"',
    'npx supabase db push',
    // (a) executores, caminhos e aspas
    'CI=true npx tsx scripts/migrate.ts --env staging',
    './node_modules/.bin/tsx scripts/migrate.ts --env production',
    'tsx ./scripts/migrate.ts --env staging',
    'node --import tsx scripts/migrate.ts --env=production',
    'pnpm db:migrate --env staging',
    'yarn db:migrate --env=production',
    'bun run db:migrate -- --env staging',
    '"npx" tsx "./scripts/migrate.ts" "--env" "staging"',
    'env DATABASE_URL=x npx tsx scripts/migrate.ts --env staging',
    'timeout 30 npx tsx scripts/migrate.ts --env staging',
    'time npm run db:migrate -- --env production --confirm-production',
    'nohup npm run db:migrate -- --env staging',
    'bash -c "npx tsx scripts/migrate.ts --env staging"',
    'sh -c \'npm run db:migrate -- --env production\'',
    'echo ok; npx tsx scripts/migrate.ts --env production',
    'npm run db:migrate -- --env staging | tee migrate.log',
    'npm run lint || npm run db:migrate -- --env staging',
    'npm run lint\nnpm run db:migrate -- --env staging',
    // (b) arquivos de banco remoto e globs .env
    'cat .env*',
    'source .env.migrate.*',
    'head -1 .env.staging.local',
    'export $(cat .env.production.local)',
    'node scripts/x.mjs < .env.migrate.staging',
    'DOTENV_PATH=.env.migrate.production npm run x',
    'ls config/.env.migrate.staging',
    'cp .env.example ".env.migrate.staging"',
    "grep DATABASE_URL '.env.migrate.production'",
    'test -f .env.migrate.staging',
    'cat .env.migrate.?',
    'ls .env[.]*',
    // (c) hosts remotos do Supabase
    'psql "postgresql://postgres.ref:x@aws-0-sa-east-1.pooler.supabase.com:6543/postgres" -c "select 1"',
    'curl https://abcdefgh.supabase.co/rest/v1/',
    // (d) CLI supabase remoto
    'supabase link --project-ref abcdefgh',
    'supabase db pull',
    'supabase db dump -f dump.sql',
    'npx supabase db push',
    'bunx supabase db pull',
    'supabase migration list --linked',
    'supabase db push --db-url postgresql://x',
    'supabase db reset --db-url=postgresql://x',
    'supabase db reset --linked',
    // code review 1.15: subshell, substituição de comando e crases
    '(npx tsx scripts/migrate.ts --env staging)',
    'echo $(npx tsx scripts/migrate.ts --env staging)',
    'echo `npx tsx scripts/migrate.ts --env staging`',
    'echo "$(npm run db:migrate -- --env production)"',
    'x=$(npm run db:migrate -- --env=staging)',
    '(supabase db push)',
    'echo $(npx supabase link --project-ref abcdefgh)',
    'npx tsx $(pwd)/scripts/migrate.ts --env staging',
    // code review 1.15: CLI supabase com versão
    'npx supabase@latest db push',
    'npx supabase@2 link --project-ref abcdefgh',
    'bunx supabase@1.200.0 db pull',
    'pnpm dlx supabase@latest db dump -f x.sql',
    // code review 1.15: expansão de chaves
    'cat .env.migrate.{staging,production}',
    'cat .env.{migrate.staging,x}',
    // code review 1.15: redirecionamento colado ao nome
    'echo x >.env.migrate.staging',
    'echo x>>.env.migrate.production',
    'echo x &>.env.staging.local',
    'echo x >| .env.production.local',
    // code review 1.15 (2ª rodada): palavras-chave do shell e `&` simples
    'if true; then npx tsx scripts/migrate.ts --env staging; fi',
    'for e in x; do npx tsx scripts/migrate.ts --env staging; done',
    '{ npx tsx scripts/migrate.ts --env staging; }',
    '! npx tsx scripts/migrate.ts --env staging',
    'sleep 1 & npx tsx scripts/migrate.ts --env staging',
    'if npx tsx scripts/migrate.ts --env production; then echo ok; fi',
    'until npm run db:migrate -- --env staging; do sleep 1; done',
    'if false; then :; else npm run db:migrate -- --env production; fi',
    'if false; then :; elif npx tsx scripts/migrate.ts --env staging; then :; fi',
    'if true; then supabase db push; fi',
    // code review 1.15 (2ª rodada): --env com variável
    'for e in staging production; do npm run db:migrate -- --env $e; done',
    'E=staging; npx tsx scripts/migrate.ts --env $E',
    'npx tsx scripts/migrate.ts --env=$E',
    'npx tsx scripts/migrate.ts --env "${E}"',
    // code review 1.15 (2ª rodada): redirecionamento ou `&` colado ao valor do --env
    'npx tsx scripts/migrate.ts --env staging>out.log',
    'npx tsx scripts/migrate.ts --env staging&',
    'npm run db:migrate -- --env=production>>migrate.log 2>&1',
    'npx tsx scripts/migrate.ts --env staging<input.txt',
    // code review 1.15 (2ª rodada): nome de arquivo montado com aspas ou barra invertida
    'cat .env.migrate.sta"ging"',
    'cat ".env.migrate."staging',
    "cat '.env.migrate.'production",
    'cat .env.migrate.stag\\ing',
    'cat .env.stag"ing".local',
    'cat .e"nv"*',
    // code review 1.15 (2ª rodada): opção com valor antes do subcomando do supabase
    'supabase --workdir . db push',
    'npx -p supabase supabase db push',
    'supabase --workdir . link --project-ref abcdefgh',
    'supabase db --workdir . pull',
    // code review 1.15 (3ª rodada): busca recursiva sobre a raiz ou um diretório pai
    'grep -rn DATABASE_URL .',
    'grep -rn pooler .',
    'grep -R DATABASE_URL',
    'grep --recursive DATABASE_URL ./',
    'grep -r -e DATABASE_URL',
    'grep -rl DATABASE_URL ..',
    'grep -rn DATABASE_URL ../caderninho',
    'grep -rn DATABASE_URL /home/x/repo',
    'grep -rn DATABASE_URL ~',
    'grep -rn DATABASE_URL $PWD',
    'grep -d recurse DATABASE_URL .',
    'grep --directories=recurse DATABASE_URL .',
    'grep -rn DATABASE_URL src .',
    'grep -rn -A 3 DATABASE_URL .',
    'egrep -r DATABASE_URL .',
    'rgrep DATABASE_URL .',
    'git status && grep -rn DATABASE_URL .',
    'timeout 5 grep -rn DATABASE_URL .',
    'rg --no-ignore DATABASE_URL',
    'rg -uu DATABASE_URL',
    'rg -u DATABASE_URL .',
    'rg --hidden --no-ignore DATABASE_URL .',
    'rg --no-ignore-vcs -n pooler',
    'rg -n --unrestricted DATABASE_URL',
    // code review 1.15 (3ª rodada): migrate sem extensão ou com outra extensão
    'npx tsx scripts/migrate --env staging',
    'tsx scripts/migrate --env=production',
    'npx tsx scripts/migrate.mts --env staging',
    'node --import tsx ./scripts/migrate.js --env production',
    // code review 1.15 (3ª rodada): valor do --env montado com \ ou crase
    'npx tsx scripts/migrate.ts --env stag\\ing',
    'npx tsx scripts/migrate.ts --env=prod\\uction',
    'npx tsx scripts/migrate.ts --env `echo staging`',
    'npm run db:migrate -- --env=`cat env.txt`',
    // code review 1.15 (3ª rodada): nome do arquivo dentro de chaves
    'cat {.env.migrate.staging,README.md}',
    'cat {README.md,.env.migrate.production}',
    'cat {README.md,config/.env.staging.local}',
    // code review 1.15 (3ª rodada): glob que não começa por .env literal
    'cat .*staging',
    'cat .e*.staging',
    'cat .[e]nv.migrate.staging',
    'cat .??v.migrate.production',
    'cat config/.*production*',
    'cat ".env.migrate."*',
    'cat <.*staging',
    // code review 1.15 (3ª rodada): supabase com --project-ref/--project-id
    'supabase gen types typescript --project-id abcdefgh',
    'supabase gen types typescript --project-ref=abcdefgh',
    'npx supabase functions deploy --project-ref abcdefgh',
    // code review 1.15 (4ª rodada): glob positivo do rg passa por cima do .gitignore e dos ocultos
    "rg -g '*staging' DATABASE_URL",
    'rg --glob=*.production DATABASE_URL',
    "rg -g '*' DATABASE_URL",
    "rg -g '*.{staging,production}' DATABASE_URL",
    "rg -g '**/*staging' DATABASE_URL .",
    'rg -g*staging DATABASE_URL',
    "rg --iglob '*STAGING' DATABASE_URL",
    "rg --glob-case-insensitive -g '*PRODUCTION' DATABASE_URL",
    "rg -n -g '*.ts' -g '*.local' DATABASE_URL ..",
    "rg -g '/*staging' DATABASE_URL",
    "timeout 5 rg -g '*' pooler",
    // code review 1.15 (4ª rodada): git grep que lê arquivos ignorados
    'git grep --untracked --no-exclude-standard DATABASE_URL',
    'git grep --no-index DATABASE_URL',
    'git grep --no-index -n DATABASE_URL .',
    'git grep --untracked --no-exclude-standard -e DATABASE_URL -- .',
    'git --no-pager grep --no-index pooler',
    // code review 1.15 (4ª rodada): dotglob/GLOBIGNORE fazem globs alcançarem arquivos ocultos
    'shopt -s dotglob; cat *staging',
    'shopt -s dotglob && grep -rn DATABASE_URL *',
    'GLOBIGNORE=x; cat *staging',
    'GLOBIGNORE=. grep -rn DATABASE_URL *',
    'setopt globdots; cat *staging',
    // code review 1.15 (4ª rodada): expansão de chaves grande demais para conferir
    `echo ${'{a,b}'.repeat(25)}; cat .[e]nv.migrate.staging`,
    `echo ${'{a,b}'.repeat(25)}`,
  ])('bloqueia: %s', (command) => {
    expect(bash(command)).toMatchObject({ blocked: true });
  });
});

describe('classifyRemoteAccess — Bash permitido', () => {
  it.each([
    'npm run db:migrate',
    'npm run db:migrate -- --env local',
    'npx tsx scripts/migrate.ts --env local',
    'npm run db:reset:local',
    'npm run db:start',
    'npm run db:stop',
    'npm run db:status',
    'supabase start',
    'supabase stop',
    'supabase status',
    'supabase db reset',
    'npx supabase db reset',
    'supabase db push --local',
    'npx vitest run scripts/bmad',
    'npx vitest run scripts/lib/migrate-env.test.ts',
    // textos que só citam o migrate remoto sem executá-lo
    'grep -n "db:migrate -- --env staging" README.md',
    'git commit -m "docs: npm run db:migrate -- --env staging"',
    'gh pr create --base staging --body "rode npm run db:migrate -- --env production --confirm-production"',
    'echo npx tsx scripts/migrate.ts --env staging',
    // outros arquivos .env e textos parecidos
    'cat .env.local',
    'cat .env.example',
    'git check-ignore -v .env.migrate.x',
    'echo "ver docs do supabase.com"',
    'cat README.md',
    'ls -la',
    'git status',
    // subshell e versão do CLI em comandos locais
    'echo $(date)',
    '(cd src && ls)',
    'echo `git rev-parse HEAD`',
    'x=$(npm run db:migrate -- --env local)',
    'npx supabase@latest start',
    'npx supabase@latest db reset',
    'npx supabase@2 db push --local',
    // palavras-chave, `&` e variáveis em comandos locais (2ª rodada)
    'if true; then npm run db:migrate -- --env local; fi',
    'npm run lint & npm run test',
    'npm run build 2>&1 | tail -5',
    'echo x &>/dev/null',
    'npm run db:migrate -- --env local>out.log',
    'echo $E staging',
    'supabase --workdir . db push --local',
    'supabase --workdir . start',
    'npx -p supabase supabase db reset',
    'cat ".env.local"',
    // busca, migrate, --env e globs em comandos locais (3ª rodada)
    'grep -rn DATABASE_URL src',
    'grep -rn DATABASE_URL ./scripts docs/',
    'grep -n DATABASE_URL README.md',
    'grep -rn -A 3 DATABASE_URL scripts/lib',
    'grep -rn -e DATABASE_URL -e pooler src',
    'grep -rn --include=*.ts DATABASE_URL src',
    'git grep -n DATABASE_URL',
    'rg DATABASE_URL',
    'rg -n DATABASE_URL .',
    'rg -n --hidden DATABASE_URL .github',
    'rg --no-ignore DATABASE_URL src',
    'rg -t ts -r X DATABASE_URL',
    'npx tsx scripts/migrate --env local',
    'npx tsx scripts/migrate.ts --env loc\\al',
    'ls *',
    'rm -rf .next/*',
    'grep -n ".*" README.md',
    "sed -n 's/.*//p' README.md",
    'ls src/{client,server}',
    'cat {README.md,package.json}',
    'ls .github/*',
    'cat .gitignore',
    'supabase gen types typescript --local',
    // rg, git grep, shopt e chaves em comandos locais (4ª rodada)
    "rg -g '*.ts' DATABASE_URL",
    "rg -g '*staging' DATABASE_URL src",
    "rg -g '!*staging' DATABASE_URL",
    "rg -g '*.ts' -g '!*.test.ts' DATABASE_URL .",
    "rg --iglob '*.MD' DATABASE_URL",
    'git grep --untracked DATABASE_URL',
    'git grep --no-index --exclude-standard DATABASE_URL',
    'git grep --no-index DATABASE_URL src',
    'git log --grep staging',
    'shopt -s nullglob; ls *.ts',
    'echo GLOBIGNORE',
    `echo ${'{a,b}'.repeat(9)}`,
  ])('permite: %s', (command) => {
    expect(bash(command)).toEqual({ blocked: false });
  });
});

// Limites documentados no CLAUDE.md ("Limites das proteções"): a divisão de
// trechos não respeita aspas, e prefixos fora da lista de executores passam.
// Estes testes fixam o comportamento atual para que uma mudança seja consciente.
describe('classifyRemoteAccess — limites documentados', () => {
  it.each([
    'echo "a; npx tsx scripts/migrate.ts --env staging"',
    'git commit -m "docs: ajuste\nnpm run db:migrate -- --env production"',
  ])('falso positivo aceito (texto entre aspas tratado como trecho): %s', (command) => {
    expect(bash(command)).toMatchObject({ blocked: true });
  });

  it.each([
    'sudo npx tsx scripts/migrate.ts --env staging',
    'command npx tsx scripts/migrate.ts --env staging',
    'nice npm run db:migrate -- --env production',
    'exec npx tsx scripts/migrate.ts --env staging',
    'supabase migration list',
    'supabase inspect db bloat',
    // 3ª rodada: nome montado por variável e outras ferramentas que percorrem diretórios
    'F=.env.migrate; cat $F.staging',
    'cd .. && grep -rn DATABASE_URL caderninho',
    'cd / && grep -rn DATABASE_URL home/x/caderninho',
    'find . -type f -exec cat {} +',
  ])('não detectado (fora do AC; documentado): %s', (command) => {
    expect(bash(command)).toEqual({ blocked: false });
  });
});

describe('classifyRemoteAccess — motivos', () => {
  it('o caso real é bloqueado pelo migrate (a) e pelo host (c) separadamente', () => {
    expect(bash('CI=true npx tsx scripts/migrate.ts --env staging')).toMatchObject({ blocked: true, reason: expect.stringMatching(/migrate/) });
    expect(bash('psql "postgresql://postgres.ref:senha@aws-1-us-east-2.pooler.supabase.com:6543/postgres"')).toMatchObject({
      blocked: true,
      reason: expect.stringMatching(/host remoto do Supabase/),
    });
  });

  it('cita o arquivo e o subcomando do supabase no motivo', () => {
    expect(bash('cat .env.migrate.staging')).toMatchObject({ reason: expect.stringContaining('.env.migrate.staging') });
    expect(bash('npx supabase db push')).toMatchObject({ reason: expect.stringContaining('supabase') });
  });

  it('nunca repete o comando (que pode ter a URL com senha) no motivo', () => {
    const result = bash(REAL_CASE);
    expect(result.blocked).toBe(true);
    if (result.blocked) {
      expect(result.reason).not.toContain('senha');
      expect(result.reason).not.toContain('postgresql://');
    }
  });
});

describe('classifyRemoteAccess — ferramentas de arquivo', () => {
  it.each([
    ['Read', { file_path: '/repo/.env.migrate.production' }],
    ['Read', { file_path: '/repo/.env.migrate.staging' }],
    ['Read', { file_path: '/repo/.env.staging.local' }],
    ['Write', { file_path: '/repo/.env.production.local', content: 'x' }],
    ['Edit', { file_path: '/repo/.env.migrate.staging', old_string: 'a', new_string: 'b' }],
    ['MultiEdit', { file_path: '/repo/.env.migrate.production', edits: [] }],
    ['Grep', { pattern: 'DATABASE_URL', path: '/repo/.env.migrate.staging' }],
    ['Grep', { pattern: 'DATABASE_URL', glob: '.env*' }],
    ['Grep', { pattern: 'DATABASE_URL', glob: '.env.migrate.*' }],
    ['Grep', { pattern: 'DATABASE_URL', path: '/repo', glob: '**/.env*' }],
    // 3ª rodada: glob que não começa por .env literal
    ['Grep', { pattern: 'DATABASE_URL', glob: '.*staging' }],
    ['Grep', { pattern: 'DATABASE_URL', glob: '**/.[e]nv.migrate.*' }],
    ['Grep', { pattern: 'DATABASE_URL', glob: '{*.ts,.e*}' }],
    // 4ª rodada: o glob da ferramenta vai para o `rg --glob` (sem a regra do `.` inicial)
    ['Grep', { pattern: 'DATABASE_URL', glob: '*staging' }],
    ['Grep', { pattern: 'DATABASE_URL', glob: '*' }],
    ['Grep', { pattern: 'DATABASE_URL', glob: '**/*staging' }],
    ['Grep', { pattern: 'DATABASE_URL', glob: '*.{staging,production}' }],
    ['Grep', { pattern: 'DATABASE_URL', glob: '*.local' }],
    ['Grep', { pattern: 'DATABASE_URL', path: '/repo', glob: '*' }],
    ['Grep', { pattern: 'DATABASE_URL', glob: `${'{a,b}'.repeat(25)}` }],
  ])('bloqueia %s %j', (tool, input) => {
    expect(classifyRemoteAccess(tool, input)).toMatchObject({ blocked: true });
  });

  it('Grep com glob em subdiretório do cwd passa; na raiz ou fora dela, bloqueia', () => {
    const grep = { pattern: 'DATABASE_URL', glob: '*' };
    expect(classifyRemoteAccess('Grep', { ...grep, path: '/repo/src' }, '/repo')).toEqual({ blocked: false });
    expect(classifyRemoteAccess('Grep', { ...grep, path: 'src' }, '/repo')).toEqual({ blocked: false });
    expect(classifyRemoteAccess('Grep', { ...grep, path: '/repo' }, '/repo')).toMatchObject({ blocked: true });
    expect(classifyRemoteAccess('Grep', { ...grep, path: '/' }, '/repo')).toMatchObject({ blocked: true });
    expect(classifyRemoteAccess('Grep', grep, '/repo')).toMatchObject({ blocked: true });
    expect(
      evaluateRemote({ tool_name: 'Grep', cwd: '/repo', tool_input: { ...grep, path: '/repo/scripts' } }),
    ).toEqual({ allow: true });
  });

  it('expansão de chaves grande é decidida rápido (abaixo do timeout do hook)', () => {
    const start = performance.now();
    expect(bash(`echo ${'{a,b}'.repeat(40)}; cat .[e]nv.migrate.staging`)).toMatchObject({ blocked: true });
    expect(classifyRemoteAccess('Grep', { pattern: 'x', glob: '{a,b}'.repeat(40) })).toMatchObject({ blocked: true });
    expect(performance.now() - start).toBeLessThan(1000);
  });

  it.each([
    ['Read', { file_path: '/repo/.env.local' }],
    ['Read', { file_path: '/repo/.env.example' }],
    ['Read', { file_path: '/repo/README.md' }],
    ['Read', { file_path: '/repo/scripts/lib/migrate-env.ts' }],
    ['Write', { file_path: '/repo/src/a.ts', content: '.env.migrate.staging' }],
    ['Edit', { file_path: '/repo/.env.local', old_string: 'a', new_string: 'b' }],
    ['Grep', { pattern: 'env\\.migrate', path: '/repo/scripts' }],
    ['Grep', { pattern: 'DATABASE_URL' }],
    ['Grep', { pattern: 'x', glob: '*.ts' }],
    ['Grep', { pattern: 'x', glob: '**/*.{ts,tsx}' }],
    ['Grep', { pattern: 'x', glob: '.github/**/*.yml' }],
    ['Glob', { pattern: '.env*' }],
  ])('permite %s %j', (tool, input) => {
    expect(classifyRemoteAccess(tool, input)).toEqual({ blocked: false });
  });
});

describe('evaluateRemote', () => {
  it('bloqueia com a mensagem do PO', () => {
    const decision = evaluateRemote({ tool_name: 'Bash', tool_input: { command: REAL_CASE } });
    expect(decision.allow).toBe(false);
    if (!decision.allow) {
      expect(decision.reason).toMatch(/^Comandos em bancos remotos são do PO: .+\. Passe o comando para o PO rodar\.$/);
    }
  });

  it('permite comando comum e entrada sem ferramenta', () => {
    expect(evaluateRemote({ tool_name: 'Bash', tool_input: { command: 'npm run db:status' } })).toEqual({ allow: true });
    expect(evaluateRemote({})).toEqual({ allow: true });
    expect(evaluateRemote({ tool_name: 'Bash', tool_input: { command: 42 } })).toEqual({ allow: true });
  });
});

describe('invalidInputDecision (falha segura, AC 6)', () => {
  it.each([
    '{"command": "cat .env.migrate.staging"',
    '{"command": "npx tsx scripts/migrate.ts --env staging',
    'lixo --env=production',
    '{"file_path": "/repo/.env.production.local"',
  ])('bloqueia entrada inválida que cita algo protegido: %s', (raw) => {
    expect(invalidInputDecision(raw)).toMatchObject({ allow: false });
  });

  it.each(['', 'lixo', '{"command": "npm run db:migrate -- --env local"', '{"file_path": ".env.local"'])(
    'permite entrada inválida sem nada protegido: %s',
    (raw) => {
      expect(invalidInputDecision(raw)).toEqual({ allow: true });
    },
  );
});
