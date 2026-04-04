import { sql } from 'drizzle-orm';
import { pgTable, pgPolicy, text, integer, timestamp } from 'drizzle-orm/pg-core';

import { organizations } from './organizations';
import { subcategories } from './subcategories';

export const establishments = pgTable('establishments', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  emoji: text('emoji').notNull().default('📍'),
  subcategoryId: text('subcategory_id')
    .notNull()
    .references(() => subcategories.id),
  source: text('source').notNull(),
  visitCount: integer('visit_count').notNull().default(0),
  lastVisitAt: timestamp('last_visit_at', { withTimezone: true }),
  status: text('status').notNull().default('active'),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, () => [
  pgPolicy('establishments_org_isolation', {
    for: 'all',
    using: sql`organization_id = current_setting('app.organization_id', true)`,
  }),
]);
