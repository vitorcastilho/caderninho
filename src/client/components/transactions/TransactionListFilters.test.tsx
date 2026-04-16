// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';

import { createLocalStorageMock } from '@/client/test-utils/local-storage-mock';

vi.stubGlobal('localStorage', createLocalStorageMock());

import {
  TransactionListFilters,
  type TransactionListFiltersState,
} from './TransactionListFilters';

const categories = [
  { id: 'cat-1', name: 'Alimentação', classificationId: 'cl-1' },
  { id: 'cat-2', name: 'Transporte', classificationId: 'cl-1' },
];

const bankAccounts = [
  { id: 'bank-1', name: 'Corrente', bank: 'Nubank', status: 'active', balanceCents: 100000 },
];

const creditCards = [
  { id: 'cc-1', name: 'Platinum', brand: 'Visa', status: 'active' },
];

function buildFilters(
  overrides: Partial<TransactionListFiltersState> = {},
): TransactionListFiltersState {
  return {
    search: '',
    type: 'all',
    categoryIds: new Set<string>(),
    paymentMethodIds: new Set<string>(),
    month: 'all',
    ...overrides,
  };
}

function renderFilters(
  filters: TransactionListFiltersState,
  handlers: Partial<React.ComponentProps<typeof TransactionListFilters>> = {},
) {
  const onSearchChange = handlers.onSearchChange ?? vi.fn();
  const onTypeChange = handlers.onTypeChange ?? vi.fn();
  const onToggleCategory = handlers.onToggleCategory ?? vi.fn();
  const onTogglePaymentMethod = handlers.onTogglePaymentMethod ?? vi.fn();
  const onMonthChange = handlers.onMonthChange ?? vi.fn();
  const onClearAll = handlers.onClearAll ?? vi.fn();

  const utils = render(
    <TransactionListFilters
      filters={filters}
      categories={categories}
      bankAccounts={bankAccounts}
      creditCards={creditCards}
      onSearchChange={onSearchChange}
      onTypeChange={onTypeChange}
      onToggleCategory={onToggleCategory}
      onTogglePaymentMethod={onTogglePaymentMethod}
      onMonthChange={onMonthChange}
      onClearAll={onClearAll}
    />,
  );

  return {
    ...utils,
    handlers: {
      onSearchChange,
      onTypeChange,
      onToggleCategory,
      onTogglePaymentMethod,
      onMonthChange,
      onClearAll,
    },
  };
}

describe('TransactionListFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza chips de tipo, categorias e métodos', () => {
    renderFilters(buildFilters());

    expect(screen.getByRole('button', { name: 'Tudo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Saídas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entradas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Transferências' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Alimentação' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Transporte' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Nubank · Corrente' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Visa · Platinum' })).toBeInTheDocument();
  });

  it('não mostra "Limpar filtros" quando nenhum filtro está ativo', () => {
    renderFilters(buildFilters());
    expect(screen.queryByRole('button', { name: /Limpar filtros/ })).not.toBeInTheDocument();
  });

  it('mostra "Limpar filtros" quando algum filtro está ativo', () => {
    renderFilters(buildFilters({ type: 'expense' }));
    expect(screen.getByRole('button', { name: /Limpar filtros/ })).toBeInTheDocument();
  });

  it('chama onTypeChange ao clicar num chip de tipo', async () => {
    const user = userEvent.setup();
    const { handlers } = renderFilters(buildFilters());
    await user.click(screen.getByRole('button', { name: 'Saídas' }));
    expect(handlers.onTypeChange).toHaveBeenCalledWith('expense');
  });

  it('chama onToggleCategory ao clicar num chip de categoria', async () => {
    const user = userEvent.setup();
    const { handlers } = renderFilters(buildFilters());
    await user.click(screen.getByRole('button', { name: 'Alimentação' }));
    expect(handlers.onToggleCategory).toHaveBeenCalledWith('cat-1');
  });

  it('chama onTogglePaymentMethod ao clicar num método', async () => {
    const user = userEvent.setup();
    const { handlers } = renderFilters(buildFilters());
    await user.click(screen.getByRole('button', { name: 'Nubank · Corrente' }));
    expect(handlers.onTogglePaymentMethod).toHaveBeenCalledWith('bank-1');
  });

  it('chama onSearchChange ao digitar no campo de busca', async () => {
    const user = userEvent.setup();
    const { handlers } = renderFilters(buildFilters());
    const input = screen.getByLabelText('Buscar transações');
    await user.type(input, 'merc');
    expect(handlers.onSearchChange).toHaveBeenCalled();
  });

  it('chama onClearAll ao clicar em "Limpar filtros"', async () => {
    const user = userEvent.setup();
    const { handlers } = renderFilters(
      buildFilters({ categoryIds: new Set(['cat-1']) }),
    );
    await user.click(screen.getByRole('button', { name: /Limpar filtros/ }));
    expect(handlers.onClearAll).toHaveBeenCalled();
  });

  it('inclui o mês selecionado nas options quando ele cai fora dos últimos 12 meses', () => {
    // Cenário: usuário navegou via setas para um mês no futuro (ex: mês +1).
    // Sem o fix, o `<select>` exibia "Tudo" porque o value não batia com nenhuma option.
    const now = new Date();
    const futureYear = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
    const futureMonth = now.getMonth() === 11 ? 1 : now.getMonth() + 2; // mês atual+1 (1-indexed)

    renderFilters(buildFilters({ month: { year: futureYear, month: futureMonth } }));

    const select = screen.getByLabelText('Selecionar mês') as HTMLSelectElement;
    const expectedValue = `${futureYear}-${String(futureMonth).padStart(2, '0')}`;

    expect(select.value).toBe(expectedValue);
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toContain(expectedValue);
  });

  it('marca chip ativo com aria-pressed=true', () => {
    renderFilters(
      buildFilters({
        type: 'expense',
        categoryIds: new Set(['cat-1']),
      }),
    );
    expect(screen.getByRole('button', { name: 'Saídas' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Alimentação' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
