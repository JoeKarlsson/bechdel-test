#!/bin/bash
# Local deployment script for Bechdel Test
# Run this from your local machine when you want to deploy

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROXMOX_HOST="192.168.0.247"
PROXMOX_USER="root"
CONTAINER_ID="122"
APP_PATH="/opt/stacks/bechdel-test"
HEALTH_CHECK_RETRIES=12
HEALTH_CHECK_INTERVAL=5

echo -e "${BLUE}=================================================="
echo "Local Deployment to Proxmox"
echo -e "==================================================${NC}"
echo ""

# Pre-deployment checks
echo -e "${BLUE}[Pre-Check] Validating deployment environment...${NC}"

# Check if .env.deployment.local exists
if [ -f .env.deployment.local ]; then
    source .env.deployment.local
    echo -e "${GREEN}✓${NC} Found .env.deployment.local"
else
    echo -e "${RED}✗ Error: .env.deployment.local not found${NC}"
    echo "Please create it with your CLAUDE_API_KEY"
    exit 1
fi

# Check if CLAUDE_API_KEY is set
if [ -z "$CLAUDE_API_KEY" ]; then
    echo -e "${RED}✗ Error: CLAUDE_API_KEY not set in .env.deployment.local${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Claude API key configured"

# Check SSH connectivity
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes ${PROXMOX_USER}@${PROXMOX_HOST} "echo 2>&1" > /dev/null 2>&1; then
    echo -e "${RED}✗ Error: Cannot connect to Proxmox host${NC}"
    echo "  SSH connection to ${PROXMOX_USER}@${PROXMOX_HOST} failed"
    exit 1
fi
echo -e "${GREEN}✓${NC} SSH connection to Proxmox"

# Check if container exists and is running
if ! ssh ${PROXMOX_USER}@${PROXMOX_HOST} "pct status ${CONTAINER_ID}" > /dev/null 2>&1; then
    echo -e "${RED}✗ Error: Container ${CONTAINER_ID} not found or not running${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Container ${CONTAINER_ID} is running"

echo ""
echo -e "${GREEN}Pre-checks passed! Starting deployment...${NC}"
echo ""
echo "Deploying to: ${PROXMOX_HOST}"
echo "Container: ${CONTAINER_ID}"
echo "Branch: develop"
echo ""

# Step 1: Ensure container network is up
echo -e "${BLUE}[1/6] Ensuring container network is up...${NC}"
if ssh ${PROXMOX_USER}@${PROXMOX_HOST} "pct exec ${CONTAINER_ID} -- bash -c 'ping -c 1 -W 2 8.8.8.8 > /dev/null 2>&1'"; then
    echo -e "${GREEN}✓${NC} Network already working, skipping configuration"
else
    echo -e "${YELLOW}⚠${NC}  Network not responding, configuring..."
    ssh ${PROXMOX_USER}@${PROXMOX_HOST} "pct exec ${CONTAINER_ID} -- bash -c 'ip link set eth0 up 2>/dev/null || true; ip addr show eth0 | grep -q \"192.168.0.48\" || ip addr add 192.168.0.48/24 dev eth0; ip route show | grep -q default || ip route add default via 192.168.0.1'" || {
        echo -e "${YELLOW}⚠${NC}  Network setup had issues, but continuing..."
    }

    # Verify network after configuration
    if ssh ${PROXMOX_USER}@${PROXMOX_HOST} "pct exec ${CONTAINER_ID} -- bash -c 'ping -c 1 -W 2 8.8.8.8 > /dev/null 2>&1'"; then
        echo -e "${GREEN}✓${NC} Network configured successfully"
    else
        echo -e "${YELLOW}⚠${NC}  Warning: Network may still have issues"
    fi
fi
echo ""

# Step 2: Clean up any git lock files
echo -e "${BLUE}[2/6] Preparing git repository...${NC}"
ssh ${PROXMOX_USER}@${PROXMOX_HOST} "pct exec ${CONTAINER_ID} -- bash -c 'rm -f ${APP_PATH}/.git/index.lock'" 2>/dev/null || true
echo -e "${GREEN}✓${NC} Git repository ready"
echo ""

# Step 3: Pull latest code
echo -e "${BLUE}[3/6] Pulling latest code from GitHub...${NC}"
if ssh ${PROXMOX_USER}@${PROXMOX_HOST} "pct exec ${CONTAINER_ID} -- bash -c 'cd ${APP_PATH} && git fetch origin develop && git reset --hard origin/develop'"; then
    COMMIT_HASH=$(ssh ${PROXMOX_USER}@${PROXMOX_HOST} "pct exec ${CONTAINER_ID} -- bash -c 'cd ${APP_PATH} && git rev-parse --short HEAD'")
    echo -e "${GREEN}✓${NC} Code updated to commit ${COMMIT_HASH}"
else
    echo -e "${RED}✗ Error: Failed to pull latest code${NC}"
    exit 1
fi
echo ""

# Step 4: Create .env file
echo -e "${BLUE}[4/6] Configuring environment variables...${NC}"
ssh ${PROXMOX_USER}@${PROXMOX_HOST} "pct exec ${CONTAINER_ID} -- bash -c 'cat > ${APP_PATH}/.env << EOF
CLAUDE_API_KEY=${CLAUDE_API_KEY}
CACHE_BUST=\$(date +%s)
NODE_ENV=production
EOF
'"
echo -e "${GREEN}✓${NC} Environment configured"
echo ""

# Step 5: Build and start services
echo -e "${BLUE}[5/6] Building and starting services...${NC}"
echo -e "${YELLOW}   This may take 15-30 seconds for webpack compilation...${NC}"
if ssh ${PROXMOX_USER}@${PROXMOX_HOST} "pct exec ${CONTAINER_ID} -- bash -c 'cd ${APP_PATH} && docker compose -f compose.yaml build app && docker compose -f compose.yaml up -d'"; then
    echo -e "${GREEN}✓${NC} Services started"
else
    echo -e "${RED}✗ Error: Failed to build or start services${NC}"
    echo "Run 'docker compose logs app' on the server for details"
    exit 1
fi
echo ""

# Step 6: Health check and verification
echo -e "${BLUE}[6/6] Verifying deployment...${NC}"

# Show container status
echo ""
echo "Container Status:"
ssh ${PROXMOX_USER}@${PROXMOX_HOST} "pct exec ${CONTAINER_ID} -- bash -c 'cd ${APP_PATH} && docker compose -f compose.yaml ps'"
echo ""

# Wait for application to be healthy
echo -e "${YELLOW}Waiting for application health check...${NC}"
HEALTHY=false
for i in $(seq 1 $HEALTH_CHECK_RETRIES); do
    if curl -sf http://192.168.0.48:8080/health > /dev/null 2>&1; then
        HEALTHY=true
        break
    fi
    echo -n "."
    sleep $HEALTH_CHECK_INTERVAL
done
echo ""

if [ "$HEALTHY" = true ]; then
    echo -e "${GREEN}✓${NC} Application health check passed"

    # Get HTTP status
    HTTP_STATUS=$(curl -sI http://192.168.0.48:8080 | head -1)
    echo -e "${GREEN}✓${NC} HTTP Response: ${HTTP_STATUS}"
else
    echo -e "${YELLOW}⚠${NC}  Warning: Application health check timed out"
    echo "   The application may still be starting up"
    echo "   Check logs with: docker compose logs app"
fi
echo ""

echo -e "${GREEN}=================================================="
echo "✅ Deployment Complete!"
echo -e "==================================================${NC}"
echo ""
echo -e "${BLUE}Access Points:${NC}"
echo "  Local:  http://192.168.0.48:8080"
echo "  Public: http://bechdel.joekarlsson.io"
echo ""
echo -e "${BLUE}Deployment Info:${NC}"
echo "  Commit:  ${COMMIT_HASH}"
echo "  Time:    $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo "  View logs:    ssh root@192.168.0.247 'pct exec 122 -- bash -c \"cd ${APP_PATH} && docker compose logs -f app\"'"
echo "  Restart app:  ssh root@192.168.0.247 'pct exec 122 -- bash -c \"cd ${APP_PATH} && docker compose restart app\"'"
echo "  Check status: curl http://192.168.0.48:8080/health"
echo ""
