// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

import { CascadeInput } from './cascade-input';

const mockClassifications = [
  { id: 'ess', name: 'Essencial', emoji: '🏠' },
  { id: 'des', name: 'Desejável', emoji: '🎯' },
];

const mockCategories = [
  { id: 'alim', name: 'Alimentação', classificationId: 'ess', budget: 80000 },
  { id: 'trans', name: 'Transporte', classificationId: 'ess' },
  { id: 'lazer', name: 'Lazer', classificationId: 'des' },
];

const mockPaymentMethods = [
  { id: 'pix', label: 'Pix', type: 'pix' as const },
  { id: 'deb', label: 'Débito Nubank', type: 'debit' as const },
  { id: 'cred', label: 'Crédito Nubank', type: 'credit' as const },
];

const defaultProps = {
  classifications: mockClassifications,
  categories: mockCategories,
  paymentMethods: mockPaymentMethods,
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

describe('CascadeInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('renderização step 1', () => {
    it('renderiza step 1 com campo de valor', () => {
      render(<CascadeInput {...defaultProps} />);
      expect(screen.getByText('Qual o valor?')).toBeInTheDocument();
      expect(screen.getByLabelText('Valor do gasto')).toBeInTheDocument();
    });

    it('renderiza step indicator com 4 dots', () => {
      render(<CascadeInput {...defaultProps} />);
      const stepGroup = screen.getByRole('group', { name: /progresso/i });
      expect(stepGroup).toBeInTheDocument();
      // 4 dots dentro do grupo
      const dots = within(stepGroup).getAllByLabelText(/etapa/i);
      expect(dots).toHaveLength(4);
    });

    it('botão Avançar está desabilitado quando valor é 0', () => {
      render(<CascadeInput {...defaultProps} />);
      expect(screen.getByText('Avançar')).toBeDisabled();
    });
  });

  describe('navegação entre steps', () => {
    it('avança para step 2 quando valor > 0', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...defaultProps} />);

      // Digitar valor
      const input = screen.getByDisplayValue('R$ 0,00');
      await user.clear(input);
      await user.type(input, '5000');

      // Avançar
      await user.click(screen.getByText('Avançar'));
      expect(screen.getByText('Classificação e Categoria')).toBeInTheDocument();
    });

    it('volta de step 2 para step 1', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...defaultProps} />);

      // Step 1: digitar valor e avançar
      const input = screen.getByDisplayValue('R$ 0,00');
      await user.clear(input);
      await user.type(input, '5000');
      await user.click(screen.getByText('Avançar'));

      // Step 2: voltar
      await user.click(screen.getByText('Voltar'));
      expect(screen.getByText('Qual o valor?')).toBeInTheDocument();
    });

    it('navega step 1 → 2 → 3 → 4', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...defaultProps} defaultPaymentMethodId="pix" />);

      // Step 1: valor
      const input = screen.getByDisplayValue('R$ 0,00');
      await user.clear(input);
      await user.type(input, '5000');
      await user.click(screen.getByText('Avançar'));

      // Step 2: classificação + categoria
      await user.click(screen.getByText('🏠 Essencial'));
      await user.click(screen.getByText('Alimentação'));
      await user.click(screen.getByText('Avançar'));

      // Step 3: estabelecimento + pagamento
      expect(screen.getByText('Detalhes')).toBeInTheDocument();
      await user.click(screen.getByText('Avançar'));

      // Step 4: confirmação
      expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument();
    });
  });

  describe('cancelar', () => {
    it('chama onCancel ao clicar Cancelar no step 1', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...defaultProps} />);

      await user.click(screen.getByText('Cancelar'));
      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('confirmar', () => {
    it('emite CascadeInputData correto ao confirmar', async () => {
      const user = userEvent.setup();
      render(
        <CascadeInput
          {...defaultProps}
          suggestedEstablishments={['Supermercado BH']}
          defaultPaymentMethodId="pix"
        />
      );

      // Step 1: valor
      const input = screen.getByDisplayValue('R$ 0,00');
      await user.clear(input);
      await user.type(input, '5000');
      await user.click(screen.getByText('Avançar'));

      // Step 2: classificação + categoria
      await user.click(screen.getByText('🏠 Essencial'));
      await user.click(screen.getByText('Alimentação'));
      await user.click(screen.getByText('Avançar'));

      // Step 3: estabelecimento (usar sugestão) + pagamento já pré-selecionado
      await user.click(screen.getByText('Supermercado BH'));
      await user.click(screen.getByText('Avançar'));

      // Step 4: confirmar
      await user.click(screen.getByRole('button', { name: 'Confirmar' }));

      expect(defaultProps.onConfirm).toHaveBeenCalledWith({
        valueCents: 5000,
        classificationId: 'ess',
        categoryId: 'alim',
        establishment: 'Supermercado BH',
        paymentMethodId: 'pix',
      });
    });
  });

  describe('validação', () => {
    it('valor 0 não permite avançar', () => {
      render(<CascadeInput {...defaultProps} />);
      expect(screen.getByText('Avançar')).toBeDisabled();
    });

    it('categoria obrigatória: não avança sem selecionar', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...defaultProps} />);

      // Step 1: digitar valor e avançar
      const input = screen.getByDisplayValue('R$ 0,00');
      await user.clear(input);
      await user.type(input, '5000');
      await user.click(screen.getByText('Avançar'));

      // Step 2: selecionar apenas classificação (sem categoria)
      await user.click(screen.getByText('🏠 Essencial'));
      // Botão Avançar deve estar desabilitado
      expect(screen.getByText('Avançar')).toBeDisabled();
    });
  });

  describe('step indicator', () => {
    it('step 1 ativo marca primeiro dot como atual', () => {
      render(<CascadeInput {...defaultProps} />);
      const stepGroup = screen.getByRole('group', { name: /progresso/i });
      const dots = within(stepGroup).getAllByLabelText(/etapa/i);
      expect(dots[0]).toHaveAttribute('aria-label', 'Etapa 1: atual');
      expect(dots[1]).toHaveAttribute('aria-label', 'Etapa 2: pendente');
    });
  });

  describe('categorias filtradas por classificação', () => {
    it('mostra categorias apenas da classificação selecionada', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...defaultProps} />);

      // Avançar para step 2
      const input = screen.getByDisplayValue('R$ 0,00');
      await user.clear(input);
      await user.type(input, '5000');
      await user.click(screen.getByText('Avançar'));

      // Selecionar "Desejável"
      await user.click(screen.getByText('🎯 Desejável'));

      // Deve mostrar apenas "Lazer" (classificação "des")
      expect(screen.getByText('Lazer')).toBeInTheDocument();
      // Não deve mostrar categorias da classificação "ess"
      expect(screen.queryByText('Alimentação')).not.toBeInTheDocument();
      expect(screen.queryByText('Transporte')).not.toBeInTheDocument();
    });
  });
});
