# Dockge Production Deployment Guide

This guide covers deploying the Bechdel Test application using Dockge for production environments.

## Overview

Dockge is a modern Docker Compose management tool that provides a web-based interface for managing Docker Compose stacks. This deployment uses a multi-service architecture with MongoDB and the Bechdel Test application.

## Architecture

The deployment consists of three main services:

- **Dockge**: Web-based Docker Compose management interface (port 5001)
- **MongoDB**: Database service (port 27017)
- **Bechdel App**: Production application (port 8080)

## Prerequisites

- Docker and Docker Compose installed
- Git access to the repository
- API keys for external services (TheMovieDB, OMDB, Claude AI)
- Server with sufficient resources (minimum 2GB RAM, 10GB storage)

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/JoeKarlsson/bechdel-test
cd bechdel-test
```

### 2. Configure Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Required API Keys
CLAUDE_API_KEY=your_claude_api_key_here

# Optional: Force cache busting for builds
CACHE_BUST=$(date +%s)
```

### 3. Set Up Directory Structure

Ensure the following directories exist on your server:

```bash
# Create application data directory
sudo mkdir -p /opt/appdata/bechdel-test/uploads

# Set proper permissions
sudo chown -R $USER:$USER /opt/appdata/bechdel-test
```

## Deployment Process

### 1. Start Dockge Stack

```bash
# Start the complete stack including Dockge
docker compose -f docker-compose.dockge.yml up -d
```

This will start:

- Dockge web interface at `http://your-server:5001`
- MongoDB database
- Bechdel Test application at `http://your-server:8080`

### 2. Access Dockge Interface

1. Open your browser and navigate to `http://your-server:5001`
2. You'll see the Dockge dashboard with your `bechdel-test` stack
3. From here you can manage the stack, view logs, and restart services

### 3. Verify Deployment

Check that all services are running:

```bash
# Check container status
docker compose -f docker-compose.dockge.yml ps

# View application logs
docker compose -f docker-compose.dockge.yml logs app

# Test application health
curl http://localhost:8080/health
```

## Production Updates

### Updating the Application

When you need to deploy updates:

1. **Pull Latest Changes**

   ```bash
   git pull origin develop
   ```

2. **Rebuild Application**

   ```bash
   # Force rebuild without cache
   docker compose -f docker-compose.dockge.yml build --no-cache app
   ```

## Service Configuration

### MongoDB Service

- **Image**: `mongo:7.0`
- **Port**: `27017`
- **Authentication**: Username `admin`, Password `password`
- **Database**: `bechdelTest`
- **Health Check**: MongoDB ping command every 30 seconds
- **Data Persistence**: Volume `mongodb_data`

### Application Service

- **Build**: Multi-stage Docker build targeting `production`
- **Port**: `8080` (external) → `3000` (internal)
- **Environment**: Production mode with optimized settings
- **Health Check**: HTTP health endpoint every 30 seconds
- **User**: Non-root user `nextjs` for security
- **Dependencies**: Waits for MongoDB to be healthy

### Dockge Service

- **Image**: `louislam/dockge:latest`
- **Port**: `5001`
- **Console**: Enabled for debugging
- **Docker Socket**: Mounted for container management
- **Data**: Stored in `./dockge-data`

## Monitoring and Maintenance

### Health Checks

All services include health checks:

```bash
# Check service health status
docker compose -f docker-compose.dockge.yml ps

# View health check logs
docker compose -f docker-compose.dockge.yml logs --tail=50 app
```

### Log Management

```bash
# View application logs
docker compose -f docker-compose.dockge.yml logs -f app

# View MongoDB logs
docker compose -f docker-compose.dockge.yml logs -f mongodb

# View all service logs
docker compose -f docker-compose.dockge.yml logs -f
```

## Quick Reference Commands

```bash
# Start stack
docker compose -f docker-compose.dockge.yml up -d

# Stop stack
docker compose -f docker-compose.dockge.yml down

# Rebuild and restart app
docker compose -f docker-compose.dockge.yml build --no-cache app && docker compose -f docker-compose.dockge.yml restart app

# View logs
docker compose -f docker-compose.dockge.yml logs -f app

# Check status
docker compose -f docker-compose.dockge.yml ps

# Access MongoDB
docker compose -f docker-compose.dockge.yml exec mongodb mongosh --authenticationDatabase admin -u admin -p password
```
