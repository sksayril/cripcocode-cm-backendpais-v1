# 👨‍💼 Admin Management APIs

This document describes the Admin Management API endpoints for creating, reading, updating, and deleting admin users in the CRM system.

## 🔐 **Access Control**

- **Required Role**: `superAdmin` or `CompanyAdmin`
- **Authentication**: JWT token required
- **Base Path**: `/api/admin`

## 📋 **API Endpoints**

### **1. Create Admin**

Creates a new admin user in the system.

```http
POST /api/admin/create
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullname": "John Doe",
  "username": "johndoe",
  "email": "john@company.com",
  "role": "manager",
  "password": "securepassword123",
  "phone": "+1-555-123-4567",
  "department": "IT",
  "adminArea": "Software Development",
  "company": "507f1f77bcf86cd799439011"
}
```

**Required Fields:**
- `fullname` (string): Admin's full name
- `username` (string): Unique username
- `email` (string): Unique email address
- `role` (string): Admin role
- `password` (string): Password (min 6 characters)
- `phone` (string): Phone number
- `department` (string): Department name
- `adminArea` (string): Admin's area of responsibility
- `company` (string): Company ID (required for superAdmin)

**Role Options:**
- `superAdmin`: System administrator (superAdmin only)
- `CompanyAdmin`: Company administrator
- `manager`: Department manager
- `sales`: Sales representative
- `support`: Support staff

**Access Control:**
- **Super-admin**: Can create admins in any company
- **Company-admin**: Can only create admins in their own company

**Success Response (201):**
```json
{
  "success": true,
  "message": "Admin created successfully",
  "data": {
    "admin": {
      "id": "507f1f77bcf86cd799439013",
      "fullname": "John Doe",
      "username": "johndoe",
      "email": "john@company.com",
      "role": "manager",
      "phone": "+1-555-123-4567",
      "department": "IT",
      "adminArea": "Software Development",
      "company": {
        "id": "507f1f77bcf86cd799439011",
        "name": "Tech Solutions Inc."
      },
      "permissions": {
        "canManageUsers": true,
        "canManageAdmins": false,
        "canManageCompany": false,
        "canViewReports": true,
        "canManageProjects": true,
        "canManageBilling": false
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "isActive": true,
      "createdBy": "507f1f77bcf86cd799439012"
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Admin with this email already exists",
  "errors": [
    {
      "field": "email",
      "message": "Email already exists",
      "value": "john@company.com"
    }
  ]
}
```

---

### **2. Get All Admins**

Retrieves a paginated list of admin users with optional filtering.

```http
GET /api/admin/list
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `role` (string): Filter by admin role
- `department` (string): Filter by department
- `company` (string): Filter by company ID
- `isActive` (boolean): Filter by active status
- `search` (string): Search in name, username, email, or phone

**Access Control:**
- **Super-admin**: Can see all admins across all companies
- **Company-admin**: Can only see admins in their own company

**Example Request:**
```bash
GET /api/admin/list?page=1&limit=20&role=manager&department=IT&search=john
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Admins retrieved successfully",
  "data": {
    "admins": [
      {
        "id": "507f1f77bcf86cd799439013",
        "fullname": "John Doe",
        "username": "johndoe",
        "email": "john@company.com",
        "role": "manager",
        "phone": "+1-555-123-4567",
        "department": "IT",
        "adminArea": "Software Development",
        "company": {
          "id": "507f1f77bcf86cd799439011",
          "name": "Tech Solutions Inc.",
          "email": "contact@techsolutions.com",
          "industry": "Technology"
        },
        "isActive": true,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "createdBy": {
          "id": "507f1f77bcf86cd799439012",
          "username": "superAdmin",
          "email": "admin@cripcocode.com"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalAdmins": 25,
      "limit": 20
    }
  }
}
```

---

### **3. Get Admin by ID**

Retrieves detailed information about a specific admin user.

```http
GET /api/admin/{id}
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `id` (string): Admin ID (MongoDB ObjectId)

**Access Control:**
- **Super-admin**: Can view any admin
- **Company-admin**: Can only view admins in their own company

**Success Response (200):**
```json
{
  "success": true,
  "message": "Admin retrieved successfully",
  "data": {
    "admin": {
      "id": "507f1f77bcf86cd799439013",
      "fullname": "John Doe",
      "username": "johndoe",
      "email": "john@company.com",
      "phone": "+1-555-123-4567",
      "role": "manager",
      "department": "IT",
      "adminArea": "Software Development",
      "company": {
        "id": "507f1f77bcf86cd799439011",
        "name": "Tech Solutions Inc.",
        "email": "contact@techsolutions.com",
        "industry": "Technology",
        "size": "medium"
      },
      "permissions": {
        "canManageUsers": true,
        "canManageAdmins": false,
        "canManageCompany": false,
        "canViewReports": true,
        "canManageProjects": true,
        "canManageBilling": false
      },
      "isActive": true,
      "isEmailVerified": false,
      "isPhoneVerified": false,
      "lastLogin": "2024-01-15T09:00:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T15:45:00.000Z",
      "createdBy": {
        "id": "507f1f77bcf86cd799439012",
        "username": "superAdmin",
        "email": "admin@cripcocode.com"
      }
    }
  }
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "Access denied. You can only view admins in your company."
}
```

---

### **4. Update Admin**

Updates an existing admin's information.

```http
PUT /api/admin/{id}
POST /api/admin/{id}/update
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (string): Admin ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "fullname": "John Smith Doe",
  "department": "Engineering",
  "adminArea": "Full Stack Development"
}
```

**Access Control:**
- **Super-admin**: Can update any admin
- **Company-admin**: Can only update admins in their own company
- **Company field cannot be changed after creation**

**Success Response (200):**
```json
{
  "success": true,
  "message": "Admin updated successfully",
  "data": {
    "admin": {
      "id": "507f1f77bcf86cd799439013",
      "fullname": "John Smith Doe",
      "department": "Engineering",
      "adminArea": "Full Stack Development",
      "updatedAt": "2024-01-15T16:00:00.000Z"
    }
  }
}
```

---

### **5. Update Admin Password**

Updates an admin's password.

```http
PUT /api/admin/{id}/password
POST /api/admin/{id}/password
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (string): Admin ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "newPassword": "newsecurepassword123"
}
```

**Access Control:**
- **Super-admin**: Can update any admin's password
- **Company-admin**: Can only update admins' passwords in their own company

**Success Response (200):**
```json
{
  "success": true,
  "message": "Admin password updated successfully"
}
```

---

### **6. Delete Admin (Soft Delete)**

Deactivates an admin user (soft delete).

```http
DELETE /api/admin/{id}
POST /api/admin/{id}/delete
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `id` (string): Admin ID (MongoDB ObjectId)

**Access Control:**
- **Super-admin**: Can delete any admin
- **Company-admin**: Can only delete admins in their own company
- **Super-admin accounts cannot be deleted**

**Success Response (200):**
```json
{
  "success": true,
  "message": "Admin deactivated successfully",
  "data": {
    "admin": {
      "id": "507f1f77bcf86cd799439013",
      "username": "johndoe",
      "isActive": false
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Cannot delete superAdmin account"
}
```

---

### **7. Hard Delete Admin (Permanent Removal)**

Permanently removes an admin from the system.

```http
DELETE /api/admin/{id}/permanent
POST /api/admin/{id}/delete/permanent
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `id` (string): Admin ID (MongoDB ObjectId)

**Access Control:**
- **Super-admin only**: Only superAdmin can permanently delete admins
- **Super-admin accounts cannot be deleted**

**Success Response (200):**
```json
{
  "success": true,
  "message": "Admin permanently deleted",
  "data": {
    "deletedAdmin": {
      "id": "507f1f77bcf86cd799439013",
      "username": "johndoe"
    }
  }
}
```

---

### **8. Reactivate Admin**

Reactivates a previously deactivated admin user.

```http
PUT /api/admin/{id}/reactivate
POST /api/admin/{id}/reactivate
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `id` (string): Admin ID (MongoDB ObjectId)

**Access Control:**
- **Super-admin**: Can reactivate any admin
- **Company-admin**: Can only reactivate admins in their own company

**Success Response (200):**
```json
{
  "success": true,
  "message": "Admin reactivated successfully",
  "data": {
    "admin": {
      "id": "507f1f77bcf86cd799439013",
      "username": "johndoe",
      "isActive": true
    }
  }
}
```

---

### **9. Get Admin Statistics**

Retrieves admin statistics and analytics.

```http
GET /api/admin/stats/overview
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Access Control:**
- **Super-admin**: Can see system-wide statistics
- **Company-admin**: Can only see statistics for their company

**Success Response (200):**
```json
{
  "success": true,
  "message": "Admin statistics retrieved successfully",
  "data": {
    "totalAdmins": 25,
    "activeAdmins": 23,
    "inactiveAdmins": 2,
    "roleDistribution": [
      {
        "_id": "manager",
        "count": 12
      },
      {
        "_id": "sales",
        "count": 8
      },
      {
        "_id": "support",
        "count": 5
      }
    ],
    "departmentDistribution": [
      {
        "_id": "IT",
        "count": 15
      },
      {
        "_id": "Sales",
        "count": 8
      },
      {
        "_id": "Marketing",
        "count": 2
      }
    ],
    "companyDistribution": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "companyName": "Tech Solutions Inc.",
        "count": 15
      },
      {
        "_id": "507f1f77bcf86cd799439012",
        "companyName": "Healthcare Corp",
        "count": 10
      }
    ]
  }
}
```

## 🔍 **Search & Filtering**

### **Search Examples**

```bash
# Search by admin name
GET /api/admin/list?search=john

# Filter by role and department
GET /api/admin/list?role=manager&department=IT

# Get inactive admins
GET /api/admin/list?isActive=false

# Pagination with filters
GET /api/admin/list?page=2&limit=15&role=manager&search=doe
```

### **Filter Options**

| Parameter | Type | Description | Values |
|-----------|------|-------------|---------|
| `role` | string | Admin role | `superAdmin`, `CompanyAdmin`, `manager`, `sales`, `support` |
| `department` | string | Department name | Any text |
| `company` | string | Company ID | MongoDB ObjectId |
| `isActive` | boolean | Active status | `true`, `false` |
| `search` | string | Search term | Searches in name, username, email, phone |

## 📝 **Data Models**

### **Admin Schema**

```json
{
  "fullname": "string (required, max: 100)",
  "username": "string (required, unique, 3-50 chars, alphanumeric + underscore)",
  "email": "string (required, unique, email format)",
  "phone": "string (required, unique, phone format)",
  "company": "ObjectId (ref: Company, required)",
  "role": "enum (superAdmin|CompanyAdmin|manager|sales|support)",
  "department": "string (required, max: 100)",
  "adminArea": "string (required, max: 100)",
  "permissions": {
    "canManageUsers": "boolean",
    "canManageAdmins": "boolean",
    "canManageCompany": "boolean",
    "canViewReports": "boolean",
    "canManageProjects": "boolean",
    "canManageBilling": "boolean"
  },
  "password": "string (required, min: 6 chars)",
  "isActive": "boolean (default: true)",
  "isEmailVerified": "boolean (default: false)",
  "isPhoneVerified": "boolean (default: false)",
  "lastLogin": "Date",
  "loginAttempts": "number (default: 0)",
  "lockUntil": "Date",
  "createdBy": "ObjectId (ref: Admin, required)"
}
```

## 🔐 **Permission System**

### **Role-Based Permissions**

| Role | Users | Admins | Company | Reports | Projects | Billing |
|------|-------|--------|---------|---------|----------|---------|
| **superAdmin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **CompanyAdmin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **manager** | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| **sales** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **support** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |

### **Permission Details**

- **canManageUsers**: Create, update, delete regular users
- **canManageAdmins**: Create, update, delete admin users
- **canManageCompany**: Update company information
- **canViewReports**: Access analytics and reports
- **canManageProjects**: Create and manage projects
- **canManageBilling**: Access billing and subscription

## ⚠️ **Important Notes**

1. **Company Assignment**: Admins must be assigned to a company (except superAdmin)
2. **Role Hierarchy**: Super-admin > Company-admin > Manager > Sales/Support
3. **Company Isolation**: Company-admin can only manage admins in their company
4. **Super-admin Protection**: Super-admin accounts cannot be deleted or deactivated
5. **Password Security**: Passwords are automatically hashed using bcrypt
6. **Account Locking**: Accounts are locked after 5 failed login attempts

## 🧪 **Testing Examples**

### **cURL Examples**

```bash
# Create Admin
curl -X POST http://localhost:5000/api/admin/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Test Admin",
    "username": "testadmin",
    "email": "test@company.com",
    "role": "manager",
    "password": "password123",
    "phone": "+1-555-999-8888",
    "department": "IT",
    "adminArea": "Testing",
    "company": "COMPANY_ID"
  }'

# Get Admin List
curl -X GET "http://localhost:5000/api/admin/list?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Update Admin
curl -X PUT http://localhost:5000/api/admin/ADMIN_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fullname": "Updated Admin Name"}'
```

---

**Next**: [Company Management APIs](./company.md) | [Authentication APIs](./auth.md)
