import { z } from 'zod';

export const clientEnvSchema = z.object({
  NODE_ENV: z.string().optional(),
  NEXT_PUBLIC_BASE_URL: z.string().min(1),
  NEXT_PUBLIC_GTM_CONTAINER_ID: z.string().optional(),
  NEXT_PUBLIC_ENABLE_GTM_COOKIE_BANNER: z.string().optional(),
  NEXT_PUBLIC_COOKIEYES_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_VAPID_KEY: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_ADMIN_ROUTE_PREFIXES: z.string().optional(),
  NEXT_PUBLIC_CUSTOM_ROLE_PERMISSIONS: z.string().optional(),
  NEXT_PUBLIC_REQUIRE_ADMIN_EMAIL_VERIFICATION: z.string().optional(),
  TEST_MODE: z.string().optional(),
});

const skipValidation =
  process.env.ADMIN_BYPASS === 'true' ||
  process.env.SKIP_ENV_VALIDATION === 'true';

const _client: z.SafeParseReturnType<
  z.infer<typeof clientEnvSchema>,
  z.infer<typeof clientEnvSchema>
> = skipValidation
  ? {
      success: true as const,
      data: {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
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
        TEST_MODE: process.env.TEST_MODE,
      } as z.infer<typeof clientEnvSchema>,
    }
  : clientEnvSchema.safeParse({
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      NEXT_PUBLIC_GTM_CONTAINER_ID: process.env.NEXT_PUBLIC_GTM_CONTAINER_ID,
      NEXT_PUBLIC_ENABLE_GTM_COOKIE_BANNER: process.env.NEXT_PUBLIC_ENABLE_GTM_COOKIE_BANNER,
      NEXT_PUBLIC_COOKIEYES_ID: process.env.NEXT_PUBLIC_COOKIEYES_ID,
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      NEXT_PUBLIC_FIREBASE_VAPID_KEY: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
      NEXT_PUBLIC_ADMIN_ROUTE_PREFIXES: process.env.NEXT_PUBLIC_ADMIN_ROUTE_PREFIXES,
      NEXT_PUBLIC_CUSTOM_ROLE_PERMISSIONS: process.env.NEXT_PUBLIC_CUSTOM_ROLE_PERMISSIONS,
      NEXT_PUBLIC_REQUIRE_ADMIN_EMAIL_VERIFICATION:
        process.env.NEXT_PUBLIC_REQUIRE_ADMIN_EMAIL_VERIFICATION,
      TEST_MODE: process.env.TEST_MODE,
    });

if (!_client.success) {
  const { fieldErrors } = _client.error.flatten();
  const message = Object.entries(fieldErrors)
    .map(([key, value]) => `${key}: ${value?.join(', ')}`)
    .join('\n');
  throw new Error('Invalid client environment variables\n' + message);
}

export const clientEnv = _client.data;