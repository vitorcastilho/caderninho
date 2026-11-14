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

  it('period="all" drops "no mês" from desktop labels (totais sem recorte de mês)', () => {
    render(<TransactionSummaryCards {...sample} period="all" />);

    expect(screen.queryByText('Saídas no mês')).not.toBeInTheDocument();
    expect(screen.queryByText('Entradas no mês')).not.toBeInTheDocument();
    // desktop + mobile agora têm o mesmo texto para Saídas/Entradas
    expect(screen.getAllByText('Saídas')).toHaveLength(2);
    expect(screen.getAllByText('Entradas')).toHaveLength(2);
    expect(screen.getByText('Transferências')).toBeInTheDocument();
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

  it('compact variant renders only abbreviated labels (no desktop strings)', () => {
    render(<TransactionSummaryCards {...sample} compact />);

    expect(screen.getByText('Saídas')).toBeInTheDocument();
    expect(screen.getByText('Entradas')).toBeInTheDocument();
    expect(screen.getByText('Transf.')).toBeInTheDocument();

    // Desktop labels must NOT be rendered when compact is forced
    expect(screen.queryByText('Saídas no mês')).not.toBeInTheDocument();
    expect(screen.queryByText('Entradas no mês')).not.toBeInTheDocument();
    expect(screen.queryByText('Transferências')).not.toBeInTheDocument();
    expect(screen.queryByText('transações')).not.toBeInTheDocument();
    expect(screen.queryByText('movimentações')).not.toBeInTheDocument();
  });

  it('compact skeleton variant does not apply md: height class', () => {
    const { container } = render(
      <TransactionSummaryCards {...sample} compact isLoading />,
    );
    const skeletons = container.querySelectorAll(
      '[data-slot="transaction-summary-cards-loading"] > *',
    );
    expect(skeletons).toHaveLength(3);
    skeletons.forEach((s) => {
      expect(s.className).not.toContain('md:h-[92px]');
    });
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
