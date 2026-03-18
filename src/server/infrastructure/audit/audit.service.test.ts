import { logAudit } from './audit.service';

const mockInsertValues = vi.fn().mockResolvedValue(undefined);
const mockInsert = vi.fn().mockReturnValue({ values: mockInsertValues });

vi.mock('@/server/infrastructure/database/client', () => ({
  db: {
    insert: (...args: unknown[]) => mockInsert(...args),
  },
}));

vi.mock('@/server/infrastructure/database/schema/audit-logs', () => ({
  auditLogs: Symbol('auditLogs'),
}));

describe('logAudit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('test-uuid-1234' as ReturnType<typeof crypto.randomUUID>);
  });

  it('deve inserir registro com todos os campos', async () => {
    await logAudit({
      userId: 'user-1',
      organizationId: 'org-1',
      action: 'CREATE',
      entityType: 'account',
      entityId: 'acc-1',
      oldValue: null,
      newValue: { name: 'Conta Corrente' },
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
    });

    const { auditLogs } = await import('@/server/infrastructure/database/schema/audit-logs');
    expect(mockInsert).toHaveBeenCalledWith(auditLogs);
    expect(mockInsertValues).toHaveBeenCalledWith({
      id: 'test-uuid-1234',
      userId: 'user-1',
      organizationId: 'org-1',
      action: 'CREATE',
      entityType: 'account',
      entityId: 'acc-1',
      oldValue: null,
      newValue: { name: 'Conta Corrente' },
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
    });
  });

  it('deve inserir registro sem campos opcionais', async () => {
    await logAudit({
      userId: 'user-1',
      organizationId: null,
      action: 'LOGIN',
      entityType: 'session',
      entityId: 'sess-1',
    });

    expect(mockInsertValues).toHaveBeenCalledWith({
      id: 'test-uuid-1234',
      userId: 'user-1',
      organizationId: null,
      action: 'LOGIN',
      entityType: 'session',
      entityId: 'sess-1',
    });
  });

  it('deve NAO propagar excecao quando insercao falha', async () => {
    mockInsertValues.mockRejectedValueOnce(new Error('DB connection failed'));
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await expect(
      logAudit({
        userId: 'user-1',
        organizationId: null,
        action: 'CREATE',
        entityType: 'account',
        entityId: 'acc-1',
      }),
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const logOutput = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    expect(logOutput.level).toBe('warn');
    expect(logOutput.action).toBe('audit_log_failed');
    expect(logOutput.error).toBe('DB connection failed');

    consoleSpy.mockRestore();
  });

  it('deve chamar db.insert com valores corretos incluindo id gerado', async () => {
    await logAudit({
      userId: null,
      organizationId: null,
      action: 'DELETE',
      entityType: 'transaction',
      entityId: 'txn-99',
      oldValue: { amount: 5000 },
    });

    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test-uuid-1234',
        userId: null,
        action: 'DELETE',
        entityType: 'transaction',
        entityId: 'txn-99',
        oldValue: { amount: 5000 },
      }),
    );
  });
});
