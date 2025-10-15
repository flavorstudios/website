"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, max = 100, ...props }, ref) => {
  const numericMax = typeof max === "number" && max > 0 ? max : 100;
  const numericValue = typeof value === "number" ? value : 0;
  const clampedValue = Math.min(Math.max(numericValue, 0), numericMax);
  const percentage = numericMax === 0 ? 0 : Math.round((clampedValue / numericMax) * 100);

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      value={clampedValue}
      max={numericMax}
      aria-valuemin={0}
      aria-valuenow={percentage}
      aria-valuemax={numericMax}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </ProgressPrimitive.Root>
  );
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
