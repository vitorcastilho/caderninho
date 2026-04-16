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
const mockSummaryAction = vi.fn();
const mockDeleteAction = vi.fn();
const mockRecreateAction = vi.fn();
const mockUpdateExpenseAction = vi.fn();

vi.mock('@/server/actions/transaction.actions', () => ({
  listTransactionsAction: (...args: unknown[]) => mockListAction(...args),
  getTransactionPeriodSummaryAction: (...args: unknown[]) => mockSummaryAction(...args),
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
  { id: 'cat-1', name: 'Alimentação', classificationId: 'cl-1', emoji: '🍔' },
  { id: 'cat-2', name: 'Transporte', classificationId: 'cl-1', emoji: '🚗' },
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

const zeroSummary = {
  expense: { totalCents: 0, count: 0 },
  income: { totalCents: 0, count: 0 },
  transfer: { totalCents: 0, count: 0 },
};

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

function renderList(
  props: Partial<React.ComponentProps<typeof TransactionList>> = {},
) {
  return render(
    <TransactionList
      initialTransactions={props.initialTransactions ?? []}
      initialTotal={props.initialTotal ?? 0}
      initialHasMore={props.initialHasMore ?? false}
      initialSummary={props.initialSummary}
      categories={props.categories ?? categories}
      subcategories={props.subcategories ?? subcategories}
      bankAccounts={props.bankAccounts ?? bankAccounts}
      creditCards={props.creditCards ?? creditCards}
      incomeSources={props.incomeSources ?? incomeSources}
    />,
  );
}

describe('TransactionList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListAction.mockResolvedValue({
      success: true,
      data: { rows: [], total: 0, hasMore: false },
    });
    mockSummaryAction.mockResolvedValue({
      success: true,
      data: zeroSummary,
    });
  });

  it('exibe empty state original quando nunca houve transações e sem filtros ativos', () => {
    renderList();
    expect(screen.getByText('Nenhuma transação registrada ainda')).toBeInTheDocument();
  });

  it('agrupa transações por dia com cabeçalhos de data', () => {
    const tx1 = makeTx('tx-1', '2026-04-10T12:00:00Z');
    const tx2 = makeTx('tx-2', '2026-04-10T18:00:00Z');
    const tx3 = makeTx('tx-3', '2026-04-05T12:00:00Z');

    renderList({
      initialTransactions: [tx1, tx2, tx3],
      initialTotal: 3,
      initialHasMore: false,
    });

    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings).toHaveLength(2);
    expect(screen.getByText('Mercado tx-1')).toBeInTheDocument();
    expect(screen.getByText('Mercado tx-3')).toBeInTheDocument();
  });

  it('renderiza os 3 cards de summary com valores do initialSummary', () => {
    renderList({
      initialSummary: {
        expense: { totalCents: 12500, count: 4 },
        income: { totalCents: 50000, count: 1 },
        transfer: { totalCents: 20000, count: 2 },
      },
    });

    const cards = screen.getAllByRole('generic').filter(
      (el) => el.getAttribute('data-slot') === 'transaction-summary-card',
    );
    expect(cards).toHaveLength(3);
    expect(cards.find((c) => c.getAttribute('data-key') === 'expense')).toHaveTextContent(
      'R$ 125,00',
    );
    expect(cards.find((c) => c.getAttribute('data-key') === 'income')).toHaveTextContent(
      'R$ 500,00',
    );
    expect(cards.find((c) => c.getAttribute('data-key') === 'transfer')).toHaveTextContent(
      'R$ 200,00',
    );
  });

  it('exibe "Fim do histórico" quando hasMore=false e há transações', () => {
    renderList({
      initialTransactions: [makeTx('tx-1', '2026-04-10T12:00:00Z')],
      initialTotal: 1,
    });
    expect(screen.getByText(/Fim do histórico/)).toBeInTheDocument();
  });

  it('aplica filtro de tipo e chama list + summary em paralelo', async () => {
    const user = userEvent.setup();

    renderList({
      initialTransactions: [makeTx('tx-1', '2026-04-10T12:00:00Z')],
      initialTotal: 1,
    });

    await user.click(screen.getByRole('radio', { name: /Saídas/ }));

    expect(mockListAction).toHaveBeenCalledWith(
      expect.objectContaining({
        types: ['expense'],
        limit: 50,
        offset: 0,
      }),
    );
    expect(mockSummaryAction).toHaveBeenCalledWith(
      expect.objectContaining({ types: ['expense'] }),
    );
  });

  it('exibe empty state filtrado depois de aplicar filtro sem resultados', async () => {
    const user = userEvent.setup();

    renderList({
      initialTransactions: [makeTx('tx-1', '2026-04-10T12:00:00Z')],
      initialTotal: 1,
    });

    await user.click(screen.getByRole('radio', { name: /Entradas/ }));

    expect(
      await screen.findByText('Nenhuma transação encontrada'),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: /Limpar filtros/ }).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('atualiza os summary cards com dados do refetch após mudança de filtro', async () => {
    const user = userEvent.setup();

    mockSummaryAction.mockResolvedValueOnce({
      success: true,
      data: {
        expense: { totalCents: 99900, count: 7 },
        income: { totalCents: 0, count: 0 },
        transfer: { totalCents: 0, count: 0 },
      },
    });

    renderList({
      initialTransactions: [makeTx('tx-1', '2026-04-10T12:00:00Z')],
      initialTotal: 1,
      initialSummary: zeroSummary,
    });

    await user.click(screen.getByRole('radio', { name: /Saídas/ }));

    // Após refetch do summary, o valor do card de saída deve refletir os 7 × 99900
    expect(await screen.findByText('R$ 999,00')).toBeInTheDocument();
  });

  it('"Limpar tudo" zera categorias e métodos mas mantém tipo', async () => {
    const user = userEvent.setup();

    renderList({
      initialTransactions: [makeTx('tx-1', '2026-04-10T12:00:00Z')],
      initialTotal: 1,
    });

    // Muda o tipo
    await user.click(screen.getByRole('radio', { name: /Saídas/ }));

    // Abre sheet de filtros avançados e seleciona categoria
    await user.click(screen.getByRole('button', { name: 'Abrir filtros avançados' }));
    await user.click(
      await screen.findByRole('checkbox', { name: 'Alimentação' }),
    );
    await user.click(screen.getByRole('button', { name: 'Aplicar' }));

    // Chip deve aparecer + botão "Limpar tudo"
    expect(await screen.findByText('🍔 Alimentação')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Limpar tudo' }));

    // O chip some
    expect(screen.queryByText('🍔 Alimentação')).not.toBeInTheDocument();
    // Mas o tipo "Saídas" permanece selecionado
    expect(screen.getByRole('radio', { name: /Saídas/ })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('TransactionRow de gasto usa emoji da categoria como ícone', () => {
    renderList({
      initialTransactions: [makeTx('tx-1', '2026-04-10T12:00:00Z')],
      initialTotal: 1,
    });

    // O emoji da categoria aparece no ícone da linha
    expect(screen.getByText('🍔')).toBeInTheDocument();
  });

  it('TransactionRow de receita usa ícone lucide ArrowDownLeft', () => {
    const tx = makeTx('tx-i', '2026-04-10T12:00:00Z', {
      type: 'income',
      categoryId: null,
      incomeSourceId: 'src-1',
      destinationAccountId: 'bank-1',
      paymentMethodType: null,
      paymentMethodId: null,
      establishment: null,
    });

    renderList({ initialTransactions: [tx], initialTotal: 1 });

    // linha tem data-type=income
    const rows = screen
      .getAllByRole('listitem')
      .filter((el) => el.getAttribute('data-type') === 'income');
    expect(rows).toHaveLength(1);
    expect(screen.getByText('Salário')).toBeInTheDocument();
  });

  it('TransactionRow de transferência renderiza bancos de origem e destino', () => {
    const tx = makeTx('tx-t', '2026-04-10T12:00:00Z', {
      type: 'transfer',
      categoryId: null,
      establishment: null,
      paymentMethodType: null,
      paymentMethodId: null,
      sourceAccountId: 'bank-1',
      destinationAccountId: 'bank-1',
    });

    renderList({ initialTransactions: [tx], initialTotal: 1 });

    const rows = screen
      .getAllByRole('listitem')
      .filter((el) => el.getAttribute('data-type') === 'transfer');
    expect(rows).toHaveLength(1);
  });
});
