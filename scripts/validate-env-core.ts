import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { config } from "dotenv";

import { applyDefaultEnv } from "../env/defaults";
import {
  clientEnvSchema,
  envVarDefinitions,
  isValueMissing,
  serverEnvSchema,
  truthyFlags,
  type EnvStage,
  type EnvVarDefinition,
} from "../env/definitions";

type CliOptions = {
  readonly strict?: boolean;
};

export type ValidationMode = "strict" | "relaxed" | "bypass";

export interface ValidationSummary {
  readonly mode: ValidationMode;
  readonly stage: EnvStage;
  readonly strictRequested: boolean;
  readonly allowRelaxedDefaults: boolean;
  readonly bypassSources: string[];
  readonly missingRequired: string[];
  readonly missingOptional: string[];
  readonly fatalMessages: string[];
  readonly warningMessages: string[];
  readonly appliedFallbackKeys: string[];
  readonly shouldFail: boolean;
}

export const parseCliOptions = (argv: readonly string[]): CliOptions => {
  let strict: boolean | undefined;

  for (const arg of argv) {
    if (arg === "--no-strict" || arg === "--strict=false") {
      strict = false;
      continue;
    }

    if (arg === "--strict" || arg === "--strict=true") {
      strict = true;
    }
  }

  return { strict };
};

const formatAudience = (definition: EnvVarDefinition): string => {
  const audiences: string[] = [];

  if (definition.targets.server) {
    audiences.push("server");
  }

  if (definition.targets.client) {
    audiences.push("client");
  }

  return audiences.join(" + ");
};

const renderTable = (rows: string[][]): string => {
  if (rows.length === 0) {
    return "";
  }

  const columnWidths = rows[0]!.map((_, columnIndex) =>
    Math.max(...rows.map(row => row[columnIndex]!.length)),
  );

  const formatRow = (row: string[]) =>
    row
      .map((cell, index) => cell.padEnd(columnWidths[index]!))
      .join("  ");

  const [header, ...rest] = rows;
  const separator = columnWidths
    .map(width => "-".repeat(width))
    .join("  ");

  return [formatRow(header), separator, ...rest.map(formatRow)].join("\n");
};

const maybeLoadEnvFile = (file: string | undefined): void => {
  if (!file) return;

  const fullPath = resolve(process.cwd(), file);
  if (existsSync(fullPath)) {
    config({ path: fullPath });
  }
};

const collectBypassSources = (): string[] => {
  const sources: string[] = [];

  if (truthyFlags.has(process.env.SKIP_STRICT_ENV ?? "")) {
    sources.push("SKIP_STRICT_ENV");
  }

  if (truthyFlags.has(process.env.E2E ?? "")) {
    sources.push("E2E");
  }

  if (truthyFlags.has(process.env.SKIP_ENV_VALIDATION ?? "")) {
    sources.push("SKIP_ENV_VALIDATION");
  }

  return sources;
};

const BYPASS_MINIMAL_ENV = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

const toRow = (name: string, status: "required" | "optional", definition: EnvVarDefinition): string[] => {
  const requiredIn =
    definition.requiredIn.length > 0
      ? definition.requiredIn.join("/")
      : "optional";

  const statusLabel = status === "required" ? "required" : "optional (warn)";

  return [
    definition.name,
    formatAudience(definition),
    requiredIn,
    statusLabel,
    definition.description,
  ];
};

const buildTable = (
  names: Set<string>,
  status: "required" | "optional",
  definitions: Map<string, EnvVarDefinition>,
): string | undefined => {
  if (names.size === 0) {
    return undefined;
  }

  const rows: string[][] = [
    ["Name", "Audience", "Required In", "Status", "Description"],
    ...Array.from(names)
      .sort((a, b) => a.localeCompare(b))
      .map(name => {
        const definition = definitions.get(name);
        return definition ? toRow(name, status, definition) : [name, "-", "-", status, "Not defined in schema"];
      }),
  ];

  return renderTable(rows);
};

export const runValidation = async (cliOptions: CliOptions = {}): Promise<ValidationSummary> => {
  const preferProductionEnv =
    process.env.NODE_ENV === "production" ||
    process.env.CI === "true" ||
    process.env.CI === "1";

  maybeLoadEnvFile(preferProductionEnv ? ".env.production" : undefined);
  maybeLoadEnvFile(".env");
  maybeLoadEnvFile(".env.local");

  const appliedFallbackKeys = applyDefaultEnv();

  const allowDefaultsExplicitly = truthyFlags.has(process.env.USE_DEFAULT_ENV ?? "");
  const relaxedValidation =
    process.env.NODE_ENV === "test" || truthyFlags.has(process.env.ALLOW_INSECURE_ENV ?? "");

  const [{ serverEnv, serverEnvMeta }, { clientEnvMeta }] = await Promise.all([
    import("../env/server-validation"),
    import("../env/client-validation"),
  ]);

  const stage = serverEnvMeta.stage;
  const bypassSources = collectBypassSources();
  const stageDefaultStrict = stage === "preview" || stage === "production";
  const strictRequested = cliOptions.strict ?? stageDefaultStrict;
  const allowRelaxedDefaults = serverEnvMeta.allowRelaxedDefaults;
  const strictModeActive = strictRequested && !allowRelaxedDefaults;
  const mode: ValidationMode = bypassSources.length > 0 ? "bypass" : strictModeActive ? "strict" : "relaxed";
  const strictMode = mode === "strict";

  if (appliedFallbackKeys.length > 0) {
    if (mode === "strict" && !relaxedValidation && !allowDefaultsExplicitly) {
      throw new Error(
        `[env] Default fallback values are disabled. Missing required env vars: ${appliedFallbackKeys.join(", ")}`,
      );
    }

    console.warn(
      `[env] Using fallback values for missing env vars: ${appliedFallbackKeys.join(", ")}`,
    );
  }

  if (serverEnvMeta.appliedFallbackKeys.length > 0) {
    console.warn(
      `[env] Using generated fallback values for: ${serverEnvMeta.appliedFallbackKeys.join(", ")}`,
    );
  }

  if (mode === "bypass") {
    const reason = bypassSources.join(", ") || "unknown";
    console.warn(
      `[env] Validation bypassed (mode=bypass, source=${reason}). Running minimal checks only.`,
    );
  }

  const serverParse = serverEnvSchema.safeParse(process.env);
  const clientParse = clientEnvSchema.safeParse(process.env);

  const serverParseIssues = serverParse.success ? [] : serverParse.error.issues;
  const clientParseIssues = clientParse.success ? [] : clientParse.error.issues;

  const definitionByName = new Map(
    envVarDefinitions.map(definition => [definition.name, definition] as const),
  );

  const clientMissing = new Set(clientEnvMeta.missingRequiredEnvVars);
  const serverMissing = new Set(serverEnvMeta.missingRequiredEnvVars);
  const missingRequired = new Set<string>([
    ...clientMissing,
    ...serverMissing,
  ]);

  const optionalMissing = new Set<string>([
    ...serverEnvMeta.missingOptionalEnvVars,
    ...clientEnvMeta.missingOptionalEnvVars,
  ]);

  for (const name of missingRequired) {
    optionalMissing.delete(name);
  }

  const fatalMessages: string[] = [];
  const warningMessages: string[] = [];

  if (!serverParse.success) {
    fatalMessages.push("[env] Invalid server environment variables detected.");
  }

  if (!clientParse.success && !clientEnvMeta.skipClientValidation) {
    warningMessages.push("[env] Invalid client environment variables detected.");
  }

  if (serverEnvMeta.requiresServiceAccount && !serverEnvMeta.hasServiceAccount) {
    fatalMessages.push(
      "[env] Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_KEY for admin access.",
    );
    missingRequired.add("FIREBASE_SERVICE_ACCOUNT_JSON");
    missingRequired.add("FIREBASE_SERVICE_ACCOUNT_KEY");
    optionalMissing.delete("FIREBASE_SERVICE_ACCOUNT_JSON");
    optionalMissing.delete("FIREBASE_SERVICE_ACCOUNT_KEY");
  }

  if (serverEnvMeta.bucketMismatch) {
    fatalMessages.push(
      "[env] FIREBASE_STORAGE_BUCKET must match NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.",
    );
  }

  const json =
    serverEnv.FIREBASE_SERVICE_ACCOUNT_JSON ?? serverEnv.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (json) {
    try {
      JSON.parse(json);
    } catch (error) {
      fatalMessages.push(
        `FIREBASE_SERVICE_ACCOUNT_JSON/FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON: ${(
          error as Error
        ).message ?? "Unknown parse error"}`,
      );
    }
  }

  if (clientEnvMeta.skipClientValidation) {
    warningMessages.push("[env] Client env validation skipped (ADMIN_BYPASS/SKIP_ENV_VALIDATION).");
  }

  for (const issue of serverParseIssues) {
    fatalMessages.push(`[env] ${issue.path.join(".")} - ${issue.message}`);
  }

  for (const issue of clientParseIssues) {
    warningMessages.push(`[env] ${issue.path.join(".")} - ${issue.message}`);
  }

  if (mode === "bypass") {
    const missingRecommended = BYPASS_MINIMAL_ENV.filter(name =>
      isValueMissing(process.env[name]),
    );
    if (missingRecommended.length > 0) {
      warningMessages.push(
        `[env] Bypass mode: recommended env vars missing (${missingRecommended.join(", ")}). Firebase auth may fail at runtime.`,
      );
    }
  }

  for (const warning of warningMessages) {
    console.warn(warning);
  }

  const requiredTable = buildTable(missingRequired, "required", definitionByName);
  if (requiredTable) {
    console.error(
      `[env] Missing required environment variables (stage=${stage}, mode=${mode}).`,
    );
    console.error(requiredTable);
  }

  const optionalTable = buildTable(optionalMissing, "optional", definitionByName);
  if (optionalTable) {
    console.warn(
      `[env] Optional environment variables are unset (${optionalMissing.size} item(s)).`,
    );
    console.warn(optionalTable);
  }

  const shouldFailBuild =
    strictMode && (fatalMessages.length > 0 || missingRequired.size > 0);

  fatalMessages.forEach(message => console.error(message));

  return {
    mode,
    stage,
    strictRequested,
    allowRelaxedDefaults,
    bypassSources,
    missingRequired: Array.from(missingRequired),
    missingOptional: Array.from(optionalMissing),
    fatalMessages,
    warningMessages,
    appliedFallbackKeys,
    shouldFail: shouldFailBuild,
  };
};