import { NextResponse } from "next/server";

const WINDOW_SECONDS = 60;
const PREFIX = "cron:limit:";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

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
): Promise<NextResponse | null> {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Server misconfig: CRON_SECRET missing" },
      { status: 500 }
    );
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const path = new URL(req.url).pathname;
  if (await isRateLimited(path)) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429 }
    );
  }
  
  return null;
}