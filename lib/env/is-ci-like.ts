import { isTestMode } from "@/config/flags";

const TRUTHY = new Set(["1", "true", "TRUE", "True"]);

const isTruthy = (value?: string | null): boolean => {
  if (value === undefined || value === null) return false;
  return TRUTHY.has(value);
};

export function isCiLike(): boolean {
  const env = process.env;
  return (
    isTruthy(env.CI) ||
    isTruthy(env.E2E) ||
    isTestMode() ||
    isTruthy(env.SKIP_STRICT_ENV) ||
    isTruthy(env.ADMIN_BYPASS) ||
    isTruthy(env.NEXT_PUBLIC_E2E)
  );
}