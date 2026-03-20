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

const sampleInvestment = {
  id: 'uuid-1',
  name: 'CDB Banco X',
  institution: 'Banco X',
  type: 'renda_fixa',
  balanceCents: 1000000,
  yieldRateBasisPoints: 11000,
  lastBalanceUpdate: new Date(),
  maturityDate: '2027-12-31',
  status: 'active',
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

vi.mock('@/server/infrastructure/database/client', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([sampleInvestment]),
      }),
    }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([sampleInvestment]),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([sampleInvestment]),
        }),
      }),
    }),
  },
}));

const {
  createInvestmentAction,
  updateInvestmentAction,
  archiveInvestmentAction,
  reactivateInvestmentAction,
  listInvestmentsAction,
  getInvestmentAction,
} = await import('./investment.actions');

const fakeSession = {
  user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
  session: { id: 'sess-1', token: 'abc', activeOrganizationId: 'org-123' },
};

describe('Investment Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders.mockResolvedValue(new Headers());
  });

  describe('createInvestmentAction', () => {
    it('should require authentication', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await createInvestmentAction({
        name: 'CDB',
        institution: 'Banco X',
        type: 'renda_fixa',
        balanceCents: 1000000,
        yieldRateBasisPoints: 11000,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });

    it('should reject invalid input', async () => {
      mockGetSession.mockResolvedValue(fakeSession);

      const result = await createInvestmentAction({
        name: '',
        institution: 'Banco X',
        type: 'renda_fixa',
        balanceCents: 1000000,
        yieldRateBasisPoints: 11000,
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

      const result = await createInvestmentAction({
        name: 'CDB',
        institution: 'Banco X',
        type: 'renda_fixa',
        balanceCents: 1000000,
        yieldRateBasisPoints: 11000,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NO_ACTIVE_ORGANIZATION');
      }
    });

    it('should create investment with valid data', async () => {
      mockGetSession.mockResolvedValue(fakeSession);

      const result = await createInvestmentAction({
        name: 'CDB Banco X',
        institution: 'Banco X',
        type: 'renda_fixa',
        balanceCents: 1000000,
        yieldRateBasisPoints: 11000,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('updateInvestmentAction', () => {
    it('should require authentication', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await updateInvestmentAction({
        id: 'uuid-1',
        data: { name: 'Novo Nome' },
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });

    it('should reject invalid id', async () => {
      mockGetSession.mockResolvedValue(fakeSession);

      const result = await updateInvestmentAction({
        id: 'not-a-uuid',
        data: { name: 'Novo Nome' },
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });
  });

  describe('archiveInvestmentAction', () => {
    it('should require authentication', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await archiveInvestmentAction({ id: 'uuid-1' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });
  });

  describe('reactivateInvestmentAction', () => {
    it('should require authentication', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await reactivateInvestmentAction({ id: 'uuid-1' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });
  });

  describe('listInvestmentsAction', () => {
    it('should require authentication', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await listInvestmentsAction(undefined);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });

    it('should list investments when authenticated', async () => {
      mockGetSession.mockResolvedValue(fakeSession);

      const result = await listInvestmentsAction(undefined);

      expect(result.success).toBe(true);
    });
  });

  describe('getInvestmentAction', () => {
    it('should require authentication', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await getInvestmentAction({ id: 'uuid-1' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });
  });
});
