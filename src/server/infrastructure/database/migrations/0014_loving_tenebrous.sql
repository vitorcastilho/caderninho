ALTER TABLE "establishments" ADD COLUMN "default_payment_method_type" text;--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "default_payment_method_id" text;--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "budget_min_cents" integer;--> statement-breakpoint
ALTER TABLE "establishments" ADD COLUMN "budget_max_cents" integer;