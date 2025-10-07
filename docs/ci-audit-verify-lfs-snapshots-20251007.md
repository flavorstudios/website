# CI Audit – verify-lfs-snapshots permissions (2025-10-07)

## Summary
- **CI failure**: `scripts/verify-lfs-snapshots.sh` exited with 126 because the executable bit was missing when the workflow called it.
- **Impact**: GitHub Actions stopped before reaching the Playwright snapshot integrity check, so downstream jobs never executed.
- **Goal**: Preserve the restored permissions while preventing future regressions without rewriting the existing script.

## Findings
1. The script already declares a POSIX shebang and strict Bash mode, so the workflow only needs execute permission to run it.【F:scripts/verify-lfs-snapshots.sh†L1-L17】
2. Git retains the executable bit in the index, but the value can be dropped when developers commit from worktrees where `core.fileMode=false` (common on Windows or WSL).
3. CI does not currently verify that required helper scripts remain executable after pull requests land.

## Recommended remediations
1. **Pin file mode locally** – Ask contributors to run `git update-index --chmod=+x scripts/verify-lfs-snapshots.sh` (already done) and keep `core.fileMode=true` in local clones: `git config core.fileMode true`. This ensures commits capture the permission change even on case-insensitive filesystems.
2. **Add a guard script** – Run `scripts/check-ci-executables.sh` during CI setup to fail fast if any required helper loses the executable bit. The script simply checks `-x` on each expected executable while leaving the underlying helpers untouched.
3. **Document the workflow contract** – Mention in the contributor docs that CI helper scripts must stay executable so reviewers can spot permission regressions during PR review.

Implementing the guard plus lightweight documentation keeps the previous fix in place while stopping future permission regressions before they reach the workflow run.