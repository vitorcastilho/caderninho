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

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/server/infrastructure/audit/audit.service', () => ({
  logAudit: vi.fn(),
}));

const sampleTransaction = {
  id: 'uuid-1',
  type: 'expense',
  amountCents: 8700,
  categoryId: 'cat-123',
  subcategoryId: null,
  establishment: 'Pão de Açúcar',
  paymentMethodType: 'debit',
  paymentMethodId: 'bank-123',
  description: null,
  transactionDate: new Date(),
  referenceMonth: null,
  organizationId: 'org-123',
  createdBy: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const sampleBankAccount = {
  id: 'bank-123',
  name: 'Conta Corrente',
  bank: 'Nubank',
  balanceCents: 50000,
  status: 'active',
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

vi.mock('@/server/infrastructure/database/client', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([sampleTransaction]),
      }),
    }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue(
          Object.assign(Promise.resolve([sampleBankAccount]), {
            orderBy: vi.fn().mockReturnValue(
              Object.assign(Promise.resolve([]), {
                groupBy: vi.fn().mockReturnValue({
                  orderBy: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([]),
                  }),
                }),
              }),
            ),
            groupBy: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        ),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([sampleBankAccount]),
        }),
      }),
    }),
  },
}));

vi.mock('@/server/domain/transactions/use-cases/create-income', () => ({
  createIncome: vi.fn(),
}));

vi.mock('@/server/domain/transactions/use-cases/transfer-between-accounts', () => ({
  transferBetweenAccounts: vi.fn(),
}));

vi.mock('@/server/domain/transactions/use-cases/update-expense-transaction', () => ({
  updateExpenseTransaction: vi.fn(),
}));

vi.mock('@/server/domain/transactions/use-cases/delete-transaction', () => ({
  deleteTransaction: vi.fn(),
}));

vi.mock('@/server/domain/transactions/use-cases/list-transactions', () => ({
  listTransactions: vi.fn(),
}));

vi.mock('@/server/domain/transactions/use-cases/get-transaction-period-summary', () => ({
  getTransactionPeriodSummary: vi.fn(),
}));

const { createIncome: mockedCreateIncome } = await import(
  '@/server/domain/transactions/use-cases/create-income'
);
const { transferBetweenAccounts: mockedTransfer } = await import(
  '@/server/domain/transactions/use-cases/transfer-between-accounts'
);
const { updateExpenseTransaction: mockedUpdate } = await import(
  '@/server/domain/transactions/use-cases/update-expense-transaction'
);
const { deleteTransaction: mockedDelete } = await import(
  '@/server/domain/transactions/use-cases/delete-transaction'
);
const { listTransactions: mockedListTransactions } = await import(
  '@/server/domain/transactions/use-cases/list-transactions'
);
const { getTransactionPeriodSummary: mockedGetSummary } = await import(
  '@/server/domain/transactions/use-cases/get-transaction-period-summary'
);

const {
  createTransactionAction,
  createIncomeAction,
  createTransferAction,
  updateExpenseTransactionAction,
  deleteTransactionAction,
  listTransactionsAction,
  getTransactionPeriodSummaryAction,
  getSuggestedEstablishmentsAction,
} = await import('./transaction.actions');

const fakeSession = {
  user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
  session: { id: 'sess-1', token: 'abc', activeOrganizationId: 'org-123' },
};

describe('Transaction Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders.mockResolvedValue(new Headers());
  });

  describe('createTransactionAction', () => {
    it('deve exigir autenticacao', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await createTransactionAction({
        amountCents: 8700,
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
        paymentMethodType: 'debit',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });

    it('deve rejeitar input invalido (valor zero)', async () => {
      mockGetSession.mockResolvedValue(fakeSession);

      const result = await createTransactionAction({
        amountCents: 0,
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
        paymentMethodType: 'debit',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('deve retornar erro sem organizacao ativa', async () => {
      mockGetSession.mockResolvedValue({
        ...fakeSession,
        session: { ...fakeSession.session, activeOrganizationId: null },
      });

      const result = await createTransactionAction({
        amountCents: 8700,
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
        paymentMethodType: 'debit',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NO_ACTIVE_ORGANIZATION');
      }
    });

    it('deve criar transacao com dados validos', async () => {
      mockGetSession.mockResolvedValue(fakeSession);

      const result = await createTransactionAction({
        amountCents: 8700,
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
        paymentMethodType: 'debit',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('createIncomeAction', () => {
    const validInput = {
      amountCents: 500000,
      incomeSourceId: '550e8400-e29b-41d4-a716-446655440010',
      destinationAccountId: '550e8400-e29b-41d4-a716-446655440020',
    };

    it('deve exigir autenticacao', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await createIncomeAction(validInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });

    it('deve rejeitar input invalido (valor zero)', async () => {
      mockGetSession.mockResolvedValue(fakeSession);

      const result = await createIncomeAction({ ...validInput, amountCents: 0 });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('deve retornar erro sem organizacao ativa', async () => {
      mockGetSession.mockResolvedValue({
        ...fakeSession,
        session: { ...fakeSession.session, activeOrganizationId: null },
      });

      const result = await createIncomeAction(validInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NO_ACTIVE_ORGANIZATION');
      }
    });

    it('deve chamar use case createIncome com dados validos', async () => {
      mockGetSession.mockResolvedValue(fakeSession);
      vi.mocked(mockedCreateIncome).mockResolvedValue({
        success: true,
        data: { id: 'tx-1' } as never,
      });

      const result = await createIncomeAction(validInput);

      expect(result.success).toBe(true);
      expect(mockedCreateIncome).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          amountCents: 500000,
          organizationId: 'org-123',
          userId: 'user-1',
        }),
      );
    });
  });

  describe('createTransferAction', () => {
    const validInput = {
      amountCents: 30000,
      sourceAccountId: '550e8400-e29b-41d4-a716-446655440030',
      destinationAccountId: '550e8400-e29b-41d4-a716-446655440040',
    };

    it('deve exigir autenticacao', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await createTransferAction(validInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });

    it('deve rejeitar mesma conta origem e destino', async () => {
      mockGetSession.mockResolvedValue(fakeSession);

      const result = await createTransferAction({
        ...validInput,
        destinationAccountId: validInput.sourceAccountId,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('deve rejeitar input invalido (valor zero)', async () => {
      mockGetSession.mockResolvedValue(fakeSession);

      const result = await createTransferAction({ ...validInput, amountCents: 0 });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('deve retornar erro sem organizacao ativa', async () => {
      mockGetSession.mockResolvedValue({
        ...fakeSession,
        session: { ...fakeSession.session, activeOrganizationId: null },
      });

      const result = await createTransferAction(validInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NO_ACTIVE_ORGANIZATION');
      }
    });

    it('deve chamar use case transferBetweenAccounts com dados validos', async () => {
      mockGetSession.mockResolvedValue(fakeSession);
      vi.mocked(mockedTransfer).mockResolvedValue({
        success: true,
        data: { id: 'tx-1' } as never,
      });

      const result = await createTransferAction(validInput);

      expect(result.success).toBe(true);
      expect(mockedTransfer).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          amountCents: 30000,
          organizationId: 'org-123',
          userId: 'user-1',
        }),
      );
    });
  });

  describe('updateExpenseTransactionAction', () => {
    const validInput = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      amountCents: 10000,
    };

    it('deve exigir autenticacao', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await updateExpenseTransactionAction(validInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });

    it('deve rejeitar id inválido', async () => {
      mockGetSession.mockResolvedValue(fakeSession);

      const result = await updateExpenseTransactionAction({ id: 'not-a-uuid' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('deve rejeitar amountCents zero', async () => {
      mockGetSession.mockResolvedValue(fakeSession);

      const result = await updateExpenseTransactionAction({
        ...validInput,
        amountCents: 0,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('deve retornar erro sem organizacao ativa', async () => {
      mockGetSession.mockResolvedValue({
        ...fakeSession,
        session: { ...fakeSession.session, activeOrganizationId: null },
      });

      const result = await updateExpenseTransactionAction(validInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NO_ACTIVE_ORGANIZATION');
      }
    });

    it('deve chamar use case updateExpenseTransaction com dados válidos', async () => {
      mockGetSession.mockResolvedValue(fakeSession);
      vi.mocked(mockedUpdate).mockResolvedValue({
        success: true,
        data: { id: 'tx-1' } as never,
      });

      const result = await updateExpenseTransactionAction(validInput);

      expect(result.success).toBe(true);
      expect(mockedUpdate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          id: validInput.id,
          amountCents: 10000,
          organizationId: 'org-123',
          userId: 'user-1',
        }),
      );
    });

    it('deve propagar erro do use case', async () => {
      mockGetSession.mockResolvedValue(fakeSession);
      vi.mocked(mockedUpdate).mockResolvedValue({
        success: false,
        error: { code: 'TRANSACTION_NOT_FOUND', message: 'não encontrada' },
      });

      const result = await updateExpenseTransactionAction(validInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('TRANSACTION_NOT_FOUND');
      }
    });
  });

  describe('deleteTransactionAction', () => {
    const validInput = { id: '550e8400-e29b-41d4-a716-446655440000' };

    it('deve exigir autenticacao', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await deleteTransactionAction(validInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });

    it('deve rejeitar id inválido', async () => {
      mockGetSession.mockResolvedValue(fakeSession);

      const result = await deleteTransactionAction({ id: 'not-a-uuid' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('deve retornar erro sem organizacao ativa', async () => {
      mockGetSession.mockResolvedValue({
        ...fakeSession,
        session: { ...fakeSession.session, activeOrganizationId: null },
      });

      const result = await deleteTransactionAction(validInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NO_ACTIVE_ORGANIZATION');
      }
    });

    it('deve chamar use case deleteTransaction com dados válidos', async () => {
      mockGetSession.mockResolvedValue(fakeSession);
      vi.mocked(mockedDelete).mockResolvedValue({
        success: true,
        data: { id: validInput.id, snapshot: sampleTransaction as never },
      });

      const result = await deleteTransactionAction(validInput);

      expect(result.success).toBe(true);
      expect(mockedDelete).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          id: validInput.id,
          organizationId: 'org-123',
          userId: 'user-1',
        }),
      );
    });
  });

  describe('listTransactionsAction', () => {
    it('deve exigir autenticacao', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await listTransactionsAction(undefined);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });

    it('deve retornar erro sem organizacao ativa', async () => {
      mockGetSession.mockResolvedValue({
        ...fakeSession,
        session: { ...fakeSession.session, activeOrganizationId: null },
      });

      const result = await listTransactionsAction(undefined);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NO_ACTIVE_ORGANIZATION');
      }
    });

    it('deve aceitar chamada sem filtros (undefined → {})', async () => {
      mockGetSession.mockResolvedValue(fakeSession);
      vi.mocked(mockedListTransactions).mockResolvedValue({
        success: true,
        data: { rows: [], total: 0, hasMore: false },
      });

      const result = await listTransactionsAction(undefined);

      expect(result.success).toBe(true);
      expect(mockedListTransactions).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          organizationId: 'org-123',
          pagination: { limit: undefined, offset: undefined },
        }),
      );
    });

    it('deve propagar filtros validados para o use case', async () => {
      mockGetSession.mockResolvedValue(fakeSession);
      vi.mocked(mockedListTransactions).mockResolvedValue({
        success: true,
        data: { rows: [], total: 0, hasMore: false },
      });

      const result = await listTransactionsAction({
        types: ['expense'],
        categoryIds: ['550e8400-e29b-41d4-a716-446655440000'],
        search: 'mercado',
        limit: 20,
        offset: 0,
      });

      expect(result.success).toBe(true);
      expect(mockedListTransactions).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          filters: expect.objectContaining({
            types: ['expense'],
            categoryIds: ['550e8400-e29b-41d4-a716-446655440000'],
            search: 'mercado',
          }),
          pagination: { limit: 20, offset: 0 },
        }),
      );
    });

    it('deve rejeitar filtros inválidos', async () => {
      mockGetSession.mockResolvedValue(fakeSession);

      const result = await listTransactionsAction({ limit: 500 });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });
  });

  describe('getTransactionPeriodSummaryAction', () => {
    const zeroSummary = {
      expense: { totalCents: 0, count: 0 },
      income: { totalCents: 0, count: 0 },
      transfer: { totalCents: 0, count: 0 },
    };

    it('deve exigir autenticacao', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await getTransactionPeriodSummaryAction({});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });

    it('deve retornar erro sem organizacao ativa', async () => {
      mockGetSession.mockResolvedValue({
        ...fakeSession,
        session: { ...fakeSession.session, activeOrganizationId: null },
      });

      const result = await getTransactionPeriodSummaryAction({});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NO_ACTIVE_ORGANIZATION');
      }
    });

    it('deve aceitar chamada sem filtros e propagar ao use case', async () => {
      mockGetSession.mockResolvedValue(fakeSession);
      vi.mocked(mockedGetSummary).mockResolvedValue({
        success: true,
        data: zeroSummary,
      });

      const result = await getTransactionPeriodSummaryAction({});

      expect(result.success).toBe(true);
      expect(mockedGetSummary).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          organizationId: 'org-123',
          filters: expect.any(Object),
        }),
      );
    });

    it('deve propagar filtros válidos', async () => {
      mockGetSession.mockResolvedValue(fakeSession);
      vi.mocked(mockedGetSummary).mockResolvedValue({
        success: true,
        data: zeroSummary,
      });

      await getTransactionPeriodSummaryAction({
        types: ['expense'],
        categoryIds: ['550e8400-e29b-41d4-a716-446655440000'],
        search: 'mercado',
      });

      expect(mockedGetSummary).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          organizationId: 'org-123',
          filters: expect.objectContaining({
            types: ['expense'],
            categoryIds: ['550e8400-e29b-41d4-a716-446655440000'],
            search: 'mercado',
          }),
        }),
      );
    });

    it('deve rejeitar filtros inválidos (categoryIds com string inválida)', async () => {
      mockGetSession.mockResolvedValue(fakeSession);

      const result = await getTransactionPeriodSummaryAction({
        categoryIds: ['not-a-uuid'],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('deve propagar erro do use case', async () => {
      mockGetSession.mockResolvedValue(fakeSession);
      vi.mocked(mockedGetSummary).mockResolvedValue({
        success: false,
        error: { code: 'REPOSITORY_ERROR', message: 'boom' },
      });

      const result = await getTransactionPeriodSummaryAction({});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('REPOSITORY_ERROR');
      }
    });
  });

  describe('getSuggestedEstablishmentsAction', () => {
    it('deve exigir autenticacao', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await getSuggestedEstablishmentsAction({
        subcategoryId: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });

    it('deve rejeitar subcategoryId invalido', async () => {
      mockGetSession.mockResolvedValue(fakeSession);

      const result = await getSuggestedEstablishmentsAction({
        subcategoryId: 'not-a-uuid',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });
  });
});
