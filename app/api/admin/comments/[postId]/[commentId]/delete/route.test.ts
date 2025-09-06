/**
 * @jest-environment node
 */
import { logActivity } from '@/lib/activity-log';

jest.mock('@/lib/activity-log', () => ({ logActivity: jest.fn() }));

jest.mock('@/lib/admin-auth', () => ({
  requireAdmin: jest.fn().mockResolvedValue(true),
  getSessionInfo: jest.fn().mockResolvedValue({ uid: 'admin', email: 'admin@test.com' }),
}));

const remove = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/firebase-admin', () => ({
  getAdminDb: () => ({
    collection: () => ({
      doc: () => ({
        collection: () => ({
          doc: () => ({ delete: remove })
        })
      })
    })
  })
}));

describe('DELETE /api/admin/comments/[postId]/[commentId]/delete', () => {
  it('logs activity on delete', async () => {
    const { DELETE } = await import('./route');
    const req = {} as any;
    const res = await DELETE(req, { params: Promise.resolve({ postId: 'p1', commentId: 'c1' }) });
    expect(res.status).toBe(200);
    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'comment.delete', title: 'c1', user: 'admin@test.com' })
    );
  });
});