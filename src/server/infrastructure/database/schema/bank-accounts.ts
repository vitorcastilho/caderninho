import { sql } from 'drizzle-orm';
import { pgTable, pgPolicy, text, integer, timestamp } from 'drizzle-orm/pg-core';

import { organizations } from './organizations';

export const bankAccounts = pgTable('bank_accounts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  bank: text('bank').notNull(),
  balanceCents: integer('balance_cents').notNull().default(0),
  status: text('status').notNull().default('active'),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, () => [
  pgPolicy('bank_accounts_org_isolation', {
    for: 'all',
    using: sql`organization_id = current_setting('app.organization_id', true)`,
  }),
]);
