import { pathToFileURL } from "node:url";

import {
  parseCliOptions,
  runValidation,
  type ValidationMode,
  type ValidationSummary,
} from "./validate-env-core";

    const isDirectExecution = (): boolean => {
  try {
    const scriptUrl = process.argv[1];
    if (!scriptUrl) {
      return false;
    }
  return import.meta.url === pathToFileURL(scriptUrl).href;
  } catch {
    return false;
  }
};

if (isDirectExecution()) {
  const cliOptions = parseCliOptions(process.argv.slice(2));
  const summary = await runValidation(cliOptions);

if (summary.shouldFail) {
    process.exitCode = 1;
    throw new Error("Environment validation failed.");
  }
}

export { parseCliOptions, runValidation };
export type { ValidationMode, ValidationSummary };
