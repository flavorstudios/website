# Package Manager Lockfile Audit

## Summary of Findings
- The repository currently contains both `pnpm-lock.yaml` and `package-lock.json` at the root.
- A `pnpm-workspace.yaml` file and the project README instructions (`pnpm install`, `pnpm dev`, etc.) indicate that pnpm has been the primary package manager historically.
- Having multiple lockfiles causes tools (including VS Code) to warn about conflicting package manager preferences.

## Recommended Solutions

### Option A – Keep pnpm as the primary package manager (recommended)
1. Ensure team members continue using pnpm for install and script commands (`pnpm install`, `pnpm dev`, etc.).
2. Delete `package-lock.json` (created by npm) and commit the removal so only pnpm's lockfile remains.
3. (Optional) Add a `packageManager` field to `package.json` with the pnpm version in use (e.g. `"packageManager": "pnpm@8.15.5"`) to make editors aware of the expected tool and suppress future warnings.

### Option B – Switch to npm as the primary package manager
1. Decide on npm as the team standard.
2. Delete `pnpm-lock.yaml` and `pnpm-workspace.yaml` to prevent pnpm-specific configuration from lingering.
3. Update documentation (e.g. README) to replace pnpm commands with npm equivalents.
4. If workspace support is still required, consider adopting npm workspaces and updating configuration accordingly.

### Option C – Allow both package managers (not recommended)
- Keeping both lockfiles is technically possible but increases the risk of dependency drift and confusing tooling behavior.
- If absolutely necessary, clearly document when each tool should be used and ensure both lockfiles are updated simultaneously—this is difficult to maintain.

## Next Steps
- Choose one package manager for the project.
- Remove the lockfile(s) that do not match that choice.
- Update project documentation and tooling configuration to reflect the decision.