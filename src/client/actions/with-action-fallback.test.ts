import { describe, it, expect, vi } from 'vitest';

import { withActionFallback } from './with-action-fallback';

// Code review 1.11 — quando o proxy responde 429 (ou a rede cai), o Next
// rejeita a promise da server action. Isso não chega ao error boundary e os
// componentes ficavam presos (ex.: "Salvando…" para sempre, sem mensagem).
describe('withActionFallback', () => {
  it('repassa o resultado da action quando ela responde', async () => {
    const action = vi.fn().mockResolvedValue({ success: true, data: { id: '1' } });

    const result = await withActionFallback(action)({ a: 1 });

    expect(result).toEqual({ success: true, data: { id: '1' } });
    expect(action).toHaveBeenCalledWith({ a: 1 });
  });

  it('repassa erros de negócio (Result com success: false) sem alterar', async () => {
    const failure = { success: false, error: { code: 'NOT_FOUND', message: 'Não encontrado' } };
    const action = vi.fn().mockResolvedValue(failure);

    expect(await withActionFallback(action)()).toEqual(failure);
  });

  it('transforma o 429 do proxy em Result de erro com mensagem amigável', async () => {
    const action = vi.fn().mockRejectedValue(new Error('Too Many Requests'));

    const result = await withActionFallback(action)();

    expect(result).toEqual({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Muitas ações em pouco tempo. Aguarde alguns segundos e tente de novo.',
      },
    });
  });

  it('transforma falha de rede ou resposta inesperada em Result de erro', async () => {
    const action = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    const result = await withActionFallback(action)();

    expect(result).toEqual({
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Não foi possível concluir agora. Verifique sua conexão e tente de novo.',
      },
    });
  });
});
