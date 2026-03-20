import { sql } from 'drizzle-orm';
import { pgTable, pgPolicy, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

import { organizations } from './organizations';

export const incomeSources = pgTable('income_sources', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  employmentType: text('employment_type').notNull(), // 'pj_propria' | 'clt' | 'freelance' | 'outro'
  isRecurring: boolean('is_recurring').notNull().default(true),
  baseAmountCents: integer('base_amount_cents'), // nullable
  usualPaymentDay: integer('usual_payment_day'), // nullable, 1-31
  status: text('status').notNull().default('active'),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, () => [
  pgPolicy('income_sources_org_isolation', {
    for: 'all',
    using: sql`organization_id = current_setting('app.organization_id', true)`,
  }),
]);
