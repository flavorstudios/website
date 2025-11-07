"use client";

import type { PropsWithChildren } from "react";
import { MotionConfig } from "framer-motion";

import { isClientE2EEnabled } from "@/lib/e2e-utils";

export function E2EMotionProvider({ children }: PropsWithChildren): JSX.Element {
  const reduceMotion = isClientE2EEnabled();

  if (!reduceMotion) {
    return <>{children}</>;
  }

  return <MotionConfig reducedMotion="always">{children}</MotionConfig>;
}