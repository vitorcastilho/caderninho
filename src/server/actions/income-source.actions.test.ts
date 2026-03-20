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

const sampleIncomeSource = {
  id: 'uuid-1',
  name: 'Salário ACME',
  employmentType: 'clt',
  isRecurring: true,
  baseAmountCents: 800000,
  usualPaymentDay: 25,
  status: 'active',
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

vi.mock('@/server/infrastructure/database/client', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([sampleIncomeSource]),
      }),
    }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([sampleIncomeSource]),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([sampleIncomeSource]),
        }),
      }),
    }),
  },
}));

const {
  createIncomeSourceAction,
  updateIncomeSourceAction,
  archiveIncomeSourceAction,
  reactivateIncomeSourceAction,
  listIncomeSourcesAction,
  getIncomeSourceAction,
} = await import('./income-source.actions');

const fakeSession = {
  user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
  session: { id: 'sess-1', token: 'abc', activeOrganizationId: 'org-123' },
};

describe('Income Source Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders.mockResolvedValue(new Headers());
  });

  describe('createIncomeSourceAction', () => {
    it('should require authentication', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await createIncomeSourceAction({
        name: 'Salário',
        employmentType: 'clt',
        isRecurring: true,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });

    it('should reject invalid input', async () => {
      mockGetSession.mockResolvedValue(fakeSession);

      const result = await createIncomeSourceAction({
        name: '',
        employmentType: 'clt',
        isRecurring: true,
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

      const result = await createIncomeSourceAction({
        name: 'Salário',
        employmentType: 'clt',
        isRecurring: true,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NO_ACTIVE_ORGANIZATION');
      }
    });

    it('should create income source with valid data', async () => {
      mockGetSession.mockResolvedValue(fakeSession);

      const result = await createIncomeSourceAction({
        name: 'Salário ACME',
        employmentType: 'clt',
        isRecurring: true,
        baseAmountCents: 800000,
        usualPaymentDay: 25,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('updateIncomeSourceAction', () => {
    it('should require authentication', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await updateIncomeSourceAction({
        id: 'uuid-1',
        data: { name: 'Novo Nome' },
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });
  });

  describe('archiveIncomeSourceAction', () => {
    it('should require authentication', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await archiveIncomeSourceAction({ id: 'uuid-1' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });
  });

  describe('reactivateIncomeSourceAction', () => {
    it('should require authentication', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await reactivateIncomeSourceAction({ id: 'uuid-1' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });
  });

  describe('listIncomeSourcesAction', () => {
    it('should require authentication', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await listIncomeSourcesAction(undefined);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });

    it('should list income sources when authenticated', async () => {
      mockGetSession.mockResolvedValue(fakeSession);

      const result = await listIncomeSourcesAction(undefined);

      expect(result.success).toBe(true);
    });
  });

  describe('getIncomeSourceAction', () => {
    it('should require authentication', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await getIncomeSourceAction({ id: 'uuid-1' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });
  });
});
