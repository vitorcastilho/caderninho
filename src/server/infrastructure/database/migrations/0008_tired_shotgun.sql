CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"classification_id" text NOT NULL,
	"budget_min_cents" integer,
	"budget_max_cents" integer,
	"status" text DEFAULT 'active' NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "essentiality_classifications" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"display_order" integer NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "essentiality_classifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "subcategories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subcategories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_classification_id_essentiality_classifications_id_fk" FOREIGN KEY ("classification_id") REFERENCES "public"."essentiality_classifications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "essentiality_classifications" ADD CONSTRAINT "essentiality_classifications_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "categories_org_isolation" ON "categories" AS PERMISSIVE FOR ALL TO public USING (organization_id = current_setting('app.organization_id', true));--> statement-breakpoint
CREATE POLICY "essentiality_classifications_org_isolation" ON "essentiality_classifications" AS PERMISSIVE FOR ALL TO public USING (organization_id = current_setting('app.organization_id', true));--> statement-breakpoint
CREATE POLICY "subcategories_org_isolation" ON "subcategories" AS PERMISSIVE FOR ALL TO public USING (organization_id = current_setting('app.organization_id', true));