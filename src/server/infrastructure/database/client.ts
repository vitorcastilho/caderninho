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

// Configuração para Vercel (serverless) + pooler do Supabase em modo transação
// (porta 6543). Cada instância da função mantém seu próprio pool:
// - max: poucas conexões por instância (o pooler multiplexa entre instâncias)
// - idle_timeout: devolve conexões ociosas em vez de segurá-las indefinidamente
// - prepare: false: o modo transação não suporta prepared statements
// Em dev (Postgres local direto) essas opções também funcionam.
const client =
  globalForDb.pgClient ??
  postgres(connectionString, {
    max: 3,
    idle_timeout: 20,
    prepare: false,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pgClient = client;
}

export const db = drizzle(client, { schema });

export type DbExecutor = Pick<typeof db, 'insert' | 'update' | 'delete' | 'select'>;
