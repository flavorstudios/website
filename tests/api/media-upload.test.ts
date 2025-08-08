// Mocks for Next API primitives
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: any, init?: any) => ({ status: init?.status || 200, json: () => body }),
  },
  NextRequest: class {},
}));

// Auth mocks
jest.mock('@/lib/admin-auth', () => ({
  verifyAdminSession: jest.fn().mockResolvedValue(undefined),
  logAdminAuditFailure: jest.fn(),
}));

// Firestore duplicate-check mock: first call => empty, second call => duplicate
const mockGet = jest
  .fn()
  .mockResolvedValueOnce({ empty: true })
  .mockResolvedValueOnce({ empty: false });

jest.mock('@/lib/firebase-admin', () => ({
  getAdminDb: () => ({
    collection: () => ({
      where: () => ({ limit: () => ({ get: mockGet }) }),
    }),
  }),
}));

// Media lib mocks
jest.mock('@/lib/media', () => ({
  uploadMedia: jest
    .fn()
    .mockResolvedValue({ id: '1', url: '/x', filename: 'a.png', mime: 'image/png', size: 3, hash: 'abc' }),
  validateFile: jest.fn().mockReturnValue(true),
  suggestAltText: jest.fn().mockReturnValue('alt'),
  scanBuffer: jest.fn().mockResolvedValue(true),
  updateMedia: jest.fn(),
}));

// In-memory fs mock so the route can "appendFile/readFile/unlink" without touching disk
const memFiles = new Map<string, Buffer>();
jest.mock('node:fs', () => {
  return {
    existsSync: jest.fn().mockReturnValue(true),
    mkdirSync: jest.fn(),
    promises: {
      appendFile: jest.fn(async (p: string, b: Buffer) => {
        const prev = memFiles.get(p) || Buffer.alloc(0);
        memFiles.set(p, Buffer.concat([prev, b]));
      }),
      readFile: jest.fn(async (p: string) => memFiles.get(p) || Buffer.alloc(0)),
      unlink: jest.fn(async (p: string) => {
        memFiles.delete(p);
      }),
    },
  };
});

const createRequest = (headers: Headers, body: Buffer) =>
  ({
    headers,
    cookies: { get: () => ({ value: '1' }) },
    arrayBuffer: async () => body,
  } as any);

// Polyfill Headers if missing (Jest env)
beforeAll(() => {
  if (typeof (global as any).Headers === 'undefined') {
    class SimpleHeaders {
      private map = new Map<string, string>();
      constructor(init?: Record<string, string>) {
        if (init) {
          for (const [k, v] of Object.entries(init)) {
            this.map.set(k.toLowerCase(), String(v));
          }
        }
      }
      get(k: string) {
        return this.map.get(k.toLowerCase()) ?? null;
      }
      set(k: string, v: string) {
        this.map.set(k.toLowerCase(), String(v));
      }
    }
    (global as any).Headers = SimpleHeaders as any;
  }
});

describe('media upload API', () => {
  let POST: any;

  beforeAll(() => {
    (global as any).Request = class {};
    (global as any).Response = class {};
    POST = require('@/app/api/media/upload/route').POST;
  });

  it('rejects duplicate files', async () => {
    const buffer = Buffer.from('test');
    const hash = require('crypto').createHash('sha256').update(buffer).digest('hex');
    const headers = new Headers({
      'x-upload-id': '1',
      'x-file-name': 'a.png',
      'x-file-type': 'image/png',
      'x-file-size': String(buffer.length),
      'x-file-hash': hash,
      'x-chunk-index': '0',
      'x-total-chunks': '1',
    });

    const req1 = createRequest(headers, buffer);
    await POST(req1);

    const req2 = createRequest(headers, buffer);
    const res2 = await POST(req2);
    expect(res2.status).toBe(409);
  });
});
