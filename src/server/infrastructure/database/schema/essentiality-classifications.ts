import { sql } from 'drizzle-orm';
import { pgTable, pgPolicy, text, integer, timestamp } from 'drizzle-orm/pg-core';

import { organizations } from './organizations';

export const essentialityClassifications = pgTable('essentiality_classifications', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  displayOrder: integer('display_order').notNull(),
  status: text('status').notNull().default('active'),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, () => [
  pgPolicy('essentiality_classifications_org_isolation', {
    for: 'all',
    using: sql`organization_id = current_setting('app.organization_id', true)`,
  }),
]);
