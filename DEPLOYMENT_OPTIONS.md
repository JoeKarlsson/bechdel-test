# Automated Deployment Options

## The Problem We Solved

GitHub Actions runs on GitHub's cloud infrastructure and **cannot reach your private network IP** (192.168.0.247). This is why the deployment was failing at the `ssh-keyscan` step.

## Solution 1: Tailscale VPN (80% Complete)

**Status**: Proxmox server is on Tailscale at `100.105.213.48`

**What's Done**:
- ✅ Tailscale installed on Proxmox server
- ✅ Server connected to your Tailnet as `proxmox-main` (100.105.213.48)
- ✅ Workflow updated with Tailscale GitHub Action
- ✅ DEPLOY_SSH_HOST secret updated to use Tailscale IP

**Remaining Steps** (5 minutes):

### Option A: Using OAuth (Recommended for production)
1. Go to https://login.tailscale.com/admin/settings/oauth
2. Click "Generate OAuth client"
3. Name it "GitHub Actions - Bechdel Deploy"
4. Scopes: Select `devices:write`
5. Copy the Client ID and Client Secret
6. Add as GitHub Secrets:
   ```bash
   gh secret set TS_OAUTH_CLIENT_ID --body "<your-client-id>" --repo JoeKarlsson/bechdel-test
   gh secret set TS_OAUTH_SECRET --body "<your-client-secret>" --repo JoeKarlsson/bechdel-test
   ```

### Option B: Using Auth Key (Quicker for testing)
1. Go to https://login.tailscale.com/admin/settings/keys
2. Click "Generate auth key"
3. Settings:
   - **Reusable**: ✅ Yes
   - **Ephemeral**: ✅ Yes (nodes are removed when they disconnect)
   - **Tags**: `tag:ci`
   - **Expiration**: 90 days
4. Copy the auth key (starts with `tskey-auth-`)
5. Update the workflow to use auth key instead of OAuth:
   ```yaml
   - name: Connect to Tailscale
     uses: tailscale/github-action@v2
     with:
       authkey: ${{ secrets.TAILSCALE_AUTHKEY }}
   ```
6. Add as GitHub Secret:
   ```bash
   gh secret set TAILSCALE_AUTHKEY --body "<your-auth-key>" --repo JoeKarlsson/bechdel-test
   ```

**Pros**:
- Secure - no public exposure
- No additional hardware needed
- Works from anywhere (even if you're away from home)

**Cons**:
- Requires Tailscale account management
- Small latency overhead (usually negligible)

---

## Solution 2: Self-Hosted GitHub Actions Runner (Alternative)

**Status**: Not yet implemented (but might be simpler!)

This runs a GitHub Actions runner directly on your local network, so it can reach 192.168.0.247 without any VPN.

**Setup Steps** (15 minutes one-time):

### On any machine on your local network (could be Proxmox, a container, or even your Mac):

1. **Create a GitHub Actions runner**:
   ```bash
   # Go to your repo settings
   open "https://github.com/JoeKarlsson/bechdel-test/settings/actions/runners/new"

   # Follow the instructions to download and configure the runner
   # Choose Linux x64 for Proxmox or macOS for your Mac
   ```

2. **Configure the runner as a service** (so it starts automatically):
   ```bash
   cd actions-runner
   sudo ./svc.sh install
   sudo ./svc.sh start
   ```

3. **Update the workflow** to use the self-hosted runner:
   ```yaml
   deploy:
     needs: build-and-push
     runs-on: self-hosted  # <-- Change this line
     if: github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/main'
   ```

4. **Remove the Tailscale step** (no longer needed)

5. **Change SSH_HOST back** to local IP:
   ```bash
   gh secret set DEPLOY_SSH_HOST --body "192.168.0.247" --repo JoeKarlsson/bechdel-test
   ```

**Pros**:
- No VPN needed
- Faster (local network speeds)
- Simpler networking
- No Tailscale account management

**Cons**:
- Requires a machine running 24/7 on your local network
- Uses your own compute resources
- Won't work if the runner machine is offline

---

## Recommendation

**For your use case**, I'd recommend:

### **Go with Solution 1 (Tailscale)** if:
- You want deployments to work even when away from home
- You don't want to manage another service
- You're okay with managing Tailscale OAuth/auth keys

### **Go with Solution 2 (Self-hosted runner)** if:
- You have a machine that's always on (like your Proxmox server)
- You want the simplest, fastest local network deployment
- You don't mind the runner only working when on your local network

---

## Quick Start - Tailscale (Finish in 2 minutes)

If you want to stick with Tailscale:

1. **Generate Auth Key** (easiest for now):
   ```bash
   open "https://login.tailscale.com/admin/settings/keys"
   # Click "Generate auth key"
   # Settings: Reusable=Yes, Ephemeral=Yes, Tags=tag:ci
   # Copy the key
   ```

2. **Add to GitHub**:
   ```bash
   # Paste your auth key when prompted
   gh secret set TAILSCALE_AUTHKEY --repo JoeKarlsson/bechdel-test
   ```

3. **Update workflow** to use auth key:
   ```bash
   # Edit .github/workflows/deploy.yml line 78-83
   # Change from oauth-client-id/oauth-secret to:
   #   authkey: ${{ secrets.TAILSCALE_AUTHKEY }}
   ```

4. **Test deployment**:
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "feat: Use Tailscale auth key for deployment"
   git push origin develop
   ```

---

## Status Summary

Current state:
- ✅ Docker image builds successfully
- ✅ Proxmox server on Tailscale (100.105.213.48)
- ✅ Deployment script works when run manually
- ⏳ Waiting for Tailscale OAuth/auth key to complete GitHub Actions integration
- ⏳ Alternative: Could set up self-hosted runner instead

Next action: Choose approach above and complete the final configuration step!
