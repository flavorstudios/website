jest.mock('../media', () => ({
  ensureFreshMediaUrl: jest.fn(async (url: string | null | undefined) => url ?? undefined),
}));

import { formatPublicBlogSummary, formatPublicBlogDetail, formatPublicVideo } from '../formatters';
import type { BlogPost } from '../content-store';
import type { Video } from '../types';

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

  it('omits empty categories when missing', async () => {
    const blogWithoutCategories: BlogPost = {
      ...baseBlog,
      category: '',
      categories: ['', '  ', null as unknown as string],
    };

    const summary = await formatPublicBlogSummary(blogWithoutCategories);
    expect(summary.categories).toEqual([]);

    const detail = await formatPublicBlogDetail(blogWithoutCategories);
    expect(detail.categories).toEqual([]);
  });

  it('converts tiptap json string content into html when formatting detail', async () => {
    const tiptapJson = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello world' }],
        },
      ],
    };

    const withJsonContent: BlogPost = {
      ...baseBlog,
      content: JSON.stringify(tiptapJson),
    };

    const out = await formatPublicBlogDetail(withJsonContent);
    expect(out.content).toBe('<p>Hello world</p>');
  });
});

describe('formatPublicVideo', () => {
  const baseVideo: Video = {
    id: 'v1',
    title: 'Video',
    slug: 'video',
    category: 'anime',
  };

  it('uses provided categories array when present', () => {
    const result = formatPublicVideo({
      ...baseVideo,
      categories: ['anime', 'behind-the-scenes'],
    });

    expect(result.categories).toEqual(['anime', 'behind-the-scenes']);
  });

  it('falls back to the single category when no categories array provided', () => {
    const result = formatPublicVideo(baseVideo);

    expect(result.categories).toEqual(['anime']);
  });

  it('normalizes missing tags to an empty array', () => {
    const result = formatPublicVideo({
      ...baseVideo,
      tags: undefined,
    });

    expect(result.tags).toEqual([]);
  });
});