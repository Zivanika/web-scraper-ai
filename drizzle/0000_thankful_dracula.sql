CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"website_url" text NOT NULL,
	"question" text NOT NULL,
	"status" text NOT NULL,
	"scraped_content" text,
	"ai_answer" text,
	"error_message" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
