# Quick Start: Automated Deployment

Get your Bechdel Test app deploying automatically in under 10 minutes! 🚀

## What You'll Get

After setup, every time you push to `develop` or `main`:
1. GitHub Actions builds your Docker image (3-4 minutes)
2. Pushes to GitHub Container Registry (free)
3. Auto-deploys to your Proxmox server
4. App restarts with the new code

**Zero manual steps!** Just like Heroku.

## 🏃 Quick Setup (3 Steps)

### Step 1: Server Setup (2 minutes)

SSH to your Proxmox server and run:

```bash
ssh root@192.168.0.247  # Or your server IP

# Create deployment directory
sudo mkdir -p /opt/bechdel-test
cd /opt/bechdel-test

# Clone repository
git clone https://github.com/JoeKarlsson/bechdel-test.git .
git checkout develop

# Generate deployment SSH key
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy_key -N ""
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys

# IMPORTANT: Copy this private key for next step
cat ~/.ssh/github_deploy_key
```

**Copy the entire private key output** (including the `-----BEGIN` and `-----END` lines).

### Step 2: Configure GitHub Secrets (3 minutes)

**Option A: Automated (recommended)**

Run this script from your local machine:

```bash
cd ~/Documents/dev/bechdel-test
./setup-github-secrets.sh
```

**Option B: Manual**

1. Go to: https://github.com/JoeKarlsson/bechdel-test/settings/secrets/actions
2. Click "New repository secret"
3. Add these secrets:

| Name | Value |
|------|-------|
| `DEPLOY_SSH_KEY` | (paste the private key from Step 1) |
| `DEPLOY_SSH_HOST` | `192.168.0.247` |
| `DEPLOY_SSH_USER` | `root` |
| `DEPLOY_SSH_PORT` | `22` |
| `DEPLOY_PATH` | `/opt/bechdel-test` |
| `CLAUDE_API_KEY` | (your Claude API key) |

### Step 3: Configure Server `.env` (1 minute)

On your Proxmox server:

```bash
cd /opt/bechdel-test

cat > .env << 'EOF'
CLAUDE_API_KEY=sk-ant-your-key-here
IMAGE_TAG=ghcr.io/joekarlsson/bechdel-test:develop
CACHE_BUST=$(date +%s)
EOF
```

**Replace `sk-ant-your-key-here` with your actual Claude API key.**

## ✅ Test It!

From your local machine:

```bash
cd ~/Documents/dev/bechdel-test

# Make a small change
echo "" >> README.md

# Commit and push
git add .
git commit -m "test: automated deployment"
git push origin develop
```

Now watch the magic:
1. Go to: https://github.com/JoeKarlsson/bechdel-test/actions
2. You'll see your workflow running
3. In 3-5 minutes, your app is deployed!

## 🎯 Daily Use

From now on, deployment is automatic:

```bash
# Work on your code
git checkout develop
# ... make changes ...
git add .
git commit -m "feat: new feature"
git push origin develop

# 🎉 Automatic deployment happens!
# Takes 3-5 minutes total
```

## 📊 Monitor Deployments

**View Deployment Status:**
- GitHub: https://github.com/JoeKarlsson/bechdel-test/actions
- Server: `ssh root@192.168.0.247 "cd /opt/bechdel-test && docker compose -f docker-compose.auto-deploy.yml ps"`

**View Logs:**
```bash
ssh root@192.168.0.247 "cd /opt/bechdel-test && docker compose -f docker-compose.auto-deploy.yml logs -f app"
```

## 🔧 Manual Deploy (Emergency)

If you need to deploy manually:

```bash
ssh root@192.168.0.247

cd /opt/bechdel-test
git pull origin develop
docker compose -f docker-compose.auto-deploy.yml pull app
docker compose -f docker-compose.auto-deploy.yml up -d app
```

## 📚 Learn More

- **Full Documentation**: See [AUTOMATED_DEPLOYMENT.md](./AUTOMATED_DEPLOYMENT.md)
- **Original Dockge Guide**: See [DOCKGE_DEPLOYMENT.md](./DOCKGE_DEPLOYMENT.md)
- **Troubleshooting**: Check the full docs for common issues

## 🎊 What Changed?

### Before:
```bash
# Every deployment required:
ssh server
cd /opt/bechdel-test
git pull
docker compose build --no-cache
docker compose restart
# Check logs
# Hope it worked
```

### After:
```bash
git push origin develop
# Done! ✨
```

## ❓ FAQ

**Q: Does this cost money?**
A: No! GitHub Actions is free (2,000 minutes/month), GHCR is free.

**Q: What if deployment fails?**
A: Check the Actions tab for logs. Usually it's a GitHub Secret issue.

**Q: Can I still deploy manually?**
A: Yes! The old commands still work.

**Q: What about production?**
A: Push to `main` instead of `develop` for production deploys.

**Q: How do I rollback?**
A: `git revert` the commit and push again.

---

**Need Help?** Check [AUTOMATED_DEPLOYMENT.md](./AUTOMATED_DEPLOYMENT.md) for detailed docs and troubleshooting.

**Issues?** Open a GitHub issue or check the Actions logs.
