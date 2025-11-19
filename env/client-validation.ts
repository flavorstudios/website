import { z } from 'zod';
import { isTestMode } from '@/config/flags';

const optionalNonEmptyString = z.preprocess(
  value => {
    if (typeof value !== 'string') {
      return value;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  },
  z.string().min(1).optional()
);

export const clientEnvSchema = z.object({
  NODE_ENV: optionalNonEmptyString,
  NEXT_PUBLIC_E2E: optionalNonEmptyString,
  NEXT_PUBLIC_BASE_URL: optionalNonEmptyString,
  NEXT_PUBLIC_API_BASE_URL: optionalNonEmptyString,
  NEXT_PUBLIC_GTM_CONTAINER_ID: optionalNonEmptyString,
  NEXT_PUBLIC_ENABLE_GTM_COOKIE_BANNER: optionalNonEmptyString,
  NEXT_PUBLIC_COOKIEYES_ID: optionalNonEmptyString,
  NEXT_PUBLIC_FIREBASE_API_KEY: optionalNonEmptyString,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: optionalNonEmptyString,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: optionalNonEmptyString,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: optionalNonEmptyString,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: optionalNonEmptyString,
  NEXT_PUBLIC_FIREBASE_APP_ID: optionalNonEmptyString,
  NEXT_PUBLIC_FIREBASE_VAPID_KEY: optionalNonEmptyString,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: optionalNonEmptyString,
  NEXT_PUBLIC_ADMIN_ROUTE_PREFIXES: optionalNonEmptyString,
  NEXT_PUBLIC_CUSTOM_ROLE_PERMISSIONS: optionalNonEmptyString,
  NEXT_PUBLIC_REQUIRE_ADMIN_EMAIL_VERIFICATION: optionalNonEmptyString,
  NEXT_PUBLIC_TEST_MODE: optionalNonEmptyString,
  TEST_MODE: optionalNonEmptyString,
});

const skipValidation =
  process.env.ADMIN_BYPASS === 'true' ||
  process.env.SKIP_ENV_VALIDATION === 'true';

const rawClientEnv = {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_E2E: process.env.NEXT_PUBLIC_E2E,
  NEXT_PUBLIC_GTM_CONTAINER_ID: process.env.NEXT_PUBLIC_GTM_CONTAINER_ID,
  NEXT_PUBLIC_ENABLE_GTM_COOKIE_BANNER:
    process.env.NEXT_PUBLIC_ENABLE_GTM_COOKIE_BANNER,
  NEXT_PUBLIC_COOKIEYES_ID: process.env.NEXT_PUBLIC_COOKIEYES_ID,
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_FIREBASE_VAPID_KEY:
    process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  NEXT_PUBLIC_ADMIN_ROUTE_PREFIXES:
    process.env.NEXT_PUBLIC_ADMIN_ROUTE_PREFIXES,
  NEXT_PUBLIC_CUSTOM_ROLE_PERMISSIONS:
    process.env.NEXT_PUBLIC_CUSTOM_ROLE_PERMISSIONS,
  NEXT_PUBLIC_REQUIRE_ADMIN_EMAIL_VERIFICATION:
    process.env.NEXT_PUBLIC_REQUIRE_ADMIN_EMAIL_VERIFICATION,
  NEXT_PUBLIC_TEST_MODE: process.env.NEXT_PUBLIC_TEST_MODE,
  TEST_MODE: undefined,
};

export type ClientEnvShape = z.infer<typeof clientEnvSchema>;

const defaults: ClientEnvShape = {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_BASE_URL: '',
  NEXT_PUBLIC_API_BASE_URL: undefined,
  NEXT_PUBLIC_E2E: undefined,
  NEXT_PUBLIC_GTM_CONTAINER_ID: undefined,
  NEXT_PUBLIC_ENABLE_GTM_COOKIE_BANNER: undefined,
  NEXT_PUBLIC_COOKIEYES_ID: undefined,
  NEXT_PUBLIC_FIREBASE_API_KEY: undefined,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: undefined,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: undefined,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: undefined,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: undefined,
  NEXT_PUBLIC_FIREBASE_APP_ID: undefined,
  NEXT_PUBLIC_FIREBASE_VAPID_KEY: undefined,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: undefined,
  NEXT_PUBLIC_ADMIN_ROUTE_PREFIXES: undefined,
  NEXT_PUBLIC_CUSTOM_ROLE_PERMISSIONS: undefined,
  NEXT_PUBLIC_REQUIRE_ADMIN_EMAIL_VERIFICATION: undefined,
  NEXT_PUBLIC_TEST_MODE: undefined,
  TEST_MODE: undefined,
};

const parsed = clientEnvSchema.safeParse(rawClientEnv);

const parsedData: ClientEnvShape = parsed.success ? parsed.data : {};
const baseClientValues: ClientEnvShape = {
  ...defaults,
  ...parsedData,
};

const isRawValueMissing = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  (typeof value === 'string' && value.length === 0);

const clientValues: ClientEnvShape = {
  ...baseClientValues,
  TEST_MODE: isTestMode() ? 'true' : 'false',
};

const requiredClientEnvVars: (keyof ClientEnvShape)[] = [];
const optionalClientEnvVars = (Object.keys(defaults) as (keyof ClientEnvShape)[]).filter(
  key => !requiredClientEnvVars.includes(key)
);

const missingRequiredEnvVars = requiredClientEnvVars.filter(key =>
  isRawValueMissing(clientValues[key])
);

const missingOptionalEnvVars = optionalClientEnvVars.filter(key =>
  isRawValueMissing(clientValues[key])
);

if (!skipValidation) {
  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();
    const message = Object.entries(fieldErrors)
      .map(([key, value]) => `${key}: ${value?.join(', ')}`)
      .join('\n');
    console.warn('Invalid client environment variables\n' + message);
  }

  if (missingRequiredEnvVars.length > 0) {
    console.error(
      `[env] Missing required client env var(s): ${missingRequiredEnvVars.join(', ')}`
    );
  } else if (missingOptionalEnvVars.length > 0) {
    console.warn(
      `[env] Missing optional client env var(s): ${missingOptionalEnvVars.join(', ')}`
    );
  }
}

export type ClientEnv = ClientEnvShape & {
  readonly hasRequiredEnvVars: boolean;
  readonly missingOptionalEnvVars: string[];
  readonly missingRequiredEnvVars: string[];
  readonly skipClientValidation: boolean;
  readonly isValueMissing: (key: keyof ClientEnvShape) => boolean;
};

export const clientEnv: ClientEnv = Object.freeze({
  ...clientValues,
  hasRequiredEnvVars: missingRequiredEnvVars.length === 0,
  missingOptionalEnvVars: missingOptionalEnvVars.map(String),
  missingRequiredEnvVars: missingRequiredEnvVars.map(String),
  skipClientValidation: skipValidation,
  isValueMissing: (key: keyof ClientEnvShape) => isRawValueMissing(clientValues[key]),
});