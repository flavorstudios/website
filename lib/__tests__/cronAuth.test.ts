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

  it('returns error when CRON_SECRET is missing', async () => {
    process.env.CRON_SECRET = undefined;
    const { requireCronAuth } = await import('../cronAuth');
    const { NextRequest } = await import('next/server');
    const res = await requireCronAuth(new NextRequest('http://example.com/foo'));
    expect(res?.status).toBe(500);
    const data = await res?.json();
    expect(data).toEqual({ error: 'Server misconfig: CRON_SECRET missing' });
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
});