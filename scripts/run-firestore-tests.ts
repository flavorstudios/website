#!/usr/bin/env tsx
import { spawn } from "node:child_process";
import { platform } from "node:os";

const runner = platform() === "win32" ? "pnpm.cmd" : "pnpm";
const args = [
  "exec",
  "jest",
  "--selectProjects",
  "web",
  "--runInBand",
  "__tests__/firestore.rules.test.ts",
  "__tests__/admin-claims-cli.test.ts",
];

const child = spawn(runner, args, {
  stdio: "inherit",
  env: { ...process.env, FIRESTORE_RULES_REQUIRE_EMULATOR: "1" },
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});