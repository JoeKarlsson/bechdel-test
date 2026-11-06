# Architecture

```
  Full-stack app (repo root, local only)        Public site (site/, GitHub Pages)
  ─────────────────────────────────────        ─────────────────────────────────
  Upload a script                              data/films/*.json
    → parser: Bechdel score, scenes,  ──export──▶   → src/lib/films.mjs (build time)
      characters, dialogue                         → one static page per film
    → AI: scene review + analysis                  → bechdel.joekarlsson.com
    → MongoDB
```

## The public site (`site/`)

- **Astro**, static output, almost no client JavaScript: the home page's search, show and sort (`src/scripts/shelf.ts`), the old-link redirect (`src/scripts/legacy-redirect.ts`) and Plausible (`src/scripts/analytics.ts`).
- **Data:** `src/lib/films.mjs` reads `../data/films/*.json` once per build and returns what the pages need: the Bechdel score and rules, the bechdeltest.com and AI second opinions, cleaned speakers with gender from the cast list, a scene-by-scene timeline, and every AI section. Nothing from the raw export ships to the browser.
- **Pages:** `/` (the shelf), `/films/<title>-<year>/`, `/about/`, `/case-study/`, `/privacy/`, `404.html`, `sitemap.xml`.
- **Images:** posters and backdrops are downloaded once (`npm run images`) into `src/assets/films/` and served as AVIF/WebP; share cards are rendered by Playwright (`npm run og`) into `public/og/`.
- **Design:** dark only, hot pink on black, Anton and Fraunces (self-hosted), tokens in `src/styles/global.css`.
- **Tests:** `test/` (node:test: data layer and every built page), `e2e/` (Playwright on desktop, Pixel and iPhone: smoke, shelf, axe, layout), `lighthouserc.json`. All run in CI before a deploy.

## The full-stack app (repo root)

Express, MongoDB and the React upload UI under `src/`. It runs only on your machine through Docker Compose and is never deployed. `npm run export-data` writes its films to `data/films/`.

See [DEPLOYMENT.md](../DEPLOYMENT.md) for the workflow.
