# Media Storage Audit & Recovery Guide

The admin Media Library relies on Firebase Storage signed URLs. When an asset is
missing or its signed URL expires, images render as broken links (404) in the
admin and public site. Use this guide to audit the library and correct issues
without overwriting existing content.

## 1. Run the automated audit

1. Ensure the Firebase Admin service account JSON and Storage bucket variables
   are configured locally (or in the environment where you run the script).
2. Install dependencies and execute the audit:

   ```bash
   pnpm install
   pnpm tsx scripts/audit-media-storage.ts
   ```

3. The script checks every document in the `media` collection for:
   - Missing or unreachable URLs (HTTP 4xx/5xx or network failures)
   - Expired signed URLs (`urlExpiresAt` older than the current time)
   - Storage objects that no longer exist in the configured bucket
   - Bucket mismatches between stored URLs and your environment variables
   - Variant files with the same problems

4. Review the summary and per-file report printed to the console. No database or
   Storage changes are made—this script is read-only.

## 2. Fix common findings

| Issue code | Meaning | Resolution |
| --- | --- | --- |
| `missing_object` / `variant_missing_object` | Firestore doc references a file that is not present in the bucket. | Re-upload the original file via the Admin panel or restore it directly in Firebase Storage under `media/<id>/<filename>`. |
| `bucket_mismatch` | Document points to a different bucket than the app is configured to use. | Update `FIREBASE_STORAGE_BUCKET` and `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` so they match the bucket that actually contains the files, then redeploy. |
| `http_error` / `variant_http_error` | Signed URL responded with 4xx/5xx or could not be reached. | Confirm the Storage object exists and that IAM permissions allow read access. For 401/403 responses run `/api/media/refresh` or the refresh script below. |
| `expired_url` | `urlExpiresAt` has passed, so the signed URL is no longer valid. | Run `pnpm tsx scripts/refresh-media-urls.ts` or click “Refresh” in the Admin media details drawer. |
| `missing_storage_path` | Script could not derive a Storage path for the media item. | Verify the document includes `filename` (or update it) and ensure the URL uses the standard Firebase format. |

## 3. Refresh signed URLs after fixes

After restoring any missing files, refresh their URLs so the admin panel stops
serving expired links:

```bash
pnpm tsx scripts/refresh-media-urls.ts
```

Alternatively, open the asset in **Admin → Media → Details** and use the UI
refresh button. This preserves existing metadata and avoids re-uploading.

## 4. Double-check environment configuration

Broken URLs can also result from stale environment variables after deploying new
credentials. Confirm the following before completing the incident:

- `FIREBASE_STORAGE_BUCKET` and `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` are set to
the exact bucket name (e.g., `my-project.appspot.com`) without a `gs://`
prefix.
- The service account used by the deployment has at least
  `roles/storage.objectViewer` for the bucket.
- After updating secrets or roles, trigger a fresh deployment so Next.js reads
the new configuration.

Document any fixes in your runbook so future audits can be performed quickly.