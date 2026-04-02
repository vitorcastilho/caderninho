// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

import { PercentageInput } from './percentage-input';

describe('PercentageInput', () => {
  it('renderiza com label', () => {
    render(<PercentageInput value={0} onChange={() => {}} label="Rendimento" id="yield" />);
    expect(screen.getByLabelText('Rendimento')).toBeInTheDocument();
  });

  it('exibe 0,00 quando valor é zero (com sufixo %)', () => {
    render(<PercentageInput value={0} onChange={() => {}} label="Rendimento" />);
    expect(screen.getByDisplayValue('0,00')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('exibe valor formatado a partir de basis points', () => {
    render(<PercentageInput value={2503} onChange={() => {}} label="Rendimento" />);
    expect(screen.getByDisplayValue('25,03')).toBeInTheDocument();
  });

  it('emite basis points ao digitar', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<PercentageInput value={0} onChange={handleChange} label="Rendimento" />);

    const input = screen.getByDisplayValue('0,00');
    await user.clear(input);
    await user.type(input, '11050');

    const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe(11050);
  });

  it('usa inputMode numeric', () => {
    render(<PercentageInput value={0} onChange={() => {}} label="Rendimento" />);
    const input = screen.getByDisplayValue('0,00');
    expect(input).toHaveAttribute('inputMode', 'numeric');
  });

  it('exibe mensagem de erro quando fornecida', () => {
    render(<PercentageInput value={0} onChange={() => {}} label="Rendimento" error="Valor inválido" />);
    expect(screen.getByText('Valor inválido')).toBeInTheDocument();
  });

  it('respeita estado disabled', () => {
    render(<PercentageInput value={0} onChange={() => {}} label="Rendimento" disabled />);
    expect(screen.getByDisplayValue('0,00')).toBeDisabled();
  });

  it('atualiza display quando value externo muda', () => {
    const { rerender } = render(<PercentageInput value={1000} onChange={() => {}} label="Rendimento" />);
    expect(screen.getByDisplayValue('10,00')).toBeInTheDocument();

    rerender(<PercentageInput value={5050} onChange={() => {}} label="Rendimento" />);
    expect(screen.getByDisplayValue('50,50')).toBeInTheDocument();
  });
});
