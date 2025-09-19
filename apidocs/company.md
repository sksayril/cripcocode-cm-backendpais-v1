# 🏢 Company Management APIs

This document describes the Company Management API endpoints for creating, reading, updating, and deleting companies in the CRM system.

## 🔐 **Access Control**

- **Required Role**: `superAdmin` only
- **Authentication**: JWT token required
- **Base Path**: `/api/company`

## 📋 **API Endpoints**

### **1. Create Company**

Creates a new company in the system.

```http
POST /api/company/create
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Tech Solutions Inc.",
  "description": "Leading technology solutions provider",
  "email": "contact@techsolutions.com",
  "phone": "+1-555-123-4567",
  "address": {
    "street": "123 Tech Street",
    "city": "San Francisco",
    "state": "CA",
    "country": "USA",
    "zipCode": "94105"
  },
  "industry": "Technology",
  "size": "medium",
  "website": "https://techsolutions.com",
  "subscriptionPlan": "premium"
}
```

**Required Fields:**
- `name` (string): Company name
- `email` (string): Company email (unique)
- `phone` (string): Company phone number (unique)

**Optional Fields:**
- `description` (string): Company description
- `address` (object): Company address details
- `industry` (string): Company industry
- `size` (enum): Company size (`startup`, `small`, `medium`, `large`, `enterprise`)
- `website` (string): Company website URL
- `subscriptionPlan` (enum): Subscription plan (`free`, `basic`, `premium`, `enterprise`)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Company created successfully",
  "data": {
    "company": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Tech Solutions Inc.",
      "email": "contact@techsolutions.com",
      "phone": "+1-555-123-4567",
      "industry": "Technology",
      "size": "medium",
      "status": "active",
      "subscriptionPlan": "premium",
      "stats": {
        "totalAdmins": 0,
        "totalUsers": 0,
        "totalProjects": 0
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Company with this email already exists",
  "errors": [
    {
      "field": "email",
      "message": "Email already exists",
      "value": "contact@techsolutions.com"
    }
  ]
}
```

---

### **2. Get All Companies**

Retrieves a paginated list of companies with optional filtering.

```http
GET /api/company/list
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `industry` (string): Filter by industry
- `size` (string): Filter by company size
- `subscriptionPlan` (string): Filter by subscription plan
- `isActive` (boolean): Filter by active status
- `search` (string): Search in name, email, or industry

**Example Request:**
```bash
GET /api/company/list?page=1&limit=20&industry=Technology&search=tech
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Companies retrieved successfully",
  "data": {
    "companies": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "Tech Solutions Inc.",
        "email": "contact@techsolutions.com",
        "phone": "+1-555-123-4567",
        "industry": "Technology",
        "size": "medium",
        "status": "active",
        "subscriptionPlan": "premium",
        "stats": {
          "totalAdmins": 5,
          "totalUsers": 25,
          "totalProjects": 12
        },
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
      "totalCompanies": 25,
      "limit": 20
    }
  }
}
```

---

### **3. Get Company by ID**

Retrieves detailed information about a specific company.

```http
GET /api/company/{id}
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `id` (string): Company ID (MongoDB ObjectId)

**Example Request:**
```bash
GET /api/company/507f1f77bcf86cd799439011
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Company retrieved successfully",
  "data": {
    "company": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Tech Solutions Inc.",
      "description": "Leading technology solutions provider",
      "email": "contact@techsolutions.com",
      "phone": "+1-555-123-4567",
      "address": {
        "street": "123 Tech Street",
        "city": "San Francisco",
        "state": "CA",
        "country": "USA",
        "zipCode": "94105"
      },
      "industry": "Technology",
      "size": "medium",
      "website": "https://techsolutions.com",
      "status": "active",
      "subscriptionPlan": "premium",
      "subscriptionExpiry": "2024-12-31T23:59:59.000Z",
      "stats": {
        "totalAdmins": 5,
        "totalUsers": 25,
        "totalProjects": 12
      },
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

**Error Response (404):**
```json
{
  "success": false,
  "message": "Company with ID 507f1f77bcf86cd799439011 not found"
}
```

---

### **4. Update Company**

Updates an existing company's information.

```http
PUT /api/company/{id}
POST /api/company/{id}/update
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (string): Company ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "name": "Tech Solutions International Inc.",
  "description": "Global technology solutions provider",
  "size": "large",
  "subscriptionPlan": "enterprise"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Company updated successfully",
  "data": {
    "company": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Tech Solutions International Inc.",
      "description": "Global technology solutions provider",
      "size": "large",
      "subscriptionPlan": "enterprise",
      "updatedAt": "2024-01-15T16:00:00.000Z"
    }
  }
}
```

---

### **5. Delete Company (Soft Delete)**

Deactivates a company (soft delete).

```http
DELETE /api/company/{id}
POST /api/company/{id}/delete
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `id` (string): Company ID (MongoDB ObjectId)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Company deactivated successfully",
  "data": {
    "company": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Tech Solutions Inc.",
      "isActive": false
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Cannot delete company with active admins. Please deactivate all admins first."
}
```

---

### **6. Reactivate Company**

Reactivates a previously deactivated company.

```http
PUT /api/company/{id}/reactivate
POST /api/company/{id}/reactivate
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `id` (string): Company ID (MongoDB ObjectId)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Company reactivated successfully",
  "data": {
    "company": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Tech Solutions Inc.",
      "isActive": true
    }
  }
}
```

---

### **7. Get Company Statistics**

Retrieves system-wide company statistics and analytics.

```http
GET /api/company/stats/overview
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Company statistics retrieved successfully",
  "data": {
    "overview": {
      "totalCompanies": 25,
      "activeCompanies": 23,
      "inactiveCompanies": 2,
      "totalAdmins": 150,
      "totalUsers": 750
    },
    "industryDistribution": [
      {
        "_id": "Technology",
        "count": 12
      },
      {
        "_id": "Healthcare",
        "count": 8
      },
      {
        "_id": "Finance",
        "count": 5
      }
    ],
    "sizeDistribution": [
      {
        "_id": "medium",
        "count": 15
      },
      {
        "_id": "small",
        "count": 8
      },
      {
        "_id": "large",
        "count": 2
      }
    ],
    "subscriptionDistribution": [
      {
        "_id": "premium",
        "count": 18
      },
      {
        "_id": "basic",
        "count": 5
      },
      {
        "_id": "enterprise",
        "count": 2
      }
    ]
  }
}
```

---

### **8. Get Company with Admins**

Retrieves company details along with all associated admins.

```http
GET /api/company/{id}/with-admins
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `id` (string): Company ID (MongoDB ObjectId)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Company details retrieved successfully",
  "data": {
    "company": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Tech Solutions Inc.",
      "email": "contact@techsolutions.com",
      "stats": {
        "totalAdmins": 5,
        "totalUsers": 25,
        "totalProjects": 12
      }
    },
    "admins": [
      {
        "id": "507f1f77bcf86cd799439013",
        "fullname": "John Doe",
        "username": "johndoe",
        "email": "john@techsolutions.com",
        "role": "CompanyAdmin",
        "department": "IT",
        "isActive": true
      }
    ],
    "totalAdmins": 5
  }
}
```

## 🔍 **Search & Filtering**

### **Search Examples**

```bash
# Search by company name
GET /api/company/list?search=tech

# Filter by industry and size
GET /api/company/list?industry=Technology&size=medium

# Get inactive companies
GET /api/company/list?isActive=false

# Pagination with filters
GET /api/company/list?page=2&limit=15&industry=Technology&search=solutions
```

### **Filter Options**

| Parameter | Type | Description | Values |
|-----------|------|-------------|---------|
| `industry` | string | Company industry | Any text |
| `size` | string | Company size | `startup`, `small`, `medium`, `large`, `enterprise` |
| `subscriptionPlan` | string | Subscription plan | `free`, `basic`, `premium`, `enterprise` |
| `isActive` | boolean | Active status | `true`, `false` |
| `search` | string | Search term | Searches in name, email, industry |

## 📝 **Data Models**

### **Company Schema**

```json
{
  "name": "string (required, max: 100)",
  "description": "string (max: 500)",
  "email": "string (required, unique, email format)",
  "phone": "string (required, unique, phone format)",
  "address": {
    "street": "string (max: 200)",
    "city": "string (max: 100)",
    "state": "string (max: 100)",
    "country": "string (max: 100)",
    "zipCode": "string (max: 20)"
  },
  "industry": "string (max: 100)",
  "size": "enum (startup|small|medium|large|enterprise)",
  "website": "string (URL format)",
  "isActive": "boolean (default: true)",
  "subscriptionPlan": "enum (free|basic|premium|enterprise)",
  "subscriptionExpiry": "Date",
  "stats": {
    "totalAdmins": "number (default: 0)",
    "totalUsers": "number (default: 0)",
    "totalProjects": "number (default: 0)"
  },
  "createdBy": "ObjectId (ref: User, required)"
}
```

## ⚠️ **Important Notes**

1. **Company Deletion**: Companies cannot be permanently deleted if they have active admins
2. **Email Uniqueness**: Company email addresses must be unique across the system
3. **Soft Delete**: Deleting a company only deactivates it and its associated admins
4. **Statistics**: Company stats are automatically updated when admins are added/removed
5. **Permissions**: Only superAdmin users can manage companies

## 🧪 **Testing Examples**

### **cURL Examples**

```bash
# Create Company
curl -X POST http://localhost:5000/api/company/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company",
    "email": "test@company.com",
    "phone": "+1-555-999-8888"
  }'

# Get Company List
curl -X GET "http://localhost:5000/api/company/list?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Update Company
curl -X PUT http://localhost:5000/api/company/COMPANY_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Company Name"}'
```

---

**Next**: [Admin Management APIs](./admin.md) | [Authentication APIs](./auth.md)
