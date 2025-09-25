#!/bin/bash

# Test Production Build Script
# This script tests that the production build works without dev dependencies

set -e

echo "🧪 Testing Production Build"
echo "============================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running"

# Test the build stage
echo "🔨 Testing build stage..."
if docker build --target build -t bechdel-test-build . > /dev/null 2>&1; then
    echo "✅ Build stage successful"
else
    echo "❌ Build stage failed"
    echo "📋 Build logs:"
    docker build --target build -t bechdel-test-build .
    exit 1
fi

# Test the production stage
echo "🏭 Testing production stage..."
if docker build --target production -t bechdel-test-prod . > /dev/null 2>&1; then
    echo "✅ Production stage successful"
else
    echo "❌ Production stage failed"
    echo "📋 Production build logs:"
    docker build --target production -t bechdel-test-prod .
    exit 1
fi

# Test that production image doesn't have dev dependencies
echo "🔍 Checking production dependencies..."
if docker run --rm bechdel-test-prod npm list --depth=0 --only=dev 2>/dev/null | grep -q "empty"; then
    echo "✅ No dev dependencies in production image"
else
    echo "❌ Dev dependencies found in production image"
    echo "📋 Dev dependencies:"
    docker run --rm bechdel-test-prod npm list --depth=0 --only=dev
    exit 1
fi

# Test that production image has the built files
echo "📁 Checking built files..."
if docker run --rm bechdel-test-prod ls -la dist/ > /dev/null 2>&1; then
    echo "✅ Built files present in production image"
else
    echo "❌ Built files missing from production image"
    exit 1
fi

# Clean up test images
echo "🧹 Cleaning up test images..."
docker rmi bechdel-test-build bechdel-test-prod > /dev/null 2>&1 || true

echo ""
echo "🎉 Production build test completed successfully!"
echo "✅ Build stage works with dev dependencies"
echo "✅ Production stage works with only production dependencies"
echo "✅ No dev dependencies in final production image"
echo "✅ Built files are present in production image"
