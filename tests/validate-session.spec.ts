/**
 * @jest-environment node
 */
import { cookies } from 'next/headers';
import { GET } from '@/app/api/admin/validate-session/route';
import { verifyAdminSession } from '@/lib/admin-auth';

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

    const res = await GET();
    
    expect(res.status).toBe(401);
    expect(mockedVerify).not.toHaveBeenCalled();
  });

  it('returns 200 with a valid admin-session cookie', async () => {
    mockedCookies.mockResolvedValue({ get: () => ({ value: 'valid-cookie' }) });
    mockedVerify.mockResolvedValue({ uid: '1', role: 'admin', email: 'test@example.com' });

    const res = await GET();
    
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(mockedVerify).toHaveBeenCalledWith('valid-cookie');
  });
});