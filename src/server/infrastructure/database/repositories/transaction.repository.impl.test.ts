import { describe, it, expect, vi } from 'vitest';

vi.mock('@/server/infrastructure/database/client', () => ({
  db: {},
}));

import { escapeLikePattern } from './transaction.repository.impl';

describe('escapeLikePattern', () => {
  it('não altera strings sem wildcards', () => {
    expect(escapeLikePattern('mercado')).toBe('mercado');
    expect(escapeLikePattern('Padaria 2')).toBe('Padaria 2');
  });

  it('escapa o caractere percent (%)', () => {
    expect(escapeLikePattern('100%')).toBe('100\\%');
    expect(escapeLikePattern('%desconto%')).toBe('\\%desconto\\%');
  });

  it('escapa o caractere underscore (_)', () => {
    expect(escapeLikePattern('loja_x')).toBe('loja\\_x');
  });

  it('escapa a barra invertida (\\)', () => {
    expect(escapeLikePattern('caminho\\teste')).toBe('caminho\\\\teste');
  });

  it('escapa múltiplos wildcards simultâneos', () => {
    expect(escapeLikePattern('a%b_c\\d')).toBe('a\\%b\\_c\\\\d');
  });

  it('retorna string vazia quando a entrada é vazia', () => {
    expect(escapeLikePattern('')).toBe('');
  });
});
