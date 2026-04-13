ALTER TABLE "transactions" ALTER COLUMN "category_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "payment_method_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "income_source_id" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "source_account_id" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "destination_account_id" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_income_source_id_income_sources_id_fk" FOREIGN KEY ("income_source_id") REFERENCES "public"."income_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_source_account_id_bank_accounts_id_fk" FOREIGN KEY ("source_account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_destination_account_id_bank_accounts_id_fk" FOREIGN KEY ("destination_account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE no action ON UPDATE no action;