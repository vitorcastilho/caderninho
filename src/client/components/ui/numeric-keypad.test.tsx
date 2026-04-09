// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

import { NumericKeypad } from './numeric-keypad';

describe('NumericKeypad', () => {
  it('renderiza grid 3×4 com 10 dígitos + backspace', () => {
    render(<NumericKeypad onDigit={vi.fn()} onBackspace={vi.fn()} />);
    for (let i = 0; i <= 9; i++) {
      expect(screen.getByText(String(i))).toBeInTheDocument();
    }
    expect(screen.getByLabelText('Apagar')).toBeInTheDocument();
  });

  it('chama onDigit ao clicar um número', async () => {
    const onDigit = vi.fn();
    const user = userEvent.setup();
    render(<NumericKeypad onDigit={onDigit} onBackspace={vi.fn()} />);

    await user.click(screen.getByText('5'));
    expect(onDigit).toHaveBeenCalledWith('5');
  });

  it('chama onBackspace ao clicar apagar', async () => {
    const onBackspace = vi.fn();
    const user = userEvent.setup();
    render(<NumericKeypad onDigit={vi.fn()} onBackspace={onBackspace} />);

    await user.click(screen.getByLabelText('Apagar'));
    expect(onBackspace).toHaveBeenCalledTimes(1);
  });

  it('cada tecla tem height de 52px', () => {
    render(<NumericKeypad onDigit={vi.fn()} onBackspace={vi.fn()} />);
    const key = screen.getByText('1');
    expect(key).toHaveClass('h-[52px]');
  });

  it('tem role group com aria-label', () => {
    render(<NumericKeypad onDigit={vi.fn()} onBackspace={vi.fn()} />);
    expect(screen.getByRole('group', { name: /teclado numérico/i })).toBeInTheDocument();
  });
});
