// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

import { ActiveFilterChip } from './active-filter-chip';

describe('ActiveFilterChip', () => {
  it('renderiza o conteúdo do chip', () => {
    render(
      <ActiveFilterChip onRemove={() => {}}>
        <span>🛒</span>
        <span>Mercado</span>
      </ActiveFilterChip>,
    );
    expect(screen.getByText('🛒')).toBeInTheDocument();
    expect(screen.getByText('Mercado')).toBeInTheDocument();
  });

  it('chama onRemove ao clicar no X', () => {
    const onRemove = vi.fn();
    render(<ActiveFilterChip onRemove={onRemove}>Nubank</ActiveFilterChip>);
    fireEvent.click(screen.getByRole('button', { name: 'Remover filtro' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('aceita aria-label customizado para o botão de remover', () => {
    render(
      <ActiveFilterChip onRemove={() => {}} removeLabel="Remover filtro Mercado">
        Mercado
      </ActiveFilterChip>,
    );
    expect(screen.getByRole('button', { name: 'Remover filtro Mercado' })).toBeInTheDocument();
  });
});
