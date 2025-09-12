/** @jest-environment node */

process.env.CRON_SECRET = "test-secret";
process.env.BASE_URL = "http://localhost:3000";

jest.mock("next/cache", () => ({
  revalidatePath: () => {},
  revalidateTag: () => {},
}));

describe("cron endpoints", () => {
  let revalidate: any;
  let buildSitemap: any;
  let buildRss: any;
  let analyticsRollup: any;
  let backup: any;
  let NextRequest: any;

  beforeAll(async () => {
    NextRequest = (await import("next/server")).NextRequest;
    revalidate = (await import("@/app/api/cron/revalidate/route")).POST;
    buildSitemap = (await import("@/app/api/internal/build-sitemap/route")).POST;
    buildRss = (await import("@/app/api/internal/build-rss/route")).POST;
    analyticsRollup = (await import("@/app/api/internal/analytics-rollup/route")).POST;
    backup = (await import("@/app/api/internal/backup/route")).POST;
  });

  const authReq = () =>
    new NextRequest("http://test", {
      method: "POST",
      headers: { Authorization: "Bearer test-secret" },
    });

  it("rejects unauthorized access", async () => {
    const res = await revalidate(
      new NextRequest("http://test/api/cron/revalidate", { method: "POST" })
    );
    expect(res.status).toBe(401);
  });

  it("revalidates when authorized", async () => {
    const res = await revalidate(authReq());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({
      ok: true,
      job: "revalidate",
      artifacts: expect.arrayContaining(["/", "/blog", "/tags", "feeds"]),
      timestamp: expect.any(String),
    });
    expect(data.artifacts).toHaveLength(4);
  });

  it("builds sitemap when authorized", async () => {
    const res = await buildSitemap(authReq());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({
      ok: true,
      job: "build-sitemap",
      artifacts: ["feeds"],
      timestamp: expect.any(String),
    });
  });

  it("builds rss when authorized", async () => {
    const res = await buildRss(authReq());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({
      ok: true,
      job: "build-rss",
      artifacts: ["feeds"],
      timestamp: expect.any(String),
    });
  });

  it("rolls up analytics when authorized", async () => {
    const res = await analyticsRollup(authReq());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({
      ok: true,
      job: "analytics-rollup",
      artifacts: [],
      timestamp: expect.any(String),
    });
  });

  it("backs up when authorized", async () => {
    const res = await backup(authReq());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({
      ok: true,
      job: "backup",
      artifacts: [],
      timestamp: expect.any(String),
    });
  });
});