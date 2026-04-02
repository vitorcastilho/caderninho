// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { PageHeader } from './page-header';

describe('PageHeader', () => {
  it('renderiza título como H1', () => {
    render(<PageHeader title="Contas Bancárias" />);
    const heading = screen.getByRole('heading', { level: 1, name: 'Contas Bancárias' });
    expect(heading).toBeInTheDocument();
  });

  it('H1 tem classes corretas', () => {
    render(<PageHeader title="Contas" />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.className).toContain('text-2xl');
    expect(heading.className).toContain('font-bold');
  });

  it('renderiza descrição quando fornecida', () => {
    render(<PageHeader title="Categorias" description="Organize seus gastos" />);
    expect(screen.getByText('Organize seus gastos')).toBeInTheDocument();
  });

  it('não renderiza descrição quando não fornecida', () => {
    render(<PageHeader title="Contas" />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.parentElement?.querySelector('p')).toBeNull();
  });

  it('renderiza children quando fornecidos', () => {
    render(
      <PageHeader title="Contas">
        <button>Nova Conta</button>
      </PageHeader>,
    );
    expect(screen.getByRole('button', { name: 'Nova Conta' })).toBeInTheDocument();
  });

  it('não renderiza container de children quando não fornecidos', () => {
    const { container } = render(<PageHeader title="Contas" />);
    // O wrapper de children (shrink-0) não deve existir
    const wrapper = container.querySelector('.shrink-0');
    expect(wrapper).toBeNull();
  });
});
