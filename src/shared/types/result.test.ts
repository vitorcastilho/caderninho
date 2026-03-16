import type { Result } from './result';

describe('Result<T>', () => {
  it('deve representar sucesso com dados tipados', () => {
    const result: Result<{ id: string }> = {
      success: true,
      data: { id: '123' },
    };
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('123');
    }
  });

  it('deve representar erro com código e mensagem', () => {
    const result: Result<never> = {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos' },
    };
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toBe('Dados inválidos');
    }
  });

  it('deve suportar details opcionais em erros', () => {
    const result: Result<never> = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: { amountCents: 'Valor deve ser positivo' },
      },
    };
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.details?.amountCents).toBe('Valor deve ser positivo');
    }
  });
});
