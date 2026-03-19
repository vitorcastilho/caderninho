import { logger } from './logger';

describe('logger', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('info', () => {
    it('deve gerar JSON valido com level "info"', () => {
      logger.info({ action: 'user_login' });

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const output = JSON.parse(consoleLogSpy.mock.calls[0][0] as string);
      expect(output.level).toBe('info');
      expect(output.action).toBe('user_login');
    });
  });

  describe('warn', () => {
    it('deve gerar JSON valido com level "warn"', () => {
      logger.warn({ action: 'rate_limit_exceeded' });

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const output = JSON.parse(consoleLogSpy.mock.calls[0][0] as string);
      expect(output.level).toBe('warn');
      expect(output.action).toBe('rate_limit_exceeded');
    });
  });

  describe('error', () => {
    it('deve gerar JSON valido com level "error" e usar console.error', () => {
      logger.error({ action: 'db_connection_failed', error: 'Connection refused' });

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).not.toHaveBeenCalled();
      const output = JSON.parse(consoleErrorSpy.mock.calls[0][0] as string);
      expect(output.level).toBe('error');
      expect(output.action).toBe('db_connection_failed');
      expect(output.error).toBe('Connection refused');
    });
  });

  describe('sanitizacao de dados sensiveis', () => {
    it('deve filtrar campos sensiveis (password, token, secret)', () => {
      logger.info({
        action: 'auth_attempt',
        data: {
          username: 'john',
          password: 'super-secret-123',
          accessToken: 'eyJhbGciOiJIUzI1NiJ9',
          secret: 'my-secret-key',
        },
      });

      const output = JSON.parse(consoleLogSpy.mock.calls[0][0] as string);
      expect(output.data.username).toBe('john');
      expect(output.data.password).toBe('[REDACTED]');
      expect(output.data.accessToken).toBe('[REDACTED]');
      expect(output.data.secret).toBe('[REDACTED]');
    });

    it('deve manter campos nao-sensiveis inalterados', () => {
      logger.info({
        action: 'create_account',
        data: { name: 'Conta Corrente', balance: 1000, active: true },
      });

      const output = JSON.parse(consoleLogSpy.mock.calls[0][0] as string);
      expect(output.data.name).toBe('Conta Corrente');
      expect(output.data.balance).toBe(1000);
      expect(output.data.active).toBe(true);
    });

    it('deve filtrar campos sensiveis em objetos aninhados', () => {
      logger.info({
        action: 'nested_test',
        data: {
          user: { name: 'John', credential: 'secret-cred' },
        },
      });

      const output = JSON.parse(consoleLogSpy.mock.calls[0][0] as string);
      expect(output.data.user.name).toBe('John');
      expect(output.data.user.credential).toBe('[REDACTED]');
    });

    it('deve filtrar campos sensiveis dentro de arrays de objetos', () => {
      logger.info({
        action: 'array_test',
        data: {
          users: [
            { name: 'Alice', password: 'pass123' },
            { name: 'Bob', token: 'tok456' },
          ],
        },
      });

      const output = JSON.parse(consoleLogSpy.mock.calls[0][0] as string);
      expect(output.data.users[0].name).toBe('Alice');
      expect(output.data.users[0].password).toBe('[REDACTED]');
      expect(output.data.users[1].name).toBe('Bob');
      expect(output.data.users[1].token).toBe('[REDACTED]');
    });

    it('deve filtrar campo email como dado sensivel', () => {
      logger.info({
        action: 'email_test',
        data: {
          email: 'user@example.com',
          userEmail: 'admin@example.com',
          name: 'John',
        },
      });

      const output = JSON.parse(consoleLogSpy.mock.calls[0][0] as string);
      expect(output.data.email).toBe('[REDACTED]');
      expect(output.data.userEmail).toBe('[REDACTED]');
      expect(output.data.name).toBe('John');
    });
  });

  describe('campos opcionais', () => {
    it('deve funcionar sem campos opcionais (userId, data)', () => {
      logger.info({ action: 'health_check' });

      const output = JSON.parse(consoleLogSpy.mock.calls[0][0] as string);
      expect(output.action).toBe('health_check');
      expect(output.userId).toBeUndefined();
      expect(output.data).toBeUndefined();
    });

    it('deve incluir userId e organizationId quando fornecidos', () => {
      logger.info({
        action: 'update_profile',
        userId: 'user-123',
        organizationId: 'org-456',
      });

      const output = JSON.parse(consoleLogSpy.mock.calls[0][0] as string);
      expect(output.userId).toBe('user-123');
      expect(output.organizationId).toBe('org-456');
    });
  });

  describe('timestamp', () => {
    it('deve incluir timestamp no formato ISO 8601', () => {
      logger.info({ action: 'timestamp_test' });

      const output = JSON.parse(consoleLogSpy.mock.calls[0][0] as string);
      expect(output.timestamp).toBeDefined();
      // ISO 8601 format check
      expect(new Date(output.timestamp).toISOString()).toBe(output.timestamp);
    });
  });
});
