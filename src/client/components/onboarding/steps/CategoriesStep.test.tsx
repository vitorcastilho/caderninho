// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

const mockCreateCategory = vi.fn();
const mockCreateSubcategory = vi.fn();

vi.mock('@/server/actions/category.actions', () => ({
  createCategoryAction: (...args: unknown[]) => mockCreateCategory(...args),
}));
vi.mock('@/server/actions/subcategory.actions', () => ({
  createSubcategoryAction: (...args: unknown[]) => mockCreateSubcategory(...args),
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { CategoriesStep } from './CategoriesStep';

const classifications = [
  { id: 'cl-ess', name: 'Essenciais' },
  { id: 'cl-qv', name: 'Qualidade de Vida' },
];

describe('CategoriesStep — Story 3.4e', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateCategory.mockImplementation(async (input: { name: string }) => ({
      success: true,
      data: { id: `cat-${input.name}`, name: input.name },
    }));
    mockCreateSubcategory.mockImplementation(async (input: { name: string; categoryId: string }) => ({
      success: true,
      data: { id: `sub-${input.name}`, name: input.name, categoryId: input.categoryId },
    }));
  });

  function renderStep(onNext = vi.fn()) {
    render(
      <CategoriesStep
        classifications={classifications}
        existingCategories={[]}
        onNext={onNext}
        onSkip={vi.fn()}
        onCategoriesCreated={vi.fn()}
      />,
    );
    return onNext;
  }

  it('cria as categorias com o emoji sugerido (antes todas ficavam 📁)', async () => {
    const user = userEvent.setup();
    const onNext = renderStep();
    await user.click(screen.getByRole('button', { name: 'Próximo' }));
    await waitFor(() => expect(onNext).toHaveBeenCalled());

    expect(mockCreateCategory).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Supermercado', emoji: '🛒' }),
    );
    expect(mockCreateCategory).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Restaurante', emoji: '🍕' }),
    );
  });

  it('cria as subcategorias sugeridas dentro de cada categoria (Supermercado › Padaria...)', async () => {
    const user = userEvent.setup();
    const onNext = renderStep();
    await user.click(screen.getByRole('button', { name: 'Próximo' }));
    await waitFor(() => expect(onNext).toHaveBeenCalled());

    const calls = mockCreateSubcategory.mock.calls.map((c) => c[0] as { name: string; categoryId: string });
    const supermercado = calls.filter((c) => c.categoryId === 'cat-Supermercado').map((c) => c.name);
    expect(supermercado).toEqual(
      expect.arrayContaining(['Compra do mês', 'Reposição da semana', 'Padaria', 'Hortifrúti', 'Açougue']),
    );
    const moradia = calls.filter((c) => c.categoryId === 'cat-Moradia').map((c) => c.name);
    expect(moradia).toEqual(expect.arrayContaining(['Aluguel', 'Condomínio', 'Luz', 'Água', 'Gás', 'IPTU']));
    // toda categoria sugerida ganha subcategorias
    for (const cat of ['Supermercado', 'Moradia', 'Gasolina', 'Internet/Telefone', 'Educação', 'Restaurante']) {
      expect(calls.some((c) => c.categoryId === `cat-${cat}`)).toBe(true);
    }
  });

  it('mostra quais subcategorias vêm junto com cada sugestão', () => {
    renderStep();
    expect(screen.getByText(/Compra do mês, Reposição da semana, Padaria, Hortifrúti, Açougue/)).toBeInTheDocument();
  });

  it('categoria desmarcada não cria categoria nem subcategorias', async () => {
    const user = userEvent.setup();
    const onNext = renderStep();
    const toggles = screen.getAllByRole('button', { name: /✓|Desmarcar|Remover/ });
    await user.click(toggles[0]!); // desmarca a primeira sugestão (Supermercado)
    await user.click(screen.getByRole('button', { name: 'Próximo' }));
    await waitFor(() => expect(onNext).toHaveBeenCalled());
    expect(mockCreateCategory).not.toHaveBeenCalledWith(expect.objectContaining({ name: 'Supermercado' }));
    expect(mockCreateSubcategory.mock.calls.some((c) => (c[0] as { categoryId: string }).categoryId === 'cat-Supermercado')).toBe(false);
  });
});
