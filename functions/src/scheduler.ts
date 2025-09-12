import { onSchedule } from "firebase-functions/v2/scheduler";
import {
  BASE_URL,
  CRON_SECRET,
  CRON_TIMEOUT_MS,
  CRON_MAX_ATTEMPTS,
} from "../../lib/env";
// Use console.error directly to ensure logging in production
// where lib/log.ts suppresses output based on NODE_ENV.

async function post(path: string, body?: unknown) {
  if (!BASE_URL || !CRON_SECRET) {
    const missing = [];
    if (!BASE_URL) missing.push("BASE_URL");
    if (!CRON_SECRET) missing.push("CRON_SECRET");
    const message = `Missing required env vars: ${missing.join(", ")}`;
    logError("scheduler:post", message);
    throw new Error(message);
  }
  const maxAttempts = CRON_MAX_ATTEMPTS ?? 2;
  const timeoutMs = CRON_TIMEOUT_MS ?? 10_000;
  let delay = 1_000;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
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
        console.error(`scheduler:post ${path}`, `HTTP ${res.status} ${text}`);
        if (attempt === maxAttempts) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        } else {
        console.log(path, res.status);
        return;
      }
    } catch (err) {
      console.error(`scheduler:post ${path}`, err);
      if (attempt === maxAttempts) {
        throw err;
      }
    } finally {
      clearTimeout(timeout);
    }
    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
}

async function maintenance(jobs: string[]) {
  await post("/api/cron/maintenance", { jobs });
}

export const scheduledRevalidate = onSchedule(
  { schedule: "0 * * * *", timeZone: "Asia/Kolkata" },
  async () => {
    await maintenance(["revalidate"]);
  },
);

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