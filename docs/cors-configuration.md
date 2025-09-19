# 🌐 CORS Configuration Documentation

## Overview
This document explains the Cross-Origin Resource Sharing (CORS) configuration for the CRM API project.

## 🔧 Configuration

### Environment Variables
Add these to your `.env` file:

```env
# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173,https://yourdomain.com
CORS_CREDENTIALS=true
```

### Default Allowed Origins
- `http://localhost:3000` - React development server
- `http://localhost:3001` - Alternative React port
- `http://localhost:5173` - Vite development server
- `https://8gl8skhl-3500.inc1.devtunnels.ms` - DevTunnels URL

## 🛡️ Security Features

### 1. Origin Validation
- Dynamic origin checking function
- Only allows requests from specified origins
- Logs blocked origins for debugging

### 2. Credentials Support
- Enables cookies and authorization headers
- Required for JWT token authentication
- Secure credential handling

### 3. Method Support
- GET, POST, PUT, DELETE, PATCH, OPTIONS
- Preflight request handling
- 24-hour preflight cache

### 4. Header Management
**Allowed Headers:**
- `Origin`
- `X-Requested-With`
- `Content-Type`
- `Accept`
- `Authorization`
- `Cache-Control`
- `Pragma`
- `X-CSRF-Token`
- `X-API-Key`

**Exposed Headers:**
- `X-Total-Count`
- `X-Page-Count`
- `X-Current-Page`
- `X-Per-Page`

## 🚀 Usage Examples

### Frontend JavaScript
```javascript
// Basic fetch request
fetch('https://your-api.com/api/task/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  credentials: 'include', // Important for CORS with credentials
  body: JSON.stringify({
    title: 'New Task',
    description: 'Task description'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('CORS Error:', error));
```

### Axios Configuration
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-api.com/api',
  withCredentials: true, // Important for CORS
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### React Hook Example
```javascript
import { useState, useEffect } from 'react';

const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url, {
          credentials: 'include',
          ...options
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};
```

## 🔍 Error Handling

### CORS Error Response
```json
{
  "success": false,
  "message": "CORS Error: Origin not allowed",
  "error": {
    "origin": "https://blocked-domain.com",
    "allowedOrigins": [
      "http://localhost:3000",
      "https://yourdomain.com"
    ]
  },
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### Common CORS Issues

1. **Missing Credentials**
   ```javascript
   // ❌ Wrong
   fetch(url, { method: 'POST' });
   
   // ✅ Correct
   fetch(url, { 
     method: 'POST', 
     credentials: 'include' 
   });
   ```

2. **Wrong Origin**
   ```javascript
   // Check if your domain is in ALLOWED_ORIGINS
   console.log('Current origin:', window.location.origin);
   ```

3. **Missing Headers**
   ```javascript
   // ❌ Missing Content-Type
   fetch(url, { 
     method: 'POST',
     body: JSON.stringify(data)
   });
   
   // ✅ Include Content-Type
   fetch(url, { 
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(data)
   });
   ```

## 🛠️ Development Setup

### Local Development
1. Start your frontend on an allowed port (3000, 3001, 5173)
2. Ensure your API server is running
3. Make requests with proper headers and credentials

### Production Setup
1. Update `ALLOWED_ORIGINS` with your production domains
2. Ensure HTTPS is used in production
3. Test CORS with your production frontend

### Testing CORS
```bash
# Test preflight request
curl -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  https://your-api.com/api/task/create

# Test actual request
curl -X POST \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{"title":"Test Task"}' \
  https://your-api.com/api/task/create
```

## 🔒 Security Best Practices

1. **Never use wildcard (*) in production**
2. **Always specify exact origins**
3. **Use HTTPS in production**
4. **Regularly review allowed origins**
5. **Monitor CORS error logs**
6. **Use environment variables for configuration**

## 📝 Troubleshooting

### Check CORS Configuration
```javascript
// Add this to your frontend to debug CORS
console.log('Current origin:', window.location.origin);
console.log('API base URL:', process.env.REACT_APP_API_URL);
```

### Server Logs
Check server logs for CORS-related messages:
```
CORS blocked origin: https://unauthorized-domain.com
```

### Browser DevTools
1. Open Network tab
2. Look for failed requests with CORS errors
3. Check response headers for CORS headers
4. Verify preflight requests (OPTIONS)

## 🔄 Updates and Maintenance

### Adding New Origins
1. Update `ALLOWED_ORIGINS` in environment variables
2. Restart the server
3. Test the new origin

### Removing Origins
1. Remove from `ALLOWED_ORIGINS`
2. Restart the server
3. Verify old origins are blocked

### Monitoring
- Monitor server logs for CORS errors
- Set up alerts for blocked origins
- Regular security reviews of allowed origins
