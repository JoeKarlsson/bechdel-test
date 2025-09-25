#!/bin/bash

# Bechdel Test Application - Dockge Quick Start Script
# This script helps set up the application for Dockge deployment

set -e

echo "🎬 Bechdel Test Application - Dockge Setup"
echo "=========================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running"

# Check if required files exist
required_files=("Dockerfile" "docker-compose.dockge.yml" "mongo-init.js" "package.json")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Required file $file not found"
        exit 1
    fi
done

echo "✅ All required files found"

# Create uploads directory if it doesn't exist
if [ ! -d "uploads" ]; then
    mkdir -p uploads
    echo "✅ Created uploads directory"
fi

# Test Docker build
echo "🔨 Testing Docker build..."
if docker compose -f docker-compose.dockge.yml build app; then
    echo "✅ Docker build successful"
else
    echo "❌ Docker build failed"
    exit 1
fi

# Test application startup
echo "🚀 Testing application startup..."
docker compose -f docker-compose.dockge.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check health endpoint
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Application is healthy and running"
    echo ""
    echo "🎉 Setup complete! Your application is ready for Dockge deployment."
    echo ""
    echo "📋 Next steps:"
    echo "1. Open your Dockge interface"
    echo "2. Create a new stack named 'bechdel-test'"
    echo "3. Copy the contents of 'docker-compose.dockge.yml' into the compose editor"
    echo "4. Deploy the stack"
    echo ""
    echo "🌐 Application will be available at: http://your-server:8080"
    echo "🏥 Health check: http://your-server:8080/health"
else
    echo "❌ Application health check failed"
    echo "📋 Check logs with: docker compose -f docker-compose.dockge.yml logs"
    exit 1
fi

# Cleanup test containers
echo "🧹 Cleaning up test containers..."
docker compose -f docker-compose.dockge.yml down

echo "✨ Ready for Dockge deployment!"
