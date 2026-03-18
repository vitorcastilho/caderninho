# Story 1.6: Auditoria e Seguranca

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a system,
I want audit logging and security protections in place,
So that every action is traceable and the application is protected against common attacks.

## Acceptance Criteria

1. Quando qualquer mutacao de dados ocorre, um registro imutavel e criado na tabela `audit_logs` com: quem fez (userId), quando (timestamp), o que foi alterado (entityType + entityId + action), valor anterior (oldValue) e valor novo (newValue) (FR50)
2. A tabela `audit_logs` so aceita INSERT — nunca UPDATE ou DELETE. Imutabilidade garantida por RLS (pgPolicy INSERT-only) + trigger PostgreSQL que bloqueia UPDATE/DELETE
3. Rate limiting esta ativo no middleware/proxy do Next.js com mapa em memoria — protege rotas de auth (login, registro) e Server Actions contra abuso
4. Headers de seguranca estao configurados no `next.config.ts`: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy (NFR-S4)
5. Protecao contra CSRF, XSS e SQL injection esta ativa — Drizzle parametriza queries, Zod sanitiza inputs, CSP restringe scripts (NFR-S4)
6. Middleware de autorizacao (`withAuth`) verifica sessao valida antes de executar qualquer Server Action — toda acao protegida retorna erro se nao autenticado
7. Servico de auditoria (`auditService`) implementado com funcao utilitaria que registra acoes no `audit_logs` — pronto para ser usado por todos os use cases de mutacao futuros

## Tasks / Subtasks

- [x] Task 1: Implementar servico de auditoria e schema audit_logs (AC: #1, #2, #7)
  - [x] 1.1 Atualizar schema Drizzle `src/server/infrastructure/database/schema/audit-logs.ts`:
    - Manter colunas existentes (id, userId, organizationId, action, entityType, entityId, oldValue, newValue, ipAddress, userAgent, createdAt)
    - Adicionar `pgPolicy` com `for: 'insert'` e `withCheck: sql\`true\``
    - Remover policies existentes que nao sao INSERT-only (se houver)
  - [x] 1.2 Criar migration SQL customizada para imutabilidade:
    - `ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY`
    - Criar funcao `prevent_audit_log_modification()` que levanta excecao em UPDATE/DELETE
    - Criar trigger `no_audit_log_mutation` BEFORE UPDATE OR DELETE
  - [x] 1.3 Criar schema Zod de auditoria em `src/shared/schemas/audit.schema.ts`:
    - Schema `auditLogSchema` com: action (enum de acoes), entityType (string), entityId (string), oldValue (optional jsonb), newValue (optional jsonb)
    - Enum `AuditAction` com valores: `CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `LOGOUT`, `LINK_ACCOUNT`
  - [x] 1.4 Criar servico de auditoria em `src/server/infrastructure/audit/audit.service.ts`:
    - Funcao `logAudit(params: { userId, organizationId, action, entityType, entityId, oldValue?, newValue?, ipAddress?, userAgent? })`
    - Gera `id` via `crypto.randomUUID()`
    - Insere no banco via Drizzle — usa `db.insert(auditLogs).values(...)`
    - NUNCA lanca excecao — se falhar, loga erro e continua (auditoria nao pode bloquear operacao principal)
    - Sem try/catch no caller — o servico encapsula o tratamento de erro internamente
  - [x] 1.5 Escrever testes TDD para audit.service:
    - `src/server/infrastructure/audit/audit.service.test.ts`
    - Testa inserção com todos os campos
    - Testa inserção com campos opcionais (sem oldValue/newValue)
    - Testa que falha no banco NAO propaga excecao (loga warning)
    - Testa que `logAudit` chama `db.insert` com valores corretos
    - Mock do Drizzle client

- [x] Task 2: Implementar rate limiting no middleware (AC: #3)
  - [x] 2.1 Criar modulo de rate limiting em `src/server/infrastructure/security/rate-limiter.ts`:
    - Implementar sliding window com `Map<string, { count, resetAt }>`
    - Funcao `rateLimit(key: string, limit: number, windowMs: number): { success, remaining, retryAfterMs }`
    - Cleanup automatico de entradas expiradas via `setInterval` (60s)
    - Configuracoes padrao: auth endpoints 10 req/60s, Server Actions 30 req/60s
  - [x] 2.2 Integrar rate limiting no middleware (`src/middleware.ts`):
    - Antes da verificacao de sessao, aplicar rate limiting baseado em IP
    - Para rotas `/api/auth/*`: limite mais restrito (10 req/60s)
    - Para todas as outras rotas: limite padrao (30 req/60s)
    - Se rate limit excedido: retornar HTTP 429 com header `Retry-After`
    - Extrair IP de `x-forwarded-for` header (Vercel/proxy) ou `x-real-ip`
  - [x] 2.3 Escrever testes TDD para rate-limiter:
    - `src/server/infrastructure/security/rate-limiter.test.ts`
    - Testa que requests dentro do limite passam
    - Testa que request alem do limite retorna `success: false`
    - Testa que `remaining` decrementa corretamente
    - Testa que janela reseta apos `windowMs`
    - Testa que chaves diferentes nao interferem entre si
    - Testa cleanup de entradas expiradas

- [x] Task 3: Atualizar headers de seguranca (AC: #4, #5)
  - [x] 3.1 Atualizar `next.config.ts` para adicionar headers faltantes:
    - Adicionar `Permissions-Policy: camera=(), microphone=(), geolocation=()`
    - Verificar CSP existente e adicionar se faltando: `base-uri 'self'`, `form-action 'self'`, `object-src 'none'`
    - Manter `'unsafe-eval'` apenas em desenvolvimento (ja existe)
  - [x] 3.2 Verificar que protecoes OWASP estao ativas:
    - SQL injection: Drizzle parametriza queries automaticamente (ja ativo)
    - XSS: CSP restringe execucao de scripts (verificado — CSP ativo com script-src restritivo)
    - CSRF: Server Actions do Next.js usam token automatico (verificado — nativo no Next.js 16)
    - Protecoes ja ativas: SQL injection (Drizzle), XSS (CSP), CSRF (Next.js Server Actions). Adicionadas: base-uri, form-action, object-src no CSP + Permissions-Policy

- [x] Task 4: Implementar middleware de autorizacao para Server Actions (AC: #6)
  - [x] 4.1 Criar wrapper `withAuth` em `src/server/infrastructure/auth/with-auth.ts`:
    - Funcao que recebe um Server Action e retorna outro que verifica sessao antes de executar
    - Se nao autenticado: retorna `Result<never>` com `{ success: false, error: { code: 'UNAUTHORIZED', message: 'Sessao invalida. Faca login novamente.' } }`
    - Se autenticado: passa `session` como parametro para o action original
    - Type-safe: preserva tipos do input e output do action original
  - [x] 4.2 Criar helper `requireSession` em `src/server/infrastructure/auth/require-session.ts`:
    - Funcao simples que chama `auth.api.getSession()` com headers do request
    - Retorna `session` ou `null`
    - Usada internamente pelo `withAuth` e disponivel para uso direto em layouts/pages
  - [x] 4.3 Escrever testes TDD:
    - `src/server/infrastructure/auth/with-auth.test.ts`
    - Testa que action e executada quando sessao valida
    - Testa que retorna UNAUTHORIZED quando sessao invalida (null)
    - Testa que session e passada corretamente ao action wrapped
    - Mock de `auth.api.getSession()`
    - `src/server/infrastructure/auth/require-session.test.ts`
    - Testa retorno de session quando autenticado
    - Testa retorno de null quando nao autenticado

- [x] Task 5: Validacao final (AC: #1-#7)
  - [x] 5.1 SQL customizado aplicado diretamente no banco local — pgPolicy + FORCE RLS + trigger confirmados
  - [x] 5.2 `npm run build` compila sem erros
  - [x] 5.3 `npm test` roda e passa — 144 testes (20 arquivos), 15 testes novos, zero regressoes
  - [x] 5.4 `npm run lint` sem erros (1 warning pre-existente, nao relacionado)
  - [x] 5.5 Trigger de imutabilidade ativo — UPDATE e DELETE em audit_logs retornam excecao
  - [x] 5.6 Rate limiting integrado no middleware — retorna 429 com header Retry-After quando limite excedido (testado via unit tests)
  - [x] 5.7 Headers de seguranca presentes na resposta HTTP — verificado via curl (CSP, HSTS, X-Frame-Options, Permissions-Policy, etc.)

### Review Follow-ups (AI) — Backlog

- [x] [AI-Review][LOW] `rate-limiter.ts:9` — Adicionar `.unref()` ao `setInterval` de cleanup para nao bloquear graceful shutdown do process
- [x] [AI-Review][LOW] `rate-limiter.test.ts:77` — Renomear teste "deve limpar entradas expiradas via cleanup" para refletir que testa reset de janela, nao o `setInterval` cleanup. Considerar adicionar teste dedicado para o cleanup mechanism
- [x] [AI-Review][LOW] `middleware.ts:17` — Fallback `"unknown"` no `getClientIp` agrupa requests sem IP header no mesmo bucket. Sem impacto real atras da Vercel
- [x] [AI-Review][LOW] `next.config.ts:26` — CSP `'unsafe-inline'` em `script-src` enfraquece protecao XSS. Pre-existente (Story 1.5), trade-off aceito para MVP. Migrar para nonces em story futura

## Dev Notes

### Versoes Exatas do Stack (Story 1.6)

| Tecnologia | Versao | Pacote npm | Notas |
|---|---|---|---|
| Next.js | 16.1.6 | `next` (ja instalado) | middleware.ts, security headers |
| Better Auth | 1.5.5 | `better-auth` (ja instalado) | Session API, auth hooks |
| Drizzle ORM | 0.45.1 | `drizzle-orm` (ja instalado) | pgPolicy, pgTable, RLS |
| Drizzle Kit | 0.31.10 | `drizzle-kit` (ja instalado) | Migrations |
| Zod | 4.3.6 | `zod` (ja instalado) | Schema de validacao |
| PostgreSQL | Supabase local | Docker via `supabase start` | RLS, triggers, functions |

### CRITICO: Nenhum Pacote Novo Necessario

Todas as funcionalidades desta story usam dependencias ja instaladas. NAO instalar nenhum pacote adicional.

### ALERTA: middleware.ts vs proxy.ts

O `project-context.md` menciona que Next.js 16 renomeou `middleware.ts` para `proxy.ts`. Porem, o projeto atual funciona com `middleware.ts` e esta rodando Next.js 16.1.6 sem problemas. **NAO renomear** o arquivo nesta story — manter `middleware.ts` como esta. Se necessario migrar, sera tratado em story separada.

### ALERTA: Drizzle pgPolicy e RLS

O Drizzle ORM suporta `pgPolicy` direto no `pgTable`. Ao adicionar qualquer `pgPolicy`, o Drizzle habilita RLS automaticamente na migration gerada. Porem, como o app usa o superuser `postgres` para conectar (via Supabase local), RLS policies nao se aplicam ao superuser por padrao. Para garantir imutabilidade real, usar:
1. `pgPolicy` para INSERT-only (Drizzle migration)
2. `ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY` (migration SQL customizada)
3. Trigger `BEFORE UPDATE OR DELETE` que levanta excecao (defesa em profundidade)

### ALERTA: Rate Limiting em Serverless (Vercel)

O rate limiting in-memory (Map) funciona perfeitamente em desenvolvimento local e em servidores persistentes. Em producao na Vercel (serverless), cada invocacao pode rodar em instancias diferentes — o Map nao e compartilhado. Para o MVP isso e aceitavel (melhor que nada). Evolucao futura: migrar para Upstash Redis para rate limiting distribuido.

Nota: O Better Auth 1.5 ja inclui rate limiting nativo com defaults de 3 req/10s para endpoints de sign-in. O rate limiting no middleware e uma camada ADICIONAL que protege todas as rotas, nao apenas auth.

### ALERTA: Auditoria NAO Pode Bloquear Operacao

O servico de auditoria (`logAudit`) NUNCA deve lancar excecao que bloqueie a operacao principal. Se a insercao no `audit_logs` falhar (DB down, constraint violation, etc.), o servico deve:
1. Logar o erro via logger estruturado (warning level)
2. Continuar a execucao normalmente
3. A operacao do usuario NUNCA deve falhar por causa de auditoria

### ALERTA: withAuth e Result Pattern

O wrapper `withAuth` deve retornar `Result<never>` com error code `UNAUTHORIZED` quando a sessao e invalida — NAO usar `throw` ou `redirect()`. Isso mantem o contrato do Result Pattern e permite que o frontend trate o erro de forma consistente. O `redirect()` so deve ser usado em layouts e pages, nunca em Server Actions.

### Configuracao Exata — Servico de Auditoria

```typescript
// src/server/infrastructure/audit/audit.service.ts
import { db } from '@/server/infrastructure/database/client';
import { auditLogs } from '@/server/infrastructure/database/schema/audit-logs';

interface AuditLogParams {
  userId: string | null;
  organizationId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      ...params,
    });
  } catch (error) {
    // Auditoria NUNCA bloqueia operacao principal
    console.log(JSON.stringify({
      level: 'warn',
      action: 'audit_log_failed',
      data: { entityType: params.entityType, entityId: params.entityId },
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }));
  }
}
```

### Configuracao Exata — Rate Limiter

```typescript
// src/server/infrastructure/security/rate-limiter.ts
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup a cada 60s
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }, 60_000);
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  if (entry.count < limit) {
    entry.count++;
    return { success: true, remaining: limit - entry.count, retryAfterMs: 0 };
  }

  return { success: false, remaining: 0, retryAfterMs: entry.resetAt - now };
}

// Para testes — resetar o store
export function resetRateLimitStore(): void {
  store.clear();
}
```

### Configuracao Exata — withAuth Wrapper

```typescript
// src/server/infrastructure/auth/with-auth.ts
'use server';

import { headers } from 'next/headers';
import { auth } from '@/server/infrastructure/auth/config';
import type { Result } from '@/shared/types/result';

type Session = Awaited<ReturnType<typeof auth.api.getSession>>;
type NonNullSession = NonNullable<Session>;

export function withAuth<TInput, TOutput>(
  action: (session: NonNullSession, input: TInput) => Promise<Result<TOutput>>
) {
  return async (input: TInput): Promise<Result<TOutput>> => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Sessao invalida. Faca login novamente.',
        },
      };
    }

    return action(session, input);
  };
}
```

### Configuracao Exata — Migration SQL (Imutabilidade)

```sql
-- Migration customizada: audit_logs imutabilidade
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs table is immutable: % operations are not allowed', TG_OP;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER no_audit_log_mutation
  BEFORE UPDATE OR DELETE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();
```

### Configuracao Exata — Headers de Seguranca Atualizados

```typescript
// next.config.ts — headers adicionais
{ key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
// CSP atualizado com:
// "base-uri 'self'",
// "form-action 'self'",
// "object-src 'none'",
```

### Inteligencia da Story Anterior (1.5)

**O que ja existe e DEVE ser preservado:**
- Better Auth configurado com Google OAuth + account linking
- Middleware em `src/middleware.ts` com verificacao otimista de cookie `better-auth.session_token`
- Public paths: `/login`, `/register`, `/api/auth`
- Security headers em `next.config.ts` (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- Schema `audit_logs` ja criado em `src/server/infrastructure/database/schema/audit-logs.ts` com colunas completas
- RLS habilitado nas tabelas via migration 0001 (porem usando `auth.uid()` do Supabase Auth — nao funcional com Better Auth)
- 129 testes passando (16 arquivos)
- Server-side session via `getAuthSession()` em `src/server/infrastructure/auth/get-session.ts`
- Result Pattern em `src/shared/types/result.ts`

**Aprendizados do code review da Story 1.5:**
- try/catch obrigatorio em helpers de infra — se falhar, nao crashar o app
- Loading states devem resetar em caso de erro (always reset in finally/catch)
- errorCallbackURL pattern para tratamento de erros em redirects OAuth

### Git Intelligence

**Padroes de commit recentes:**
```
76dfd95 Merge pull request #5 from vitorcastilho/epic-1/1-5-login-social-google
4149fa5 chore: mark Story 1.5 as done after code review R2 approval
420ecf6 fix: resolve code review R1 findings for Story 1.5
37b47b3 feat: add Google OAuth social login with account linking (Story 1.5)
55040a0 Merge pull request #4 from vitorcastilho/epic-1/1-4-registro-e-login-com-email-senha
```

**Convencao a seguir:**
- `feat:` para implementacao principal da story
- `fix:` para correcoes de code review
- `chore:` para atualizacoes de status
- Branch: `epic-1/1-6-auditoria-e-seguranca`

### Project Structure Notes

**Estrutura de arquivos alinhada com a arquitetura:**
- Audit service em `src/server/infrastructure/audit/` — infraestrutura transversal
- Rate limiter em `src/server/infrastructure/security/` — infraestrutura de seguranca
- Auth wrapper em `src/server/infrastructure/auth/` — junto com config existente
- Schema Zod em `src/shared/schemas/` — schemas compartilhados
- Testes co-localizados com cada arquivo

**Arquivos a criar:**
- `src/server/infrastructure/audit/audit.service.ts`
- `src/server/infrastructure/audit/audit.service.test.ts`
- `src/server/infrastructure/security/rate-limiter.ts`
- `src/server/infrastructure/security/rate-limiter.test.ts`
- `src/server/infrastructure/auth/with-auth.ts`
- `src/server/infrastructure/auth/with-auth.test.ts`
- `src/server/infrastructure/auth/require-session.ts`
- `src/server/infrastructure/auth/require-session.test.ts`
- `src/shared/schemas/audit.schema.ts`

**Arquivos a modificar:**
- `src/server/infrastructure/database/schema/audit-logs.ts` — adicionar pgPolicy INSERT-only
- `src/middleware.ts` — adicionar rate limiting
- `next.config.ts` — adicionar Permissions-Policy e melhorar CSP

**Arquivos que NAO devem ser modificados:**
- `src/server/infrastructure/auth/config.ts` — config do Better Auth nao muda
- `src/server/infrastructure/auth/ensure-organization.ts` — helper de org nao muda
- `src/server/infrastructure/database/schema/auth.ts` — schema de auth nao muda
- `src/client/` — nenhuma mudanca no frontend nesta story
- `src/app/` — nenhuma mudanca nas rotas nesta story
- `package.json` — nenhum pacote novo

### O Que NAO Fazer Nesta Story

- **NAO implementar** trilha de auditoria nos use cases de negocio (contas, transacoes, etc.) — apenas criar o servico. A integracao sera feita quando os use cases forem implementados nos Epics 2+
- **NAO implementar** painel de visualizacao de audit logs — vem no Epic 9 (Admin)
- **NAO implementar** rate limiting distribuido (Redis) — usar in-memory Map para MVP
- **NAO renomear** middleware.ts para proxy.ts — manter como esta
- **NAO implementar** Server Actions de negocio — apenas o wrapper `withAuth` como infraestrutura
- **NAO alterar** o frontend — esta story e 100% backend/infraestrutura
- **NAO instalar** pacotes novos — tudo ja esta disponivel
- **NAO modificar** RLS policies existentes das tabelas de auth — apenas audit_logs

### Informacao Tecnica Atualizada (Web Research)

**Drizzle ORM pgPolicy:**
- `pgPolicy` e suportado nativamente no `pgTable` desde Drizzle 0.45.x
- Ao adicionar pgPolicy, RLS e habilitado automaticamente na migration
- Para audit_logs: usar `for: 'insert'` com `withCheck: sql\`true\``
- Default-deny: sem policy para SELECT/UPDATE/DELETE = bloqueado automaticamente

**Better Auth 1.5 Rate Limiting:**
- Better Auth 1.5 ja tem rate limiting nativo para endpoints de auth (3 req/10s para sign-in)
- O rate limiting no middleware e complementar — protege rotas alem do auth

**Next.js 16 Security:**
- Server Actions usam token CSRF automatico via Next.js — sem config adicional
- CSP com nonce forca dynamic rendering (sem cache) — para app autenticado e aceitavel, mas nao necessario no MVP
- `next.config.ts` `async headers()` e a API correta para security headers

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.6: Auditoria e Seguranca]
- [Source: _bmad-output/planning-artifacts/architecture.md#Trilha de Auditoria]
- [Source: _bmad-output/planning-artifacts/architecture.md#Rate Limiting]
- [Source: _bmad-output/planning-artifacts/architecture.md#OWASP Top 10]
- [Source: _bmad-output/planning-artifacts/architecture.md#Autorizacao: Defesa em Profundidade]
- [Source: _bmad-output/project-context.md#Critical Implementation Rules]
- [Source: _bmad-output/implementation-artifacts/1-5-login-social-google.md#Dev Notes]
- [Source: Drizzle ORM RLS — https://orm.drizzle.team/docs/rls]
- [Source: Better Auth 1.5 — https://better-auth.com/blog/1-5]
- [Source: Next.js Security Headers — https://nextjs.org/docs/pages/guides/content-security-policy]
- [Source: PostgreSQL RLS — https://www.postgresql.org/docs/current/sql-createpolicy.html]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Migration 0002 gerada por `drizzle-kit generate` e estendida manualmente com FORCE RLS + trigger
- `db:migrate` falhou por timeout; SQL aplicado diretamente via `psql` com sucesso
- `db:push` requer interatividade (conflito de policies) — nao utilizavel em ambiente nao-interativo

### Completion Notes List

- Servico de auditoria (`logAudit`) implementado com encapsulamento de erro — nunca bloqueia operacao principal
- Rate limiter in-memory com sliding window implementado e integrado no middleware antes da verificacao de sessao
- Headers de seguranca atualizados: CSP com base-uri/form-action/object-src + Permissions-Policy adicionado
- Wrapper `withAuth` e helper `requireSession` implementados com Result Pattern — sem throw/redirect em Server Actions
- Schema Zod de auditoria com enum `AuditAction` para validacao futura
- Trigger PostgreSQL `no_audit_log_mutation` garante imutabilidade mesmo para superuser
- 15 novos testes (4 audit service + 6 rate limiter + 3 with-auth + 2 require-session), total 144 passando
- Nenhum pacote novo instalado — tudo via dependencias existentes

### Change Log

- 2026-03-18: Implementacao completa da Story 1.6 — servico de auditoria, rate limiting, headers de seguranca, middleware de autorizacao
- 2026-03-18: Code Review R1 — APROVADO. 0 HIGH, 0 MEDIUM, 4 LOW (backlog). Todas as 7 ACs implementadas. 15 testes com assertions reais. Action items LOW adicionados como backlog
- 2026-03-18: Resolvidos 4 items LOW do backlog — .unref() no cleanup, teste renomeado + teste dedicado para cleanup, log estruturado para IP desconhecido, CSP unsafe-inline documentado como trade-off MVP (nonces requerem dynamic rendering em todas as paginas)

### File List

**Novos:**
- `src/server/infrastructure/audit/audit.service.ts`
- `src/server/infrastructure/audit/audit.service.test.ts`
- `src/server/infrastructure/security/rate-limiter.ts`
- `src/server/infrastructure/security/rate-limiter.test.ts`
- `src/server/infrastructure/auth/with-auth.ts`
- `src/server/infrastructure/auth/with-auth.test.ts`
- `src/server/infrastructure/auth/require-session.ts`
- `src/server/infrastructure/auth/require-session.test.ts`
- `src/shared/schemas/audit.schema.ts`
- `src/server/infrastructure/database/migrations/0002_fine_puck.sql`
- `src/server/infrastructure/database/migrations/meta/0002_snapshot.json`

**Modificados:**
- `src/server/infrastructure/database/schema/audit-logs.ts` — adicionado pgPolicy INSERT-only
- `src/middleware.ts` — integrado rate limiting baseado em IP
- `next.config.ts` — adicionado Permissions-Policy + CSP base-uri/form-action/object-src
- `src/server/infrastructure/database/migrations/meta/_journal.json` — entrada da migration 0002
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — status atualizado
