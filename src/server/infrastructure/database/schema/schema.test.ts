import { getTableName, getTableColumns } from 'drizzle-orm';

import {
  users,
  sessions,
  accounts,
  verifications,
  organizations,
  members,
  invitations,
  auditLogs,
} from './index';

describe('Database Schemas', () => {
  describe('Auth tables', () => {
    it('should define users table with correct name and columns', () => {
      expect(getTableName(users)).toBe('users');

      const columns = getTableColumns(users);
      expect(columns.id).toBeDefined();
      expect(columns.name).toBeDefined();
      expect(columns.email).toBeDefined();
      expect(columns.emailVerified).toBeDefined();
      expect(columns.image).toBeDefined();
      expect(columns.createdAt).toBeDefined();
      expect(columns.updatedAt).toBeDefined();
    });

    it('should enforce constraints on users table', () => {
      const columns = getTableColumns(users);
      expect(columns.id.primary).toBe(true);
      expect(columns.name.notNull).toBe(true);
      expect(columns.email.notNull).toBe(true);
      expect(columns.email.isUnique).toBe(true);
      expect(columns.emailVerified.notNull).toBe(true);
      expect(columns.emailVerified.hasDefault).toBe(true);
      expect(columns.image.notNull).toBe(false);
      expect(columns.createdAt.notNull).toBe(true);
      expect(columns.createdAt.hasDefault).toBe(true);
      expect(columns.updatedAt.notNull).toBe(true);
      expect(columns.updatedAt.hasDefault).toBe(true);
    });

    it('should define sessions table with correct name and columns', () => {
      expect(getTableName(sessions)).toBe('sessions');

      const columns = getTableColumns(sessions);
      expect(columns.id).toBeDefined();
      expect(columns.userId).toBeDefined();
      expect(columns.token).toBeDefined();
      expect(columns.expiresAt).toBeDefined();
      expect(columns.ipAddress).toBeDefined();
      expect(columns.userAgent).toBeDefined();
      expect(columns.activeOrganizationId).toBeDefined();
      expect(columns.createdAt).toBeDefined();
      expect(columns.updatedAt).toBeDefined();
    });

    it('should enforce constraints on sessions table', () => {
      const columns = getTableColumns(sessions);
      expect(columns.id.primary).toBe(true);
      expect(columns.userId.notNull).toBe(true);
      expect(columns.token.notNull).toBe(true);
      expect(columns.token.isUnique).toBe(true);
      expect(columns.expiresAt.notNull).toBe(true);
      expect(columns.ipAddress.notNull).toBe(false);
      expect(columns.userAgent.notNull).toBe(false);
      expect(columns.activeOrganizationId.notNull).toBe(false);
      expect(columns.createdAt.hasDefault).toBe(true);
      expect(columns.updatedAt.hasDefault).toBe(true);
    });

    it('should define accounts table with correct name and columns', () => {
      expect(getTableName(accounts)).toBe('accounts');

      const columns = getTableColumns(accounts);
      expect(columns.id).toBeDefined();
      expect(columns.userId).toBeDefined();
      expect(columns.accountId).toBeDefined();
      expect(columns.providerId).toBeDefined();
      expect(columns.accessToken).toBeDefined();
      expect(columns.refreshToken).toBeDefined();
      expect(columns.accessTokenExpiresAt).toBeDefined();
      expect(columns.refreshTokenExpiresAt).toBeDefined();
      expect(columns.scope).toBeDefined();
      expect(columns.idToken).toBeDefined();
      expect(columns.password).toBeDefined();
      expect(columns.createdAt).toBeDefined();
      expect(columns.updatedAt).toBeDefined();
    });

    it('should enforce constraints on accounts table', () => {
      const columns = getTableColumns(accounts);
      expect(columns.id.primary).toBe(true);
      expect(columns.userId.notNull).toBe(true);
      expect(columns.accountId.notNull).toBe(true);
      expect(columns.providerId.notNull).toBe(true);
      expect(columns.accessToken.notNull).toBe(false);
      expect(columns.refreshToken.notNull).toBe(false);
      expect(columns.password.notNull).toBe(false);
      expect(columns.createdAt.hasDefault).toBe(true);
      expect(columns.updatedAt.hasDefault).toBe(true);
    });

    it('should define verifications table with correct name and columns', () => {
      expect(getTableName(verifications)).toBe('verifications');

      const columns = getTableColumns(verifications);
      expect(columns.id).toBeDefined();
      expect(columns.identifier).toBeDefined();
      expect(columns.value).toBeDefined();
      expect(columns.expiresAt).toBeDefined();
      expect(columns.createdAt).toBeDefined();
      expect(columns.updatedAt).toBeDefined();
    });

    it('should enforce constraints on verifications table', () => {
      const columns = getTableColumns(verifications);
      expect(columns.id.primary).toBe(true);
      expect(columns.identifier.notNull).toBe(true);
      expect(columns.value.notNull).toBe(true);
      expect(columns.expiresAt.notNull).toBe(true);
      expect(columns.createdAt.hasDefault).toBe(true);
      expect(columns.updatedAt.hasDefault).toBe(true);
    });
  });

  describe('Organization tables', () => {
    it('should define organizations table with correct name and columns', () => {
      expect(getTableName(organizations)).toBe('organizations');

      const columns = getTableColumns(organizations);
      expect(columns.id).toBeDefined();
      expect(columns.name).toBeDefined();
      expect(columns.slug).toBeDefined();
      expect(columns.logo).toBeDefined();
      expect(columns.metadata).toBeDefined();
      expect(columns.createdAt).toBeDefined();
    });

    it('should enforce constraints on organizations table', () => {
      const columns = getTableColumns(organizations);
      expect(columns.id.primary).toBe(true);
      expect(columns.name.notNull).toBe(true);
      expect(columns.slug.isUnique).toBe(true);
      expect(columns.slug.notNull).toBe(false);
      expect(columns.logo.notNull).toBe(false);
      expect(columns.metadata.notNull).toBe(false);
      expect(columns.createdAt.hasDefault).toBe(true);
    });

    it('should define members table with correct name and columns', () => {
      expect(getTableName(members)).toBe('members');

      const columns = getTableColumns(members);
      expect(columns.id).toBeDefined();
      expect(columns.userId).toBeDefined();
      expect(columns.organizationId).toBeDefined();
      expect(columns.role).toBeDefined();
      expect(columns.createdAt).toBeDefined();
    });

    it('should enforce constraints on members table', () => {
      const columns = getTableColumns(members);
      expect(columns.id.primary).toBe(true);
      expect(columns.userId.notNull).toBe(true);
      expect(columns.organizationId.notNull).toBe(true);
      expect(columns.role.notNull).toBe(true);
      expect(columns.role.hasDefault).toBe(true);
      expect(columns.createdAt.hasDefault).toBe(true);
    });

    it('should define invitations table with correct name and columns', () => {
      expect(getTableName(invitations)).toBe('invitations');

      const columns = getTableColumns(invitations);
      expect(columns.id).toBeDefined();
      expect(columns.email).toBeDefined();
      expect(columns.inviterId).toBeDefined();
      expect(columns.organizationId).toBeDefined();
      expect(columns.role).toBeDefined();
      expect(columns.status).toBeDefined();
      expect(columns.expiresAt).toBeDefined();
      expect(columns.createdAt).toBeDefined();
    });

    it('should enforce constraints on invitations table', () => {
      const columns = getTableColumns(invitations);
      expect(columns.id.primary).toBe(true);
      expect(columns.email.notNull).toBe(true);
      expect(columns.inviterId.notNull).toBe(true);
      expect(columns.organizationId.notNull).toBe(true);
      expect(columns.role.notNull).toBe(true);
      expect(columns.role.hasDefault).toBe(true);
      expect(columns.status.notNull).toBe(true);
      expect(columns.status.hasDefault).toBe(true);
      expect(columns.expiresAt.notNull).toBe(true);
      expect(columns.createdAt.hasDefault).toBe(true);
    });
  });

  describe('Audit table', () => {
    it('should define audit_logs table with correct name and columns', () => {
      expect(getTableName(auditLogs)).toBe('audit_logs');

      const columns = getTableColumns(auditLogs);
      expect(columns.id).toBeDefined();
      expect(columns.userId).toBeDefined();
      expect(columns.organizationId).toBeDefined();
      expect(columns.action).toBeDefined();
      expect(columns.entityType).toBeDefined();
      expect(columns.entityId).toBeDefined();
      expect(columns.oldValue).toBeDefined();
      expect(columns.newValue).toBeDefined();
      expect(columns.ipAddress).toBeDefined();
      expect(columns.userAgent).toBeDefined();
      expect(columns.createdAt).toBeDefined();
    });

    it('should enforce constraints on audit_logs table', () => {
      const columns = getTableColumns(auditLogs);
      expect(columns.id.primary).toBe(true);
      expect(columns.userId.notNull).toBe(false);
      expect(columns.organizationId.notNull).toBe(false);
      expect(columns.action.notNull).toBe(true);
      expect(columns.entityType.notNull).toBe(true);
      expect(columns.entityId.notNull).toBe(true);
      expect(columns.oldValue.notNull).toBe(false);
      expect(columns.newValue.notNull).toBe(false);
      expect(columns.ipAddress.notNull).toBe(false);
      expect(columns.userAgent.notNull).toBe(false);
      expect(columns.createdAt.hasDefault).toBe(true);
    });
  });

  describe('Naming conventions', () => {
    it('should use snake_case for DB column names', () => {
      const usersColumns = getTableColumns(users);
      expect(usersColumns.emailVerified.name).toBe('email_verified');
      expect(usersColumns.createdAt.name).toBe('created_at');
      expect(usersColumns.updatedAt.name).toBe('updated_at');

      const sessionsColumns = getTableColumns(sessions);
      expect(sessionsColumns.userId.name).toBe('user_id');
      expect(sessionsColumns.activeOrganizationId.name).toBe('active_organization_id');

      const auditColumns = getTableColumns(auditLogs);
      expect(auditColumns.entityType.name).toBe('entity_type');
      expect(auditColumns.entityId.name).toBe('entity_id');
      expect(auditColumns.oldValue.name).toBe('old_value');
      expect(auditColumns.newValue.name).toBe('new_value');
    });

    it('should use plural table names', () => {
      expect(getTableName(users)).toBe('users');
      expect(getTableName(sessions)).toBe('sessions');
      expect(getTableName(accounts)).toBe('accounts');
      expect(getTableName(verifications)).toBe('verifications');
      expect(getTableName(organizations)).toBe('organizations');
      expect(getTableName(members)).toBe('members');
      expect(getTableName(invitations)).toBe('invitations');
      expect(getTableName(auditLogs)).toBe('audit_logs');
    });
  });
});
