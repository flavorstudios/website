/**
 * @jest-environment node
 */

jest.mock("@/lib/firebase-admin", () => ({
  getAdminDb: () => ({
    collection: () => ({
      doc: () => ({
        id: "career-1",
        set: jest.fn(),
      }),
    }),
  }),
}));

jest.mock("nodemailer", () => ({
  createTransport: () => ({
    sendMail: jest.fn(),
  }),
}));

describe("POST /api/career", () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_BASE_URL;

  beforeEach(() => {
    jest.resetModules();
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = originalEnv;
  });

  it("returns 410 when the standalone backend is configured", async () => {
    const { POST } = await import("./route");
    const request = new Request("https://example.com/api/career", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user@example.com" }),
    });

    const response = await POST(request as any);

    expect(response.status).toBe(410);
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({
        next: "https://api.example.com/career",
      }),
    );
  });
});