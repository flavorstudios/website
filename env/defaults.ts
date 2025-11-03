import { inspect } from "node:util";

type EnvRecord = Record<string, string>;

const FALLBACK_SERVICE_ACCOUNT = JSON.stringify(
  {
    type: "service_account",
    project_id: "demo-project",
    private_key_id: "fake-private-key-id",
    private_key:
      "-----BEGIN PRIVATE KEY-----\\nFAKE_PRIVATE_KEY\\n-----END PRIVATE KEY-----\\n",
    client_email: "demo@example.iam.gserviceaccount.com",
    client_id: "1234567890",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/demo%40example.iam.gserviceaccount.com",
  },
  null,
  0,
);

const FALLBACK_ENV: EnvRecord = {
  BASE_URL: "http://localhost:3000",
  NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
  CRON_SECRET: "test-cron-secret",
  PREVIEW_SECRET: "test-preview-secret",
  FIREBASE_STORAGE_BUCKET: "demo-app.appspot.com",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "demo-app.appspot.com",
  ADMIN_EMAILS: "admin@example.com",
  FIREBASE_SERVICE_ACCOUNT_KEY: FALLBACK_SERVICE_ACCOUNT,
};

const TRUTHY_VALUES = new Set(["1", "true", "TRUE", "True"]);

const isTruthy = (value: string | undefined): boolean =>
  value !== undefined && TRUTHY_VALUES.has(value.trim());

const isValueMissing = (value: string | undefined): boolean =>
  value === undefined || value.trim().length === 0;

const shouldApplyFallbacks = (): boolean =>
  process.env.NODE_ENV === "test" || isTruthy(process.env.USE_DEFAULT_ENV);

const APPLIED_KEYS_TOKEN = "__APPLIED_DEFAULT_ENV_KEYS";

export const applyDefaultEnv = (): string[] => {
  if (!shouldApplyFallbacks()) {
    return [];
  }

  const appliedKeys: string[] = [];

  for (const [key, fallbackValue] of Object.entries(FALLBACK_ENV)) {
    const currentValue = process.env[key];
    if (isValueMissing(currentValue)) {
      process.env[key] = fallbackValue;
      appliedKeys.push(key);
    }
  }

  if (appliedKeys.length > 0) {
    process.env[APPLIED_KEYS_TOKEN] = appliedKeys.join(",");

    if (isTruthy(process.env.DEBUG_ENV_FALLBACKS)) {
      console.warn(
        `[env] Applied fallback values: ${inspect(appliedKeys, { depth: 0 })}`,
      );
    }
  } else {
    delete process.env[APPLIED_KEYS_TOKEN];
  }

  return appliedKeys;
};