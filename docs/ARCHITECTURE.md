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
- **Pages:** `/` (the shelf), `/films/<title>-<year>/`, `/numbers/` (the whole shelf counted, from `shelfStats` in `src/lib/films.mjs`), `/about/`, `/case-study/`, `/privacy/`, `404.html`, `sitemap.xml`.
- **Images:** posters and backdrops are downloaded once (`npm run images`) into `src/assets/films/` and served as AVIF/WebP; share cards are rendered by Playwright (`npm run og`) into `public/og/`.
- **Design:** dark only, hot pink on black, Anton and Fraunces (self-hosted), tokens in `src/styles/global.css`.
- **Tests:** `test/` (node:test: data layer and every built page), `e2e/` (Playwright on desktop, Pixel and iPhone: smoke, shelf, axe, layout), `lighthouserc.json`. All run in CI before a deploy.

## The analyzer (repo root)

`scripts/analyze.js` is the command line; the pipeline is in `src/`:

- `manifest.js` + `scripts/manifest.json`: which film each script is, by IMDb id, set once with `npm run match` and checked by hand.
- `fetchMetadata.js`: OMDB and TMDB by IMDb id: title, year, plot, cast and crew with genders, images, budget and revenue, and the top 10 billed actors' birthdays. Responses are cached in `.cache/http/`.
- `screenplay.js`: reads a script into scenes of action and dialogue. Handles indented scripts, flattened PDF text ("NICK (CONT'D) Whose beer..."), double spacing, lost line breaks and "Name:" scripts; refuses (by throwing) scripts it finds under 150 lines of dialogue in.
- `data/gender-overrides.json`: speaker genders corrected by hand, per script (`{ "inception.txt": { "ARIADNE": "w" } }`), for the cases the rules get wrong. An override for a speaker who never speaks fails the run.
- `genders.js`: each speaker's gender and whether they're a named character, from the TMDB cast (first or last name), gendered words in the name (MRS., MOTHER, KING), then pronouns near the name in the stage directions.
- `bechdel/score.js`: the three rules on that: two named women speak; two of them say consecutive lines in a scene; none of those lines mention a man (he/him/his and the like as whole words, or this film's men's names). The same test run the other way (two named men, not about a woman) is the reverse test.
- `analyzeFilm.js`: puts it together and builds the film record in the shape `site/src/lib/films.mjs` reads, with a compact `script` section (speakers with gender and lines, each scene's place and lines per speaker, and `measures`: when the first woman speaks, the longest stretch without one, words by gender, conversations between women and between men, the reverse test score; no script text), `crew` (key jobs with gender, and every department's head count by gender; TMDB has no gender for about 40% of crew credits, mostly in big departments), `money` (TMDB budget and revenue, null when unknown) and each top-billed actor's `age` at release. A redone film keeps its id, upload date and year (which is in its URL).
- `scriptCleaner.js`: the condensed script the AI reads.
- `aiAnalyzer.js`: the AI second opinion (three prompts per film), sent to the homelab LiteLLM gateway's OpenAI-compatible endpoint as the alias in `AI_MODEL` (`cloud-coder`, DeepSeek V4.1 Flash via OpenRouter, since 2026-11-06). The model that answered is stored per film as `enhancedAnalytics.aiModel`; films without it were analyzed by Claude 3.5 Haiku. Any failed section fails the film, so nothing ships half-analyzed.

## Measuring accuracy

`npm run eval` scores the static analysis against bechdeltest.com's reader ratings for every script that has one (`data/eval/bechdeltest-ratings.json`, built by `npm run ratings` from the site's public year listings, since its API is gone). Both use TMDB only, so they don't spend OMDB's 1,000-a-day quota. On 2026-11-06, over 1,823 rated films: pass/fail agrees with readers on 77% (calling every film a fail would get 48%), the exact score on 63%, it finds 86% of real passes, and 74% of its passes are right. The previous parser got 30 of the 43 films it could be checked on (70%) and found a third of real passes. The commonest miss is a film readers rate 1 (the women never really talk) that the parser passes on a short exchange. Analyze also sets each film's readers' score from that file, and refuses scripts whose text is a bad scan (under 75% real words) or that have under 150 lines of dialogue.

See [DEPLOYMENT.md](../DEPLOYMENT.md) for the workflow.
