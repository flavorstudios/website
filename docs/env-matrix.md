# Environment Variable Matrix

This table captures every environment variable referenced by runtime code. "Scope" indicates where the value is consumed. "CI/E2E" refers to the relaxed build that runs `pnpm e2e:build`.

## Base Platform

| Name | Scope | Required (Prod) | Required (CI/E2E) | Test Fallback | Notes |
| --- | --- | --- | --- | --- | --- |
| `BASE_URL` | Server | Yes | Generated | `http://127.0.0.1:3000` | Canonical site origin for metadata, RSS, and previews. |
| `NEXT_PUBLIC_BASE_URL` | Client | Yes | Generated | Inherits `BASE_URL` | Exported to client bundles for routing. |
| `CRON_SECRET` | Server | Yes | Generated | Random per build | Shared secret protecting cron endpoints. |
| `PREVIEW_SECRET` | Server | Yes | Generated | Random per build | Signs preview tokens; rotate when admins change. |
| `ADMIN_JWT_SECRET` | Server | Yes | Generated | Random per build | Signs password-based admin sessions. |
| `ADMIN_EMAILS` | Server | One of `ADMIN_EMAILS`/`ADMIN_EMAIL` | Generated | `admin@example.com` | Comma-separated admin allow list. |
| `ADMIN_EMAIL` | Server | One of `ADMIN_EMAILS`/`ADMIN_EMAIL` | Generated | `admin@example.com` | Single-address allow list (mutually exclusive with `ADMIN_EMAILS`). |
| `ADMIN_COOKIE_DOMAIN` | Server | Optional | Optional | `undefined` | Controls cookie domain for admin session. |
| `ADMIN_DOMAIN` | Server | Optional | Optional | `undefined` | Domain-wide allow-list support. |
| `ADMIN_REQUIRE_EMAIL_VERIFICATION` | Server/Client | Optional | Optional | `undefined` | Mirrors UI toggle for admin onboarding. |
| `ADMIN_DISPOSABLE_DOMAINS` | Server | Optional | Optional | `undefined` | Comma-separated disposable domains block list. |
| `ADMIN_AUTH_DISABLED` | Server | Optional | Optional | `undefined` | Allows disabling auth in test fixtures. |
| `ADMIN_BYPASS` | Server | Optional | Optional | `undefined` | Skips strict env validation when true. |
| `TEST_MODE` | Server/Client | Optional | Optional | `undefined` | Enables additional guard rails in tests. |
| `E2E` / `NEXT_PUBLIC_E2E` | Server/Client | Optional | Optional | `undefined` | Used to force relaxed preview behaviour for Playwright. |

## Firebase & Infrastructure

| Name | Scope | Required (Prod) | Required (CI/E2E) | Test Fallback | Notes |
| --- | --- | --- | --- | --- | --- |
| `FIREBASE_SERVICE_ACCOUNT_KEY` / `FIREBASE_SERVICE_ACCOUNT_JSON` | Server | One required | Generated | Synthetic service account JSON | Provide one of these (plain JSON). |
| `FIREBASE_SERVICE_ACCOUNT_JSON_B64` | Server | Optional | Optional | Derived from JSON | Alternate base64 input. |
| `FIREBASE_STORAGE_BUCKET` | Server | Yes | Generated | `demo-app.appspot.com` | Must equal public bucket. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Client | Yes | Generated | Mirrors server value | Required for client uploads. |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client | Optional (Prod recommended) | Optional | `undefined` | Client SDK config. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Client | Optional | Optional | `undefined` | Client SDK config. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Client | Optional | Optional | `undefined` | Client SDK config. |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Client | Optional | Optional | `undefined` | Client SDK config. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Client | Optional | Optional | `undefined` | Client SDK config. |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Client | Optional | Optional | `undefined` | Web push configuration. |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Client | Optional | Optional | `undefined` | Analytics (if enabled). |
| `GOOGLE_APPLICATION_CREDENTIALS` | Server | Optional | Optional | `/tmp/firebase-sa.json` in CI | File path for service account JSON (written in CI). |

## Admin Messaging & Email

| Name | Scope | Required (Prod) | Required (CI/E2E) | Test Fallback | Notes |
| --- | --- | --- | --- | --- | --- |
| `ADMIN_API_KEY` | Server | Optional | Optional | `undefined` | Programmatic admin API key. |
| `ADMIN_PASSWORD_HASH` | Server | Optional | Optional | `undefined` | Bcrypt hash for password-based admin login. |
| `ADMIN_SESSION_EXPIRY_DAYS` | Server | Optional | Optional | `undefined` | Overrides default 1 day expiry. |
| `ADMIN_TOTP_SECRET` | Server | Optional | Optional | `undefined` | Enables TOTP 2FA. |
| `CONTACT_REPLY_EMAILS` | Server | Optional | Optional | `undefined` | Allowed outbound addresses for replies. |
| `NOTIFY_NEW_SUBMISSION` | Server | Optional | Optional | `undefined` | Toggle notifications for new contact/career submissions. |
| `SMTP_HOST` | Server | Optional | Optional | `undefined` | SMTP server host. |
| `SMTP_PORT` | Server | Optional | Optional | `undefined` | SMTP port (defaults to 587 when unset). |
| `SMTP_SECURE` | Server | Optional | Optional | `undefined` | Set to "true" for SMTPS. |
| `SMTP_USER` | Server | Optional | Optional | `undefined` | Username for authenticated SMTP. |
| `SMTP_PASS` | Server | Optional | Optional | `undefined` | Password/app token for SMTP user. |
| `RSS_ADMIN_CONTACT` | Server | Optional | Optional | `undefined` | Contact email for RSS metadata. |
| `RSS_MANAGING_EDITOR` | Server | Optional | Optional | `undefined` | Managing editor email for RSS. |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Server | Optional | Optional | `undefined` | Web push configuration. |
| `VAPID_SUBJECT` | Server | Optional | Optional | `mailto:admin@flavorstudios.in` | Contact URI for push notifications. |

## Analytics, Integrations & Feature Flags

| Name | Scope | Required (Prod) | Required (CI/E2E) | Test Fallback | Notes |
| --- | --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_GTM_CONTAINER_ID` | Client | Optional | Optional | `undefined` | Google Tag Manager container ID. |
| `NEXT_PUBLIC_ENABLE_GTM_COOKIE_BANNER` | Client | Optional | Optional | `undefined` | Enables consent banner UX. |
| `NEXT_PUBLIC_COOKIEYES_ID` | Client | Optional | Optional | `undefined` | CookieYes widget integration. |
| `NEXT_PUBLIC_ADMIN_ROUTE_PREFIXES` | Client | Optional | Optional | `undefined` | Allows customizing protected route prefixes. |
| `NEXT_PUBLIC_CUSTOM_ROLE_PERMISSIONS` | Client | Optional | Optional | `undefined` | JSON mapping for custom roles. |
| `NEXT_PUBLIC_REQUIRE_ADMIN_EMAIL_VERIFICATION` | Client | Optional | Optional | `undefined` | Mirrors server flag for UI hints. |
| `NEXT_PUBLIC_TEST_MODE` | Client | Optional | Optional | Derived from `TEST_MODE` | Forces client into safe test mode. |
| `NEXT_PUBLIC_E2E` | Client | Optional | Optional | `undefined` | Signals the app to use E2E fallbacks. |
| `BING_API_KEY` | Server | Optional | Optional | `undefined` | Used by SEO indexing helpers. |
| `INDEXNOW_KEY` | Server | Optional | Optional | `undefined` | IndexNow integration key. |
| `PERSPECTIVE_API_KEY` | Server | Optional | Optional | `undefined` | Comment toxicity detection. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Server | Optional | Optional | `undefined` | Rate limiting API credentials. |
| `ANALYZE` | Server | Optional | Optional | `undefined` | Enables bundle analyzer when set to "true". |
| `DEBUG_ADMIN` | Server | Optional | Optional | `undefined` | Verbose logging for admin flows. |
| `NODE_ENV` | Both | Yes | Yes | `process.env.NODE_ENV` | Build/runtime mode indicator. |
| `CI` | Server | Optional | Optional | Provided by CI | Marks continuous integration runs. |
| `SKIP_STRICT_ENV` | Server | Optional | Optional | `'1'` in CI/E2E | Enables relaxed validation flow. |
| `USE_DEFAULT_ENV` | Server | Optional | Optional | `'1'` during `pnpm e2e:build` | Opts into generated defaults locally.

## Client runtime validation

All client-exposed keys (`NEXT_PUBLIC_*`, `NODE_ENV`, `TEST_MODE`) are validated in `env/client-validation.ts`. Missing optional values trigger warnings outside of CI. Setting `NEXT_PUBLIC_TEST_MODE=true` forces the UI into a non-destructive mode that avoids live writes.