import type { Result } from '@/shared/types';
import { ok, err } from './result';

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

describe('ok()', () => {
  it('deve retornar { success: true, data }', () => {
    const result = ok({ id: '123', name: 'Test' });

    expect(result).toEqual({ success: true, data: { id: '123', name: 'Test' } });
  });

  it('deve permitir type narrowing para acessar data', () => {
    const result: Result<{ id: string }> = ok({ id: '456' });

    if (result.success) {
      expect(result.data.id).toBe('456');
    } else {
      throw new Error('Deveria ser sucesso');
    }
  });
});

describe('err()', () => {
  it('deve retornar { success: false, error: { code, message } }', () => {
    const result = err('NOT_FOUND', 'Recurso nao encontrado');

    expect(result).toEqual({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Recurso nao encontrado' },
    });
  });

  it('deve incluir details quando fornecido', () => {
    const result = err('VALIDATION_ERROR', 'Dados invalidos', { email: 'Email invalido' });

    expect(result).toEqual({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dados invalidos',
        details: { email: 'Email invalido' },
      },
    });
  });

  it('deve permitir type narrowing para acessar error', () => {
    const result: Result<string> = err('FORBIDDEN', 'Acesso negado');

    if (!result.success) {
      expect(result.error.code).toBe('FORBIDDEN');
      expect(result.error.message).toBe('Acesso negado');
    } else {
      throw new Error('Deveria ser erro');
    }
  });
});
