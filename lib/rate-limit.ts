import "server-only";

import { serverEnv } from "@/env/server";
import { logger } from "@/lib/logger";

const WINDOW_SECONDS = 5 * 60; // 5 minutes
const MAX_FAILURES = 5;
const PREFIX = "admin:fail:";

const RESET_IP_PREFIX = "admin:reset:ip:";
const RESET_EMAIL_PREFIX = "admin:reset:email:";
const RESET_WINDOW_SECONDS = 60 * 60; // 1 hour window per identifier
const RESET_IP_MAX = 5;
const RESET_EMAIL_MAX = 3;

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

function ttlArgs(windowSeconds: number): string[] {
  return [windowSeconds.toString()];
}

async function incrementWithExpiry(
  key: string,
  windowSeconds: number,
): Promise<number> {
  const count = await redisRequest<number | string>("incr", key);
  if (count === null) return 0;
  if (redisUrl && redisToken) {
    await redisRequest("expire", key, ...ttlArgs(windowSeconds));
  }
  return typeof count === "number" ? count : Number(count);
}

async function getCount(key: string): Promise<number | null> {
  const count = await redisRequest<number | string | null>("get", key);
  if (count === null) return null;
  return typeof count === "number" ? count : Number(count);
}

export async function incrementAttempts(ip: string): Promise<number> {
  const key = `${PREFIX}${ip}`;
  return incrementWithExpiry(key, WINDOW_SECONDS);
}

export async function isRateLimited(ip: string): Promise<boolean> {
  const key = `${PREFIX}${ip}`;
  const count = await getCount(key);
  if (count === null) return false;
  return count > MAX_FAILURES;
}

export async function resetAttempts(ip: string): Promise<void> {
  const key = `${PREFIX}${ip}`;
  await redisRequest("del", key);
}

export async function isPasswordResetIpRateLimited(
  ip: string,
): Promise<boolean> {
  if (!ip) return false;
  const key = `${RESET_IP_PREFIX}${ip}`;
  const count = await getCount(key);
  if (count === null) return false;
  return count >= RESET_IP_MAX;
}

export async function isPasswordResetEmailRateLimited(
  email: string,
): Promise<boolean> {
  if (!email) return false;
  const key = `${RESET_EMAIL_PREFIX}${email}`;
  const count = await getCount(key);
  if (count === null) return false;
  return count >= RESET_EMAIL_MAX;
}

export async function incrementPasswordResetCounters(
  ip: string,
  email: string,
): Promise<void> {
  if (ip) {
    const key = `${RESET_IP_PREFIX}${ip}`;
    await incrementWithExpiry(key, RESET_WINDOW_SECONDS);
  }
  if (email) {
    const key = `${RESET_EMAIL_PREFIX}${email}`;
    await incrementWithExpiry(key, RESET_WINDOW_SECONDS);
  }
}
