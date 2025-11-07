"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";

import type { HeadingLevel } from "@/app/admin/dashboard/page-heading";

const HeadingLevelContext = createContext<HeadingLevel>(1);

function clampHeadingLevel(level: number): HeadingLevel {
  if (level < 1) return 1;
  if (level > 6) return 6;
  return level as HeadingLevel;
}

export function useHeadingLevel(): HeadingLevel {
  return useContext(HeadingLevelContext);
}

export function HeadingLevelBoundary({
  level,
  step = 1,
  children,
}: {
  level?: HeadingLevel;
  step?: number;
  children: ReactNode;
}) {
  const parentLevel = useHeadingLevel();
  const resolved = level ?? clampHeadingLevel(parentLevel + step);
  return (
    <HeadingLevelContext.Provider value={resolved}>
      {children}
    </HeadingLevelContext.Provider>
  );
}

export function HeadingLevelRoot({ children }: { children: ReactNode }) {
  return (
    <HeadingLevelContext.Provider value={1}>{children}</HeadingLevelContext.Provider>
  );
}