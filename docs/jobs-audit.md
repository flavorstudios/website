# Background Jobs Audit

## Overview
This document summarizes how Flavor Studios currently handles long-running work, scheduled tasks, and realtime fan-out. The review covers code under `app/`, `functions/`, `lib/`, and `scripts/` together with Firebase/Vercel deployment notes.

## Job Type Matrix
| Job type | Needed? (reason) | Current status | Files detected | Gaps & risks | Proposed solution & cost notes |
| --- | --- | --- | --- | --- | --- |
| **Cron / time-based jobs** | **Yes** – content cache, sitemap/RSS generation, analytics rollups, and backups must run on a cadence for freshness and compliance. | **Partial** – Firebase Scheduled Functions call the Next API endpoints successfully, but backup secrets are undocumented and Cloud Scheduler timezone nuances are easy to misconfigure. | `functions/src/scheduler.ts`, `app/api/cron/revalidate/route.ts`, `app/api/cron/maintenance/route.ts`, `app/api/internal/*`, `lib/cron.ts`, `lib/cronAuth.ts`, `scripts/test-cron.ts`. | • `BACKUP_DIR`, `GOOGLE_APPLICATION_CREDENTIALS`, and `BACKUP_RETENTION` not surfaced in `.env.local.example`.<br>• Cloud Scheduler runs in UTC; existing cron strings assume IST without documentation.<br>• Failure alerts limited to Firestore writes – no external monitoring. | Document required env vars, add IST↔UTC cheat sheet, and keep current Firebase Scheduled Functions. Optional: add alerting via Firestore log watchers if needed. Incremental cost is negligible (Firebase Scheduler at low tier); backups depend on Cloud Storage usage. |
| **Event-driven jobs (Firestore/Storage triggers)** | No – admin flows already mutate Firestore directly and revalidate caches in-process. No downstream fan-out or heavy processing occurs on write. | Missing (intentionally) | N/A | Introducing triggers would duplicate existing synchronous logic and complicate local testing. | Revisit only if future workflows demand asynchronous fan-out (e.g., automated notifications). |
| **Queue-based / worker jobs** | No – workloads (revalidation, analytics rollup) are short-lived and already covered by scheduled HTTP hits; there is no bursty user-driven processing. | Missing (not required) | N/A | Setting up Redis/BullMQ or Cloud Tasks would add cost and operational overhead without clear benefit. | When/if heavy tasks appear, prefer Cloud Tasks with exponential backoff to stay serverless/pay-per-use. |
| **Scheduled cloud jobs (Cloud Scheduler / GitHub Actions)** | **Yes** – production still needs an external trigger (Cloud Scheduler or Vercel Cron) to invoke the Firebase scheduled runner, especially if Functions are disabled. Repo hygiene automation also depends on GitHub workflows. | Exists – GitHub workflow (`.github/workflows/search-engine-ping.yml`) handles repo automation; Firebase `onSchedule` functions provide runtime scheduling. | `.github/workflows/search-engine-ping.yml`, `functions/src/scheduler.ts`. | Cloud Scheduler timezone must be set to Asia/Kolkata manually; otherwise jobs run 5.5h off. No staging scheduler documented. | Keep Firebase `onSchedule` for runtime. Document `gcloud scheduler jobs create http` command (see below) so ops can recreate schedules quickly. |
| **Webhooks / API-triggered jobs** | No – no Stripe/YouTube/etc. integrations in the codebase. | Missing (not required) | N/A | None. | If partners are added later, follow the `/api/webhooks/<provider>` naming convention with signature verification and idempotency keys. |
| **Batch / maintenance tasks** | **Yes** – media refresh, cron log inspection, and Firestore exports require one-off scripts. | Exists – Node scripts under `scripts/` cover cron smoke tests, media refresh, LFS verification, etc. Backup endpoint exposes API-based export. | `scripts/test-cron.ts`, `scripts/query-cron-logs.ts`, `scripts/refresh-media-urls.ts`, `scripts/backfill-media-usage.ts`, `app/api/internal/backup/route.ts`. | Backup endpoint fails silently without env variables; scripts rely on developers remembering to set admin credentials. | Surface env vars in `.env.local.example`, add plan/test docs, and keep scripts idempotent. Costs are tied to manual execution only. |
| **Realtime / streaming jobs** | **Yes** – admin dashboard streams updates for blogs and notifications via SSE. | Exists – in-memory SSE broker and protected endpoints push updates. | `lib/sse-broker.ts`, `app/api/admin/blogs/stream/route.ts`, `app/api/admin/notifications/stream/route.ts`, `publishToUser` calls in admin APIs. | SSE broker is in-memory; restarting the process drops subscriptions (acceptable for current scope). | Keep lightweight SSE implementation; if horizontal scaling appears, upgrade to Redis/pub-sub fan-out. No extra cost today. |

## Architecture Sketch
```
┌──────────────────┐      cron (IST)       ┌─────────────────────┐
│ Cloud Scheduler  │ ───────────────────▶ │ Firebase Scheduler  │
│ (Asia/Kolkata)   │  HTTPS (Bearer)      │ Functions (Node 20) │
└──────────────────┘                      └─────────┬───────────┘
                                                   │ posts jobs
                                                   ▼
                                           ┌─────────────────────┐
                                           │ Next.js App Router  │
                                           │ /api/cron/* routes  │
                                           └─────────┬───────────┘
                                     writes logs     │ revalidate/feed
                                                   ▼
                                           ┌─────────────────────┐
                                           │ Firestore + Storage │
                                           └─────────┬───────────┘
                                   SSE updates      │ backup export
                                                   ▼
                                           ┌─────────────────────┐
                                           │ Admin Clients (SSE) │
                                           └─────────────────────┘
```

## Cloud Scheduler Reference (UTC vs IST)
*Asia/Kolkata is UTC+05:30. Firebase `onSchedule` accepts a `timeZone`, but direct Cloud Scheduler jobs expect cron strings in UTC.*

Example commands:

```bash
# Hourly cache revalidation (runs at HH:00 IST → HH-5:30 UTC)
gcloud scheduler jobs create http revalidate-cache \
  --schedule="0 * * * *" \
  --time-zone="Asia/Kolkata" \
  --uri="https://REGION-PROJECT.cloudfunctions.net/scheduledRevalidate" \
  --http-method=GET \
  --oidc-service-account-email="scheduler@PROJECT.iam.gserviceaccount.com"

# Nightly maintenance at 02:00 IST (20:30 UTC previous day)
gcloud scheduler jobs create http nightly-maintenance \
  --schedule="30 20 * * *" \
  --time-zone="UTC" \
  --uri="https://YOUR-HOST/api/cron/maintenance" \
  --http-method=POST \
  --headers="Authorization=Bearer $CRON_SECRET"
```

## Required Environment & Secrets
| Variable | Purpose | Notes |
| --- | --- | --- |
| `BASE_URL` | Public URL for the Next.js app so scheduled functions can callback. | Must include protocol. |
| `CRON_SECRET` | Shared bearer token between scheduler and API. | Keep identical in Firebase config & Next runtime. |
| `CRON_TIMEOUT_MS`, `CRON_MAX_ATTEMPTS` | Configure retries for `fetch` inside scheduled functions. | Optional. |
| `CRON_LOG_RETENTION_DAYS` | Firestore cron log retention window. | Used by cleanup task. |
| `BACKUP_DIR` | Writable directory for `POST /api/internal/backup`. | Required before running backups. |
| `GOOGLE_APPLICATION_CREDENTIALS` | Service account JSON path for privileged exports. | Must match IAM role with Storage read access. |
| `BACKUP_RETENTION` | How many historical backup snapshots to keep. | Defaults to 5 if unset. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Optional rate-limiter backend for cron auth. | Leave blank to use in-memory limiter. |

## Smoke Test References
* `pnpm test:jobs` – runs cron smoke tests (`scripts/test-cron.ts`).
* `pnpm cron:logs` – pulls latest Firestore cron log entries.
* Manual SSE check: `curl -N -H "Authorization: Bearer <session>" https://<host>/api/admin/blogs/stream`.

Documented gaps are resolved by updating `.env.local.example` and adding the setup/test plans below.