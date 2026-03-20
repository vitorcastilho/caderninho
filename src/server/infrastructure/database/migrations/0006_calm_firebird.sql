CREATE TABLE "investments" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"institution" text NOT NULL,
	"type" text NOT NULL,
	"balance_cents" integer NOT NULL,
	"yield_rate_basis_points" integer,
	"last_balance_update" timestamp with time zone DEFAULT now() NOT NULL,
	"maturity_date" date,
	"status" text DEFAULT 'active' NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "investments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "investments" ADD CONSTRAINT "investments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "investments_org_isolation" ON "investments" AS PERMISSIVE FOR ALL TO public USING (organization_id = current_setting('app.organization_id', true));