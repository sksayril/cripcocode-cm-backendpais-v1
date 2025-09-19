# 🔐 Authentication APIs

This document describes the Authentication API endpoints for user login, logout, and session management in the CRM system.

## 🔐 **Access Control**

- **Base Path**: `/api/auth`
- **Authentication**: Most endpoints are public (no token required)
- **Rate Limiting**: Applied to prevent brute force attacks

## 📋 **API Endpoints**

### **1. Super Admin Signup**

Creates a new superAdmin user in the system.

```http
POST /api/auth/signup
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "superAdmin",
  "email": "admin@cripcocode.com",
  "phone": "+1-555-123-4567",
  "role": "superAdmin",
  "password": "securepassword123"
}
```

**Required Fields:**
- `username` (string): Unique username (3-50 chars, alphanumeric + underscore)
- `email` (string): Unique email address
- `phone` (string): Phone number
- `role` (string): Must be "superAdmin" or "admin"
- `password` (string): Password (min 6 characters)

**Role Options:**
- `superAdmin`: System administrator with full access
- `admin`: Regular admin user

**Success Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439012",
      "username": "superAdmin",
      "email": "admin@cripcocode.com",
      "phone": "+1-555-123-4567",
      "role": "superAdmin",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": "24h"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "User with this email, username, or phone already exists"
}
```

---

### **2. General Login**

Authenticates any user with email and password.

```http
POST /api/auth/login
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "admin@company.com",
  "password": "password123"
}
```

**Required Fields:**
- `email` (string): User's email address
- `password` (string): User's password

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439013",
      "username": "johndoe",
      "email": "admin@company.com",
      "phone": "+1-555-123-4567",
      "role": "CompanyAdmin",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": "24h"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### **3. Super Admin Login**

Specific endpoint for superAdmin authentication with additional validation.

```http
POST /api/auth/superAdmin/login
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "admin@cripcocode.com",
  "password": "password123"
}
```

**Required Fields:**
- `email` (string): Super-admin's email address
- `password` (string): Super-admin's password

**Access Control:**
- Only users with `superAdmin` role can use this endpoint

**Success Response (200):**
```json
{
  "success": true,
  "message": "Super-admin login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439012",
      "username": "superAdmin",
      "email": "admin@cripcocode.com",
      "phone": "+1-555-123-4567",
      "role": "superAdmin",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "isSuperAdmin": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": "24h",
    "permissions": {
      "canManageUsers": true,
      "canManageAdmins": true,
      "canAccessAllData": true,
      "canModifySystem": true
    }
  }
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "Access denied. Super-admin role required for this endpoint"
}
```

---

### **4. Admin Login**

Specific endpoint for admin authentication with role validation.

```http
POST /api/auth/admin/login
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "admin@company.com",
  "password": "password123"
}
```

**Required Fields:**
- `email` (string): Admin's email address
- `password` (string): Admin's password

**Access Control:**
- Users with `admin` or `superAdmin` role can use this endpoint

**Success Response (200):**
```json
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439013",
      "username": "johndoe",
      "email": "admin@company.com",
      "phone": "+1-555-123-4567",
      "role": "CompanyAdmin",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "isAdmin": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": "24h",
    "permissions": {
      "canManageUsers": true,
      "canManageAdmins": true,
      "canAccessAllData": true,
      "canModifySystem": false
    }
  }
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "Access denied. Admin role required for this endpoint"
}
```

---

### **5. General Logout**

Logs out any authenticated user by blacklisting their token.

```http
POST /api/auth/logout
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": {
    "message": "Token has been invalidated. Please login again to get a new token.",
    "logoutTime": "2024-01-15T16:00:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Token is required for logout"
}
```

---

### **6. Super Admin Logout**

Specific logout endpoint for superAdmin users.

```http
POST /api/auth/superAdmin/logout
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Access Control:**
- Only users with `superAdmin` role can use this endpoint

**Success Response (200):**
```json
{
  "success": true,
  "message": "Super-admin logout successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439012",
      "username": "superAdmin",
      "email": "admin@cripcocode.com",
      "role": "superAdmin"
    },
    "message": "Token has been invalidated. Please login again to get a new token.",
    "logoutTime": "2024-01-15T16:00:00.000Z",
    "sessionEnded": true
  }
}
```

---

### **7. Admin Logout**

Specific logout endpoint for admin users.

```http
POST /api/auth/admin/logout
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Access Control:**
- Users with `admin` or `superAdmin` role can use this endpoint

**Success Response (200):**
```json
{
  "success": true,
  "message": "Admin logout successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439013",
      "username": "johndoe",
      "email": "admin@company.com",
      "role": "CompanyAdmin"
    },
    "message": "Token has been invalidated. Please login again to get a new token.",
    "logoutTime": "2024-01-15T16:00:00.000Z",
    "sessionEnded": true
  }
}
```

---

### **8. Get Logout Status**

Retrieves information about blacklisted tokens (for debugging).

```http
GET /api/auth/logout/status
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout status retrieved",
  "data": {
    "blacklistedTokensCount": 15,
    "message": "This endpoint shows the count of blacklisted tokens"
  }
}
```

---

## 🔐 **JWT Token Structure**

### **Token Payload**

```json
{
  "userId": "507f1f77bcf86cd799439013",
  "username": "johndoe",
  "email": "admin@company.com",
  "role": "CompanyAdmin",
  "company": "507f1f77bcf86cd799439011",
  "permissions": {
    "canManageUsers": true,
    "canManageAdmins": true,
    "canManageCompany": true,
    "canViewReports": true,
    "canManageProjects": true,
    "canManageBilling": true
  },
  "iat": 1705312200,
  "exp": 1705398600
}
```

### **Token Fields**

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | Unique user identifier |
| `username` | string | User's username |
| `email` | string | User's email address |
| `role` | string | User's role in the system |
| `company` | string | Company ID (if applicable) |
| `permissions` | object | User's permission set |
| `iat` | number | Token issued at timestamp |
| `exp` | number | Token expiration timestamp |

## 🔒 **Security Features**

### **Password Security**

- **Hashing**: Passwords are hashed using bcrypt with cost factor 12
- **Minimum Length**: Passwords must be at least 6 characters
- **No Plain Text**: Passwords are never stored in plain text

### **Token Security**

- **JWT Secret**: Uses environment variable `JWT_SECRET`
- **Expiration**: Configurable token expiration (default: 24h)
- **Blacklisting**: Logged out tokens are blacklisted
- **HTTPS**: Production should use HTTPS for secure transmission

### **Rate Limiting**

- **Login Attempts**: Limited to prevent brute force attacks
- **Account Locking**: Accounts locked after 5 failed attempts
- **Lock Duration**: 2-hour lock period for security

### **Session Management**

- **Token Validation**: Each request validates token authenticity
- **Role Verification**: Token contains user role and permissions
- **Company Isolation**: Users can only access their company data

## 📝 **Data Models**

### **User Schema**

```json
{
  "username": "string (required, 3-50 chars, alphanumeric + underscore)",
  "email": "string (required, unique, email format)",
  "phone": "string (required, unique, phone format)",
  "role": "enum (superAdmin|admin)",
  "password": "string (required, min: 6 chars)",
  "isActive": "boolean (default: true)",
  "createdAt": "Date (auto-generated)",
  "updatedAt": "Date (auto-updated)"
}
```

## ⚠️ **Important Notes**

1. **Token Expiration**: JWT tokens expire after 24 hours by default
2. **Blacklisting**: Logged out tokens are immediately invalidated
3. **Role Validation**: Each endpoint validates user role and permissions
4. **Company Access**: Users can only access data from their assigned company
5. **Password Security**: Passwords are automatically hashed before storage
6. **Account Locking**: Failed login attempts can lock accounts temporarily

## 🧪 **Testing Examples**

### **cURL Examples**

```bash
# Super Admin Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superAdmin",
    "email": "admin@cripcocode.com",
    "phone": "+1-555-123-4567",
    "role": "superAdmin",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "password123"
  }'

# Logout
curl -X POST http://localhost:3500/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **JavaScript Examples**

```javascript
// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@company.com',
    password: 'password123'
  })
});

const { token } = await loginResponse.json();

// Use token for authenticated requests
const adminResponse = await fetch('/api/admin/list', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Logout
await fetch('/api/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 🔄 **Authentication Flow**

### **1. User Registration**
```
User submits signup form → API validates data → User created → JWT token generated → Token returned
```

### **2. User Login**
```
User submits login form → API validates credentials → JWT token generated → Token returned
```

### **3. Authenticated Requests**
```
Client includes token in header → API validates token → Request processed → Response returned
```

### **4. User Logout**
```
Client sends logout request → API blacklists token → Token becomes invalid → User must login again
```

---

**Next**: [Company Management APIs](./company.md) | [Admin Management APIs](./admin.md)
