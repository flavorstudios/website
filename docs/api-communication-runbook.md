# API Communication Runbook

## Overview
This runbook documents the guardrails introduced in this change set to stabilize
browser ↔ API traffic across marketing pages and the admin surface. It covers
CORS policy, canonical base URL discovery, cache control defaults, and tooling
for smoke testing.

## Canonical base URL resolution
All server handlers now derive their base origin through
`canonicalBaseUrl()`/`resolveRequestBaseUrl()`/`resolveHeadersBaseUrl()`.
The helpers normalize forwarded headers and read the following sources in
priority order:

1. `BASE_URL`
2. `NEXT_PUBLIC_BASE_URL`
3. `VERCEL_URL` (preview/production)
4. Development fallback `http://localhost:3000`

Set `CORS_ALLOWED_ORIGINS` (space or comma separated) to extend the allow-list
beyond the canonical origin. The helper automatically normalizes scheme and
host so `https://example.com/` and `https://example.com` are treated equally.

Admin session cookies are issued through `adminCookieOptions()` to guarantee
`HttpOnly`, `Secure`, `SameSite=Lax`, and environment-aware `domain`
attributes. Logout and refresh flows reuse the helper so cookie metadata stays
consistent when sessions rotate.

## CORS and preflight handling
Reusable helpers in `lib/api/cors.ts` attach:

- `Access-Control-Allow-Origin` with strict origin echoing
- `Access-Control-Allow-Credentials: true`
- Dynamic header/method mirroring for preflight requests
- `Access-Control-Expose-Headers: X-Request-ID`

Every `POST` route now implements an explicit `OPTIONS` export that delegates to
`handleOptionsRequest`, ensuring Vercel edge cache never answers preflight
requests with 404s.

### Preflight example
```bash
curl -i -X OPTIONS "https://<env-domain>/api/contact" \
  -H "Origin: https://app.example.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"
```

### Authenticated example
Use an existing admin session cookie to verify credentialled requests:
```bash
curl -i "https://<env-domain>/api/admin/settings" \
  -H "Cookie: admin-session=<JWT>" \
  -H "X-Request-ID: $(uuidgen)" \
  --compressed
```

## Cache control and request identifiers
`jsonResponse`/`textResponse` enforce `Cache-Control: no-store` by default,
attach a synthetic `X-Request-ID`, and echo negotiated CORS headers. Routes
that serve semi-static XML override `cacheControl` explicitly. Logs include the
request ID to make multi-service tracing possible.

## Smoke testing script
`scripts/smoke-api.ts` probes key public endpoints (blogs, videos, categories,
comments, contact, career, IndexNow) plus authenticated admin APIs
(`validate-session`, `settings`, `init`). It prints status, latency, expected
status codes, and JSON parse success while propagating a per-request
correlation ID. Run locally or in CI:

```bash
pnpm ts-node scripts/smoke-api.ts https://<env-domain> \
  --admin-cookie "admin-session=<JWT>"
```

The script accepts `--admin-cookie` (or `ADMIN_COOKIE`) to supply an existing
admin session when exercising protected routes. Endpoints that require
environment-specific secrets (e.g., `INDEXNOW_KEY`) are automatically skipped
when configuration is missing.

## Verification checklist
**Staging**
1. Deploy with `BASE_URL`, `NEXT_PUBLIC_BASE_URL`, and `CORS_ALLOWED_ORIGINS`
   set for the staging domain.
2. Run `pnpm ts-node scripts/smoke-api.ts https://staging-domain`.
3. Exercise the marketing contact form, career form, and blog comments from a
   different origin (e.g., Storybook) and confirm `200` responses with
   `Access-Control-Allow-Origin` reflecting the caller.
4. Inspect logs for `[contact:post]`/`[comments:submit]` entries containing
   `requestId` metadata.

5. Confirm admin authentication issues cookies with `HttpOnly`, `Secure`, and
   `SameSite=Lax` attributes matching the environment's domain.

**Production**
1. After rollout, run the smoke script against production.
2. Trigger a manual preflight (`curl -X OPTIONS`) from a permitted origin.
3. Verify admin workflows (login, password reset, session refresh) still
   succeed and cookies are issued with `HttpOnly`, `Secure`, and
   `SameSite=Lax`.
4. Confirm sitemap endpoints respond with valid XML and include
   `X-Request-ID` headers.

## Rollback plan
1. Revert the commit or cherry-pick `lib/api` removal if fast rollback is
   required (`git revert <commit>`). This restores legacy `NextResponse` usage.
2. Remove `CORS_ALLOWED_ORIGINS` from the environment to avoid orphaned config.
3. Re-deploy the previous build via Vercel/GitHub Actions.

## Incident response quick steps
1. Run the smoke script to pinpoint failing endpoints and collect request IDs.
2. Tail application logs filtered by the failing ID (`requestId=<value>`).
3. Check environment variables for mismatched origins (`BASE_URL` vs
   deployment URL).
4. Use the preflight curl snippet to validate CORS and header echoing.
5. If responses are cached unexpectedly, confirm the handler uses
   `jsonResponse`/`textResponse` and that upstream CDNs are bypassing the route.