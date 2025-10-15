# Jobs Setup Plan

## Objectives
1. Keep existing cron-backed maintenance endpoints functioning in Firebase Hosting + Functions.
2. Document environment variables and scheduler configuration so deployments can be recreated quickly.
3. Provide repeatable smoke tests for cron flows and realtime SSE.

## Step-by-step Implementation
1. **Verify environment variables**
   - Copy `.env.example` to `.env.local` and fill `BASE_URL`, `CRON_SECRET`, `BACKUP_DIR`, `GOOGLE_APPLICATION_CREDENTIALS`, and optional tuning knobs (`CRON_MAX_ATTEMPTS`, `CRON_TIMEOUT_MS`, `BACKUP_RETENTION`).
   - For Firebase Functions, run `firebase functions:secrets:set CRON_SECRET` and `firebase functions:secrets:set BASE_URL` so scheduled functions have the same values.
2. **Deploy Firebase Scheduled Functions**
   - Run `cd functions && npm install && npm run build` if dependencies changed.
   - Deploy with `firebase deploy --only functions` (uses `functions/src/scheduler.ts` to register cron handlers).
3. **Create Cloud Scheduler (or Vercel Cron) triggers**
   - Preferred: `gcloud scheduler jobs create http` commands from the audit doc so Cloud Scheduler invokes the `scheduled*` functions in Asia/Kolkata.
   - Alternative on Vercel: configure Cron Jobs pointing to `/api/cron/maintenance` with `CRON_SECRET` header.
4. **Confirm Next.js API authentication**
   - Ensure `/app/api/cron/**` routes use `CRON_SECRET` for authorization (`lib/cronAuth.ts`).
   - If Upstash Redis is available, set `UPSTASH_REDIS_REST_URL` and `_TOKEN` for distributed rate limiting; otherwise defaults to in-memory guard.
5. **Backups**
   - Provision a writable bucket or disk path exposed as `BACKUP_DIR` to the Next.js runtime (Cloud Run or Functions hosting the app).
   - Grant the service account referenced by `GOOGLE_APPLICATION_CREDENTIALS` `roles/datastore.importExportAdmin` and `roles/storage.admin` so the backup route can export data.
6. **Realtime SSE**
   - No infrastructure changes required; ensure the hosting platform supports long-lived HTTP responses (Firebase Hosting + Cloud Run proxy does).
   - Document that SSE connections are in-memory; scale horizontally with sticky sessions or upgrade to a pub/sub broker when needed.
7. **Documentation & tooling**
   - Ship the audit, setup, and test plan docs along with `.env.example` updates and the new `pnpm test:jobs` script.

## Rollback Strategy
1. Revert `.env` updates and remove scheduler jobs with `gcloud scheduler jobs delete <name>` if the change misfires.
2. Roll back Firebase functions using `firebase deploy --only functions:<name>@previous` or redeploy the previous commit.
3. Delete or disable any new GitHub Actions or cron definitions if added in future iterations.

## Cost Estimates (Small Scale)
| Component | Assumption | Estimated cost |
| --- | --- | --- |
| Firebase Scheduled Functions | <1M invocations/month | Free tier / <$1 depending on runtime minutes. |
| Cloud Scheduler | 3–5 HTTP jobs | Free tier covers first three jobs, additional jobs ~$0.10/month each. |
| Firestore cronLog storage | 30-day retention with small payloads | <$0.05/month. |
| Backup exports | Depends on Firestore/Storage data volume | Pay-as-you-go; occasional usage likely <$1/run for small datasets. |