import { existsSync, readFileSync } from 'node:fs';

import { parse } from 'dotenv';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

import {
  parseMigrateArgs,
  envFileFor,
  describeTarget,
  checkTarget,
  resolveDatabaseUrl,
  type MigrateArgs,
} from './lib/migrate-env';

// Uso (Story 1.13):
//   npm run db:migrate                                   → .env.local (padrão)
//   npm run db:migrate -- --env staging                  → .env.staging.local
//   npm run db:migrate -- --env production --confirm-production
// Fora do CI a URL vem só do arquivo do ambiente (nunca do shell). No CI não há
// arquivo: o DATABASE_URL vem da variável do job (secret do repositório).
let args: MigrateArgs;
try {
  args = parseMigrateArgs(process.argv.slice(2));
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}

const envFile = envFileFor(args.env);
const resolved = resolveDatabaseUrl({
  env: args.env,
  fileValue: existsSync(envFile) ? parse(readFileSync(envFile)).DATABASE_URL : undefined,
  shellValue: process.env.DATABASE_URL,
  isCi: process.env.CI === 'true',
});

if (!resolved.ok) {
  console.error(`Migration cancelada: ${resolved.reason}`);
  process.exit(1);
}

const connectionString = resolved.url;
const check = checkTarget(args, connectionString, resolved.source);

if (!check.ok) {
  console.error(`Migration cancelada: ${check.reason}`);
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
