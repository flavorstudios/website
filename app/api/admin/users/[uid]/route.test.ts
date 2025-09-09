/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { logActivity } from '@/lib/activity-log';

jest.mock('@/lib/activity-log', () => ({ logActivity: jest.fn() }));

jest.mock('@/lib/admin-auth', () => ({
  requireAdmin: jest.fn().mockResolvedValue(true),
  getSessionInfo: jest.fn().mockResolvedValue({ uid: 'admin', email: 'admin@test.com' }),
}));

const deleteUser = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/firebase-admin', () => ({
  getAdminAuth: () => ({ deleteUser }),
  getAdminDb: () => ({ collection: () => ({ add: jest.fn().mockResolvedValue(undefined) }) }),
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

describe('DELETE /api/admin/users/[uid]', () => {
  it('logs activity after deleting user', async () => {
    const { DELETE } = await import('./route');
    const req = new NextRequest('http://test/api/admin/users/123');
    const res = await DELETE(req, { params: Promise.resolve({ uid: '123' }) });
    expect(res.status).toBe(200);
    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'user.delete', user: 'admin@test.com' })
    );
  });
});