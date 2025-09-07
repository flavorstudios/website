/**
 * @jest-environment node
 */
import http from 'http';
import supertest from 'supertest';

process.env.PREVIEW_SECRET = 'test-secret';

jest.mock('@/lib/admin-auth', () => ({
  verifyAdminSession: jest.fn(),
}));

type BlogPost = import('@/lib/content-store').BlogPost;

jest.mock('@/lib/content-store', () => ({
  blogStore: {
    getById: jest.fn(),
  },
  ADMIN_DB_UNAVAILABLE: 'unavailable',
}));

jest.mock('@/lib/log', () => ({ logError: jest.fn() }));

let cookieValue = '';
let headerStore: Headers = new Headers();
jest.mock('next/headers', () => ({
  cookies: () => ({ get: () => (cookieValue ? { value: cookieValue } : undefined) }),
  headers: () => headerStore,
}));

const PreviewPage = require('../[id]/page').default;
const { createPreviewToken } = require('@/lib/preview-token');
const { verifyAdminSession } = require('@/lib/admin-auth');
const { blogStore } = require('@/lib/content-store');

const mockedVerify = verifyAdminSession as jest.Mock;
const mockedGetById = (blogStore.getById as unknown) as jest.Mock;

const mockPost: BlogPost = {
  id: '1',
  title: 't',
  slug: 's',
  content: '<p>c</p>',
  excerpt: 'e',
  status: 'draft',
  category: 'cat',
  categories: ['cat'],
  tags: [],
  featuredImage: '',
  seoTitle: '',
  seoDescription: '',
  author: 'a',
  publishedAt: '',
  createdAt: '',
  updatedAt: '',
  views: 0,
  commentCount: 0,
  shareCount: 0,
};

function createServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url || '', 'http://localhost');
    const id = url.pathname.split('/').pop() || '';
    const token = url.searchParams.get('token') || undefined;
    cookieValue = 'session';
    headerStore = new Headers({ 'x-request-id': 'req' });
    const out = await PreviewPage({
      params: Promise.resolve({ id }),
      searchParams: Promise.resolve({ token }),
    });
    if (out instanceof Response) {
      res.statusCode = out.status;
      out.headers.forEach((v, k) => res.setHeader(k, v));
      res.end(await out.text());
    } else {
      res.statusCode = 200;
      res.end('ok');
    }
  });
}

describe('preview route', () => {
  beforeEach(() => {
    mockedVerify.mockResolvedValue({ uid: 'user1' });
    mockedGetById.mockResolvedValue(mockPost);
  });

  it('returns 200 for valid token', async () => {
    const server = createServer();
    const token = createPreviewToken('1', 'user1');
    const res = await supertest(server).get('/admin/preview/1').query({ token });
    expect(res.status).toBe(200);
    server.close();
  });

  it('returns 403 for invalid token', async () => {
    const server = createServer();
    const res = await supertest(server)
      .get('/admin/preview/1')
      .query({ token: 'bad' });
    expect(res.status).toBe(403);
    server.close();
  });

  it('returns 410 for expired token', async () => {
    const server = createServer();
    const token = createPreviewToken('1', 'user1', -10);
    const res = await supertest(server)
      .get('/admin/preview/1')
      .query({ token });
    expect(res.status).toBe(410);
    server.close();
  });

  it('returns 404 when post missing', async () => {
    mockedGetById.mockResolvedValue(null);
    const server = createServer();
    const token = createPreviewToken('1', 'user1');
    const res = await supertest(server)
      .get('/admin/preview/1')
      .query({ token });
    expect(res.status).toBe(404);
    server.close();
  });
});