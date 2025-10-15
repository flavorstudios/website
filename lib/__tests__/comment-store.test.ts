import { commentStore } from "@/lib/comment-store";
import { getAdminDb } from "@/lib/firebase-admin";
import { serverEnv } from "@/env/server";

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

    serverEnv.PERSPECTIVE_API_KEY = "test";
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

  it("marks comments as pending when moderation is unavailable", async () => {
    serverEnv.PERSPECTIVE_API_KEY = undefined;
    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockClear();
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const res = await commentStore.create({
      postId: "1",
      postType: "blog",
      content: "hello",
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(res.status).toBe("pending");
    expect(res.scores).toBeUndefined();
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it("approves comments when moderation scores are below the threshold", async () => {
    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockResolvedValueOnce({
      json: async () => ({
        attributeScores: {
          TOXICITY: { summaryScore: { value: 0.1 } },
          INSULT: { summaryScore: { value: 0.05 } },
          THREAT: { summaryScore: { value: 0 } },
        },
      }),
    } as unknown as Response);

    const res = await commentStore.create({
      postId: "1",
      postType: "blog",
      content: "hello",
    });

    expect(res.status).toBe("approved");
    expect(res.scores).toEqual({ toxicity: 0.1, insult: 0.05, threat: 0 });
  });
});