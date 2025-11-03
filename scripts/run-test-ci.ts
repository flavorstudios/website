import { spawnSync } from "node:child_process";

const forwardedArgs = process.argv.slice(2).filter(arg => arg !== "--run");

const result = spawnSync(
  "pnpm",
  ["exec", "jest", "--selectProjects", "web", "--runInBand", ...forwardedArgs],
  {
    stdio: "inherit",
    env: process.env,
  },
);

if (result.error) {
  throw result.error;
}

if (typeof result.status === "number") {
  process.exit(result.status);
}