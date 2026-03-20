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
          name: 'Latam Pass Visa',
          brand: 'Visa',
          limitCents: 1000000,
          closingDay: 10,
          dueDay: 17,
          status: 'active',
          organizationId: 'org-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        }]),
      }),
    }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue(Object.assign(Promise.resolve([{
          id: 'uuid-1',
          name: 'Latam Pass Visa',
          brand: 'Visa',
          limitCents: 1000000,
          closingDay: 10,
          dueDay: 17,
          status: 'active',
          organizationId: 'org-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        }]), { orderBy: vi.fn().mockResolvedValue([{
          id: 'uuid-1',
          name: 'Latam Pass Visa',
          brand: 'Visa',
          limitCents: 1000000,
          closingDay: 10,
          dueDay: 17,
          status: 'active',
          organizationId: 'org-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        }]) })),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{
            id: 'uuid-1',
            name: 'Latam Pass Visa',
            brand: 'Visa',
            limitCents: 1000000,
            closingDay: 10,
            dueDay: 17,
            status: 'active',
            organizationId: 'org-123',
            createdAt: new Date(),
            updatedAt: new Date(),
          }]),
        }),
      }),
    }),
  },
}));

const {
  createCreditCardAction,
  updateCreditCardAction,
  archiveCreditCardAction,
  reactivateCreditCardAction,
  listCreditCardsAction,
  getCreditCardAction,
} = await import('./credit-card.actions');

const fakeSession = {
  user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
  session: { id: 'sess-1', token: 'abc', activeOrganizationId: 'org-123' },
};

describe('Credit Card Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders.mockResolvedValue(new Headers());
  });

  describe('createCreditCardAction', () => {
    it('should require authentication', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await createCreditCardAction({
        name: 'Latam Pass Visa',
        brand: 'Visa',
        limitCents: 1000000,
        closingDay: 10,
        dueDay: 17,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });

    it('should reject invalid input', async () => {
      mockGetSession.mockResolvedValue(fakeSession);

      const result = await createCreditCardAction({
        name: '',
        brand: 'Visa',
        limitCents: 1000000,
        closingDay: 10,
        dueDay: 17,
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

      const result = await createCreditCardAction({
        name: 'Latam Pass Visa',
        brand: 'Visa',
        limitCents: 1000000,
        closingDay: 10,
        dueDay: 17,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NO_ACTIVE_ORGANIZATION');
      }
    });

    it('should create card with valid data', async () => {
      mockGetSession.mockResolvedValue(fakeSession);

      const result = await createCreditCardAction({
        name: 'Latam Pass Visa',
        brand: 'Visa',
        limitCents: 1000000,
        closingDay: 10,
        dueDay: 17,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('updateCreditCardAction', () => {
    it('should require authentication', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await updateCreditCardAction({
        id: 'uuid-1',
        data: { name: 'Novo Cartão' },
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });

    it('should reject invalid id', async () => {
      mockGetSession.mockResolvedValue(fakeSession);

      const result = await updateCreditCardAction({
        id: 'not-a-uuid',
        data: { name: 'Novo Cartão' },
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });
  });

  describe('archiveCreditCardAction', () => {
    it('should require authentication', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await archiveCreditCardAction({ id: 'uuid-1' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });
  });

  describe('reactivateCreditCardAction', () => {
    it('should require authentication', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await reactivateCreditCardAction({ id: 'uuid-1' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });
  });

  describe('listCreditCardsAction', () => {
    it('should require authentication', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await listCreditCardsAction(undefined);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });

    it('should list cards when authenticated', async () => {
      mockGetSession.mockResolvedValue(fakeSession);

      const result = await listCreditCardsAction(undefined);

      expect(result.success).toBe(true);
    });
  });

  describe('getCreditCardAction', () => {
    it('should require authentication', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await getCreditCardAction({ id: 'uuid-1' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });
  });
});
