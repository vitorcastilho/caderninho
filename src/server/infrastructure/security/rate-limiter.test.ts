import { rateLimit, resetRateLimitStore } from './rate-limiter';

describe('rateLimit', () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  it('deve permitir requests dentro do limite', () => {
    const result = rateLimit('test-key', 5, 60_000);

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.retryAfterMs).toBe(0);
  });

  it('deve bloquear request alem do limite', () => {
    const limit = 3;

    rateLimit('test-key', limit, 60_000);
    rateLimit('test-key', limit, 60_000);
    rateLimit('test-key', limit, 60_000);

    const result = rateLimit('test-key', limit, 60_000);

    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it('deve decrementar remaining corretamente', () => {
    const limit = 5;

    const r1 = rateLimit('test-key', limit, 60_000);
    const r2 = rateLimit('test-key', limit, 60_000);
    const r3 = rateLimit('test-key', limit, 60_000);

    expect(r1.remaining).toBe(4);
    expect(r2.remaining).toBe(3);
    expect(r3.remaining).toBe(2);
  });

  it('deve resetar janela apos windowMs', () => {
    vi.useFakeTimers();

    const limit = 2;
    const windowMs = 60_000;

    rateLimit('test-key', limit, windowMs);
    rateLimit('test-key', limit, windowMs);

    const blocked = rateLimit('test-key', limit, windowMs);
    expect(blocked.success).toBe(false);

    vi.advanceTimersByTime(windowMs + 1);

    const afterReset = rateLimit('test-key', limit, windowMs);
    expect(afterReset.success).toBe(true);
    expect(afterReset.remaining).toBe(1);

    vi.useRealTimers();
  });

  it('deve manter chaves diferentes independentes', () => {
    const limit = 2;

    rateLimit('key-a', limit, 60_000);
    rateLimit('key-a', limit, 60_000);
    const blockedA = rateLimit('key-a', limit, 60_000);

    const resultB = rateLimit('key-b', limit, 60_000);

    expect(blockedA.success).toBe(false);
    expect(resultB.success).toBe(true);
    expect(resultB.remaining).toBe(1);
  });

  it('deve limpar entradas expiradas via cleanup', () => {
    vi.useFakeTimers();

    const windowMs = 60_000;

    rateLimit('expired-key', 5, windowMs);

    vi.advanceTimersByTime(windowMs + 1);

    // After window expires, a new request should start fresh
    const result = rateLimit('expired-key', 5, windowMs);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);

    vi.useRealTimers();
  });
});
