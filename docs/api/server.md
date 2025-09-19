# Server Check API Documentation

This document describes the server check endpoints that provide health monitoring and system status information.

## Base URL

```
http://localhost:5000/api/server
```

## Endpoints

### 1. Health Check

**GET** `/health`

Basic health check endpoint that returns server status.

**Response:**
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "status": "healthy",
    "uptime": 3600,
    "environment": "development",
    "version": "v18.17.0",
    "database": {
      "status": "connected",
      "name": "CRM_Database"
    }
  }
}
```

### 2. Ping

**GET** `/ping`

Simple ping endpoint for connectivity testing.

**Response:**
```json
{
  "success": true,
  "message": "Server is responding",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "message": "pong",
    "uptime": 3600,
    "environment": "development"
  }
}
```

### 3. Server Status

**GET** `/status`

Comprehensive server status check including system information.

**Response:**
```json
{
  "success": true,
  "message": "Server status retrieved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "server": {
      "status": "running",
      "uptime": {
        "seconds": 3600,
        "formatted": "1h 0m 0s"
      },
      "environment": "development",
      "nodeVersion": "v18.17.0",
      "platform": "win32",
      "arch": "x64"
    },
    "database": {
      "status": "connected",
      "name": "CRM_Database",
      "host": "localhost",
      "port": 27017
    },
    "system": {
      "cpu": {
        "cores": 8,
        "model": "Intel(R) Core(TM) i7-9700K CPU @ 3.60GHz",
        "loadAverage": [1.5, 1.2, 0.8]
      },
      "memory": {
        "total": 17179869184,
        "free": 8589934592,
        "used": 8589934592,
        "usagePercentage": "50.00"
      },
      "uptime": {
        "seconds": 86400,
        "formatted": "1d 0h 0m 0s"
      }
    },
    "process": {
      "pid": 1234,
      "memoryUsage": {
        "rss": 52428800,
        "heapTotal": 20971520,
        "heapUsed": 10485760,
        "external": 5242880
      },
      "platform": "win32",
      "nodeVersion": "v18.17.0"
    },
    "api": {
      "endpoints": [
        "/health",
        "/api/status",
        "/api/auth",
        "/api/admin",
        "/api/company",
        "/api/client",
        "/api/project",
        "/api/employee",
        "/api/task"
      ]
    }
  }
}
```

### 4. Database Test

**GET** `/database`

Database connection status check.

**Response:**
```json
{
  "success": true,
  "message": "Database connection is healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "connected": true,
    "readyState": 1,
    "readyStateDescription": "connected",
    "name": "CRM_Database",
    "host": "localhost",
    "port": 27017
  }
}
```

**Error Response (Database Disconnected):**
```json
{
  "success": false,
  "message": "Database connection failed",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "errors": {
    "connected": false,
    "readyState": 0,
    "readyStateDescription": "disconnected",
    "name": "CRM_Database",
    "host": "localhost",
    "port": 27017
  }
}
```

### 5. System Resources

**GET** `/resources`

Detailed system resources information including CPU and memory usage.

**Response:**
```json
{
  "success": true,
  "message": "System resources retrieved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "cpu": {
      "cores": 8,
      "model": "Intel(R) Core(TM) i7-9700K CPU @ 3.60GHz",
      "loadAverage": [1.5, 1.2, 0.8],
      "usage": {
        "idle": 8000000,
        "total": 16000000,
        "percentage": "50.00"
      }
    },
    "memory": {
      "total": 17179869184,
      "free": 8589934592,
      "used": 8589934592,
      "usagePercentage": "50.00",
      "formatted": {
        "total": "16 GB",
        "free": "8 GB",
        "used": "8 GB"
      }
    },
    "process": {
      "memoryUsage": {
        "rss": 52428800,
        "heapTotal": 20971520,
        "heapUsed": 10485760,
        "external": 5242880
      },
      "formattedMemoryUsage": {
        "rss": "50 MB",
        "heapTotal": "20 MB",
        "heapUsed": "10 MB",
        "external": "5 MB"
      }
    }
  }
}
```

## Error Responses

All endpoints may return the following error responses:

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 503 Service Unavailable (Database Disconnected)
```json
{
  "success": false,
  "message": "Database connection failed",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "errors": {
    // Database status details
  }
}
```

## Usage Examples

### Basic Health Check
```bash
curl http://localhost:5000/api/server/health
```

### Ping Test
```bash
curl http://localhost:5000/api/server/ping
```

### Full Server Status
```bash
curl http://localhost:5000/api/server/status
```

### Database Connection Test
```bash
curl http://localhost:5000/api/server/database
```

### System Resources
```bash
curl http://localhost:5000/api/server/resources
```

## Monitoring Integration

These endpoints can be used with monitoring tools like:

- **Uptime Robot**: Use `/ping` for basic uptime monitoring
- **New Relic**: Use `/status` for detailed health monitoring
- **Datadog**: Use `/resources` for system metrics
- **Prometheus**: Use `/status` for application metrics

## Health Check Thresholds

For automated monitoring, consider these thresholds:

- **Memory Usage**: < 90%
- **CPU Usage**: < 80%
- **Database Connection**: Must be connected
- **Response Time**: < 1000ms
