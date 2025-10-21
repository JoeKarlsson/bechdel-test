#!/bin/bash
# Helper script to configure GitHub Secrets for automated deployment
# This script helps you set up the required secrets in your GitHub repository

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Repository info
REPO_OWNER="JoeKarlsson"
REPO_NAME="bechdel-test"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  GitHub Secrets Setup for Automated Deployment                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}⚠️  GitHub CLI (gh) is not installed.${NC}"
    echo ""
    echo "To install GitHub CLI:"
    echo "  macOS:   brew install gh"
    echo "  Linux:   See https://cli.github.com/manual/installation"
    echo ""
    echo -e "${YELLOW}Alternatively, you can add secrets manually:${NC}"
    echo "1. Go to: https://github.com/$REPO_OWNER/$REPO_NAME/settings/secrets/actions"
    echo "2. Click 'New repository secret'"
    echo "3. Add each secret from the list below"
    echo ""
    exit 1
fi

# Check if user is logged in
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️  You're not logged into GitHub CLI${NC}"
    echo "Run: gh auth login"
    exit 1
fi

echo -e "${GREEN}✅ GitHub CLI is installed and authenticated${NC}"
echo ""

# Function to add secret
add_secret() {
    local secret_name=$1
    local secret_description=$2
    local secret_value=""

    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Setting up: ${secret_name}${NC}"
    echo -e "${YELLOW}Description: ${secret_description}${NC}"
    echo ""

    # Special handling for SSH key
    if [ "$secret_name" = "DEPLOY_SSH_KEY" ]; then
        echo "Enter the path to your SSH private key (e.g., ~/.ssh/github_deploy_key):"
        read -r key_path
        if [ -f "$key_path" ]; then
            secret_value=$(cat "$key_path")
            echo -e "${GREEN}✅ SSH key loaded from $key_path${NC}"
        else
            echo -e "${RED}❌ File not found: $key_path${NC}"
            return 1
        fi
    else
        echo "Enter value for $secret_name:"
        if [[ "$secret_name" == *"KEY"* ]] || [[ "$secret_name" == *"PASSWORD"* ]]; then
            read -rs secret_value
            echo ""
        else
            read -r secret_value
        fi
    fi

    # Add secret to GitHub
    echo -e "${YELLOW}Adding secret to GitHub...${NC}"
    if echo "$secret_value" | gh secret set "$secret_name" -R "$REPO_OWNER/$REPO_NAME"; then
        echo -e "${GREEN}✅ Successfully added $secret_name${NC}"
        echo ""
        return 0
    else
        echo -e "${RED}❌ Failed to add $secret_name${NC}"
        echo ""
        return 1
    fi
}

# Main setup
echo -e "${BLUE}We'll now configure the required GitHub Secrets for automated deployment.${NC}"
echo -e "${YELLOW}Press Enter to continue or Ctrl+C to cancel...${NC}"
read -r

# Required secrets
add_secret "DEPLOY_SSH_KEY" "SSH private key for deployment (from ~/.ssh/github_deploy_key)"
add_secret "DEPLOY_SSH_HOST" "Proxmox server IP address (e.g., 192.168.0.247)"
add_secret "DEPLOY_SSH_USER" "SSH username (e.g., root)"
add_secret "DEPLOY_SSH_PORT" "SSH port (usually 22)"
add_secret "DEPLOY_PATH" "Deployment directory path (e.g., /opt/bechdel-test)"
add_secret "CLAUDE_API_KEY" "Claude API key from Anthropic"

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Setup Complete!                                               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✅ All secrets have been configured!${NC}"
echo ""
echo "Next steps:"
echo "1. Verify secrets at: https://github.com/$REPO_OWNER/$REPO_NAME/settings/secrets/actions"
echo "2. Push to develop or main branch to trigger deployment"
echo "3. Monitor deployment at: https://github.com/$REPO_OWNER/$REPO_NAME/actions"
echo ""
echo -e "${YELLOW}Test deployment:${NC}"
echo "  git add ."
echo "  git commit -m 'test: automated deployment'"
echo "  git push origin develop"
echo ""
