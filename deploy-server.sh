#!/bin/bash
# Server-side deployment script for Bechdel Test application
# This script can be run manually or triggered by CI/CD

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/JoeKarlsson/bechdel-test.git"
DEPLOY_DIR="${DEPLOY_DIR:-/opt/bechdel-test}"
BRANCH="${DEPLOY_BRANCH:-develop}"
COMPOSE_FILE="docker-compose.dockge.yml"

echo -e "${GREEN}🚀 Starting Bechdel Test Deployment${NC}"
echo "================================================"
echo "Deploy Directory: $DEPLOY_DIR"
echo "Branch: $BRANCH"
echo "================================================"

# Function to check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
        exit 1
    fi

    if ! command -v docker compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Docker and Docker Compose are installed${NC}"
}

# Function to setup deployment directory
setup_directory() {
    if [ ! -d "$DEPLOY_DIR" ]; then
        echo -e "${YELLOW}📁 Creating deployment directory: $DEPLOY_DIR${NC}"
        mkdir -p "$DEPLOY_DIR"
    fi

    cd "$DEPLOY_DIR"

    if [ ! -d ".git" ]; then
        echo -e "${YELLOW}📥 Cloning repository...${NC}"
        git clone "$REPO_URL" .
        git checkout "$BRANCH"
    else
        echo -e "${YELLOW}🔄 Updating repository...${NC}"
        git fetch origin
        git checkout "$BRANCH"
        git pull origin "$BRANCH"
    fi
}

# Function to setup environment variables
setup_env() {
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}⚙️  Creating .env file...${NC}"
        cat > .env << 'EOF'
# API Keys
CLAUDE_API_KEY=your_claude_api_key_here

# Cache busting
CACHE_BUST=$(date +%s)

# Image configuration (optional - for pulling from registry)
# IMAGE_TAG=ghcr.io/joekarlsson/bechdel-test:develop
EOF
        echo -e "${YELLOW}⚠️  Please edit .env file and add your API keys!${NC}"
        echo -e "${YELLOW}   Location: $DEPLOY_DIR/.env${NC}"
    else
        echo -e "${GREEN}✅ .env file already exists${NC}"
    fi
}

# Function to create required directories
setup_directories() {
    echo -e "${YELLOW}📂 Setting up required directories...${NC}"
    mkdir -p uploads
    mkdir -p dockge-data
    chmod -R 755 uploads
    echo -e "${GREEN}✅ Directories created${NC}"
}

# Function to pull or build image
deploy_application() {
    echo -e "${YELLOW}🐳 Deploying application...${NC}"

    # Check if IMAGE_TAG is set in .env
    if grep -q "^IMAGE_TAG=" .env && ! grep -q "^IMAGE_TAG=$" .env && ! grep -q "^#IMAGE_TAG=" .env; then
        echo -e "${GREEN}📥 Pulling pre-built image from registry...${NC}"
        docker compose -f "$COMPOSE_FILE" pull app
    else
        echo -e "${YELLOW}🔨 Building image locally (this may take a few minutes)...${NC}"
        docker compose -f "$COMPOSE_FILE" build --no-cache app
    fi

    echo -e "${GREEN}🚀 Starting services...${NC}"
    docker compose -f "$COMPOSE_FILE" up -d

    echo -e "${GREEN}✅ Application deployed!${NC}"
}

# Function to show service status
show_status() {
    echo ""
    echo -e "${GREEN}📊 Service Status:${NC}"
    docker compose -f "$COMPOSE_FILE" ps
    echo ""
    echo -e "${GREEN}📝 Recent logs (last 20 lines):${NC}"
    docker compose -f "$COMPOSE_FILE" logs --tail=20 app
}

# Function to show next steps
show_next_steps() {
    echo ""
    echo "================================================"
    echo -e "${GREEN}✅ Deployment Complete!${NC}"
    echo "================================================"
    echo ""
    echo "Access your application:"
    echo "  🌐 Application: http://$(hostname -I | awk '{print $1}'):8080"
    echo "  🐳 Dockge UI:   http://$(hostname -I | awk '{print $1}'):5001"
    echo ""
    echo "Useful commands:"
    echo "  View logs:      docker compose -f $COMPOSE_FILE logs -f app"
    echo "  Restart app:    docker compose -f $COMPOSE_FILE restart app"
    echo "  Stop all:       docker compose -f $COMPOSE_FILE down"
    echo "  Rebuild:        docker compose -f $COMPOSE_FILE build --no-cache app && docker compose -f $COMPOSE_FILE up -d"
    echo ""
    echo "To enable automated deployments:"
    echo "  1. Add deployment SSH key to GitHub Secrets"
    echo "  2. Configure secrets in GitHub repository settings"
    echo "  3. Push to $BRANCH branch to trigger auto-deploy"
    echo ""
}

# Main deployment flow
main() {
    check_docker
    setup_directory
    setup_env
    setup_directories
    deploy_application
    show_status
    show_next_steps
}

# Run main function
main
