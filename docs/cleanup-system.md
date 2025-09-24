# Cleanup System Documentation

## Overview

The backend now includes a comprehensive cleanup system that automatically handles failed or stuck film script processing operations. This ensures that temporary files and resources are properly cleaned up even when processing fails.

## Features

### 1. Automatic Process Tracking

- Every script processing operation is registered with a unique ID
- The system tracks processing start time, file paths, and status
- Automatic cleanup when processes complete (success or failure)

### 2. Timeout Protection

- Processes that run longer than 5 minutes are automatically terminated
- Stuck processes are detected every 30 seconds
- Automatic cleanup of resources for timed-out processes

### 3. Error Handling

- Comprehensive error handling with automatic cleanup
- Failed processes are properly cleaned up with error logging
- Graceful handling of unexpected errors

### 4. Old File Cleanup

- Automatic cleanup of old upload files (older than 1 hour)
- Runs on server startup and periodically
- Prevents accumulation of temporary files

### 5. Graceful Shutdown

- Handles SIGINT and SIGTERM signals
- Force cleanup of all active processes on shutdown
- Ensures no orphaned files or processes

## API Endpoints

### Get Cleanup Status

```
GET /api/film/cleanup/status
```

Returns information about active processing operations.

**Response:**

```json
{
  "activeProcesses": [
    {
      "id": "process_1234567890_abc123",
      "title": "Movie Title",
      "status": "processing",
      "startTime": 1758751453765,
      "duration": 45000,
      "scriptPath": "/path/to/script.txt"
    }
  ],
  "totalActive": 1,
  "cleanupEnabled": true
}
```

### Force Cleanup

```
POST /api/film/cleanup/force
```

Forces cleanup of all active processes (emergency cleanup).

**Response:**

```json
{
  "success": true,
  "message": "Force cleanup completed successfully"
}
```

## Configuration

The cleanup system can be configured by modifying the `CleanupManager` class in `src/server/helper/cleanupManager.js`:

- `maxProcessingTime`: Maximum time for processing (default: 5 minutes)
- `cleanupCheckInterval`: How often to check for stuck processes (default: 30 seconds)

## Monitoring

The system provides comprehensive logging:

- Process registration and completion
- Timeout detection and cleanup
- Error handling and recovery
- File cleanup operations

## Benefits

1. **Prevents Resource Leaks**: Automatically cleans up temporary files
2. **Handles Failures Gracefully**: Failed processes don't leave orphaned resources
3. **Timeout Protection**: Prevents processes from running indefinitely
4. **Monitoring**: Provides visibility into active processing operations
5. **Emergency Cleanup**: Manual cleanup option for stuck processes

## Usage

The cleanup system works automatically - no manual intervention required. However, you can:

1. Monitor active processes via the status endpoint
2. Force cleanup if needed via the force cleanup endpoint
3. Check server logs for cleanup operations

## Testing

The cleanup system has been tested with:

- Process registration and completion
- Timeout detection and cleanup
- Error handling scenarios
- Old file cleanup
- Graceful shutdown handling

All tests pass successfully, confirming the system works as expected.
