// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.spyOn(console, 'error').mockImplementation(() => {});

import AppError from './error';

describe('error boundary das páginas logadas (Story 1.11)', () => {
  it('mostra mensagem amigável em vez da tela de "Application error"', () => {
    render(<AppError error={new Error('An unexpected response was received from the server.')} reset={() => {}} />);
    expect(screen.getByText('Algo deu errado ao carregar esta página')).toBeInTheDocument();
    expect(screen.queryByText(/unexpected response/)).not.toBeInTheDocument();
  });

  it('"Tentar de novo" chama reset', () => {
    const reset = vi.fn();
    render(<AppError error={new Error('x')} reset={reset} />);
    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('mostra o digest quando existe (para cruzar com os logs da Vercel)', () => {
    const error = Object.assign(new Error('x'), { digest: '3914836991' });
    render(<AppError error={error} reset={() => {}} />);
    expect(screen.getByText(/3914836991/)).toBeInTheDocument();
  });
});
