import type { Result } from '@/shared/types/result';

const mockGetSession = vi.fn();

vi.mock('./config', () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
  },
}));

const mockHeaders = vi.fn();
vi.mock('next/headers', () => ({
  headers: () => mockHeaders(),
}));

// Import after mocks are set up
const { withAuth } = await import('./with-auth');

describe('withAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders.mockResolvedValue(new Headers());
  });

  it('deve executar action quando sessao e valida', async () => {
    const fakeSession = { user: { id: 'user-1', name: 'Test' } };
    mockGetSession.mockResolvedValue(fakeSession);

    const action = vi.fn().mockResolvedValue({ success: true, data: 'ok' });
    const protectedAction = withAuth(action);

    const result = await protectedAction('test-input');

    expect(action).toHaveBeenCalledWith(fakeSession, 'test-input');
    expect(result).toEqual({ success: true, data: 'ok' });
  });

  it('deve retornar UNAUTHORIZED quando sessao e invalida', async () => {
    mockGetSession.mockResolvedValue(null);

    const action = vi.fn();
    const protectedAction = withAuth(action);

    const result = await protectedAction('test-input') as Result<never>;

    expect(action).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('UNAUTHORIZED');
      expect(result.error.message).toBe('Sessao invalida. Faca login novamente.');
    }
  });

  it('deve passar session corretamente ao action wrapped', async () => {
    const fakeSession = {
      user: { id: 'user-42', name: 'João', email: 'joao@test.com' },
      session: { id: 'sess-1', token: 'abc' },
    };
    mockGetSession.mockResolvedValue(fakeSession);

    const action = vi.fn().mockResolvedValue({ success: true, data: { id: '1' } });
    const protectedAction = withAuth(action);

    await protectedAction({ name: 'Conta Corrente' });

    expect(action).toHaveBeenCalledWith(fakeSession, { name: 'Conta Corrente' });
    expect(action.mock.calls[0][0]).toBe(fakeSession);
  });
});
