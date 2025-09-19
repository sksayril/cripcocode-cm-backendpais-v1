# 🚀 CRM API Documentation

Welcome to the **CRIPCOCODE CRM API** documentation. This API provides comprehensive company and admin management capabilities with role-based access control.

## 📋 **Table of Contents**

- [Authentication & Authorization](#authentication--authorization)
- [API Endpoints Overview](#api-endpoints-overview)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Getting Started](#getting-started)

## 🔐 **Authentication & Authorization**

### **User Roles & Permissions**

| Role | Description | Permissions |
|------|-------------|-------------|
| **superAdmin** | System administrator | Full access to all features |
| **CompanyAdmin** | Company administrator | Manage company, admins, and users |
| **manager** | Department manager | Manage users and projects |
| **sales** | Sales representative | View reports and manage leads |
| **support** | Support staff | View reports and manage tickets |

### **JWT Token Structure**

```json
{
  "userId": "admin_id",
  "username": "admin_username",
  "email": "admin@company.com",
  "role": "CompanyAdmin",
  "company": "company_id",
  "permissions": {
    "canManageUsers": true,
    "canManageAdmins": true,
    "canManageCompany": true,
    "canViewReports": true,
    "canManageProjects": true,
    "canManageBilling": true
  },
  "iat": 1234567890,
  "exp": 1234654290
}
```

## 🌐 **API Endpoints Overview**

### **Base URL**
```
Production: https://api.cripcocode.com
Development: http://localhost:5000
```

### **API Groups**

| Group | Base Path | Description | Access Level |
|-------|-----------|-------------|--------------|
| **Authentication** | `/api/auth` | Login, logout, user management | Public/Protected |
| **Company Management** | `/api/company` | Company CRUD operations | Super Admin Only |
| **Admin Management** | `/api/admin` | Admin user management | Super Admin/Company Admin |
| **Client Management** | `/api/client` | Client authentication and management | Public/Admin/Client |
| **Project Management** | `/api/project` | Project creation and management | Admin/Client |
| **Employee Management** | `/api/employee` | Employee management and authentication | Admin/Employee |
| **Task Management** | `/api/task` | Task creation, assignment, and tracking | Admin/Employee |

## 📊 **Response Format**

### **Success Response**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### **Error Response**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required",
      "value": ""
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/auth/login",
  "method": "POST"
}
```

### **Pagination Response**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "limit": 10
    }
  }
}
```

## ❌ **Error Handling**

### **HTTP Status Codes**

| Code | Description | Usage |
|------|-------------|-------|
| `200` | OK | Successful GET, PUT, DELETE operations |
| `201` | Created | Successful POST operations |
| `400` | Bad Request | Validation errors, missing fields |
| `401` | Unauthorized | Invalid or missing authentication |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate data, resource conflicts |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server-side errors |

### **Error Types**

- **ValidationError**: Invalid input data
- **AuthenticationError**: Authentication failed
- **AuthorizationError**: Insufficient permissions
- **NotFoundError**: Resource not found
- **ConflictError**: Resource conflicts
- **DatabaseError**: Database operation failed

## 🚦 **Rate Limiting**

- **Rate Limit**: 100 requests per 15 minutes per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Response**: 429 status with retry-after header

## 🚀 **Getting Started**

### **1. Authentication**
```bash
# Login to get JWT token
POST /api/auth/login
{
  "email": "admin@company.com",
  "password": "password123"
}
```

### **2. Use Token**
```bash
# Include token in Authorization header
Authorization: Bearer <your_jwt_token>
```

### **3. Make API Calls**
```bash
# Example: Get company list
GET /api/company/list
Authorization: Bearer <your_jwt_token>
```

## 📚 **Detailed Documentation**

- [Authentication APIs](./auth.md) - Login, logout, user management
- [Company Management APIs](./company.md) - Company CRUD operations
- [Admin Management APIs](./admin.md) - Admin user management
- [Client Management APIs](./client.md) - Client authentication, registration, and management
- [Project Management APIs](./project.md) - Project creation, management, and detailed operations
- [Employee Management APIs](./employee.md) - Employee management, authentication, and project assignments
- [Task Management APIs](./task.md) - Task creation, assignment, time tracking, and progress management

## 🔧 **Development & Testing**

### **Environment Variables**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crm_db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
```

### **Testing Tools**
- **Postman Collection**: Available in `/postman` folder
- **Insomnia**: Import from `/insomnia` folder
- **cURL Examples**: Provided in each API documentation

## 📞 **Support & Contact**

- **Email**: support@cripcocode.com
- **Documentation**: https://docs.cripcocode.com
- **GitHub**: https://github.com/cripcocode/crm-api

---

**Built with ❤️ by CripcoCode Team**
