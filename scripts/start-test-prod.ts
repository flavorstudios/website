import { spawn } from "node:child_process";

const port = process.env.PORT ?? "3000";

const child = spawn("pnpm", ["next", "start", "-p", port], {
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV ?? "production",
    E2E: process.env.E2E ?? "true",
    NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED ?? "1",
    SKIP_STRICT_ENV: process.env.SKIP_STRICT_ENV ?? "1",
  },
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error("Failed to launch Next.js production server for E2E tests", error);
  process.exit(1);
});