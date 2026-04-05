ALTER TABLE "categories" ADD COLUMN "emoji" text DEFAULT '📁' NOT NULL;--> statement-breakpoint
ALTER TABLE "subcategories" ADD COLUMN "emoji" text DEFAULT '📋' NOT NULL;