import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/server/infrastructure/database/client', () => ({
  db: {},
}));

vi.mock('@/server/infrastructure/database/schema', () => ({
  users: { _: { name: 'users' } },
  sessions: { _: { name: 'sessions' } },
  accounts: { _: { name: 'accounts' } },
  verifications: { _: { name: 'verifications' } },
  organizations: { _: { name: 'organizations' } },
  members: { _: { name: 'members' } },
  invitations: { _: { name: 'invitations' } },
}));

beforeEach(() => {
  process.env.BETTER_AUTH_SECRET = 'test-secret-at-least-32-chars-long!!';
  process.env.BETTER_AUTH_URL = 'http://localhost:3000';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
});

describe('Auth Config', () => {
  it('deve exportar instancia auth com metodos esperados', async () => {
    const { auth } = await import('./config');

    expect(auth).toBeDefined();
    expect(auth.api).toBeDefined();
    expect(auth.handler).toBeDefined();
  }, 15000);

  it('deve ter api.getSession disponivel para validacao server-side', async () => {
    const { auth } = await import('./config');

    expect(auth.api.getSession).toBeDefined();
    expect(typeof auth.api.getSession).toBe('function');
  }, 15000);
});
