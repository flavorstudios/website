/**
 * @jest-environment node
 */
import { logActivity } from '@/lib/activity-log';

jest.mock('@/lib/activity-log', () => ({ logActivity: jest.fn() }));

jest.mock('@/lib/admin-auth', () => ({
  requireAdmin: jest.fn().mockResolvedValue(true),
  getSessionInfo: jest.fn().mockResolvedValue({ uid: 'admin', email: 'admin@test.com' }),
}));

const create = jest.fn().mockResolvedValue({ id: 'reply1' });
jest.mock('@/lib/comment-store', () => ({
  commentStore: { create },
}));

describe('POST /api/admin/comments/[postId]/[commentId]/reply', () => {
  it('logs activity on reply', async () => {
    const { POST } = await import('./route');
    const req = { json: async () => ({ content: 'hi', postType: 'blog' }) } as any;
    const res = await POST(req, { params: Promise.resolve({ postId: 'p1', commentId: 'c1' }) });
    expect(res.status).toBe(200);
    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'comment.reply', title: 'c1', user: 'admin@test.com' })
    );
  });
});