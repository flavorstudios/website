import type { MediaDoc } from '@/types/media';
import type { FirebaseFirestore } from 'firebase-admin';

const mockDocData: MediaDoc = {
  id: '1234567890abcdef',
  url: 'https://storage.googleapis.com/mock-bucket/media/1234567890abcdef/original.jpg',
  filename: 'original.jpg',
  mime: 'image/jpeg',
  size: 1024,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  urlExpiresAt: Date.now() - 60_000,
};

const docRef = {
  get: jest.fn(async () => ({
    exists: true,
    data: () => mockDocData,
  })),
};

const collectionRef = {
  doc: jest.fn(() => docRef),
};

jest.mock('@/lib/firebase-admin', () => ({
  safeAdminDb: {
    collection: jest.fn(() => collectionRef as unknown as FirebaseFirestore.CollectionReference<MediaDoc>),
  },
}));

import * as media from '../media';

describe('ensureFreshMediaUrl', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('refreshes expired media URLs and returns the updated link', async () => {
    const refreshedDoc: MediaDoc = {
      ...mockDocData,
      url: 'https://storage.googleapis.com/mock-bucket/media/1234567890abcdef/fresh.jpg',
      urlExpiresAt: Date.now() + 60_000,
    };

    const refreshMock = jest
      .fn<typeof media.refreshMediaUrl>()
      .mockResolvedValue(refreshedDoc);

    const result = await media.ensureFreshMediaUrl(mockDocData.url, {
      refresh: refreshMock,
    });

    expect(collectionRef.doc).toHaveBeenCalledWith('1234567890abcdef');
    expect(refreshMock).toHaveBeenCalledWith('1234567890abcdef');
    expect(result).toBe(refreshedDoc.url);
  });
});