import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const workspaces = sqliteTable('workspaces', {
  id: text('id').primaryKey(), ownerId: text('owner_id').notNull(), name: text('name').notNull(), slug: text('slug').notNull().unique(), brandColor: text('brand_color').notNull().default('#d9f75b'), createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

export const forms = sqliteTable('forms', {
  id: text('id').primaryKey(), workspaceId: text('workspace_id').notNull().references(() => workspaces.id), title: text('title').notNull(), slug: text('slug').notNull().unique(), intro: text('intro'), isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true), createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

export const requests = sqliteTable('requests', {
  id: text('id').primaryKey(), workspaceId: text('workspace_id').notNull().references(() => workspaces.id), formId: text('form_id').notNull().references(() => forms.id), clientName: text('client_name').notNull(), clientEmail: text('client_email'), projectName: text('project_name'), status: text('status', { enum: ['draft', 'sent', 'viewed', 'completed'] }).notNull().default('draft'), createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

export const testimonials = sqliteTable('testimonials', {
  id: text('id').primaryKey(), workspaceId: text('workspace_id').notNull().references(() => workspaces.id), formId: text('form_id').notNull().references(() => forms.id), requestId: text('request_id').references(() => requests.id), authorName: text('author_name').notNull(), authorRole: text('author_role').notNull(), quote: text('quote').notNull(), rating: integer('rating').notNull(), consent: integer('consent', { mode: 'boolean' }).notNull().default(false), status: text('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'), createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

export const widgets = sqliteTable('widgets', {
  id: text('id').primaryKey(), workspaceId: text('workspace_id').notNull().references(() => workspaces.id), name: text('name').notNull(), layout: text('layout', { enum: ['grid', 'carousel', 'single'] }).notNull().default('carousel'), theme: text('theme', { enum: ['light', 'dark'] }).notNull().default('light'), isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(false), createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});
