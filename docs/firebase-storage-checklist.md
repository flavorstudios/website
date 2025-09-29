# Firebase Storage Deployment Checklist

This checklist summarizes the steps required to validate the Media API can read
from Firebase Storage after changing environment variables or service account
permissions. Complete each item before verifying media refreshes in production.

## 1. Environment variables

1. Open the Vercel project **Settings → Environment Variables**.
2. Confirm both `FIREBASE_STORAGE_BUCKET` and `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   exist for the **same environment** (e.g. Production). The values must:
   - Match *exactly* (case-sensitive) and
   - Contain only the bare bucket name such as `my-project.appspot.com` without
     a `gs://` prefix.
3. If you update a value, redeploy after saving—the running build keeps the
   previous configuration until a new deployment completes.

## 2. Service account permissions

1. Locate the Firebase Admin SDK service account JSON that is bundled with the
   deployment (usually configured as the `GOOGLE_APPLICATION_CREDENTIALS`
   secret).
2. In the Google Cloud Console, open **IAM → Service Accounts → [account name]**.
3. Ensure the account has Storage permissions for the bucket. At minimum assign
   one of:
   - `roles/storage.objectViewer` for read-only access, or
   - `roles/storage.admin` for read/write management.
4. If permission changes are needed, apply them and wait for propagation (a few
   minutes is typical) before redeploying.

## 3. Redeploy and verify `/api/media/refresh`

1. Trigger a fresh deploy (or restart the Next.js server) so the app loads the
   updated environment variables and credentials.
2. After the deployment is active, open the admin Media tab and inspect the
   network request to `/api/media/refresh`. The response should complete with
   HTTP 200.
3. If the request fails:
   - Double-check the bucket name matches the Firebase project.
   - Confirm the service account JSON deployed with the app is the updated file
     and that the credentials are valid.
   - Review the server logs for additional context (for example authentication
     errors when initializing Firebase Admin).

Document the completed checklist in the deployment runbook so future incidents
can be triaged quickly.