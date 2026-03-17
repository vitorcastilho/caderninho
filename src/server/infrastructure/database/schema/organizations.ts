import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { users } from './auth';

export const organizations = pgTable('organizations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique(),
  logo: text('logo'),
  metadata: text('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const members = pgTable('members', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  role: text('role').notNull().default('member'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const invitations = pgTable('invitations', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  inviterId: text('inviter_id')
    .notNull()
    .references(() => users.id),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id),
  role: text('role').notNull().default('member'),
  status: text('status').notNull().default('pending'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
