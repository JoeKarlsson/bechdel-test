# Deployment

Everything lives on `main`. The public site (`site/`) is a static Astro build on GitHub Pages, https://bechdel.joekarlsson.com/, built from the film files in `data/films/`. Those files are written by `npm run analyze` at the repo root, which runs only on your machine. There is no server.

## Add a film and publish it

```bash
# 1. Analyze (needs OMDB, THEMOVIEDB and the LITELLM_* settings in .env, see .env.example)
npm run analyze -- scripts/<title>.txt     # or no arguments for every new script

# 2. In site/: render the share cards (posters come from TMDB's CDN, nothing to download)
cd site
npm run og

# 3. Build and test
npm run build && npm test && npm run e2e

# 4. Commit data/films and site/public/og, then push main
```

Pushing `main` runs the **Site** workflow (`.github/workflows/site.yml`): it audits dependencies, builds, runs the unit, build-output, Playwright (desktop, Pixel, iPhone) and Lighthouse checks, and deploys to GitHub Pages only if they all pass.

To redeploy without a change, run it by hand: `gh workflow run site.yml --ref main`.

## The site

```bash
cd site
npm install          # npm 12 (see packageManager in package.json)
npm run dev          # http://localhost:4321
npm run build        # dist/
npm test             # node:test: the data layer and every built page
npm run e2e          # Playwright; set CHROME to a Chromium binary if needed
npm run lighthouse   # Lighthouse CI, mobile, every category 90 or above
```

`site/src/lib/films.mjs` turns each raw export into what the pages show. Films whose script didn't parse, films without a poster, and films bechdeltest.com or the AI didn't rate all have their own handling there and on the film page.

### What GitHub Pages can't do

GitHub Pages can't set response headers. The Content-Security-Policy is a `<meta>` tag in `site/src/layouts/Base.astro`, which covers scripts, styles, images and connections but can't carry `frame-ancestors`, `report-uri` or `Permissions-Policy`. The site has no clickjacking protection beyond that; it needs a CDN or worker in front if that ever matters.

### Yearly

`site/public/.well-known/security.txt` expires on 6 November 2027. `npm test` fails 30 days before that: bump the `Expires` date.

## Rolling back the site

Revert the bad commit on `main` and push; the Site workflow rebuilds and redeploys the previous state.

DNS: `bechdel.joekarlsson.com` is a Cloudflare DNS-only CNAME to `joekarlsson.github.io`; the custom domain is set in the repo's Pages settings.
