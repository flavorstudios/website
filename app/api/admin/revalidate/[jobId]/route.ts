import { NextResponse, type NextRequest } from "next/server";

import {
  completeJob,
  getHistory,
  getJob,
  updateJobProgress,
} from "@/lib/revalidate-store";
import type { JobStatus } from "@/types/revalidate";

type RevalidateRouteContext = { params: { jobId: string } };

export async function GET(
  _request: NextRequest,
  context: RevalidateRouteContext,
) {
  const { jobId } = context.params;
  const job = getJob(jobId);

  if (job) {
    const progress = updateJobProgress(job);

    if (progress.done) {
      job.pagesTouched = job.pagesTouched || 80 + Math.round(Math.random() * 60);
      job.message = progress.message ?? job.message;
      completeJob(job);
    }

    const status: JobStatus = {
      jobId,
      env: job.env,
      startedAt: new Date(job.startedAt).toISOString(),
      progress: job.progress,
      step: job.step,
      durationMs: job.durationMs,
      message: progress.message,
    };

    return NextResponse.json(status);
  }

  const history = getHistory();
  const existing = history.find((run) => run.jobId === jobId);
  if (existing) {
    const status: JobStatus = {
      jobId,
      env: existing.env,
      startedAt: existing.startedAt,
      progress: 100,
      step: existing.status === "failed" ? "failed" : "done",
      durationMs: existing.durationMs,
      message: existing.statusMessage,
    };
    return NextResponse.json(status);
  }

  return NextResponse.json({ error: "Job not found" }, { status: 404 });
}