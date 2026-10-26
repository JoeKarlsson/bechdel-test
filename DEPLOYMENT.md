# Deployment Guide

## Overview

This application has two modes:

1. **Full-Stack Server** - For adding new films (Express + MongoDB). Runs locally with Docker Compose.
2. **Static Site** - For public viewing (GitHub Pages)

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture documentation.

## Quick Reference

| Mode | URL | Branch | Use Case |
|------|-----|--------|----------|
| Full-Stack | http://localhost:8080 | `develop` | Adding films |
| Static Site | https://bechdel.joekarlsson.com/ | `gh-pages` | Public viewing |

---

## Full-Stack Server

The full-stack server is not hosted anywhere. Run it locally when you want to add films.

```bash
# Put your Claude API key in .env (see .env.example)
echo "CLAUDE_API_KEY=sk-ant-api03-xxxxx" > .env

# Build and start the app and MongoDB
docker compose up -d --build

# Check it's up
curl http://localhost:8080/health
```

The app listens on http://localhost:8080. MongoDB is exposed on `localhost:27017` so the export script can reach it.

```bash
docker compose logs -f app   # View logs
docker compose restart app   # Restart the app
docker compose down          # Stop everything (data stays in the mongodb_data volume)
```

---

## Static Site Deployment

### Architecture

```
Push to gh-pages branch
    ↓
GitHub Actions workflow
    ↓
Build static site (webpack)
    ↓
Deploy to GitHub Pages
    ↓
https://bechdel.joekarlsson.com/
```

The custom domain is set in the repo's GitHub Pages settings. The DNS record is a `CNAME` from `bechdel.joekarlsson.com` to `joekarlsson.github.io` in Cloudflare (DNS only, not proxied).

### Update Static Site (After Adding Films)

```bash
# Automated workflow (recommended)
./scripts/update-static-site.sh

# This script:
# 1. Exports MongoDB data to films.json
# 2. Commits to gh-pages branch
# 3. Pushes to trigger GitHub Actions deploy
```

### Manual Update Steps

```bash
# 1. Export data from MongoDB
npm run export-data

# 2. Switch to gh-pages branch
git checkout gh-pages

# 3. Commit the updated data
git add src/app/data/films.json
git commit -m "chore: update films data"

# 4. Push to trigger deploy
git push origin gh-pages

# 5. Return to develop branch
git checkout develop
```

### Verify Deployment

1. Check Actions: https://github.com/JoeKarlsson/bechdel-test/actions
2. Visit site: https://bechdel.joekarlsson.com/

---

## Troubleshooting

### Export fails (can't connect to MongoDB)

Start the full-stack server first (`docker compose up -d`), then point the export at it:

```bash
MONGODB_URI="mongodb://admin:password@localhost:27017/bechdelTest?authSource=admin" npm run export-data
```

### GitHub Actions failing

1. Check workflow logs: https://github.com/JoeKarlsson/bechdel-test/actions
2. Verify `gh-pages` branch exists
3. Check GitHub Pages settings in repo (source: GitHub Actions, custom domain: `bechdel.joekarlsson.com`)

---

## Configuration Files

### compose.yaml

Docker Compose configuration:
- App service (Node.js, published on port 8080)
- MongoDB service
- Persistent volume for data

### .env

Local secrets (gitignored). Copy `.env.example` and set `CLAUDE_API_KEY`.

### .github/workflows/deploy-gh-pages.yml

GitHub Actions workflow for static site deployment.

---

## Rollback

### Static Site

```bash
# Revert last commit on gh-pages
git checkout gh-pages
git revert HEAD
git push origin gh-pages
git checkout develop
```
