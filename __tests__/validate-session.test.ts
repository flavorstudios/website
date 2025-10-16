/**
 * @jest-environment node
 */
import { requireAdmin } from '@/lib/admin-auth';
import { NextRequest } from 'next/server';

jest.mock('@/lib/admin-auth', () => ({
  requireAdmin: jest.fn(),
}));

const mockedRequire = requireAdmin as unknown as jest.Mock;

describe('GET /api/admin/validate-session', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when admin check fails', async () => {
    mockedRequire.mockResolvedValue(false);
    let GET!: (req: NextRequest) => Promise<any>;
    await jest.isolateModulesAsync(async () => {
      const mod = await import('@/app/api/admin/validate-session/route');
      GET = mod.GET;
    });
    const res = await GET({} as NextRequest);
    
    expect(res.status).toBe(401);
    expect(mockedRequire).toHaveBeenCalled();
  });

  it('returns 200 when admin check succeeds', async () => {
    mockedRequire.mockResolvedValue(true);
    let GET!: (req: NextRequest) => Promise<any>;
    await jest.isolateModulesAsync(async () => {
      const mod = await import('@/app/api/admin/validate-session/route');
      GET = mod.GET;
    });

    const res = await GET({} as NextRequest);

    expect(res.status).toBe(200);
    expect(mockedRequire).toHaveBeenCalled();
  });
});