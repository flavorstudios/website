/**
 * @jest-environment node
 */
import { logActivity } from '@/lib/activity-log';

jest.mock('@/lib/activity-log', () => ({ logActivity: jest.fn() }));

jest.mock('@/lib/admin-auth', () => ({
  requireAdmin: jest.fn().mockResolvedValue(true),
  getSessionInfo: jest.fn().mockResolvedValue({ uid: 'admin', email: 'admin@test.com' }),
}));

const set = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/firebase-admin', () => ({
  ADMIN_BYPASS: false,
  adminDb: { collection: () => ({ doc: () => ({ set }) }) },
}));

describe('POST /api/admin/settings', () => {
  it('logs activity on save', async () => {
    const { POST } = await import('./route');
    const req = { json: async () => ({ theme: 'dark' }) } as any;
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'settings.update', user: 'admin@test.com' })
    );
  });
});