export function isTruthyFlag(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1";
}

import { isTestMode } from "@/config/flags";

export function isTestLikeEnv(env: NodeJS.ProcessEnv = process.env): boolean {
  const explicitTestMode =
    env === process.env
      ? isTestMode()
      : env.NEXT_PUBLIC_TEST_MODE === "1";
  
  return (
    env.NODE_ENV === "test" ||
    isTruthyFlag(env.E2E) ||
    explicitTestMode ||
    isTruthyFlag(env.NEXT_PUBLIC_E2E)
  );
}