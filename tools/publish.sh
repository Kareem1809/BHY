#!/bin/sh
# Build the site and put it on Cloudflare Pages.
#
# The one subtlety is 404.html. Pages serves it for every address that is not a
# real file, so it is the site's own page: an unknown URL shows the site (which
# renders its own not-found panel) and still answers 404, and a request for an
# asset that no longer exists — the signature of a browser holding a stale copy
# of the page — is answered 404 instead of being handed the page dressed up as
# a stylesheet. That silent swap is what once rendered the site as raw HTML.
set -e
cd "$(dirname "$0")/.."
(cd app && HF_STATIC=1 ./node_modules/.bin/vite build)
cp app/dist/client/index.html app/dist/client/404.html
npx wrangler pages deploy app/dist/client --project-name basmahaj --branch main --commit-dirty=true
