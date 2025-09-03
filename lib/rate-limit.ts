import "server-only";

import { serverEnv } from "@/env/server";

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
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${redisToken}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Redis command failed: ${cmd}`);
  }
  const data = (await res.json()) as { result: T };
  return data.result;
}

export async function incrementAttempts(ip: string): Promise<number> {
  const key = `${PREFIX}${ip}`;
  const count = (await redisRequest<number>("incr", key)) ?? 0;
  if (redisUrl && redisToken) {
    await redisRequest("expire", key, WINDOW_SECONDS.toString());
  }
  return count;
}

export async function isRateLimited(ip: string): Promise<boolean> {
  const key = `${PREFIX}${ip}`;
  const count = await redisRequest<number | null>("get", key);
  return (count ?? 0) > MAX_FAILURES;
}

export async function resetAttempts(ip: string): Promise<void> {
  const key = `${PREFIX}${ip}`;
  await redisRequest("del", key);
}