import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function BlogCardSkeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      aria-label="Loading blog card"
      className={cn("flex flex-col gap-2 rounded-xl border border-border bg-card p-4", className)}
      {...props}
    >
      <div className="h-40 w-full animate-pulse rounded-xl bg-muted" />
      <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-muted" />
      <div className="mt-1 h-4 w-1/2 animate-pulse rounded bg-muted" />
    </div>
  );
}