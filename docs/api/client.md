# 👥 Client Management APIs

## 📋 **Overview**

The Client Management APIs provide comprehensive functionality for managing client relationships within the CRIPCOCODE CRM system. These endpoints handle client registration, authentication, profile management, and analytics with multi-tenant architecture support.

## 🔗 **Base Endpoints**

```
Base URL: /api/client
```

## 🔐 **Access Control**

- **Super Admin**: Full access to all clients across all companies
- **Company Admin**: Access only to clients within their company
- **Manager**: Read and update access to clients within their company
- **Sales**: Read and limited update access to clients within their company
- **Support**: Read-only access to client information within their company

## 📝 **API Endpoints**

### **1. Client Registration**

#### **POST** `/client/register`

Creates a new client account in the system.

**Access Level**: Public

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "fullname": "John Smith",
  "email": "john.smith@business.com",
  "password": "SecurePassword123!",
  "phone": "+1234567890",
  "company": "company_id_here",
  "businessInfo": {
    "businessName": "Smith Enterprises",
    "industry": "technology",
    "size": "medium",
    "website": "https://smithenterprises.com"
  },
  "contactInfo": {
    "address": {
      "street": "456 Business Ave",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "preferredContact": "email",
    "timezone": "America/New_York"
  }
}
```

**Required Fields**:
- `fullname` (string): Client's full name
- `email` (string): Valid email address
- `password` (string): Strong password (min 8 characters)
- `company` (string): Company ID reference

**Optional Fields**:
- `phone` (string): Phone number
- `businessInfo` (object): Business details
- `contactInfo` (object): Contact preferences
- `communicationPreferences` (object): Communication settings
- `notes` (string): Additional notes

**Success Response** (201):
```json
{
  "success": true,
  "message": "Client registered successfully",
  "data": {
    "client": {
      "_id": "client_id_here",
      "fullname": "John Smith",
      "email": "john.smith@business.com",
      "businessInfo": {
        "businessName": "Smith Enterprises",
        "industry": "technology",
        "size": "medium",
        "website": "https://smithenterprises.com"
      },
      "company": "company_id_here",
      "status": "active",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `400` - Validation errors
- `409` - Email already exists
- `500` - Server error

---

### **2. Client Login**

#### **POST** `/client/login`

Authenticates a client and returns a JWT token.

**Access Level**: Public

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "john.smith@business.com",
  "password": "SecurePassword123!"
}
```

**Required Fields**:
- `email` (string): Client's email address
- `password` (string): Client's password

**Success Response** (200):
```json
{
  "success": true,
  "message": "Client login successful",
  "data": {
    "client": {
      "_id": "client_id_here",
      "fullname": "John Smith",
      "email": "john.smith@business.com",
      "businessInfo": {
        "businessName": "Smith Enterprises",
        "industry": "technology"
      },
      "company": "company_id_here",
      "status": "active",
      "lastLogin": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `400` - Missing credentials
- `401` - Invalid credentials
- `423` - Account locked
- `500` - Server error

---

### **3. List All Clients**

#### **GET** `/client/list`

Retrieves a paginated list of clients.

**Access Level**: Admin+

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search term for name/email/business
- `status` (string): Filter by status (active, inactive, locked)
- `industry` (string): Filter by industry
- `size` (string): Filter by business size
- `sort` (string): Sort field (default: createdAt)
- `order` (string): Sort order (asc, desc, default: desc)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Clients retrieved successfully",
  "data": {
    "clients": [
      {
        "_id": "client_id_1",
        "fullname": "John Smith",
        "email": "john.smith@business.com",
        "businessInfo": {
          "businessName": "Smith Enterprises",
          "industry": "technology",
          "size": "medium"
        },
        "status": "active",
        "isActive": true,
        "lastLogin": "2024-01-15T09:30:00.000Z",
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

### **4. Get Client Details**

#### **GET** `/client/:id`

Retrieves detailed information about a specific client.

**Access Level**: Admin+, Client (own profile)

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**URL Parameters**:
- `id` (string): Client ID

**Success Response** (200):
```json
{
  "success": true,
  "message": "Client details retrieved successfully",
  "data": {
    "client": {
      "_id": "client_id_here",
      "fullname": "John Smith",
      "email": "john.smith@business.com",
      "phone": "+1234567890",
      "businessInfo": {
        "businessName": "Smith Enterprises",
        "industry": "technology",
        "size": "medium",
        "website": "https://smithenterprises.com",
        "description": "Technology consulting firm"
      },
      "contactInfo": {
        "address": {
          "street": "456 Business Ave",
          "city": "New York",
          "state": "NY",
          "zipCode": "10001",
          "country": "USA"
        },
        "preferredContact": "email",
        "timezone": "America/New_York"
      },
      "company": "company_id_here",
      "status": "active",
      "isActive": true,
      "lastLogin": "2024-01-15T09:30:00.000Z",
      "stats": {
        "totalProjects": 5,
        "activeProjects": 2,
        "completedProjects": 3,
        "totalSpent": 75000
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `400` - Invalid client ID
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Client not found
- `500` - Server error

---

### **5. Update Client**

#### **PUT** `/client/:id` or **POST** `/client/:id/update`

Updates an existing client's information.

**Access Level**: Admin+, Client (own profile)

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**URL Parameters**:
- `id` (string): Client ID

**Request Body**:
```json
{
  "fullname": "John Michael Smith",
  "phone": "+1234567891",
  "businessInfo": {
    "businessName": "Smith Enterprises International",
    "website": "https://smithenterprises-intl.com",
    "description": "Global technology consulting firm"
  },
  "contactInfo": {
    "address": {
      "street": "789 Global Business Blvd",
      "city": "New York",
      "state": "NY",
      "zipCode": "10002"
    },
    "preferredContact": "phone"
  }
}
```

**Updatable Fields**:
- `fullname` (string): Client's full name
- `phone` (string): Phone number
- `businessInfo` (object): Business details
- `contactInfo` (object): Contact preferences
- `communicationPreferences` (object): Communication settings
- `notes` (string): Additional notes

**Success Response** (200):
```json
{
  "success": true,
  "message": "Client updated successfully",
  "data": {
    "client": {
      "_id": "client_id_here",
      "fullname": "John Michael Smith",
      "phone": "+1234567891",
      "businessInfo": {
        "businessName": "Smith Enterprises International",
        "website": "https://smithenterprises-intl.com",
        "description": "Global technology consulting firm"
      },
      "contactInfo": {
        "address": {
          "street": "789 Global Business Blvd",
          "city": "New York",
          "state": "NY",
          "zipCode": "10002"
        },
        "preferredContact": "phone"
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
- `404` - Client not found
- `409` - Email already exists
- `500` - Server error

---

### **6. Delete Client**

#### **DELETE** `/client/:id` or **POST** `/client/:id/delete`

Soft deletes a client (marks as inactive).

**Access Level**: Admin+

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**URL Parameters**:
- `id` (string): Client ID

**Request Body**: None required

**Success Response** (200):
```json
{
  "success": true,
  "message": "Client deleted successfully",
  "data": {
    "client": {
      "_id": "client_id_here",
      "fullname": "John Michael Smith",
      "status": "inactive",
      "isActive": false,
      "deletedAt": "2024-01-15T12:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T12:30:00.000Z"
}
```

**Error Responses**:
- `400` - Invalid client ID
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Client not found
- `409` - Client has active projects
- `500` - Server error

---

### **7. Client Statistics**

#### **GET** `/client/stats/overview`

Retrieves comprehensive statistics about clients.

**Access Level**: Admin+

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
  "message": "Client statistics retrieved successfully",
  "data": {
    "stats": {
      "overview": {
        "totalClients": 150,
        "activeClients": 120,
        "inactiveClients": 25,
        "lockedClients": 5
      },
      "byIndustry": {
        "technology": 45,
        "healthcare": 30,
        "finance": 25,
        "retail": 20,
        "manufacturing": 15,
        "other": 15
      },
      "bySize": {
        "small": 60,
        "medium": 50,
        "large": 25,
        "enterprise": 15
      },
      "activity": {
        "newThisMonth": 12,
        "activeThisMonth": 85,
        "totalRevenue": 1250000,
        "averageProjectValue": 15000
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

### **Client Schema**
```json
{
  "_id": "ObjectId",
  "fullname": "String (required)",
  "email": "String (required, unique)",
  "password": "String (required, hashed)",
  "phone": "String",
  "company": "ObjectId (required, ref: Company)",
  "businessInfo": {
    "businessName": "String",
    "industry": "String",
    "size": "String",
    "website": "String",
    "description": "String",
    "foundedYear": "Number",
    "revenue": "Number",
    "employeeCount": "Number"
  },
  "contactInfo": {
    "address": {
      "street": "String",
      "city": "String",
      "state": "String",
      "zipCode": "String",
      "country": "String"
    },
    "preferredContact": "String (enum: email, phone, sms)",
    "timezone": "String"
  },
  "communicationPreferences": {
    "emailNotifications": "Boolean",
    "smsNotifications": "Boolean",
    "marketingEmails": "Boolean",
    "newsletter": "Boolean"
  },
  "status": "String (enum: active, inactive, locked, pending)",
  "isActive": "Boolean (default: true)",
  "lastLogin": "Date",
  "loginAttempts": "Number (default: 0)",
  "isLocked": "Boolean (default: false)",
  "stats": {
    "totalProjects": "Number",
    "activeProjects": "Number",
    "completedProjects": "Number",
    "totalSpent": "Number"
  },
  "notes": "String",
  "createdAt": "Date",
  "updatedAt": "Date",
  "deletedAt": "Date"
}
```

---

## 📝 **Request Examples**

### **cURL Examples**

#### **Client Registration**
```bash
curl -X POST http://localhost:5000/api/client/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Jane Wilson",
    "email": "jane.wilson@techcorp.com",
    "password": "SecurePass123!",
    "phone": "+1234567892",
    "company": "company_id_here",
    "businessInfo": {
      "businessName": "TechCorp Solutions",
      "industry": "technology",
      "size": "large",
      "website": "https://techcorp.com"
    }
  }'
```

#### **Client Login**
```bash
curl -X POST http://localhost:5000/api/client/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.wilson@techcorp.com",
    "password": "SecurePass123!"
  }'
```

#### **Update Client**
```bash
curl -X PUT http://localhost:5000/api/client/client_id_here \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <client_token>" \
  -d '{
    "fullname": "Jane Elizabeth Wilson",
    "phone": "+1234567893",
    "businessInfo": {
      "businessName": "TechCorp Global Solutions",
      "website": "https://techcorp-global.com"
    }
  }'
```

#### **Get Client Details**
```bash
curl -X GET http://localhost:5000/api/client/client_id_here \
  -H "Authorization: Bearer <admin_token>"
```

#### **List Clients with Filters**
```bash
curl -X GET "http://localhost:5000/api/client/list?page=1&limit=20&industry=technology&size=large" \
  -H "Authorization: Bearer <admin_token>"
```

### **JavaScript Examples**

#### **Client Registration**
```javascript
const response = await fetch('/api/client/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fullname: 'Jane Wilson',
    email: 'jane.wilson@techcorp.com',
    password: 'SecurePass123!',
    phone: '+1234567892',
    company: 'company_id_here',
    businessInfo: {
      businessName: 'TechCorp Solutions',
      industry: 'technology',
      size: 'large',
      website: 'https://techcorp.com'
    }
  })
});

const data = await response.json();
```

#### **Client Login**
```javascript
const response = await fetch('/api/client/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'jane.wilson@techcorp.com',
    password: 'SecurePass123!'
  })
});

const data = await response.json();
localStorage.setItem('clientToken', data.data.token);
```

#### **Update Client**
```javascript
const response = await fetch(`/api/client/${clientId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    fullname: 'Jane Elizabeth Wilson',
    phone: '+1234567893',
    businessInfo: {
      businessName: 'TechCorp Global Solutions',
      website: 'https://techcorp-global.com'
    }
  })
});

const data = await response.json();
```

---

## ❌ **Error Handling**

### **Common Error Codes**

| Status Code | Error Type | Description | Solution |
|-------------|------------|-------------|----------|
| `400` | Bad Request | Invalid client ID, validation errors | Check request parameters and body |
| `401` | Unauthorized | Missing or invalid authentication | Provide valid JWT token |
| `403` | Forbidden | Insufficient permissions | Check user role and company access |
| `404` | Not Found | Client doesn't exist | Verify client ID |
| `409` | Conflict | Email already exists, active dependencies | Use different email or resolve dependencies |
| `423` | Locked | Account locked due to failed attempts | Wait for unlock or contact admin |
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
  "path": "/api/client/register",
  "method": "POST"
}
```

---

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Client Configuration
MAX_CLIENTS_PER_COMPANY=1000
CLIENT_PASSWORD_MIN_LENGTH=8
CLIENT_NAME_MIN_LENGTH=2
CLIENT_NAME_MAX_LENGTH=100

# Validation
ALLOWED_CLIENT_INDUSTRIES=technology,healthcare,finance,retail,manufacturing,education,consulting
ALLOWED_CLIENT_SIZES=small,medium,large,enterprise
ALLOWED_CONTACT_METHODS=email,phone,sms
```

### **Rate Limiting**
- Client registration: 5 requests per hour per IP
- Client login: 10 requests per 15 minutes per IP
- Client updates: 20 requests per hour per IP
- Client listing: 100 requests per hour per IP

---

## 📚 **Related Documentation**

- [API Overview](../README.md) - Complete API reference
- [Authentication APIs](./auth.md) - User authentication
- [Company Management](./company.md) - Company operations
- [Project Management](./project.md) - Project lifecycle
- [Database Models](../database.md) - Client model schema
- [Security Guide](../security.md) - Multi-tenant security

---

**The Client Management APIs provide comprehensive client lifecycle management with secure authentication, profile management, and detailed analytics for business relationship tracking.**
