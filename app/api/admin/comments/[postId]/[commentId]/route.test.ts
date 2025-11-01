/**
 * @jest-environment node
 */
import { logActivity } from '@/lib/activity-log';

jest.mock('@/lib/activity-log', () => ({ logActivity: jest.fn() }));

jest.mock('@/lib/admin-auth', () => ({
  requireAdmin: jest.fn().mockResolvedValue(true),
  getSessionInfo: jest.fn().mockResolvedValue({ uid: 'admin', email: 'admin@test.com' }),
}));

const updateStatus = jest.fn().mockResolvedValue(undefined);
const updateFlag = jest.fn().mockResolvedValue(undefined);
const remove = jest.fn().mockResolvedValue(true);
jest.mock('@/lib/comment-store', () => ({
  commentStore: { updateStatus, updateFlag, delete: remove },
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

describe('PUT /api/admin/comments/[postId]/[commentId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs activity on update', async () => {
    const { PUT } = await import('./route');
    const req = { json: async () => ({ status: 'approved' }) } as any;
    const res = await PUT(req, { params: { postId: 'p1', commentId: 'c1' } });
    expect(res.status).toBe(200);
    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'comment.update', title: 'c1', user: 'admin@test.com' })
    );
  });
});

describe('DELETE /api/admin/comments/[postId]/[commentId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs activity on delete', async () => {
    const { DELETE } = await import('./route');
    const req = {} as any;
    const res = await DELETE(req, { params: { postId: 'p1', commentId: 'c1' } });
    expect(res.status).toBe(200);
    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'comment.delete', title: 'c1', user: 'admin@test.com' })
    );
  });
});