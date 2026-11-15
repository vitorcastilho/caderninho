import type { Result } from '@/shared/types/result';

/**
 * Envolve uma server action para uso no navegador.
 *
 * As actions já devolvem `Result` para erros de negócio. Mas quando a
 * requisição nem chega a ser processada — o proxy responde 429 (rate limit),
 * a rede cai ou volta uma resposta inesperada — o Next rejeita a promise.
 * Essa rejeição não chega ao error boundary (`app/(app)/error.tsx`) e deixava
 * os componentes presos (ex.: botão em "Salvando…" sem nenhuma mensagem).
 *
 * Aqui a rejeição vira um `Result` de erro, que os componentes já tratam
 * (toast, estado de envio liberado, dados preservados para tentar de novo).
 */
export function withActionFallback<Args extends unknown[], T>(
  action: (...args: Args) => Promise<Result<T>>,
): (...args: Args) => Promise<Result<T>> {
  return async (...args: Args) => {
    try {
      return await action(...args);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Too Many Requests')) {
        return {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Muitas ações em pouco tempo. Aguarde alguns segundos e tente de novo.',
          },
        };
      }
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Não foi possível concluir agora. Verifique sua conexão e tente de novo.',
        },
      };
    }
  };
}
