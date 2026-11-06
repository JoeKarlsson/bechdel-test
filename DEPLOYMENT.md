# Deployment

Everything lives on `develop`, in two parts:

| Part | Where | What it's for |
|------|-------|---------------|
| `site/` | GitHub Pages, https://bechdel.joekarlsson.com/ | The public site: a static Astro build of every analyzed film |
| The full-stack app (repo root) | Your machine, http://localhost:8080 | Adding films: upload a script, run the parser and the AI analysis, store it in MongoDB |

The site never talks to the app. The app exports its films to `data/films/<id>.json`, and the site builds from those files.

## Add a film and publish it

```bash
# 1. Start the app and MongoDB (needs CLAUDE_API_KEY in .env, see .env.example)
docker compose up -d --build
# Upload the script at http://localhost:8080

# 2. Export every film to data/films/
MONGODB_URI="mongodb://admin:password@localhost:27017/bechdelTest?authSource=admin" npm run export-data

# 3. In site/: download new posters and backdrops, and render the share cards
cd site
npm run images
npm run og

# 4. Build and test
npm run build && npm test && npm run e2e

# 5. Commit data/films, site/src/assets/films and site/public/og, then push develop
```

Pushing `develop` runs the **Site** workflow (`.github/workflows/site.yml`): it audits dependencies, builds, runs the unit, build-output, Playwright (desktop, Pixel, iPhone) and Lighthouse checks, and deploys to GitHub Pages only if they all pass.

Until the switch-over from the old `gh-pages` site, the deploy job runs only when started by hand:

```bash
gh workflow run site.yml --ref develop
```

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

## The full-stack app

```bash
docker compose up -d --build   # app on :8080, MongoDB on :27017
docker compose logs -f app
docker compose down            # data stays in the mongodb_data volume
```

## Rolling back the site

Revert the bad commit on `develop` and push; the Site workflow rebuilds and redeploys the previous state.

DNS: `bechdel.joekarlsson.com` is a Cloudflare DNS-only CNAME to `joekarlsson.github.io`; the custom domain is set in the repo's Pages settings.
