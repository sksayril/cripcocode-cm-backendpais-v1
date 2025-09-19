# 👨‍💼 Admin Management APIs

## 📋 **Overview**

The Admin Management APIs provide comprehensive functionality for managing administrative users within the CRIPCOCODE CRM system. These endpoints handle admin creation, updates, deletion, and management with role-based access control and company isolation.

## 🔗 **Base Endpoints**

```
Base URL: /api/admin
```

## 🔐 **Access Control**

- **Super Admin**: Full access to all admins across all companies
- **Company Admin**: Access only to admins within their company
- **Manager**: Read-only access to admin information within their company

## 📝 **API Endpoints**

### **1. Create Admin**

#### **POST** `/admin/create`

Creates a new administrative user in the system.

**Access Level**: Super Admin, Company Admin

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "fullname": "John Doe",
  "username": "johndoe",
  "email": "john@company.com",
  "password": "SecurePassword123!",
  "phone": "+1234567890",
  "role": "manager",
  "department": "development",
  "adminArea": "backend",
  "company": "company_id_here",
  "permissions": {
    "canManageUsers": true,
    "canManageProjects": true,
    "canViewReports": true,
    "canManageBilling": false
  }
}
```

**Required Fields**:
- `fullname` (string): Admin's full name
- `username` (string): Unique username (3-30 characters)
- `email` (string): Valid email address
- `password` (string): Strong password (min 8 characters)
- `role` (string): Admin role (CompanyAdmin, manager, sales, support)
- `company` (string): Company ID reference

**Optional Fields**:
- `phone` (string): Phone number
- `department` (string): Department name
- `adminArea` (string): Admin specialization area
- `permissions` (object): Custom permission set
- `designation` (string): Job title/designation
- `hireDate` (date): Date of hire
- `salary` (number): Annual salary
- `isActive` (boolean): Account status (default: true)

**Success Response** (201):
```json
{
  "success": true,
  "message": "Admin created successfully",
  "data": {
    "admin": {
      "_id": "admin_id_here",
      "fullname": "John Doe",
      "username": "johndoe",
      "email": "john@company.com",
      "role": "manager",
      "department": "development",
      "adminArea": "backend",
      "company": "company_id_here",
      "permissions": {
        "canManageUsers": true,
        "canManageProjects": true,
        "canViewReports": true,
        "canManageBilling": false
      },
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "createdBy": "creator_admin_id"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `400` - Validation errors
- `401` - Unauthorized
- `403` - Insufficient permissions
- `409` - Username/email already exists
- `500` - Server error

---

### **2. List All Admins**

#### **GET** `/admin/list`

Retrieves a paginated list of administrative users.

**Access Level**: Super Admin, Company Admin

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search term for name/username/email
- `role` (string): Filter by role
- `department` (string): Filter by department
- `status` (string): Filter by status (active, inactive, locked)
- `company` (string): Filter by company (super admin only)
- `sort` (string): Sort field (default: createdAt)
- `order` (string): Sort order (asc, desc, default: desc)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Admins retrieved successfully",
  "data": {
    "admins": [
      {
        "_id": "admin_id_1",
        "fullname": "John Doe",
        "username": "johndoe",
        "email": "john@company.com",
        "role": "manager",
        "department": "development",
        "company": "company_id_here",
        "isActive": true,
        "lastLogin": "2024-01-15T09:30:00.000Z",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "limit": 10,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `401` - Unauthorized
- `403` - Insufficient permissions
- `500` - Server error

---

### **3. Get Admin Details**

#### **GET** `/admin/:id`

Retrieves detailed information about a specific admin.

**Access Level**: Super Admin, Company Admin (own company), Manager (own company)

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**URL Parameters**:
- `id` (string): Admin ID

**Success Response** (200):
```json
{
  "success": true,
  "message": "Admin details retrieved successfully",
  "data": {
    "admin": {
      "_id": "admin_id_here",
      "fullname": "John Doe",
      "username": "johndoe",
      "email": "john@company.com",
      "phone": "+1234567890",
      "role": "manager",
      "department": "development",
      "adminArea": "backend",
      "company": "company_id_here",
      "permissions": {
        "canManageUsers": true,
        "canManageProjects": true,
        "canViewReports": true,
        "canManageBilling": false
      },
      "isActive": true,
      "lastLogin": "2024-01-15T09:30:00.000Z",
      "loginAttempts": 0,
      "isLocked": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "createdBy": "creator_admin_id",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `400` - Invalid admin ID
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Admin not found
- `500` - Server error

---

### **4. Update Admin**

#### **PUT** `/admin/:id` or **POST** `/admin/:id/update`

Updates an existing admin's information.

**Access Level**: Super Admin, Company Admin (own company)

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**URL Parameters**:
- `id` (string): Admin ID

**Request Body**:
```json
{
  "fullname": "John Michael Doe",
  "department": "full-stack-development",
  "adminArea": "full-stack",
  "permissions": {
    "canManageUsers": true,
    "canManageProjects": true,
    "canViewReports": true,
    "canManageBilling": true
  },
  "designation": "Senior Development Manager",
  "salary": 85000
}
```

**Updatable Fields**:
- `fullname` (string): Admin's full name
- `phone` (string): Phone number
- `department` (string): Department name
- `adminArea` (string): Admin specialization area
- `permissions` (object): Permission set
- `designation` (string): Job title
- `salary` (number): Annual salary
- `isActive` (boolean): Account status

**Success Response** (200):
```json
{
  "success": true,
  "message": "Admin updated successfully",
  "data": {
    "admin": {
      "_id": "admin_id_here",
      "fullname": "John Michael Doe",
      "department": "full-stack-development",
      "adminArea": "full-stack",
      "permissions": {
        "canManageUsers": true,
        "canManageProjects": true,
        "canViewReports": true,
        "canManageBilling": true
      },
      "designation": "Senior Development Manager",
      "salary": 85000,
      "updatedAt": "2024-01-15T11:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T11:30:00.000Z"
}
```

**Error Responses**:
- `400` - Validation errors
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Admin not found
- `409` - Username/email already exists
- `500` - Server error

---

### **5. Update Admin Password**

#### **PUT** `/admin/:id/password` or **POST** `/admin/:id/password`

Updates an admin's password.

**Access Level**: Super Admin, Company Admin (own company), Self (own password)

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**URL Parameters**:
- `id` (string): Admin ID

**Request Body**:
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePassword456!"
}
```

**Required Fields**:
- `currentPassword` (string): Current password
- `newPassword` (string): New password (min 8 characters)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Password updated successfully",
  "data": null,
  "timestamp": "2024-01-15T11:30:00.000Z"
}
```

**Error Responses**:
- `400` - Validation errors
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Admin not found
- `409` - Current password incorrect
- `500` - Server error

---

### **6. Delete Admin (Soft Delete)**

#### **DELETE** `/admin/:id` or **POST** `/admin/:id/delete`

Soft deletes an admin (marks as inactive).

**Access Level**: Super Admin, Company Admin (own company)

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**URL Parameters**:
- `id` (string): Admin ID

**Request Body**: None required

**Success Response** (200):
```json
{
  "success": true,
  "message": "Admin deleted successfully",
  "data": {
    "admin": {
      "_id": "admin_id_here",
      "fullname": "John Michael Doe",
      "status": "inactive",
      "isActive": false,
      "deletedAt": "2024-01-15T12:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T12:30:00.000Z"
}
```

**Error Responses**:
- `400` - Invalid admin ID
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Admin not found
- `409` - Admin has active projects/assignments
- `500` - Server error

---

### **7. Hard Delete Admin**

#### **DELETE** `/admin/:id/permanent` or **POST** `/admin/:id/delete/permanent`

Permanently removes an admin from the system.

**Access Level**: Super Admin only

**Headers**:
```
Authorization: Bearer <super_admin_jwt_token>
```

**URL Parameters**:
- `id` (string): Admin ID

**Request Body**: None required

**Success Response** (200):
```json
{
  "success": true,
  "message": "Admin permanently deleted",
  "data": null,
  "timestamp": "2024-01-15T12:30:00.000Z"
}
```

**Error Responses**:
- `400` - Invalid admin ID
- `401` - Unauthorized
- `403` - Insufficient permissions (not super admin)
- `404` - Admin not found
- `500` - Server error

---

### **8. Reactivate Admin**

#### **PUT** `/admin/:id/reactivate` or **POST** `/admin/:id/reactivate`

Reactivates a soft-deleted admin.

**Access Level**: Super Admin, Company Admin (own company)

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**URL Parameters**:
- `id` (string): Admin ID

**Request Body**: None required

**Success Response** (200):
```json
{
  "success": true,
  "message": "Admin reactivated successfully",
  "data": {
    "admin": {
      "_id": "admin_id_here",
      "fullname": "John Michael Doe",
      "status": "active",
      "isActive": true,
      "reactivatedAt": "2024-01-15T13:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T13:30:00.000Z"
}
```

**Error Responses**:
- `400` - Invalid admin ID
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Admin not found
- `500` - Server error

---

### **9. Admin Statistics**

#### **GET** `/admin/stats/overview`

Retrieves comprehensive statistics about admins.

**Access Level**: Super Admin, Company Admin

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:
- `company` (string): Company ID (super admin only)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Admin statistics retrieved successfully",
  "data": {
    "stats": {
      "overview": {
        "totalAdmins": 25,
        "activeAdmins": 22,
        "inactiveAdmins": 3,
        "lockedAdmins": 1
      },
      "byRole": {
        "CompanyAdmin": 3,
        "manager": 8,
        "sales": 6,
        "support": 8
      },
      "byDepartment": {
        "development": 10,
        "marketing": 8,
        "sales": 4,
        "support": 3
      },
      "activity": {
        "onlineNow": 5,
        "lastLoginToday": 8,
        "lastLoginThisWeek": 18
      }
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `401` - Unauthorized
- `403` - Insufficient permissions
- `500` - Server error

---

## 📊 **Data Models**

### **Admin Schema**
```json
{
  "_id": "ObjectId",
  "fullname": "String (required)",
  "username": "String (required, unique)",
  "email": "String (required, unique)",
  "password": "String (required, hashed)",
  "phone": "String",
  "role": "String (required, enum)",
  "department": "String",
  "adminArea": "String",
  "company": "ObjectId (required, ref: Company)",
  "permissions": {
    "canManageUsers": "Boolean",
    "canManageAdmins": "Boolean",
    "canManageCompany": "Boolean",
    "canViewReports": "Boolean",
    "canManageProjects": "Boolean",
    "canManageBilling": "Boolean"
  },
  "designation": "String",
  "hireDate": "Date",
  "salary": "Number",
  "isActive": "Boolean (default: true)",
  "lastLogin": "Date",
  "loginAttempts": "Number (default: 0)",
  "isLocked": "Boolean (default: false)",
  "createdBy": "ObjectId (ref: Admin)",
  "createdAt": "Date",
  "updatedAt": "Date",
  "deletedAt": "Date"
}
```

---

## 📝 **Request Examples**

### **cURL Examples**

#### **Create Admin**
```bash
curl -X POST http://localhost:5000/api/admin/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "fullname": "Jane Smith",
    "username": "janesmith",
    "email": "jane@company.com",
    "password": "SecurePass123!",
    "role": "sales",
    "department": "marketing",
    "company": "company_id_here"
  }'
```

#### **Update Admin**
```bash
curl -X PUT http://localhost:5000/api/admin/admin_id_here \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "fullname": "Jane Elizabeth Smith",
    "department": "digital-marketing",
    "designation": "Senior Marketing Manager"
  }'
```

#### **Update Password**
```bash
curl -X PUT http://localhost:5000/api/admin/admin_id_here/password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "currentPassword": "OldPassword123!",
    "newPassword": "NewSecurePassword456!"
  }'
```

#### **Get Admin Details**
```bash
curl -X GET http://localhost:5000/api/admin/admin_id_here \
  -H "Authorization: Bearer <admin_token>"
```

#### **List Admins with Filters**
```bash
curl -X GET "http://localhost:5000/api/admin/list?page=1&limit=20&role=manager&department=development" \
  -H "Authorization: Bearer <admin_token>"
```

### **JavaScript Examples**

#### **Create Admin**
```javascript
const response = await fetch('/api/admin/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    fullname: 'Jane Smith',
    username: 'janesmith',
    email: 'jane@company.com',
    password: 'SecurePass123!',
    role: 'sales',
    department: 'marketing',
    company: 'company_id_here'
  })
});

const data = await response.json();
```

#### **Update Admin**
```javascript
const response = await fetch(`/api/admin/${adminId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    fullname: 'Jane Elizabeth Smith',
    department: 'digital-marketing',
    designation: 'Senior Marketing Manager'
  })
});

const data = await response.json();
```

---

## ❌ **Error Handling**

### **Common Error Codes**

| Status Code | Error Type | Description | Solution |
|-------------|------------|-------------|----------|
| `400` | Bad Request | Invalid admin ID, validation errors | Check request parameters and body |
| `401` | Unauthorized | Missing or invalid authentication | Provide valid JWT token |
| `403` | Forbidden | Insufficient permissions | Check user role and company access |
| `404` | Not Found | Admin doesn't exist | Verify admin ID |
| `409` | Conflict | Username/email already exists, active dependencies | Use different username/email or resolve dependencies |
| `500` | Internal Server Error | Server-side error | Contact support |

### **Error Response Format**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required",
      "value": ""
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters",
      "value": "123"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/admin/create",
  "method": "POST"
}
```

---

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Admin Configuration
MAX_ADMINS_PER_COMPANY=50
ADMIN_USERNAME_MIN_LENGTH=3
ADMIN_USERNAME_MAX_LENGTH=30
ADMIN_PASSWORD_MIN_LENGTH=8

# Validation
ALLOWED_ADMIN_ROLES=CompanyAdmin,manager,sales,support
ALLOWED_DEPARTMENTS=development,marketing,sales,support,hr,finance
ALLOWED_ADMIN_AREAS=frontend,backend,full-stack,ui-ux,devops,qa
```

### **Rate Limiting**
- Admin creation: 10 requests per hour per IP
- Admin updates: 30 requests per hour per IP
- Admin listing: 100 requests per hour per IP

---

## 📚 **Related Documentation**

- [API Overview](../README.md) - Complete API reference
- [Authentication APIs](./auth.md) - User authentication
- [Company Management](./company.md) - Company operations
- [Database Models](../database.md) - Admin model schema
- [Security Guide](../security.md) - Role-based access control

---

**The Admin Management APIs provide comprehensive administrative user lifecycle management with role-based access control, company isolation, and detailed analytics.**
