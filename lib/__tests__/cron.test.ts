/** @jest-environment node */

import { NextResponse } from "next/server";

jest.mock("../cronAuth", () => ({
  requireCronAuth: jest.fn(),
}));

import { handleCron } from "../cron";
import { requireCronAuth } from "../cronAuth";

const mockRequireCronAuth = requireCronAuth as jest.Mock;

describe("handleCron", () => {
  beforeEach(() => {
    mockRequireCronAuth.mockReset();
  });

  it("executes the job and returns payload when authorized", async () => {
    mockRequireCronAuth.mockResolvedValue(undefined);
    const handler = jest.fn().mockResolvedValue({ data: 123 });
    const req = new Request("https://example.com/api/cron/test");

    const res = await handleCron("test-job", req, handler);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ ok: true, job: "test-job", data: 123 });
    expect(json.timestamp).toBeDefined();
  });

  it("returns unauthorized when requireCronAuth responds with 401", async () => {
    mockRequireCronAuth.mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );
    const handler = jest.fn();
    const req = new Request("https://example.com/api/cron/test");

    const res = await handleCron("test-job", req, handler);
    expect(res.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it("returns rate limit when requireCronAuth responds with 429", async () => {
    mockRequireCronAuth.mockResolvedValue(
      NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    );
    const handler = jest.fn();
    const req = new Request("https://example.com/api/cron/test");

    const res = await handleCron("test-job", req, handler);
    expect(res.status).toBe(429);
    expect(handler).not.toHaveBeenCalled();
  });
});
