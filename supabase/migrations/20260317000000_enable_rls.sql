-- Enable Row Level Security on all tables
-- Story 1.3: Base RLS policies for tenant isolation
-- NOTE: Drizzle ORM connects as postgres (superuser) which bypasses RLS.
-- RLS protects against direct access via Supabase client (browser → Supabase Realtime).
-- Application-level authorization middleware is the second layer (Story 1.6).

-- ============================================
-- Enable RLS on all tables
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

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

-- Verifications: can only see their own verification tokens
CREATE POLICY "verifications_select_own" ON verifications
  FOR SELECT USING (auth.uid()::text = identifier);

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

-- ============================================
-- Audit logs: INSERT only, no direct user access
-- ============================================

-- audit_logs: service role can insert, no user SELECT/UPDATE/DELETE
CREATE POLICY "audit_logs_insert_service" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- NOTE: No SELECT policy for regular users.
-- Admin access and granular permissions will be implemented in Epic 8.
-- Complete permission checks (admin vs member roles) come in Story 1.4+.
