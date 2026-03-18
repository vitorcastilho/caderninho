ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "audit_logs_insert_only" ON "audit_logs" AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);--> statement-breakpoint

-- Story 1.6: Audit logs immutability — FORCE RLS + trigger defense-in-depth
-- FORCE RLS applies to table owner (non-superuser owners).
-- Trigger prevents UPDATE/DELETE even from superuser connections.

ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;--> statement-breakpoint

CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs table is immutable: % operations are not allowed', TG_OP;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint

CREATE TRIGGER no_audit_log_mutation
  BEFORE UPDATE OR DELETE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();