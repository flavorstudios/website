import { onSchedule } from "firebase-functions/v2/scheduler";

const BASE_URL = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL;
if (!BASE_URL) {
  console.warn("Missing BASE_URL for scheduler");
  throw new Error("BASE_URL is required for scheduled functions");
} else if (!BASE_URL.startsWith("http")) {
  console.warn("BASE_URL should include protocol (http/https)");
}
const CRON_SECRET = process.env.CRON_SECRET;
if (!CRON_SECRET) {
  console.warn("Missing CRON_SECRET for scheduler; scheduled jobs will be skipped");
}

async function post(path: string, body?: unknown) {
  if (!CRON_SECRET) {
    console.warn(`Skipping ${path}: CRON_SECRET is not configured`);
    return;
  }
  const attempts = 2;
  for (let i = 0; i < attempts; i++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CRON_SECRET}`,
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      if (!res.ok) {
        const text = await res.text();
        console.error(`Failed to call ${path}: ${res.status} ${text}`);
        if (i === attempts - 1) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        continue;
      }
      console.log(path, res.status);
      return;
    } catch (err) {
      console.error(`Failed to call ${path}`, err);
      if (i === attempts - 1) {
        throw err;
      }
    } finally {
      clearTimeout(timeout);
    }
  }
}

async function maintenance(jobs: string[]) {
  await post("/api/cron/maintenance", { jobs });
}

export const scheduledRevalidate = onSchedule("every 60 minutes", async () => {
  await maintenance(["revalidate"]);
});

export const scheduledSitemap = onSchedule(
  { schedule: "0 2 * * *", timeZone: "Asia/Kolkata" },
  async () => {
    await maintenance(["sitemap", "rss"]);
  }
);

export const scheduledAnalytics = onSchedule(
  { schedule: "30 2 * * *", timeZone: "Asia/Kolkata" },
  async () => {
    await maintenance(["analytics"]);
  }
);

export const scheduledBackup = onSchedule(
  { schedule: "0 3 * * *", timeZone: "Asia/Kolkata" },
  async () => {
    await maintenance(["backup"]);
  }
);