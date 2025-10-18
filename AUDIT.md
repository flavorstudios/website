# Executive Summary

1. **High – CI workflows do not activate the pinned pnpm toolchain**  
   - **Problem:** `ci.yml` installs pnpm 9.12.3 via `pnpm/action-setup` while the repo pins `pnpm@10.6.2`, and the workflow never enables Corepack. The `assert-pnpm-version` script therefore fails and earlier job attempts hit "pnpm not found" errors when the action was skipped. 【F:.github/workflows/ci.yml†L27-L55】【F:package.json†L143-L147】【F:.github/scripts/assert-pnpm-version.mjs†L5-L24】  
   - **Why it matters:** CI is red on every run, blocking merges and hiding other regressions. Using the wrong pnpm version also invalidates the lockfile guarantees.  
   - **Fix strategy:** Switch to Corepack (or upgrade the action) to activate `pnpm@10.6.2`, add a `cache-dependency-path`, and keep one source of truth for the pnpm version.  
   - **Risk:** Low—workflow-only change but must be validated on CI.

2. **High – E2E workflow repeats the pnpm toolchain drift**  
   - **Problem:** `e2e.yml` mirrors the same pnpm 9.12.3 setup, so Playwright smoke tests also run against the wrong package manager and fail the version assertion. 【F:.github/workflows/e2e.yml†L19-L55】【F:package.json†L143-L147】  
   - **Why it matters:** Dedicated E2E runs stay red and developers cannot trust pre-merge automation.  
   - **Fix strategy:** Apply the same Corepack-based pnpm activation to `e2e.yml` and align caches.  
   - **Risk:** Low.

3. **High – IndexNow API endpoint exposes the production API key to unauthenticated callers**  
   - **Problem:** `app/api/indexnow/route.ts` accepts arbitrary POSTs and forwards the server-side `INDEXNOW_KEY` to the external endpoint without any authentication or rate limiting. 【F:app/api/indexnow/route.ts†L1-L41】  
   - **Why it matters:** Attackers can exhaust IndexNow quotas, leak the key, or use the endpoint for SSRF.  
   - **Fix strategy:** Require a bearer secret (e.g., `CRON_SECRET`), add schema validation, and consider queuing submissions.  
   - **Risk:** Medium—tightening auth could break any undocumented clients.

4. **High – Client error logging endpoint lacks authentication and quotas**  
   - **Problem:** `app/api/log-client-error/route.ts` lets anyone POST arbitrary payloads that are logged verbatim. 【F:app/api/log-client-error/route.ts†L1-L17】  
   - **Why it matters:** An attacker can flood logs or store malicious strings.  
   - **Fix strategy:** Require an origin check or signed token, clamp payload sizes, and redact sensitive data before logging.  
   - **Risk:** Low—feature appears unused outside the web app.

5. **Medium – Server env loader skips validation under broad flags**  
   - **Problem:** Setting `ADMIN_BYPASS` or `SKIP_ENV_VALIDATION` bypasses all schema checks, yet these flags are reused for E2E and could leak into staging or prod. The loader also exposes many unvalidated secrets. 【F:env/server-validation.ts†L18-L122】  
   - **Why it matters:** Silent misconfiguration (e.g., missing `FIREBASE_*`) will only surface at runtime.  
   - **Fix strategy:** Narrow the bypass to explicit CI contexts, add validation for every exported env, and surface errors early.  
   - **Risk:** Medium—tightening validation may surface latent misconfigs.

6. **Medium – TypeScript compiler settings dilute safety**  
   - **Problem:** `tsconfig.json` enables `allowJs`, forces `moduleResolution: "node"`, and still skips library checking. 【F:tsconfig.json†L1-L33】  
   - **Why it matters:** Allowing JS files and skipping lib checks hides type regressions, and the custom module resolution diverges from Next.js defaults, risking path resolution bugs.  
   - **Fix strategy:** Disable `allowJs`, restore `moduleResolution: "bundler"`, and enable `skipLibCheck: false` (or gate via incremental rollout).  
   - **Risk:** Medium—may surface new type errors that require fixes.

7. **Medium – Mixed lockfiles undermine deterministic installs**  
   - **Problem:** `package-lock.json` ships alongside `pnpm-lock.yaml`, and `.npmrc` enforces pnpm, so the npm lock is stale and misleading. 【F:package-lock.json†L1-L7】【F:package.json†L130-L151】  
   - **Why it matters:** Contributors may install with npm or rely on the wrong lockfile, leading to dependency drift that CI cannot reproduce.  
   - **Fix strategy:** Remove `package-lock.json`, enforce pnpm via docs/CI, and add a lint check to block npm lockfiles.  
   - **Risk:** Low.

8. **Medium – Workflows double-cache pnpm stores without a dependency key**  
   - **Problem:** `ci.yml` uses both `actions/setup-node` caching and a manual `actions/cache` stanza. The manual cache keys off `pnpm-lock.yaml` but the setup-node cache does not set `cache-dependency-path`, so two caches fight. 【F:.github/workflows/ci.yml†L27-L64】  
   - **Why it matters:** Cache thrash slows builds and risks stale dependency reuse after lockfile bumps.  
   - **Fix strategy:** Keep a single cache strategy with explicit dependency paths.  
   - **Risk:** Low.

9. **Medium – IndexNow and contact routes lack structured error handling**  
   - **Problem:** Both routes return ad-hoc JSON and raw upstream error text, leaking implementation details. 【F:app/api/indexnow/route.ts†L1-L41】【F:app/api/contact/route.ts†L1-L101】  
   - **Why it matters:** Inconsistent errors complicate clients and can expose backend internals.  
   - **Fix strategy:** Introduce a shared JSON error schema with logging metadata.  
   - **Risk:** Low.

10. **Medium – Logging lacks redaction utilities**  
    - **Problem:** Several routes log entire request bodies and secrets (`contact`, `log-client-error`, cron handlers) without redaction or correlation IDs. 【F:app/api/contact/route.ts†L1-L101】【F:app/api/log-client-error/route.ts†L1-L17】【F:lib/cron.ts†L1-L59】  
    - **Why it matters:** PII may end up in structured logs, increasing breach impact and complicating incident response.  
    - **Fix strategy:** Add a logging helper that scrubs known secret keys and attaches request IDs.  
    - **Risk:** Low.

11. **Low – Next.js config still toggles minification via env flag**  
    - **Problem:** `next.config.mjs` disables minification based on `NEXT_DISABLE_MINIFY`, which can accidentally ship unminified bundles if left set. 【F:next.config.mjs†L34-L41】  
    - **Why it matters:** Larger bundles regress performance and reveal source.  
    - **Fix strategy:** Drop the flag or restrict to development builds.  
    - **Risk:** Low.

12. **Low – Client env loader only warns on schema failure**  
    - **Problem:** `env/client-validation.ts` logs warnings when validation fails but still exports partially empty config. 【F:env/client-validation.ts†L1-L126】  
    - **Why it matters:** Missing public config (e.g., Firebase) silently flips features into "test mode" and may surprise QA.  
    - **Fix strategy:** Throw on missing required keys outside explicit test contexts.  
    - **Risk:** Medium for rollout but long-term win.