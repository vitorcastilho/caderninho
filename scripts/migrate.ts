import { config } from 'dotenv';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

import { parseMigrateArgs, envFileFor, describeTarget, checkTarget, type MigrateArgs } from './lib/migrate-env';

// Uso (Story 1.13):
//   npm run db:migrate                                   → .env.local (padrão)
//   npm run db:migrate -- --env staging                  → .env.staging.local
//   npm run db:migrate -- --env production --confirm-production
// No CI não há arquivo: o DATABASE_URL vem do secret do environment do GitHub.
let args: MigrateArgs;
try {
  args = parseMigrateArgs(process.argv.slice(2));
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}

// O arquivo do ambiente prevalece sobre variáveis já definidas no shell.
config({ path: envFileFor(args.env), override: true, quiet: true });

const connectionString = process.env.DATABASE_URL;
const check = checkTarget(args, connectionString);

if (!check.ok || !connectionString) {
  console.error(`Migration cancelada: ${check.ok ? 'DATABASE_URL ausente' : check.reason}`);
  process.exit(1);
}

console.log(`Destino: ${describeTarget(args.env, connectionString)}`);

// max: 1 — exigido pelo postgres.js para DDL transacional.
// prepare: false — o pooler em modo transação (6543 remoto, 54329 local) não
// suporta prepared statements (Story 1.10).
const migrationClient = postgres(connectionString, { max: 1, prepare: false, onnotice: () => {} });
const db = drizzle(migrationClient);

async function main() {
  console.log('Running migrations...');
  await migrate(db, {
    migrationsFolder: './src/server/infrastructure/database/migrations',
  });
  console.log('Migrations applied successfully!');
  await migrationClient.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
