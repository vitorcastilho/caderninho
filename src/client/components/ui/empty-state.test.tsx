// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import { Building2 } from 'lucide-react';

import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  it('renderiza com ícone, título e descrição', () => {
    render(
      <EmptyState
        icon={Building2}
        title="Nenhuma conta cadastrada"
        description="Cadastre suas contas bancárias."
      />,
    );
    expect(screen.getByText('Nenhuma conta cadastrada')).toBeInTheDocument();
    expect(screen.getByText('Cadastre suas contas bancárias.')).toBeInTheDocument();
  });

  it('renderiza ícone Lucide', () => {
    const { container } = render(
      <EmptyState
        icon={Building2}
        title="Título"
        description="Descrição"
      />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renderiza CTA quando actionLabel e onAction fornecidos', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        icon={Building2}
        title="Título"
        description="Descrição"
        actionLabel="Nova Conta"
        onAction={handleAction}
      />,
    );
    expect(screen.getByRole('button', { name: 'Nova Conta' })).toBeInTheDocument();
  });

  it('não renderiza CTA quando actionLabel não fornecido', () => {
    render(
      <EmptyState
        icon={Building2}
        title="Título"
        description="Descrição"
      />,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('chama onAction ao clicar no CTA', async () => {
    const user = userEvent.setup();
    const handleAction = vi.fn();
    render(
      <EmptyState
        icon={Building2}
        title="Título"
        description="Descrição"
        actionLabel="Nova Conta"
        onAction={handleAction}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Nova Conta' }));
    expect(handleAction).toHaveBeenCalledOnce();
  });
});
