#!/bin/bash
# Server-side deployment script for Bechdel Test
# This script is called by GitHub Actions after SSH

set -e

# Required environment variables:
# - CLAUDE_API_KEY
# - IMAGE_TAG

echo "=================================================="
echo "Bechdel Test Deployment Script"
echo "=================================================="
echo ""
echo "Environment:"
echo "  IMAGE_TAG: ${IMAGE_TAG}"
echo "  CLAUDE_API_KEY: ${CLAUDE_API_KEY:0:10}..."
echo ""

# Step 1: Pull latest code in container
echo "[1/6] Pulling latest code in container..."
pct exec 122 -- bash -c "cd /opt/stacks/bechdel-test && git pull origin develop"
echo "✓ Code pulled"
echo ""

# Step 2: Create .env file on host
echo "[2/6] Creating .env file on Proxmox host..."
cat > /tmp/bechdel.env << ENVEOF
CLAUDE_API_KEY=${CLAUDE_API_KEY}
IMAGE_TAG=${IMAGE_TAG}
CACHE_BUST=$(date +%s)
ENVEOF
echo "✓ .env file created"
echo ""

# Step 3: Copy .env into container
echo "[3/6] Copying .env to container..."
pct push 122 /tmp/bechdel.env /opt/stacks/bechdel-test/.env
echo "✓ .env copied to container"
echo ""

# Step 4: Pull new Docker image
echo "[4/6] Pulling Docker image..."
pct exec 122 -- bash -c "cd /opt/stacks/bechdel-test && docker compose -f compose.yaml pull app"
echo "✓ Image pulled"
echo ""

# Step 5: Restart services
echo "[5/6] Restarting services..."
pct exec 122 -- bash -c "cd /opt/stacks/bechdel-test && docker compose -f compose.yaml up -d app"
echo "✓ Services restarted"
echo ""

# Step 6: Show status
echo "[6/6] Checking container status..."
pct exec 122 -- bash -c "cd /opt/stacks/bechdel-test && docker compose -f compose.yaml ps"
echo ""

# Cleanup
echo "Cleaning up temporary files..."
rm -f /tmp/bechdel.env
echo "✓ Cleanup complete"
echo ""

echo "=================================================="
echo "✅ Deployment complete!"
echo "=================================================="
