import { z } from "zod";

import {
  clientEnvSchema,
  collectMissingForTarget,
  determineStage,
  envVarDefinitions,
  isRequiredInStage,
  isValueMissing,
  type EnvStage,
} from "./definitions";

const CLIENT_TARGET = "client" as const;

const collectClientInput = (): Record<string, string | undefined> => {
  const entries: Array<[string, string | undefined]> = [];

  for (const definition of envVarDefinitions) {
    if (!definition.targets[CLIENT_TARGET]) {
      continue;
    }
    
    entries.push([definition.name, process.env[definition.name]]);
  }

return Object.fromEntries(entries);
};

const clientEnvInput = collectClientInput();

const parsedClient = clientEnvSchema.safeParse(clientEnvInput);

export type ClientEnvShape = z.infer<typeof clientEnvSchema>;

const baseClientValues: ClientEnvShape = parsedClient.success
  ? parsedClient.data
  : clientEnvSchema.parse(clientEnvInput);

const firebasePublicConfigKeys: Array<keyof ClientEnvShape> = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

const firebaseConfigMissing = firebasePublicConfigKeys.some(key =>
  isValueMissing(baseClientValues[key])
);

const hasExplicitPublicTestMode = baseClientValues.NEXT_PUBLIC_TEST_MODE !== undefined;

const derivedTestMode =
  (hasExplicitPublicTestMode
    ? baseClientValues.NEXT_PUBLIC_TEST_MODE === "true"
    : baseClientValues.TEST_MODE === "true") ||
  baseClientValues.NODE_ENV === "test" ||
  firebaseConfigMissing;

const resolvedTestModeValue = hasExplicitPublicTestMode
  ? baseClientValues.NEXT_PUBLIC_TEST_MODE
  : baseClientValues.TEST_MODE;

const clientValues: ClientEnvShape = {
  ...baseClientValues,
  TEST_MODE: derivedTestMode ? "true" : resolvedTestModeValue,
};

const skipValidation =
  process.env.ADMIN_BYPASS === "true" ||
  process.env.SKIP_ENV_VALIDATION === "true";

export interface ClientEnvMeta {
  readonly stage: EnvStage;
  readonly missingRequiredEnvVars: string[];
  readonly missingOptionalEnvVars: string[];
  readonly skipClientValidation: boolean;
}

export const currentClientStage: EnvStage = determineStage(process.env);

const missingForStage = collectMissingForTarget(CLIENT_TARGET, currentClientStage, process.env);

const requiredDefinitions = envVarDefinitions.filter(
  definition =>
    definition.targets[CLIENT_TARGET] && isRequiredInStage(definition, currentClientStage),
);

const missingRequiredEnvVars = requiredDefinitions
  .map(definition => definition.name)
  .filter(name => missingForStage.missingRequired.includes(name));

  const missingOptionalEnvVars = envVarDefinitions
  .filter(definition => definition.targets[CLIENT_TARGET])
  .map(definition => definition.name)
  .filter(name => missingForStage.missingOptional.includes(name));

export const clientEnvMeta: ClientEnvMeta = {
  stage: currentClientStage,
  missingRequiredEnvVars,
  missingOptionalEnvVars,
  skipClientValidation: skipValidation,
};

export type ClientEnv = ClientEnvShape & {
  readonly hasRequiredEnvVars: boolean;
  readonly missingOptionalEnvVars: string[];
  readonly missingRequiredEnvVars: string[];
  readonly skipClientValidation: boolean;
  readonly isValueMissing: (key: keyof ClientEnvShape) => boolean;
};

export const clientEnv: ClientEnv = Object.freeze({
  ...clientValues,
  hasRequiredEnvVars: clientEnvMeta.missingRequiredEnvVars.length === 0,
  missingOptionalEnvVars: clientEnvMeta.missingOptionalEnvVars.map(String),
  missingRequiredEnvVars: clientEnvMeta.missingRequiredEnvVars.map(String),
  skipClientValidation: skipValidation,
  isValueMissing: (key: keyof ClientEnvShape) => isValueMissing(clientValues[key]),
});