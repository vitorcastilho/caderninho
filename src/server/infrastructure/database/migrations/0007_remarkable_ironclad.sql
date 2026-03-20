CREATE TABLE "income_sources" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"employment_type" text NOT NULL,
	"is_recurring" boolean DEFAULT true NOT NULL,
	"base_amount_cents" integer,
	"usual_payment_day" integer,
	"status" text DEFAULT 'active' NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "income_sources" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "income_sources" ADD CONSTRAINT "income_sources_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "income_sources_org_isolation" ON "income_sources" AS PERMISSIVE FOR ALL TO public USING (organization_id = current_setting('app.organization_id', true));