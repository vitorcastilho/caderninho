import { sql } from 'drizzle-orm';
import { pgTable, pgPolicy, text, integer, timestamp, date } from 'drizzle-orm/pg-core';

import { organizations } from './organizations';

export const investments = pgTable('investments', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  institution: text('institution').notNull(),
  type: text('type').notNull(), // 'renda_fixa' | 'renda_variavel' | 'reserva'
  balanceCents: integer('balance_cents').notNull(),
  yieldRateBasisPoints: integer('yield_rate_basis_points'), // nullable — só para renda_fixa e reserva
  lastBalanceUpdate: timestamp('last_balance_update', { withTimezone: true }).notNull().defaultNow(),
  maturityDate: date('maturity_date'), // nullable
  status: text('status').notNull().default('active'),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, () => [
  pgPolicy('investments_org_isolation', {
    for: 'all',
    using: sql`organization_id = current_setting('app.organization_id', true)`,
  }),
]);
