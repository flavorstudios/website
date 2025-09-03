/**
 * @jest-environment node
 */
import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/admin-auth';
import { NextRequest } from 'next/server';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('@/lib/admin-auth', () => ({
  verifyAdminSession: jest.fn(),
}));

const mockedCookies = cookies as unknown as jest.Mock;
const mockedVerify = verifyAdminSession as unknown as jest.Mock;

describe('GET /api/admin/validate-session', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when no admin-session cookie is present', async () => {
    mockedCookies.mockResolvedValue({ get: () => undefined });
    let GET: (req: NextRequest) => Promise<any>;
    await jest.isolateModulesAsync(async () => {
      const mod = await import('@/app/api/admin/validate-session/route');
      GET = mod.GET;
    });
    const res = await GET({} as NextRequest);
    
    expect(res.status).toBe(401);
    expect(mockedVerify).not.toHaveBeenCalled();
  });

  it('returns 200 when session cookie is valid', async () => {
    mockedCookies.mockResolvedValue({ get: () => ({ value: 'valid-cookie' }) });
    mockedVerify.mockResolvedValue({ uid: '1', role: 'admin', email: 'test@example.com' });
    let GET: (req: NextRequest) => Promise<any>;
    await jest.isolateModulesAsync(async () => {
      const mod = await import('@/app/api/admin/validate-session/route');
      GET = mod.GET;
    });

    const res = await GET({} as NextRequest);

    expect(res.status).toBe(200);
    expect(mockedVerify).toHaveBeenCalledWith('valid-cookie');
  });
});