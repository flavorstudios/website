"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { History } from "lucide-react";

import RevalidateCard from "./RevalidateCard";
import StatusPanel from "./StatusPanel";
import ScheduleDrawer, { type ScheduleForm } from "./ScheduleDrawer";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/page-header";
import { HeadingLevelBoundary } from "@/components/admin/heading-context";
import type { RevalidateEnvironment, RevalidateHistoryItem, RevalidateScope } from "@/types/revalidate";

const HEADER_ENV_ID = "system-tools-env";

export default function SystemToolsPage() {
  const [env, setEnv] = useState<RevalidateEnvironment>("production");
  const [history, setHistory] = useState<RevalidateHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const historyRef = useRef<RevalidateHistoryItem[]>([]);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleDefaults, setScheduleDefaults] = useState<{
    env: RevalidateEnvironment;
    scope: RevalidateScope;
    routes: string;
    tags: string;
    dryRun: boolean;
    purgeCdn: boolean;
    warm: boolean;
  }>({
    env: "production",
    scope: "all",
    routes: "",
    tags: "",
    dryRun: false,
    purgeCdn: false,
    warm: true,
  });
  const [activeJob, setActiveJob] = useState<{ jobId: string; env: RevalidateEnvironment; scope: RevalidateScope } | null>(
    null
  );
  const [savedSchedule, setSavedSchedule] = useState<ScheduleForm | null>(null);

  const refreshHistory = useCallback(async () => {
    const firstLoad = historyRef.current.length === 0;
    if (firstLoad) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    try {
      const response = await fetch("/api/admin/revalidate/history");
      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }
      const data = (await response.json()) as RevalidateHistoryItem[];
      setHistory(data);
      historyRef.current = data;
    } catch (error) {
      // keep stale data and surface minimal feedback via console for now
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshHistory();
    }, 20000);
    return () => clearInterval(interval);
  }, [refreshHistory]);

  const lastRun = history[0];

  const lastRunSummary = useMemo(() => {
    if (activeJob) {
      return `Running job ${activeJob.jobId.slice(0, 8)}…`;
    }
    if (!lastRun) {
      return "No previous runs";
    }
    return `Last run ${formatDistanceToNow(new Date(lastRun.startedAt), { addSuffix: true })} by ${lastRun.triggeredBy}`;
  }, [activeJob, lastRun]);

  const headerLastRun = useMemo(() => {
    if (!lastRun) {
      return "Awaiting first run";
    }
    const status = lastRun.status === "succeeded" ? "Healthy" : lastRun.status === "failed" ? "Needs review" : "Running";
    return `${formatDistanceToNow(new Date(lastRun.startedAt), { addSuffix: true })} • ${status}`;
  }, [lastRun]);

  const handleScheduleClick = useCallback(
    (details: {
      env: RevalidateEnvironment;
      scope: RevalidateScope;
      routes: string;
      tags: string;
      dryRun: boolean;
      purgeCdn: boolean;
      warm: boolean;
    }) => {
      setScheduleDefaults(details);
      setScheduleOpen(true);
    },
    []
  );

  const handleRunStart = useCallback(
    (details: { jobId: string; env: RevalidateEnvironment; scope: RevalidateScope }) => {
      setActiveJob(details);
    },
    []
  );

  const handleRunComplete = useCallback(
    (details: { jobId: string; env: RevalidateEnvironment; scope: RevalidateScope }) => {
      setActiveJob((current) => (current?.jobId === details.jobId ? null : current));
      refreshHistory();
    },
    [refreshHistory]
  );

  return (
    <div className="pb-12">
      <PageHeader
        level={1}
        title="System Tools"
        description="Access deployment and maintenance utilities."
        className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:backdrop-blur"
        containerClassName="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-6"
        headingClassName="text-2xl font-semibold tracking-tight text-foreground"
        descriptionClassName="text-sm text-muted-foreground"
        actions={
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex flex-col gap-1">
              <Label htmlFor={HEADER_ENV_ID} className="text-xs uppercase tracking-wide text-muted-foreground">
                Environment
              </Label>
              <Select value={env} onValueChange={(value) => setEnv(value as RevalidateEnvironment)}>
                <SelectTrigger id={HEADER_ENV_ID} className="h-10 w-full min-w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">
                    <div className="flex items-center gap-2">
                      Production <Badge variant="destructive">guarded</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
              <History className="h-4 w-4" />
              <span>{headerLastRun}</span>
            </div>
          </div>
        }
      />

      <HeadingLevelBoundary>
        <main className="mx-auto max-w-5xl px-4 pb-0 pt-6 lg:px-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`card-${env}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <RevalidateCard
                  env={env}
                  onEnvChange={setEnv}
                  onRunStart={handleRunStart}
                  onRunComplete={handleRunComplete}
                  onScheduleClick={handleScheduleClick}
                  lastRunSummary={lastRunSummary}
                />
                {savedSchedule ? (
                  <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4 text-xs text-muted-foreground">
                    <p>
                      Next scheduled run: {formatRecurrence(savedSchedule)} starting {" "}
                      {new Date(savedSchedule.startTime).toLocaleString()} on {" "}
                      <span className="font-medium">{savedSchedule.env}</span>.
                    </p>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              <StatusPanel history={history} loading={loading || refreshing} onRefresh={refreshHistory} />
            </motion.div>
          </div>
        </main>

        <ScheduleDrawer
          open={scheduleOpen}
          onOpenChange={setScheduleOpen}
          initialEnv={scheduleDefaults.env}
          initialScope={scheduleDefaults.scope}
          initialRoutes={scheduleDefaults.routes}
          initialTags={scheduleDefaults.tags}
          onSave={(form) => {
            setSavedSchedule(form);
          }}
        />
      </HeadingLevelBoundary>
    </div>
  );
}

function formatRecurrence(schedule: ScheduleForm) {
  switch (schedule.recurrence) {
    case "hourly":
      return "hourly";
    case "daily":
      return "daily";
    case "weekly":
      return "weekly";
    case "cron":
      return "custom CRON";
    default:
      return "one-off";
  }
}