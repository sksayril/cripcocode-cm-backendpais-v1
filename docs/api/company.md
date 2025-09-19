# 🏢 Company Management APIs

## 📋 **Overview**

The Company Management APIs provide comprehensive functionality for managing company entities within the CRIPCOCODE CRM system. These endpoints handle company creation, updates, deletion, and retrieval with multi-tenant architecture support.

## 🔗 **Base Endpoints**

```
Base URL: /api/company
```

## 🔐 **Access Control**

- **Super Admin**: Full access to all companies
- **Company Admin**: Access only to their own company
- **Other Roles**: Read-only access to company information

## 📝 **API Endpoints**

### **1. Create Company**

#### **POST** `/company/create`

Creates a new company in the system.

**Access Level**: Super Admin

**Headers**:
```
Authorization: Bearer <super_admin_jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Tech Solutions Inc.",
  "type": "corporation",
  "industry": "technology",
  "size": "medium",
  "website": "https://techsolutions.com",
  "email": "contact@techsolutions.com",
  "phone": "+1-555-0123",
  "address": {
    "street": "123 Tech Street",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94105",
    "country": "USA"
  },
  "subscription": {
    "plan": "premium",
    "startDate": "2024-01-15",
    "endDate": "2025-01-15",
    "features": ["crm", "analytics", "support"]
  }
}
```

**Required Fields**:
- `name` (string): Company name
- `type` (string): Company type (corporation, llc, partnership, etc.)
- `industry` (string): Industry category
- `size` (string): Company size (small, medium, large, enterprise)

**Optional Fields**:
- `website` (string): Company website URL
- `email` (string): Primary contact email
- `phone` (string): Primary contact phone
- `address` (object): Company address details
- `subscription` (object): Subscription plan details
- `description` (string): Company description
- `foundedYear` (number): Year company was founded
- `revenue` (number): Annual revenue
- `employeeCount` (number): Number of employees

**Success Response** (201):
```json
{
  "success": true,
  "message": "Company created successfully",
  "data": {
    "company": {
      "_id": "company_id_here",
      "name": "Tech Solutions Inc.",
      "type": "corporation",
      "industry": "technology",
      "size": "medium",
      "website": "https://techsolutions.com",
      "email": "contact@techsolutions.com",
      "phone": "+1-555-0123",
      "address": {
        "street": "123 Tech Street",
        "city": "San Francisco",
        "state": "CA",
        "zipCode": "94105",
        "country": "USA"
      },
      "subscription": {
        "plan": "premium",
        "startDate": "2024-01-15T00:00:00.000Z",
        "endDate": "2025-01-15T00:00:00.000Z",
        "features": ["crm", "analytics", "support"]
      },
      "status": "active",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `400` - Validation errors
- `401` - Unauthorized (not super admin)
- `409` - Company name already exists
- `500` - Server error

---

### **2. List All Companies**

#### **GET** `/company/list`

Retrieves a paginated list of all companies in the system.

**Access Level**: Super Admin

**Headers**:
```
Authorization: Bearer <super_admin_jwt_token>
```

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search term for company name
- `industry` (string): Filter by industry
- `size` (string): Filter by company size
- `status` (string): Filter by status (active, inactive, suspended)
- `sort` (string): Sort field (default: createdAt)
- `order` (string): Sort order (asc, desc, default: desc)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Companies retrieved successfully",
  "data": {
    "companies": [
      {
        "_id": "company_id_1",
        "name": "Tech Solutions Inc.",
        "type": "corporation",
        "industry": "technology",
        "size": "medium",
        "status": "active",
        "isActive": true,
        "subscription": {
          "plan": "premium",
          "endDate": "2025-01-15T00:00:00.000Z"
        },
        "stats": {
          "totalAdmins": 5,
          "totalClients": 25,
          "totalProjects": 12,
          "totalRevenue": 150000
        },
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
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

### **3. Get Company Details**

#### **GET** `/company/:id`

Retrieves detailed information about a specific company.

**Access Level**: Super Admin, Company Admin (own company)

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**URL Parameters**:
- `id` (string): Company ID

**Success Response** (200):
```json
{
  "success": true,
  "message": "Company details retrieved successfully",
  "data": {
    "company": {
      "_id": "company_id_here",
      "name": "Tech Solutions Inc.",
      "type": "corporation",
      "industry": "technology",
      "size": "medium",
      "website": "https://techsolutions.com",
      "email": "contact@techsolutions.com",
      "phone": "+1-555-0123",
      "address": {
        "street": "123 Tech Street",
        "city": "San Francisco",
        "state": "CA",
        "zipCode": "94105",
        "country": "USA"
      },
      "subscription": {
        "plan": "premium",
        "startDate": "2024-01-15T00:00:00.000Z",
        "endDate": "2025-01-15T00:00:00.000Z",
        "features": ["crm", "analytics", "support"],
        "isActive": true
      },
      "status": "active",
      "isActive": true,
      "stats": {
        "totalAdmins": 5,
        "totalClients": 25,
        "totalProjects": 12,
        "totalRevenue": 150000,
        "activeProjects": 8,
        "completedProjects": 4
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `400` - Invalid company ID
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Company not found
- `500` - Server error

---

### **4. Update Company**

#### **PUT** `/company/:id` or **POST** `/company/:id/update`

Updates an existing company's information.

**Access Level**: Super Admin, Company Admin (own company)

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**URL Parameters**:
- `id` (string): Company ID

**Request Body**:
```json
{
  "name": "Tech Solutions International Inc.",
  "website": "https://techsolutions-intl.com",
  "phone": "+1-555-0124",
  "address": {
    "street": "456 Innovation Drive",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94106",
    "country": "USA"
  },
  "subscription": {
    "plan": "enterprise",
    "features": ["crm", "analytics", "support", "api", "customization"]
  }
}
```

**Updatable Fields**:
- `name` (string): Company name
- `website` (string): Company website
- `email` (string): Primary contact email
- `phone` (string): Primary contact phone
- `address` (object): Company address
- `subscription` (object): Subscription details
- `description` (string): Company description
- `industry` (string): Industry category
- `size` (string): Company size

**Success Response** (200):
```json
{
  "success": true,
  "message": "Company updated successfully",
  "data": {
    "company": {
      "_id": "company_id_here",
      "name": "Tech Solutions International Inc.",
      "website": "https://techsolutions-intl.com",
      "phone": "+1-555-0124",
      "address": {
        "street": "456 Innovation Drive",
        "city": "San Francisco",
        "state": "CA",
        "zipCode": "94106",
        "country": "USA"
      },
      "subscription": {
        "plan": "enterprise",
        "features": ["crm", "analytics", "support", "api", "customization"]
      },
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
- `404` - Company not found
- `409` - Company name already exists
- `500` - Server error

---

### **5. Delete Company**

#### **DELETE** `/company/:id` or **POST** `/company/:id/delete`

Soft deletes a company (marks as inactive).

**Access Level**: Super Admin

**Headers**:
```
Authorization: Bearer <super_admin_jwt_token>
```

**URL Parameters**:
- `id` (string): Company ID

**Request Body**: None required

**Success Response** (200):
```json
{
  "success": true,
  "message": "Company deleted successfully",
  "data": {
    "company": {
      "_id": "company_id_here",
      "name": "Tech Solutions International Inc.",
      "status": "inactive",
      "isActive": false,
      "deletedAt": "2024-01-15T12:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T12:30:00.000Z"
}
```

**Error Responses**:
- `400` - Invalid company ID
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Company not found
- `409` - Company has active projects/clients
- `500` - Server error

---

## 🔍 **Additional Endpoints**

### **6. Company Statistics**

#### **GET** `/company/:id/stats`

Retrieves comprehensive statistics for a company.

**Access Level**: Super Admin, Company Admin (own company)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Company statistics retrieved successfully",
  "data": {
    "stats": {
      "overview": {
        "totalAdmins": 5,
        "totalClients": 25,
        "totalProjects": 12,
        "totalRevenue": 150000
      },
      "projects": {
        "active": 8,
        "completed": 4,
        "onHold": 0,
        "cancelled": 0
      },
      "clients": {
        "active": 20,
        "inactive": 5,
        "newThisMonth": 3
      },
      "revenue": {
        "thisMonth": 25000,
        "lastMonth": 22000,
        "thisYear": 150000,
        "growth": 13.6
      }
    }
  }
}
```

---

## 📊 **Data Models**

### **Company Schema**
```json
{
  "_id": "ObjectId",
  "name": "String (required, unique)",
  "type": "String (required)",
  "industry": "String (required)",
  "size": "String (required)",
  "website": "String",
  "email": "String",
  "phone": "String",
  "address": {
    "street": "String",
    "city": "String",
    "state": "String",
    "zipCode": "String",
    "country": "String"
  },
  "subscription": {
    "plan": "String",
    "startDate": "Date",
    "endDate": "Date",
    "features": ["String"],
    "isActive": "Boolean"
  },
  "status": "String (enum: active, inactive, suspended)",
  "isActive": "Boolean (default: true)",
  "stats": {
    "totalAdmins": "Number",
    "totalClients": "Number",
    "totalProjects": "Number",
    "totalRevenue": "Number"
  },
  "createdAt": "Date",
  "updatedAt": "Date",
  "deletedAt": "Date"
}
```

---

## 📝 **Request Examples**

### **cURL Examples**

#### **Create Company**
```bash
curl -X POST http://localhost:5000/api/company/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <super_admin_token>" \
  -d '{
    "name": "Digital Marketing Pro",
    "type": "llc",
    "industry": "marketing",
    "size": "small",
    "website": "https://digitalmarketingpro.com",
    "email": "info@digitalmarketingpro.com",
    "phone": "+1-555-0125"
  }'
```

#### **Update Company**
```bash
curl -X PUT http://localhost:5000/api/company/company_id_here \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "name": "Digital Marketing Pro International",
    "website": "https://digitalmarketingpro-intl.com"
  }'
```

#### **Get Company Details**
```bash
curl -X GET http://localhost:5000/api/company/company_id_here \
  -H "Authorization: Bearer <admin_token>"
```

#### **List Companies with Filters**
```bash
curl -X GET "http://localhost:5000/api/company/list?page=1&limit=20&industry=technology&size=medium" \
  -H "Authorization: Bearer <super_admin_token>"
```

### **JavaScript Examples**

#### **Create Company**
```javascript
const response = await fetch('/api/company/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Digital Marketing Pro',
    type: 'llc',
    industry: 'marketing',
    size: 'small',
    website: 'https://digitalmarketingpro.com',
    email: 'info@digitalmarketingpro.com'
  })
});

const data = await response.json();
```

#### **Update Company**
```javascript
const response = await fetch(`/api/company/${companyId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Digital Marketing Pro International',
    website: 'https://digitalmarketingpro-intl.com'
  })
});

const data = await response.json();
```

---

## ❌ **Error Handling**

### **Common Error Codes**

| Status Code | Error Type | Description | Solution |
|-------------|------------|-------------|----------|
| `400` | Bad Request | Invalid company ID, validation errors | Check request parameters and body |
| `401` | Unauthorized | Missing or invalid authentication | Provide valid JWT token |
| `403` | Forbidden | Insufficient permissions | Check user role and company access |
| `404` | Not Found | Company doesn't exist | Verify company ID |
| `409` | Conflict | Company name already exists, active dependencies | Use different name or resolve dependencies |
| `500` | Internal Server Error | Server-side error | Contact support |

### **Error Response Format**
```json
{
  "success": false,
  "message": "Company not found",
  "errors": [
    {
      "field": "id",
      "message": "Company with ID 'invalid_id' not found",
      "value": "invalid_id"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/company/invalid_id",
  "method": "GET"
}
```

---

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Company Configuration
MAX_COMPANIES_PER_SUBSCRIPTION=100
COMPANY_NAME_MIN_LENGTH=2
COMPANY_NAME_MAX_LENGTH=100

# Validation
ALLOWED_COMPANY_TYPES=corporation,llc,partnership,sole_proprietorship
ALLOWED_INDUSTRIES=technology,marketing,healthcare,finance,retail,manufacturing
ALLOWED_COMPANY_SIZES=small,medium,large,enterprise
```

### **Rate Limiting**
- Company creation: 5 requests per hour per IP
- Company updates: 20 requests per hour per IP
- Company listing: 100 requests per hour per IP

---

## 📚 **Related Documentation**

- [API Overview](../README.md) - Complete API reference
- [Admin Management](./admin.md) - Admin user management
- [Client Management](./client.md) - Client operations
- [Project Management](./project.md) - Project lifecycle
- [Database Models](../database.md) - Company model schema
- [Security Guide](../security.md) - Multi-tenant security

---

**The Company Management APIs provide comprehensive company lifecycle management with multi-tenant architecture, role-based access control, and detailed analytics.**
