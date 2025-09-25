#!/bin/bash

# Bechdel Test Application - Production Deployment Script
# This script deploys the application using Docker Compose

set -e

echo "🎬 Bechdel Test Application - Production Deployment"
echo "=================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running"

# Check if required files exist
if [ ! -f "docker-compose.dockge.yml" ]; then
    echo "❌ docker-compose.dockge.yml not found"
    exit 1
fi

if [ ! -f "Dockerfile" ]; then
    echo "❌ Dockerfile not found"
    exit 1
fi

echo "✅ Required files found"

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker compose -f docker-compose.dockge.yml down || true

# Build and start services
echo "🔨 Building and starting services..."
docker compose -f docker-compose.dockge.yml up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check MongoDB health
echo "🔍 Checking MongoDB health..."
if docker compose -f docker-compose.dockge.yml exec mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB is healthy"
else
    echo "❌ MongoDB health check failed"
    docker compose -f docker-compose.dockge.yml logs mongodb
    exit 1
fi

# Check application health
echo "🔍 Checking application health..."
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Application is healthy and running"
    echo ""
    echo "🎉 Production deployment successful!"
    echo ""
    echo "📋 Application Details:"
    echo "🌐 Main Application: http://localhost:8080"
    echo "🏥 Health Check: http://localhost:8080/health"
    echo "📊 API Base: http://localhost:8080/api/film"
    echo ""
    echo "📋 Container Status:"
    docker compose -f docker-compose.dockge.yml ps
else
    echo "❌ Application health check failed"
    echo "📋 Application logs:"
    docker compose -f docker-compose.dockge.yml logs app
    exit 1
fi

echo "✨ Production deployment completed successfully!"
