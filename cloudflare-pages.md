# basmahaj.com on Cloudflare Pages

The domain is registered at Cloudflare (bought 2026-09-03) and its nameservers
are already Cloudflare's, so Pages can attach the domain and write the DNS
itself — nothing to copy by hand.

## Build settings (Cloudflare asks for these once)

| field | value |
| --- | --- |
| Framework preset | None |
| Build command | `cd app && npm ci && HF_STATIC=1 npx vite build` |
| (bun is not installed on Cloudflare's image by default; `app/package-lock.json` is committed, so npm ci works) | |
| Build output directory | `app/dist/client` |
| Root directory | `/` |
| Node version | 20 (env `NODE_VERSION=20`) |

`HF_STATIC=1` is what makes the build prerender the page instead of expecting a
server. `_headers` and `_redirects` in `app/public/` are copied into the output
and are read by Pages: a year of caching for the assets, none for the page, and
every unknown address served the site itself.

## Two ways in

**A — from this machine (I do the rest).** In a terminal:

    npx wrangler login

That opens the browser once. After it says success, I can create the project,
deploy, and attach basmahaj.com and www without touching the dashboard.

**B — from the dashboard (auto-deploy on every push, like Vercel).**
Workers & Pages → Create → Pages → Connect to Git → `Kareem1809/BHY` → the
settings above → Save and Deploy. Then Custom domains → add `basmahaj.com` and
`www.basmahaj.com`.

B keeps the habit we already have: push, and the site updates itself.
