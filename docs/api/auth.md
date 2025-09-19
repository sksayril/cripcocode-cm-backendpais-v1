# 🔐 Authentication APIs

## 📋 **Overview**

The Authentication APIs provide secure user authentication and authorization for the CRIPCOCODE CRM system. These endpoints handle user registration, login, logout, and token management.

## 🔗 **Base Endpoints**

```
Base URL: /api/auth
```

## 📝 **API Endpoints**

### **1. User Registration**

#### **POST** `/auth/signup`

Creates a new user account in the system.

**Access Level**: Public

**Request Body**:
```json
{
  "fullname": "John Doe",
  "username": "johndoe",
  "email": "john@company.com",
  "password": "SecurePassword123!",
  "phone": "+1234567890",
  "role": "admin",
  "company": "company_id_here"
}
```

**Required Fields**:
- `fullname` (string): User's full name
- `username` (string): Unique username (3-30 characters)
- `email` (string): Valid email address
- `password` (string): Strong password (min 8 characters)
- `role` (string): User role (admin, manager, sales, support)
- `company` (string): Company ID reference

**Optional Fields**:
- `phone` (string): Phone number
- `department` (string): Department name
- `adminArea` (string): Admin specialization area

**Success Response** (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id_here",
      "fullname": "John Doe",
      "username": "johndoe",
      "email": "john@company.com",
      "role": "admin",
      "company": "company_id_here",
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
- `409` - Username/email already exists
- `500` - Server error

---

### **2. General Login**

#### **POST** `/auth/login`

Authenticates a user and returns a JWT token.

**Access Level**: Public

**Request Body**:
```json
{
  "email": "john@company.com",
  "password": "SecurePassword123!"
}
```

**Required Fields**:
- `email` (string): User's email address
- `password` (string): User's password

**Success Response** (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id_here",
      "fullname": "John Doe",
      "username": "johndoe",
      "email": "john@company.com",
      "role": "admin",
      "company": "company_id_here",
      "permissions": {
        "canManageUsers": true,
        "canManageAdmins": true,
        "canManageCompany": true,
        "canViewReports": true,
        "canManageProjects": true,
        "canManageBilling": true
      }
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

### **3. Super Admin Login**

#### **POST** `/auth/superAdmin/login`

Authenticates a super admin user with elevated privileges.

**Access Level**: Public

**Request Body**:
```json
{
  "username": "superAdmin",
  "password": "SuperAdminPassword123!"
}
```

**Required Fields**:
- `username` (string): Super admin username
- `password` (string): Super admin password

**Success Response** (200):
```json
{
  "success": true,
  "message": "Super admin login successful",
  "data": {
    "user": {
      "_id": "super_admin_id",
      "username": "superAdmin",
      "role": "superAdmin",
      "permissions": {
        "canManageSystem": true,
        "canManageCompanies": true,
        "canManageAllAdmins": true,
        "canViewAllData": true
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `400` - Missing credentials
- `401` - Invalid super admin credentials
- `500` - Server error

---

### **4. Admin Login**

#### **POST** `/auth/admin/login`

Authenticates an admin user with company-specific access.

**Access Level**: Public

**Request Body**:
```json
{
  "email": "admin@company.com",
  "password": "AdminPassword123!"
}
```

**Required Fields**:
- `email` (string): Admin's email address
- `password` (string): Admin's password

**Success Response** (200):
```json
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "user": {
      "_id": "admin_id_here",
      "fullname": "Admin User",
      "email": "admin@company.com",
      "role": "CompanyAdmin",
      "company": "company_id_here",
      "permissions": {
        "canManageUsers": true,
        "canManageAdmins": true,
        "canManageCompany": true,
        "canViewReports": true
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `400` - Missing credentials
- `401` - Invalid admin credentials
- `423` - Admin account locked
- `500` - Server error

---

### **5. General Logout**

#### **POST** `/auth/logout`

Logs out a user and invalidates their JWT token.

**Access Level**: Authenticated

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**: None required

**Success Response** (200):
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `401` - Invalid or missing token
- `500` - Server error

---

### **6. Super Admin Logout**

#### **POST** `/auth/superAdmin/logout`

Logs out a super admin user and invalidates their token.

**Access Level**: Super Admin

**Headers**:
```
Authorization: Bearer <super_admin_jwt_token>
```

**Request Body**: None required

**Success Response** (200):
```json
{
  "success": true,
  "message": "Super admin logout successful",
  "data": null,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `401` - Invalid or missing token
- `403` - Insufficient permissions
- `500` - Server error

---

### **7. Admin Logout**

#### **POST** `/auth/admin/logout`

Logs out an admin user and invalidates their token.

**Access Level**: Admin+

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Request Body**: None required

**Success Response** (200):
```json
{
  "success": true,
  "message": "Admin logout successful",
  "data": null,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `401` - Invalid or missing token
- `403` - Insufficient permissions
- `500` - Server error

---

## 🔐 **Token Management**

### **Token Structure**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "user_id_here",
    "username": "username_here",
    "email": "email@company.com",
    "role": "admin",
    "company": "company_id_here",
    "permissions": {
      "canManageUsers": true,
      "canManageAdmins": true,
      "canManageCompany": true
    },
    "iat": 1642239000,
    "exp": 1642325400
  }
}
```

### **Token Expiration**
- **Access Token**: 24 hours
- **Refresh Token**: 7 days
- **Configurable**: Set in environment variables

### **Token Blacklisting**
- Logged out tokens are blacklisted
- Blacklisted tokens cannot be reused
- Automatic cleanup of expired blacklisted tokens

---

## 🚨 **Security Features**

### **Password Requirements**
- Minimum 8 characters
- Must contain uppercase, lowercase, number, and special character
- Password hashing using bcryptjs
- Salt rounds: 12

### **Login Attempt Protection**
- Maximum 5 failed login attempts
- Account locked for 15 minutes after 5 failed attempts
- Automatic unlock after lockout period
- Admin can manually unlock accounts

### **Rate Limiting**
- Authentication endpoints: 10 requests per 15 minutes per IP
- Prevents brute force attacks
- Returns 429 status with retry-after header

---

## 📝 **Request Examples**

### **cURL Examples**

#### **User Registration**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Jane Smith",
    "username": "janesmith",
    "email": "jane@company.com",
    "password": "SecurePass123!",
    "role": "manager",
    "company": "company_id_here"
  }'
```

#### **User Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@company.com",
    "password": "SecurePass123!"
  }'
```

#### **Logout**
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer <your_jwt_token>"
```

### **JavaScript Examples**

#### **User Registration**
```javascript
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fullname: 'Jane Smith',
    username: 'janesmith',
    email: 'jane@company.com',
    password: 'SecurePass123!',
    role: 'manager',
    company: 'company_id_here'
  })
});

const data = await response.json();
```

#### **User Login**
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'jane@company.com',
    password: 'SecurePass123!'
  })
});

const data = await response.json();
localStorage.setItem('token', data.data.token);
```

---

## ❌ **Error Handling**

### **Common Error Codes**

| Status Code | Error Type | Description | Solution |
|-------------|------------|-------------|----------|
| `400` | Bad Request | Missing required fields, validation errors | Check request body and required fields |
| `401` | Unauthorized | Invalid credentials, expired token | Verify credentials or refresh token |
| `403` | Forbidden | Insufficient permissions | Check user role and permissions |
| `409` | Conflict | Username/email already exists | Use different username/email |
| `423` | Locked | Account locked due to failed attempts | Wait for unlock or contact admin |
| `429` | Too Many Requests | Rate limit exceeded | Wait before retrying |
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
  "path": "/api/auth/signup",
  "method": "POST"
}
```

---

## 🔧 **Configuration**

### **Environment Variables**
```bash
# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Password Configuration
PASSWORD_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=15m

# Rate Limiting
AUTH_RATE_LIMIT=10
AUTH_RATE_WINDOW=15m
```

### **Token Blacklist Configuration**
- Redis (recommended for production)
- In-memory storage (development)
- Automatic cleanup interval: 1 hour

---

## 📚 **Related Documentation**

- [API Overview](../README.md) - Complete API reference
- [Security Guide](../security.md) - Security best practices
- [Database Models](../database.md) - User and Admin models
- [Middleware](../middleware.md) - Authentication middleware

---

**The Authentication APIs provide secure, scalable user authentication with comprehensive security features and detailed error handling.**
