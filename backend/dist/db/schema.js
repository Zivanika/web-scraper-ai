"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasks = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.tasks = (0, pg_core_1.pgTable)("tasks", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    websiteUrl: (0, pg_core_1.text)("website_url").notNull(),
    question: (0, pg_core_1.text)("question").notNull(),
    status: (0, pg_core_1.text)("status").notNull(),
    scrapedContent: (0, pg_core_1.text)("scraped_content"),
    aiAnswer: (0, pg_core_1.text)("ai_answer"),
    errorMessage: (0, pg_core_1.text)("error_message"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
