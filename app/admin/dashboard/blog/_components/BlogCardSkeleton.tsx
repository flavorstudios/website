import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type BlogCardSkeletonProps = Omit<HTMLAttributes<HTMLDivElement>, "data-testid">;

export function BlogCardSkeleton({ className, ...props }: BlogCardSkeletonProps) {
  return (
    <div
      data-testid="blog-card"
      role="presentation"
      aria-hidden="true"
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm",
        "animate-pulse",
        className,
      )}
      {...props}
    >
      <div className="h-40 w-full rounded-lg bg-muted" />
      <div className="h-4 w-3/4 rounded-md bg-muted" />
      <div className="h-3 w-1/2 rounded-md bg-muted" />
    </div>
  );
}