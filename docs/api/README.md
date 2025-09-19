# 🌐 API Reference

## 📚 **API Overview**

The **CRIPCOCODE CRM API** provides a comprehensive set of endpoints for managing all aspects of the CRM system. The API follows RESTful principles and uses JSON for data exchange.

## 🔗 **Base URL**

```
Development: http://localhost:5000/api
Production: https://api.cripcocode.com/api
```

## 🔐 **Authentication**

All protected endpoints require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

### **Token Format**
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
  }
}
```

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

## 🌍 **API Endpoints**

### **🔐 Authentication APIs**
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `POST` | `/auth/signup` | User registration | Public |
| `POST` | `/auth/login` | General login | Public |
| `POST` | `/auth/superAdmin/login` | Super-admin login | Public |
| `POST` | `/auth/admin/login` | Admin login | Public |
| `POST` | `/auth/logout` | General logout | Authenticated |
| `POST` | `/auth/superAdmin/logout` | Super-admin logout | Super-admin |
| `POST` | `/auth/admin/logout` | Admin logout | Admin+ |

### **🏢 Company Management APIs**
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `POST` | `/company/create` | Create new company | Super-admin |
| `GET` | `/company/list` | List all companies | Super-admin |
| `GET` | `/company/:id` | Get company details | Super-admin |
| `PUT` | `/company/:id` | Update company | Super-admin |
| `POST` | `/company/:id/update` | Update company (POST) | Super-admin |
| `DELETE` | `/company/:id` | Delete company | Super-admin |
| `POST` | `/company/:id/delete` | Delete company (POST) | Super-admin |

### **👨‍💼 Admin Management APIs**
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `POST` | `/admin/create` | Create new admin | Super-admin/Company-admin |
| `GET` | `/admin/list` | List all admins | Super-admin/Company-admin |
| `GET` | `/admin/:id` | Get admin details | Super-admin/Company-admin |
| `PUT` | `/admin/:id` | Update admin | Super-admin/Company-admin |
| `POST` | `/admin/:id/update` | Update admin (POST) | Super-admin/Company-admin |
| `PUT` | `/admin/:id/password` | Update password | Super-admin/Company-admin |
| `DELETE` | `/admin/:id` | Soft delete admin | Super-admin/Company-admin |
| `POST` | `/admin/:id/delete` | Soft delete (POST) | Super-admin/Company-admin |
| `DELETE` | `/admin/:id/permanent` | Hard delete admin | Super-admin |
| `POST` | `/admin/:id/delete/permanent` | Hard delete (POST) | Super-admin |
| `PUT` | `/admin/:id/reactivate` | Reactivate admin | Super-admin/Company-admin |
| `POST` | `/admin/:id/reactivate` | Reactivate (POST) | Super-admin/Company-admin |
| `GET` | `/admin/stats/overview` | Admin statistics | Super-admin/Company-admin |

### **👥 Client Management APIs**
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `POST` | `/client/register` | Client registration | Public |
| `POST` | `/client/login` | Client login | Public |
| `GET` | `/client/list` | List all clients | Admin+ |
| `GET` | `/client/:id` | Get client details | Admin+ |
| `PUT` | `/client/:id` | Update client | Admin+ |
| `POST` | `/client/:id/update` | Update client (POST) | Admin+ |
| `DELETE` | `/client/:id` | Delete client | Admin+ |
| `POST` | `/client/:id/delete` | Delete client (POST) | Admin+ |
| `GET` | `/client/stats/overview` | Client statistics | Admin+ |

### **📋 Project Management APIs**
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `POST` | `/project/create` | Create new project | Admin+ |
| `GET` | `/project/list` | List all projects | Admin+ |
| `GET` | `/project/:id` | Get project details | Admin+ |
| `PUT` | `/project/:id` | Update project | Admin+ |
| `POST` | `/project/:id/update` | Update project (POST) | Admin+ |
| `DELETE` | `/project/:id` | Delete project | Admin+ |
| `POST` | `/project/:id/delete` | Delete project (POST) | Admin+ |
| `POST` | `/project/:id/phases` | Add project phase | Admin+ |
| `PUT` | `/project/:id/phases/:phaseId` | Update project phase | Admin+ |
| `DELETE` | `/project/:id/phases/:phaseId` | Delete project phase | Admin+ |
| `GET` | `/project/stats/overview` | Project statistics | Admin+ |

### **👨‍💼 Employee Management APIs**
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `POST` | `/employee/create` | Create new employee | Admin+ |
| `GET` | `/employee/list` | List all employees | Admin+ |
| `GET` | `/employee/:id` | Get employee details | Admin+ |
| `PUT` | `/employee/:id` | Update employee | Admin+ |
| `POST` | `/employee/:id/update` | Update employee (POST) | Admin+ |
| `DELETE` | `/employee/:id` | Delete employee | Admin+ |
| `POST` | `/employee/:id/delete` | Delete employee (POST) | Admin+ |
| `POST` | `/employee/:id/assign-project` | Assign project to employee | Admin+ |
| `POST` | `/employee/:id/remove-project` | Remove project from employee | Admin+ |
| `GET` | `/employee/stats/overview` | Employee statistics | Admin+ |

### **✅ Task Management APIs**
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `POST` | `/task/create` | Create new task | Admin+ |
| `GET` | `/task/list` | List all tasks | Admin+ |
| `GET` | `/task/:id` | Get task details | Admin+ |
| `PUT` | `/task/:id` | Update task | Admin+ |
| `POST` | `/task/:id/update` | Update task (POST) | Admin+ |
| `DELETE` | `/task/:id` | Delete task | Admin+ |
| `POST` | `/task/:id/delete` | Delete task (POST) | Admin+ |
| `POST` | `/task/:id/assign` | Assign task to employee | Admin+ |
| `POST` | `/task/:id/start` | Start task execution | Employee+ |
| `POST` | `/task/:id/complete` | Mark task as complete | Employee+ |
| `POST` | `/task/:id/time-entry` | Add time entry | Employee+ |
| `GET` | `/task/stats/overview` | Task statistics | Admin+ |

## 📝 **Request Examples**

### **Create Admin**
```bash
curl -X POST http://localhost:5000/api/admin/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "fullname": "John Doe",
    "username": "johndoe",
    "email": "john@company.com",
    "role": "manager",
    "password": "password123",
    "phone": "1234567890",
    "department": "development",
    "adminArea": "backend",
    "company": "company_id_here"
  }'
```

### **Create Project**
```bash
curl -X POST http://localhost:5000/api/project/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "title": "E-commerce Website",
    "description": "Build a modern e-commerce platform",
    "projectType": "development",
    "category": "web-development",
    "client": "client_id_here",
    "company": "company_id_here",
    "startDate": "2024-01-15",
    "endDate": "2024-04-15",
    "estimatedDuration": 90,
    "budget": {
      "total": 25000,
      "currency": "USD"
    },
    "projectManager": "admin_id_here"
  }'
```

### **Create Task**
```bash
curl -X POST http://localhost:5000/api/task/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "title": "Design Database Schema",
    "description": "Create the database structure for the e-commerce platform",
    "project": "project_id_here",
    "client": "client_id_here",
    "company": "company_id_here",
    "type": "development",
    "category": "database-design",
    "priority": "high",
    "assignedTo": "employee_id_here",
    "assignedBy": "admin_id_here",
    "startDate": "2024-01-15",
    "dueDate": "2024-01-22",
    "estimatedHours": 16
  }'
```

## 🔍 **Query Parameters**

### **Common Query Parameters**
- `page` - Page number for pagination (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `search` - Search term for text fields
- `sort` - Sort field (default: createdAt)
- `order` - Sort order: asc/desc (default: desc)
- `status` - Filter by status
- `isActive` - Filter by active status (true/false)

### **Example Queries**
```bash
# Get admins with pagination and search
GET /api/admin/list?page=1&limit=20&search=john&status=active

# Get projects with filters
GET /api/project/list?status=active&priority=high&sort=dueDate&order=asc

# Get tasks for specific employee
GET /api/task/list?assignedTo=employee_id&status=in-progress
```

## 🚦 **Rate Limiting**

- **Rate Limit**: 100 requests per 15 minutes per IP
- **Headers**: 
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time
- **Response**: 429 status with retry-after header

## ❌ **Error Codes**

| Status Code | Description | Common Causes |
|-------------|-------------|---------------|
| `200` | OK | Successful operation |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Validation errors, missing fields |
| `401` | Unauthorized | Invalid or missing authentication |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate data, resource conflicts |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server-side errors |

## 📚 **Detailed API Documentation**

- [Authentication APIs](./auth.md) - Complete authentication endpoint details
- [Company Management APIs](./company.md) - Company CRUD operations
- [Admin Management APIs](./admin.md) - Admin user management
- [Client Management APIs](./client.md) - Client operations and management
- [Project Management APIs](./project.md) - Project lifecycle management
- [Employee Management APIs](./employee.md) - Employee management
- [Task Management APIs](./task.md) - Task operations and tracking

## 🧪 **Testing the API**

### **Using cURL**
```bash
# Test health endpoint
curl http://localhost:5000/health

# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@company.com", "password": "password123"}'
```

### **Using Postman**
1. Import the Postman collection from `/postman/` folder
2. Set the base URL to `http://localhost:5000/api`
3. Use the pre-configured requests for testing

### **Using Insomnia**
1. Import the Insomnia workspace from `/insomnia/` folder
2. Configure the base URL and authentication
3. Test all endpoints with the provided examples

## 🔧 **API Versioning**

The current API version is **v1**. All endpoints are prefixed with `/api/` (equivalent to `/api/v1/`).

Future versions will be available at `/api/v2/`, `/api/v3/`, etc.

## 📞 **API Support**

### **Documentation Issues**
- **GitHub Issues**: [Report documentation problems](https://github.com/cripcocode/crm-project/issues)
- **Email Support**: api-support@cripcocode.com

### **Technical Issues**
- **Developer Support**: dev@cripcocode.com
- **Community Forum**: [Get help from community](https://community.cripcocode.com)

---

**This API provides a robust foundation for building CRM applications. All endpoints are designed with security, performance, and scalability in mind.**
