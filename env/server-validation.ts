import { z } from "zod";

import {
  clientEnvSchema,
  collectMissingForTarget,
  determineStage,
  envVarDefinitions,
  firebaseServiceAccountDefinitions,
  isValueMissing,
  serverEnvSchema,
  truthyFlags,
  type EnvMissingSummary,
  type EnvStage,
} from "./definitions";

const SERVER_TARGET = "server" as const;

const applyDynamicRuntimeDefaults = (): void => {
  const { NODE_ENV, VERCEL_ENV, VERCEL_URL } = process.env;

  if (NODE_ENV === "test") {
    return;
  }

  const resolveBaseUrl = (): string | undefined => {
    if (VERCEL_ENV === "preview" || VERCEL_ENV === "production") {
      return VERCEL_URL ? `https://${VERCEL_URL}` : undefined;
    }

    if (NODE_ENV === "development") {
      return "http://localhost:3000";
    }

    return undefined;
  };

  const publicBaseKey = "NEXT_PUBLIC_BASE_URL";
  const baseUrlKey = "BASE_URL";
  const currentPublicBase = process.env[publicBaseKey];
  const currentBase = process.env[baseUrlKey];

  if (isValueMissing(currentPublicBase)) {
    const resolved = resolveBaseUrl();
    if (resolved) {
      process.env[publicBaseKey] = resolved;
    }
  }

  if (isValueMissing(currentBase)) {
    const resolved = process.env[publicBaseKey] ?? resolveBaseUrl();
    if (resolved) {
      process.env[baseUrlKey] = resolved;
    }
  }
};

applyDynamicRuntimeDefaults();

const collectServerInput = (): Record<string, string | undefined> => {
  const entries: Array<[string, string | undefined]> = [];

  for (const definition of envVarDefinitions) {
    if (!definition.targets[SERVER_TARGET]) {
      continue;
    }

    entries.push([definition.name, process.env[definition.name]]);
  }

return Object.fromEntries(entries);
};

const serverEnvInput = collectServerInput();

const parsedServer = serverEnvSchema.safeParse(serverEnvInput);

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export const serverEnv: ServerEnv = parsedServer.success
  ? parsedServer.data
  : serverEnvSchema.parse(serverEnvInput);

export type ClientEnv = z.infer<typeof clientEnvSchema>;

export const currentStage: EnvStage = determineStage(process.env);

const missingForStage: EnvMissingSummary = collectMissingForTarget(
  SERVER_TARGET,
  currentStage,
  process.env,
);

const firebaseServiceAccountValues = firebaseServiceAccountDefinitions.map(definition => (
  serverEnv as Record<string, string | undefined>
)[definition.name]);

const hasServiceAccount = firebaseServiceAccountValues.some(value => !isValueMissing(value));

const requiresServiceAccount =
  currentStage === "preview" || currentStage === "production";

const appliedFallbackKeys = (process.env.__APPLIED_DEFAULT_ENV_KEYS ?? "")
  .split(",")
  .map(value => value.trim())
  .filter(Boolean);

const bucketMismatch =
  !isValueMissing(serverEnv.FIREBASE_STORAGE_BUCKET) &&
  !isValueMissing(serverEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) &&
  serverEnv.FIREBASE_STORAGE_BUCKET !== serverEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

const allowRelaxedDefaults =
  process.env.NODE_ENV === "test" ||
  truthyFlags.has(process.env.ALLOW_INSECURE_ENV ?? "");

export interface ServerEnvMeta {
  readonly stage: EnvStage;
  readonly missingRequiredEnvVars: string[];
  readonly missingOptionalEnvVars: string[];
  readonly bucketMismatch: boolean;
  readonly hasServiceAccount: boolean;
  readonly requiresServiceAccount: boolean;
  readonly appliedFallbackKeys: string[];
  readonly allowRelaxedDefaults: boolean;
}

export const serverEnvMeta: ServerEnvMeta = {
  stage: currentStage,
  missingRequiredEnvVars: missingForStage.missingRequired,
  missingOptionalEnvVars: missingForStage.missingOptional,
  bucketMismatch,
  hasServiceAccount,
  requiresServiceAccount,
  appliedFallbackKeys,
  allowRelaxedDefaults,
};