#!/usr/bin/env bash
# 1) Strip `--localstorage-file*` from inherited NODE_OPTIONS (Cursor / shell junk).
# 2) Force `--no-experimental-webstorage` so Node 25+ does not enable broken default web storage (removes warnings).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NEXT_BIN="$ROOT/node_modules/next/dist/bin/next"

clean="$(
  env -u NODE_OPTIONS python3 -c '
import shlex, sys
raw = sys.argv[1] if len(sys.argv) > 1 else ""
if not raw.strip():
    sys.exit(0)
try:
    parts = shlex.split(raw)
except ValueError:
    parts = raw.split()
out = [p for p in parts if not p.startswith("--localstorage-file")]
print(" ".join(out))
' "${NODE_OPTIONS-}"
)"

DISABLE="--no-experimental-webstorage"
if [[ "${clean}" == *"--no-experimental-webstorage"* || "${clean}" == *"--no-webstorage"* ]]; then
  merged="${clean}"
elif [[ -n "${clean}" ]]; then
  merged="${DISABLE} ${clean}"
else
  merged="${DISABLE}"
fi

exec env NODE_OPTIONS="${merged}" node "${NEXT_BIN}" "$@"
