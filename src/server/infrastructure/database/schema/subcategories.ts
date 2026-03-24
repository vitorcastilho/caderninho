import { sql } from 'drizzle-orm';
import { pgTable, pgPolicy, text, timestamp } from 'drizzle-orm/pg-core';

import { organizations } from './organizations';
import { categories } from './categories';

export const subcategories = pgTable('subcategories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  categoryId: text('category_id')
    .notNull()
    .references(() => categories.id),
  defaultPaymentMethodType: text('default_payment_method_type'),
  defaultPaymentMethodId: text('default_payment_method_id'),
  status: text('status').notNull().default('active'),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, () => [
  pgPolicy('subcategories_org_isolation', {
    for: 'all',
    using: sql`organization_id = current_setting('app.organization_id', true)`,
  }),
]);
