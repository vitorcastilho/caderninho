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
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:54322/postgres';

    const { db } = await import('./client');

    expect(db).toBeDefined();
    expect(db.query).toBeDefined();
  });
});
