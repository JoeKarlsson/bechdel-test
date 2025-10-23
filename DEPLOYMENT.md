# Deployment Guide

## Overview

This application uses a local deployment approach where deployments are triggered manually from your local machine to a Proxmox LXC container. The deployment script builds Docker images on the server and deploys them using Docker Compose.

## Architecture

```
Local Machine (macOS)
    ↓ SSH
Proxmox Host (192.168.0.247)
    ↓ pct exec
LXC Container 122 (192.168.0.48)
    └── Docker Compose
        ├── App Container (Node.js)
        └── MongoDB Container
```

## Prerequisites

### 1. Local Machine Setup

- SSH access to Proxmox host configured
- `.env.deployment.local` file in project root with your Claude API key:
  ```bash
  CLAUDE_API_KEY=sk-ant-api03-xxxxx
  ```

### 2. Proxmox Container Setup

- Container ID: 122
- IP Address: 192.168.0.48
- Port: 8080 (mapped from container port 3000)
- Git repository cloned at `/opt/stacks/bechdel-test`
- Docker and Docker Compose installed in container
- SSH key authentication configured for root@192.168.0.247

### 3. Network Configuration

The container's network interface (eth0) is configured during deployment:
- IP: 192.168.0.48/24
- Gateway: 192.168.0.1
- DNS: Configured at Proxmox level (1.1.1.1, 8.8.8.8)

## Deployment Process

### Quick Deploy

```bash
npm run deploy
```

This single command handles everything:
1. Configures container networking
2. Pulls latest code from GitHub (develop branch)
3. Creates .env file with API keys
4. Builds Docker images locally on the server
5. Starts/restarts services with Docker Compose
6. Shows deployment status

### Manual Deploy

If you need to run the script directly:

```bash
./deploy-local.sh
```

### What Happens During Deployment

1. **Network Setup** [1/5]
   - Ensures container's eth0 interface is up
   - Configures IP address if missing
   - Adds default route if needed

2. **Code Pull** [2/5]
   - Pulls latest changes from `develop` branch
   - Updates code in `/opt/stacks/bechdel-test`

3. **Environment Configuration** [3/5]
   - Creates `.env` file in container
   - Sets `CLAUDE_API_KEY` from local env file
   - Sets `CACHE_BUST` timestamp for asset cache busting

4. **Build & Deploy** [4/5]
   - Builds Docker image locally (using Webpack, takes ~15-20 seconds)
   - Creates fresh container image
   - Starts services with `docker compose up -d`

5. **Status Check** [5/5]
   - Shows running containers
   - Displays service health status

## Deployment Logs

Each deployment shows progress through 5 steps with clear indicators:
```
[1/5] Ensuring container network is up...
✓ Network configured

[2/5] Pulling latest code...
✓ Code pulled

[3/5] Creating .env file...
✓ .env created

[4/5] Building and starting services...
✓ Services started

[5/5] Checking container status...
```

## Access Points

After successful deployment:

- **Local Network**: http://192.168.0.48:8080
- **Public Domain**: http://bechdel.joekarlsson.io
- **MongoDB**: localhost:27017 (from within container)

## Troubleshooting

### Network Issues

If the container can't reach the internet:

```bash
# SSH into Proxmox host
ssh root@192.168.0.247

# Check container network status
pct exec 122 -- ip addr show eth0
pct exec 122 -- ip route show
pct exec 122 -- ping -c 2 8.8.8.8

# Fix network if needed (deployment script does this automatically)
pct exec 122 -- ip link set eth0 up
pct exec 122 -- ip addr add 192.168.0.48/24 dev eth0
pct exec 122 -- ip route add default via 192.168.0.1
```

### Container Issues

```bash
# SSH into container
ssh root@192.168.0.247
pct enter 122

# Check Docker services
cd /opt/stacks/bechdel-test
docker compose ps
docker compose logs app
docker compose logs mongodb

# Restart services
docker compose restart app

# Rebuild from scratch
docker compose down
docker compose build --no-cache app
docker compose up -d
```

### Git Issues

If git operations fail in container:

```bash
# Remove lock file
pct exec 122 -- rm -f /opt/stacks/bechdel-test/.git/index.lock

# Reset to clean state
pct exec 122 -- bash -c "cd /opt/stacks/bechdel-test && git reset --hard origin/develop"
```

### API Key Issues

Verify API key is set correctly:

```bash
# Check .env file in container (careful - shows secrets!)
ssh root@192.168.0.247 "pct exec 122 -- cat /opt/stacks/bechdel-test/.env"
```

## Configuration Files

### deploy-local.sh

Main deployment script that orchestrates the entire deployment process. Located at project root.

**Configuration variables:**
- `PROXMOX_HOST`: 192.168.0.247
- `PROXMOX_USER`: root
- `CONTAINER_ID`: 122

### .env.deployment.local

Local file (gitignored) containing deployment secrets:
```bash
CLAUDE_API_KEY=sk-ant-api03-xxxxx
```

### compose.yaml

Docker Compose configuration in the repository defining:
- App service (Node.js application)
- MongoDB service (database)
- Volume mounts
- Port mappings
- Health checks

## Security Notes

1. **API Keys**: Never commit `.env.deployment.local` to git (already in .gitignore)
2. **SSH Keys**: Use key-based authentication for Proxmox SSH access
3. **Container Access**: Root access to container - secure your Proxmox host
4. **Network Security**: Application accessible on local network (192.168.0.48:8080)

## Deployment Checklist

Before deploying:
- [ ] Local `.env.deployment.local` file exists with valid Claude API key
- [ ] SSH access to Proxmox host works (`ssh root@192.168.0.247`)
- [ ] Changes committed and pushed to develop branch on GitHub
- [ ] No other deployments running

During deployment:
- [ ] Watch for errors in each step
- [ ] Verify "✓" checkmarks for all 5 steps
- [ ] Check final container status shows both services running

After deployment:
- [ ] Test application at http://192.168.0.48:8080
- [ ] Verify public URL works: http://bechdel.joekarlsson.io
- [ ] Check application logs if issues occur

## Rollback

If deployment fails or causes issues:

1. **Quick rollback to previous container**:
   ```bash
   ssh root@192.168.0.247 "pct exec 122 -- bash -c 'cd /opt/stacks/bechdel-test && docker compose down && docker compose up -d'"
   ```

2. **Rollback code to previous commit**:
   ```bash
   ssh root@192.168.0.247 "pct exec 122 -- bash -c 'cd /opt/stacks/bechdel-test && git reset --hard HEAD~1'"
   npm run deploy
   ```

## Development vs Production

This deployment setup is for:
- **Environment**: Production/Home Server
- **Branch**: develop
- **Build**: Production Docker builds with optimized Webpack
- **Domain**: bechdel.joekarlsson.io

For local development, use:
```bash
npm run start:dev
```

## Migration Notes

This deployment approach replaced the previous GitHub Actions CI/CD pipeline because:
- Simpler to maintain for single-user deployments
- No Tailscale VPN coordination needed
- Direct SSH access available on local network
- Faster feedback loop
- Easier debugging

Previous GitHub Actions workflow is preserved as `.github/workflows/deploy.yml.disabled` for reference.
