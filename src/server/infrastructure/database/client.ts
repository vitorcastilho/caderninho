import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Prevent connection pool leaks during Next.js hot-reload in dev mode.
// Without this, each hot-reload creates a new pool without closing the previous one,
// accumulating idle connections in PostgreSQL.
const globalForDb = globalThis as unknown as {
  pgClient: ReturnType<typeof postgres> | undefined;
};

const client = globalForDb.pgClient ?? postgres(connectionString);

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pgClient = client;
}

export const db = drizzle(client, { schema });
