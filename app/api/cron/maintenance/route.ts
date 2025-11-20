import { NextResponse } from "next/server";
import { handleCron } from "@/lib/cron";

const jobMap: Record<string, string> = {
  revalidate: "/api/cron/revalidate",
  rss: "/api/internal/build-rss",
  sitemap: "/api/internal/build-sitemap",
  analytics: "/api/internal/analytics-rollup",
  backup: "/api/internal/backup",
};

export async function POST(req: Request) {

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const jobs = Array.isArray((body as any).jobs) ? ((body as any).jobs as string[]) : [];
  const headers = { Authorization: req.headers.get("authorization") ?? "" };

  return handleCron("maintenance", req, async () => {
    const results: { job: string; status: number }[] = [];

    for (const job of jobs) {
      const path = jobMap[job];
      if (!path) {
        results.push({ job, status: 400 });
        continue;
      }
      try {
        const res = await fetch(new URL(path, req.url), {
          method: "POST",
          headers,
        });
        results.push({ job, status: res.status });
      } catch (err) {
        console.error("Failed maintenance job", { job, error: err });
        results.push({ job, status: 500 });
      }
    }

  const failed = results.filter((r) => r.status >= 400);
    if (failed.length > 0) {
      throw new Error(
        `Failed jobs: ${failed.map((f) => `${f.job} (${f.status})`).join(", ")}`
      );
    }

    return { artifacts: results };
  });
}