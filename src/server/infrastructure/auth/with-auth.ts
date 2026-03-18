import { headers } from 'next/headers';

import { auth } from './config';
import type { Result } from '@/shared/types/result';

type Session = Awaited<ReturnType<typeof auth.api.getSession>>;
type NonNullSession = NonNullable<Session>;

export function withAuth<TInput, TOutput>(
  action: (session: NonNullSession, input: TInput) => Promise<Result<TOutput>>,
) {
  return async (input: TInput): Promise<Result<TOutput>> => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Sessao invalida. Faca login novamente.',
        },
      };
    }

    return action(session, input);
  };
}
