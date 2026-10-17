#!/usr/bin/env bash
# Packs the working tree, server-renders it on React 16.8, 17, 18 and 19
# through both require() and import(), and checks the markup is byte-identical
# to a published baseline version.
#
# Usage: ssr-smoke.sh <scratch-dir> [baseline-version]
#   scratch-dir       empty-or-new directory outside the repo
#   baseline-version  published version to compare against (default: latest)
set -euo pipefail

repo="$(git rev-parse --show-toplevel)"
here="$(cd "$(dirname "$0")" && pwd)"
scratch="${1:?usage: ssr-smoke.sh <scratch-dir> [baseline-version]}"
baseline="${2:-$(npm view react-d3-cloud-modern dist-tags.latest)}"
mkdir -p "$scratch"
scratch="$(cd "$scratch" && pwd)"

(cd "$repo" && npm pack --silent --pack-destination "$scratch" >/dev/null)
tarball="$(ls -t "$scratch"/react-d3-cloud-modern-*.tgz | head -1)"

setup() { # <dir> <packages...>
  local dir="$scratch/$1"
  shift
  mkdir -p "$dir"
  cp "$here/render.cjs" "$dir/"
  (cd "$dir" && echo '{"name":"smoke","private":true}' >package.json &&
    npm install --no-audit --no-fund --loglevel=error "$@" jsdom@^26 canvas@^3 >/dev/null)
}

setup baseline react@19 react-dom@19 "react-d3-cloud-modern@$baseline"
(cd "$scratch/baseline" && node render.cjs cjs)

status=0
for v in 16.8.6 17 18 19; do
  setup "react-$v" "react@$v" "react-dom@$v" "$tarball"
  for mode in cjs esm; do
    if (cd "$scratch/react-$v" && node render.cjs "$mode") &&
      cmp -s "$scratch/react-$v/out-$mode.html" "$scratch/baseline/out-cjs.html"; then
      echo "  ok: identical to $baseline"
    else
      echo "  MISMATCH or failure: React $v $mode"
      status=1
    fi
  done
done
exit $status
