export type RevalidateEnvironment = "staging" | "production";
export type RevalidateScope = "all" | "routes" | "tags" | "media";
export type RevalidateStatus = "running" | "succeeded" | "failed";
export type JobStep = "kickoff" | "invalidate" | "rebuild" | "warm" | "done" | "failed";

export type RevalidateRequest = {
  env: RevalidateEnvironment;
  scope: RevalidateScope;
  routes?: string[];
  tags?: string[];
  dryRun?: boolean;
  purgeCdn?: boolean;
  warm?: boolean;
};

export type RevalidateResponse = {
  jobId: string;
};

export type JobStatus = {
  jobId: string;
  env: RevalidateEnvironment;
  startedAt: string;
  progress: number;
  step: JobStep;
  durationMs?: number;
  message?: string;
};

export interface RevalidateHistoryItem {
  jobId: string;
  env: RevalidateEnvironment;
  scope: RevalidateScope;
  triggeredBy: string;
  startedAt: string;
  durationMs: number;
  status: RevalidateStatus;
  statusMessage?: string;
  pagesTouched: number;
  cacheSummary: {
    warmPages: number;
    missRatio: number;
    avgRebuildMs: number;
  };
  stepTimeline: Array<{
    step: JobStep;
    label: string;
    completed: boolean;
    durationMs: number;
  }>;
  logs: string[];
}