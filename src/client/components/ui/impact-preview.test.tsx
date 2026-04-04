// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { ImpactPreview } from './impact-preview';

describe('ImpactPreview', () => {
  const defaultItems = [
    { label: 'Alimentação', before: 50000, after: 55000 },
    { label: 'Transporte', before: 20000, after: 18000 },
  ];

  describe('renderização básica', () => {
    it('renderiza com role alert', () => {
      render(<ImpactPreview items={defaultItems} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('renderiza labels dos items', () => {
      render(<ImpactPreview items={defaultItems} />);
      expect(screen.getByText('Alimentação')).toBeInTheDocument();
      expect(screen.getByText('Transporte')).toBeInTheDocument();
    });

    it('renderiza valores formatados', () => {
      render(<ImpactPreview items={[{ label: 'Teste', before: 10000, after: 15000 }]} />);
      expect(screen.getByText('R$ 100,00')).toBeInTheDocument();
      expect(screen.getByText('R$ 150,00')).toBeInTheDocument();
    });

    it('gera aria-label descritivo', () => {
      render(<ImpactPreview items={[{ label: 'Teste', before: 10000, after: 15000 }]} />);
      const alert = screen.getByRole('alert');
      expect(alert.getAttribute('aria-label')).toContain('Teste');
      expect(alert.getAttribute('aria-label')).toContain('aumenta');
    });
  });

  describe('setas coloridas', () => {
    it('seta vermelha quando valor aumenta (gasto sobe)', () => {
      const { container } = render(
        <ImpactPreview items={[{ label: 'Teste', before: 10000, after: 15000 }]} />
      );
      const arrow = container.querySelector('svg');
      expect(arrow?.classList.toString()).toContain('text-red-500');
    });

    it('seta verde quando valor diminui (gasto desce)', () => {
      const { container } = render(
        <ImpactPreview items={[{ label: 'Teste', before: 15000, after: 10000 }]} />
      );
      const arrow = container.querySelector('svg');
      expect(arrow?.classList.toString()).toContain('text-green-500');
    });

    it('seta neutra quando valores iguais', () => {
      const { container } = render(
        <ImpactPreview items={[{ label: 'Teste', before: 10000, after: 10000 }]} />
      );
      const arrow = container.querySelector('svg');
      expect(arrow?.classList.toString()).toContain('text-muted-foreground');
    });
  });

  describe('budget bar integrada', () => {
    it('renderiza BudgetProgressBar quando item tem budget', () => {
      render(
        <ImpactPreview
          items={[{ label: 'Alimentação', before: 50000, after: 55000, budget: 80000 }]}
        />
      );
      // O BudgetProgressBar mini tem role="progressbar"
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('não renderiza BudgetProgressBar quando item não tem budget', () => {
      render(
        <ImpactPreview items={[{ label: 'Teste', before: 10000, after: 15000 }]} />
      );
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  describe('badge excede orçamento', () => {
    it('exibe badge "Excede orçamento" quando after > budget', () => {
      render(
        <ImpactPreview
          items={[{ label: 'Alimentação', before: 50000, after: 85000, budget: 80000 }]}
        />
      );
      expect(screen.getByText('Excede orçamento')).toBeInTheDocument();
    });

    it('não exibe badge quando after <= budget', () => {
      render(
        <ImpactPreview
          items={[{ label: 'Alimentação', before: 50000, after: 70000, budget: 80000 }]}
        />
      );
      expect(screen.queryByText('Excede orçamento')).not.toBeInTheDocument();
    });
  });

  describe('border colors', () => {
    it('border-indigo-500 quando normal (nenhum item excede nem está em atenção)', () => {
      const { container } = render(
        <ImpactPreview
          items={[{ label: 'Alimentação', before: 10000, after: 30000, budget: 80000 }]}
        />
      );
      expect(container.firstChild).toHaveClass('border-indigo-500');
    });

    it('border-orange-500 quando algum item está em atenção (>=85% do budget)', () => {
      const { container } = render(
        <ImpactPreview
          items={[{ label: 'Alimentação', before: 50000, after: 70000, budget: 80000 }]}
        />
      );
      expect(container.firstChild).toHaveClass('border-orange-500');
    });

    it('border-red-500 quando algum item excede o budget', () => {
      const { container } = render(
        <ImpactPreview
          items={[{ label: 'Alimentação', before: 50000, after: 90000, budget: 80000 }]}
        />
      );
      expect(container.firstChild).toHaveClass('border-red-500');
    });

    it('warningThreshold não-default: border-orange entre 85% e threshold', () => {
      // 72000/80000 = 90%, threshold=95 → orange (90 >= 85 && 90 <= 95)
      const { container } = render(
        <ImpactPreview
          items={[{ label: 'Alimentação', before: 50000, after: 72000, budget: 80000 }]}
          warningThreshold={95}
        />
      );
      expect(container.firstChild).toHaveClass('border-orange-500');
    });

    it('warningThreshold não-default: border-red acima do threshold', () => {
      // 78000/80000 = 97.5%, threshold=95 → red (97.5 > 95)
      const { container } = render(
        <ImpactPreview
          items={[{ label: 'Alimentação', before: 50000, after: 78000, budget: 80000 }]}
          warningThreshold={95}
        />
      );
      expect(container.firstChild).toHaveClass('border-red-500');
    });

    it('warningThreshold não-default: sem gap entre threshold e 100%', () => {
      // 76000/80000 = 95%, threshold=90 → red (95 > 90)
      const { container } = render(
        <ImpactPreview
          items={[{ label: 'Alimentação', before: 50000, after: 76000, budget: 80000 }]}
          warningThreshold={90}
        />
      );
      expect(container.firstChild).toHaveClass('border-red-500');
    });
  });

  describe('items vazio', () => {
    it('renderiza sem erros com array vazio', () => {
      render(<ImpactPreview items={[]} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
