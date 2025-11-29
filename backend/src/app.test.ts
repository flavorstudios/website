/** @jest-environment node */
import request from "supertest";
import { createApp } from "./app";

describe("CORS configuration", () => {
  const originalAllowedOrigins = process.env.CORS_ALLOWED_ORIGINS;

  afterEach(() => {
    if (originalAllowedOrigins === undefined) {
      delete process.env.CORS_ALLOWED_ORIGINS;
    } else {
      process.env.CORS_ALLOWED_ORIGINS = originalAllowedOrigins;
    }
  });

  it("reflects the request origin when no allowlist is configured", async () => {
    delete process.env.CORS_ALLOWED_ORIGINS;

    const app = createApp();
    const response = await request(app)
      .get("/healthz")
      .set("Origin", "https://example.com");

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe("https://example.com");
  });

  it("restricts responses to the configured allowlist", async () => {
    process.env.CORS_ALLOWED_ORIGINS = "https://allowed.example";

    const app = createApp();
    const allowedResponse = await request(app)
      .get("/healthz")
      .set("Origin", "https://allowed.example");
    const blockedResponse = await request(app)
      .get("/healthz")
      .set("Origin", "https://blocked.example");

    expect(allowedResponse.status).toBe(200);
    expect(allowedResponse.headers["access-control-allow-origin"]).toBe(
      "https://allowed.example",
    );
    expect(blockedResponse.status).toBe(200);
    expect(blockedResponse.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
