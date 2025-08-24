/**
 * @jest-environment node
 */
import { POST } from "./route";
import { requireAdmin, getSessionAndRole } from "@/lib/admin-auth";

jest.mock("@/lib/admin-auth", () => ({
  requireAdmin: jest.fn().mockResolvedValue(true),
  getSessionAndRole: jest.fn().mockResolvedValue({ uid: "u1" }),
}));

// simple in-memory prisma mock
const store: Record<string, any> = {};
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: async () => ({
    $transaction: async (fn: any) =>
      fn({
        draft: {
          findUnique: async ({ where: { id } }: any) => store[id] || null,
          upsert: async ({ where: { id }, update, create }: any) => {
            const existing = store[id];
            const val = existing ? { ...existing, ...update } : create;
            store[id] = val;
            return val;
          },
        },
      }),
  }),
}));

function makeReq(body: any) {
  return new Request("http://test/api", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/admin/blog/drafts", () => {
  it("upserts draft", async () => {
    const res = await POST(makeReq({ draftId: "1", title: "a" }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.version).toBe(1);
  });

  it("detects conflict", async () => {
    await POST(makeReq({ draftId: "c1", title: "a" }));
    // simulate server update to bump version
    (store["c1"].version = 2);
    const res = await POST(makeReq({ draftId: "c1", title: "b", version: 1 }));
    expect(res.status).toBe(409);
  });
});