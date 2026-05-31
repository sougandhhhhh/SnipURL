import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  name: text('name'),
  passwordHash: text('password_hash'),
  createdAt: integer('created_at').notNull()
});

export const links = sqliteTable('links', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  shortCode: text('short_code').unique().notNull(),
  longUrl: text('long_url').notNull(),
  customAlias: text('custom_alias').unique(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  isOneTime: integer('is_one_time', { mode: 'boolean' }).default(false).notNull(),
  batchId: text('batch_id'),
  password: text('password'),
  expiresAt: integer('expires_at'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull()
});

export const analytics = sqliteTable('analytics', {
  id: text('id').primaryKey(),
  linkId: text('link_id').references(() => links.id, { onDelete: 'cascade' }).notNull(),
  clickedAt: integer('clicked_at').notNull(),
  ipAddress: text('ip_address').notNull(),
  country: text('country').default('Unknown').notNull(),
  device: text('device').default('Desktop').notNull(),
  browser: text('browser').default('Unknown').notNull(),
  referrer: text('referrer').default('Direct').notNull()
});

export const apiKeys = sqliteTable('api_keys', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  keyHash: text('key_hash').unique().notNull(),
  name: text('name').default('Default API Key').notNull(),
  createdAt: integer('created_at').notNull(),
  lastUsedAt: integer('last_used_at')
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: text('token').unique().notNull(),
  expiresAt: integer('expires_at').notNull()
});
