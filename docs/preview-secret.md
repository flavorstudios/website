# Preview secret runbook

The `PREVIEW_SECRET` environment variable signs preview session tokens. Keep it
in sync across production deployments so admin preview links remain valid.

## Storage locations

- **Vercel environment variables**
  - `PREVIEW_SECRET` in the **Production** environment.
  - `PREVIEW_SECRET` in the **Preview** environment.
- **Local development**
  - Copy the value into `.env.local` (see `.env.local.example`).
- **Secrets manager**
  - Store the canonical value in 1Password → *Website / Preview secret* vault
    item so the team can rotate it without guessing.

## Rotation procedure

1. Generate a new 64-character hex string:
   ```bash
   openssl rand -hex 32
   ```
2. Update the 1Password entry noted above.
3. In Vercel, update the `PREVIEW_SECRET` variable for Production and Preview,
   then trigger a redeploy so the new value is bundled with serverless
   functions.
4. Update your local `.env.local`.
5. Verify the server sees the value by running `pnpm tsx scripts/validate-env.ts`
   locally or checking the deployment logs for a resolved
   `process.env.PREVIEW_SECRET` value.

## Operational notes

- `env/server-validation.ts` now requires `PREVIEW_SECRET`; builds fail if it is
  missing.
- Preview tokens fall back to a hard-coded `test-secret` only when explicitly
  running tests. Never rely on that default in production.
- Log redactions should ensure the secret value is not emitted verbatim in
  shared channels.