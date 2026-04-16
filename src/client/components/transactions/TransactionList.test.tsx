// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';

import { createLocalStorageMock } from '@/client/test-utils/local-storage-mock';

vi.stubGlobal('localStorage', createLocalStorageMock());

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
  },
}));

const mockListAction = vi.fn();
const mockDeleteAction = vi.fn();
const mockRecreateAction = vi.fn();
const mockUpdateExpenseAction = vi.fn();

vi.mock('@/server/actions/transaction.actions', () => ({
  listTransactionsAction: (...args: unknown[]) => mockListAction(...args),
  deleteTransactionAction: (...args: unknown[]) => mockDeleteAction(...args),
  recreateTransactionFromSnapshotAction: (...args: unknown[]) => mockRecreateAction(...args),
  updateExpenseTransactionAction: (...args: unknown[]) => mockUpdateExpenseAction(...args),
  getImpactPreviewAction: vi.fn(),
  getSuggestedEstablishmentsAction: vi.fn(),
}));

class IntersectionObserverMock {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);
  constructor() {}
}
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

const { TransactionList } = await import('./TransactionList');

const categories = [
  { id: 'cat-1', name: 'Alimentação', classificationId: 'cl-1' },
];
const subcategories = [
  { id: 'sub-1', name: 'Supermercado', categoryId: 'cat-1' },
];
const bankAccounts = [
  { id: 'bank-1', name: 'Corrente', bank: 'Nubank', status: 'active', balanceCents: 100000 },
];
const creditCards = [
  { id: 'cc-1', name: 'Platinum', brand: 'Visa', status: 'active' },
];
const incomeSources = [{ id: 'src-1', name: 'Salário' }];

function makeTx(id: string, date: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    type: 'expense',
    amountCents: 4250,
    categoryId: 'cat-1',
    subcategoryId: 'sub-1',
    establishment: `Mercado ${id}`,
    paymentMethodType: 'debit',
    paymentMethodId: 'bank-1',
    installments: null,
    description: null,
    incomeSourceId: null,
    sourceAccountId: null,
    destinationAccountId: null,
    transactionDate: new Date(date),
    referenceMonth: null,
    organizationId: 'org-1',
    createdBy: 'user-1',
    createdAt: new Date(date),
    updatedAt: new Date(date),
    ...overrides,
  };
}

describe('TransactionList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListAction.mockResolvedValue({
      success: true,
      data: { rows: [], total: 0, hasMore: false },
    });
  });

  it('exibe empty state original quando nunca houve transações e sem filtros ativos', () => {
    render(
      <TransactionList
        initialTransactions={[]}
        initialTotal={0}
        initialHasMore={false}
        categories={categories}
        subcategories={subcategories}
        bankAccounts={bankAccounts}
        creditCards={creditCards}
        incomeSources={incomeSources}
      />,
    );

    expect(screen.getByText('Nenhuma transação registrada ainda')).toBeInTheDocument();
  });

  it('agrupa transações por dia com cabeçalhos de data', () => {
    const tx1 = makeTx('tx-1', '2026-04-10T12:00:00Z');
    const tx2 = makeTx('tx-2', '2026-04-10T18:00:00Z');
    const tx3 = makeTx('tx-3', '2026-04-05T12:00:00Z');

    render(
      <TransactionList
        initialTransactions={[tx1, tx2, tx3]}
        initialTotal={3}
        initialHasMore={false}
        categories={categories}
        subcategories={subcategories}
        bankAccounts={bankAccounts}
        creditCards={creditCards}
        incomeSources={incomeSources}
      />,
    );

    const headings = screen.getAllByRole('heading', { level: 2 });
    // Dois grupos (10/04 e 05/04)
    expect(headings).toHaveLength(2);
    expect(screen.getByText('Mercado tx-1')).toBeInTheDocument();
    expect(screen.getByText('Mercado tx-3')).toBeInTheDocument();
  });

  it('exibe "Fim do histórico" quando hasMore=false e há transações', () => {
    render(
      <TransactionList
        initialTransactions={[makeTx('tx-1', '2026-04-10T12:00:00Z')]}
        initialTotal={1}
        initialHasMore={false}
        categories={categories}
        subcategories={subcategories}
        bankAccounts={bankAccounts}
        creditCards={creditCards}
        incomeSources={incomeSources}
      />,
    );
    expect(screen.getByText(/Fim do histórico/)).toBeInTheDocument();
  });

  it('aplica filtro de tipo e chama a action com types=[expense]', async () => {
    const user = userEvent.setup();
    mockListAction.mockResolvedValue({
      success: true,
      data: { rows: [], total: 0, hasMore: false },
    });

    render(
      <TransactionList
        initialTransactions={[makeTx('tx-1', '2026-04-10T12:00:00Z')]}
        initialTotal={1}
        initialHasMore={false}
        categories={categories}
        subcategories={subcategories}
        bankAccounts={bankAccounts}
        creditCards={creditCards}
        incomeSources={incomeSources}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Saídas' }));

    expect(mockListAction).toHaveBeenCalledWith(
      expect.objectContaining({
        types: ['expense'],
        limit: 50,
        offset: 0,
      }),
    );
  });

  it('exibe empty state filtrado depois de aplicar filtro sem resultados', async () => {
    const user = userEvent.setup();
    mockListAction.mockResolvedValue({
      success: true,
      data: { rows: [], total: 0, hasMore: false },
    });

    render(
      <TransactionList
        initialTransactions={[makeTx('tx-1', '2026-04-10T12:00:00Z')]}
        initialTotal={1}
        initialHasMore={false}
        categories={categories}
        subcategories={subcategories}
        bankAccounts={bankAccounts}
        creditCards={creditCards}
        incomeSources={incomeSources}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Entradas' }));

    // Aguarda re-render após resolução da action
    expect(
      await screen.findByText('Nenhuma transação encontrada'),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: /Limpar filtros/ }).length,
    ).toBeGreaterThanOrEqual(1);
  });
});
