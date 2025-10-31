"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, CalendarPlus, Check, HelpCircle, Layers } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import type { RevalidateEnvironment, RevalidateScope } from "@/types/revalidate";
import { cn } from "@/lib/utils";

const CAN_SCHEDULE_PRODUCTION = false;

const recurrenceOptions = [
  { value: "one-off", label: "One-off" },
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "cron", label: "Custom CRON" },
] as const;

type Recurrence = (typeof recurrenceOptions)[number]["value"];

const cronPresets: Array<{ label: string; value: string; helper?: string }> = [
  { label: "Every hour", value: "0 * * * *" },
  { label: "Every day at 03:00", value: "0 3 * * *" },
  { label: "Weekdays at 07:30", value: "30 7 * * 1-5" },
  { label: "Sundays at midnight", value: "0 0 * * 0" },
];

export type ScheduleForm = {
  env: RevalidateEnvironment;
  scope: RevalidateScope;
  routes?: string;
  tags?: string;
  recurrence: Recurrence;
  cron?: string;
  startTime: string;
  endTime?: string;
  warmCritical: boolean;
  purgeCdn: boolean;
};

interface ScheduleDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEnv: RevalidateEnvironment;
  initialScope: RevalidateScope;
  initialRoutes?: string;
  initialTags?: string;
  onSave: (form: ScheduleForm) => void;
}

export default function ScheduleDrawer({
  open,
  onOpenChange,
  initialEnv,
  initialScope,
  initialRoutes,
  initialTags,
  onSave,
}: ScheduleDrawerProps) {
  const { toast } = useToast();
  const [env, setEnv] = useState<RevalidateEnvironment>(initialEnv);
  const [scope, setScope] = useState<RevalidateScope>(initialScope);
  const [routes, setRoutes] = useState(initialRoutes ?? "");
  const [tags, setTags] = useState(initialTags ?? "");
  const [recurrence, setRecurrence] = useState<Recurrence>("one-off");
  const [cron, setCron] = useState("0 * * * *");
  const [startTime, setStartTime] = useState(() => new Date().toISOString().slice(0, 16));
  const [endTime, setEndTime] = useState<string | undefined>();
  const [warmCritical, setWarmCritical] = useState(true);
  const [purgeCdn, setPurgeCdn] = useState(false);

  useEffect(() => {
    if (open) {
      setEnv(initialEnv);
      setScope(initialScope);
      setRoutes(initialRoutes ?? "");
      setTags(initialTags ?? "");
      setRecurrence("one-off");
      setCron("0 * * * *");
      setStartTime(new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16));
      setEndTime(undefined);
      setWarmCritical(true);
      setPurgeCdn(false);
    }
  }, [open, initialEnv, initialScope, initialRoutes, initialTags]);

  const scopeDescription = useMemo(() => {
    switch (scope) {
      case "routes":
        return "Target specific routes";
      case "tags":
        return "Refresh tagged content";
      case "media":
        return "Purge media cache";
      default:
        return "Revalidate everything";
    }
  }, [scope]);

  const disableCronInput = recurrence !== "cron";

  function handleClose() {
    onOpenChange(false);
  }

  function handleSave() {
    if (!startTime) {
      toast.error("Start time required", {
        description: "Please choose when the schedule should begin.",
      });
      return;
    }

    if (scope === "routes" && !routes.trim()) {
      toast.error("Add at least one route", {
        description: "Provide one or more routes separated by commas.",
      });
      return;
    }

    if (scope === "tags" && !tags.trim()) {
      toast.error("Add tags to target", {
        description: "Provide one or more tags separated by commas.",
      });
      return;
    }

    if (recurrence === "cron" && !cron.trim()) {
      toast.error("CRON expression required", {
        description: "Custom schedules need a CRON expression.",
      });
      return;
    }

    if (env === "production" && !CAN_SCHEDULE_PRODUCTION) {
      toast.error("Admin approval required", {
        description: "Only administrators can schedule production runs.",
      });
      return;
    }

    onSave({
      env,
      scope,
      routes: routes.trim() || undefined,
      tags: tags.trim() || undefined,
      recurrence,
      cron: recurrence === "cron" ? cron : undefined,
      startTime,
      endTime,
      warmCritical,
      purgeCdn,
    });

    toast.success("Schedule saved", {
      description: `Revalidation will run ${describeRecurrence(recurrence)} in ${env}.`,
    });

    handleClose();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-6 overflow-y-auto rounded-l-2xl border-l bg-background/95 backdrop-blur" side="right">
        <SheetHeader className="space-y-3 text-left">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <CalendarPlus className="h-5 w-5" /> Schedule revalidation
          </SheetTitle>
          <SheetDescription>
            Automate cache refreshes to keep environments aligned.
          </SheetDescription>
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-primary/30 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
            <HelpCircle className="h-4 w-4" aria-hidden />
            <span>
              {scopeDescription}. Adjust recurrence and scope carefully before saving.
            </span>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="schedule-env">Environment</Label>
              <Select value={env} onValueChange={(value) => setEnv(value as RevalidateEnvironment)}>
                <SelectTrigger id="schedule-env">
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">
                    <div className="flex items-center gap-2">
                      Production
                      <span className="rounded-full bg-orange-600/10 px-2 py-1 text-xs font-medium text-orange-600">
                        guarded
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule-scope">Scope</Label>
              <Select value={scope} onValueChange={(value) => setScope(value as RevalidateScope)}>
                <SelectTrigger id="schedule-scope">
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
              <Label htmlFor="schedule-routes">Routes</Label>
              <Input
                id="schedule-routes"
                placeholder="/docs, /pricing, /blog/*"
                value={routes}
                onChange={(event) => setRoutes(event.target.value)}
              />
            </div>
          )}

          {scope === "tags" && (
            <div className="space-y-2">
              <Label htmlFor="schedule-tags">Tags</Label>
              <Input
                id="schedule-tags"
                placeholder="marketing, hero, featured"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="schedule-recurrence">Recurrence</Label>
            <Select value={recurrence} onValueChange={(value) => setRecurrence(value as Recurrence)}>
              <SelectTrigger id="schedule-recurrence">
                <SelectValue placeholder="Select recurrence" />
              </SelectTrigger>
              <SelectContent>
                {recurrenceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="schedule-start">Start time</Label>
              <Input
                id="schedule-start"
                type="datetime-local"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule-end">End time (optional)</Label>
              <Input
                id="schedule-end"
                type="datetime-local"
                value={endTime ?? ""}
                onChange={(event) => setEndTime(event.target.value || undefined)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4" /> CRON helper
            </Label>
            <div className="flex flex-wrap gap-2">
              {cronPresets.map((preset) => (
                <Button
                  key={preset.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn("gap-2", recurrence === "cron" && cron === preset.value && "bg-primary/10")}
                  onClick={() => {
                    setRecurrence("cron");
                    setCron(preset.value);
                  }}
                >
                  <Check className={cn("h-4 w-4", cron === preset.value ? "opacity-100" : "opacity-0")} />
                  {preset.label}
                </Button>
              ))}
            </div>
            <Input
              id="schedule-cron"
              placeholder="0 2 * * *"
              value={cron}
              onChange={(event) => setCron(event.target.value)}
              disabled={disableCronInput}
            />
            <p className="text-xs text-muted-foreground">
              {disableCronInput ? "Select Custom CRON to edit." : "Use standard CRON syntax: min hour day month weekday."}
            </p>
          </div>

          <div className="space-y-3">
            <Label>Options</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={warmCritical} onCheckedChange={(value) => setWarmCritical(Boolean(value))} />
                Warm critical pages
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={purgeCdn} onCheckedChange={(value) => setPurgeCdn(Boolean(value))} />
                Also purge CDN
              </label>
            </div>
          </div>
        </div>

        <SheetFooter className="gap-3">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="button" className="gap-2" onClick={handleSave}>
            <Layers className="h-4 w-4" /> Save schedule
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function describeRecurrence(recurrence: Recurrence) {
  switch (recurrence) {
    case "hourly":
      return "hourly";
    case "daily":
      return "daily";
    case "weekly":
      return "weekly";
    case "cron":
      return "on the custom CRON";
    default:
      return "one time";
  }
}