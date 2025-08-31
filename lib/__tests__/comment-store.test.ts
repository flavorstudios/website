import { commentStore } from "@/lib/comment-store";
import { getAdminDb } from "@/lib/firebase-admin";

jest.mock("@/lib/firebase-admin", () => ({ getAdminDb: jest.fn() }));

describe("commentStore.create", () => {
  beforeEach(() => {
    // mock Firestore chainable methods
    const setMock = jest.fn();
    const dbMock: any = { set: setMock };
    dbMock.collection = jest.fn(() => dbMock);
    dbMock.doc = jest.fn(() => dbMock);
    (getAdminDb as jest.Mock).mockReturnValue(dbMock);

    global.fetch = jest
      .fn()
      .mockResolvedValue({ json: async () => ({}) } as Response);

    process.env.PERSPECTIVE_API_KEY = "test";
  });

  it("generates unique ids", async () => {
    const ids = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const res = await commentStore.create({
        postId: "1",
        postType: "blog",
        content: "hello",
      });
      expect(ids.has(res.id)).toBe(false);
      ids.add(res.id);
    }
    expect(ids.size).toBe(50);
  });
});