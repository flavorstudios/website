/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET } from './route';

jest.mock('@/lib/admin-auth', () => ({
  requireAdmin: jest.fn().mockResolvedValue(true),
  getSessionInfo: jest.fn().mockResolvedValue({ uid: '1', email: 'admin@test.com', role: 'owner' })
}));

const mockCount = (count: number) => ({ get: jest.fn().mockResolvedValue({ data: () => ({ count }) }) });
const mockAgg = (views: number) => ({ get: jest.fn().mockResolvedValue({ data: () => ({ views }) }) });
const mockWhere = (count: number) => ({ count: () => mockCount(count) });

jest.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: () => ({
      count: () => mockCount(1),
      aggregate: () => mockAgg(0),
      where: () => mockWhere(0)
    }),
    collectionGroup: () => ({
      where: () => ({ count: () => mockCount(0) })
    })
  }
}));

describe('GET /api/admin/stats', () => {
  it('returns stats for authorized admin', async () => {
    const req = new NextRequest('http://test/api/admin/stats?range=default');
    const res = await GET(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.totalPosts).toBe(1);
  });

  it('denies unauthorized', async () => {
    const { requireAdmin } = require('@/lib/admin-auth');
    requireAdmin.mockResolvedValueOnce(false);
    const req = new NextRequest('http://test/api/admin/stats');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});