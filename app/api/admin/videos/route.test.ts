/**
 * @jest-environment node
 */
import { logActivity } from '@/lib/activity-log';

jest.mock('@/lib/activity-log', () => ({ logActivity: jest.fn() }));

jest.mock('@/lib/admin-auth', () => ({
  requireAdmin: jest.fn().mockResolvedValue(true),
  getSessionInfo: jest.fn().mockResolvedValue({ uid: 'admin', email: 'admin@test.com' }),
}));

const create = jest.fn().mockResolvedValue({ id: '1', title: 'Test Video' });
jest.mock('@/lib/content-store', () => ({
  videoStore: { create },
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

describe('POST /api/admin/videos', () => {
  it('logs activity on create', async () => {
    const { POST } = await import('./route');
    const req = { json: async () => ({ title: 'Test Video', youtubeId: 'abc', slug: 'test-video' }) } as any;
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'video.create', title: 'Test Video', user: 'admin@test.com' })
    );
  });
});