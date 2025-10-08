/**
 * @jest-environment node
 */
import React from 'react';
import PreviewPage from '../[id]/page';
import { verifyAdminSession, requireAdmin, getSessionInfo } from '@/lib/admin-auth';
import { blogStore } from '@/lib/content-store';
import { validatePreviewTokenOrThrow } from '@/lib/preview-token';
import {
  ExpiredPreviewTokenError,
  InvalidPreviewTokenError,
} from '@/lib/preview-token-errors';
import { logError } from '@/lib/log';
import { renderToStaticMarkup } from 'react-dom/server';

jest.mock('@/lib/admin-auth', () => ({
  verifyAdminSession: jest.fn(),
  requireAdmin: jest.fn(),
  getSessionInfo: jest.fn(),
}));

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

jest.mock('@/lib/preview-token', () => ({
  validatePreviewTokenOrThrow: jest.fn(),
  createPreviewToken: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

// Ensures any HTTP server started during tests is closed even if assertions fail.
let server: { close: () => void } | null = null;

const mockedVerify = verifyAdminSession as jest.Mock;
const mockedRequireAdmin = requireAdmin as jest.Mock;
const mockedGetSessionInfo = getSessionInfo as jest.Mock;
const mockedGetById = (blogStore.getById as unknown) as jest.Mock;
const mockedValidate = validatePreviewTokenOrThrow as jest.Mock;
const mockedCreatePreviewToken = jest.requireMock('@/lib/preview-token')
  .createPreviewToken as jest.Mock;
const mockedLogError = logError as jest.Mock;

type BlogPost = import('@/lib/content-store').BlogPost;

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

describe('preview route', () => {
  afterEach(() => {
    server?.close();
    server = null;
  });
  
  beforeEach(() => {
    mockedVerify.mockResolvedValue({ uid: 'user1' });
    mockedRequireAdmin.mockResolvedValue(true);
    mockedGetSessionInfo.mockResolvedValue({ uid: 'user1' });
    mockedGetById.mockResolvedValue(mockPost);
    cookieValue = 'session';
    headerStore = new Headers({ 'x-request-id': 'req' });
    mockedValidate.mockReset();
    mockedValidate.mockReturnValue({
      postId: '1',
      uid: 'user1',
      exp: Math.floor(Date.now() / 1000) + 60,
    });
    mockedCreatePreviewToken.mockReset();
    mockedLogError.mockReset();
  });

  it('returns element for valid token', async () => {
    const result = await PreviewPage({
      params: Promise.resolve({ id: '1' }),
      searchParams: Promise.resolve({ token: 'ok' }),
    });
    expect(React.isValidElement(result)).toBe(true);
  });

  it('returns error element for invalid token', async () => {
    mockedValidate.mockImplementation(() => {
      throw new InvalidPreviewTokenError();
    });
    const result = (await PreviewPage({
      params: Promise.resolve({ id: '1' }),
      searchParams: Promise.resolve({ token: 'bad' }),
    })) as React.ReactElement;
    expect(renderToStaticMarkup(result.props.children as React.ReactElement)).toContain(
      'Invalid token.'
    );
  });

  it('returns error element for expired token', async () => {
    mockedValidate.mockImplementation(() => {
      throw new ExpiredPreviewTokenError();
    });
    const result = (await PreviewPage({
      params: Promise.resolve({ id: '1' }),
      searchParams: Promise.resolve({ token: 'old' }),
    })) as React.ReactElement;
    expect(renderToStaticMarkup(result.props.children as React.ReactElement)).toContain(
      'Preview token expired.'
    );
  });

  it('throws notFound when post missing', async () => {
    mockedGetById.mockResolvedValue(null);
    await expect(
      PreviewPage({
        params: Promise.resolve({ id: '1' }),
        searchParams: Promise.resolve({ token: 'ok' }),
      })
    ).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('requires authenticated session for valid tokens', async () => {
    mockedVerify.mockRejectedValue(new Error('no session'));
    const result = (await PreviewPage({
      params: Promise.resolve({ id: '1' }),
      searchParams: Promise.resolve({ token: 'ok' }),
    })) as React.ReactElement;
    expect(renderToStaticMarkup(result.props.children as React.ReactElement)).toContain(
      'Access denied.'
    );
  });
  
describe('POST /api/admin/preview-token', () => {
    it('returns JSON error when preview token creation fails', async () => {
      const { POST } = await import('@/app/api/admin/preview-token/route');

      mockedCreatePreviewToken.mockImplementation(() => {
        throw new Error('missing secret');
      });

      const request = {
        json: jest.fn().mockResolvedValue({ postId: '1' }),
      } as any;

      const response = await POST(request as any);

      expect(response.status).toBe(500);
      await expect(response.json()).resolves.toEqual({ error: 'Preview secret not configured' });
      expect(mockedLogError).toHaveBeenCalledWith(
        'preview-token: failed to create preview token',
        expect.any(Error),
        expect.objectContaining({ postId: '1', uid: 'user1' })
      );
    });
  });
});