#!/usr/bin/env bash
set -euo pipefail

required_execs=(
  "scripts/verify-lfs-snapshots.sh"
)

missing=0
for path in "${required_execs[@]}"; do
  if [[ ! -x "$path" ]]; then
    echo "ERROR: $path is not marked executable." >&2
    missing=1
  fi
done

if ((missing)); then
  exit 1
fi

echo "All required CI helper scripts are executable."