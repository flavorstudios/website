/**
 * Next.js augments NodeJS.ProcessEnv such that well-known keys like
 * NODE_ENV are declared as readonly string literal unions. That is a
 * great guard rail for production code, but it makes direct mutation or
 * deletion of process.env properties inside tests awkward. This helper
 * centralizes the tiny amount of type-safe casting that is required to
 * temporarily override environment variables.
 */
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
type MutableProcessEnv = Mutable<NodeJS.ProcessEnv>;

const env = process.env as MutableProcessEnv;

export type EnvValue = string | undefined;
export type EnvOverrides = Record<string, EnvValue>;

export function setEnv(name: string, value: EnvValue): void {
  if (value === undefined) {
    delete env[name];
    return;
  }

  env[name] = value;
}

export function snapshotEnv(keys: Iterable<string>): EnvOverrides {
  const snapshot: EnvOverrides = {};
  for (const key of keys) {
    snapshot[key] = env[key];
  }
  return snapshot;
}

export function restoreEnv(snapshot: EnvOverrides): void {
  for (const [key, value] of Object.entries(snapshot)) {
    setEnv(key, value);
  }
}

export async function withEnv<T>(
  overrides: EnvOverrides,
  run: () => T | Promise<T>,
): Promise<T> {
  const previous: EnvOverrides = {};
  for (const [key, value] of Object.entries(overrides)) {
    previous[key] = env[key];
    setEnv(key, value);
  }

  try {
    return await run();
  } finally {
    restoreEnv(previous);
  }
}