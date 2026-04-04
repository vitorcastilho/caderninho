// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Wallet } from 'lucide-react';

import { SummaryCard } from './summary-card';

describe('SummaryCard', () => {
  describe('renderização default', () => {
    it('renderiza label e valor', () => {
      render(<SummaryCard label="Saldo Total" value="R$ 5.200,00" />);
      expect(screen.getByText('Saldo Total')).toBeInTheDocument();
      expect(screen.getByText('R$ 5.200,00')).toBeInTheDocument();
    });

    it('gera aria-label com label e valor em role="region"', () => {
      render(<SummaryCard label="Saldo Total" value="R$ 5.200,00" />);
      const card = screen.getByRole('region');
      expect(card.getAttribute('aria-label')).toContain('Saldo Total');
      expect(card.getAttribute('aria-label')).toContain('R$ 5.200,00');
    });
  });

  describe('variante compact', () => {
    it('renderiza em modo compact', () => {
      render(<SummaryCard label="Gastos" value="R$ 1.000,00" variant="compact" />);
      expect(screen.getByText('Gastos')).toBeInTheDocument();
      expect(screen.getByText('R$ 1.000,00')).toBeInTheDocument();
    });
  });

  describe('trend', () => {
    it('positive: exibe seta para cima em verde', () => {
      render(
        <SummaryCard
          label="Receita"
          value="R$ 8.000,00"
          trend="positive"
          trendLabel="+12%"
        />
      );
      expect(screen.getByText('+12%')).toBeInTheDocument();
      // A classe verde está no container do trend
      expect(screen.getByText('+12%').closest('div')).toHaveClass('text-green-600');
    });

    it('negative: exibe seta para baixo em vermelho', () => {
      render(
        <SummaryCard
          label="Gastos"
          value="R$ 3.000,00"
          trend="negative"
          trendLabel="-5%"
        />
      );
      expect(screen.getByText('-5%')).toBeInTheDocument();
      expect(screen.getByText('-5%').closest('div')).toHaveClass('text-red-600');
    });

    it('neutral: exibe label sem seta', () => {
      render(
        <SummaryCard
          label="Saldo"
          value="R$ 2.000,00"
          trend="neutral"
          trendLabel="Sem variação"
        />
      );
      expect(screen.getByText('Sem variação')).toBeInTheDocument();
      expect(screen.getByText('Sem variação').closest('div')).toHaveClass('text-muted-foreground');
    });

    it('positive: aria-label inclui tendência positiva', () => {
      render(
        <SummaryCard
          label="Receita"
          value="R$ 8.000,00"
          trend="positive"
          trendLabel="+12%"
        />
      );
      const card = screen.getByRole('region');
      expect(card.getAttribute('aria-label')).toContain('tendência positiva');
    });

    it('negative: aria-label inclui tendência negativa', () => {
      render(
        <SummaryCard
          label="Gastos"
          value="R$ 3.000,00"
          trend="negative"
        />
      );
      const card = screen.getByRole('region');
      expect(card.getAttribute('aria-label')).toContain('tendência negativa');
    });
  });

  describe('ícone', () => {
    it('renderiza ícone quando fornecido', () => {
      const { container } = render(
        <SummaryCard label="Carteira" value="R$ 1.000,00" icon={Wallet} />
      );
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('não renderiza ícone quando não fornecido', () => {
      const { container } = render(
        <SummaryCard label="Carteira" value="R$ 1.000,00" />
      );
      const svgs = container.querySelectorAll('svg');
      // Nenhum SVG (sem ícone, sem trend)
      expect(svgs).toHaveLength(0);
    });
  });
});
