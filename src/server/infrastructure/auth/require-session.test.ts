import { requireSession } from './require-session';

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

describe('requireSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar session quando autenticado', async () => {
    const fakeSession = { user: { id: 'user-1', name: 'Test' } };
    const fakeHeaders = new Headers({ cookie: 'test' });
    mockHeaders.mockResolvedValue(fakeHeaders);
    mockGetSession.mockResolvedValue(fakeSession);

    const result = await requireSession();

    expect(result).toEqual(fakeSession);
    expect(mockGetSession).toHaveBeenCalledWith({ headers: fakeHeaders });
  });

  it('deve retornar null quando nao autenticado', async () => {
    const fakeHeaders = new Headers();
    mockHeaders.mockResolvedValue(fakeHeaders);
    mockGetSession.mockResolvedValue(null);

    const result = await requireSession();

    expect(result).toBeNull();
  });
});
