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
    const {
      incrementAttempts,
      isRateLimited,
      resetAttempts,
      incrementSignupIpAttempts,
      incrementSignupEmailAttempts,
      isSignupIpRateLimited,
      isSignupEmailRateLimited,
      resetSignupLimits,
    } = await import('../rate-limit');
    await expect(incrementAttempts('1.2.3.4')).resolves.toBe(0);
    await expect(isRateLimited('1.2.3.4')).resolves.toBe(false);
    await expect(resetAttempts('1.2.3.4')).resolves.toBeUndefined();
    await expect(incrementSignupIpAttempts('1.2.3.4')).resolves.toBe(0);
    await expect(incrementSignupEmailAttempts('user@example.com')).resolves.toBe(0);
    await expect(isSignupIpRateLimited('1.2.3.4')).resolves.toBe(false);
    await expect(isSignupEmailRateLimited('user@example.com')).resolves.toBe(false);
    await expect(resetSignupLimits('1.2.3.4', 'user@example.com')).resolves.toBeUndefined();
  });

  it('returns safe defaults on non-ok responses', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    global.fetch = jest.fn().mockResolvedValue({ ok: false } as Response) as any;
    const {
      incrementAttempts,
      isRateLimited,
      resetAttempts,
      incrementSignupIpAttempts,
      incrementSignupEmailAttempts,
      isSignupIpRateLimited,
      isSignupEmailRateLimited,
      resetSignupLimits,
    } = await import('../rate-limit');
    await expect(incrementAttempts('1.2.3.4')).resolves.toBe(0);
    await expect(isRateLimited('1.2.3.4')).resolves.toBe(false);
    await expect(resetAttempts('1.2.3.4')).resolves.toBeUndefined();
    await expect(incrementSignupIpAttempts('1.2.3.4')).resolves.toBe(0);
    await expect(incrementSignupEmailAttempts('user@example.com')).resolves.toBe(0);
    await expect(isSignupIpRateLimited('1.2.3.4')).resolves.toBe(false);
    await expect(isSignupEmailRateLimited('user@example.com')).resolves.toBe(false);
    await expect(resetSignupLimits('1.2.3.4', 'user@example.com')).resolves.toBeUndefined();
  });
});

describe('signup rate limiter', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      UPSTASH_REDIS_REST_URL: 'https://example.com',
      UPSTASH_REDIS_REST_TOKEN: 'token',
    } as NodeJS.ProcessEnv;
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  function mockResponse(result: unknown): Response {
    return {
      ok: true,
      json: async () => ({ result }),
    } as Response;
  }

  it('increments signup counters with expiry', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse(1));
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse('OK'));
    const { incrementSignupIpAttempts } = await import('../rate-limit');
    const count = await incrementSignupIpAttempts('1.2.3.4');
    expect(count).toBe(1);
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain('incr/admin%3Asignup%3Aip%3A1.2.3.4');
    expect((global.fetch as jest.Mock).mock.calls[1][0]).toContain('expire/admin%3Asignup%3Aip%3A1.2.3.4');
  });

  it('increments signup email counters with expiry', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse(2));
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse('OK'));
    const { incrementSignupEmailAttempts } = await import('../rate-limit');
    const count = await incrementSignupEmailAttempts('user@example.com');
    expect(count).toBe(2);
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain('incr/admin%3Asignup%3Aemail%3Auser%40example.com');
    expect((global.fetch as jest.Mock).mock.calls[1][0]).toContain('expire/admin%3Asignup%3Aemail%3Auser%40example.com');
  });

  it('checks signup rate limits based on counts', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockResponse(1))
      .mockResolvedValueOnce(mockResponse(99));
    const { isSignupIpRateLimited } = await import('../rate-limit');
    await expect(isSignupIpRateLimited('1.2.3.4')).resolves.toBe(false);
    await expect(isSignupIpRateLimited('1.2.3.4')).resolves.toBe(true);
  });

  it('checks signup email limits based on counts', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockResponse(0))
      .mockResolvedValueOnce(mockResponse(42));
    const { isSignupEmailRateLimited } = await import('../rate-limit');
    await expect(isSignupEmailRateLimited('user@example.com')).resolves.toBe(false);
    await expect(isSignupEmailRateLimited('user@example.com')).resolves.toBe(true);
  });

  it('resets signup limits for provided identifiers', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse(1));
    const { resetSignupLimits } = await import('../rate-limit');
    await expect(resetSignupLimits('1.2.3.4', 'user@example.com')).resolves.toBeUndefined();
    expect(global.fetch).toHaveBeenCalledTimes(2);
    const calls = (global.fetch as jest.Mock).mock.calls.map((call) => call[0]);
    expect(calls[0]).toContain('del/admin%3Asignup%3Aip%3A1.2.3.4');
    expect(calls[1]).toContain('del/admin%3Asignup%3Aemail%3Auser%40example.com');
  });
});