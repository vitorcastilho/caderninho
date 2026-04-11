// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

import { EmojiPicker } from './emoji-picker';

describe('EmojiPicker', () => {
  it('renderiza botão trigger com emoji atual', () => {
    render(<EmojiPicker value="🍕" onChange={vi.fn()} />);
    const trigger = screen.getByRole('button', { name: '🍕' });
    expect(trigger).toBeInTheDocument();
  });

  it('botão trigger tem tamanho 48x48 (h-12 w-12)', () => {
    render(<EmojiPicker value="🍕" onChange={vi.fn()} />);
    const trigger = screen.getByRole('button', { name: '🍕' });
    expect(trigger.className).toContain('h-12');
    expect(trigger.className).toContain('w-12');
  });

  it('não mostra picker fechado por padrão', () => {
    render(<EmojiPicker value="🍕" onChange={vi.fn()} />);
    // Picker não deve estar visível — checamos que não há grid de emojis
    expect(screen.queryByText('Alimentação')).not.toBeInTheDocument();
  });

  it('abre picker ao clicar no trigger', async () => {
    const user = userEvent.setup();
    render(<EmojiPicker value="🍕" onChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: '🍕' }));

    // Deve mostrar categorias
    expect(screen.getByText('Alimentação')).toBeInTheDocument();
  });

  it('chama onChange ao selecionar emoji e fecha picker', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<EmojiPicker value="🍕" onChange={handleChange} />);

    // Abrir picker
    await user.click(screen.getByRole('button', { name: '🍕' }));

    // Selecionar um emoji diferente
    const emojiButton = screen.getByRole('button', { name: '🛒' });
    await user.click(emojiButton);

    expect(handleChange).toHaveBeenCalledWith('🛒');
    // Picker deve fechar
    expect(screen.queryByText('Alimentação')).not.toBeInTheDocument();
  });

  it('permite navegar entre categorias', async () => {
    const user = userEvent.setup();
    render(<EmojiPicker value="🍕" onChange={vi.fn()} />);

    // Abrir picker
    await user.click(screen.getByRole('button', { name: '🍕' }));

    // Deve iniciar na categoria Alimentação
    expect(screen.getByText('Alimentação')).toBeInTheDocument();

    // Clicar na aba de Transporte (🚗)
    const transportTab = screen.getByTitle('Transporte');
    await user.click(transportTab);

    expect(screen.getByText('Transporte')).toBeInTheDocument();
  });
});
