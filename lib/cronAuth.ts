import { NextResponse } from "next/server";
import {
  CRON_SECRET,
  UPSTASH_REDIS_REST_URL as redisUrl,
  UPSTASH_REDIS_REST_TOKEN as redisToken,
} from "./env";

const WINDOW_SECONDS = 60;
const PREFIX = "cron:limit:";

const localHits = new Map<string, number>();

async function isRateLimited(path: string): Promise<boolean> {
  if (redisUrl && redisToken) {
    const key = `${PREFIX}${path}`;
    try {
      const incr = await fetch(
        `${redisUrl}/incr/${encodeURIComponent(key)}`,
        {
          headers: { Authorization: `Bearer ${redisToken}` },
          cache: "no-store",
        }
      );
      if (!incr.ok) return false;
      const { result } = (await incr.json()) as { result: number };
      if (result === 1) {
        await fetch(
          `${redisUrl}/expire/${encodeURIComponent(key)}/${WINDOW_SECONDS}`,
          {
            headers: { Authorization: `Bearer ${redisToken}` },
            cache: "no-store",
          }
        );
      }
      return result > 1;
    } catch {
      return false;
    }
  }

  const now = Date.now();
  const last = localHits.get(path);
  if (!last || now - last > WINDOW_SECONDS * 1000) {
    localHits.set(path, now);
    return false;
  }
  return true;
}

export async function requireCronAuth(
  req: Request
): Promise<NextResponse | void> {
  if (!CRON_SECRET) {
    return NextResponse.json(
      { error: "CRON_SECRET is not set" },
      { status: 500 }
    );
  }
  
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const path = new URL(req.url).pathname;
  if (await isRateLimited(path)) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429 }
    );
  }
  
  return;
}