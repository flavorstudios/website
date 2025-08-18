/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET } from './route';
import { requireAdmin } from '@/lib/admin-auth';

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
    // should expose an ETag so clients can send If-None-Match later
    expect(res.headers.get('etag')).toBeTruthy();
    // optional caching hint for conditional requests
    expect(res.headers.get('cache-control')).toBe('no-cache');
  });

  it('returns 304 when ETag matches (conditional request)', async () => {
    // First request to obtain ETag
    const first = await GET(new NextRequest('http://test/api/admin/stats?range=default'));
    const etag = first.headers.get('etag') || '';

    // Second request with If-None-Match should yield 304 when unchanged
    const secondReq = new NextRequest('http://test/api/admin/stats?range=default', {
      headers: { 'if-none-match': etag }
    });
    const second = await GET(secondReq);

    expect(second.status).toBe(304);
    expect(second.headers.get('etag')).toBe(etag);
    expect(second.headers.get('cache-control')).toBe('no-cache');
  });

  it('denies unauthorized', async () => {
    const mockedRequireAdmin = requireAdmin as jest.MockedFunction<typeof requireAdmin>;
    mockedRequireAdmin.mockResolvedValueOnce(false);

    const req = new NextRequest('http://test/api/admin/stats');
    const res = await GET(req);

    expect(res.status).toBe(401);
  });
});
