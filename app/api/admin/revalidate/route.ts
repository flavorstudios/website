import { NextResponse } from "next/server";

import {
  trackJob,
  type InternalJob,
} from "@/lib/revalidate-store";
import { type RevalidateRequest, type RevalidateResponse } from "@/types/revalidate";

function validateRequest(body: RevalidateRequest) {
  if (!body.env || !body.scope) return false;
  if (body.scope === "routes" && !body.routes?.length) return false;
  if (body.scope === "tags" && !body.tags?.length) return false;
  return true;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RevalidateRequest;
    if (!validateRequest(body)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const jobId = crypto.randomUUID();
    const startedAt = Date.now();

    const job: InternalJob = {
      ...body,
      jobId,
      startedAt,
      triggeredBy: "You",
      status: "running",
      progress: 0,
      step: "kickoff",
      durationMs: undefined,
      message: "Job accepted",
      logs: [`${new Date(startedAt).toLocaleTimeString()} Job accepted`],
      pagesTouched: 0,
    };

    trackJob(job);

    return NextResponse.json({ jobId } satisfies RevalidateResponse, { status: 202 });
  } catch {
    return NextResponse.json(
      { error: "Unable to create revalidation job" },
      { status: 500 }
    );
  }
}