-- Fix code review findings for Story 1.3
-- R1 findings: HIGH severity RLS fix + LOW severity FK constraint

-- ============================================
-- [HIGH] Fix audit_logs INSERT policy: restrict to service_role
-- Previous policy allowed any role to insert (WITH CHECK (true))
-- ============================================

DROP POLICY IF EXISTS "audit_logs_insert_service" ON audit_logs;

CREATE POLICY "audit_logs_insert_service" ON audit_logs
  FOR INSERT TO service_role WITH CHECK (true);

-- ============================================
-- [LOW] Add FK constraint: sessions.active_organization_id → organizations.id
-- Cannot be declared in Drizzle schema due to circular dependency
-- (auth.ts ↔ organizations.ts), so enforced at DB level via migration.
-- ============================================

ALTER TABLE sessions
  ADD CONSTRAINT sessions_active_organization_id_fk
  FOREIGN KEY (active_organization_id) REFERENCES organizations(id);
