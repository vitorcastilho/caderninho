// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

import { CurrencyInput } from './currency-input';

describe('CurrencyInput', () => {
  it('renderiza com label', () => {
    render(<CurrencyInput value={0} onChange={() => {}} label="Saldo" id="saldo" />);
    expect(screen.getByLabelText('Saldo')).toBeInTheDocument();
  });

  it('exibe R$ 0,00 quando valor é zero', () => {
    render(<CurrencyInput value={0} onChange={() => {}} label="Saldo" />);
    expect(screen.getByDisplayValue('R$ 0,00')).toBeInTheDocument();
  });

  it('exibe valor formatado a partir de centavos', () => {
    render(<CurrencyInput value={1978} onChange={() => {}} label="Saldo" />);
    expect(screen.getByDisplayValue('R$ 19,78')).toBeInTheDocument();
  });

  it('exibe valor alto com separador de milhar', () => {
    render(<CurrencyInput value={150000} onChange={() => {}} label="Saldo" />);
    expect(screen.getByDisplayValue('R$ 1.500,00')).toBeInTheDocument();
  });

  it('emite centavos ao digitar', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<CurrencyInput value={0} onChange={handleChange} label="Saldo" />);

    const input = screen.getByDisplayValue('R$ 0,00');
    await user.clear(input);
    await user.type(input, '1500');

    // A última chamada deve ter o valor final em centavos
    const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe(1500);
  });

  it('usa inputMode numeric', () => {
    render(<CurrencyInput value={0} onChange={() => {}} label="Saldo" />);
    const input = screen.getByDisplayValue('R$ 0,00');
    expect(input).toHaveAttribute('inputMode', 'numeric');
  });

  it('exibe mensagem de erro quando fornecida', () => {
    render(<CurrencyInput value={0} onChange={() => {}} label="Saldo" error="Campo obrigatório" />);
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
  });

  it('não exibe mensagem de erro quando não fornecida', () => {
    render(<CurrencyInput value={0} onChange={() => {}} label="Saldo" />);
    expect(screen.queryByText('Campo obrigatório')).not.toBeInTheDocument();
  });

  it('respeita estado disabled', () => {
    render(<CurrencyInput value={0} onChange={() => {}} label="Saldo" disabled />);
    expect(screen.getByDisplayValue('R$ 0,00')).toBeDisabled();
  });

  it('atualiza display quando value externo muda', () => {
    const { rerender } = render(<CurrencyInput value={100} onChange={() => {}} label="Saldo" />);
    expect(screen.getByDisplayValue('R$ 1,00')).toBeInTheDocument();

    rerender(<CurrencyInput value={5000} onChange={() => {}} label="Saldo" />);
    expect(screen.getByDisplayValue('R$ 50,00')).toBeInTheDocument();
  });
});
