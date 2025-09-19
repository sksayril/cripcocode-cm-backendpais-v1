# Client Management API Documentation

## Overview
The Client Management API provides endpoints for client authentication, registration, and management. It supports both admin operations (creating/managing clients) and client self-service operations (signup, login, project creation).

## Base URL
```
http://localhost:3500/api/client
```

## Authentication
- **Admin Routes**: Require JWT token with admin/superAdmin role
- **Client Routes**: Require JWT token with client role
- **Public Routes**: No authentication required (signup, login)

## Client Model Schema

### Basic Information
```json
{
  "firstName": "string (required, max 50 chars)",
  "lastName": "string (required, max 50 chars)",
  "email": "string (required, unique, valid email)",
  "phone": "string (required, valid phone format)",
  "password": "string (required, min 8 chars)",
  "role": "string (optional, default: 'client', enum: ['client', 'premium-client', 'enterprise-client'])"
}
```

### Business Information
```json
{
  "companyName": "string (max 100 chars)",
  "industry": "enum (Technology, Healthcare, Finance, Education, Retail, Manufacturing, Real Estate, Marketing, Consulting, Other)",
  "businessType": "enum (Startup, SME, Enterprise, Non-Profit, Government, Other)"
}
```

### Address Information
```json
{
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "zipCode": "string"
  }
}
```

### Communication Preferences
```json
{
  "communicationPreferences": {
    "email": "boolean (default: true)",
    "sms": "boolean (default: false)",
    "phone": "boolean (default: true)",
    "preferredTime": "string (default: '9:00 AM - 6:00 PM')"
  },
  "timezone": "string (default: 'UTC')",
  "language": "string (default: 'en')"
}
```

## API Endpoints

### 1. Client Signup (Public)
**POST** `/signup`

Creates a new client account with pending status. Client must be assigned to a company by super admin.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-123-4567",
  "password": "securePassword123",
  "role": "client",
  "companyName": "Tech Solutions Inc",
  "industry": "Technology",
  "businessType": "SME",
  "address": {
    "street": "123 Tech Street",
    "city": "San Francisco",
    "state": "CA",
    "country": "USA",
    "zipCode": "94105"
  },
  "website": "https://techsolutions.com",
  "socialMedia": {
    "linkedin": "linkedin.com/in/johndoe",
    "twitter": "@johndoe"
  },
  "communicationPreferences": {
    "email": true,
    "sms": false,
    "phone": true,
    "preferredTime": "10:00 AM - 7:00 PM"
  },
  "timezone": "America/Los_Angeles",
  "language": "en"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Client account created successfully. Pending company assignment.",
  "data": {
    "client": {
      "_id": "client_id_here",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "status": "pending",
      "isActive": false,
      "company": null,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

### 2. Client Login (Public)
**POST** `/login`

Authenticates client and returns JWT token.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "client": {
      "_id": "client_id_here",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "status": "active",
      "company": "company_id_here",
      "lastLogin": "2024-01-15T10:30:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

### 3. Client Logout (Client Auth Required)
**POST** `/logout`

Logs out the client (token invalidation handled on client side).

**Headers:**
```
Authorization: Bearer <client_jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### 4. Create Client (Super Admin Only)
**POST** `/create`

Creates a new client and assigns them to a company.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "phone": "+1-555-987-6543",
  "password": "securePassword456",
  "role": "premium-client",
  "companyName": "Marketing Pro",
  "industry": "Marketing",
  "businessType": "Startup",
  "company": "company_id_here",
  "notes": "High potential client for digital marketing services"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Client created and assigned to company successfully",
  "data": {
    "client": {
      "_id": "client_id_here",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com",
      "status": "active",
      "company": "company_id_here",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### 5. Approve Client (Admin/Super Admin Required)
**POST** `/:clientId/approve`

Approves a pending client and assigns them to a company. This activates the client account and allows them to login.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request Body:**
```json
{
  "company": "company_id_here",
  "role": "client",
  "notes": "Approved after verification"
}
```

**Field Details:**
- `company` (required): Company ID to assign the client to
- `role` (optional): Client role - "client", "premium-client", or "enterprise-client" (default: current role)
- `notes` (optional): Additional notes about the approval

**Response (200):**
```json
{
  "success": true,
  "message": "Client approved successfully and assigned to company",
  "data": {
    "client": {
      "_id": "client_id_here",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "status": "active",
      "isActive": true,
      "role": "client",
      "company": {
        "_id": "company_id_here",
        "name": "Tech Solutions Inc",
        "email": "contact@techsolutions.com"
      },
      "assignedBy": "admin_id_here",
      "assignedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400`: Client already approved or company assignment required
- `404`: Client or company not found
- `401`: Unauthorized access

### 6. Get All Clients (Admin Required)
**GET** `/list`

Retrieves a paginated list of clients with filtering options.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search in name, email, company name
- `status` (optional): Filter by status (active, inactive, pending, suspended)
- `industry` (optional): Filter by industry
- `businessType` (optional): Filter by business type
- `company` (optional): Filter by company ID

**Example Request:**
```
GET /api/client/list?page=1&limit=20&status=active&industry=Technology
```

**Response (200):**
```json
{
  "success": true,
  "message": "Clients retrieved successfully",
  "data": {
    "clients": {
      "docs": [
        {
          "_id": "client_id_here",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com",
          "companyName": "Tech Solutions Inc",
          "industry": "Technology",
          "status": "active",
          "company": {
            "_id": "company_id_here",
            "name": "Tech Corp"
          },
          "createdBy": {
            "_id": "admin_id_here",
            "firstName": "Admin",
            "lastName": "User"
          }
        }
      ],
      "totalDocs": 25,
      "limit": 20,
      "page": 1,
      "totalPages": 2
    }
  }
}
```

### 6. Get Client by ID (Admin Required)
**GET** `/:id`

Retrieves detailed information about a specific client.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Client retrieved successfully",
  "data": {
    "client": {
      "_id": "client_id_here",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1-555-123-4567",
      "companyName": "Tech Solutions Inc",
      "industry": "Technology",
      "businessType": "SME",
      "status": "active",
      "totalProjects": 3,
      "activeProjects": 2,
      "completedProjects": 1,
      "totalRevenue": 15000,
      "company": {
        "_id": "company_id_here",
        "name": "Tech Corp",
        "status": "active"
      },
      "notes": [
        {
          "content": "Client assigned to company: Tech Corp. High potential for long-term partnership.",
          "createdBy": {
            "_id": "admin_id_here",
            "firstName": "Admin",
            "lastName": "User"
          },
          "createdAt": "2024-01-15T10:30:00.000Z"
        }
      ]
    }
  }
}
```

### 7. Update Client (Admin Required)
**PUT** `/:id` or **POST** `/:id/update`

Updates client information.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request Body:**
```json
{
  "firstName": "John Updated",
  "phone": "+1-555-999-8888",
  "industry": "Healthcare",
  "notes": "Client updated contact information and industry focus"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Client updated successfully",
  "data": {
    "client": {
      "_id": "client_id_here",
      "firstName": "John Updated",
      "lastName": "Doe",
      "phone": "+1-555-999-8888",
      "industry": "Healthcare",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

### 8. Delete Client (Admin Required)
**DELETE** `/:id` or **POST** `/:id/delete`

Soft deletes a client (sets status to inactive).

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Client deactivated successfully"
}
```

### 9. Reactivate Client (Admin Required)
**PUT** `/:id/reactivate` or **POST** `/:id/reactivate`

Reactivates a deactivated client.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Client reactivated successfully",
  "data": {
    "client": {
      "_id": "client_id_here",
      "status": "active",
      "isActive": true
    }
  }
}
```

### 10. Assign Client to Company (Super Admin Only)
**POST** `/:id/assign-company`

Assigns a client to a specific company.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request Body:**
```json
{
  "company": "company_id_here",
  "notes": "Assigned to Tech Corp for digital marketing services"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Client assigned to company successfully",
  "data": {
    "client": {
      "_id": "client_id_here",
      "company": "company_id_here",
      "status": "active",
      "isActive": true,
      "assignedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### 11. Get Client Statistics (Admin Required)
**GET** `/stats/overview`

Retrieves comprehensive client statistics and analytics.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**
- `company` (optional): Filter by company ID

**Response (200):**
```json
{
  "success": true,
  "message": "Client statistics retrieved successfully",
  "data": {
    "stats": {
      "overview": {
        "totalClients": 150,
        "activeClients": 120,
        "pendingClients": 20,
        "inactiveClients": 10,
        "totalRevenue": 2500000,
        "avgProjectsPerClient": 2.5
      },
      "industryDistribution": [
        {
          "_id": "Technology",
          "count": 45
        },
        {
          "_id": "Healthcare",
          "count": 30
        }
      ],
      "businessTypeDistribution": [
        {
          "_id": "SME",
          "count": 80
        },
        {
          "_id": "Enterprise",
          "count": 40
        }
      ]
    }
  }
}
```

### 12. Get Client Projects (Admin Required)
**GET** `/:id/projects`

Retrieves all projects associated with a specific client.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**
- `status` (optional): Filter by project status
- `projectType` (optional): Filter by project type

**Response (200):**
```json
{
  "success": true,
  "message": "Client projects retrieved successfully",
  "data": {
    "projects": [
      {
        "_id": "project_id_here",
        "title": "Website Redesign",
        "projectType": "development",
        "status": "active",
        "progress": 75,
        "budget": {
          "total": 15000,
          "spent": 11250
        },
        "projectManager": {
          "_id": "admin_id_here",
          "firstName": "Project",
          "lastName": "Manager"
        }
      }
    ]
  }
}
```

## Error Responses

### Common Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}
```

## Access Control Matrix

| Endpoint | Super Admin | Company Admin | Manager | Sales | Support | Client |
|----------|-------------|---------------|---------|-------|---------|---------|
| `/signup` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/login` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/logout` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/create` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/list` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/:id` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/:id/update` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/:id/delete` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/:id/reactivate` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/:id/assign-company` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/stats/overview` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/:id/projects` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

## Rate Limiting
- **Public Routes**: 10 requests per minute per IP
- **Authenticated Routes**: 100 requests per minute per user
- **Admin Routes**: 200 requests per minute per admin

## Security Features
- Password hashing with bcrypt (cost factor 12)
- JWT token authentication
- Account lockout after 5 failed login attempts
- Company-based access control
- Input validation and sanitization
- CORS protection
- Helmet security headers

## Testing Examples

### cURL Examples

#### Client Signup
```bash
curl -X POST http://localhost:5000/api/client/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-123-4567",
    "password": "securePassword123",
    "companyName": "Tech Solutions Inc",
    "industry": "Technology"
  }'
```

#### Client Login
```bash
curl -X POST http://localhost:5000/api/client/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securePassword123"
  }'
```

#### Create Client (Admin)
```bash
curl -X POST http://localhost:5000/api/client/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "phone": "+1-555-987-6543",
    "password": "securePassword456",
    "company": "company_id_here"
  }'
```

### JavaScript Examples

#### Client Signup
```javascript
const response = await fetch('http://localhost:5000/api/client/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-123-4567',
    password: 'securePassword123',
    companyName: 'Tech Solutions Inc',
    industry: 'Technology'
  })
});

const data = await response.json();
console.log(data);
```

#### Get All Clients (Admin)
```javascript
const response = await fetch('http://localhost:5000/api/client/list?page=1&limit=20', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer <admin_jwt_token>'
  }
});

const data = await response.json();
console.log(data);
```

## Notes
- Client accounts start with 'pending' status until assigned to a company
- Only super admins can assign clients to companies
- Company admins can only manage clients within their assigned company
- Client passwords are automatically hashed before storage
- All timestamps are in ISO 8601 format
- Pagination is handled using the `mongoose-paginate-v2` plugin
