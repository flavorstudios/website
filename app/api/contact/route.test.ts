/**
 * @jest-environment node
 */

jest.mock("@/lib/firebase-admin", () => ({
  getAdminDb: () => ({
    collection: () => ({
      doc: () => ({
        id: "contact-1",
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

describe("POST /api/contact", () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_BASE_URL;

  beforeEach(() => {
    jest.resetModules();
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = originalEnv;
  });

  it("returns 410 with a next link when the backend is configured", async () => {
    const { POST } = await import("./route");
    const request = new Request("https://example.com/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: "Test" }),
    });

    const response = await POST(request as any);

    expect(response.status).toBe(410);
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({
        error: expect.stringContaining("standalone backend"),
        next: "https://api.example.com/contact",
      }),
    );
  });
});