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
    expect(first).toBeNull();
    const second = await requireCronAuth(makeReq());
    expect(second?.status).toBe(429);
  });
});