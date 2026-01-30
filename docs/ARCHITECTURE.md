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
│   192.168.0.50:8080              joekarlsson.github.io          │
│   bechdel.joekarlsson.io         /bechdel-test/                 │
│   (via NPM proxy)                (GitHub Pages)                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Branches

| Branch | Purpose | Deployment | URL |
|--------|---------|------------|-----|
| `develop` | Full-stack with Express + MongoDB | LXC 111 (Dockge) | http://192.168.0.50:8080 |
| `gh-pages` | Static site with bundled JSON | GitHub Pages | https://joekarlsson.github.io/bechdel-test/ |

## Workflow: Adding a New Film

```
┌─────────────────────────────────────────────────────────────────┐
│                     ADD NEW FILM WORKFLOW                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Start full-stack server (if not running)                    │
│     └─► npm run deploy  OR  access http://192.168.0.50:8080     │
│                                                                  │
│  2. Upload script via web UI                                    │
│     └─► https://bechdel.joekarlsson.io → Upload                 │
│                                                                  │
│  3. Export data to static site                                  │
│     └─► ./scripts/update-static-site.sh                         │
│         - Exports MongoDB → films.json                          │
│         - Commits to gh-pages branch                            │
│         - Pushes (triggers GitHub Actions deploy)               │
│                                                                  │
│  4. Verify deployment                                           │
│     └─► https://joekarlsson.github.io/bechdel-test/             │
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

- **Host:** Proxmox LXC 111 (Dockge) on prxbox1
- **Internal URL:** http://192.168.0.50:8080
- **External URL:** https://bechdel.joekarlsson.io (via Nginx Proxy Manager)
- **Stack Location:** `/opt/stacks/bechdel-test`
- **Services:**
  - Node.js/Express application (port 8080)
  - MongoDB 7.0 (internal, persistent volume)

### Static Site (gh-pages branch)

- **Host:** GitHub Pages
- **URL:** https://joekarlsson.github.io/bechdel-test/
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
# Check if Dockge container is running
ssh root@192.168.0.236 "pct exec 111 -- docker ps"

# SSH tunnel if needed (run from local machine)
ssh -L 27017:192.168.0.50:27017 root@192.168.0.236 -N &
MONGODB_URI=mongodb://localhost:27017/bechdelTest npm run export-data
```

### Static site not updating after push

1. Check GitHub Actions: https://github.com/JoeKarlsson/bechdel-test/actions
2. Verify push was to `gh-pages` branch
3. Check for build errors in Actions logs

### Full-stack server not responding

```bash
# Check container status
ssh root@192.168.0.236 "pct exec 111 -- docker compose -f /opt/stacks/bechdel-test/compose.yaml ps"

# View logs
ssh root@192.168.0.236 "pct exec 111 -- docker compose -f /opt/stacks/bechdel-test/compose.yaml logs app"

# Restart services
ssh root@192.168.0.236 "pct exec 111 -- docker compose -f /opt/stacks/bechdel-test/compose.yaml restart"
```

## Related Documentation

- [DEPLOYMENT.md](../DEPLOYMENT.md) - Deployment procedures
- [README.md](../README.md) - General project info
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Development guidelines
