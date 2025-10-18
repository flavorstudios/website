"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  Clock,
  Database,
  ExternalLink,
  History,
  Loader2,
  Sparkle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { RevalidateHistoryItem, RevalidateStatus } from "@/types/revalidate";

const statusLabels: Record<RevalidateStatus, string> = {
  succeeded: "Succeeded",
  running: "Running",
  failed: "Failed",
};

const dateFilters = [
  { label: "24 hours", value: "24h", hours: 24 },
  { label: "7 days", value: "7d", hours: 24 * 7 },
  { label: "30 days", value: "30d", hours: 24 * 30 },
  { label: "All", value: "all", hours: Infinity },
] as const;

type DateFilterValue = (typeof dateFilters)[number]["value"];

interface StatusPanelProps {
  history: RevalidateHistoryItem[];
  loading?: boolean;
  onRefresh?: () => Promise<void> | void;
}

export default function StatusPanel({ history, loading = false, onRefresh }: StatusPanelProps) {
  const [statusFilter, setStatusFilter] = useState<"all" | RevalidateStatus>("all");
  const [dateFilter, setDateFilter] = useState<DateFilterValue>("24h");
  const [selectedRun, setSelectedRun] = useState<RevalidateHistoryItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => (a.startedAt > b.startedAt ? -1 : 1)),
    [history]
  );

  const filteredHistory = useMemo(() => {
    const now = Date.now();
    const hoursLimit = dateFilters.find((option) => option.value === dateFilter)?.hours ?? Infinity;
    return sortedHistory.filter((run) => {
      const runTime = new Date(run.startedAt).getTime();
      const withinWindow = hoursLimit === Infinity || now - runTime <= hoursLimit * 60 * 60 * 1000;
      const matchesStatus = statusFilter === "all" || run.status === statusFilter;
      const matchesSearch = search
        ? [run.triggeredBy, run.scope, run.env, run.status].some((value) =>
            value.toLowerCase().includes(search.toLowerCase())
          )
        : true;
      return withinWindow && matchesStatus && matchesSearch;
    });
  }, [sortedHistory, dateFilter, statusFilter, search]);

  const lastRun = sortedHistory[0];

  const cacheHealth = useMemo(() => {
    if (!sortedHistory.length) {
      return { warmPages: 0, missRatio: 0, avgRebuildMs: 0 };
    }
    const totals = sortedHistory.reduce(
      (acc, item) => {
        acc.warmPages += item.cacheSummary.warmPages;
        acc.missRatio += item.cacheSummary.missRatio;
        acc.avgRebuildMs += item.cacheSummary.avgRebuildMs;
        return acc;
      },
      { warmPages: 0, missRatio: 0, avgRebuildMs: 0 }
    );
    const count = sortedHistory.length;
    return {
      warmPages: Math.round(totals.warmPages / count),
      missRatio: Number((totals.missRatio / count).toFixed(2)),
      avgRebuildMs: Math.round(totals.avgRebuildMs / count),
    };
  }, [sortedHistory]);

  useEffect(() => {
    if (selectedRun) {
      setDrawerOpen(true);
    }
  }, [selectedRun]);

  function handleRowOpen(run: RevalidateHistoryItem) {
    setSelectedRun(run);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setTimeout(() => setSelectedRun(null), 200);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border shadow-sm rounded-2xl">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="h-4 w-4" /> Last run
              </CardTitle>
              <CardDescription>Most recent cache revalidation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading && !lastRun ? (
                <SkeletonLines />
              ) : lastRun ? (
                <div className="space-y-2 text-sm">
                  <p className="flex items-center justify-between">
                    <span className="font-medium text-foreground">
                      {formatDistanceToNow(new Date(lastRun.startedAt), { addSuffix: true })}
                    </span>
                    <Badge variant="secondary" aria-label="Environment">
                      {lastRun.env}
                    </Badge>
                  </p>
                  <p className="text-muted-foreground">{lastRun.triggeredBy}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{prettyScope(lastRun.scope)}</span>
                    <span aria-hidden>•</span>
                    <span>{formatDuration(lastRun.durationMs)}</span>
                    <span aria-hidden>•</span>
                    <span>{lastRun.pagesTouched} pages</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No runs yet.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <Card className="border shadow-sm rounded-2xl">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4" /> Cache health
              </CardTitle>
              <CardDescription>Snapshot of current cache performance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {loading && !history.length ? (
                <SkeletonLines />
              ) : (
                <dl className="grid grid-cols-2 gap-3">
                  <Metric label="Warm pages" icon={Sparkle} value={cacheHealth.warmPages.toString()} suffix="primed" />
                  <Metric
                    label="Miss ratio"
                    icon={AlertCircle}
                    value={`${(cacheHealth.missRatio * 100).toFixed(1)}%`}
                    suffix="last 24h"
                  />
                  <Metric
                    label="Avg rebuild"
                    icon={Clock}
                    value={formatDuration(cacheHealth.avgRebuildMs)}
                    suffix="per page"
                  />
                  <Metric label="Records" icon={Database} value={history.length.toString()} suffix="tracked" />
                </dl>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="border shadow-sm rounded-2xl">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4" /> Recent runs
                </CardTitle>
                <CardDescription>Monitor previous executions and drill into details.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => onRefresh?.()}
                >
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
                  Refresh
                </Button>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-4 md:items-end">
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="succeeded">Succeeded</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Date range</Label>
                <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as DateFilterValue)}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dateFilters.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="run-search">Search</Label>
                <Input
                  id="run-search"
                  placeholder="Search by trigger, scope, environment"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="overflow-hidden px-0">
            <div className="max-h-[360px] overflow-y-auto">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Environment</th>
                    <th className="px-6 py-3">Scope</th>
                    <th className="px-6 py-3">Triggered by</th>
                    <th className="px-6 py-3">Duration</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3"><span className="sr-only">View</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-background">
                  {loading && !filteredHistory.length ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" aria-label="Loading" />
                      </td>
                    </tr>
                  ) : filteredHistory.length ? (
                    <AnimatePresence initial={false}>
                      {filteredHistory.map((run) => (
                        <motion.tr
                          key={run.jobId}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                          className="cursor-pointer focus-within:bg-muted/40 hover:bg-muted/30"
                          onClick={() => handleRowOpen(run)}
                          tabIndex={0}
                          role="button"
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              handleRowOpen(run);
                            }
                          }}
                        >
                          <td className="px-6 py-4 align-top">
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {new Date(run.startedAt).toLocaleString()}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(run.startedAt), { addSuffix: true })}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 capitalize align-top">{run.env}</td>
                          <td className="px-6 py-4 align-top">{prettyScope(run.scope)}</td>
                          <td className="px-6 py-4 align-top">{run.triggeredBy}</td>
                          <td className="px-6 py-4 align-top">{formatDuration(run.durationMs)}</td>
                          <td className="px-6 py-4 align-top">
                            <StatusBadge status={run.status} />
                          </td>
                          <td className="px-6 py-4 align-top text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="gap-1"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleRowOpen(run);
                              }}
                            >
                              View <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-sm text-muted-foreground">
                        No runs found for this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Sheet open={drawerOpen} onOpenChange={(open) => (open ? setDrawerOpen(true) : closeDrawer())}>
        <SheetContent className="flex w-full flex-col gap-6 overflow-y-auto rounded-l-2xl border-l bg-background/95 backdrop-blur" side="right">
          {selectedRun ? (
            <>
              <SheetHeader className="space-y-2 text-left">
                <SheetTitle className="flex items-center justify-between gap-2 text-lg">
                  <span className="flex items-center gap-2">
                    <History className="h-5 w-5" /> Run details
                  </span>
                  <StatusBadge status={selectedRun.status} />
                </SheetTitle>
                <SheetDescription>
                  {new Date(selectedRun.startedAt).toLocaleString()} • {selectedRun.triggeredBy}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                <section className="rounded-2xl border bg-card p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <CalendarDays className="h-4 w-4" /> Step timeline
                  </h3>
                  <ul className="space-y-3">
                    {selectedRun.stepTimeline.map((step) => (
                      <li key={step.step} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-xs font-semibold">
                          {step.completed ? <Sparkle className="h-3.5 w-3.5 text-primary" /> : <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
                        </span>
                        <div className="flex-1 space-y-1">
                          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                            {step.label}
                            <span className="text-xs text-muted-foreground">{formatDuration(step.durationMs)}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {step.completed ? "Completed" : "Pending"}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-2xl border bg-card p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <History className="h-4 w-4" /> Summary
                  </h3>
                  <dl className="grid gap-3 sm:grid-cols-2">
                    <SummaryItem label="Environment" value={selectedRun.env} />
                    <SummaryItem label="Scope" value={prettyScope(selectedRun.scope)} />
                    <SummaryItem label="Duration" value={formatDuration(selectedRun.durationMs)} />
                    <SummaryItem label="Pages touched" value={`${selectedRun.pagesTouched}`} />
                  </dl>
                </section>

                <section className="rounded-2xl border bg-card p-4">
                  <details className="group">
                    <summary className="flex cursor-pointer items-center justify-between gap-2 text-sm font-semibold text-foreground">
                      <span className="flex items-center gap-2">
                        <History className="h-4 w-4" /> Logs
                      </span>
                      <span className="text-xs text-muted-foreground group-open:hidden">Show</span>
                      <span className="text-xs text-muted-foreground hidden group-open:inline">Hide</span>
                    </summary>
                    <Separator className="my-3" />
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      {selectedRun.logs.map((log, index) => (
                        <li key={`${log}-${index}`} className="rounded-md bg-muted/50 px-3 py-2">
                          {log}
                        </li>
                      ))}
                    </ul>
                  </details>
                </section>
              </div>

              <SheetFooter className="justify-end">
                <Button type="button" variant="outline" onClick={closeDrawer}>
                  Close
                </Button>
              </SheetFooter>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Select a run to view details.
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SkeletonLines() {
  return (
    <div className="space-y-2">
      <div className="h-3 w-1/2 rounded-full bg-muted animate-pulse" />
      <div className="h-3 w-2/3 rounded-full bg-muted/80 animate-pulse" />
      <div className="h-3 w-1/3 rounded-full bg-muted/70 animate-pulse" />
    </div>
  );
}

function prettyScope(scope: RevalidateHistoryItem["scope"]) {
  switch (scope) {
    case "routes":
      return "Selected routes";
    case "tags":
      return "Tags";
    case "media":
      return "Media cache";
    default:
      return "All content";
  }
}

function formatDuration(durationMs?: number) {
  if (!durationMs) return "--";
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.round((durationMs % 60000) / 1000);
  if (minutes > 0) {
    return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  }
  return `${seconds}s`;
}

function Metric({
  label,
  value,
  suffix,
  icon: Icon,
}: {
  label: string;
  value: string;
  suffix?: string;
  icon: typeof Activity;
}) {
  return (
    <div className="rounded-xl border bg-background px-3 py-3 shadow-sm">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {label}
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
      {suffix ? <p className="text-xs text-muted-foreground">{suffix}</p> : null}
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: RevalidateStatus }) {
  const variant = status === "succeeded" ? "secondary" : status === "failed" ? "destructive" : "outline";
  const description = statusLabels[status];
  return (
    <Badge
      variant={variant}
      aria-label={description}
      className={cn(
        "capitalize",
        status === "running" && "border-primary/60 text-primary",
        status === "failed" && "border-destructive text-destructive"
      )}
    >
      {description}
    </Badge>
  );
}