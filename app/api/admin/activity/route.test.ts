/**
 * @jest-environment node
 */
import { type NextRequest } from 'next/server';
import { GET } from './route';
import { requireAdmin } from '@/lib/admin-auth';

jest.mock('@/lib/admin-auth', () => ({
  requireAdmin: jest.fn().mockResolvedValue(true),
  getSessionInfo: jest.fn().mockResolvedValue({
    uid: '1',
    email: 'admin@test.com',
    role: 'owner',
  }),
}));

jest.mock('@/lib/firebase-admin', () => ({
  adminDb: undefined,
}));

describe('GET /api/admin/activity', () => {
  it('returns empty activities when adminDb missing', async () => {
    const req = new NextRequest('http://test/api/admin/activity');
    const res = await GET(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.activities).toEqual([]);
  });

  it('denies unauthorized', async () => {
    const mockedRequireAdmin = requireAdmin as jest.MockedFunction<typeof requireAdmin>;
    mockedRequireAdmin.mockResolvedValueOnce(false);
    const req = new NextRequest('http://test/api/admin/activity');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});