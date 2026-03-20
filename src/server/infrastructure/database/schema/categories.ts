import { sql } from 'drizzle-orm';
import { pgTable, pgPolicy, text, integer, timestamp } from 'drizzle-orm/pg-core';

import { organizations } from './organizations';
import { essentialityClassifications } from './essentiality-classifications';

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  classificationId: text('classification_id')
    .notNull()
    .references(() => essentialityClassifications.id),
  budgetMinCents: integer('budget_min_cents'),
  budgetMaxCents: integer('budget_max_cents'),
  status: text('status').notNull().default('active'),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, () => [
  pgPolicy('categories_org_isolation', {
    for: 'all',
    using: sql`organization_id = current_setting('app.organization_id', true)`,
  }),
]);
