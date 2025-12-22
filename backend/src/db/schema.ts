import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  websiteUrl: text("website_url").notNull(),
  question: text("question").notNull(),
  status: text("status").notNull(),
  scrapedContent: text("scraped_content"),
  aiAnswer: text("ai_answer"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
