/**
 * Task Types for Web Scraping + AI Q&A Application
 * 
 * === DRIZZLE ORM MIGRATION NOTES ===
 * To migrate to Drizzle ORM:
 * 
 * 1. Install dependencies:
 *    npm install drizzle-orm pg @types/pg
 *    npm install -D drizzle-kit
 * 
 * 2. Create schema file (src/db/schema.ts):
 *    import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
 *    
 *    export const taskStatusEnum = pgEnum('task_status', ['pending', 'processing', 'completed', 'failed']);
 *    
 *    export const tasks = pgTable('tasks', {
 *      id: uuid('id').defaultRandom().primaryKey(),
 *      websiteUrl: text('website_url').notNull(),
 *      question: text('question').notNull(),
 *      status: taskStatusEnum('status').default('pending').notNull(),
 *      scrapedContent: text('scraped_content'),
 *      aiAnswer: text('ai_answer'),
 *      errorMessage: text('error_message'),
 *      createdAt: timestamp('created_at').defaultNow().notNull(),
 *      updatedAt: timestamp('updated_at').defaultNow().notNull(),
 *    });
 * 
 * 3. Setup Drizzle config (drizzle.config.ts):
 *    import { defineConfig } from 'drizzle-kit';
 *    export default defineConfig({
 *      schema: './src/db/schema.ts',
 *      out: './drizzle',
 *      dialect: 'postgresql',
 *      dbCredentials: { connectionString: process.env.DATABASE_URL! },
 *    });
 * 
 * === END DRIZZLE NOTES ===
 */

export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Task {
  id: string;
  websiteUrl: string;
  question: string;
  status: TaskStatus;
  scrapedContent?: string;
  aiAnswer?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  websiteUrl: string;
  question: string;
}
