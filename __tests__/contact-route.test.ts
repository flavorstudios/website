import { restoreEnv, setEnv, snapshotEnv } from '@/test-utils/env';

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data: unknown, init?: { status?: number }) => {
      const headers = new Map<string, string>();
      return {
        status: init?.status ?? 200,
        headers: {
          set: (key: string, value: string) => {
            headers.set(key.toLowerCase(), value);
          },
          get: (key: string) => headers.get(key.toLowerCase()) ?? null,
        },
        async text() {
          return JSON.stringify(data ?? null);
        },
        async json() {
          return data;
        },
      };
    }),
  },
}));

const sendMailMock = jest.fn();
const setMock = jest.fn();
const docMock = jest.fn(() => ({ id: "mock-doc", set: setMock }));
const collectionMock = jest.fn(() => ({ doc: docMock }));

jest.mock("nodemailer", () => ({
  createTransport: jest.fn(() => ({
    sendMail: sendMailMock,
  })),
}));

jest.mock("@/lib/firebase-admin", () => ({
  getAdminDb: jest.fn(() => ({
    collection: collectionMock,
  })),
}));

describe("app/api/contact", () => {
  const originalFetch = global.fetch;
  const fetchMock = jest.fn();
  const originalEnv = snapshotEnv([
    'PERSPECTIVE_API_KEY',
    'SKIP_ENV_VALIDATION',
    'CRON_SECRET',
    'PREVIEW_SECRET',
  ]);
  const responseCtor = Response as unknown as {
    json?: typeof Response.json;
  };
  const originalResponseJson = responseCtor.json;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;

    restoreEnv(originalEnv);
    setEnv('PERSPECTIVE_API_KEY', undefined);
    setEnv('SKIP_ENV_VALIDATION', 'true');
    setEnv('CRON_SECRET', process.env.CRON_SECRET ?? 'test-cron');
    setEnv('PREVIEW_SECRET', process.env.PREVIEW_SECRET ?? 'test-preview');

    if (typeof responseCtor.json !== "function") {
      responseCtor.json = (data: unknown, init?: ResponseInit) => {
        const { headers: initHeaders, ...rest } = init ?? {};
        const headers = new Headers(initHeaders);
        if (!headers.has("content-type")) {
          headers.set("content-type", "application/json");
        }
        return new Response(JSON.stringify(data), {
          ...rest,
          headers,
        });
      };
    }
  });

  afterAll(() => {
    global.fetch = originalFetch;
    restoreEnv(originalEnv);

    if (originalResponseJson) {
      responseCtor.json = originalResponseJson;
    } else {
      delete responseCtor.json;
    }
  });

  it("treats submissions as unflagged when moderation cannot run", async () => {
    const { POST } = await import("@/app/api/contact/route");
    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        firstName: "Taylor",
        lastName: "Doe",
        email: "taylor@example.com",
        subject: "Hello",
        message: "Just saying hi",
      }),
    });

    const response = await POST(request);
    const bodyText = await response.text();
    expect(bodyText).toBeTruthy();
    const payload = JSON.parse(bodyText);

    expect(response.status).toBe(200);
    expect(payload).toEqual({ success: true, flagged: false });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({
        flagged: false,
        scores: null,
      }),
    );
  });

  it("returns redirect details when external backend is configured", async () => {
    setEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.com/");

    const { POST } = await import("@/app/api/contact/route");
    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "ignored" }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(410);
    expect(payload).toEqual({
      error: "This route now lives on the standalone backend.",
      next: "https://api.example.com/contact",
    });
  });

  it("returns validation errors for invalid payloads", async () => {
    setEnv("NEXT_PUBLIC_API_BASE_URL", undefined);

    const { POST } = await import("@/app/api/contact/route");
    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        firstName: "",
        email: "not-an-email",
        message: "",
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual(
      expect.objectContaining({
        error: "Invalid request",
        details: {
          fieldErrors: expect.objectContaining({
            firstName: ["First name is required"],
            email: ["Invalid email"],
            message: ["Message is required"],
            lastName: ["Required"],
            subject: ["Required"],
          }),
          formErrors: [],
        },
      }),
    );
  });
});