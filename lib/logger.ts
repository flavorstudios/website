import { serverEnv } from "@/env/server";

// Debug is enabled only in development or when DEBUG_ADMIN is explicitly set
export const debug =
  serverEnv.DEBUG_ADMIN === "true" || serverEnv.NODE_ENV === "development";

enum LogLevel {
  DEBUG = 10,
  INFO = 20,
  WARN = 30,
  ERROR = 40,
}

const currentLevel = debug ? LogLevel.DEBUG : LogLevel.WARN;

export const logger = {
  debug: (...args: unknown[]) => {
    if (currentLevel <= LogLevel.DEBUG) console.log(...args);
  },
  info: (...args: unknown[]) => {
    if (currentLevel <= LogLevel.INFO) console.info(...args);
  },
  warn: (...args: unknown[]) => {
    if (currentLevel <= LogLevel.WARN) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    // Errors are always logged
    console.error(...args);
  },
};