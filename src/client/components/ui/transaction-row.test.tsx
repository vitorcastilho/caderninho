// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { TransactionRow } from './transaction-row';

describe('TransactionRow', () => {
  it('renders expense row with emoji icon, negative sign and muted-foreground amount', () => {
    const { container } = render(
      <ul>
        <TransactionRow
          type="expense"
          primary="Imperatriz"
          secondary="Alimentação"
          amountCents={10000}
          method="Master · Inter"
          icon={{ kind: 'emoji', value: '🛒' }}
        />
      </ul>,
    );

    const li = container.querySelector('[data-slot="transaction-row"]') as HTMLElement;
    expect(li).toBeInTheDocument();
    expect(li.dataset.type).toBe('expense');
    expect(li.className).toContain('border-l-negative');

    expect(screen.getByText('Imperatriz')).toBeInTheDocument();
    expect(screen.getByText('Alimentação')).toBeInTheDocument();
    expect(screen.getByText('🛒')).toBeInTheDocument();
    expect(screen.getByText('Master · Inter')).toBeInTheDocument();
    expect(screen.getByText(/−\s*R\$\s*100,00/)).toBeInTheDocument();
  });

  it('renders income row with lucide icon and positive sign', () => {
    const { container } = render(
      <ul>
        <TransactionRow
          type="income"
          primary="Salário"
          secondary="Receita"
          amountCents={500000}
          icon={{ kind: 'lucide', name: 'ArrowDownLeft' }}
        />
      </ul>,
    );

    const li = container.querySelector('[data-slot="transaction-row"]') as HTMLElement;
    expect(li.dataset.type).toBe('income');
    expect(li.className).toContain('border-l-positive');
    expect(screen.getByText(/\+\s*R\$\s*5\.000,00/)).toBeInTheDocument();
  });

  it('renders transfer row with two bank logos and no sign', () => {
    const { container } = render(
      <ul>
        <TransactionRow
          type="transfer"
          secondary="Transferência"
          amountCents={20000}
          icon={{ kind: 'lucide', name: 'ArrowLeftRight' }}
          transferEndpoints={{
            source: { bank: 'Nubank' },
            destination: { bank: 'Itaú' },
          }}
        />
      </ul>,
    );

    const li = container.querySelector('[data-slot="transaction-row"]') as HTMLElement;
    expect(li.dataset.type).toBe('transfer');
    expect(li.className).toContain('border-l-info');

    // Bank logos render their label (Nu for Nubank, Itaú for Itaú).
    // Itaú appears twice — once in the BankLogo, once as the bank name.
    expect(screen.getByText('Nu')).toBeInTheDocument();
    expect(screen.getAllByText('Itaú').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Nubank')).toBeInTheDocument();
    expect(screen.getByText('→')).toBeInTheDocument();

    const amount = screen.getByText(/R\$\s*200,00/);
    expect(amount.textContent?.trim().startsWith('+')).toBe(false);
    expect(amount.textContent?.trim().startsWith('−')).toBe(false);
  });

  it('renders letter icon when icon.kind is letter', () => {
    render(
      <ul>
        <TransactionRow
          type="expense"
          primary="Padaria"
          secondary="Alimentação"
          amountCents={500}
          icon={{ kind: 'letter', value: 'P' }}
        />
      </ul>,
    );
    expect(screen.getByText('P')).toBeInTheDocument();
  });

  it('calls onClick when row is clicked', () => {
    const onClick = vi.fn();
    render(
      <ul>
        <TransactionRow
          type="expense"
          primary="Padaria"
          secondary="Alimentação"
          amountCents={500}
          icon={{ kind: 'emoji', value: '🥐' }}
          onClick={onClick}
        />
      </ul>,
    );

    fireEvent.click(screen.getByText('Padaria'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('exposes the row content as a focusable native button when onClick is provided (keyboard access)', () => {
    const onClick = vi.fn();
    render(
      <ul>
        <TransactionRow
          type="expense"
          primary="Padaria"
          secondary="Alimentação"
          amountCents={500}
          icon={{ kind: 'emoji', value: '🥐' }}
          onClick={onClick}
          onAction={() => {}}
          actionLabel="Excluir"
        />
      </ul>,
    );

    const main = screen.getByRole('button', { name: /Padaria/ });
    expect(main.tagName).toBe('BUTTON');
    expect(main).toHaveAttribute('type', 'button');
    main.focus();
    expect(main).toHaveFocus();
    // Botão de ação é irmão, não descendente (sem interativo aninhado)
    const action = screen.getByRole('button', { name: 'Excluir' });
    expect(main.contains(action)).toBe(false);
  });

  it('activates onClick with Enter/Space and onAction (not onClick) when the action button is focused', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onAction = vi.fn();
    render(
      <ul>
        <TransactionRow
          type="expense"
          primary="Padaria"
          secondary="Alimentação"
          amountCents={500}
          icon={{ kind: 'emoji', value: '🥐' }}
          onClick={onClick}
          onAction={onAction}
          actionLabel="Excluir"
        />
      </ul>,
    );

    await user.tab();
    expect(screen.getByRole('button', { name: /Padaria/ })).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Excluir' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('does not render an interactive main area when onClick is not provided', () => {
    render(
      <ul>
        <TransactionRow
          type="expense"
          primary="Padaria"
          secondary="Alimentação"
          amountCents={500}
          icon={{ kind: 'emoji', value: '🥐' }}
        />
      </ul>,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onAction without triggering onClick when MoreVertical is clicked (stopPropagation)', () => {
    const onClick = vi.fn();
    const onAction = vi.fn();
    render(
      <ul>
        <TransactionRow
          type="expense"
          primary="Padaria"
          secondary="Alimentação"
          amountCents={500}
          icon={{ kind: 'emoji', value: '🥐' }}
          onClick={onClick}
          onAction={onAction}
          actionLabel="Excluir"
        />
      </ul>,
    );

    const button = screen.getByRole('button', { name: 'Excluir' });
    fireEvent.click(button);

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('uses default action label when actionLabel is not provided', () => {
    const onAction = vi.fn();
    render(
      <ul>
        <TransactionRow
          type="expense"
          primary="Padaria"
          secondary="Alimentação"
          amountCents={500}
          icon={{ kind: 'emoji', value: '🥐' }}
          onAction={onAction}
        />
      </ul>,
    );
    expect(screen.getByRole('button', { name: 'Mais opções' })).toBeInTheDocument();
  });

  it('does not render action button when onAction is not provided', () => {
    render(
      <ul>
        <TransactionRow
          type="expense"
          primary="Padaria"
          secondary="Alimentação"
          amountCents={500}
          icon={{ kind: 'emoji', value: '🥐' }}
        />
      </ul>,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not render method line when method is absent', () => {
    render(
      <ul>
        <TransactionRow
          type="income"
          primary="Salário"
          secondary="Receita"
          amountCents={500000}
          icon={{ kind: 'lucide', name: 'ArrowDownLeft' }}
        />
      </ul>,
    );
    // No method node
    expect(screen.queryByText(/Crédito|Débito|PIX/)).not.toBeInTheDocument();
  });
});
