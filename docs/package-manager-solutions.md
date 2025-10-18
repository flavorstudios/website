# Resolving the pnpm/npm Lockfile Conflict

This guide provides actionable steps to stop the VS Code warning—`"Using npm as the preferred package manager. Found multiple lockfiles"`—while keeping all existing project work intact. It assumes the team wants to continue using pnpm, which is already declared in `package.json` and supported by the repository layout.

## 1. Align local tooling with pnpm
1. Commit the repository's `.vscode/settings.json` file (added in this change) so that VS Code picks pnpm automatically. This mirrors the `"packageManager": "pnpm@9.12.3"` field in `package.json` and prevents the warning from reappearing for contributors who open the workspace in VS Code.
2. In individual setups that cannot use workspace settings (e.g., Codespaces), manually set **Settings > Features > NPM > Package Manager** to `pnpm`.

## 2. Remove the stray npm lockfile without losing work
1. Confirm your dependencies are intact by running `pnpm install --frozen-lockfile`. This uses the authoritative `pnpm-lock.yaml` file and does not modify source files.
2. Stage and commit the removal of `package-lock.json`. Because pnpm is already the canonical package manager, deleting this extra lockfile does not change dependency versions.
3. Push the commit so everyone shares the same lockfile state.

> **Why this is safe:** pnpm records the full dependency graph in `pnpm-lock.yaml`. Removing the unused npm lockfile only eliminates conflicting metadata; it does not delete any code.

## 3. (Optional) Guard against future npm lockfiles
- Add a pre-commit check (`scripts/check-lockfiles.mjs`) or CI step that fails if both `package-lock.json` and `pnpm-lock.yaml` are present. This prevents accidental reintroduction of the conflicting file.
- Educate contributors via the README (e.g., “Run `pnpm install` instead of `npm install`”).

Following the steps above resolves the warning, preserves the existing pnpm workflow, and ensures future contributors do not recreate the conflict.