import { clientEnv } from "@/env.client";

export function logClientError(
  ...args: Parameters<typeof console.error>
) {
  if (clientEnv.NODE_ENV !== "production") {
    console.error(...args);
  }
}