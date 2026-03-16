# Story 1.1: Inicialização do Projeto e Estrutura Base

Status: review

## Story

As a developer,
I want the project initialized with the correct stack and folder structure,
So that I can start building features on a solid architectural foundation.

## Acceptance Criteria

1. O projeto é criado com `npx create-next-app@latest caderninho --typescript --tailwind --eslint --app --src-dir --turbopack`
2. Path aliases estão configurados no tsconfig (`@/server/*`, `@/client/*`, `@/shared/*`, `@/app/*`)
3. A estrutura de pastas segue a arquitetura definida: `src/server/`, `src/client/`, `src/shared/`, `src/app/`
4. O tipo `Result<T>` está implementado em `src/shared/types/result.ts`
5. Vitest está configurado e rodando com pelo menos 1 teste de exemplo
6. `.env.example` existe com todas as variáveis documentadas (sem valores reais)
7. `.gitignore` inclui `.env.local`, `node_modules`, `.next`

## Tasks / Subtasks

- [x] Task 1: Executar create-next-app (AC: #1)
  - [x] 1.1 Executar `npx create-next-app@latest caderninho --typescript --tailwind --eslint --app --src-dir --turbopack`
  - [x] 1.2 Verificar que o projeto roda com `npm run dev`
  - [x] 1.3 Verificar que o build funciona com `npm run build`
- [x] Task 2: Configurar path aliases no tsconfig (AC: #2)
  - [x] 2.1 Adicionar aliases `@/server/*`, `@/client/*`, `@/shared/*`, `@/app/*` no `tsconfig.json`
  - [x] 2.2 Manter o alias `@/*` padrão do create-next-app apontando para `./src/*`
- [x] Task 3: Criar estrutura de pastas da arquitetura (AC: #3)
  - [x] 3.1 Criar `src/server/domain/` (vazio, com .gitkeep)
  - [x] 3.2 Criar `src/server/infrastructure/` (vazio, com .gitkeep)
  - [x] 3.3 Criar `src/server/actions/` (vazio, com .gitkeep)
  - [x] 3.4 Criar `src/client/components/ui/` (vazio, com .gitkeep)
  - [x] 3.5 Criar `src/client/hooks/` (vazio, com .gitkeep)
  - [x] 3.6 Criar `src/client/utils/` (vazio, com .gitkeep)
  - [x] 3.7 Criar `src/shared/types/`
  - [x] 3.8 Criar `src/shared/schemas/` (vazio, com .gitkeep)
  - [x] 3.9 Criar `src/shared/constants/` (vazio, com .gitkeep)
  - [x] 3.10 Criar `e2e/` na raiz (vazio, com .gitkeep)
- [x] Task 4: Implementar Result<T> (AC: #4)
  - [x] 4.1 Criar `src/shared/types/result.ts` com o tipo Result<T>
  - [x] 4.2 Criar `src/shared/types/index.ts` para re-export
  - [x] 4.3 Escrever teste para Result<T> ANTES da implementação (TDD)
- [x] Task 5: Configurar Vitest (AC: #5)
  - [x] 5.1 Instalar vitest como devDependency
  - [x] 5.2 Criar `vitest.config.ts` na raiz com path aliases resolvidos
  - [x] 5.3 Adicionar scripts `test`, `test:watch`, `test:coverage` no package.json
  - [x] 5.4 Executar o teste de Result<T> (deve passar — Green)
- [x] Task 6: Criar .env.example (AC: #6)
  - [x] 6.1 Criar `.env.example` com variáveis documentadas
- [x] Task 7: Configurar .gitignore (AC: #7)
  - [x] 7.1 Verificar/adicionar `.env.local`, `node_modules`, `.next` no `.gitignore`
  - [x] 7.2 Adicionar `.env` e `.env*.local` (padrão de segurança)
- [x] Task 8: Validação final
  - [x] 8.1 `npm run dev` funciona
  - [x] 8.2 `npm run build` funciona sem erros
  - [x] 8.3 `npm test` roda e passa
  - [x] 8.4 Path aliases resolvem corretamente

## Dev Notes

### Versões Exatas do Stack (pesquisadas em 2026-03-16)

| Tecnologia | Versão | Notas |
|---|---|---|
| Next.js | 16.1.6 | Turbopack é default. App Router padrão. React 19 recomendado |
| TypeScript | 5.9.3 | Usar esta versão estável. NÃO usar 6.0 (RC, instável) |
| Tailwind CSS | 4.2.1 | **BREAKING:** Sem `tailwind.config.ts`. Config via CSS |
| Vitest | 4.1.0 | Alinhado com Vite 7.x |
| Zod | 4.3.6 | Performance 14x melhor que v3. NÃO instalar nesta story |
| Drizzle ORM | 0.45.1 | NÃO instalar nesta story (Story 1.3) |
| Better Auth | 1.5.5 | NÃO instalar nesta story (Story 1.4) |

### ALERTA: Tailwind CSS v4 — Mudança Radical

O documento de arquitetura menciona `tailwind.config.ts` na estrutura do projeto, mas Tailwind v4 **eliminou** arquivos de configuração JS/TS. A nova configuração é feita via CSS:

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  /* Design tokens aqui (cores, fontes, etc.) */
  /* Será configurado na Story 1.2 (Design System) */
}
```

O `create-next-app@latest --tailwind` já instala Tailwind v4 com a configuração CSS correta. **NÃO criar** `tailwind.config.ts` — ele não existe mais.

### ALERTA: Next.js 16 — Mudanças Importantes

1. **Turbopack é o bundler padrão** (não mais experimental)
2. **APIs de request são async:** `params`, `searchParams`, `cookies()`, `headers()` retornam Promises
3. **React 19** é o peer dependency recomendado
4. **`middleware.ts`** foi renomeado para **`proxy.ts`** (relevante para Story 1.6+)
5. **Cache model novo**: Cache Components para caching explícito

### Padrões Obrigatórios (da Arquitetura)

**Result Pattern — implementação exata:**

```typescript
// src/shared/types/result.ts
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: Record<string, string> } };
```

- `code`: UPPER_SNAKE_CASE em inglês (consumo programático)
- `message`: português (exibição ao usuário)
- Erros de validação incluem `details` com campos que falharam
- Exceções (`throw`) reservadas exclusivamente para erros inesperados de infraestrutura

**Naming conventions (aplicar desde o início):**

| Elemento | Convenção | Exemplo |
|---|---|---|
| Variáveis e funções | camelCase | `amountCents`, `getUserById()` |
| Tipos e interfaces | PascalCase | `Transaction`, `CreateAccountInput` |
| Componentes React | PascalCase | `TransactionForm.tsx` |
| Constantes | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Arquivos de use case | kebab-case | `create-account.ts` |
| Arquivos de teste | kebab-case + .test | `create-account.test.ts` |
| Pastas | kebab-case | `use-cases/`, `server-actions/` |
| Schemas Zod | camelCase + Schema | `transactionSchema` |

**Ordem de imports (aplicar desde o início):**

```typescript
// 1. Bibliotecas externas
// 2. Shared (tipos, schemas) — @/shared/
// 3. Server (domínio, infra) — @/server/
// 4. Client (componentes, hooks) — @/client/
// 5. Estilos
```

### Estrutura de Pastas Completa a Criar

```
src/
  server/                          # BACKEND
    domain/                        # DDD — vazio por agora, .gitkeep
    infrastructure/                # Implementações — vazio por agora, .gitkeep
    actions/                       # Server Actions — vazio por agora, .gitkeep

  client/                          # FRONTEND
    components/
      ui/                          # shadcn/ui — vazio por agora, .gitkeep
    hooks/                         # Custom hooks — vazio, .gitkeep
    utils/                         # Utilitários frontend — vazio, .gitkeep

  app/                             # ROTAS (já existe do create-next-app)
    globals.css                    # Já existe, Tailwind v4 config via CSS
    layout.tsx                     # Já existe
    page.tsx                       # Já existe

  shared/                          # COMPARTILHADO
    types/
      result.ts                    # Result<T> — implementar
      index.ts                     # Re-export
    schemas/                       # Zod schemas — vazio, .gitkeep
    constants/                     # Constantes compartilhadas — vazio, .gitkeep

e2e/                               # Testes E2E (raiz) — vazio, .gitkeep
```

### Path Aliases — tsconfig.json

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/server/*": ["./src/server/*"],
      "@/client/*": ["./src/client/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/app/*": ["./src/app/*"]
    }
  }
}
```

Nota: o `create-next-app` já cria `@/*` → `./src/*`. Adicionar os aliases específicos sem remover o existente.

### Vitest — Configuração

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/server': path.resolve(__dirname, './src/server'),
      '@/client': path.resolve(__dirname, './src/client'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/app': path.resolve(__dirname, './src/app'),
    },
  },
});
```

**Scripts no package.json:**

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

### .env.example — Variáveis Iniciais

```bash
# Supabase (Story 1.3)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database (Story 1.3)
DATABASE_URL=

# Better Auth (Story 1.4)
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (Story 1.5)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Environment
NODE_ENV=development
ENVIRONMENT=development
```

### TDD — Teste de Exemplo para Result<T>

Escrever o teste ANTES da implementação (Red-Green-Refactor):

```typescript
// src/shared/types/result.test.ts
import { describe, it, expect } from 'vitest';
import type { Result } from './result';

describe('Result<T>', () => {
  it('deve representar sucesso com dados tipados', () => {
    const result: Result<{ id: string }> = {
      success: true,
      data: { id: '123' },
    };
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('123');
    }
  });

  it('deve representar erro com código e mensagem', () => {
    const result: Result<never> = {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos' },
    };
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toBe('Dados inválidos');
    }
  });

  it('deve suportar details opcionais em erros', () => {
    const result: Result<never> = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: { amountCents: 'Valor deve ser positivo' },
      },
    };
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.details?.amountCents).toBe('Valor deve ser positivo');
    }
  });
});
```

### O Que NÃO Fazer Nesta Story

- **NÃO instalar** Drizzle ORM, Supabase, Better Auth, shadcn/ui, Zod, React Hook Form
- **NÃO criar** `tailwind.config.ts` (Tailwind v4 não usa)
- **NÃO configurar** design tokens, cores, fontes (isso é Story 1.2)
- **NÃO criar** schemas de banco, migrations, RLS (isso é Story 1.3)
- **NÃO criar** componentes de UI
- **NÃO modificar** a page.tsx padrão do Next.js (será substituída depois)
- **NÃO instalar** Playwright (isso é Story 1.8)

### Escopo Exato

Esta story configura **apenas a fundação estrutural**:
1. Projeto Next.js criado e funcionando
2. Pastas da arquitetura Clean Architecture + DDD criadas
3. Path aliases configurados e resolvendo
4. Result<T> implementado com teste (TDD)
5. Vitest rodando
6. .env.example documentado
7. .gitignore seguro

### Project Structure Notes

- Alinhamento total com a estrutura definida em `architecture.md` seção "Complete Project Directory Structure"
- Pastas vazias usam `.gitkeep` para serem versionadas no git
- `src/app/` já é criada pelo `create-next-app` — não duplicar
- `e2e/` fica na raiz do projeto, fora de `src/`

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Starter Template Evaluation]
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/architecture.md#Core Architectural Decisions — Result Pattern]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1: Inicialização do Projeto e Estrutura Base]
- [Source: _bmad-output/planning-artifacts/prd.md#Requisitos Específicos — Web App Responsiva]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

- create-next-app criado em /tmp e copiado via rsync para preservar repo git existente
- .gitignore ajustado: `.env*` (padrão do create-next-app) substituído por `.env`, `.env.local`, `.env*.local` para permitir versionamento do `.env.example`
- package.json nome corrigido de `caderninho-next` para `caderninho`

### Completion Notes List

- Next.js 16.1.6 + TypeScript 5.9.3 + Tailwind CSS v4 + React 19.2.3 instalados e funcionando
- Turbopack é o bundler padrão (confirmado)
- Estrutura Clean Architecture + DDD criada com todas as pastas e .gitkeep
- Path aliases configurados no tsconfig.json (@/*, @/server/*, @/client/*, @/shared/*, @/app/*)
- Result<T> implementado seguindo TDD (3 testes: sucesso, erro, erro com details)
- Vitest 4.1.0 configurado com globals e path aliases
- .env.example com todas as variáveis documentadas
- .gitignore seguro (`.env`, `.env.local`, `.env*.local`)
- Validação final: dev OK, build OK, test OK (3/3 passed), lint OK, tsc OK

### Change Log

- 2026-03-16: Story 1.1 implementada — fundação estrutural do projeto Caderninho

### File List

- package.json (novo)
- package-lock.json (novo)
- tsconfig.json (novo, modificado com path aliases)
- next.config.ts (novo)
- next-env.d.ts (novo)
- eslint.config.mjs (novo)
- postcss.config.mjs (novo)
- vitest.config.ts (novo)
- .gitignore (novo, ajustado)
- .env.example (novo)
- src/app/globals.css (novo)
- src/app/layout.tsx (novo)
- src/app/page.tsx (novo)
- src/app/favicon.ico (novo)
- src/shared/types/result.ts (novo)
- src/shared/types/index.ts (novo)
- src/shared/types/result.test.ts (novo)
- src/shared/schemas/.gitkeep (novo)
- src/shared/constants/.gitkeep (novo)
- src/server/domain/.gitkeep (novo)
- src/server/infrastructure/.gitkeep (novo)
- src/server/actions/.gitkeep (novo)
- src/client/components/ui/.gitkeep (novo)
- src/client/hooks/.gitkeep (novo)
- src/client/utils/.gitkeep (novo)
- e2e/.gitkeep (novo)
- public/file.svg (novo)
- public/globe.svg (novo)
- public/next.svg (novo)
- public/vercel.svg (novo)
- public/window.svg (novo)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modificado)
- _bmad-output/implementation-artifacts/1-1-inicializacao-do-projeto-e-estrutura-base.md (modificado)
