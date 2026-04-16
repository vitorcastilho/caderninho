// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

import {
  TransactionFiltersBar,
  formatMonthLabel,
  type TransactionFiltersBarProps,
} from './transaction-filters-bar';

function baseProps(
  overrides: Partial<TransactionFiltersBarProps> = {},
): TransactionFiltersBarProps {
  return {
    search: '',
    type: 'all',
    month: 'all',
    activeFiltersCount: 0,
    onSearchChange: vi.fn(),
    onTypeChange: vi.fn(),
    onMonthClick: vi.fn(),
    onOpenAdvancedFilters: vi.fn(),
    ...overrides,
  };
}

describe('formatMonthLabel', () => {
  it('returns "Todos os meses" when month is "all"', () => {
    expect(formatMonthLabel('all')).toBe('Todos os meses');
  });

  it('formats month as "Abr 2026" (pt-BR)', () => {
    const label = formatMonthLabel({ year: 2026, month: 4 });
    expect(label.toLowerCase()).toContain('abr');
    expect(label).toContain('2026');
    // First char should be uppercase
    expect(label[0]).toBe(label[0]!.toUpperCase());
  });
});

describe('TransactionFiltersBar', () => {
  it('renders search input, type segmented, month pill and Filtros button', () => {
    render(<TransactionFiltersBar {...baseProps()} />);

    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: /tipo/i })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    expect(screen.getByRole('button', { name: /mês/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /filtros avançados/i }),
    ).toBeInTheDocument();
  });

  it('fires onSearchChange when typing', () => {
    const onSearchChange = vi.fn();
    render(<TransactionFiltersBar {...baseProps({ onSearchChange })} />);

    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'café' },
    });

    expect(onSearchChange).toHaveBeenCalledWith('café');
  });

  it('fires onTypeChange with correct id when clicking each segmented option', () => {
    const onTypeChange = vi.fn();
    render(<TransactionFiltersBar {...baseProps({ onTypeChange })} />);

    const [all, expense, income, transfer] = screen.getAllByRole('radio');
    fireEvent.click(expense!);
    fireEvent.click(income!);
    fireEvent.click(transfer!);
    fireEvent.click(all!);

    expect(onTypeChange).toHaveBeenNthCalledWith(1, 'expense');
    expect(onTypeChange).toHaveBeenNthCalledWith(2, 'income');
    expect(onTypeChange).toHaveBeenNthCalledWith(3, 'transfer');
    expect(onTypeChange).toHaveBeenNthCalledWith(4, 'all');
  });

  it('marks the active type with aria-checked=true', () => {
    render(<TransactionFiltersBar {...baseProps({ type: 'income' })} />);
    const income = screen.getByRole('radio', { name: /entradas/i });
    expect(income).toHaveAttribute('aria-checked', 'true');
  });

  it('fires onMonthClick when pill is clicked', () => {
    const onMonthClick = vi.fn();
    render(<TransactionFiltersBar {...baseProps({ onMonthClick })} />);
    fireEvent.click(screen.getByRole('button', { name: /mês/i }));
    expect(onMonthClick).toHaveBeenCalledTimes(1);
  });

  it('fires onOpenAdvancedFilters when Filtros button is clicked', () => {
    const onOpenAdvancedFilters = vi.fn();
    render(
      <TransactionFiltersBar {...baseProps({ onOpenAdvancedFilters })} />,
    );
    fireEvent.click(
      screen.getByRole('button', { name: /filtros avançados/i }),
    );
    expect(onOpenAdvancedFilters).toHaveBeenCalledTimes(1);
  });

  it('shows badge when activeFiltersCount > 0', () => {
    const { container } = render(
      <TransactionFiltersBar {...baseProps({ activeFiltersCount: 3 })} />,
    );
    const badge = container.querySelector(
      '[data-slot="transaction-filters-bar-badge"]',
    );
    expect(badge).toBeInTheDocument();
    expect(badge?.textContent).toBe('3');
  });

  it('does not show badge when activeFiltersCount is 0', () => {
    const { container } = render(
      <TransactionFiltersBar {...baseProps({ activeFiltersCount: 0 })} />,
    );
    expect(
      container.querySelector('[data-slot="transaction-filters-bar-badge"]'),
    ).not.toBeInTheDocument();
  });

  it('applies primary border/bg when filters are active', () => {
    render(<TransactionFiltersBar {...baseProps({ activeFiltersCount: 1 })} />);
    const btn = screen.getByRole('button', { name: /filtros avançados/i });
    expect(btn.className).toContain('border-primary');
    expect(btn.className).toContain('bg-primary-light');
  });

  it('applies neutral border/bg when there are no active filters', () => {
    render(<TransactionFiltersBar {...baseProps({ activeFiltersCount: 0 })} />);
    const btn = screen.getByRole('button', { name: /filtros avançados/i });
    expect(btn.className).toContain('border-border');
    expect(btn.className).toContain('bg-card');
  });

  it('renders formatted month label when month is set', () => {
    render(
      <TransactionFiltersBar
        {...baseProps({ month: { year: 2026, month: 4 } })}
      />,
    );
    const pill = screen.getByRole('button', { name: /mês/i });
    expect(pill.textContent?.toLowerCase()).toContain('abr');
    expect(pill.textContent).toContain('2026');
  });

  it('renders "Todos os meses" label when month="all"', () => {
    render(<TransactionFiltersBar {...baseProps({ month: 'all' })} />);
    expect(screen.getByText('Todos os meses')).toBeInTheDocument();
  });
});
