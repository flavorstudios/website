import 'server-only';

/**
 * Server-only Firebase environment variables.
 * Values are read directly from `process.env` to ensure they are
 * excluded from client bundles.
 */
export const serverEnv: Record<string, string | undefined> & {
  ADMIN_AUTH_DISABLED: string | undefined;
  ADMIN_BYPASS: string | undefined;
  ADMIN_COOKIE_DOMAIN: string | undefined;
  ADMIN_DOMAIN: string | undefined;
  ADMIN_EMAIL: string | undefined;
  ADMIN_EMAILS: string | undefined;
  ADMIN_JWT_SECRET: string | undefined;
  ADMIN_PASSWORD_HASH: string | undefined;
  ADMIN_SESSION_EXPIRY_DAYS: string | undefined;
  ADMIN_TOTP_SECRET: string | undefined;
  ANALYZE: string | undefined;
  BASE_URL: string | undefined;
  BING_API_KEY: string | undefined;
  CONTACT_REPLY_EMAILS: string | undefined;
  DEBUG_ADMIN: string | undefined;
  FIREBASE_SERVICE_ACCOUNT_JSON: string | undefined;
  FIREBASE_SERVICE_ACCOUNT_KEY: string | undefined;
  FIREBASE_STORAGE_BUCKET: string | undefined;
  FUNCTIONS_EMULATOR: string | undefined;
  INDEXNOW_KEY: string | undefined;
  NEXT_PUBLIC_ADMIN_ROUTE_PREFIXES: string | undefined;
  NEXT_PUBLIC_BASE_URL: string | undefined;
  NEXT_PUBLIC_COOKIEYES_ID: string | undefined;
  NEXT_PUBLIC_FIREBASE_API_KEY: string | undefined;
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string | undefined;
  NEXT_PUBLIC_GTM_CONTAINER_ID: string | undefined;
  NODE_ENV: string | undefined;
  NOTIFY_NEW_SUBMISSION: string | undefined;
  PERSPECTIVE_API_KEY: string | undefined;
  RSS_ADMIN_CONTACT: string | undefined;
  RSS_MANAGING_EDITOR: string | undefined;
  SMTP_HOST: string | undefined;
  SMTP_PASS: string | undefined;
  SMTP_PORT: string | undefined;
  SMTP_SECURE: string | undefined;
  SMTP_USER: string | undefined;
  VAPID_PRIVATE_KEY: string | undefined;
  VAPID_PUBLIC_KEY: string | undefined;
} = {
  ADMIN_AUTH_DISABLED: process.env.ADMIN_AUTH_DISABLED,
  ADMIN_BYPASS: process.env.ADMIN_BYPASS,
  ADMIN_COOKIE_DOMAIN: process.env.ADMIN_COOKIE_DOMAIN,
  ADMIN_DOMAIN: process.env.ADMIN_DOMAIN,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_EMAILS: process.env.ADMIN_EMAILS,
  ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET,
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
  ADMIN_SESSION_EXPIRY_DAYS: process.env.ADMIN_SESSION_EXPIRY_DAYS,
  ADMIN_TOTP_SECRET: process.env.ADMIN_TOTP_SECRET,
  ANALYZE: process.env.ANALYZE,
  BASE_URL: process.env.BASE_URL,
  BING_API_KEY: process.env.BING_API_KEY,
  CONTACT_REPLY_EMAILS: process.env.CONTACT_REPLY_EMAILS,
  DEBUG_ADMIN: process.env.DEBUG_ADMIN,
  FIREBASE_SERVICE_ACCOUNT_JSON: process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
  FIREBASE_SERVICE_ACCOUNT_KEY: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
  FUNCTIONS_EMULATOR: process.env.FUNCTIONS_EMULATOR,
  INDEXNOW_KEY: process.env.INDEXNOW_KEY,
  NEXT_PUBLIC_ADMIN_ROUTE_PREFIXES: process.env.NEXT_PUBLIC_ADMIN_ROUTE_PREFIXES,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  NEXT_PUBLIC_COOKIEYES_ID: process.env.NEXT_PUBLIC_COOKIEYES_ID,
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_GTM_CONTAINER_ID: process.env.NEXT_PUBLIC_GTM_CONTAINER_ID,
  NODE_ENV: process.env.NODE_ENV,
  NOTIFY_NEW_SUBMISSION: process.env.NOTIFY_NEW_SUBMISSION,
  PERSPECTIVE_API_KEY: process.env.PERSPECTIVE_API_KEY,
  RSS_ADMIN_CONTACT: process.env.RSS_ADMIN_CONTACT,
  RSS_MANAGING_EDITOR: process.env.RSS_MANAGING_EDITOR,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_SECURE: process.env.SMTP_SECURE,
  SMTP_USER: process.env.SMTP_USER,
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
  VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
};

export type ServerEnv = typeof serverEnv;