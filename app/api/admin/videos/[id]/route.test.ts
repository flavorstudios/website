/**
 * @jest-environment node
 */
import { logActivity } from '@/lib/activity-log';

jest.mock('@/lib/activity-log', () => ({ logActivity: jest.fn() }));

jest.mock('@/lib/admin-auth', () => ({
  requireAdmin: jest.fn().mockResolvedValue(true),
  getSessionInfo: jest.fn().mockResolvedValue({ uid: 'admin', email: 'admin@test.com' }),
}));

const update = jest.fn().mockResolvedValue({ id: '1', title: 'Updated Video' });
const remove = jest.fn().mockResolvedValue(true);
jest.mock('@/lib/comment-store', () => ({
  videoStore: { update, delete: remove },
}));

describe('PUT /api/admin/videos/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs activity on update', async () => {
    const { PUT } = await import('./route');
    const req = { json: async () => ({ title: 'Updated Video' }) } as any;
    const res = await PUT(req, { params: Promise.resolve({ id: '1' }) });
    expect(res.status).toBe(200);
    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'video.update', title: 'Updated Video', user: 'admin@test.com' })
    );
  });
});

describe('DELETE /api/admin/videos/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs activity on delete', async () => {
    const { DELETE } = await import('./route');
    const req = {} as any;
    const res = await DELETE(req, { params: Promise.resolve({ id: '1' }) });
    expect(res.status).toBe(200);
    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'video.delete', title: '1', user: 'admin@test.com' })
    );
  });
});