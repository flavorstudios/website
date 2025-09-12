/** @jest-environment node */

import { mkdtempSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

process.env.CRON_SECRET = "test-secret";
process.env.BASE_URL = "http://localhost:3000";
const tmpBackupDir = mkdtempSync(join(tmpdir(), "backup-"));
process.env.BACKUP_DIR = tmpBackupDir;
process.env.GOOGLE_APPLICATION_CREDENTIALS = join(tmpBackupDir, "creds.json");
writeFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, "{}");

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
  let maintenance: any;
  let NextRequest: any;

  beforeAll(async () => {
    NextRequest = (await import("next/server")).NextRequest;
    revalidate = (await import("@/app/api/cron/revalidate/route")).POST;
    buildSitemap = (await import("@/app/api/internal/build-sitemap/route")).POST;
    buildRss = (await import("@/app/api/internal/build-rss/route")).POST;
    analyticsRollup = (await import("@/app/api/internal/analytics-rollup/route")).POST;
    backup = (await import("@/app/api/internal/backup/route")).POST;
    maintenance = (await import("@/app/api/cron/maintenance/route")).POST;
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
      artifacts: ["/sitemap.xml"],
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
      artifacts: ["/rss.xml"],
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
      artifacts: expect.any(Array),
      timestamp: expect.any(String),
    });
  });

  it("backs up when authorized", async () => {
    const res = await backup(authReq());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.job).toBe("backup");
    expect(data.artifacts).toHaveLength(2);
    expect(data.artifacts).toEqual(
      expect.arrayContaining([
        expect.stringContaining("db-"),
        expect.stringContaining("storage-"),
      ])
    );
    expect(data.timestamp).toEqual(expect.any(String));
  });

  it("runs maintenance jobs when authorized", async () => {
    const fetchMock = jest
      .spyOn(global, "fetch" as any)
      .mockResolvedValue(new Response(null, { status: 200 }));
    const req = new NextRequest("http://test/api/cron/maintenance", {
      method: "POST",
      headers: {
        Authorization: "Bearer test-secret",
        "content-type": "application/json",
      },
      body: JSON.stringify({ jobs: ["revalidate", "rss"] }),
    });
    const res = await maintenance(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({
      ok: true,
      job: "maintenance",
      artifacts: [
        { job: "revalidate", status: 200 },
        { job: "rss", status: 200 },
      ],
      timestamp: expect.any(String),
    });
    fetchMock.mockRestore();
  });
});