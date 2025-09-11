/** @jest-environment node */

process.env.CRON_SECRET = "test-secret";

jest.mock("next/cache", () => ({
  revalidatePath: () => {},
  revalidateTag: () => {},
}));

describe("cron endpoints", () => {
  let revalidate: any;
  let buildSitemap: any;
  let NextRequest: any;

  beforeAll(async () => {
    NextRequest = (await import("next/server")).NextRequest;
    revalidate = (await import("@/app/api/cron/revalidate/route")).POST;
    buildSitemap = (await import("@/app/api/internal/build-sitemap/route")).POST;
  });

  it("rejects unauthorized access", async () => {
    const res = await revalidate(new NextRequest("http://test", { method: "POST" }));
    expect(res.status).toBe(401);
  });

  it("revalidates when authorized", async () => {
    const res = await revalidate(
      new NextRequest("http://test", {
        method: "POST",
        headers: { Authorization: "Bearer test-secret" },
      })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.revalidated).toContain("/");
  });

  it("builds sitemap when authorized", async () => {
    const res = await buildSitemap(
      new NextRequest("http://test", {
        method: "POST",
        headers: { Authorization: "Bearer test-secret" },
      })
    );
    expect(res.status).toBe(200);
  });
});