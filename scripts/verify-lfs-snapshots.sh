#!/usr/bin/env bash
set -euo pipefail

shopt -s nullglob
snapshot_files=(tests/**-snapshots/*.png)
shopt -u nullglob

if ((${#snapshot_files[@]} == 0)); then
  echo "No Playwright snapshot PNGs found; skipping LFS verification."
  exit 0
fi

if grep -RIl "version https://git-lfs.github.com/spec" "${snapshot_files[@]}" >/dev/null 2>&1; then
  echo "ERROR: Snapshot PNGs are still LFS pointers. Ensure git lfs pull ran." >&2
  exit 1
fi

echo "LFS snapshots look good."