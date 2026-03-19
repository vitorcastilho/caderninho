import { vi } from 'vitest';

const mockGetSession = vi.fn();
vi.mock('@/server/infrastructure/auth/config', () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
  },
}));

const mockHeaders = vi.fn();
vi.mock('next/headers', () => ({
  headers: () => mockHeaders(),
}));

vi.mock('@/server/infrastructure/audit/audit.service', () => ({
  logAudit: vi.fn(),
}));

vi.mock('@/server/infrastructure/database/client', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{
          id: 'uuid-1',
          name: 'Conta Corrente',
          bank: 'Nubank',
          balanceCents: 0,
          status: 'active',
          organizationId: 'org-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        }]),
      }),
    }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{
          id: 'uuid-1',
          name: 'Conta Corrente',
          bank: 'Nubank',
          balanceCents: 0,
          status: 'active',
          organizationId: 'org-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        }]),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{
          id: 'uuid-1',
          name: 'Conta Corrente',
          bank: 'Nubank',
          balanceCents: 0,
          status: 'active',
          organizationId: 'org-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        }]),
      }),
    }),
  },
}));

const {
  createBankAccountAction,
  updateBankAccountAction,
  archiveBankAccountAction,
  reactivateBankAccountAction,
  listBankAccountsAction,
  getBankAccountAction,
} = await import('./bank-account.actions');

const fakeSession = {
  user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
  session: { id: 'sess-1', token: 'abc', activeOrganizationId: 'org-123' },
};

describe('Bank Account Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders.mockResolvedValue(new Headers());
  });

  describe('createBankAccountAction', () => {
    it('should require authentication', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await createBankAccountAction({
        name: 'Conta Corrente',
        bank: 'Nubank',
        balanceCents: 0,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });

    it('should reject invalid input', async () => {
      mockGetSession.mockResolvedValue(fakeSession);

      const result = await createBankAccountAction({
        name: '',
        bank: 'Nubank',
        balanceCents: 0,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('should return error when no active organization', async () => {
      mockGetSession.mockResolvedValue({
        ...fakeSession,
        session: { ...fakeSession.session, activeOrganizationId: null },
      });

      const result = await createBankAccountAction({
        name: 'Conta Corrente',
        bank: 'Nubank',
        balanceCents: 0,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NO_ACTIVE_ORGANIZATION');
      }
    });

    it('should create account with valid data', async () => {
      mockGetSession.mockResolvedValue(fakeSession);

      const result = await createBankAccountAction({
        name: 'Conta Corrente',
        bank: 'Nubank',
        balanceCents: 14999,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('updateBankAccountAction', () => {
    it('should require authentication', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await updateBankAccountAction({
        id: 'uuid-1',
        data: { name: 'Nova Conta' },
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });

    it('should reject invalid id', async () => {
      mockGetSession.mockResolvedValue(fakeSession);

      const result = await updateBankAccountAction({
        id: 'not-a-uuid',
        data: { name: 'Nova Conta' },
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });
  });

  describe('archiveBankAccountAction', () => {
    it('should require authentication', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await archiveBankAccountAction({ id: 'uuid-1' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });
  });

  describe('reactivateBankAccountAction', () => {
    it('should require authentication', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await reactivateBankAccountAction({ id: 'uuid-1' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });
  });

  describe('listBankAccountsAction', () => {
    it('should require authentication', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await listBankAccountsAction(undefined);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });

    it('should list accounts when authenticated', async () => {
      mockGetSession.mockResolvedValue(fakeSession);

      const result = await listBankAccountsAction(undefined);

      expect(result.success).toBe(true);
    });
  });

  describe('getBankAccountAction', () => {
    it('should require authentication', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await getBankAccountAction({ id: 'uuid-1' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });
  });
});
