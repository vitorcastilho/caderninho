// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.mock('@/server/actions/category.actions', () => ({ reactivateCategoryAction: vi.fn() }));
vi.mock('@/server/actions/subcategory.actions', () => ({ reactivateSubcategoryAction: vi.fn() }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { CategoryCard } from './CategoryCard';

const category = {
  id: 'cat-1', name: 'Supermercado', emoji: '🛒', classificationId: 'cl-1',
  budgetMinCents: 300000, budgetMaxCents: null, defaultPaymentMethodType: null,
  defaultPaymentMethodId: null, status: 'active' as const,
};
const subcategories = [{
  id: 'sub-1', name: 'Padaria', emoji: '🥖', categoryId: 'cat-1',
  defaultPaymentMethodType: null, defaultPaymentMethodId: null, status: 'active' as const,
}];

function renderCard(onAddSubcategory = vi.fn()) {
  render(
    <CategoryCard
      category={category}
      subcategories={subcategories}
      establishments={[]}
      bankAccounts={[]}
      creditCards={[]}
      onEdit={vi.fn()}
      onAddSubcategory={onAddSubcategory}
      onEditSubcategory={vi.fn()}
      onAddEstablishment={vi.fn()}
      onEditEstablishment={vi.fn()}
      onStatusChange={vi.fn()}
    />,
  );
  return onAddSubcategory;
}

describe('CategoryCard — acessibilidade (Story 3.4f)', () => {
  it('botões de ícone têm nome acessível que cita a categoria', () => {
    renderCard();
    expect(screen.getByRole('button', { name: 'Adicionar subcategoria em Supermercado' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar categoria Supermercado' })).toBeInTheDocument();
  });

  it('expandir/recolher é um botão real com aria-expanded (acessível por teclado)', async () => {
    const user = userEvent.setup();
    renderCard();
    const toggle = screen.getByRole('button', { name: /^(Expandir|Recolher) Supermercado$/ });
    const before = toggle.getAttribute('aria-expanded');
    toggle.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: /^(Expandir|Recolher) Supermercado$/ }).getAttribute('aria-expanded')).not.toBe(before);
  });

  it('subcategoria expandida expõe "Adicionar estabelecimento em Padaria" e "Editar subcategoria Padaria"', async () => {
    const user = userEvent.setup();
    renderCard();
    const toggle = screen.getByRole('button', { name: /^(Expandir|Recolher) Supermercado$/ });
    if (toggle.getAttribute('aria-expanded') === 'false') await user.click(toggle);
    expect(screen.getByRole('button', { name: 'Adicionar estabelecimento em Padaria' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar subcategoria Padaria' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^(Expandir|Recolher) Padaria$/ })).toBeInTheDocument();
  });
});
