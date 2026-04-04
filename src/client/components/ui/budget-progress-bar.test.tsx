// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { BudgetProgressBar } from './budget-progress-bar';

describe('BudgetProgressBar', () => {
  describe('renderização básica', () => {
    it('renderiza com role progressbar', () => {
      render(<BudgetProgressBar spent={5000} budget={10000} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('exibe aria-valuenow com porcentagem correta', () => {
      render(<BudgetProgressBar spent={7500} budget={10000} />);
      const bar = screen.getByRole('progressbar');
      expect(bar).toHaveAttribute('aria-valuenow', '75');
    });

    it('exibe aria-valuemin e aria-valuemax', () => {
      render(<BudgetProgressBar spent={5000} budget={10000} />);
      const bar = screen.getByRole('progressbar');
      expect(bar).toHaveAttribute('aria-valuemin', '0');
      expect(bar).toHaveAttribute('aria-valuemax', '100');
    });

    it('exibe aria-label com label personalizado', () => {
      render(<BudgetProgressBar spent={5000} budget={10000} label="Alimentação" />);
      const bar = screen.getByRole('progressbar');
      expect(bar).toHaveAttribute('aria-label', 'Alimentação: 50% do orçamento utilizado');
    });

    it('exibe aria-label sem label personalizado', () => {
      render(<BudgetProgressBar spent={5000} budget={10000} />);
      const bar = screen.getByRole('progressbar');
      expect(bar).toHaveAttribute('aria-label', '50% do orçamento utilizado');
    });
  });

  describe('faixas de cor', () => {
    it('verde quando percentage < 70%', () => {
      const { container } = render(<BudgetProgressBar spent={3000} budget={10000} />);
      const fill = container.querySelector('[role="progressbar"] > div');
      expect(fill?.className).toContain('bg-green-500');
    });

    it('amarelo quando percentage >= 70% e < 85%', () => {
      const { container } = render(<BudgetProgressBar spent={7500} budget={10000} />);
      const fill = container.querySelector('[role="progressbar"] > div');
      expect(fill?.className).toContain('bg-yellow-500');
    });

    it('laranja quando percentage >= 85% e < 100%', () => {
      const { container } = render(<BudgetProgressBar spent={9200} budget={10000} />);
      const fill = container.querySelector('[role="progressbar"] > div');
      expect(fill?.className).toContain('bg-orange-500');
    });

    it('vermelho quando percentage >= 100%', () => {
      const { container } = render(<BudgetProgressBar spent={11500} budget={10000} />);
      const fill = container.querySelector('[role="progressbar"] > div');
      expect(fill?.className).toContain('bg-red-500');
    });
  });

  describe('variantes', () => {
    it('inline: renderiza label e porcentagem em linha', () => {
      render(
        <BudgetProgressBar
          spent={5000}
          budget={10000}
          label="Alimentação"
          showPercentage
          variant="inline"
        />
      );
      expect(screen.getByText('Alimentação')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('expanded: renderiza valores formatados com showValues', () => {
      render(
        <BudgetProgressBar
          spent={5000}
          budget={10000}
          label="Alimentação"
          showValues
          showPercentage
          variant="expanded"
        />
      );
      expect(screen.getByText('Alimentação')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText(/R\$ 50,00/)).toBeInTheDocument();
      expect(screen.getByText(/R\$ 100,00/)).toBeInTheDocument();
    });

    it('expanded: renderiza status badge', () => {
      render(
        <BudgetProgressBar
          spent={8500}
          budget={10000}
          label="Alimentação"
          showPercentage
          variant="expanded"
        />
      );
      expect(screen.getByText('Próximo do limite')).toBeInTheDocument();
    });

    it('mini: renderiza barra sem texto', () => {
      const { container } = render(
        <BudgetProgressBar
          spent={5000}
          budget={10000}
          label="Alimentação"
          showPercentage
          showValues
          variant="mini"
        />
      );
      // Mini não deve mostrar label nem porcentagem nem valores
      expect(screen.queryByText('Alimentação')).not.toBeInTheDocument();
      expect(screen.queryByText('50%')).not.toBeInTheDocument();
      // Mas deve ter o progressbar
      expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('budget = 0 resulta em 0%', () => {
      render(<BudgetProgressBar spent={5000} budget={0} />);
      const bar = screen.getByRole('progressbar');
      expect(bar).toHaveAttribute('aria-valuenow', '0');
    });

    it('showValues exibe valores na variante expanded', () => {
      render(
        <BudgetProgressBar
          spent={15000}
          budget={10000}
          showValues
          variant="expanded"
        />
      );
      expect(screen.getByText(/R\$ 150,00/)).toBeInTheDocument();
      expect(screen.getByText(/R\$ 100,00/)).toBeInTheDocument();
    });

    it('fill width não excede 100% mesmo com gasto acima do budget', () => {
      const { container } = render(<BudgetProgressBar spent={15000} budget={10000} />);
      const fill = container.querySelector('[role="progressbar"] > div') as HTMLElement;
      expect(fill.style.width).toBe('100%');
    });
  });
});
