// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

import { BottomNavigation } from './bottom-navigation';

describe('BottomNavigation', () => {
  const defaultProps = {
    activeItem: 'dashboard',
    onNavigate: vi.fn(),
    onFabClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('renderização', () => {
    it('renderiza navigation com role navigation', () => {
      render(<BottomNavigation {...defaultProps} />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('renderiza 5 itens de navegação', () => {
      render(<BottomNavigation {...defaultProps} />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Orçamentos')).toBeInTheDocument();
      expect(screen.getByText('Checklist')).toBeInTheDocument();
      expect(screen.getByText('Projeção')).toBeInTheDocument();
      // FAB não tem texto "Novo" visível (é aria-label)
      expect(screen.getByLabelText('Registrar nova transação')).toBeInTheDocument();
    });
  });

  describe('item ativo', () => {
    it('aplica aria-current="page" no item ativo', () => {
      render(<BottomNavigation {...defaultProps} activeItem="dashboard" />);
      const dashboardButton = screen.getByText('Dashboard').closest('button');
      expect(dashboardButton).toHaveAttribute('aria-current', 'page');
    });

    it('não aplica aria-current em itens inativos', () => {
      render(<BottomNavigation {...defaultProps} activeItem="dashboard" />);
      const budgetsButton = screen.getByText('Orçamentos').closest('button');
      expect(budgetsButton).not.toHaveAttribute('aria-current');
    });
  });

  describe('FAB click', () => {
    it('chama onFabClick ao clicar no FAB', async () => {
      const user = userEvent.setup();
      render(<BottomNavigation {...defaultProps} />);

      const fab = screen.getByLabelText('Registrar nova transação');
      await user.click(fab);

      expect(defaultProps.onFabClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('navigate click', () => {
    it('chama onNavigate com a key do item clicado', async () => {
      const user = userEvent.setup();
      render(<BottomNavigation {...defaultProps} />);

      await user.click(screen.getByText('Orçamentos'));
      expect(defaultProps.onNavigate).toHaveBeenCalledWith('budgets');

      await user.click(screen.getByText('Checklist'));
      expect(defaultProps.onNavigate).toHaveBeenCalledWith('checklist');
    });
  });

  describe('badges', () => {
    it('renderiza badge com número', () => {
      render(<BottomNavigation {...defaultProps} badges={{ checklist: 3 }} />);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('renderiza "9+" para badges > 9', () => {
      render(<BottomNavigation {...defaultProps} badges={{ checklist: 15 }} />);
      expect(screen.getByText('9+')).toBeInTheDocument();
    });

    it('não renderiza badge quando valor é 0', () => {
      render(<BottomNavigation {...defaultProps} badges={{ checklist: 0 }} />);
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('não renderiza badge quando não fornecido', () => {
      const { container } = render(<BottomNavigation {...defaultProps} />);
      const badges = container.querySelectorAll('.bg-red-500');
      expect(badges).toHaveLength(0);
    });
  });
});
