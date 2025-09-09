const originalEnv = process.env;
const originalFetch = global.fetch;

describe('rate-limit redis failures', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      UPSTASH_REDIS_REST_URL: 'https://example.com',
      UPSTASH_REDIS_REST_TOKEN: 'token',
    } as NodeJS.ProcessEnv;
    global.fetch = undefined as any;
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('returns safe defaults when fetch rejects', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    global.fetch = jest.fn().mockRejectedValue(new Error('network error')) as any;
    const { incrementAttempts, isRateLimited, resetAttempts } = await import('../rate-limit');
    await expect(incrementAttempts('1.2.3.4')).resolves.toBe(0);
    await expect(isRateLimited('1.2.3.4')).resolves.toBe(false);
    await expect(resetAttempts('1.2.3.4')).resolves.toBeUndefined();
  });

  it('returns safe defaults on non-ok responses', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    global.fetch = jest.fn().mockResolvedValue({ ok: false } as Response) as any;
    const { incrementAttempts, isRateLimited, resetAttempts } = await import('../rate-limit');
    await expect(incrementAttempts('1.2.3.4')).resolves.toBe(0);
    await expect(isRateLimited('1.2.3.4')).resolves.toBe(false);
    await expect(resetAttempts('1.2.3.4')).resolves.toBeUndefined();
  });
});