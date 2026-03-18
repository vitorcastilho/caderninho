# Story 1.7: Validacao, Logging e Infraestrutura Compartilhada

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want structured logging and shared validation infrastructure,
So that the application has consistent error handling and input validation.

## Acceptance Criteria

1. Logger estruturado em JSON esta implementado em `src/server/infrastructure/logging/logger.ts` com funcoes `info()`, `warn()`, `error()` — cada log inclui: `level`, `action` (snake_case), `userId` (opcional), `data` (relevante), `timestamp` (ISO 8601)
2. Logs NUNCA contem dados sensiveis (senhas, tokens, dados pessoais como CPF, email completo) — lista de campos sensiveis filtrada automaticamente pelo logger
3. Zod esta configurado como infraestrutura de validacao compartilhada em `src/shared/schemas/` com schemas reutilizaveis e helpers de validacao server-side
4. Result Pattern esta implementado em `src/shared/types/result.ts` com helpers `ok()` e `err()` para erros de negocio (nunca throw para erros esperados)
5. Logging existente no codebase (audit.service.ts e middleware.ts) refatorado para usar o novo logger centralizado — eliminando `console.log(JSON.stringify(...))` ad-hoc
6. Schemas Zod de validacao comum criados em `src/shared/schemas/common.schema.ts` — patterns reutilizaveis para: IDs (UUID), valores monetarios (integer positivo em centavos), timestamps, paginacao
7. Todos os novos modulos tem testes TDD co-localizados

## Tasks / Subtasks

- [x] Task 1: Criar logger estruturado (AC: #1, #2)
  - [x] 1.1 Criar `src/server/infrastructure/logging/logger.ts`:
    - Objeto `logger` com metodos: `info()`, `warn()`, `error()`
    - Cada metodo aceita `params: { action: string; userId?: string; organizationId?: string; data?: Record<string, unknown>; error?: string }`
    - Output: `console.log(JSON.stringify({ level, action, userId, organizationId, data, timestamp }))` para info/warn; `console.error(JSON.stringify(...))` para error
    - Filtro de dados sensiveis: antes de serializar `data`, remover campos que contenham `password`, `token`, `secret`, `credential`, `authorization`, `cookie`, `cpf`, `ssn`
    - Funcao interna `sanitizeData(data)` que faz deep-clone e substitui valores de campos sensiveis por `"[REDACTED]"`
    - Export nomeado: `export const logger = { info, warn, error }`
  - [x] 1.2 Escrever testes TDD em `src/server/infrastructure/logging/logger.test.ts`:
    - Testa que `logger.info()` gera JSON valido com level "info"
    - Testa que `logger.warn()` gera JSON valido com level "warn"
    - Testa que `logger.error()` gera JSON valido com level "error" e usa console.error
    - Testa que campos sensiveis sao filtrados (password, token, secret)
    - Testa que campos nao-sensiveis passam inalterados
    - Testa que funciona sem campos opcionais (userId, data)
    - Testa que timestamp esta no formato ISO 8601
    - Mock de `console.log` e `console.error` via `vi.spyOn`

- [x] Task 2: Criar helpers do Result Pattern (AC: #4)
  - [x] 2.1 Adicionar helpers `ok()` e `err()` em `src/shared/types/result.ts`:
    - `ok<T>(data: T): Result<T>` — retorna `{ success: true, data }`
    - `err(code: string, message: string, details?: Record<string, string>): Result<never>` — retorna `{ success: false, error: { code, message, details } }`
    - Exportar ambos como funcoes nomeadas
    - Manter o tipo `Result<T>` existente inalterado
  - [x] 2.2 Atualizar testes em `src/shared/types/result.test.ts`:
    - Testa que `ok(data)` retorna `{ success: true, data }`
    - Testa que `err(code, message)` retorna `{ success: false, error: { code, message } }`
    - Testa que `err(code, message, details)` inclui details
    - Testa type narrowing: `if (result.success) result.data` e `if (!result.success) result.error`

- [x] Task 3: Criar schemas Zod de validacao comum (AC: #3, #6)
  - [x] 3.1 Criar `src/shared/schemas/common.schema.ts`:
    - `idSchema` — `z.string().uuid()` para IDs de entidade
    - `amountCentsSchema` — `z.number().int().nonnegative()` para valores monetarios em centavos
    - `positiveAmountCentsSchema` — `z.number().int().positive()` para valores que devem ser > 0
    - `percentBasisPointsSchema` — `z.number().int().min(0).max(10000)` para percentuais (0-100% em basis points)
    - `paginationSchema` — `z.object({ page: z.number().int().positive().default(1), pageSize: z.number().int().min(1).max(100).default(20) })`
    - `dateRangeSchema` — `z.object({ startDate: z.date(), endDate: z.date() }).refine(d => d.endDate >= d.startDate, { message: "Data final deve ser posterior a data inicial" })`
    - `sortSchema` — `z.object({ field: z.string(), direction: z.enum(['asc', 'desc']).default('desc') })`
    - Exportar todos os schemas e tipos inferidos
  - [x] 3.2 Escrever testes TDD em `src/shared/schemas/common.schema.test.ts`:
    - Testa `idSchema` aceita UUID valido e rejeita string invalida
    - Testa `amountCentsSchema` aceita 0 e inteiros positivos, rejeita negativos e decimais
    - Testa `positiveAmountCentsSchema` rejeita 0
    - Testa `percentBasisPointsSchema` aceita 0-10000, rejeita fora do range
    - Testa `paginationSchema` com defaults e valores customizados
    - Testa `dateRangeSchema` valida que endDate >= startDate
    - Testa `sortSchema` com defaults e direcoes validas

- [x] Task 4: Criar utilitario de validacao server-side (AC: #3)
  - [x] 4.1 Criar `src/server/infrastructure/validation/validate.ts`:
    - Funcao `validateInput<T>(schema: ZodSchema<T>, data: unknown): Result<T>`
    - Se validacao passa: retorna `ok(parsedData)`
    - Se validacao falha: retorna `err('VALIDATION_ERROR', 'Dados invalidos', detailsMap)` onde detailsMap mapeia campo -> mensagem de erro
    - Integra Result Pattern com Zod de forma padronizada — elimina boilerplate nos use cases
  - [x] 4.2 Escrever testes TDD em `src/server/infrastructure/validation/validate.test.ts`:
    - Testa que input valido retorna `{ success: true, data }`
    - Testa que input invalido retorna `{ success: false, error: { code: 'VALIDATION_ERROR', details } }`
    - Testa que details contem campos que falharam com mensagens descritivas
    - Testa com schema complexo (nested objects)
    - Testa com schema que tem refinements

- [x] Task 5: Refatorar logging existente para usar o novo logger (AC: #5)
  - [x] 5.1 Atualizar `src/server/infrastructure/audit/audit.service.ts`:
    - Substituir `console.log(JSON.stringify({ level: 'warn', action: 'audit_log_failed', ... }))` por `logger.warn({ action: 'audit_log_failed', data: { entityType, entityId }, error: errorMessage })`
    - Importar `logger` de `@/server/infrastructure/logging/logger`
  - [x] 5.2 Atualizar `src/middleware.ts`:
    - Substituir `console.log(JSON.stringify({ level: 'warn', action: 'rate_limit_ip_missing', ... }))` por `logger.warn({ action: 'rate_limit_ip_missing' })`
    - Importar `logger` de `@/server/infrastructure/logging/logger`
  - [x] 5.3 Verificar que testes existentes continuam passando apos refatoracao:
    - `audit.service.test.ts` — atualizar mocks se necessario (console.log -> logger.warn)
    - Rodar `npm test` para confirmar zero regressoes

- [x] Task 6: Validacao final (AC: #1-#7)
  - [x] 6.1 `npm run build` compila sem erros
  - [x] 6.2 `npm test` roda e passa — todos os testes novos + zero regressoes
  - [x] 6.3 `npm run lint` sem erros novos
  - [x] 6.4 Logger produz JSON valido em todos os levels
  - [x] 6.5 Dados sensiveis sao filtrados pelo logger
  - [x] 6.6 Result Pattern helpers `ok()` e `err()` funcionam com type narrowing
  - [x] 6.7 Schemas comuns validam corretamente valores financeiros em centavos

## Dev Notes

### Versoes Exatas do Stack (Story 1.7)

| Tecnologia | Versao | Pacote npm | Notas |
|---|---|---|---|
| Next.js | 16.1.6 | `next` (ja instalado) | middleware.ts |
| Zod | 4.3.6 | `zod` (ja instalado) | Schemas de validacao |
| Drizzle ORM | 0.45.1 | `drizzle-orm` (ja instalado) | Schemas DB |
| Vitest | 4.1.0 | `vitest` (ja instalado) | Testes TDD |
| TypeScript | 5.9.3 | `typescript` (ja instalado) | Strict mode |

### CRITICO: Nenhum Pacote Novo Necessario

Todas as funcionalidades desta story usam dependencias ja instaladas. NAO instalar nenhum pacote adicional (incluindo `drizzle-zod` — nao necessario para esta story).

### ALERTA: Result Pattern Ja Existe

O Result Pattern ja esta implementado em `src/shared/types/result.ts` desde a Story 1.1. A AC menciona `src/shared/result.ts` mas o caminho real e `src/shared/types/result.ts`. NAO mover o arquivo — apenas adicionar os helpers `ok()` e `err()` ao arquivo existente.

Implementacao existente:
```typescript
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: Record<string, string> } };

export type { Result };
```

Testes existentes em `src/shared/types/result.test.ts` verificam:
- Representacao de sucesso com data tipada
- Representacao de erro com code e message
- Suporte a details opcionais

### ALERTA: Zod Schemas Ja Existentes

Ja existem schemas Zod em `src/shared/schemas/`:
- `auth.schema.ts` — registerSchema, loginSchema (com testes)
- `audit.schema.ts` — AuditAction enum, auditLogSchema

NAO modificar esses schemas existentes. Criar apenas `common.schema.ts` com patterns reutilizaveis.

### ALERTA: Logging Ad-Hoc Existente

Atualmente o codebase usa `console.log(JSON.stringify({ level, action, ... }))` em 2 lugares:

1. `src/server/infrastructure/audit/audit.service.ts` (linhas 24-30):
```typescript
console.log(JSON.stringify({
  level: 'warn',
  action: 'audit_log_failed',
  data: { entityType: params.entityType, entityId: params.entityId },
  error: error instanceof Error ? error.message : 'Unknown error',
  timestamp: new Date().toISOString(),
}));
```

2. `src/middleware.ts` (linhas 18-25):
```typescript
console.log(JSON.stringify({
  level: 'warn',
  action: 'rate_limit_ip_missing',
  timestamp: new Date().toISOString(),
}));
```

Ambos devem ser refatorados para usar `logger.warn()` do novo modulo.

### ALERTA: Testes do Audit Service Podem Precisar de Atualizacao

Ao refatorar `audit.service.ts` para usar `logger.warn()` em vez de `console.log()`, os testes em `audit.service.test.ts` que verificam a chamada de `console.log` precisarao ser atualizados para verificar `logger.warn()` em vez disso. Verificar o teste "nao deve propagar excecao quando insercao falha" (ou similar).

### Configuracao Exata — Logger Estruturado

```typescript
// src/server/infrastructure/logging/logger.ts

const SENSITIVE_FIELDS = new Set([
  'password',
  'token',
  'secret',
  'credential',
  'authorization',
  'cookie',
  'cpf',
  'ssn',
  'accessToken',
  'refreshToken',
  'sessionToken',
]);

function isSensitiveKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return Array.from(SENSITIVE_FIELDS).some(field => lowerKey.includes(field.toLowerCase()));
}

function sanitizeData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (isSensitiveKey(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeData(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

interface LogParams {
  action: string;
  userId?: string;
  organizationId?: string;
  data?: Record<string, unknown>;
  error?: string;
}

function formatLog(level: string, params: LogParams): string {
  const entry: Record<string, unknown> = {
    level,
    action: params.action,
    timestamp: new Date().toISOString(),
  };

  if (params.userId) entry.userId = params.userId;
  if (params.organizationId) entry.organizationId = params.organizationId;
  if (params.data) entry.data = sanitizeData(params.data);
  if (params.error) entry.error = params.error;

  return JSON.stringify(entry);
}

function info(params: LogParams): void {
  console.log(formatLog('info', params));
}

function warn(params: LogParams): void {
  console.log(formatLog('warn', params));
}

function error(params: LogParams): void {
  console.error(formatLog('error', params));
}

export const logger = { info, warn, error };
```

### Configuracao Exata — Result Pattern Helpers

```typescript
// Adicionar ao src/shared/types/result.ts existente

export function ok<T>(data: T): Result<T> {
  return { success: true, data };
}

export function err(
  code: string,
  message: string,
  details?: Record<string, string>
): Result<never> {
  return { success: false, error: { code, message, ...(details && { details }) } };
}
```

### Configuracao Exata — Validate Input Helper

```typescript
// src/server/infrastructure/validation/validate.ts
import type { ZodSchema, ZodError } from 'zod';
import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';

function formatZodErrors(error: ZodError): Record<string, string> {
  const details: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    details[path || '_root'] = issue.message;
  }
  return details;
}

export function validateInput<T>(schema: ZodSchema<T>, data: unknown): Result<T> {
  const result = schema.safeParse(data);
  if (result.success) {
    return ok(result.data);
  }
  return err('VALIDATION_ERROR', 'Dados invalidos', formatZodErrors(result.error));
}
```

### Configuracao Exata — Common Schemas

```typescript
// src/shared/schemas/common.schema.ts
import { z } from 'zod';

// IDs de entidade (UUID v4)
export const idSchema = z.string().uuid();

// Valores monetarios em centavos (integer >= 0)
export const amountCentsSchema = z.number().int().nonnegative();

// Valores monetarios positivos (integer > 0)
export const positiveAmountCentsSchema = z.number().int().positive();

// Percentuais em basis points (0-10000 = 0%-100%)
export const percentBasisPointsSchema = z.number().int().min(0).max(10000);

// Paginacao
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

// Range de datas
export const dateRangeSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine(
  (d) => d.endDate >= d.startDate,
  { message: 'Data final deve ser posterior a data inicial' }
);

// Ordenacao
export const sortSchema = z.object({
  field: z.string(),
  direction: z.enum(['asc', 'desc']).default('desc'),
});

// Tipos inferidos
export type Id = z.infer<typeof idSchema>;
export type AmountCents = z.infer<typeof amountCentsSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
export type Sort = z.infer<typeof sortSchema>;
```

### Inteligencia da Story Anterior (1.6)

**O que ja existe e DEVE ser preservado:**
- Servico de auditoria (`logAudit`) em `src/server/infrastructure/audit/audit.service.ts` — nunca lanca excecao
- Rate limiter in-memory em `src/server/infrastructure/security/rate-limiter.ts`
- Wrapper `withAuth` em `src/server/infrastructure/auth/with-auth.ts` — Result Pattern para auth
- Helper `requireSession` em `src/server/infrastructure/auth/require-session.ts`
- Schema Zod de auditoria em `src/shared/schemas/audit.schema.ts`
- Middleware com rate limiting e verificacao de sessao em `src/middleware.ts`
- Headers de seguranca em `next.config.ts` (CSP, HSTS, Permissions-Policy)
- 145 testes passando (20 arquivos)

**Aprendizados da Story 1.6:**
- Auditoria NUNCA bloqueia operacao principal — fail-safe pattern
- Rate limiting in-memory funciona para MVP (Map nao compartilhado em serverless)
- `withAuth` retorna Result, nao throw/redirect — contrato consistente
- Testes devem usar mock de Drizzle client para audit service
- `.unref()` no setInterval de cleanup para nao bloquear graceful shutdown

**Backlog items da Story 1.6 (para contexto, NAO resolver nesta story):**
- `require-session.ts` duplica `get-session.ts` (dead code) — cleanup futuro
- `auditLogSchema` nao usado pelo `audit.service.ts` — validacao futura
- Migration 0002 tem ENABLE + FORCE RLS redundante — sem impacto funcional

### Git Intelligence

**Padroes de commit recentes:**
```
57bba40 Merge pull request #6 from vitorcastilho/epic-1/1-6-auditoria-e-seguranca
08c310c chore: mark Story 1.6 as done after code review R2 approval
5a2fae5 fix: resolve code review backlog items for Story 1.6
4217841 chore: mark Story 1.6 as done after code review R1 approval
87f1e5e feat: add audit logging, rate limiting, security headers and auth middleware (Story 1.6)
```

**Convencao a seguir:**
- `feat:` para implementacao principal da story
- `fix:` para correcoes de code review
- `chore:` para atualizacoes de status
- Branch: `epic-1/1-7-validacao-logging-e-infraestrutura-compartilhada`

### Project Structure Notes

**Estrutura de arquivos alinhada com a arquitetura:**
- Logger em `src/server/infrastructure/logging/` — infraestrutura transversal
- Validation helper em `src/server/infrastructure/validation/` — infraestrutura transversal
- Common schemas em `src/shared/schemas/` — schemas compartilhados
- Result helpers em `src/shared/types/` — tipos compartilhados
- Testes co-localizados com cada arquivo

**Arquivos a criar:**
- `src/server/infrastructure/logging/logger.ts`
- `src/server/infrastructure/logging/logger.test.ts`
- `src/server/infrastructure/validation/validate.ts`
- `src/server/infrastructure/validation/validate.test.ts`
- `src/shared/schemas/common.schema.ts`
- `src/shared/schemas/common.schema.test.ts`

**Arquivos a modificar:**
- `src/shared/types/result.ts` — adicionar helpers `ok()` e `err()`
- `src/shared/types/result.test.ts` — adicionar testes para helpers
- `src/server/infrastructure/audit/audit.service.ts` — refatorar para usar logger
- `src/server/infrastructure/audit/audit.service.test.ts` — atualizar mocks
- `src/middleware.ts` — refatorar para usar logger

**Arquivos que NAO devem ser modificados:**
- `src/shared/schemas/auth.schema.ts` — schema de auth nao muda
- `src/shared/schemas/audit.schema.ts` — schema de auditoria nao muda
- `src/server/infrastructure/auth/config.ts` — config do Better Auth nao muda
- `src/server/infrastructure/security/rate-limiter.ts` — rate limiter nao muda
- `src/client/` — nenhuma mudanca no frontend nesta story
- `src/app/` — nenhuma mudanca nas rotas nesta story
- `package.json` — nenhum pacote novo

### O Que NAO Fazer Nesta Story

- **NAO instalar** pacotes novos (incluindo `drizzle-zod`) — tudo ja esta disponivel
- **NAO mover** `src/shared/types/result.ts` para `src/shared/result.ts` — manter no caminho existente
- **NAO modificar** schemas Zod existentes (auth.schema.ts, audit.schema.ts) — apenas criar common.schema.ts
- **NAO implementar** Server Actions de negocio — apenas infraestrutura de validacao
- **NAO implementar** componentes de UI — esta story e 100% backend/infraestrutura
- **NAO implementar** logging em use cases de negocio — apenas criar o logger e refatorar o uso existente. Integracao com use cases sera feita nos Epics 2+
- **NAO resolver** backlog items da Story 1.6 (require-session.ts dead code, etc.)
- **NAO implementar** log rotation, log aggregation ou monitoramento — fora do escopo MVP
- **NAO criar** `tailwind.config.ts` — Tailwind v4 nao usa

### Informacao Tecnica Atualizada

**Zod 4.x:**
- API identica ao Zod 3.x para schemas basicos (z.string(), z.number(), z.object())
- `.safeParse()` retorna `{ success: boolean, data?, error? }` — integra naturalmente com Result Pattern
- `z.infer<typeof schema>` para inferir tipos TypeScript a partir de schemas
- 14x mais rapido que v3 em parsing

**Vitest:**
- `vi.spyOn(console, 'log')` para testar output do logger
- `vi.spyOn(console, 'error')` para testar `logger.error()`
- `vi.restoreAllMocks()` no `afterEach` para cleanup
- Globals habilitados — sem necessidade de import de describe/it/expect

**Result Pattern + Zod Integration:**
- `schema.safeParse(data)` retorna objeto com `.success`, `.data`, `.error`
- `.error.issues` contem array de erros com `.path` e `.message`
- Mapear `.issues` para `Record<string, string>` nos details do Result Pattern

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.7: Validacao, Logging e Infraestrutura Compartilhada]
- [Source: _bmad-output/planning-artifacts/architecture.md#Logging]
- [Source: _bmad-output/planning-artifacts/architecture.md#Result Pattern]
- [Source: _bmad-output/planning-artifacts/architecture.md#Validacao de Dados: Zod]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/project-context.md#Critical Implementation Rules]
- [Source: _bmad-output/implementation-artifacts/1-6-auditoria-e-seguranca.md#Dev Notes]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

Nenhum debug necessario — implementacao direta seguindo TDD.

### Completion Notes List

- Task 1: Logger estruturado criado com sanitizacao de dados sensiveis (SENSITIVE_FIELDS Set), deep-clone para objetos aninhados, 9 testes cobrindo todos os levels, sanitizacao e campos opcionais
- Task 2: Helpers `ok()` e `err()` adicionados ao `result.ts` existente sem alterar o tipo `Result<T>`, 5 novos testes incluindo type narrowing
- Task 3: 7 schemas Zod reutilizaveis criados (id, amountCents, positiveAmountCents, percentBasisPoints, pagination, dateRange, sort) com tipos inferidos, 23 testes cobrindo validacoes e defaults
- Task 4: `validateInput()` integra Zod + Result Pattern — converte ZodError.issues em Record<string, string> para details, 5 testes incluindo nested objects e refinements
- Task 5: Refatorado `audit.service.ts` e `middleware.ts` para usar `logger.warn()` em vez de `console.log(JSON.stringify(...))`, testes do audit service atualizados para mock de logger
- Task 6: Validacao final — build OK, 187 testes passando (23 arquivos), lint sem erros novos, zero regressoes

### Change Log

- 2026-03-18: Implementacao completa da Story 1.7 — logger estruturado, Result Pattern helpers, schemas Zod comuns, utilitario de validacao server-side, refatoracao de logging existente. 42 novos testes adicionados, total 187 passando.

### File List

**Novos:**
- src/server/infrastructure/logging/logger.ts
- src/server/infrastructure/logging/logger.test.ts
- src/server/infrastructure/validation/validate.ts
- src/server/infrastructure/validation/validate.test.ts
- src/shared/schemas/common.schema.ts
- src/shared/schemas/common.schema.test.ts

**Modificados:**
- src/shared/types/result.ts — adicionados helpers ok() e err()
- src/shared/types/result.test.ts — adicionados testes para ok() e err()
- src/server/infrastructure/audit/audit.service.ts — refatorado para usar logger
- src/server/infrastructure/audit/audit.service.test.ts — atualizado mock de console.log para logger.warn
- src/middleware.ts — refatorado para usar logger
