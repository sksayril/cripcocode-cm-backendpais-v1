# 👨‍💼 **Employee Management APIs**

## **Overview**
The Employee Management module provides comprehensive functionality for managing employees, their roles, departments, project assignments, and performance tracking. It supports role-based access control with different permission levels for various employee types.

## **🔐 Authentication**
All employee management endpoints require authentication using JWT tokens. Different endpoints have different access levels:
- **Public**: Employee login/logout
- **Admin**: Most employee management operations
- **Super Admin**: Company-wide employee creation

## **👥 Employee Types & Departments**

### **Employee Roles:**
- `junior` - Entry level employees
- `senior` - Experienced employees
- `lead` - Team leaders
- `manager` - Department managers
- `director` - Executive level

### **Departments:**
- `development` - Software development
- `digital-marketing` - Digital marketing
- `graphics-design` - Graphic design
- `hr` - Human resources
- `accounting` - Finance & accounting
- `sales` - Sales & business development
- `support` - Customer support
- `management` - Executive management

## **📋 API Endpoints**

### **1. Employee Authentication**

#### **Employee Login**
```http
POST /api/employee/login
```

**Request Body:**
```json
{
  "email": "employee@company.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "employee": {
      "id": "employee_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "employee@company.com",
      "department": "development",
      "role": "senior",
      "designation": "Senior Developer",
      "company": {
        "id": "company_id",
        "name": "Tech Corp",
        "status": "active"
      },
      "permissions": {
        "canCreateProjects": false,
        "canAssignTasks": true,
        "canViewAllProjects": true,
        "canManageTeam": false,
        "canViewReports": true,
        "canManageClients": false
      }
    },
    "token": "jwt_token_here"
  }
}
```

#### **Employee Logout**
```http
POST /api/employee/logout
```

**Headers:**
```
Authorization: Bearer <employee_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### **2. Employee Management (Admin Only)**

#### **Create Employee**
```http
POST /api/employee/create
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "username": "john_doe",
  "email": "john.doe@company.com",
  "phone": "+1-555-123-4567",
  "password": "securepassword123",
  "department": "development",
  "role": "developer",
  "designation": "Senior Developer",
  "company": "company_id_here",
  "skills": [
    {
      "name": "JavaScript",
      "level": "advanced",
      "yearsOfExperience": 5
    },
    {
      "name": "Node.js",
      "level": "expert",
      "yearsOfExperience": 4
    }
  ],
  "joiningDate": "2024-01-15",
  "contractType": "full-time",
  "salary": {
    "amount": 75000,
    "currency": "USD",
    "frequency": "monthly"
  },
  "workSchedule": {
    "startTime": "09:00",
    "endTime": "18:00",
    "timezone": "UTC",
    "workingDays": ["monday", "tuesday", "wednesday", "thursday", "friday"]
  },
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipCode": "10001"
  },
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "Spouse",
    "phone": "+1-555-987-6543",
    "email": "jane.doe@email.com"
  }
}
```

**Required Fields:**
- `firstName` (string): Employee's first name
- `lastName` (string): Employee's last name  
- `username` (string): Unique username (3-30 characters, alphanumeric and underscores only)
- `email` (string): Valid email address (must be unique)
- `phone` (string): Phone number
- `password` (string): Password (minimum 6 characters)
- `department` (string): Department name (see enum values below)
- `role` (string): Employee role (see enum values below)
- `designation` (string): Job designation/title
- `company` (string): Company ID (required for super admin, auto-assigned for company admin)

**Optional Fields:**
- `skills` (array): Array of skill objects with name, level, and yearsOfExperience
- `joiningDate` (string): Date in YYYY-MM-DD format (defaults to current date)
- `contractType` (string): full-time, part-time, contract, or intern (defaults to full-time)
- `salary` (object): Salary information with amount, currency, and frequency
- `workSchedule` (object): Work schedule with startTime, endTime, timezone, and workingDays
- `address` (object): Address information
- `emergencyContact` (object): Emergency contact details

**Department Enum Values:**
- `development`, `digital-marketing`, `graphics-design`, `hr`, `accounting`, `sales`, `support`, `management`, `design`, `engineering`, `it`, `marketing`, `operations`, `finance`, `legal`, `research`, `other`

**Role Enum Values:**
- `junior`, `senior`, `lead`, `manager`, `director`, `designer`, `developer`, `analyst`, `specialist`, `coordinator`, `assistant`, `consultant`, `other`

**Company ID Requirements:**
- **Super Admin**: Must provide `company` field in request body
- **Company Admin**: Company ID is automatically assigned from admin's company
- **Other Roles**: Not authorized to create employees

**Response:**
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "employee": {
      "id": "employee_id",
      "employeeId": "EMP0001",
      "firstName": "Jane",
      "lastName": "Smith",
      "username": "jane_smith",
      "email": "jane.smith@company.com",
      "department": "development",
      "role": "senior",
      "designation": "Senior Developer",
      "company": {
        "id": "company_id",
        "name": "Tech Corp",
        "status": "active"
      },
      "createdBy": {
        "id": "admin_id",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@company.com"
      },
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

#### **Get All Employees**
```http
GET /api/employee/list?page=1&limit=10&department=development&role=senior&status=active&search=john
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `department` - Filter by department
- `role` - Filter by role
- `status` - Filter by status (active, inactive, locked)
- `search` - Search in name, email, employee ID, designation

**Response:**
```json
{
  "success": true,
  "message": "Employees retrieved successfully",
  "data": {
    "employees": {
      "docs": [
        {
          "id": "employee_id",
          "employeeId": "TEC0001",
          "firstName": "Jane",
          "lastName": "Smith",
          "email": "jane.smith@company.com",
          "department": "development",
          "role": "senior",
          "designation": "Senior Developer",
          "company": {
            "id": "company_id",
            "name": "Tech Corp",
            "status": "active"
          },
          "isActive": true,
          "createdAt": "2024-01-15T10:00:00.000Z"
        }
      ],
      "totalDocs": 25,
      "limit": 10,
      "page": 1,
      "totalPages": 3
    }
  }
}
```

#### **Get Employee by ID**
```http
GET /api/employee/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Employee retrieved successfully",
  "data": {
    "employee": {
      "id": "employee_id",
      "employeeId": "TEC0001",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@company.com",
      "department": "development",
      "role": "senior",
      "designation": "Senior Developer",
      "company": {
        "id": "company_id",
        "name": "Tech Corp",
        "status": "active"
      },
      "skills": [...],
      "assignedProjects": [...],
      "currentTasks": [...],
      "performance": {
        "completedTasks": 45,
        "totalProjects": 12,
        "averageRating": 4.2
      },
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

#### **Update Employee**
```http
PUT /api/employee/:id
POST /api/employee/:id/update
```

**Request Body:**
```json
{
  "designation": "Lead Developer",
  "role": "lead",
  "skills": [
    {
      "name": "Node.js",
      "level": "advanced",
      "yearsOfExperience": 2
    }
  ]
}
```

#### **Update Employee Password**
```http
PUT /api/employee/:id/password
POST /api/employee/:id/password
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

#### **Delete Employee (Soft Delete)**
```http
DELETE /api/employee/:id
POST /api/employee/:id/delete
```

#### **Reactivate Employee**
```http
PUT /api/employee/:id/reactivate
POST /api/employee/:id/reactivate
```

### **3. Project Assignment Management**

#### **Assign Employee to Project**
```http
POST /api/employee/:employeeId/projects/:projectId/assign
```

**Request Body:**
```json
{
  "role": "Developer",
  "responsibilities": [
    "Frontend development",
    "Code review",
    "Testing"
  ]
}
```

#### **Remove Employee from Project**
```http
DELETE /api/employee/:employeeId/projects/:projectId/remove
POST /api/employee/:employeeId/projects/:projectId/remove
```

### **4. Employee Dashboard (Employee Access)**

#### **Get Employee Dashboard**
```http
GET /api/employee/dashboard
```

**Headers:**
```
Authorization: Bearer <employee_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "dashboard": {
      "employee": {
        "id": "employee_id",
        "name": "Jane Smith",
        "department": "development",
        "role": "senior",
        "designation": "Senior Developer",
        "company": {
          "id": "company_id",
          "name": "Tech Corp",
          "status": "active"
        }
      },
      "statistics": {
        "tasks": {
          "totalTasks": 15,
          "completedTasks": 8,
          "inProgressTasks": 4,
          "overdueTasks": 1,
          "totalHours": 120
        },
        "projects": {
          "totalProjects": 3,
          "activeProjects": 2,
          "completedProjects": 1,
          "avgProgress": 75
        }
      },
      "currentWork": {
        "assignedProjects": [...],
        "currentTasks": [...]
      },
      "recentActivities": [...]
    }
  }
}
```

### **5. Employee Analytics (Admin Only)**

#### **Get Employee Statistics**
```http
GET /api/employee/stats/overview?department=development&role=senior
```

**Response:**
```json
{
  "success": true,
  "message": "Employee statistics retrieved successfully",
  "data": {
    "stats": {
      "overview": {
        "totalEmployees": 45,
        "activeEmployees": 42,
        "lockedAccounts": 1,
        "avgRating": 4.1
      },
      "departmentDistribution": [
        {
          "_id": "development",
          "count": 20,
          "avgRating": 4.2
        },
        {
          "_id": "marketing",
          "count": 15,
          "avgRating": 4.0
        }
      ],
      "roleDistribution": [
        {
          "_id": "junior",
          "count": 15,
          "avgRating": 3.8
        },
        {
          "_id": "senior",
          "count": 20,
          "avgRating": 4.2
        }
      ]
    }
  }
}
```

## **🔒 Access Control Matrix**

| Endpoint | Super Admin | Company Admin | Employee |
|----------|-------------|---------------|----------|
| `/login` | ✅ | ✅ | ✅ |
| `/logout` | ✅ | ✅ | ✅ |
| `/create` | ✅ | ❌ | ❌ |
| `/list` | ✅ | ✅ | ❌ |
| `/:id` | ✅ | ✅ | ❌ |
| `/update` | ✅ | ✅ | ❌ |
| `/password` | ✅ | ✅ | ❌ |
| `/delete` | ✅ | ✅ | ❌ |
| `/reactivate` | ✅ | ✅ | ❌ |
| `/projects/assign` | ✅ | ✅ | ❌ |
| `/projects/remove` | ✅ | ✅ | ❌ |
| `/dashboard` | ❌ | ❌ | ✅ |
| `/stats/overview` | ✅ | ✅ | ❌ |

## **📊 Data Models**

### **Employee Schema**
```json
{
  "firstName": "string (required)",
  "lastName": "string (required)",
  "email": "string (required, unique)",
  "phone": "string (required)",
  "password": "string (required, min: 6)",
  "company": "ObjectId (required, ref: Company)",
  "department": "enum (required)",
  "role": "enum (required)",
  "designation": "string (required)",
  "skills": "array of skill objects",
  "assignedProjects": "array of project assignments",
  "currentTasks": "array of current tasks",
  "workSchedule": "work schedule object",
  "performance": "performance statistics",
  "isActive": "boolean (default: true)",
  "permissions": "permission object",
  "createdBy": "ObjectId (required, ref: Admin)"
}
```

### **Skill Object**
```json
{
  "name": "string (required)",
  "level": "enum (beginner, intermediate, advanced, expert)",
  "yearsOfExperience": "number (min: 0)"
}
```

### **Project Assignment**
```json
{
  "project": "ObjectId (ref: Project)",
  "role": "string (required)",
  "assignedDate": "date (default: now)",
  "isActive": "boolean (default: true)",
  "responsibilities": "array of strings"
}
```

## **🚀 Testing Examples**

### **cURL Examples**

#### **Employee Login**
```bash
curl -X POST http://localhost:3500/api/employee/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employee@company.com",
    "password": "password123"
  }'
```

#### **Create Employee (Admin)**
```bash
curl -X POST http://localhost:3500/api/employee/create \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "username": "john_doe",
    "email": "john.doe@company.com",
    "phone": "+1234567890",
    "password": "password123",
    "department": "development",
    "role": "senior",
    "designation": "Senior Developer",
    "company": "company_id_here",
    "joiningDate": "2024-01-15",
    "skills": [
      {
        "name": "JavaScript",
        "level": "advanced",
        "yearsOfExperience": 5
      }
    ],
    "workSchedule": {
      "startTime": "09:00",
      "endTime": "18:00",
      "timezone": "UTC",
      "workingDays": ["monday", "tuesday", "wednesday", "thursday", "friday"]
    }
  }'
```

#### **Get Employee Dashboard**
```bash
curl -X GET http://localhost:3500/api/employee/dashboard \
  -H "Authorization: Bearer <employee_token>"
```

### **JavaScript Examples**

#### **Employee Login**
```javascript
const response = await fetch('/api/employee/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'employee@company.com',
    password: 'password123'
  })
});

const data = await response.json();
const token = data.data.token;
```

#### **Create Employee**
```javascript
const response = await fetch('/api/employee/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    firstName: 'Jane',
    lastName: 'Smith',
    username: 'jane_smith',
    email: 'jane.smith@company.com',
    phone: '+1234567890',
    password: 'password123',
    department: 'development',
    role: 'senior',
    designation: 'Senior Developer',
    company: 'company_id_here',
    joiningDate: '2024-01-15',
    skills: [
      {
        name: 'JavaScript',
        level: 'advanced',
        yearsOfExperience: 5
      }
    ],
    workSchedule: {
      startTime: '09:00',
      endTime: '18:00',
      timezone: 'UTC',
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    }
  })
});
```

## **⚠️ Error Handling**

### **Common Error Responses**

#### **Authentication Error**
```json
{
  "success": false,
  "message": "Access denied. No token provided.",
  "statusCode": 401
}
```

#### **Validation Error**
```json
{
  "success": false,
  "message": "Missing required fields",
  "statusCode": 400
}
```

#### **Access Denied**
```json
{
  "success": false,
  "message": "Access denied. Employee belongs to different company.",
  "statusCode": 403
}
```

#### **Not Found**
```json
{
  "success": false,
  "message": "Employee not found",
  "statusCode": 404
}
```

## **🔧 Best Practices**

1. **Password Security**: Always use strong passwords and never expose them in responses
2. **Token Management**: Store JWT tokens securely and implement proper logout
3. **Permission Checking**: Always verify employee permissions before allowing operations
4. **Data Validation**: Validate all input data on both client and server side
5. **Error Handling**: Implement proper error handling and user-friendly error messages
6. **Rate Limiting**: Consider implementing rate limiting for authentication endpoints
7. **Audit Logging**: Log important employee management operations for compliance

## **📈 Performance Considerations**

1. **Pagination**: Use pagination for large employee lists
2. **Indexing**: Ensure proper database indexing on frequently queried fields
3. **Caching**: Consider caching employee data for frequently accessed information
4. **Lazy Loading**: Load detailed employee information only when needed
5. **Search Optimization**: Implement efficient search algorithms for employee lookup
