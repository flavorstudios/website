/** @jest-environment node */

const originalEnv = process.env;

describe('requireCronAuth', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      CRON_SECRET: 'secret',
      UPSTASH_REDIS_REST_URL: undefined,
      UPSTASH_REDIS_REST_TOKEN: undefined,
      BASE_URL: 'http://localhost:3000',
    } as NodeJS.ProcessEnv;
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('rejects invalid auth', async () => {
    const { requireCronAuth } = await import('../cronAuth');
    const { NextRequest } = await import('next/server');
    const res = await requireCronAuth(new NextRequest('http://example.com/foo'));
    expect(res?.status).toBe(401);
  });

  it('rate limits repeated calls', async () => {
    const { requireCronAuth } = await import('../cronAuth');
    const { NextRequest } = await import('next/server');
    const makeReq = () =>
      new NextRequest('http://example.com/foo', {
        headers: { authorization: 'Bearer secret' },
      });
    const first = await requireCronAuth(makeReq());
    expect(first).toBeUndefined();
    const second = await requireCronAuth(makeReq());
    expect(second?.status).toBe(429);
  });

  it('logs monitoring details when redis check fails', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.com';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
    const logSpy = jest.fn();
    jest.doMock('../log', () => ({ logError: logSpy }));

    const { requireCronAuth } = await import('../cronAuth');
    const { NextRequest } = await import('next/server');

    const fetchMock = jest
      .spyOn(global, 'fetch' as any)
      .mockRejectedValue(new Error('redis failure'));

    const req = new NextRequest('http://example.com/foo', {
      headers: { authorization: 'Bearer secret' },
    });
    await requireCronAuth(req);

    expect(logSpy).toHaveBeenCalledWith(
      'cronAuth: Redis rate-limit check failed',
      expect.any(Error),
      expect.objectContaining({ path: '/foo', rateLimited: 'unknown' }),
    );

    fetchMock.mockRestore();
  });
});