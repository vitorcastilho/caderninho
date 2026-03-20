import { config } from 'dotenv';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Use max: 1 for migrations — required by postgres.js for transactional DDL
const migrationClient = postgres(connectionString, { max: 1 });
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
