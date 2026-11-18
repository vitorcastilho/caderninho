describe('Database Client', () => {
  const originalEnv = process.env.DATABASE_URL;

  afterEach(() => {
    vi.resetModules();
    if (originalEnv !== undefined) {
      process.env.DATABASE_URL = originalEnv;
    } else {
      delete process.env.DATABASE_URL;
    }
  });

  it('should throw an error when DATABASE_URL is not set', async () => {
    delete process.env.DATABASE_URL;

    await expect(() => import('./client')).rejects.toThrow(
      'DATABASE_URL environment variable is not set'
    );
  });

  it('should export db when DATABASE_URL is set', async () => {
    process.env.DATABASE_URL = 'postgresql://postgres.pooler-dev:postgres@127.0.0.1:54329/postgres';

    const { db } = await import('./client');

    expect(db).toBeDefined();
    expect(db.query).toBeDefined();
  });

  // Story 1.10 — Vercel (serverless) + pooler do Supabase em modo transação
  // (porta 6543): poucas conexões por instância, conexões ociosas devolvidas
  // e sem prepared statements (não suportados nesse modo).
  describe('opções do pool para serverless', () => {
    afterEach(() => {
      vi.doUnmock('postgres');
      delete (globalThis as { pgClient?: unknown }).pgClient;
    });

    it('cria o cliente com max baixo, idle_timeout e prepare: false', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@pooler.example.com:6543/postgres';
      delete (globalThis as { pgClient?: unknown }).pgClient;
      const postgresMock = vi.fn(() => ({}));
      vi.doMock('postgres', () => ({ default: postgresMock }));
      vi.doMock('drizzle-orm/postgres-js', () => ({ drizzle: vi.fn(() => ({ query: {} })) }));

      await import('./client');

      expect(postgresMock).toHaveBeenCalledTimes(1);
      const [url, options] = postgresMock.mock.calls[0] as unknown as [string, Record<string, unknown>];
      expect(url).toBe('postgresql://user:pass@pooler.example.com:6543/postgres');
      expect(options).toMatchObject({ prepare: false, idle_timeout: 20 });
      expect(options.max).toBeGreaterThanOrEqual(1);
      expect(options.max).toBeLessThanOrEqual(5);
      vi.doUnmock('drizzle-orm/postgres-js');
    });
  });
});
