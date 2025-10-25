"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  RefreshCw,
  History,
  ShieldAlert,
  HelpCircle,
  Info,
  Loader2,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type {
  JobStatus,
  RevalidateEnvironment,
  RevalidateRequest,
  RevalidateResponse,
  RevalidateScope,
} from "@/types/revalidate";

interface RevalidateCardProps {
  env: RevalidateEnvironment;
  onEnvChange?: (env: RevalidateEnvironment) => void;
  onRunStart?: (details: { jobId: string; env: RevalidateEnvironment; scope: RevalidateScope }) => void;
  onRunComplete?: (details: {
    jobId: string;
    env: RevalidateEnvironment;
    scope: RevalidateScope;
    durationMs?: number;
  }) => void;
  onScheduleClick?: (details: {
    env: RevalidateEnvironment;
    scope: RevalidateScope;
    routes: string;
    tags: string;
    dryRun: boolean;
    purgeCdn: boolean;
    warm: boolean;
  }) => void;
  lastRunSummary?: string;
}

type PollContext = {
  jobId: string;
  env: RevalidateEnvironment;
  scope: RevalidateScope;
};

export default function RevalidateCard({
  env,
  onEnvChange,
  onRunStart,
  onRunComplete,
  onScheduleClick,
  lastRunSummary,
}: RevalidateCardProps) {
  const { toast } = useToast();
  const [scope, setScope] = useState<RevalidateScope>("all");
  const [routes, setRoutes] = useState("");
  const [tags, setTags] = useState("");
  const [dryRun, setDryRun] = useState(false);
  const [purgeCdn, setPurgeCdn] = useState(false);
  const [warm, setWarm] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<JobStatus["step"]>("kickoff");
  const [statusMessage, setStatusMessage] = useState<string | undefined>();
  const [helpOpen, setHelpOpen] = useState(false);

  const primaryButtonRef = useRef<HTMLButtonElement | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const wasConfirmOpen = useRef(false);

  const disabled =
    running ||
    (scope === "routes" && routes.trim() === "") ||
    (scope === "tags" && tags.trim() === "");

  useEffect(() => {
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!confirmOpen && wasConfirmOpen.current) {
      primaryButtonRef.current?.focus();
    }
    wasConfirmOpen.current = confirmOpen;
  }, [confirmOpen]);

  const summary = useMemo(() => {
    if (running) {
      return statusMessage ?? "Running";
    }
    return lastRunSummary ?? "Last run 14m ago by you";
  }, [lastRunSummary, running, statusMessage]);

  const scopeLabel = useMemo(() => {
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
  }, [scope]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.currentTarget !== event.target) return;
      if (event.key === "?" || (event.shiftKey && event.key === "/")) {
        event.preventDefault();
        setHelpOpen((open) => !open);
      }
      if ((event.key === "r" || event.key === "R") && !disabled) {
        event.preventDefault();
        setConfirmOpen(true);
      }
    },
    [disabled]
  );

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const resetForm = useCallback(() => {
    setRoutes("");
    setTags("");
    setCurrentStep("kickoff");
    setStatusMessage(undefined);
  }, []);

  const pollJobStatus = useCallback(
    async (context: PollContext) => {
      async function fetchStatus() {
        const response = await fetch(`/api/admin/revalidate/${context.jobId}`);
        if (!response.ok) {
          throw new Error("Unable to fetch job status");
        }
        const data = (await response.json()) as JobStatus;
        setProgress(data.progress);
        setCurrentStep(data.step);
        setStatusMessage(data.message);

        const isFailed = data.step === "failed";
        const isDone = data.progress >= 100 || data.step === "done";

        if (isDone || isFailed) {
          stopPolling();
          setRunning(false);
          onRunComplete?.({
            jobId: context.jobId,
            env: context.env,
            scope: context.scope,
            durationMs: data.durationMs,
          });

          if (isFailed) {
            toast.error(
              "Revalidation failed",
              {
                description: data.message ?? "Check logs in the history panel.",
              },
            );
          } else {
            toast.success("Revalidation complete", {
              description: `Environment: ${context.env} • Scope: ${scopeLabel}`,
            });
          }

          setTimeout(() => {
            setProgress(0);
            setStatusMessage(undefined);
          }, 1200);
          resetForm();
        }
      }

      try {
        await fetchStatus();
      } catch {
        stopPolling();
        setRunning(false);
        setProgress(0);
        toast.error("Polling failed", {
          description: "We lost the connection to the job status.",
        });
      }

      if (!pollRef.current) {
        pollRef.current = setInterval(async () => {
          try {
            await fetchStatus();
          } catch {
            stopPolling();
          }
        }, 1400);
      }
    },
    [onRunComplete, resetForm, scopeLabel, stopPolling, toast]
  );

  const onConfirm = useCallback(async () => {
    setConfirmOpen(false);
    setRunning(true);
    setProgress(6);
    setCurrentStep("kickoff");
    setStatusMessage("Job queued");

    const payload: RevalidateRequest = {
      env,
      scope,
      routes: scope === "routes" ? routes.split(",").map((route) => route.trim()).filter(Boolean) : undefined,
      tags: scope === "tags" ? tags.split(",").map((tag) => tag.trim()).filter(Boolean) : undefined,
      dryRun,
      purgeCdn,
      warm,
    };

    try {
      const response = await fetch("/api/admin/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = (await response.json()) as RevalidateResponse;
      const context: PollContext = { jobId: data.jobId, env, scope };
      onRunStart?.({ jobId: data.jobId, env, scope });
      await pollJobStatus(context);
    } catch {
      stopPolling();
      setRunning(false);
      setProgress(0);
      toast.error("Could not start revalidation", {
        description: "Please try again or check your connection.",
      });
    }
  }, [dryRun, env, onRunStart, pollJobStatus, purgeCdn, routes, scope, stopPolling, tags, toast, warm]);

  function handleScheduleClick() {
    onScheduleClick?.({
      env,
      scope,
      routes,
      tags,
      dryRun,
      purgeCdn,
      warm,
    });
  }

  const helpContentId = "revalidate-help";

  return (
    <Card
      ref={cardRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="border shadow-sm rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      aria-labelledby="revalidate-title"
      aria-describedby="revalidate-description"
    >
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle id="revalidate-title" className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Revalidate content
            </CardTitle>
            <CardDescription id="revalidate-description">
              Invalidate cache and rebuild pages after major content changes.
            </CardDescription>
          </div>
          <Popover open={helpOpen} onOpenChange={setHelpOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                aria-label="Open help"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              id={helpContentId}
              className="w-72 rounded-xl border bg-background shadow-lg"
              sideOffset={12}
            >
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Revalidation clears stale caches and rebuilds the affected pages. Use Production with caution—runs are
                  guarded and require confirmation.
                </p>
                <p>
                  Learn more in the
                  {" "}
                  <Link href="https://nextjs.org/docs/app/building-your-application/caching" className="text-primary underline">
                    caching guide
                  </Link>
                  .
                </p>
                <p className="text-xs text-muted-foreground/80">Tip: Press “R” to confirm faster.</p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="revalidate-env">Environment</Label>
            <Select value={env} onValueChange={(value) => onEnvChange?.(value as RevalidateEnvironment)}>
              <SelectTrigger id="revalidate-env">
                <SelectValue placeholder="Select environment" />
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

          <div className="space-y-2">
            <Label htmlFor="revalidate-scope">Scope</Label>
            <Select value={scope} onValueChange={(value) => setScope(value as RevalidateScope)}>
              <SelectTrigger id="revalidate-scope">
                <SelectValue placeholder="Select scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All content</SelectItem>
                <SelectItem value="routes">Selected routes</SelectItem>
                <SelectItem value="tags">Tags</SelectItem>
                <SelectItem value="media">Media cache</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {scope === "routes" && (
          <div className="space-y-2">
            <Label htmlFor="routes">Routes (comma separated)</Label>
            <Input
              id="routes"
              placeholder="/, /blog, /tags/nextjs"
              value={routes}
              onChange={(event) => setRoutes(event.target.value)}
            />
          </div>
        )}

        {scope === "tags" && (
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              placeholder="blog, homepage, featured"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
            />
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={dryRun} onCheckedChange={(value) => setDryRun(Boolean(value))} />
            Dry run
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={purgeCdn} onCheckedChange={(value) => setPurgeCdn(Boolean(value))} />
            Also purge CDN
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={warm} onCheckedChange={(value) => setWarm(Boolean(value))} />
            Warm critical pages
          </label>
        </div>

        {running && (
          <div className="space-y-2" aria-live="polite" role="status">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-2 capitalize">
                <Info className="h-4 w-4" /> {currentStep === "done" ? "Finishing" : currentStep}
              </span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
            {statusMessage ? <p className="text-xs text-muted-foreground">{statusMessage}</p> : null}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <History className="h-4 w-4" />
          {summary}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={handleScheduleClick} disabled={running}>
            <ShieldAlert className="h-4 w-4" />
            Schedule…
          </Button>
          <Button
            ref={primaryButtonRef}
            disabled={disabled}
            className={cn(
              "gap-2",
              env === "production" && "bg-orange-600 text-white hover:bg-orange-700",
              running && "cursor-wait opacity-90"
            )}
            onClick={() => setConfirmOpen(true)}
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {running ? "Running" : "Revalidate now"}
          </Button>
        </div>
      </CardFooter>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Run revalidation?</DialogTitle>
            <DialogDescription>
              {env === "production" ? "You are about to run this on Production." : "This will run on Staging."} Scope:
              {" "}
              {scopeLabel}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Dry run: {dryRun ? "Yes" : "No"}</p>
            <p>Purge CDN: {purgeCdn ? "Yes" : "No"}</p>
            <p>Warm critical pages: {warm ? "Yes" : "No"}</p>
            {scope === "routes" && routes ? <p>Routes: {routes}</p> : null}
            {scope === "tags" && tags ? <p>Tags: {tags}</p> : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onConfirm} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}