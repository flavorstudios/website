/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    arrayUnion: (...vals: any[]) => ({ __op: 'union', vals }),
    arrayRemove: (...vals: any[]) => ({ __op: 'remove', vals }),
    increment: (n: number) => ({ __op: 'inc', n }),
  },
}));

jest.mock('@/lib/firebase-admin', () => {
  const mediaStore: Record<string, any> = {};
  const blogStoreData: Record<string, any> = {};
  function makeCollection(store: Record<string, any>) {
    return {
      doc: (id: string) => ({
        get: async () => ({ exists: !!store[id], data: () => store[id] }),
        set: async (data: any, opts?: any) => {
          store[id] = opts?.merge ? { ...store[id], ...data } : data;
        },
        update: async (data: any) => {
          const cur = store[id] || {};
          for (const key of Object.keys(data)) {
            const val = data[key];
            if (val && val.__op === 'union') {
              cur[key] = Array.from(new Set([...(cur[key] || []), ...val.vals]));
            } else if (val && val.__op === 'remove') {
              cur[key] = (cur[key] || []).filter((v: any) => !val.vals.includes(v));
            } else {
              cur[key] = val;
            }
          }
          store[id] = cur;
        },
        delete: async () => {
          delete store[id];
        },
      }),
      add: jest.fn(),
      orderBy: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: async () => ({
        docs: Object.entries(store).map(([id, data]) => ({ id, data: () => data })),
      }),
      startAfter: jest.fn().mockReturnThis(),
    } as any;
  }
  const mockDb = {
    collection: (name: string) =>
      name === 'media' ? makeCollection(mediaStore) : makeCollection(blogStoreData),
  } as any;
  return { safeAdminDb: mockDb, getAdminDb: () => mockDb, __stores: { mediaStore, blogStoreData } };
});

const { __stores } = require('@/lib/firebase-admin');
const mediaStore: Record<string, any> = __stores.mediaStore;

const { blogStore } = require('@/lib/content-store');
const { deleteMedia } = require('@/lib/media');
import type { MediaDoc } from '@/types/media';

describe('media usage linking', () => {
  it('links media to post and prevents deletion without force', async () => {
    const media: MediaDoc = {
      id: 'aaaaaaaaaaaaaaaa',
      url: 'https://example.com/media/aaaaaaaaaaaaaaaa/file.jpg',
      filename: 'file.jpg',
      mime: 'image/jpeg',
      size: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as any;
    mediaStore[media.id] = media;

    const post = await blogStore.create({
      title: 't',
      slug: 's',
      content: `<img src="https://example.com/media/${media.id}/file.jpg" />`,
      excerpt: 'e',
      status: 'draft',
      category: 'c',
      categories: ['c'],
      tags: [],
      featuredImage: '',
      seoTitle: '',
      seoDescription: '',
      author: 'a',
      publishedAt: new Date().toISOString(),
      openGraphImage: '',
    });

    expect(mediaStore[media.id].attachedTo).toContain(post.id);

    await expect(deleteMedia(media.id)).rejects.toThrow('MEDIA_IN_USE');

    const deleted = await deleteMedia(media.id, true);
    expect(deleted).toBe(true);
  });
});