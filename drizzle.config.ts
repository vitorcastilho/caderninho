import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Story 1.13: o `.env.local` prevalece sobre um DATABASE_URL exportado no shell
// (mesma regra do `db:migrate`). Pelo pooler local (54329) o drizzle-kit funciona
// com o `max: 1` dele: uma só conexão.
config({ path: '.env.local', override: true, quiet: true });

export default defineConfig({
  out: './src/server/infrastructure/database/migrations',
  schema: './src/server/infrastructure/database/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
