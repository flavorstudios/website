import "server-only";

import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { requireCronAuth } from "@/lib/cronAuth";
import { adminDb } from "@/lib/firebase-admin";
import { logError } from "@/lib/log";

interface CronLogRecord {
  job: string;
  ok: boolean;
  durationMs: number;
  error?: string;
  timestamp?: FieldValue;
}

async function writeCronRecord(record: CronLogRecord): Promise<void> {
  try {
    if (!adminDb) return;
    await adminDb.collection("cronLog").add({
      ...record,
      timestamp: record.timestamp ?? FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error("cron-log write failed", err);
    logError("cron-log", err);
  }
}

export async function handleCron<T>(
  job: string,
  req: Request,
  handler: () => Promise<T>
): Promise<NextResponse> {
  const authReq = new Request(new URL(`/${job}`, req.url), {
    method: req.method,
    headers: req.headers,
  });
  const auth = await requireCronAuth(authReq);
  if (auth) return auth;

  const start = Date.now();
  try {
    const result = await handler();
    await writeCronRecord({ job, ok: true, durationMs: Date.now() - start });
    return NextResponse.json({
      ok: true,
      job,
      ...(result as Record<string, unknown>),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const duration = Date.now() - start;
    const errorMessage =
      err instanceof Error ? err.message : typeof err === "string" ? err : JSON.stringify(err);
    await writeCronRecord({
      job,
      ok: false,
      durationMs: duration,
      error: errorMessage,
    });
    console.error(`${job} cron failed`, err);
    return NextResponse.json(
      { error: `Failed to ${job}` },
      { status: 500 }
    );
  }
}