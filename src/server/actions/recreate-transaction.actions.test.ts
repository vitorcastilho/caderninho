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

// --- Mocks da factory ---------------------------------------------------

const mockFindTransactionById = vi.fn();
const mockCreateTransaction = vi.fn();
const mockFindBankById = vi.fn();
const mockUpdateBank = vi.fn();
const mockFindCategoryById = vi.fn();
const mockFindSubcategoryById = vi.fn();
const mockFindIncomeSourceById = vi.fn();
const mockFindCreditCardById = vi.fn();

const mockedTx = {
  repository: {
    create: mockCreateTransaction,
  },
  bankAccountRepository: {
    findById: mockFindBankById,
    update: mockUpdateBank,
  },
};

const mockWithTransaction = vi.fn(async (fn: (tx: typeof mockedTx) => Promise<unknown>) =>
  fn(mockedTx),
);

vi.mock('@/server/factories/transaction', () => ({
  transactionDeps: {
    repository: {
      findById: mockFindTransactionById,
      create: mockCreateTransaction,
      update: vi.fn(),
      delete: vi.fn(),
      findByOrganization: vi.fn(),
      findTopEstablishments: vi.fn(),
      sumMonthlySpentByCategory: vi.fn(),
      getMonthlySpendingSummary: vi.fn(),
    },
    bankAccountRepository: {
      findById: mockFindBankById,
      update: mockUpdateBank,
      create: vi.fn(),
      findAllByOrganization: vi.fn(),
      updateStatus: vi.fn(),
    },
    categoryRepository: {
      findById: mockFindCategoryById,
    },
    subcategoryRepository: {
      findById: mockFindSubcategoryById,
    },
    incomeSourceRepository: {
      findById: mockFindIncomeSourceById,
    },
    creditCardRepository: {
      findById: mockFindCreditCardById,
    },
    auditLogger: vi.fn(),
    withTransaction: mockWithTransaction,
  },
}));

// Mocks das outras factories que o módulo de actions importa
vi.mock('@/server/factories/establishment', () => ({
  autoCreateEstablishmentDeps: {},
}));

const { recreateTransactionFromSnapshotAction } = await import('./transaction.actions');

const fakeSession = {
  user: { id: 'user-real', name: 'Real User', email: 'real@example.com' },
  session: { id: 'sess-1', token: 'abc', activeOrganizationId: 'org-123' },
};

const validUuid = (suffix: string) => `550e8400-e29b-41d4-a716-44665544${suffix}`;

const baseExpenseSnapshot = {
  id: validUuid('0100'),
  type: 'expense' as const,
  amountCents: 10000,
  categoryId: validUuid('0200'),
  subcategoryId: null,
  establishment: 'Padaria',
  paymentMethodType: 'debit' as const,
  paymentMethodId: validUuid('0300'),
  installments: null,
  description: null,
  incomeSourceId: null,
  sourceAccountId: null,
  destinationAccountId: null,
  transactionDate: new Date('2026-04-10T12:00:00Z'),
  referenceMonth: null,
};

const bankAccount = {
  id: validUuid('0300'),
  name: 'Conta Corrente',
  bank: 'Nubank',
  balanceCents: 100000,
  status: 'active' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const categoryRecord = {
  id: validUuid('0200'),
  name: 'Mercado',
  emoji: '🛒',
  classificationId: validUuid('0201'),
  budgetMinCents: null,
  budgetMaxCents: null,
  defaultPaymentMethodType: null,
  defaultPaymentMethodId: null,
  status: 'active' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('recreateTransactionFromSnapshotAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders.mockResolvedValue(new Headers());
    mockGetSession.mockResolvedValue(fakeSession);

    mockFindTransactionById.mockResolvedValue(null);
    mockFindCategoryById.mockResolvedValue(categoryRecord);
    mockFindSubcategoryById.mockResolvedValue(null);
    mockFindIncomeSourceById.mockResolvedValue(null);
    mockFindCreditCardById.mockResolvedValue(null);
    mockFindBankById.mockResolvedValue(bankAccount);
    mockCreateTransaction.mockImplementation(async (data) => ({
      ...baseExpenseSnapshot,
      ...data,
      organizationId: 'org-123',
      createdBy: fakeSession.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    mockUpdateBank.mockResolvedValue(bankAccount);
    mockWithTransaction.mockImplementation(
      async (fn: (tx: typeof mockedTx) => Promise<unknown>) => fn(mockedTx),
    );
  });

  it('deve exigir autenticação', async () => {
    mockGetSession.mockResolvedValue(null);
    const result = await recreateTransactionFromSnapshotAction(baseExpenseSnapshot);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('UNAUTHORIZED');
  });

  it('deve retornar NO_ACTIVE_ORGANIZATION quando não há org ativa', async () => {
    mockGetSession.mockResolvedValue({
      ...fakeSession,
      session: { ...fakeSession.session, activeOrganizationId: null },
    });
    const result = await recreateTransactionFromSnapshotAction(baseExpenseSnapshot);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('NO_ACTIVE_ORGANIZATION');
  });

  it('deve rejeitar snapshot inválido (campos ausentes)', async () => {
    const result = await recreateTransactionFromSnapshotAction({ id: 'not-a-uuid' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('VALIDATION_ERROR');
    expect(mockCreateTransaction).not.toHaveBeenCalled();
  });

  it('deve rejeitar snapshot com amountCents negativo', async () => {
    const result = await recreateTransactionFromSnapshotAction({
      ...baseExpenseSnapshot,
      amountCents: -100,
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('VALIDATION_ERROR');
  });

  it('deve rejeitar snapshot com type fora do enum', async () => {
    const result = await recreateTransactionFromSnapshotAction({
      ...baseExpenseSnapshot,
      type: 'something-else',
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('VALIDATION_ERROR');
  });

  it('deve rejeitar quando categoria não pertence à organização', async () => {
    mockFindCategoryById.mockResolvedValue(null);
    const result = await recreateTransactionFromSnapshotAction(baseExpenseSnapshot);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_SNAPSHOT');
    expect(mockCreateTransaction).not.toHaveBeenCalled();
  });

  it('deve rejeitar quando conta de pagamento não pertence à organização', async () => {
    mockFindBankById.mockResolvedValue(null);
    const result = await recreateTransactionFromSnapshotAction(baseExpenseSnapshot);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_SNAPSHOT');
    expect(mockCreateTransaction).not.toHaveBeenCalled();
  });

  it('deve forçar createdBy a partir da session (ignora valor do cliente)', async () => {
    await recreateTransactionFromSnapshotAction({
      ...baseExpenseSnapshot,
      // cliente tenta forjar outro createdBy — deve ser ignorado
      createdBy: 'user-forjado',
    } as unknown as Record<string, unknown>);

    expect(mockCreateTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        createdBy: 'user-real',
        organizationId: 'org-123',
      }),
    );
  });

  it('deve recriar expense débito e debitar saldo da conta', async () => {
    const result = await recreateTransactionFromSnapshotAction(baseExpenseSnapshot);
    expect(result.success).toBe(true);
    // Saldo 100000 - 10000 = 90000
    expect(mockUpdateBank).toHaveBeenCalledWith(bankAccount.id, 'org-123', {
      balanceCents: 90000,
    });
  });

  it('idempotência: se transação já existe, retorna sucesso sem reaplicar saldo', async () => {
    const existingTransaction = {
      ...baseExpenseSnapshot,
      organizationId: 'org-123',
      createdBy: 'user-real',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockFindTransactionById.mockResolvedValue(existingTransaction);

    const result = await recreateTransactionFromSnapshotAction(baseExpenseSnapshot);

    expect(result.success).toBe(true);
    expect(mockCreateTransaction).not.toHaveBeenCalled();
    expect(mockUpdateBank).not.toHaveBeenCalled();
  });

  it('round-trip: recreate de income credita conta destino', async () => {
    const incomeSnapshot = {
      id: validUuid('0400'),
      type: 'income' as const,
      amountCents: 50000,
      categoryId: null,
      subcategoryId: null,
      establishment: null,
      paymentMethodType: null,
      paymentMethodId: null,
      installments: null,
      description: null,
      incomeSourceId: validUuid('0401'),
      sourceAccountId: null,
      destinationAccountId: bankAccount.id,
      transactionDate: new Date('2026-04-10T12:00:00Z'),
      referenceMonth: null,
    };
    mockFindIncomeSourceById.mockResolvedValue({ id: incomeSnapshot.incomeSourceId });

    const result = await recreateTransactionFromSnapshotAction(incomeSnapshot);

    expect(result.success).toBe(true);
    // Saldo 100000 + 50000 = 150000
    expect(mockUpdateBank).toHaveBeenCalledWith(bankAccount.id, 'org-123', {
      balanceCents: 150000,
    });
  });

  it('round-trip: recreate de transfer reaplica os dois lados', async () => {
    const destinationAccount = { ...bankAccount, id: validUuid('0500') };
    mockFindBankById.mockImplementation(async (id: string) => {
      if (id === bankAccount.id) return bankAccount;
      if (id === destinationAccount.id) return destinationAccount;
      return null;
    });

    const transferSnapshot = {
      id: validUuid('0501'),
      type: 'transfer' as const,
      amountCents: 25000,
      categoryId: null,
      subcategoryId: null,
      establishment: null,
      paymentMethodType: null,
      paymentMethodId: null,
      installments: null,
      description: null,
      incomeSourceId: null,
      sourceAccountId: bankAccount.id,
      destinationAccountId: destinationAccount.id,
      transactionDate: new Date('2026-04-10T12:00:00Z'),
      referenceMonth: null,
    };

    const result = await recreateTransactionFromSnapshotAction(transferSnapshot);

    expect(result.success).toBe(true);
    // Origem debitada: 100000 - 25000 = 75000
    expect(mockUpdateBank).toHaveBeenCalledWith(bankAccount.id, 'org-123', {
      balanceCents: 75000,
    });
    // Destino creditada: 100000 + 25000 = 125000
    expect(mockUpdateBank).toHaveBeenCalledWith(destinationAccount.id, 'org-123', {
      balanceCents: 125000,
    });
  });

  it('deve rejeitar snapshot de outra organização por ownership de conta', async () => {
    // org da action é 'org-123' — mas conta pertence a outra org, logo findById devolve null
    mockFindBankById.mockResolvedValue(null);
    const result = await recreateTransactionFromSnapshotAction(baseExpenseSnapshot);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_SNAPSHOT');
  });

  it('deve executar o fluxo dentro de withTransaction (atomicidade)', async () => {
    await recreateTransactionFromSnapshotAction(baseExpenseSnapshot);
    expect(mockWithTransaction).toHaveBeenCalledTimes(1);
  });
});
