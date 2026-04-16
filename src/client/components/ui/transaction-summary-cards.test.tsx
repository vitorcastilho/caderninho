// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { TransactionSummaryCards } from './transaction-summary-cards';

describe('TransactionSummaryCards', () => {
  const sample = {
    expense: { totalCents: 124700, count: 12 },
    income: { totalCents: 133498, count: 2 },
    transfer: { totalCents: 48303, count: 2 },
  };

  it('renders 3 cards with correct values and counts', () => {
    const { container } = render(<TransactionSummaryCards {...sample} />);

    const cards = container.querySelectorAll('[data-slot="transaction-summary-card"]');
    expect(cards).toHaveLength(3);

    expect(cards[0]!.getAttribute('data-key')).toBe('expense');
    expect(cards[1]!.getAttribute('data-key')).toBe('income');
    expect(cards[2]!.getAttribute('data-key')).toBe('transfer');

    expect(screen.getByText(/R\$\s*1\.247,00/)).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*1\.334,98/)).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*483,03/)).toBeInTheDocument();
  });

  it('renders desktop and mobile labels (both exist in DOM, toggled via classes)', () => {
    render(<TransactionSummaryCards {...sample} />);

    // Desktop labels
    expect(screen.getByText('Saídas no mês')).toBeInTheDocument();
    expect(screen.getByText('Entradas no mês')).toBeInTheDocument();
    expect(screen.getByText('Transferências')).toBeInTheDocument();

    // Mobile labels
    expect(screen.getByText('Saídas')).toBeInTheDocument();
    expect(screen.getByText('Entradas')).toBeInTheDocument();
    expect(screen.getByText('Transf.')).toBeInTheDocument();
  });

  it('renders zero state when totalCents=0 and count=0 (does not hide card)', () => {
    const { container } = render(
      <TransactionSummaryCards
        expense={{ totalCents: 0, count: 0 }}
        income={{ totalCents: 0, count: 0 }}
        transfer={{ totalCents: 0, count: 0 }}
      />,
    );

    const cards = container.querySelectorAll('[data-slot="transaction-summary-card"]');
    expect(cards).toHaveLength(3);
    expect(screen.getAllByText(/R\$\s*0,00/)).toHaveLength(3);
  });

  it('renders skeleton variant when isLoading=true', () => {
    const { container } = render(
      <TransactionSummaryCards {...sample} isLoading />,
    );

    expect(
      container.querySelector('[data-slot="transaction-summary-cards-loading"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="transaction-summary-cards"]'),
    ).not.toBeInTheDocument();
  });

  it('applies correct label color classes per card', () => {
    const { container } = render(<TransactionSummaryCards {...sample} />);

    const cards = container.querySelectorAll('[data-slot="transaction-summary-card"]');
    const expenseLabel = cards[0]!.querySelector('.text-negative');
    const incomeLabel = cards[1]!.querySelector('.text-positive-text');
    const transferLabel = cards[2]!.querySelector('.text-info-text');

    expect(expenseLabel).toBeInTheDocument();
    expect(incomeLabel).toBeInTheDocument();
    expect(transferLabel).toBeInTheDocument();
  });
});
