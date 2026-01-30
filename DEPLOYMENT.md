# Deployment Guide

## Overview

This application supports two deployment modes:

1. **Full-Stack Server** - For adding new films (Express + MongoDB)
2. **Static Site** - For public viewing (GitHub Pages)

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture documentation.

## Quick Reference

| Mode | URL | Branch | Use Case |
|------|-----|--------|----------|
| Full-Stack | http://192.168.0.50:8080 | `develop` | Adding films |
| Full-Stack (external) | https://bechdel.joekarlsson.io | `develop` | Adding films (public) |
| Static Site | https://joekarlsson.github.io/bechdel-test/ | `gh-pages` | Public viewing |

---

## Full-Stack Deployment

### Architecture

```
Local Machine (macOS)
    ↓ SSH
Proxmox Host prxbox1 (192.168.0.236)
    ↓ pct exec
LXC Container 111 (Dockge)
    └── Docker Compose at /opt/stacks/bechdel-test
        ├── App Container (Node.js) → 192.168.0.50:8080
        └── MongoDB Container (internal)
```

### Prerequisites

1. **Local Machine Setup**
   - SSH access to Proxmox host configured
   - `.env.deployment.local` file in project root:
     ```bash
     CLAUDE_API_KEY=sk-ant-api03-xxxxx
     ```

2. **Container Setup**
   - Container ID: 111 (Dockge)
   - App IP: 192.168.0.50
   - Port: 8080
   - Stack location: `/opt/stacks/bechdel-test`

### Deploy Commands

```bash
# Quick deploy from local machine
npm run deploy

# Or run directly
./deploy-local.sh
```

### What Happens During Deployment

1. **Network Setup** - Ensures container networking is configured
2. **Code Pull** - Pulls latest from `develop` branch
3. **Environment** - Creates `.env` with API keys
4. **Build & Deploy** - Builds Docker image, starts services
5. **Status Check** - Verifies services are running

### Access Points

- **Local Network:** http://192.168.0.50:8080
- **Public Domain:** https://bechdel.joekarlsson.io
- **MongoDB:** Internal to container (not exposed)

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
https://joekarlsson.github.io/bechdel-test/
```

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
2. Visit site: https://joekarlsson.github.io/bechdel-test/

---

## Troubleshooting

### Full-Stack Issues

#### Container not responding

```bash
# SSH into Proxmox host
ssh root@192.168.0.236

# Check container status
pct exec 111 -- docker compose -f /opt/stacks/bechdel-test/compose.yaml ps

# View logs
pct exec 111 -- docker compose -f /opt/stacks/bechdel-test/compose.yaml logs app

# Restart services
pct exec 111 -- docker compose -f /opt/stacks/bechdel-test/compose.yaml restart
```

#### Network issues

```bash
# Check container network
pct exec 111 -- ip addr show
pct exec 111 -- ping -c 2 8.8.8.8
```

#### Git issues in container

```bash
# Remove lock file
pct exec 111 -- rm -f /opt/stacks/bechdel-test/.git/index.lock

# Reset to clean state
pct exec 111 -- bash -c "cd /opt/stacks/bechdel-test && git reset --hard origin/develop"
```

### Static Site Issues

#### Export fails (can't connect to MongoDB)

```bash
# Option 1: Run export from within container
ssh root@192.168.0.236 "pct exec 111 -- bash -c 'cd /opt/stacks/bechdel-test && npm run export-data'"

# Option 2: SSH tunnel to MongoDB
ssh -L 27017:192.168.0.50:27017 root@192.168.0.236 -N &
MONGODB_URI=mongodb://localhost:27017/bechdelTest npm run export-data
```

#### GitHub Actions failing

1. Check workflow logs: https://github.com/JoeKarlsson/bechdel-test/actions
2. Verify `gh-pages` branch exists
3. Check GitHub Pages settings in repo

---

## Configuration Files

### deploy-local.sh

Main deployment script for full-stack server.

**Variables:**
- `PROXMOX_HOST`: 192.168.0.236 (prxbox1)
- `CONTAINER_ID`: 111 (Dockge)

### .env.deployment.local

Local secrets (gitignored):
```bash
CLAUDE_API_KEY=sk-ant-api03-xxxxx
```

### compose.yaml

Docker Compose configuration:
- App service (Node.js on port 8080)
- MongoDB service (internal)
- Persistent volumes for data

### .github/workflows/deploy-gh-pages.yml

GitHub Actions workflow for static site deployment.

---

## Security Notes

1. **API Keys** - Never commit `.env.deployment.local`
2. **SSH Keys** - Use key-based auth for Proxmox
3. **MongoDB** - Not exposed externally, internal to Docker network
4. **HTTPS** - Public access via Nginx Proxy Manager with SSL

---

## Deployment Checklist

### Full-Stack Deploy

- [ ] `.env.deployment.local` exists with valid API keys
- [ ] SSH access to Proxmox works
- [ ] Changes pushed to `develop` branch
- [ ] Run `npm run deploy`
- [ ] Verify at http://192.168.0.50:8080

### Static Site Update

- [ ] New films added via full-stack
- [ ] Run `./scripts/update-static-site.sh`
- [ ] Check GitHub Actions completed
- [ ] Verify at https://joekarlsson.github.io/bechdel-test/

---

## Rollback

### Full-Stack

```bash
# Rollback to previous commit
ssh root@192.168.0.236 "pct exec 111 -- bash -c 'cd /opt/stacks/bechdel-test && git reset --hard HEAD~1'"
npm run deploy
```

### Static Site

```bash
# Revert last commit on gh-pages
git checkout gh-pages
git revert HEAD
git push origin gh-pages
git checkout develop
```
