/// <reference types="jest" />

const mockGet = jest.fn();

const createQuery = () => {
  const query: any = {};
  query.where = jest.fn(() => query);
  query.startAfter = jest.fn(() => query);
  query.orderBy = jest.fn(() => query);
  query.limit = jest.fn(() => ({ get: mockGet }));
  return query;
};

jest.mock("@/lib/firebase-admin", () => {
  const mockCollection = {
    orderBy: jest.fn(() => createQuery()),
  };

  const mockDb = {
    collection: jest.fn(() => mockCollection),
  };

  return {
    safeAdminDb: mockDb,
    __mockCollection: mockCollection,
    __mockDb: mockDb,
  };
});

jest.mock("@/lib/logger", () => {
  const warnMock = jest.fn();
  return {
    logger: {
      warn: warnMock,
      debug: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    },
    debug: false,
    __warnMock: warnMock,
  };
});

jest.mock("@/env/server", () => ({
  serverEnv: {
    FIREBASE_STORAGE_BUCKET: undefined,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: undefined,
  },
}));

jest.mock("firebase-admin/storage", () => ({
  getStorage: jest.fn(() => ({
    bucket: jest.fn(() => {
      throw new Error("bucket unavailable");
    }),
  })),
}));

import { listMedia } from "@/lib/media";

const { __mockCollection, __mockDb } = jest.requireMock("@/lib/firebase-admin");
const { __warnMock } = jest.requireMock("@/lib/logger");
const mockCollection = __mockCollection as { orderBy: jest.Mock };
const mockDb = __mockDb as { collection: jest.Mock };
const warnMock = __warnMock as jest.Mock;

const sampleDoc = {
  id: "media-1234567890abcd",
  url: "https://example.com/media-1234567890abcd.png",
  filename: "example.png",
  basename: "example",
  ext: ".png",
  mime: "image/png",
  size: 2048,
  width: 0,
  height: 0,
  alt: "",
  tags: [],
  createdBy: "",
  variants: [],
  favorite: false,
  createdAt: 1_700_000_000_000,
  updatedAt: 1_700_000_000_000,
};

describe("listMedia storage fallback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReset();
    (mockCollection.orderBy as jest.Mock).mockImplementation(() => createQuery());
    (mockDb.collection as jest.Mock).mockReturnValue(mockCollection as any);
  });

  it("returns Firestore results even when storage bucket is unavailable", async () => {
    mockGet.mockResolvedValue({
      docs: [
        {
          data: () => sampleDoc,
          get: (field: string) =>
            field === "createdAt" ? sampleDoc.createdAt : undefined,
        },
      ],
    });

    const result = await listMedia();

    expect(result.media).toEqual([sampleDoc]);
    expect(result.cursor).toBe(sampleDoc.createdAt);
    expect(warnMock).toHaveBeenCalledTimes(1);
    expect(warnMock.mock.calls[0][0]).toContain("Cloud Storage bucket unavailable");
  });
});