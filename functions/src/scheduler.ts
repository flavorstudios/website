import { onSchedule } from "firebase-functions/v2/scheduler";
import { BASE_URL, CRON_SECRET } from "../../lib/env";

async function post(path: string, body?: unknown) {
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