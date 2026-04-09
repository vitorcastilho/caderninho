import { sql } from 'drizzle-orm';
import { pgTable, pgPolicy, text, integer, timestamp } from 'drizzle-orm/pg-core';

import { organizations } from './organizations';
import { categories } from './categories';
import { subcategories } from './subcategories';

export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // expense, income, transfer
  amountCents: integer('amount_cents').notNull(),
  categoryId: text('category_id')
    .notNull()
    .references(() => categories.id),
  subcategoryId: text('subcategory_id')
    .references(() => subcategories.id),
  establishment: text('establishment'),
  paymentMethodType: text('payment_method_type').notNull(), // debit, credit, pix
  paymentMethodId: text('payment_method_id'),
  installments: integer('installments'),
  description: text('description'),
  transactionDate: timestamp('transaction_date', { withTimezone: true }).notNull().defaultNow(),
  referenceMonth: text('reference_month'), // YYYY-MM (para cartoes de credito, Epic 5)
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, () => [
  pgPolicy('transactions_org_isolation', {
    for: 'all',
    using: sql`organization_id = current_setting('app.organization_id', true)`,
  }),
]);
