# Blog & Media Audit Summary

## Scope
- Investigated missing blog posts in admin dashboard preview and public site.
- Investigated Firebase Storage uploads that only display in the uploader's browser.
- Reviewed admin SSR prefetch strategy.

## Key Findings
1. **Firestore dependency hard-fails admin listings**
   - `blogStore.getAll()` throws `ADMIN_DB_UNAVAILABLE` when Firebase Admin credentials are not loaded.
   - `app/api/admin/blogs/route.ts` converts that into a 500 response with an empty payload, leaving the dashboard with no posts and the preview route unable to locate documents.
2. **Public blog API falls back to seed content when Firestore is unreachable**
   - `/api/blogs` uses the same `blogStore.getAll()` call; on failure it returns static fallback posts so production never sees newly created entries.
3. **Signed Storage URLs expire without server refresh in non-admin surfaces**
   - Uploads fall back to signed URLs when `makePublic()` fails. These URLs expire after one hour.
   - Public renders rely on the stored URL string; without running through the API (which refreshes via `ensureFreshMediaUrl`), a cold visitor receives the expired token and the media appears broken.
4. **SSR dashboard prefetch can still double-hit APIs during development**
   - Guards exist, but React 19 double invokes still fire the stats/blog prefetch unless the global skip flag is respected across renders.

## Recommended Fixes
- Surface `ADMIN_DB_UNAVAILABLE` as a 503 in admin APIs so the UI can show a credential warning instead of silently empty states.
- Ensure production loads the Firebase service account (or provide an alternate data source) so `/api/blogs` returns real data.
- When uploads return a signed URL, call `refreshMediaUrl` during API responses and persist the refreshed value back to Firestore to prevent stale links.
- Keep SSR prefetch behind the existing guards and document the environment variables (`ADMIN_DISABLE_SSR_PREFETCH`, `E2E`, `TEST_MODE`) that disable it in CI.