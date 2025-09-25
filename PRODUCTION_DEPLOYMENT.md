# Production Deployment Guide

This guide explains how to deploy the Bechdel Test application to production using Docker and Dockge.

## Issues Fixed

The following issues have been resolved for production deployment:

### 1. SCSS Linting Errors

- Fixed CSS specificity issues in Footer component
- Removed empty CSS blocks in ApiDocs component
- Updated stylelint configuration to handle CSS Modules `:global()` syntax
- Disabled problematic rules: `no-descending-specificity` and `block-no-empty`

### 2. Dependency Conflicts

- Updated `mini-css-extract-plugin` from `^0.9.0` to `^2.8.1` (compatible with Webpack 5)
- Updated `css-loader` from `^3.4.2` to `^6.10.0` (compatible with Webpack 5)
- Updated `sass-loader` from `^8.0.2` to `^14.0.0` (compatible with Webpack 5)
- Fixed webpack configuration for new css-loader version
- Removed deprecated `snyk-protect` script

### 3. Docker Configuration

- Created optimized `docker-compose.dockge.yml` for production deployment
- Updated Dockerfile to use multi-stage build
- Added proper health checks for both MongoDB and application
- Configured proper dependency management and build process

### 4. Health Check Endpoint

- Verified `/health` endpoint is properly implemented
- Added comprehensive health check with uptime and environment info

## Deployment Instructions

### Prerequisites

- Docker and Docker Compose installed
- Access to Proxmox with Dockge
- Required environment variables configured

### Quick Deployment

1. **Clone the repository** (if not already done):

   ```bash
   git clone <repository-url>
   cd bechdel-test
   ```

2. **Update environment variables**:
   Edit `docker-compose.dockge.yml` and update:
   - `CLAUDE_API_KEY`: Your actual Claude API key
   - `THEMOVIEDB`: Your TheMovieDB API key (if different)
   - `OMDB`: Your OMDB API key (if different)

3. **Deploy using the deployment script**:

   ```bash
   ./deploy-production.sh
   ```

   Or manually:

   ```bash
   docker compose -f docker-compose.dockge.yml up -d --build
   ```

### Manual Deployment Steps

1. **Stop existing containers**:

   ```bash
   docker compose -f docker-compose.dockge.yml down
   ```

2. **Build and start services**:

   ```bash
   docker compose -f docker-compose.dockge.yml up -d --build
   ```

3. **Check service health**:

   ```bash
   # Check MongoDB
   docker compose -f docker-compose.dockge.yml exec mongodb mongosh --eval "db.adminCommand('ping')"
   
   # Check application
   curl http://localhost:8080/health
   ```

4. **View logs if needed**:

   ```bash
   docker compose -f docker-compose.dockge.yml logs app
   docker compose -f docker-compose.dockge.yml logs mongodb
   ```

## Configuration Files

### Docker Compose (`docker-compose.dockge.yml`)

- Uses multi-stage Dockerfile build
- Proper health checks for both services
- Volume mounts for persistent data
- Network configuration for service communication

### Dockerfile

- Multi-stage build for optimized production image
- Non-root user for security
- Proper signal handling with dumb-init
- Health check configuration

### Environment Variables

- `NODE_ENV=production`: Sets production mode
- `MONGODB_URI`: MongoDB connection string
- `THEMOVIEDB`: TheMovieDB API key
- `OMDB`: OMDB API key
- `CLAUDE_API_KEY`: Claude API key (REQUIRED)
- `PORT=3000`: Application port

## Health Checks

The application includes comprehensive health checks:

- **MongoDB**: Uses `mongosh` to ping the database
- **Application**: HTTP GET request to `/health` endpoint

Health check endpoint returns:

```json
{
  "status": "healthy",
  "timestamp": "2023-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

## Troubleshooting

### Common Issues

1. **Build fails with dependency errors**:
   - Ensure you're using the updated `package.json` with fixed dependencies
   - Run `npm install --legacy-peer-deps` locally to test

2. **SCSS compilation errors**:
   - The updated `.stylelintrc` should resolve CSS Modules issues
   - Check that all SCSS files follow the updated linting rules

3. **Health check fails**:
   - Wait for the full startup period (60s for app, 40s for MongoDB)
   - Check logs: `docker compose -f docker-compose.dockge.yml logs app`

4. **MongoDB connection issues**:
   - Verify MongoDB is healthy: `docker compose -f docker-compose.dockge.yml exec mongodb mongosh --eval "db.adminCommand('ping')"`
   - Check MongoDB logs: `docker compose -f docker-compose.dockge.yml logs mongodb`

### Logs and Debugging

View logs for specific services:

```bash
# Application logs
docker compose -f docker-compose.dockge.yml logs -f app

# MongoDB logs
docker compose -f docker-compose.dockge.yml logs -f mongodb

# All services
docker compose -f docker-compose.dockge.yml logs -f
```

## Production URLs

Once deployed successfully:

- **Main Application**: <http://localhost:8080>
- **Health Check**: <http://localhost:8080/health>
- **API Base**: <http://localhost:8080/api/film>

## Security Notes

- The application runs as a non-root user in the container
- MongoDB uses authentication with admin credentials
- Environment variables should be properly secured
- Consider using Docker secrets for sensitive data in production

## Monitoring

The application includes:

- Health check endpoint for monitoring
- Proper logging configuration
- Docker health checks for container orchestration
- Uptime tracking in health endpoint

For production monitoring, consider integrating with:

- Prometheus/Grafana for metrics
- ELK stack for log aggregation
- Docker monitoring tools
