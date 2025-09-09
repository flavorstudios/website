/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { Timestamp } from 'firebase-admin/firestore';

jest.mock('@/lib/admin-auth', () => ({
  requireAdmin: jest.fn().mockResolvedValue(true),
  getSessionInfo: jest.fn().mockResolvedValue({
    uid: '1',
    email: 'admin@test.com',
    role: 'owner',
  }),
}));

let infoSpy: jest.SpyInstance;
let errorSpy: jest.SpyInstance;

beforeEach(() => {
  if (!process.env.DEBUG) {
    infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  }
});

afterEach(() => {
  infoSpy?.mockRestore();
  errorSpy?.mockRestore();
});

describe('GET /api/admin/activity', () => {
  it('returns empty activities when adminDb missing', async () => {
    await jest.isolateModulesAsync(async () => {
      jest.doMock('@/lib/firebase-admin', () => ({ adminDb: undefined }));
      const { GET } = await import('./route');
      const req = new NextRequest('http://test/api/admin/activity');
      const res = await GET(req);
      const json = await res.json();
      expect(res.status).toBe(200);
      expect(json.activities).toEqual([]);
    });
  });

  it('returns mapped activities with defaults', async () => {
    await jest.isolateModulesAsync(async () => {
      const getMock = jest.fn().mockResolvedValue({
        docs: [
          {
            id: '1',
            data: () => ({
              action: 'login',
              user: 'tester',
              timestamp: Timestamp.fromDate(new Date('2024-01-01T00:00:00Z')),
            }),
          },
        ],
      });
      const orderByMock = jest.fn().mockReturnValue({ get: getMock });
      const collectionMock = jest.fn().mockReturnValue({ orderBy: orderByMock });

      jest.doMock('@/lib/firebase-admin', () => ({
        adminDb: { collection: collectionMock },
      }));

      const { GET } = await import('./route');
      const req = new NextRequest('http://test/api/admin/activity');
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.activities).toEqual([
        {
          id: '1',
          type: 'login',
          title: 'login',
          description: 'Performed by tester',
          status: 'unknown',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      ]);
    });
  });

  it('denies unauthorized', async () => {
    await jest.isolateModulesAsync(async () => {
      const mockedRequireAdmin = requireAdmin as jest.MockedFunction<typeof requireAdmin>;
      mockedRequireAdmin.mockResolvedValueOnce(false);
      jest.doMock('@/lib/firebase-admin', () => ({ adminDb: undefined }));
      const { GET } = await import('./route');
      const req = new NextRequest('http://test/api/admin/activity');
      const res = await GET(req);
      expect(res.status).toBe(401);
    });
  });
});
