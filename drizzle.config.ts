import { existsSync, readFileSync } from 'node:fs';

import { defineConfig } from 'drizzle-kit';

import { drizzleKitCredentials } from './scripts/lib/migrate-env';

// Story 1.13: o drizzle-kit (`db:push`, `db:studio`) só fala com o banco local —
// URL do `.env.local` (um DATABASE_URL do shell é ignorado) e pelo pooler 54329,
// com as mesmas recusas do `db:migrate --env local`. A URL só é lida quando usada:
// o `db:generate` não conecta no banco e funciona sem `.env.local`. Pelo pooler o
// drizzle-kit funciona com o `max: 1` dele: uma só conexão.
const ENV_LOCAL = '.env.local';

export default defineConfig({
  out: './src/server/infrastructure/database/migrations',
  schema: './src/server/infrastructure/database/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: drizzleKitCredentials(
    () => (existsSync(ENV_LOCAL) ? readFileSync(ENV_LOCAL, 'utf8') : undefined),
    process.env,
  ),
});
