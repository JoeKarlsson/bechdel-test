#!/bin/bash

# Bechdel Test Application - Production Test Script
# This script tests the production deployment

set -e

echo "🎬 Bechdel Test Application - Production Test"
echo "============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running"

# Test Docker build
echo "🔨 Testing Docker build..."
if docker compose -f docker-compose.dockge.yml build app; then
    echo "✅ Docker build successful"
else
    echo "❌ Docker build failed"
    exit 1
fi

# Start services
echo "🚀 Starting services..."
docker compose -f docker-compose.dockge.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 15

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

echo "✨ Production test completed successfully!"
