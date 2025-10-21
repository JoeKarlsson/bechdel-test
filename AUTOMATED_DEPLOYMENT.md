# Automated Deployment Guide

This guide explains how to set up automated deployments for the Bechdel Test application using GitHub Actions and GitHub Container Registry (GHCR). Once configured, deployments work like Heroku - simply push to `main` or `develop` and your app automatically deploys!

## 🎯 What This Does

- **Automatic Builds**: Every push to `main` or `develop` triggers a Docker image build
- **Container Registry**: Images are pushed to GitHub Container Registry (free, no Docker Hub needed)
- **Auto-Deploy**: After building, the app automatically deploys to your Proxmox server
- **Zero Manual Steps**: No more SSH, git pull, docker build, restart - it's all automated!

## Architecture Overview

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│                 │       │                  │       │                 │
│  GitHub Repo    │──────▶│ GitHub Actions   │──────▶│  GHCR Registry  │
│  (push code)    │       │ (build & push)   │       │  (store image)  │
│                 │       │                  │       │                 │
└─────────────────┘       └──────────────────┘       └─────────────────┘
                                   │
                                   │ SSH Deploy
                                   ▼
                          ┌──────────────────┐
                          │                  │
                          │ Proxmox Server   │
                          │ (pull & restart) │
                          │                  │
                          └──────────────────┘
```

## 📋 Prerequisites

1. GitHub repository (already have: `JoeKarlsson/bechdel-test`)
2. Proxmox server with Docker installed
3. SSH access to your Proxmox server
4. API keys (CLAUDE_API_KEY)

## 🚀 Setup Instructions

### Step 1: Server Initial Setup

First, set up the deployment directory on your Proxmox server:

```bash
# SSH into your Proxmox server
ssh your-user@your-proxmox-server

# Run the deployment script (will clone repo and set up directories)
curl -fsSL https://raw.githubusercontent.com/JoeKarlsson/bechdel-test/develop/deploy-server.sh | bash

# OR manually:
sudo mkdir -p /opt/bechdel-test
cd /opt/bechdel-test
git clone https://github.com/JoeKarlsson/bechdel-test.git .
git checkout develop
```

### Step 2: Generate SSH Key for GitHub Actions

On your Proxmox server, create a dedicated SSH key for deployments:

```bash
# Generate SSH key (no passphrase for automation)
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy_key -N ""

# Add the public key to authorized_keys
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys

# Display the private key (you'll add this to GitHub)
cat ~/.ssh/github_deploy_key
```

**Important**: Copy the entire private key output (including `-----BEGIN` and `-----END` lines)

### Step 3: Configure GitHub Secrets

Go to your GitHub repository settings and add these secrets:

1. Navigate to: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add the following secrets:

| Secret Name | Value | Description |
|------------|-------|-------------|
| `DEPLOY_SSH_KEY` | `<private key from step 2>` | Private SSH key for deployment |
| `DEPLOY_SSH_HOST` | `192.168.0.247` (or your IP) | Proxmox server IP |
| `DEPLOY_SSH_USER` | `root` (or your user) | SSH username |
| `DEPLOY_SSH_PORT` | `22` (or custom port) | SSH port |
| `DEPLOY_PATH` | `/opt/bechdel-test` | Deployment directory path |
| `CLAUDE_API_KEY` | `sk-ant-...` | Your Claude API key |

### Step 4: Configure Server Environment

On your Proxmox server, create the `.env` file:

```bash
cd /opt/bechdel-test

cat > .env << 'EOF'
# API Keys
CLAUDE_API_KEY=your_claude_api_key_here

# Image configuration (for auto-deploy)
IMAGE_TAG=ghcr.io/joekarlsson/bechdel-test:develop

# Cache busting
CACHE_BUST=$(date +%s)
EOF
```

**Note**: The `IMAGE_TAG` tells Docker to pull from GHCR instead of building locally.

### Step 5: Enable GitHub Container Registry

GitHub Container Registry is automatically available, but you may need to make the package public:

1. Go to your GitHub profile
2. Click **Packages**
3. Find `bechdel-test` package (after first build)
4. Click **Package settings**
5. Scroll to **Danger Zone** → **Change visibility**
6. Set to **Public** (or configure token for private)

### Step 6: Test the Deployment

Now test the automated deployment:

```bash
# On your local machine
cd ~/Documents/dev/bechdel-test

# Make a small change and commit
echo "# Testing auto-deploy" >> README.md
git add README.md
git commit -m "test: automated deployment"
git push origin develop
```

Watch the deployment:
1. Go to **GitHub** → **Actions** tab
2. You should see your workflow running
3. Monitor the build and deploy steps

## 🔄 Daily Workflow

### For Development

```bash
# Work on develop branch
git checkout develop

# Make your changes
# ... edit files ...

# Commit and push
git add .
git commit -m "feat: add new feature"
git push origin develop

# 🎉 Automatic deployment starts!
# - GitHub Actions builds Docker image
# - Pushes to GHCR
# - SSHs to Proxmox and restarts app
# - Takes ~3-5 minutes total
```

### For Production

```bash
# When ready for production
git checkout main
git merge develop
git push origin main

# 🎉 Production deployment starts automatically!
```

## 📁 File Structure

The automation uses these files:

```
bechdel-test/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions workflow
├── docker-compose.dockge.yml       # Original local dev compose
├── docker-compose.auto-deploy.yml  # Optimized for auto-deploy
├── deploy-server.sh                # Server setup script
├── Dockerfile                      # Multi-stage production build
└── AUTOMATED_DEPLOYMENT.md         # This file
```

## 🐳 Docker Compose Files

### Local Development
Use `docker-compose.dockge.yml` for local development with builds:

```bash
docker compose -f docker-compose.dockge.yml up -d
```

### Auto-Deploy (Server)
Use `docker-compose.auto-deploy.yml` on the server to pull pre-built images:

```bash
# Set IMAGE_TAG in .env first
docker compose -f docker-compose.auto-deploy.yml pull app
docker compose -f docker-compose.auto-deploy.yml up -d
```

## 🔧 Manual Deployment (If Needed)

If you need to manually deploy without GitHub Actions:

```bash
# SSH to server
ssh your-user@proxmox-server

# Navigate to deployment directory
cd /opt/bechdel-test

# Pull latest code
git pull origin develop

# Pull latest image from GHCR
docker compose -f docker-compose.auto-deploy.yml pull app

# Restart services
docker compose -f docker-compose.auto-deploy.yml up -d app

# Check status
docker compose -f docker-compose.auto-deploy.yml ps
```

## 📊 Monitoring

### View Deployment Status

**In GitHub**:
- Go to **Actions** tab to see workflow runs
- Click on a run to see detailed logs

**On Server**:
```bash
# Check service status
docker compose -f docker-compose.auto-deploy.yml ps

# View application logs
docker compose -f docker-compose.auto-deploy.yml logs -f app

# Check health
curl http://localhost:8080/health
```

### Common Commands

```bash
# Restart app only
docker compose -f docker-compose.auto-deploy.yml restart app

# View recent logs
docker compose -f docker-compose.auto-deploy.yml logs --tail=100 app

# Stop everything
docker compose -f docker-compose.auto-deploy.yml down

# Start everything
docker compose -f docker-compose.auto-deploy.yml up -d

# Force rebuild (if not using GHCR)
docker compose -f docker-compose.auto-deploy.yml build --no-cache app
docker compose -f docker-compose.auto-deploy.yml up -d app
```

## 🚨 Troubleshooting

### Deployment Fails at SSH Step

**Problem**: GitHub Actions can't SSH to server

**Solutions**:
1. Verify SSH key is correct in GitHub Secrets
2. Check server firewall allows connections
3. Verify `DEPLOY_SSH_HOST` and `DEPLOY_SSH_PORT` are correct
4. Test SSH manually: `ssh -i key_file user@host`

### Image Pull Fails

**Problem**: Can't pull from GHCR

**Solutions**:
1. Make package public in GitHub Settings
2. Or add authentication:
   ```bash
   echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
   ```

### App Won't Start After Deployment

**Problem**: Container starts but app crashes

**Solutions**:
1. Check logs: `docker compose logs app`
2. Verify environment variables in `.env`
3. Check MongoDB connection
4. Verify CLAUDE_API_KEY is set

### Build Takes Too Long

**Problem**: GitHub Actions builds timing out

**Solutions**:
- Builds are cached, first build is slow
- Subsequent builds reuse layers (much faster)
- Typical build time: 3-5 minutes after first build

## 🎯 Benefits of This Setup

### Compared to Manual Deployment

| Task | Manual | Automated |
|------|--------|-----------|
| Deploy time | 10-15 min | 3-5 min |
| Steps required | 8+ commands | 1 git push |
| Error prone | Yes | No |
| Rollback | Manual | Git revert + push |
| Build caching | Local only | Shared in GHCR |
| Team friendly | No | Yes |

### Cost
- **GitHub Actions**: 2,000 free minutes/month (plenty for small projects)
- **GHCR**: Free unlimited public packages
- **Total**: $0 for most projects

## 🔐 Security Considerations

1. **SSH Keys**: Use dedicated deploy keys with minimal permissions
2. **Secrets**: Never commit secrets to Git, use GitHub Secrets
3. **GHCR**: Public packages are visible to all (use private if needed)
4. **API Keys**: Rotate periodically and use environment variables
5. **Container User**: App runs as non-root user (`nextjs`) for security

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Dockge Documentation](https://github.com/louislam/dockge)

## ❓ FAQ

**Q: Do I need Docker Hub?**
A: No! GitHub Container Registry is free and works great.

**Q: Can I deploy to multiple servers?**
A: Yes! Add multiple deploy jobs in the workflow for different servers.

**Q: What if I want staging and production?**
A: Use branch-based deployments: `develop` → staging, `main` → production.

**Q: How do I rollback?**
A: Git revert the commit and push, or manually pull a previous image tag.

**Q: Can I disable auto-deploy temporarily?**
A: Yes, delete the workflow file or disable the workflow in GitHub Actions settings.

---

**Need Help?** Open an issue in the GitHub repository or check the workflow logs in the Actions tab.
