/**
 * @jest-environment node
 */
import React from 'react';
import PreviewPage from '../[id]/page';
import { verifyAdminSession } from '@/lib/admin-auth';
import { blogStore } from '@/lib/content-store';
import { validatePreviewToken } from '@/lib/preview-token';

jest.mock('@/lib/admin-auth', () => ({
  verifyAdminSession: jest.fn(),
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
  validatePreviewToken: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

// Ensures any HTTP server started during tests is closed even if assertions fail.
let server: { close: () => void } | null = null;

const mockedVerify = verifyAdminSession as jest.Mock;
const mockedGetById = (blogStore.getById as unknown) as jest.Mock;

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
    mockedGetById.mockResolvedValue(mockPost);
    cookieValue = 'session';
    headerStore = new Headers({ 'x-request-id': 'req' });
    (validatePreviewToken as jest.Mock).mockReset();
  });

  it('returns element for valid token', async () => {
    (validatePreviewToken as jest.Mock).mockReturnValue('valid');
    const result = await PreviewPage({
      params: Promise.resolve({ id: '1' }),
      searchParams: Promise.resolve({ token: 'ok' }),
    });
    expect(React.isValidElement(result)).toBe(true);
  });

  it('returns error element for invalid token', async () => {
    (validatePreviewToken as jest.Mock).mockReturnValue('invalid');
    const result = await PreviewPage({
      params: Promise.resolve({ id: '1' }),
      searchParams: Promise.resolve({ token: 'bad' }),
    });
    expect(React.isValidElement(result)).toBe(true);
  });

  it('returns error element for expired token', async () => {
    (validatePreviewToken as jest.Mock).mockReturnValue('expired');
    const result = await PreviewPage({
      params: Promise.resolve({ id: '1' }),
      searchParams: Promise.resolve({ token: 'old' }),
    });
    expect(React.isValidElement(result)).toBe(true);
  });

  it('throws notFound when post missing', async () => {
    mockedGetById.mockResolvedValue(null);
    (validatePreviewToken as jest.Mock).mockReturnValue('valid');
    await expect(
      PreviewPage({
        params: Promise.resolve({ id: '1' }),
        searchParams: Promise.resolve({ token: 'ok' }),
      })
    ).rejects.toThrow('NEXT_NOT_FOUND');
  });
});