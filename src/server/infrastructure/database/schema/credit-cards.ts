import { sql } from 'drizzle-orm';
import { pgTable, pgPolicy, text, integer, timestamp } from 'drizzle-orm/pg-core';

import { organizations } from './organizations';

export const creditCards = pgTable('credit_cards', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  brand: text('brand').notNull(),
  limitCents: integer('limit_cents').notNull(),
  closingDay: integer('closing_day').notNull(),
  dueDay: integer('due_day').notNull(),
  status: text('status').notNull().default('active'),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, () => [
  pgPolicy('credit_cards_org_isolation', {
    for: 'all',
    using: sql`organization_id = current_setting('app.organization_id', true)`,
  }),
]);
