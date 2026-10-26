# Bechdel Test Architecture

## Overview

This project uses a **dual-branch architecture** to support both active development (adding new films) and a lightweight static site for public viewing.

```
┌─────────────────────────────────────────────────────────────────┐
│                      BRANCH ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   develop branch                    gh-pages branch              │
│   ══════════════                    ═══════════════              │
│   Full-stack app                    Static site                  │
│   Express + MongoDB                 JSON data only               │
│   For adding films                  For public viewing           │
│                                                                  │
│   ┌──────────────┐                  ┌──────────────┐            │
│   │   React UI   │                  │   React UI   │            │
│   │   Express    │    export        │   (no server)│            │
│   │   MongoDB    │ ──────────────►  │   films.json │            │
│   └──────────────┘                  └──────────────┘            │
│         │                                  │                     │
│         ▼                                  ▼                     │
│   localhost:8080                 bechdel.joekarlsson.com        │
│   (docker compose, local)        (GitHub Pages)                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Branches

| Branch | Purpose | Deployment | URL |
|--------|---------|------------|-----|
| `develop` | Full-stack with Express + MongoDB | Local Docker Compose | http://localhost:8080 |
| `gh-pages` | Static site with bundled JSON | GitHub Pages | https://bechdel.joekarlsson.com/ |

## Workflow: Adding a New Film

```
┌─────────────────────────────────────────────────────────────────┐
│                     ADD NEW FILM WORKFLOW                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Start full-stack server (if not running)                    │
│     └─► docker compose up -d --build                            │
│                                                                  │
│  2. Upload script via web UI                                    │
│     └─► http://localhost:8080 → Upload                          │
│                                                                  │
│  3. Export data to static site                                  │
│     └─► ./scripts/update-static-site.sh                         │
│         - Exports MongoDB → films.json                          │
│         - Commits to gh-pages branch                            │
│         - Pushes (triggers GitHub Actions deploy)               │
│                                                                  │
│  4. Verify deployment                                           │
│     └─► https://bechdel.joekarlsson.com/                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Quick Commands

```bash
# Option 1: Use the automated script (recommended)
./scripts/update-static-site.sh

# Option 2: Manual steps
npm run export-data                    # Export MongoDB → films.json
git checkout gh-pages                  # Switch to static branch
git add src/app/data/films.json        # Stage the data
git commit -m "chore: update films"    # Commit
git push origin gh-pages               # Deploy via GitHub Actions
git checkout develop                   # Return to develop
```

## Infrastructure Details

### Full-Stack Server (develop branch)

- **Host:** Not hosted. Run it locally with `docker compose up -d --build` when adding films
- **URL:** http://localhost:8080
- **Services:**
  - Node.js/Express application (port 8080)
  - MongoDB 7.0 (port 27017, persistent volume)

### Static Site (gh-pages branch)

- **Host:** GitHub Pages
- **URL:** https://bechdel.joekarlsson.com/ (custom domain; Cloudflare DNS-only CNAME to `joekarlsson.github.io`)
- **Deploy:** Automatic via GitHub Actions on push to `gh-pages`
- **Data:** Pre-bundled `films.json` (no runtime database)

## File Structure

```
bechdel-test/
├── src/
│   ├── app/                    # React frontend (both branches)
│   │   ├── data/
│   │   │   └── films.json      # Static film data (gh-pages only)
│   │   └── helper/
│   │       ├── api.js          # Full-stack API client (develop)
│   │       └── api-static.js   # Static JSON loader (gh-pages)
│   └── server/                 # Express backend (develop only)
├── scripts/
│   ├── export-to-json.js       # MongoDB → JSON exporter
│   └── update-static-site.sh   # Full export + deploy workflow
├── .github/
│   └── workflows/
│       └── deploy-gh-pages.yml # GitHub Pages deployment
└── webpack.config.static.js    # Static build config (gh-pages)
```

## Environment Variables

### Full-Stack (develop)

Required in `.env` or `.env.deployment.local`:

```bash
MONGODB_URI=mongodb://localhost:27017/bechdelTest
CLAUDE_API_KEY=sk-ant-api03-xxxxx      # For AI analysis
TMDB_API_KEY=xxxxx                      # For movie metadata
MYAPIFILMS_API_KEY=xxxxx               # For additional data
```

### Static Site (gh-pages)

No environment variables needed - all data is pre-bundled.

## When to Use Each Branch

| Task | Branch | Notes |
|------|--------|-------|
| View films | Either | Static site preferred for speed |
| Add new film | `develop` | Requires MongoDB + API keys |
| Update static site | `develop` → `gh-pages` | Run update script |
| Fix frontend bugs | `gh-pages` | Then merge to `develop` |
| Fix backend/API | `develop` | Then export to `gh-pages` |
| Update dependencies | Both | Keep in sync |

## Troubleshooting

### Can't connect to MongoDB for export

```bash
# Make sure the local stack is running
docker compose ps

# Point the export at it
MONGODB_URI="mongodb://admin:password@localhost:27017/bechdelTest?authSource=admin" npm run export-data
```

### Static site not updating after push

1. Check GitHub Actions: https://github.com/JoeKarlsson/bechdel-test/actions
2. Verify push was to `gh-pages` branch
3. Check for build errors in Actions logs

### Full-stack server not responding

```bash
# Check container status
docker compose ps

# View logs
docker compose logs app

# Restart services
docker compose restart
```

## Related Documentation

- [DEPLOYMENT.md](../DEPLOYMENT.md) - Deployment procedures
- [README.md](../README.md) - General project info
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Development guidelines
