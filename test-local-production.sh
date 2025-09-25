#!/bin/bash

# Test Local Production Build
# This script tests the production build running locally

set -e

echo "🧪 Testing Local Production Build"
echo "================================="

# Check if the app is running
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ App is running and responding to health checks"
    
    # Get health status
    echo "📊 Health Status:"
    curl -s http://localhost:8080/health | jq '.' 2>/dev/null || curl -s http://localhost:8080/health
    echo ""
    
    # Test main page
    echo "🌐 Testing main page..."
    if curl -s -I http://localhost:8080/ | grep -q "200 OK"; then
        echo "✅ Main page loads successfully"
    else
        echo "❌ Main page failed to load"
        exit 1
    fi
    
    # Test API endpoint
    echo "🔌 Testing API endpoint..."
    if curl -s -I http://localhost:8080/api/status | grep -q "200 OK"; then
        echo "✅ API endpoint responds correctly"
    else
        echo "❌ API endpoint failed"
        exit 1
    fi
    
    echo ""
    echo "🎉 All tests passed! Your production build is working perfectly!"
    echo "📍 App is accessible at: http://localhost:8080"
    echo "🔍 Health check: http://localhost:8080/health"
    
else
    echo "❌ App is not running or not responding"
    echo "💡 Make sure to start the app with: docker compose up -d"
    exit 1
fi
