import {
  type JobStatus,
  type RevalidateHistoryItem,
  type RevalidateRequest,
  type RevalidateStatus,
} from "@/types/revalidate";

export type { RevalidateRequest, RevalidateResponse } from "@/types/revalidate";

interface InternalJob extends RevalidateRequest {
  jobId: string;
  startedAt: number;
  triggeredBy: string;
  status: RevalidateStatus;
  progress: number;
  step: JobStatus["step"];
  durationMs?: number;
  message?: string;
  logs: string[];
  pagesTouched: number;
}

interface RevalidateStore {
  jobs: Map<string, InternalJob>;
  history: RevalidateHistoryItem[];
}

declare global {
  var __revalidateStore: RevalidateStore | undefined;
}

const STEP_SEQUENCE: Array<{ step: JobStatus["step"]; duration: number; message: string }> = [
  { step: "kickoff", duration: 800, message: "Job accepted" },
  { step: "invalidate", duration: 2200, message: "Invalidating cache" },
  { step: "rebuild", duration: 3000, message: "Rebuilding static assets" },
  { step: "warm", duration: 2000, message: "Warming priority routes" },
];

const MAX_HISTORY = 25;

export function getRevalidateStore(): RevalidateStore {
  if (!globalThis.__revalidateStore) {
    globalThis.__revalidateStore = {
      jobs: new Map(),
      history: seedHistory(),
    };
  }
  return globalThis.__revalidateStore;
}

export function trackJob(job: InternalJob) {
  const store = getRevalidateStore();
  store.jobs.set(job.jobId, job);
}

export function getJob(jobId: string) {
  const store = getRevalidateStore();
  return store.jobs.get(jobId);
}

export function completeJob(job: InternalJob) {
  const entry = mapJobToHistory(job);
  const store = getRevalidateStore();
  store.history = [entry, ...store.history.filter((run) => run.jobId !== entry.jobId)].slice(
    0,
    MAX_HISTORY
  );
  store.jobs.delete(job.jobId);
  return entry;
}

export function getHistory(): RevalidateHistoryItem[] {
  return getRevalidateStore().history;
}

export function updateJobProgress(job: InternalJob) {
  const totalDuration = STEP_SEQUENCE.reduce((total, item) => total + item.duration, 0) + 800;
  const elapsed = Date.now() - job.startedAt;
  const ratio = Math.min(1, elapsed / totalDuration);
  const progress = Math.round(ratio * 100);
  let accumulated = 0;
  let activeStep: JobStatus["step"] = "kickoff";

  for (const step of STEP_SEQUENCE) {
    accumulated += step.duration;
    if (elapsed <= accumulated) {
      activeStep = step.step;
      if (!job.logs.some((log) => log.includes(step.message))) {
        job.logs.push(`${timestamp()} ${step.message}`);
      }
      break;
    }
  }

  job.progress = progress;
  job.step = activeStep;

  const done = progress >= 100;
  if (done) {
    job.progress = 100;
    job.step = "done";
    job.status = "succeeded";
    job.durationMs = elapsed;
    if (!job.logs.some((log) => log.includes("Job complete"))) {
      job.logs.push(`${timestamp()} Job complete`);
    }
  }

  return {
    progress: job.progress,
    step: job.step,
    done,
    durationMs: job.durationMs,
    message: job.logs.at(-1),
  };
}

export function computeCacheHealth(history: RevalidateHistoryItem[]) {
  if (!history.length) {
    return { warmPages: 0, missRatio: 0, avgRebuildMs: 0 };
  }
  const totals = history.reduce(
    (acc, item) => {
      acc.warmPages += item.cacheSummary.warmPages;
      acc.missRatio += item.cacheSummary.missRatio;
      acc.avgRebuildMs += item.cacheSummary.avgRebuildMs;
      return acc;
    },
    { warmPages: 0, missRatio: 0, avgRebuildMs: 0 }
  );
  const count = history.length;
  return {
    warmPages: Math.round(totals.warmPages / count),
    missRatio: Number((totals.missRatio / count).toFixed(2)),
    avgRebuildMs: Math.round(totals.avgRebuildMs / count),
  };
}

export function seedHistory() {
  const now = Date.now();
  const entries: RevalidateHistoryItem[] = [
    createHistoryItem({
      jobId: "mock-job-1",
      env: "production",
      scope: "all",
      triggeredBy: "Deploy bot",
      startedAt: new Date(now - 42 * 60 * 1000).toISOString(),
      durationMs: 12 * 60 * 1000,
      status: "succeeded",
      statusMessage: "Completed with 0 misses",
      pagesTouched: 248,
      cacheSummary: { warmPages: 256, missRatio: 0.04, avgRebuildMs: 2100 },
      logs: [
        "09:12:11 Job queued",
        "09:12:17 Cache invalidated (125 tags)",
        "09:12:58 Rebuilt 248 pages",
        "09:15:09 Warmed 42 priority routes",
        "09:16:24 Job complete",
      ],
    }),
    createHistoryItem({
      jobId: "mock-job-2",
      env: "staging",
      scope: "routes",
      triggeredBy: "You",
      startedAt: new Date(now - 90 * 60 * 1000).toISOString(),
      durationMs: 7 * 60 * 1000,
      status: "succeeded",
      statusMessage: "Routes refreshed",
      pagesTouched: 32,
      cacheSummary: { warmPages: 128, missRatio: 0.08, avgRebuildMs: 1600 },
      logs: [
        "08:36:07 Job queued",
        "08:36:11 Invalidated 12 routes",
        "08:38:30 Warmed 8 primary routes",
        "08:43:41 Job complete",
      ],
    }),
    createHistoryItem({
      jobId: "mock-job-3",
      env: "production",
      scope: "media",
      triggeredBy: "CDN bot",
      startedAt: new Date(now - 210 * 60 * 1000).toISOString(),
      durationMs: 5 * 60 * 1000,
      status: "succeeded",
      statusMessage: "Media cache purged",
      pagesTouched: 0,
      cacheSummary: { warmPages: 240, missRatio: 0.03, avgRebuildMs: 1850 },
      logs: [
        "05:45:11 Job queued",
        "05:45:14 CDN purge request sent",
        "05:47:45 CDN purge complete",
        "05:50:01 Job complete",
      ],
    }),
    createHistoryItem({
      jobId: "mock-job-4",
      env: "staging",
      scope: "tags",
      triggeredBy: "QA bot",
      startedAt: new Date(now - 330 * 60 * 1000).toISOString(),
      durationMs: 6 * 60 * 1000,
      status: "failed",
      statusMessage: "Tag rebuild timeout",
      pagesTouched: 14,
      cacheSummary: { warmPages: 94, missRatio: 0.12, avgRebuildMs: 2100 },
      logs: [
        "03:12:02 Job queued",
        "03:12:05 Invalidated 6 tags",
        "03:16:41 Rebuild timed out",
      ],
    }),
    createHistoryItem({
      jobId: "mock-job-5",
      env: "production",
      scope: "routes",
      triggeredBy: "Deploy bot",
      startedAt: new Date(now - 480 * 60 * 1000).toISOString(),
      durationMs: 9 * 60 * 1000,
      status: "succeeded",
      statusMessage: "Routes optimized",
      pagesTouched: 120,
      cacheSummary: { warmPages: 248, missRatio: 0.05, avgRebuildMs: 1950 },
      logs: [
        "01:02:15 Job queued",
        "01:02:19 Invalidated 24 routes",
        "01:08:03 Warmed 18 hero pages",
        "01:11:22 Job complete",
      ],
    }),
    createHistoryItem({
      jobId: "mock-job-6",
      env: "staging",
      scope: "all",
      triggeredBy: "Nightly task",
      startedAt: new Date(now - 690 * 60 * 1000).toISOString(),
      durationMs: 10 * 60 * 1000,
      status: "succeeded",
      statusMessage: "Nightly rebuild",
      pagesTouched: 198,
      cacheSummary: { warmPages: 210, missRatio: 0.07, avgRebuildMs: 1750 },
      logs: [
        "22:45:09 Job queued",
        "22:45:15 Invalidated 150 entries",
        "22:47:01 Rebuilt 198 pages",
        "22:55:07 Warmed 36 priority routes",
        "22:56:10 Job complete",
      ],
    }),
  ];

  return entries.sort((a, b) => (a.startedAt > b.startedAt ? -1 : 1));
}

function createHistoryItem(
  item: Omit<RevalidateHistoryItem, "stepTimeline"> & { stepTimeline?: RevalidateHistoryItem["stepTimeline"] }
): RevalidateHistoryItem {
  const timeline =
    item.stepTimeline ??
    STEP_SEQUENCE.map((step) => ({
      step: step.step,
      label: capitalize(step.step),
      completed: item.status !== "failed" || step.step !== "warm",
      durationMs: step.duration,
    })).concat({ step: "done", label: "Done", completed: item.status === "succeeded", durationMs: 400 });

  return {
    ...item,
    stepTimeline: timeline,
  };
}

function mapJobToHistory(job: InternalJob): RevalidateHistoryItem {
  return {
    jobId: job.jobId,
    env: job.env,
    scope: job.scope,
    triggeredBy: job.triggeredBy,
    startedAt: new Date(job.startedAt).toISOString(),
    durationMs: job.durationMs ?? 0,
    status: job.status,
    statusMessage: job.message ?? (job.status === "failed" ? "Failed" : "Completed"),
    pagesTouched: job.pagesTouched,
    cacheSummary: {
      warmPages: 210 + Math.round(Math.random() * 50),
      missRatio: Number((0.05 + Math.random() * 0.03).toFixed(2)),
      avgRebuildMs: 1500 + Math.round(Math.random() * 600),
    },
    stepTimeline: STEP_SEQUENCE.map((step) => ({
      step: step.step,
      label: capitalize(step.step),
      completed: true,
      durationMs: step.duration,
    })).concat({ step: "done", label: "Done", completed: true, durationMs: 400 }),
    logs: job.logs,
  };
}

function timestamp() {
  return new Date().toLocaleTimeString();
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export type { InternalJob };