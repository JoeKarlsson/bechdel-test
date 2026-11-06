# Architecture

```
  Analyzer (repo root, local only)              Public site (site/, GitHub Pages)
  ────────────────────────────────              ─────────────────────────────────
  npm run analyze scripts/*.txt                 data/films/*.json
    → OMDB: title, year, plot                     → src/lib/films.mjs (build time)
    → TMDB: cast with genders, images   ──writes──▶ → one static page per film
    → parser: Bechdel score, scenes, dialogue     → bechdel.joekarlsson.com
    → AI: scene review + analysis (optional)
```

## The public site (`site/`)

- **Astro**, static output, almost no client JavaScript: the home page's search, show and sort (`src/scripts/shelf.ts`), the old-link redirect (`src/scripts/legacy-redirect.ts`) and Plausible (`src/scripts/analytics.ts`).
- **Data:** `src/lib/films.mjs` reads `../data/films/*.json` once per build and returns what the pages need: the Bechdel score and rules, the bechdeltest.com and AI second opinions, cleaned speakers with gender from the cast list, a scene-by-scene timeline, and every AI section. Nothing from the raw export ships to the browser.
- **Pages:** `/` (the shelf), `/films/<title>-<year>/`, `/about/`, `/case-study/`, `/privacy/`, `404.html`, `sitemap.xml`.
- **Images:** posters and backdrops are downloaded once (`npm run images`) into `src/assets/films/` and served as AVIF/WebP; share cards are rendered by Playwright (`npm run og`) into `public/og/`.
- **Design:** dark only, hot pink on black, Anton and Fraunces (self-hosted), tokens in `src/styles/global.css`.
- **Tests:** `test/` (node:test: data layer and every built page), `e2e/` (Playwright on desktop, Pixel and iPhone: smoke, shelf, axe, layout), `lighthouserc.json`. All run in CI before a deploy.

## The analyzer (repo root)

`scripts/analyze.js` is the command line; the pipeline is in `src/`:

- `fetchMetadata.js`: OMDB lookup by the script's file name (a trailing year pins the match), then TMDB credits and images. Responses are cached in `.cache/http/`.
- `analyzeFilm.js`: runs the parser on the script text and builds the film record in the shape `site/src/lib/films.mjs` reads. A redone film keeps its id, upload date and stored readers' score.
- `bechdel/`: scene splitting, dialogue counting and the Bechdel score. `scriptCleaner.js`: per-character dialogue and key scenes for the site's charts.
- `aiAnalyzer.js`: the AI second opinion (three prompts per film), sent to the homelab LiteLLM gateway's OpenAI-compatible endpoint as the alias in `AI_MODEL` (`cloud-coder`, DeepSeek V4.1 Flash via OpenRouter, since 2026-11-06). The model that answered is stored per film as `enhancedAnalytics.aiModel`; films without it were analyzed by Claude 3.5 Haiku. Any failed section fails the film, so nothing ships half-analyzed.

bechdeltest.com's API is gone (HTTP 410), so new films have no readers' score.

See [DEPLOYMENT.md](../DEPLOYMENT.md) for the workflow.
