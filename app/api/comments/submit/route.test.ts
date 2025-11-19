/**
 * @jest-environment node
 */

jest.mock("@/lib/firebase-admin", () => ({
  getAdminDb: () => ({
    collection: () => ({
      doc: () => ({
        id: "comment-1",
        set: jest.fn(),
      }),
    }),
  }),
}));

describe("POST /api/comments/submit", () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_BASE_URL;

  beforeEach(() => {
    jest.resetModules();
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = originalEnv;
  });

  it("returns 410 and points at the external comments endpoint", async () => {
    const { POST } = await import("./route");
    const request = new Request("https://example.com/api/comments/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request as any);

    expect(response.status).toBe(410);
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({
        next: "https://api.example.com/comments",
      }),
    );
  });
});