import "server-only";

import { serverEnv } from "@/env/server";
import { logger } from "@/lib/logger";

const WINDOW_SECONDS = 5 * 60; // 5 minutes
const MAX_FAILURES = 5;
const PREFIX = "admin:fail:";

const redisUrl = serverEnv.UPSTASH_REDIS_REST_URL;
const redisToken = serverEnv.UPSTASH_REDIS_REST_TOKEN;

async function redisRequest<T = unknown>(
  cmd: string,
  ...args: string[]
): Promise<T | null> {
  if (!redisUrl || !redisToken) return null;
  const url = `${redisUrl}/${cmd}/${args
    .map((a) => encodeURIComponent(a))
    .join("/")}`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${redisToken}` },
      cache: "no-store",
    });
    if (!res.ok) {
      logger.warn(`Redis command failed: ${cmd}`);
      return null;
    }
    const data = (await res.json()) as { result: T };
    return data.result;
  } catch (err) {
    logger.warn("Redis request error", err);
    return null;
  }
}

export async function incrementAttempts(ip: string): Promise<number> {
  const key = `${PREFIX}${ip}`;
  const count = await redisRequest<number>("incr", key);
  if (count === null) return 0;
  if (redisUrl && redisToken) {
    await redisRequest("expire", key, WINDOW_SECONDS.toString());
  }
  return count;
}

export async function isRateLimited(ip: string): Promise<boolean> {
  const key = `${PREFIX}${ip}`;
  const count = await redisRequest<number | null>("get", key);
  if (count === null) return false;
  return count > MAX_FAILURES;
}

export async function resetAttempts(ip: string): Promise<void> {
  const key = `${PREFIX}${ip}`;
  await redisRequest("del", key);
}