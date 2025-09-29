jest.mock('../media', () => ({
  ensureFreshMediaUrl: jest.fn(async (url: string | null | undefined) => url ?? undefined),
}));

import { formatPublicBlogSummary, formatPublicBlogDetail } from '../formatters';
import type { BlogPost } from '../content-store';

describe('formatPublicBlog', () => {
  const baseBlog: BlogPost = {
    id: '1',
    title: 'Test',
    slug: 'test',
    content: '<p>content</p>',
    excerpt: 'excerpt',
    status: 'published',
    category: 'cat',
    tags: ['tag'],
    featuredImage: 'img.jpg',
    seoTitle: 'seo',
    seoDescription: 'desc',
    author: 'author',
    publishedAt: '2024-01-01',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-02',
    views: 0,
    categories: undefined,
    readTime: '5 min',
  };

  it('formats summary without content', async () => {
    const out = await formatPublicBlogSummary(baseBlog);
    expect(out).toMatchObject({
      id: '1',
      title: 'Test',
      slug: 'test',
      excerpt: 'excerpt',
      featuredImage: 'img.jpg',
      category: 'cat',
      categories: ['cat'],
      tags: ['tag'],
      publishedAt: '2024-01-01',
      readTime: '5 min',
      views: 0,
      commentCount: 0,
      shareCount: 0,
    });
    expect((out as any).content).toBeUndefined();
  });

  it('formats detail with content', async () => {
    const out = await formatPublicBlogDetail(baseBlog);
    expect(out.content).toBe('<p>content</p>');
    expect(out.categories).toEqual(['cat']);
    expect(out.commentCount).toBe(0);
    expect(out.shareCount).toBe(0);
    expect(out.author).toBe('author');
  });
});