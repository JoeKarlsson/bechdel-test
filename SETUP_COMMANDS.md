# Server Setup Commands

Run these commands on your Proxmox server to complete the automated deployment setup.

## Step 1: SSH to Proxmox Server

```bash
ssh root@192.168.0.247
```

## Step 2: Install Required Packages

```bash
# Update package lists
apt-get update

# Install git, curl, and other dependencies
apt-get install -y git curl unzip

# Verify git is installed
git --version
```

## Step 3: Set Up Deployment Directory

```bash
# Create deployment directory
mkdir -p /opt/bechdel-test
cd /opt/bechdel-test

# Clone the repository
git clone https://github.com/JoeKarlsson/bechdel-test.git .

# Checkout develop branch
git checkout develop

# Verify files are there
ls -la
```

## Step 4: Generate SSH Deployment Key

```bash
# Generate SSH key for GitHub Actions
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy_key -N ""

# Add public key to authorized_keys
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys

# Set proper permissions
chmod 600 ~/.ssh/github_deploy_key
chmod 600 ~/.ssh/authorized_keys

# Display the private key (copy this for GitHub Secrets)
echo "=== COPY THIS PRIVATE KEY FOR GITHUB SECRETS ==="
cat ~/.ssh/github_deploy_key
echo "=== END OF PRIVATE KEY ==="
```

**IMPORTANT**: Copy the entire private key output (including `-----BEGIN` and `-----END` lines) for the next step.

## Step 5: Create Environment File

```bash
cd /opt/bechdel-test

# Create .env file
cat > .env << 'EOF'
# API Keys (REPLACE WITH YOUR ACTUAL KEY)
CLAUDE_API_KEY=sk-ant-your-claude-api-key-here

# Image configuration for auto-deploy
IMAGE_TAG=ghcr.io/joekarlsson/bechdel-test:develop

# Cache busting
CACHE_BUST=$(date +%s)
EOF

# IMPORTANT: Edit this file and add your actual Claude API key
nano .env
# Or use: vi .env
```

## Step 6: Create Required Directories

```bash
cd /opt/bechdel-test

# Create directories
mkdir -p uploads dockge-data

# Set permissions
chmod -R 755 uploads dockge-data
```

## Step 7: Verify Docker is Installed

```bash
# Check Docker
docker --version

# Check Docker Compose
docker compose version

# If not installed, install Docker:
# curl -fsSL https://get.docker.com | sh
```

---

## Configure GitHub Secrets (On Your Local Machine)

Now, on your local machine, set up GitHub Secrets:

### Option A: Using the Helper Script (Recommended)

```bash
cd ~/Documents/dev/bechdel-test
./setup-github-secrets.sh
```

### Option B: Manual Configuration

1. Go to: https://github.com/JoeKarlsson/bechdel-test/settings/secrets/actions
2. Click **"New repository secret"**
3. Add these secrets one by one:

| Secret Name | Value | Where to Get It |
|-------------|-------|----------------|
| `DEPLOY_SSH_KEY` | (paste private key from Step 4) | From server: `cat ~/.ssh/github_deploy_key` |
| `DEPLOY_SSH_HOST` | `192.168.0.247` | Your Proxmox IP |
| `DEPLOY_SSH_USER` | `root` | SSH username |
| `DEPLOY_SSH_PORT` | `22` | SSH port (usually 22) |
| `DEPLOY_PATH` | `/opt/bechdel-test` | Deployment directory |
| `CLAUDE_API_KEY` | `sk-ant-...` | Your Claude API key from Anthropic |

---

## Test the Deployment

### From Your Local Machine:

```bash
cd ~/Documents/dev/bechdel-test

# Make a test change
echo "" >> README.md

# Commit and push
git add README.md
git commit -m "test: automated deployment"
git push origin develop
```

### Watch the Deployment:

1. Go to: https://github.com/JoeKarlsson/bechdel-test/actions
2. You should see a new workflow running
3. Click on it to watch the progress
4. Deployment takes about 3-5 minutes

### Verify on Server:

```bash
ssh root@192.168.0.247

cd /opt/bechdel-test

# Check if containers are running
docker compose -f docker-compose.auto-deploy.yml ps

# View logs
docker compose -f docker-compose.auto-deploy.yml logs -f app

# Check app health
curl http://localhost:8080/health
```

---

## Troubleshooting

### If GitHub Actions fails at SSH step:

```bash
# On server, verify SSH key permissions
ls -la ~/.ssh/github_deploy_key
chmod 600 ~/.ssh/github_deploy_key

# Test SSH from local machine (after adding key to GitHub)
# (This is just for testing, GitHub Actions will use it automatically)
```

### If deployment succeeds but app won't start:

```bash
cd /opt/bechdel-test

# Check logs
docker compose -f docker-compose.auto-deploy.yml logs app

# Verify environment variables
cat .env

# Restart services
docker compose -f docker-compose.auto-deploy.yml restart app
```

### If image pull fails:

The first time, GitHub Container Registry package needs to be made public:

1. Go to your GitHub profile → Packages
2. Find `bechdel-test` package
3. Package settings → Change visibility → Public

---

## Success Checklist

- [ ] Git installed on Proxmox server
- [ ] Repository cloned to `/opt/bechdel-test`
- [ ] SSH deployment key generated
- [ ] `.env` file created with Claude API key
- [ ] GitHub Secrets configured (all 6 secrets)
- [ ] Test push triggers deployment
- [ ] App is running and accessible

---

## What Happens Next

Once setup is complete:

1. You push code to `develop` or `main`
2. GitHub Actions automatically:
   - Builds Docker image
   - Pushes to GitHub Container Registry
   - SSHs to your server
   - Pulls new image
   - Restarts the app
3. Your app is updated in 3-5 minutes!

**No more manual deployments!**

---

## Quick Reference

**View deployment status:**
```bash
# On GitHub
https://github.com/JoeKarlsson/bechdel-test/actions

# On server
ssh root@192.168.0.247 "cd /opt/bechdel-test && docker compose -f docker-compose.auto-deploy.yml ps"
```

**View logs:**
```bash
ssh root@192.168.0.247 "cd /opt/bechdel-test && docker compose -f docker-compose.auto-deploy.yml logs -f app"
```

**Manual deployment (if needed):**
```bash
ssh root@192.168.0.247
cd /opt/bechdel-test
git pull origin develop
docker compose -f docker-compose.auto-deploy.yml pull app
docker compose -f docker-compose.auto-deploy.yml up -d app
```

---

Need help? Check the full documentation:
- **QUICKSTART_AUTODEPLOY.md** - Quick setup guide
- **AUTOMATED_DEPLOYMENT.md** - Complete documentation
