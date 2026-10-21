#!/bin/sh
# Build the site and put it on Cloudflare Pages.
# The real steps (and the 404.html subtlety) live in tools/publish.mjs, which
# runs the same on macOS, Windows and Linux. This file stays as the old
# muscle-memory entry point.
set -e
cd "$(dirname "$0")/.."
exec node tools/publish.mjs "$@"
