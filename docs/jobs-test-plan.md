# Jobs Test Plan

## Local Smoke Tests
1. **API server** – run `pnpm dev` in one terminal so `/api/cron/*` routes are reachable.
2. **Cron smoke** – execute `pnpm test:jobs` to POST against every cron endpoint using the bearer token from `.env.local`.
3. **Firestore log check** – if Firebase emulators are configured, run `pnpm cron:logs` to inspect recent entries in the `cronLog` collection.
4. **Realtime SSE** – with an authenticated admin session, run:
   ```bash
   curl -N -H "Authorization: Bearer <cookie or token>" \
     http://localhost:3000/api/admin/blogs/stream
   ```
   Publish a blog draft in the UI or via `POST /api/admin/blogs` and confirm `event: posts` appears in the stream.
5. **Backup dry run** – set `BACKUP_DIR` to a temporary folder, export `GOOGLE_APPLICATION_CREDENTIALS`, then `curl -X POST http://localhost:3000/api/internal/backup -H "Authorization: Bearer $CRON_SECRET"` to verify artifacts are written.

## Staging Verification
1. Deploy the branch to staging (Firebase Hosting preview or Cloud Run revision).
2. Manually invoke `https://<staging-host>/api/cron/maintenance` with the staging `CRON_SECRET` header; ensure JSON response lists successful sub-jobs.
3. Inspect Firestore `cronLog` entries for staging project (expect `ok: true`).
4. Open the admin dashboard on staging with two browser windows; editing a blog post in one should live-update the other via SSE.

## Production Validation
1. Confirm Cloud Scheduler dashboard shows all jobs in `RUNNING` state with timezone Asia/Kolkata and the last run within expected window.
2. Spot-check `/api/cron/revalidate` logs in Firestore for the last 24 hours (no consecutive failures).
3. Ensure latest sitemap/RSS timestamps reflect cron execution times.
4. Review backup bucket or directory for a fresh artifact newer than 24 hours; verify retention count respects `BACKUP_RETENTION`.
5. Monitor Firebase function logs for `scheduledCronLogCleanup` warnings – none should appear after rollout.

## Troubleshooting Tips
- `401 Unauthorized`: mismatch between Cloud Scheduler secret and app `CRON_SECRET`.
- `429 Rate limit exceeded`: Upstash Redis limiter firing – raise limits or disable by removing Redis env vars.
- `fetch failed` in scheduler logs: ensure `BASE_URL` resolves publicly and functions have outbound internet.