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
  { id: 'super', name: 'Supermercado', categoryId: 'alim', defaultPaymentMethodId: 'cred', defaultPaymentMethodLabel: 'VISA Latam', defaultPaymentMethodBrand: 'visa' },
  { id: 'feira', name: 'Feira', categoryId: 'alim', defaultPaymentMethodId: null, defaultPaymentMethodLabel: null, defaultPaymentMethodBrand: null },
  { id: 'metro', name: 'Metrô', categoryId: 'trans', defaultPaymentMethodId: null, defaultPaymentMethodLabel: null, defaultPaymentMethodBrand: null },
];

const mockPaymentMethods = [
  { id: 'pix', label: 'PIX Nubank', type: 'pix' as const },
  { id: 'deb', label: 'Débito Nubank', type: 'debit' as const },
  { id: 'cred', label: 'VISA Latam', type: 'credit' as const, brand: 'visa' },
];

const defaultProps = {
  classifications: mockClassifications,
  categories: mockCategories,
  subcategories: mockSubcategories,
  paymentMethods: mockPaymentMethods,
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

// ── MOBILE TESTS ──

describe('CascadeInput Mobile', () => {
  const mobileProps = { ...defaultProps, isMobile: true };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('step 1: valor com keypad', () => {
    it('renderiza keypad numérico no step 1', () => {
      render(<CascadeInput {...mobileProps} />);
      expect(screen.getByRole('group', { name: /teclado numérico/i })).toBeInTheDocument();
    });

    it('mostra placeholder ____ quando vazio', () => {
      render(<CascadeInput {...mobileProps} />);
      expect(screen.getByText('____')).toBeInTheDocument();
    });

    it('formata valor ao digitar no keypad', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...mobileProps} />);

      await user.click(screen.getByText('8'));
      await user.click(screen.getByText('7'));
      await user.click(screen.getByText('0'));
      await user.click(screen.getByText('0'));

      expect(screen.getByText('87,00')).toBeInTheDocument();
    });

    it('botão Continuar sempre visível, desabilitado sem valor e habilitado com valor', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...mobileProps} />);

      const btn = screen.getByText('Continuar');
      expect(btn).toBeDisabled();

      await user.click(screen.getByText('5'));
      expect(btn).toBeEnabled();
    });

    it('backspace remove último dígito', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...mobileProps} />);

      await user.click(screen.getByText('1'));
      await user.click(screen.getByText('2'));
      await user.click(screen.getByLabelText('Apagar'));

      expect(screen.getByText('0,01')).toBeInTheDocument();
    });
  });

  describe('step 2: classificação + categoria (selection-driven)', () => {
    async function goToStep2(user: ReturnType<typeof userEvent.setup>) {
      await user.click(screen.getByText('5'));
      await user.click(screen.getByText('0'));
      await user.click(screen.getByText('0'));
      await user.click(screen.getByText('0'));
      await user.click(screen.getByText('Continuar'));
    }

    it('avança para step 2 com classificações', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...mobileProps} />);
      await goToStep2(user);

      expect(screen.getByText('🏠 Essencial')).toBeInTheDocument();
      expect(screen.getByText('🎯 Desejável')).toBeInTheDocument();
    });

    it('mostra categorias filtradas ao selecionar classificação', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...mobileProps} />);
      await goToStep2(user);

      await user.click(screen.getByText('🏠 Essencial'));
      expect(screen.getByText('Alimentação')).toBeInTheDocument();
      expect(screen.getByText('Transporte')).toBeInTheDocument();
      expect(screen.queryByText('Lazer')).not.toBeInTheDocument();
    });

    it('auto-avança para step 3 ao selecionar categoria', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...mobileProps} />);
      await goToStep2(user);

      await user.click(screen.getByText('🏠 Essencial'));
      await user.click(screen.getByText('Alimentação'));

      // Deve estar no step 3 (subcategoria)
      expect(screen.getByText('Supermercado')).toBeInTheDocument();
      expect(screen.getByText('Feira')).toBeInTheDocument();
    });

    it('mostra summary bar com valor no step 2', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...mobileProps} />);
      await goToStep2(user);

      expect(screen.getByText('R$ 50,00')).toBeInTheDocument();
    });

    it('summary bar mostra pill com emoji da classificação + nome da categoria', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...mobileProps} />);
      await goToStep2(user);

      await user.click(screen.getByText('🏠 Essencial'));
      await user.click(screen.getByText('Alimentação'));

      // Step 3: summary bar deve ter emoji + nome
      const summaryBar = screen.getByLabelText('Voltar ao passo anterior');
      expect(summaryBar).toHaveTextContent('🏠 Alimentação');
    });
  });

  describe('step 3: subcategoria (selection-driven)', () => {
    async function goToStep3(user: ReturnType<typeof userEvent.setup>) {
      await user.click(screen.getByText('5'));
      await user.click(screen.getByText('0'));
      await user.click(screen.getByText('0'));
      await user.click(screen.getByText('0'));
      await user.click(screen.getByText('Continuar'));
      await user.click(screen.getByText('🏠 Essencial'));
      await user.click(screen.getByText('Alimentação'));
    }

    it('mostra subcategorias com badge de método de pagamento', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...mobileProps} />);
      await goToStep3(user);

      expect(screen.getByText('Supermercado')).toBeInTheDocument();
      expect(screen.getByText('VISA Latam')).toBeInTheDocument();
    });

    it('auto-avança para step 4 ao selecionar subcategoria', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...mobileProps} />);
      await goToStep3(user);

      await user.click(screen.getByText('Supermercado'));

      // Deve estar no step 4 (onde/pagamento)
      expect(screen.getByText('Onde?', { exact: false })).toBeInTheDocument();
    });

    it('chama onSubcategorySelect ao selecionar', async () => {
      const onSubcategorySelect = vi.fn();
      const user = userEvent.setup();
      render(<CascadeInput {...mobileProps} onSubcategorySelect={onSubcategorySelect} />);
      await goToStep3(user);

      await user.click(screen.getByText('Supermercado'));
      expect(onSubcategorySelect).toHaveBeenCalledWith('super');
    });
  });

  describe('step 4: onde + pagamento', () => {
    async function goToStep4(user: ReturnType<typeof userEvent.setup>) {
      await user.click(screen.getByText('8'));
      await user.click(screen.getByText('7'));
      await user.click(screen.getByText('0'));
      await user.click(screen.getByText('0'));
      await user.click(screen.getByText('Continuar'));
      await user.click(screen.getByText('🏠 Essencial'));
      await user.click(screen.getByText('Alimentação'));
      await user.click(screen.getByText('Supermercado'));
    }

    it('mostra chips de estabelecimento + Outro', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...mobileProps} suggestedEstablishments={['Pão de Açúcar', 'Bistek']} />);
      await goToStep4(user);

      expect(screen.getByText('Pão de Açúcar')).toBeInTheDocument();
      expect(screen.getByText('Bistek')).toBeInTheDocument();
      expect(screen.getByText('+ Outro')).toBeInTheDocument();
    });

    it('mostra input ao clicar + Outro', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...mobileProps} suggestedEstablishments={['Pão de Açúcar']} />);
      await goToStep4(user);

      await user.click(screen.getByText('+ Outro'));
      expect(screen.getByPlaceholderText('Nome do estabelecimento')).toBeInTheDocument();
    });

    it('mostra chips de pagamento com brand badge', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...mobileProps} />);
      await goToStep4(user);

      expect(screen.getByText('PIX Nubank')).toBeInTheDocument();
      expect(screen.getByText('VISA Latam')).toBeInTheDocument();
    });

    it('mostra installment strip quando crédito selecionado', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...mobileProps} />);
      await goToStep4(user);

      // Crédito está pré-selecionado (defaultPaymentMethodId do Supermercado)
      expect(screen.getByRole('radiogroup', { name: /parcelas/i })).toBeInTheDocument();
    });

    it('não mostra installment strip para PIX', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...mobileProps} />);
      await goToStep4(user);

      await user.click(screen.getByText('PIX Nubank'));
      expect(screen.queryByRole('radiogroup', { name: /parcelas/i })).not.toBeInTheDocument();
    });

    it('botão confirmar avança para step 5', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...mobileProps} />);
      await goToStep4(user);

      await user.click(screen.getByText('✓ Confirmar'));

      // Step 5: tela de confirmação com valor grande
      expect(screen.getByText('R$ 87,00')).toBeInTheDocument();
      expect(screen.getByText(/Alimentação/)).toBeInTheDocument();
    });
  });

  describe('step 5: confirmação', () => {
    async function goToStep5(user: ReturnType<typeof userEvent.setup>) {
      await user.click(screen.getByText('8'));
      await user.click(screen.getByText('7'));
      await user.click(screen.getByText('0'));
      await user.click(screen.getByText('0'));
      await user.click(screen.getByText('Continuar'));
      await user.click(screen.getByText('🏠 Essencial'));
      await user.click(screen.getByText('Alimentação'));
      await user.click(screen.getByText('Supermercado'));
      await user.click(screen.getByText('✓ Confirmar'));
    }

    it('mostra valor em 28px bold', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...mobileProps} />);
      await goToStep5(user);

      const amount = screen.getByText('R$ 87,00');
      expect(amount).toHaveClass('text-[28px]', 'font-bold');
    });

    it('mostra breadcrumb visual', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...mobileProps} />);
      await goToStep5(user);

      expect(screen.getByText(/Alimentação/)).toBeInTheDocument();
      expect(screen.getByText(/Supermercado/)).toBeInTheDocument();
    });

    it('mostra link Cancelar (não botão)', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...mobileProps} />);
      await goToStep5(user);

      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });

    it('chama onConfirm com dados completos ao confirmar', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...mobileProps} />);
      await goToStep5(user);

      // Buscar o botão ✓ Confirmar no step 5
      const confirmButtons = screen.getAllByText('✓ Confirmar');
      await user.click(confirmButtons[confirmButtons.length - 1]);

      expect(defaultProps.onConfirm).toHaveBeenCalledWith({
        valueCents: 8700,
        classificationId: 'ess',
        categoryId: 'alim',
        subcategoryId: 'super',
        establishment: '',
        paymentMethodId: 'cred',
        installments: 0,
      });
    });

    it('chama onCancel ao clicar Cancelar', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...mobileProps} />);
      await goToStep5(user);

      await user.click(screen.getByText('Cancelar'));
      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('mostra Enviando... quando isSubmitting', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<CascadeInput {...mobileProps} />);
      await goToStep5(user);

      // Re-render com isSubmitting=true para simular estado de envio
      rerender(<CascadeInput {...mobileProps} isSubmitting />);

      expect(screen.getByText('Enviando...')).toBeInTheDocument();
    });
  });

  describe('summary bar como voltar', () => {
    it('volta ao step anterior ao clicar na summary bar', async () => {
      const user = userEvent.setup();
      render(<CascadeInput {...mobileProps} />);

      // Ir para step 2
      await user.click(screen.getByText('5'));
      await user.click(screen.getByText('0'));
      await user.click(screen.getByText('0'));
      await user.click(screen.getByText('0'));
      await user.click(screen.getByText('Continuar'));

      // Clicar na summary bar para voltar
      await user.click(screen.getByLabelText('Voltar ao passo anterior'));

      // Deve voltar para step 1 (keypad)
      expect(screen.getByRole('group', { name: /teclado numérico/i })).toBeInTheDocument();
    });
  });

  describe('step indicator', () => {
    it('renderiza 5 dots', () => {
      render(<CascadeInput {...mobileProps} />);
      const stepGroup = screen.getByRole('group', { name: /progresso/i });
      const dots = within(stepGroup).getAllByLabelText(/etapa/i);
      expect(dots).toHaveLength(5);
    });

    it('marca step 1 como atual', () => {
      render(<CascadeInput {...mobileProps} />);
      const stepGroup = screen.getByRole('group', { name: /progresso/i });
      const dots = within(stepGroup).getAllByLabelText(/etapa/i);
      expect(dots[0]).toHaveAttribute('aria-label', 'Etapa 1: atual');
      expect(dots[1]).toHaveAttribute('aria-label', 'Etapa 2: pendente');
    });
  });
});

// ── DESKTOP TESTS ──

describe('CascadeInput Desktop', () => {
  const desktopProps = { ...defaultProps, isMobile: false };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza todos os campos visíveis de uma vez', () => {
    render(<CascadeInput {...desktopProps} />);
    expect(screen.getByLabelText('Valor')).toBeInTheDocument();
    expect(screen.getByLabelText('Classificação')).toBeInTheDocument();
  });

  it('não renderiza keypad numérico no desktop', () => {
    render(<CascadeInput {...desktopProps} />);
    expect(screen.queryByRole('group', { name: /teclado numérico/i })).not.toBeInTheDocument();
  });

  it('não renderiza step indicator no desktop', () => {
    render(<CascadeInput {...desktopProps} />);
    expect(screen.queryByRole('group', { name: /progresso/i })).not.toBeInTheDocument();
  });

  it('usa select dropdown para classificação', () => {
    render(<CascadeInput {...desktopProps} />);
    const select = screen.getByRole('combobox', { name: /classificação/i });
    expect(select).toBeInTheDocument();
  });

  it('mostra categorias ao selecionar classificação', async () => {
    const user = userEvent.setup();
    render(<CascadeInput {...desktopProps} />);

    const select = screen.getByRole('combobox', { name: /classificação/i });
    await user.selectOptions(select, 'ess');

    expect(screen.getByText('Alimentação')).toBeInTheDocument();
    expect(screen.getByText('Transporte')).toBeInTheDocument();
  });

  it('mostra subcategorias ao selecionar categoria', async () => {
    const user = userEvent.setup();
    render(<CascadeInput {...desktopProps} />);

    const select = screen.getByRole('combobox', { name: /classificação/i });
    await user.selectOptions(select, 'ess');
    await user.click(screen.getByText('Alimentação'));

    expect(screen.getByText('Supermercado')).toBeInTheDocument();
    expect(screen.getByText('Feira')).toBeInTheDocument();
  });

  it('mostra Onde? e Pagamento ao selecionar subcategoria', async () => {
    const user = userEvent.setup();
    render(<CascadeInput {...desktopProps} />);

    const select = screen.getByRole('combobox', { name: /classificação/i });
    await user.selectOptions(select, 'ess');
    await user.click(screen.getByText('Alimentação'));
    await user.click(screen.getByText('Supermercado'));

    expect(screen.getByText('Onde?', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Pagamento', { exact: false })).toBeInTheDocument();
  });

  it('mostra installment strip quando crédito selecionado', async () => {
    const user = userEvent.setup();
    render(<CascadeInput {...desktopProps} />);

    const select = screen.getByRole('combobox', { name: /classificação/i });
    await user.selectOptions(select, 'ess');
    await user.click(screen.getByText('Alimentação'));
    await user.click(screen.getByText('Supermercado'));

    // Crédito pré-selecionado pela subcategoria Supermercado
    expect(screen.getByRole('radiogroup', { name: /parcelas/i })).toBeInTheDocument();
  });

  it('confirmar chama onConfirm com dados completos', async () => {
    const user = userEvent.setup();
    render(<CascadeInput {...desktopProps} />);

    // Preencher valor
    const input = screen.getByDisplayValue('R$ 0,00');
    await user.clear(input);
    await user.type(input, '5000');

    // Classificação
    const select = screen.getByRole('combobox', { name: /classificação/i });
    await user.selectOptions(select, 'ess');

    // Categoria
    await user.click(screen.getByText('Alimentação'));

    // Subcategoria (pré-seleciona pagamento cred)
    await user.click(screen.getByText('Supermercado'));

    // Confirmar
    await user.click(screen.getByText('✓ Confirmar'));

    expect(defaultProps.onConfirm).toHaveBeenCalledWith({
      valueCents: 5000,
      classificationId: 'ess',
      categoryId: 'alim',
      subcategoryId: 'super',
      establishment: '',
      paymentMethodId: 'cred',
      installments: 0,
    });
  });

  it('botão confirmar desabilitado sem valor', () => {
    render(<CascadeInput {...desktopProps} />);
    const btn = screen.getByText('✓ Confirmar');
    expect(btn).toBeDisabled();
  });

  it('chama onRequestImpact com paymentMethodId da subcategoria (não stale)', async () => {
    const onRequestImpact = vi.fn();
    const user = userEvent.setup();
    render(<CascadeInput {...desktopProps} onRequestImpact={onRequestImpact} />);

    // Classificação + Categoria
    const select = screen.getByRole('combobox', { name: /classificação/i });
    await user.selectOptions(select, 'ess');
    await user.click(screen.getByText('Alimentação'));

    // Clicar em Supermercado (tem defaultPaymentMethodId='cred')
    await user.click(screen.getByText('Supermercado'));

    // onRequestImpact deve ser chamado com 'cred' (da subcategoria), não ''  (valor anterior)
    expect(onRequestImpact).toHaveBeenCalledWith({
      amountCents: 0,
      paymentMethodId: 'cred',
      categoryId: 'alim',
    });
  });
});

// ── Story 3.4e — criar subcategoria sem sair do Novo Gasto ──

import { useState } from 'react';
import type { Subcategory } from './cascade-input';

function CreateHarness({
  isMobile,
  onCreate,
}: {
  isMobile: boolean;
  onCreate: (input: { categoryId: string; name: string }) => void;
}) {
  const [subs, setSubs] = useState<Subcategory[]>(mockSubcategories);
  return (
    <CascadeInput
      {...defaultProps}
      isMobile={isMobile}
      subcategories={subs}
      onCreateSubcategory={async (input) => {
        onCreate(input);
        const created: Subcategory = { id: 'nova-1', name: input.name, categoryId: input.categoryId };
        setSubs((prev) => [...prev, created]); // o consumer acrescenta a nova à lista
        return created;
      }}
    />
  );
}

describe('CascadeInput — nova subcategoria (Story 3.4e)', () => {
  it('desktop: categoria sem subcategorias mostra "+ Nova subcategoria"; criar seleciona e libera Onde?', async () => {
    const onCreate = vi.fn();
    const user = userEvent.setup();
    render(<CreateHarness isMobile={false} onCreate={onCreate} />);

    await user.selectOptions(screen.getByRole('combobox', { name: /classificação/i }), 'des');
    await user.click(screen.getByText('Lazer'));

    await user.click(screen.getByRole('button', { name: '+ Nova subcategoria' }));
    await user.type(screen.getByPlaceholderText('Nome da subcategoria'), 'Cinema');
    await user.click(screen.getByRole('button', { name: 'Criar subcategoria' }));

    expect(onCreate).toHaveBeenCalledWith({ categoryId: 'lazer', name: 'Cinema' });
    expect(await screen.findByText('Onde?', { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cinema/ })).toBeInTheDocument();
  });

  it('desktop: categoria com subcategorias também oferece "+ Nova subcategoria"', async () => {
    const user = userEvent.setup();
    render(<CreateHarness isMobile={false} onCreate={vi.fn()} />);
    await user.selectOptions(screen.getByRole('combobox', { name: /classificação/i }), 'ess');
    await user.click(screen.getByText('Alimentação'));
    expect(screen.getByRole('button', { name: '+ Nova subcategoria' })).toBeInTheDocument();
  });

  it('não cria com nome vazio (botão Criar desabilitado)', async () => {
    const user = userEvent.setup();
    render(<CreateHarness isMobile={false} onCreate={vi.fn()} />);
    await user.selectOptions(screen.getByRole('combobox', { name: /classificação/i }), 'des');
    await user.click(screen.getByText('Lazer'));
    await user.click(screen.getByRole('button', { name: '+ Nova subcategoria' }));
    expect(screen.getByRole('button', { name: 'Criar subcategoria' })).toBeDisabled();
  });

  it('mobile: no passo 3, criar a subcategoria avança para Onde?', async () => {
    const onCreate = vi.fn();
    const user = userEvent.setup();
    render(<CreateHarness isMobile onCreate={onCreate} />);
    await user.click(screen.getByText('5'));
    await user.click(screen.getByText('0'));
    await user.click(screen.getByText('Continuar'));
    await user.click(screen.getByText('🎯 Desejável'));
    await user.click(screen.getByText('Lazer'));

    await user.click(screen.getByRole('button', { name: '+ Nova subcategoria' }));
    await user.type(screen.getByPlaceholderText('Nome da subcategoria'), 'Cinema');
    await user.click(screen.getByRole('button', { name: 'Criar subcategoria' }));

    expect(onCreate).toHaveBeenCalledWith({ categoryId: 'lazer', name: 'Cinema' });
    expect(await screen.findByText('Onde?', { exact: false })).toBeInTheDocument();
  });

  it('sem onCreateSubcategory, o botão não aparece (comportamento anterior)', async () => {
    const user = userEvent.setup();
    render(<CascadeInput {...defaultProps} isMobile={false} />);
    await user.selectOptions(screen.getByRole('combobox', { name: /classificação/i }), 'des');
    await user.click(screen.getByText('Lazer'));
    expect(screen.queryByRole('button', { name: '+ Nova subcategoria' })).not.toBeInTheDocument();
  });
});
