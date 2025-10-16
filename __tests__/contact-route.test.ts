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
  const originalApiKey = process.env.PERSPECTIVE_API_KEY;
  const originalSkipValidation = process.env.SKIP_ENV_VALIDATION;
  const responseCtor = Response as unknown as {
    json?: typeof Response.json;
  };
  const originalResponseJson = responseCtor.json;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;

    delete process.env.PERSPECTIVE_API_KEY;
    process.env.SKIP_ENV_VALIDATION = "true";
    process.env.CRON_SECRET = process.env.CRON_SECRET ?? "test-cron";
    process.env.PREVIEW_SECRET = process.env.PREVIEW_SECRET ?? "test-preview";

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
    if (originalApiKey === undefined) {
      delete process.env.PERSPECTIVE_API_KEY;
    } else {
      process.env.PERSPECTIVE_API_KEY = originalApiKey;
    }

    if (originalSkipValidation === undefined) {
      delete process.env.SKIP_ENV_VALIDATION;
    } else {
      process.env.SKIP_ENV_VALIDATION = originalSkipValidation;
    }

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
});