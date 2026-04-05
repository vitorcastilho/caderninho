CREATE TABLE "establishments" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"emoji" text DEFAULT '📍' NOT NULL,
	"subcategory_id" text NOT NULL,
	"source" text NOT NULL,
	"visit_count" integer DEFAULT 0 NOT NULL,
	"last_visit_at" timestamp with time zone,
	"status" text DEFAULT 'active' NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "establishments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "establishments" ADD CONSTRAINT "establishments_subcategory_id_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."subcategories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "establishments" ADD CONSTRAINT "establishments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "establishments_org_isolation" ON "establishments" AS PERMISSIVE FOR ALL TO public USING (organization_id = current_setting('app.organization_id', true));--> statement-breakpoint
UPDATE "categories" SET "default_payment_method_type" = 'credit' WHERE "default_payment_method_type" = 'credit_card';--> statement-breakpoint
UPDATE "subcategories" SET "default_payment_method_type" = 'credit' WHERE "default_payment_method_type" = 'credit_card';