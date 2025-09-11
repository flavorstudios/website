import { onSchedule } from "firebase-functions/v2/scheduler";

const BASE_URL = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL;
const CRON_SECRET = process.env.CRON_SECRET;

async function post(path: string) {
  if (!BASE_URL || !CRON_SECRET) {
    console.warn("Missing BASE_URL or CRON_SECRET for scheduler");
    return;
  }
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${CRON_SECRET}` },
    });
    console.log(path, res.status);
  } catch (err) {
    console.error(`Failed to call ${path}`, err);
  }
}

export const scheduledRevalidate = onSchedule("every 60 minutes", async () => {
  await post("/api/cron/revalidate");
});

export const scheduledSitemap = onSchedule(
  { schedule: "0 2 * * *", timeZone: "Asia/Kolkata" },
  async () => {
    await post("/api/internal/build-sitemap");
    await post("/api/internal/build-rss");
  }
);

export const scheduledAnalytics = onSchedule(
  { schedule: "30 2 * * *", timeZone: "Asia/Kolkata" },
  async () => {
    await post("/api/internal/analytics-rollup");
  }
);

export const scheduledBackup = onSchedule(
  { schedule: "0 3 * * *", timeZone: "Asia/Kolkata" },
  async () => {
    await post("/api/internal/backup");
  }
);