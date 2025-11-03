export function isTruthyFlag(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1";
}

export function isTestLikeEnv(env: NodeJS.ProcessEnv = process.env): boolean {
  return (
    env.NODE_ENV === "test" ||
    isTruthyFlag(env.E2E) ||
    isTruthyFlag(env.TEST_MODE) ||
    isTruthyFlag(env.NEXT_PUBLIC_E2E)
  );
}