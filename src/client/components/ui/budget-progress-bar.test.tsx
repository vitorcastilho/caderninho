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

  describe('faixas de cor (≤60% positive, 60-80% attention, 80-100% alert, >100% critical)', () => {
    it('positive quando percentage <= 60%', () => {
      const { container } = render(<BudgetProgressBar spent={6000} budget={10000} />);
      const fill = container.querySelector('[role="progressbar"] > div');
      expect(fill?.className).toContain('bg-positive');
    });

    it('attention quando percentage > 60% e <= 80%', () => {
      const { container } = render(<BudgetProgressBar spent={7500} budget={10000} />);
      const fill = container.querySelector('[role="progressbar"] > div');
      expect(fill?.className).toContain('bg-attention');
    });

    it('alert quando percentage > 80% e <= 100%', () => {
      const { container } = render(<BudgetProgressBar spent={9200} budget={10000} />);
      const fill = container.querySelector('[role="progressbar"] > div');
      expect(fill?.className).toContain('bg-alert');
    });

    it('critical quando percentage > 100%', () => {
      const { container } = render(<BudgetProgressBar spent={11500} budget={10000} />);
      const fill = container.querySelector('[role="progressbar"] > div');
      expect(fill?.className).toContain('bg-critical');
    });

    it('positive no limite exato de 60%', () => {
      const { container } = render(<BudgetProgressBar spent={6000} budget={10000} />);
      const fill = container.querySelector('[role="progressbar"] > div');
      expect(fill?.className).toContain('bg-positive');
    });

    it('attention no limite exato de 80%', () => {
      const { container } = render(<BudgetProgressBar spent={8000} budget={10000} />);
      const fill = container.querySelector('[role="progressbar"] > div');
      expect(fill?.className).toContain('bg-attention');
    });

    it('alert no limite exato de 100%', () => {
      const { container } = render(<BudgetProgressBar spent={10000} budget={10000} />);
      const fill = container.querySelector('[role="progressbar"] > div');
      expect(fill?.className).toContain('bg-alert');
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

    it('expanded: renderiza label "resta" com showRemainder', () => {
      render(
        <BudgetProgressBar
          spent={7000}
          budget={10000}
          showRemainder
          variant="expanded"
        />
      );
      expect(screen.getByText(/70% — resta R\$ 30,00/)).toBeInTheDocument();
    });

    it('expanded: renderiza label "excedeu" quando acima de 100%', () => {
      render(
        <BudgetProgressBar
          spent={12000}
          budget={10000}
          showRemainder
          variant="expanded"
        />
      );
      expect(screen.getByText(/120% — excedeu R\$ 20,00/)).toBeInTheDocument();
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
      expect(screen.queryByText('Alimentação')).not.toBeInTheDocument();
      expect(screen.queryByText('50%')).not.toBeInTheDocument();
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

    it('showRemainder não renderiza quando budget = 0', () => {
      const { container } = render(
        <BudgetProgressBar
          spent={5000}
          budget={0}
          showRemainder
          variant="expanded"
        />
      );
      expect(container.querySelector('.tabular-nums')).not.toBeInTheDocument();
    });
  });
});
