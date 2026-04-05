// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

import { InstallmentStrip } from './installment-strip';

describe('InstallmentStrip', () => {
  const defaultProps = {
    amountCents: 8700,
    selected: 0,
    onSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza 5 opções: À vista, 1x, 2x, 3x, 4x', () => {
    render(<InstallmentStrip {...defaultProps} />);
    expect(screen.getByText('À vista')).toBeInTheDocument();
    expect(screen.getByText('1x')).toBeInTheDocument();
    expect(screen.getByText('2x')).toBeInTheDocument();
    expect(screen.getByText('3x')).toBeInTheDocument();
    expect(screen.getByText('4x')).toBeInTheDocument();
  });

  it('mostra resultado à vista quando selected=0', () => {
    render(<InstallmentStrip {...defaultProps} selected={0} />);
    expect(screen.getByText('R$ 87,00 à vista')).toBeInTheDocument();
  });

  it('mostra resultado parcelado quando selected=2', () => {
    render(<InstallmentStrip {...defaultProps} selected={2} />);
    expect(screen.getByText('2x de R$ 43,50')).toBeInTheDocument();
  });

  it('mostra nota de comprometimento quando parcelas > 1', () => {
    render(<InstallmentStrip {...defaultProps} selected={3} />);
    expect(screen.getByText(/comprometimento total/i)).toBeInTheDocument();
    expect(screen.getByText(/R\$ 87,00/)).toBeInTheDocument();
  });

  it('não mostra nota de comprometimento à vista', () => {
    render(<InstallmentStrip {...defaultProps} selected={0} />);
    expect(screen.queryByText(/comprometimento total/i)).not.toBeInTheDocument();
  });

  it('chama onSelect ao clicar uma opção', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<InstallmentStrip {...defaultProps} onSelect={onSelect} />);

    await user.click(screen.getByText('3x'));
    expect(onSelect).toHaveBeenCalledWith(3);
  });

  it('arredonda parcelas para cima (centavos)', () => {
    // 8700 / 3 = 2900 exato
    render(<InstallmentStrip {...defaultProps} amountCents={8700} selected={3} />);
    expect(screen.getByText('3x de R$ 29,00')).toBeInTheDocument();
  });

  it('arredonda parcela ímpares corretamente', () => {
    // 10000 / 3 = 3333.33 → ceil = 3334
    render(<InstallmentStrip {...defaultProps} amountCents={10000} selected={3} />);
    expect(screen.getByText('3x de R$ 33,34')).toBeInTheDocument();
  });

  it('tem role radiogroup com aria-label', () => {
    render(<InstallmentStrip {...defaultProps} />);
    expect(screen.getByRole('radiogroup', { name: /parcelas/i })).toBeInTheDocument();
  });
});
