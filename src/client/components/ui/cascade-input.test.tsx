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

const mockSubcategories = [
  { id: 'super', name: 'Supermercado', categoryId: 'alim', defaultPaymentMethodId: 'cred', defaultPaymentMethodLabel: 'Crédito Nubank' },
  { id: 'feira', name: 'Feira', categoryId: 'alim', defaultPaymentMethodId: null, defaultPaymentMethodLabel: null },
  { id: 'metro', name: 'Metrô', categoryId: 'trans', defaultPaymentMethodId: null, defaultPaymentMethodLabel: null },
];

const mockPaymentMethods = [
  { id: 'pix', label: 'Pix', type: 'pix' as const },
  { id: 'deb', label: 'Débito Nubank', type: 'debit' as const },
  { id: 'cred', label: 'Crédito Nubank', type: 'credit' as const },
];

const defaultProps = {
  classifications: mockClassifications,
  categories: mockCategories,
  subcategories: mockSubcategories,
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

    it('renderiza step indicator com 5 dots', () => {
      render(<CascadeInput {...defaultProps} />);
      const stepGroup = screen.getByRole('group', { name: /progresso/i });
      expect(stepGroup).toBeInTheDocument();
      const dots = within(stepGroup).getAllByLabelText(/etapa/i);
      expect(dots).toHaveLength(5);
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

      const input = screen.getByDisplayValue('R$ 0,00');
      await user.clear(input);
      await user.type(input, '5000');

      await user.click(screen.getByText('Avançar'));
      expect(screen.getByText('Classificação e Categoria')).toBeInTheDocument();
    });

    it('volta de step 2 para step 1', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...defaultProps} />);

      const input = screen.getByDisplayValue('R$ 0,00');
      await user.clear(input);
      await user.type(input, '5000');
      await user.click(screen.getByText('Avançar'));

      await user.click(screen.getByText('Voltar'));
      expect(screen.getByText('Qual o valor?')).toBeInTheDocument();
    });

    it('navega step 1 → 2 → 3 → 4 → 5', async () => {
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

      // Step 3: subcategoria
      expect(screen.getByText('Subcategoria')).toBeInTheDocument();
      await user.click(screen.getByText('Supermercado'));
      await user.click(screen.getByText('Avançar'));

      // Step 4: estabelecimento + pagamento
      expect(screen.getByText('Detalhes')).toBeInTheDocument();
      await user.click(screen.getByText('Avançar'));

      // Step 5: confirmação
      expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument();
    });
  });

  describe('subcategoria step', () => {
    it('mostra subcategorias filtradas pela categoria selecionada', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...defaultProps} />);

      // Step 1: valor
      const input = screen.getByDisplayValue('R$ 0,00');
      await user.clear(input);
      await user.type(input, '5000');
      await user.click(screen.getByText('Avançar'));

      // Step 2: classificação + categoria
      await user.click(screen.getByText('🏠 Essencial'));
      await user.click(screen.getByText('Alimentação'));
      await user.click(screen.getByText('Avançar'));

      // Step 3: subcategoria — deve mostrar Supermercado e Feira (categoryId: alim)
      expect(screen.getByText('Supermercado')).toBeInTheDocument();
      expect(screen.getByText('Feira')).toBeInTheDocument();
      // Não deve mostrar subcategorias de outra categoria
      expect(screen.queryByText('Metrô')).not.toBeInTheDocument();
    });

    it('mostra badge do metodo de pagamento sugerido', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...defaultProps} />);

      const input = screen.getByDisplayValue('R$ 0,00');
      await user.clear(input);
      await user.type(input, '5000');
      await user.click(screen.getByText('Avançar'));

      await user.click(screen.getByText('🏠 Essencial'));
      await user.click(screen.getByText('Alimentação'));
      await user.click(screen.getByText('Avançar'));

      // Deve mostrar badge do método de pagamento
      expect(screen.getByText('Crédito Nubank')).toBeInTheDocument();
    });

    it('pre-seleciona metodo de pagamento ao selecionar subcategoria', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...defaultProps} />);

      const input = screen.getByDisplayValue('R$ 0,00');
      await user.clear(input);
      await user.type(input, '5000');
      await user.click(screen.getByText('Avançar'));

      await user.click(screen.getByText('🏠 Essencial'));
      await user.click(screen.getByText('Alimentação'));
      await user.click(screen.getByText('Avançar'));

      // Selecionar Supermercado (tem defaultPaymentMethodId: 'cred')
      await user.click(screen.getByText('Supermercado'));
      await user.click(screen.getByText('Avançar'));

      // No step 4, "Crédito Nubank" deve estar selecionado (visualmente diferente)
      const creditBtn = screen.getByText('Crédito Nubank');
      expect(creditBtn).toHaveClass('border-indigo-500');
    });

    it('chama onSubcategorySelect ao selecionar subcategoria (F2)', async () => {
      const onSubcategorySelect = vi.fn();
      const user = userEvent.setup();
      render(<CascadeInput {...defaultProps} onSubcategorySelect={onSubcategorySelect} />);

      const input = screen.getByDisplayValue('R$ 0,00');
      await user.clear(input);
      await user.type(input, '5000');
      await user.click(screen.getByText('Avançar'));

      await user.click(screen.getByText('🏠 Essencial'));
      await user.click(screen.getByText('Alimentação'));
      await user.click(screen.getByText('Avançar'));

      await user.click(screen.getByText('Supermercado'));
      expect(onSubcategorySelect).toHaveBeenCalledWith('super');
    });
  });

  describe('summary bar (F7)', () => {
    it('mostra summary bar no step 2 com valor', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...defaultProps} />);

      const input = screen.getByDisplayValue('R$ 0,00');
      await user.clear(input);
      await user.type(input, '5000');
      await user.click(screen.getByText('Avançar'));

      // Step 2 deve mostrar o valor na summary bar
      expect(screen.getByText('R$ 50,00')).toBeInTheDocument();
    });

    it('mostra summary bar no step 3 com valor e categoria', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...defaultProps} />);

      const input = screen.getByDisplayValue('R$ 0,00');
      await user.clear(input);
      await user.type(input, '5000');
      await user.click(screen.getByText('Avançar'));

      await user.click(screen.getByText('🏠 Essencial'));
      await user.click(screen.getByText('Alimentação'));
      await user.click(screen.getByText('Avançar'));

      // Step 3 deve mostrar summary bar com valor, classificação e categoria
      expect(screen.getByText(/R\$ 50,00 · Essencial · Alimentação/)).toBeInTheDocument();
    });
  });

  describe('impact preview no step 5 (F9)', () => {
    it('mostra ImpactPreview quando impactData é fornecido', async () => {
      const user = userEvent.setup();
      const impactData = {
        paymentMethodLabel: 'Nubank Conta Corrente',
        balanceBefore: 50000,
        balanceAfter: 42000,
        categoryLabel: 'Alimentação',
        budgetSpent: 45000,
        budgetTotal: 80000,
        budgetPercentage: 56,
      };

      render(
        <CascadeInput
          {...defaultProps}
          defaultPaymentMethodId="pix"
          impactData={impactData}
        />
      );

      // Navegar até step 5
      const input = screen.getByDisplayValue('R$ 0,00');
      await user.clear(input);
      await user.type(input, '5000');
      await user.click(screen.getByText('Avançar'));

      await user.click(screen.getByText('🏠 Essencial'));
      await user.click(screen.getByText('Alimentação'));
      await user.click(screen.getByText('Avançar'));

      await user.click(screen.getByText('Supermercado'));
      await user.click(screen.getByText('Avançar'));

      await user.click(screen.getByText('Avançar'));

      // Step 5: deve mostrar ImpactPreview com dados reais
      expect(screen.getByText('Nubank Conta Corrente')).toBeInTheDocument();
    });
  });

  describe('isSubmitting (F10)', () => {
    it('desabilita botao Confirmar quando isSubmitting=true', async () => {
      const user = userEvent.setup();
      render(
        <CascadeInput
          {...defaultProps}
          defaultPaymentMethodId="pix"
          isSubmitting
        />
      );

      // Navegar até step 5
      const input = screen.getByDisplayValue('R$ 0,00');
      await user.clear(input);
      await user.type(input, '5000');
      await user.click(screen.getByText('Avançar'));

      await user.click(screen.getByText('🏠 Essencial'));
      await user.click(screen.getByText('Alimentação'));
      await user.click(screen.getByText('Avançar'));

      await user.click(screen.getByText('Supermercado'));
      await user.click(screen.getByText('Avançar'));

      await user.click(screen.getByText('Avançar'));

      // Step 5: botão deve mostrar "Enviando..." e estar desabilitado
      expect(screen.getByText('Enviando...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /enviando/i })).toBeDisabled();
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

      // Step 3: subcategoria
      await user.click(screen.getByText('Supermercado'));
      await user.click(screen.getByText('Avançar'));

      // Step 4: estabelecimento (usar sugestão) + pagamento já pré-selecionado
      await user.click(screen.getByText('Supermercado BH'));
      await user.click(screen.getByText('Avançar'));

      // Step 5: confirmar
      await user.click(screen.getByRole('button', { name: 'Confirmar' }));

      expect(defaultProps.onConfirm).toHaveBeenCalledWith({
        valueCents: 5000,
        classificationId: 'ess',
        categoryId: 'alim',
        subcategoryId: 'super',
        establishment: 'Supermercado BH',
        paymentMethodId: 'cred',
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

      const input = screen.getByDisplayValue('R$ 0,00');
      await user.clear(input);
      await user.type(input, '5000');
      await user.click(screen.getByText('Avançar'));

      await user.click(screen.getByText('🏠 Essencial'));
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

      const input = screen.getByDisplayValue('R$ 0,00');
      await user.clear(input);
      await user.type(input, '5000');
      await user.click(screen.getByText('Avançar'));

      await user.click(screen.getByText('🎯 Desejável'));

      expect(screen.getByText('Lazer')).toBeInTheDocument();
      expect(screen.queryByText('Alimentação')).not.toBeInTheDocument();
      expect(screen.queryByText('Transporte')).not.toBeInTheDocument();
    });
  });

  describe('onRequestImpact (F3)', () => {
    it('chama onRequestImpact ao avançar do step 4 para step 5', async () => {
      const onRequestImpact = vi.fn();
      const user = userEvent.setup();
      render(
        <CascadeInput
          {...defaultProps}
          defaultPaymentMethodId="pix"
          onRequestImpact={onRequestImpact}
        />
      );

      const input = screen.getByDisplayValue('R$ 0,00');
      await user.clear(input);
      await user.type(input, '5000');
      await user.click(screen.getByText('Avançar'));

      await user.click(screen.getByText('🏠 Essencial'));
      await user.click(screen.getByText('Alimentação'));
      await user.click(screen.getByText('Avançar'));

      await user.click(screen.getByText('Supermercado'));
      await user.click(screen.getByText('Avançar'));

      // Step 4 → Step 5: deve chamar onRequestImpact
      await user.click(screen.getByText('Avançar'));

      expect(onRequestImpact).toHaveBeenCalledWith({
        amountCents: 5000,
        paymentMethodId: 'cred',
        categoryId: 'alim',
      });
    });
  });
});
