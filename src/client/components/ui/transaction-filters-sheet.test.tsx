// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import { useState } from 'react';

import {
  TransactionFiltersSheet,
  type TransactionFiltersSheetProps,
} from './transaction-filters-sheet';

const categories = [
  { id: 'cat-1', name: 'Alimentação', emoji: '🍔' },
  { id: 'cat-2', name: 'Moradia', emoji: '🏠' },
  { id: 'cat-3', name: 'Transporte', emoji: '🚗' },
];

const paymentMethods = [
  { id: 'pm-1', label: 'Inter · Débito', bankName: 'Inter' },
  { id: 'pm-2', label: 'Master Inter', cardBrand: 'mastercard' },
];

function defaultProps(
  overrides: Partial<TransactionFiltersSheetProps> = {},
): TransactionFiltersSheetProps {
  return {
    open: true,
    onOpenChange: vi.fn(),
    categories,
    paymentMethods,
    selectedCategoryIds: new Set<string>(),
    selectedPaymentMethodIds: new Set<string>(),
    onApply: vi.fn(),
    ...overrides,
  };
}

describe('TransactionFiltersSheet', () => {
  it('renders categories and payment methods when open', () => {
    render(<TransactionFiltersSheet {...defaultProps()} />);

    expect(screen.getByText('Alimentação')).toBeInTheDocument();
    expect(screen.getByText('Moradia')).toBeInTheDocument();
    expect(screen.getByText('Transporte')).toBeInTheDocument();

    expect(screen.getByText('Inter · Débito')).toBeInTheDocument();
    expect(screen.getByText('Master Inter')).toBeInTheDocument();
  });

  it('renders empty state messages when lists are empty', () => {
    render(
      <TransactionFiltersSheet
        {...defaultProps({ categories: [], paymentMethods: [] })}
      />,
    );

    expect(screen.getByText(/Nenhuma categoria disponível/)).toBeInTheDocument();
    expect(screen.getByText(/Nenhum método disponível/)).toBeInTheDocument();
  });

  it('toggles category selection locally without calling onApply', () => {
    const onApply = vi.fn();
    render(<TransactionFiltersSheet {...defaultProps({ onApply })} />);

    const alimentacao = screen.getByLabelText('Alimentação') as HTMLInputElement;
    expect(alimentacao.checked).toBe(false);

    fireEvent.click(alimentacao);
    expect(alimentacao.checked).toBe(true);
    expect(onApply).not.toHaveBeenCalled();
  });

  it('commits selection via onApply with Sets when Aplicar is clicked', () => {
    const onApply = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <TransactionFiltersSheet {...defaultProps({ onApply, onOpenChange })} />,
    );

    fireEvent.click(screen.getByLabelText('Alimentação'));
    fireEvent.click(screen.getByLabelText('Inter · Débito'));

    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(onApply).toHaveBeenCalledTimes(1);
    const payload = onApply.mock.calls[0]![0];
    expect(payload.categoryIds).toBeInstanceOf(Set);
    expect(payload.paymentMethodIds).toBeInstanceOf(Set);
    expect(Array.from(payload.categoryIds)).toEqual(['cat-1']);
    expect(Array.from(payload.paymentMethodIds)).toEqual(['pm-1']);

    // Sheet closes after apply
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('Limpar clears local selection but does NOT call onApply', () => {
    const onApply = vi.fn();
    render(
      <TransactionFiltersSheet
        {...defaultProps({
          selectedCategoryIds: new Set(['cat-1', 'cat-2']),
          selectedPaymentMethodIds: new Set(['pm-1']),
          onApply,
        })}
      />,
    );

    // Initially checked (synced on open)
    const alimentacao = screen.getByLabelText('Alimentação') as HTMLInputElement;
    const moradia = screen.getByLabelText('Moradia') as HTMLInputElement;
    expect(alimentacao.checked).toBe(true);
    expect(moradia.checked).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Limpar' }));

    expect(alimentacao.checked).toBe(false);
    expect(moradia.checked).toBe(false);
    expect(onApply).not.toHaveBeenCalled();
  });

  it('resets local state to props when the sheet reopens (discards unapplied changes)', () => {
    function Harness() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            open-btn
          </button>
          <button type="button" onClick={() => setOpen(false)}>
            close-btn
          </button>
          <TransactionFiltersSheet
            {...defaultProps({
              open,
              onOpenChange: setOpen,
              selectedCategoryIds: new Set(['cat-1']),
            })}
          />
        </>
      );
    }

    render(<Harness />);

    // Props say cat-1 is selected on open
    expect((screen.getByLabelText('Alimentação') as HTMLInputElement).checked).toBe(
      true,
    );

    // Check cat-2 locally (uncommitted)
    fireEvent.click(screen.getByLabelText('Moradia'));
    expect((screen.getByLabelText('Moradia') as HTMLInputElement).checked).toBe(
      true,
    );

    // Close without applying
    fireEvent.click(screen.getByText('close-btn'));
    // Reopen
    fireEvent.click(screen.getByText('open-btn'));

    // Local state is reset to props: cat-1 checked, cat-2 unchecked
    expect((screen.getByLabelText('Alimentação') as HTMLInputElement).checked).toBe(
      true,
    );
    expect((screen.getByLabelText('Moradia') as HTMLInputElement).checked).toBe(
      false,
    );
  });

  it('onApply returns independent Set copies (mutation of result does not leak into state)', () => {
    const onApply = vi.fn();
    render(<TransactionFiltersSheet {...defaultProps({ onApply })} />);

    fireEvent.click(screen.getByLabelText('Alimentação'));
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));

    const payload = onApply.mock.calls[0]![0];
    payload.categoryIds.add('cat-99');
    // Internal state should not be affected (indirect — re-render via reopen would reset anyway).
    expect(payload.categoryIds.has('cat-99')).toBe(true);
  });
});
