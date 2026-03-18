-- Story 1.3: Review R2 fixes — unique constraint + consolidated RLS setup
-- Moved from supabase/migrations/ to Drizzle migrations to fix ordering issue:
-- On fresh setup, supabase start applied RLS before tables existed (Drizzle creates tables).
-- Now RLS runs after table creation as part of the same migration pipeline.

-- ============================================
-- Schema constraint fix
-- ============================================

ALTER TABLE "members" ADD CONSTRAINT "members_user_org_unique" UNIQUE("user_id","organization_id");
--> statement-breakpoint

-- ============================================
-- FK constraint: sessions.active_organization_id → organizations.id
-- Cannot be declared in Drizzle schema due to circular dependency
-- (auth.ts ↔ organizations.ts), so enforced at DB level via migration.
-- ============================================

ALTER TABLE sessions
  ADD CONSTRAINT sessions_active_organization_id_fk
  FOREIGN KEY (active_organization_id) REFERENCES organizations(id);
--> statement-breakpoint

-- ============================================
-- Enable Row Level Security on all tables
-- ============================================
-- NOTE: Drizzle ORM connects as postgres (superuser) which bypasses RLS.
-- RLS protects against direct access via Supabase client (browser -> Supabase Realtime).
-- Application-level authorization middleware is the second layer (Story 1.6).
--
-- DEPENDENCY: RLS policies below use auth.uid() which is a Supabase Auth function.
-- This project uses Better Auth (not Supabase Auth), so these policies are
-- NON-FUNCTIONAL until JWT integration is configured in Story 1.4+.
-- The function auth.uid() will need to be mapped to Better Auth's session token
-- or replaced with a custom function. Until then, RLS is enabled (blocking all
-- non-superuser access by default) which is the safe default behavior.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

-- ============================================
-- Auth tables: users can only access their own data
-- ============================================

-- Users: can only see/modify their own profile
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid()::text = id);

-- Sessions: can only see/modify their own sessions
CREATE POLICY "sessions_select_own" ON sessions
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "sessions_delete_own" ON sessions
  FOR DELETE USING (auth.uid()::text = user_id);

-- Accounts: can only see their own provider accounts
CREATE POLICY "accounts_select_own" ON accounts
  FOR SELECT USING (auth.uid()::text = user_id);

-- Verifications: RLS enabled without SELECT policy = all SELECT blocked for
-- non-superuser connections. This is the desired behavior — verification tokens
-- are managed server-side only. No policy needed.
-- (Previous policy compared auth.uid()::text with identifier which is email/phone,
-- not a UUID — comparison would never match.)
--> statement-breakpoint

-- ============================================
-- Organization tables: isolation by membership
-- ============================================

-- Organizations: can only see organizations where user is a member
CREATE POLICY "organizations_select_member" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.organization_id = organizations.id
        AND members.user_id = auth.uid()::text
    )
  );

-- Members: can only see memberships in their own organizations
CREATE POLICY "members_select_own" ON members
  FOR SELECT USING (user_id = auth.uid()::text);

-- Invitations: can only see invitations for their organizations
CREATE POLICY "invitations_select_member" ON invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.organization_id = invitations.organization_id
        AND members.user_id = auth.uid()::text
    )
  );
--> statement-breakpoint

-- ============================================
-- Audit logs: INSERT only for service_role, no direct user access
-- ============================================

CREATE POLICY "audit_logs_insert_service" ON audit_logs
  FOR INSERT TO service_role WITH CHECK (true);

-- NOTE: No SELECT policy for regular users.
-- Admin access and granular permissions will be implemented in Epic 8.
-- Complete permission checks (admin vs member roles) come in Story 1.4+.
