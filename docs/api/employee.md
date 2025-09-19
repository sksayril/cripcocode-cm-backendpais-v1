# 👨‍💼 Employee Management APIs

## 📋 **Overview**

The Employee Management APIs provide comprehensive functionality for managing employees within the CRIPCOCODE CRM system. These endpoints handle employee creation, profile management, project assignments, and performance tracking with multi-tenant architecture support.

## 🔗 **Base Endpoints**

```
Base URL: /api/employee
```

## 🔐 **Access Control**

- **Super Admin**: Full access to all employees across all companies
- **Company Admin**: Access only to employees within their company
- **Manager**: Full access to employees within their company
- **HR**: Read and limited update access to employee information
- **Other Roles**: Read-only access to employee information within their company

## 📝 **API Endpoints**

### **1. Create Employee**

#### **POST** `/employee/create`

Creates a new employee in the system.

**Access Level**: Admin+

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "fullname": "Sarah Johnson",
  "email": "sarah.johnson@company.com",
  "password": "SecurePassword123!",
  "phone": "+1234567890",
  "role": "developer",
  "department": "development",
  "designation": "Senior Frontend Developer",
  "company": "company_id_here",
  "hireDate": "2024-01-15",
  "salary": 75000,
  "skills": ["react", "typescript", "nodejs", "mongodb"],
  "experience": {
    "years": 5,
    "previousCompanies": ["TechCorp", "WebSolutions"],
    "specializations": ["frontend-development", "ui-ux"]
  },
  "workSchedule": {
    "type": "full-time",
    "hoursPerWeek": 40,
    "timezone": "America/New_York"
  }
}
```

**Required Fields**:
- `fullname` (string): Employee's full name
- `email` (string): Valid email address
- `password` (string): Strong password (min 8 characters)
- `role` (string): Employee role
- `department` (string): Department name
- `company` (string): Company ID reference

**Optional Fields**:
- `phone` (string): Phone number
- `designation` (string): Job title/designation
- `hireDate` (date): Date of hire
- `salary` (number): Annual salary
- `skills` (array): Technical skills
- `experience` (object): Work experience details
- `workSchedule` (object): Work schedule details
- `address` (object): Employee address
- `emergencyContact` (object): Emergency contact information

**Success Response** (201):
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "employee": {
      "_id": "employee_id_here",
      "fullname": "Sarah Johnson",
      "email": "sarah.johnson@company.com",
      "role": "developer",
      "department": "development",
      "designation": "Senior Frontend Developer",
      "company": "company_id_here",
      "hireDate": "2024-01-15T00:00:00.000Z",
      "salary": 75000,
      "skills": ["react", "typescript", "nodejs", "mongodb"],
      "workSchedule": {
        "type": "full-time",
        "hoursPerWeek": 40,
        "timezone": "America/New_York"
      },
      "status": "active",
      "isActive": true,
      "employeeId": "EMP001",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "createdBy": "admin_id_here"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `400` - Validation errors
- `401` - Unauthorized
- `403` - Insufficient permissions
- `409` - Email already exists
- `500` - Server error

---

### **2. List All Employees**

#### **GET** `/employee/list`

Retrieves a paginated list of employees.

**Access Level**: Admin+

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search term for name/email
- `role` (string): Filter by role
- `department` (string): Filter by department
- `status` (string): Filter by status (active, inactive, terminated)
- `company` (string): Filter by company (super admin only)
- `sort` (string): Sort field (default: createdAt)
- `order` (string): Sort order (asc, desc, default: desc)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Employees retrieved successfully",
  "data": {
    "employees": [
      {
        "_id": "employee_id_1",
        "fullname": "Sarah Johnson",
        "email": "sarah.johnson@company.com",
        "role": "developer",
        "department": "development",
        "designation": "Senior Frontend Developer",
        "company": "company_id_here",
        "status": "active",
        "isActive": true,
        "employeeId": "EMP001",
        "hireDate": "2024-01-15T00:00:00.000Z",
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

### **3. Get Employee Details**

#### **GET** `/employee/:id`

Retrieves detailed information about a specific employee.

**Access Level**: Admin+, Employee (own profile)

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**URL Parameters**:
- `id` (string): Employee ID

**Success Response** (200):
```json
{
  "success": true,
  "message": "Employee details retrieved successfully",
  "data": {
    "employee": {
      "_id": "employee_id_here",
      "fullname": "Sarah Johnson",
      "email": "sarah.johnson@company.com",
      "phone": "+1234567890",
      "role": "developer",
      "department": "development",
      "designation": "Senior Frontend Developer",
      "company": "company_id_here",
      "hireDate": "2024-01-15T00:00:00.000Z",
      "salary": 75000,
      "skills": ["react", "typescript", "nodejs", "mongodb"],
      "experience": {
        "years": 5,
        "previousCompanies": ["TechCorp", "WebSolutions"],
        "specializations": ["frontend-development", "ui-ux"]
      },
      "workSchedule": {
        "type": "full-time",
        "hoursPerWeek": 40,
        "timezone": "America/New_York"
      },
      "assignedProjects": ["project_id_1", "project_id_2"],
      "assignedTasks": ["task_id_1", "task_id_2"],
      "performance": {
        "rating": 4.5,
        "completedTasks": 45,
        "onTimeDelivery": 92,
        "lastReview": "2024-01-01T00:00:00.000Z"
      },
      "status": "active",
      "isActive": true,
      "employeeId": "EMP001",
      "lastLogin": "2024-01-15T09:30:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "createdBy": "admin_id_here",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `400` - Invalid employee ID
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Employee not found
- `500` - Server error

---

### **4. Update Employee**

#### **PUT** `/employee/:id` or **POST** `/employee/:id/update`

Updates an existing employee's information.

**Access Level**: Admin+, HR, Employee (own profile - limited fields)

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**URL Parameters**:
- `id` (string): Employee ID

**Request Body**:
```json
{
  "fullname": "Sarah Elizabeth Johnson",
  "designation": "Lead Frontend Developer",
  "salary": 85000,
  "skills": ["react", "typescript", "nodejs", "mongodb", "vue", "angular"],
  "experience": {
    "years": 6,
    "previousCompanies": ["TechCorp", "WebSolutions", "InnovationLabs"],
    "specializations": ["frontend-development", "ui-ux", "team-leadership"]
  },
  "workSchedule": {
    "type": "full-time",
    "hoursPerWeek": 40,
    "timezone": "America/New_York",
    "remoteWork": true
  }
}
```

**Updatable Fields**:
- `fullname` (string): Employee's full name
- `phone` (string): Phone number
- `designation` (string): Job title
- `department` (string): Department name
- `salary` (number): Annual salary
- `skills` (array): Technical skills
- `experience` (object): Work experience
- `workSchedule` (object): Work schedule
- `address` (object): Employee address
- `emergencyContact` (object): Emergency contact

**Success Response** (200):
```json
{
  "success": true,
  "message": "Employee updated successfully",
  "data": {
    "employee": {
      "_id": "employee_id_here",
      "fullname": "Sarah Elizabeth Johnson",
      "designation": "Lead Frontend Developer",
      "salary": 85000,
      "skills": ["react", "typescript", "nodejs", "mongodb", "vue", "angular"],
      "experience": {
        "years": 6,
        "previousCompanies": ["TechCorp", "WebSolutions", "InnovationLabs"],
        "specializations": ["frontend-development", "ui-ux", "team-leadership"]
      },
      "workSchedule": {
        "type": "full-time",
        "hoursPerWeek": 40,
        "timezone": "America/New_York",
        "remoteWork": true
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
- `404` - Employee not found
- `409` - Email already exists
- `500` - Server error

---

### **5. Delete Employee**

#### **DELETE** `/employee/:id` or **POST** `/employee/:id/delete`

Soft deletes an employee (marks as terminated).

**Access Level**: Admin+, HR

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**URL Parameters**:
- `id` (string): Employee ID

**Request Body**: None required

**Success Response** (200):
```json
{
  "success": true,
  "message": "Employee deleted successfully",
  "data": {
    "employee": {
      "_id": "employee_id_here",
      "fullname": "Sarah Elizabeth Johnson",
      "status": "terminated",
      "isActive": false,
      "terminationDate": "2024-01-15T12:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T12:30:00.000Z"
}
```

**Error Responses**:
- `400` - Invalid employee ID
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Employee not found
- `409` - Employee has active projects/tasks
- `500` - Server error

---

### **6. Assign Project to Employee**

#### **POST** `/employee/:id/assign-project`

Assigns a project to an employee.

**Access Level**: Admin+, Project Manager

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**URL Parameters**:
- `id` (string): Employee ID

**Request Body**:
```json
{
  "project": "project_id_here",
  "role": "developer",
  "responsibilities": ["frontend-development", "ui-implementation"],
  "startDate": "2024-01-20",
  "endDate": "2024-04-15",
  "allocation": 80,
  "notes": "Lead frontend development for the e-commerce project"
}
```

**Required Fields**:
- `project` (string): Project ID
- `role` (string): Role in the project
- `startDate` (date): Assignment start date

**Optional Fields**:
- `responsibilities` (array): Project responsibilities
- `endDate` (date): Assignment end date
- `allocation` (number): Time allocation percentage
- `notes` (string): Additional notes

**Success Response** (200):
```json
{
  "success": true,
  "message": "Project assigned successfully",
  "data": {
    "assignment": {
      "_id": "assignment_id_here",
      "employee": "employee_id_here",
      "project": "project_id_here",
      "role": "developer",
      "responsibilities": ["frontend-development", "ui-implementation"],
      "startDate": "2024-01-20T00:00:00.000Z",
      "endDate": "2024-04-15T00:00:00.000Z",
      "allocation": 80,
      "status": "active",
      "createdAt": "2024-01-15T11:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T11:30:00.000Z"
}
```

**Error Responses**:
- `400` - Validation errors
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Employee or project not found
- `409` - Employee already assigned to project
- `500` - Server error

---

### **7. Remove Project from Employee**

#### **POST** `/employee/:id/remove-project`

Removes a project assignment from an employee.

**Access Level**: Admin+, Project Manager

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**URL Parameters**:
- `id` (string): Employee ID

**Request Body**:
```json
{
  "project": "project_id_here",
  "reason": "Project completed",
  "endDate": "2024-01-15"
}
```

**Required Fields**:
- `project` (string): Project ID

**Optional Fields**:
- `reason` (string): Reason for removal
- `endDate` (date): Actual end date

**Success Response** (200):
```json
{
  "success": true,
  "message": "Project removed successfully",
  "data": {
    "assignment": {
      "_id": "assignment_id_here",
      "employee": "employee_id_here",
      "project": "project_id_here",
      "status": "completed",
      "endDate": "2024-01-15T00:00:00.000Z",
      "reason": "Project completed"
    }
  },
  "timestamp": "2024-01-15T12:30:00.000Z"
}
```

**Error Responses**:
- `400` - Validation errors
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Employee or project assignment not found
- `500` - Server error

---

### **8. Employee Statistics**

#### **GET** `/employee/stats/overview`

Retrieves comprehensive statistics about employees.

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
  "message": "Employee statistics retrieved successfully",
  "data": {
    "stats": {
      "overview": {
        "totalEmployees": 85,
        "activeEmployees": 80,
        "inactiveEmployees": 3,
        "terminatedEmployees": 2
      },
      "byRole": {
        "developer": 35,
        "designer": 15,
        "project-manager": 10,
        "sales": 12,
        "support": 8,
        "hr": 5
      },
      "byDepartment": {
        "development": 50,
        "design": 20,
        "sales": 12,
        "support": 8,
        "hr": 5
      },
      "performance": {
        "averageRating": 4.2,
        "topPerformers": 15,
        "needsImprovement": 5,
        "onTimeDelivery": 88
      },
      "utilization": {
        "averageAllocation": 75,
        "overallocated": 8,
        "underallocated": 12,
        "optimalAllocation": 60
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

### **Employee Schema**
```json
{
  "_id": "ObjectId",
  "fullname": "String (required)",
  "email": "String (required, unique)",
  "password": "String (required, hashed)",
  "phone": "String",
  "role": "String (required)",
  "department": "String (required)",
  "designation": "String",
  "company": "ObjectId (required, ref: Company)",
  "hireDate": "Date",
  "salary": "Number",
  "skills": ["String"],
  "experience": {
    "years": "Number",
    "previousCompanies": ["String"],
    "specializations": ["String"]
  },
  "workSchedule": {
    "type": "String (enum: full-time, part-time, contract)",
    "hoursPerWeek": "Number",
    "timezone": "String",
    "remoteWork": "Boolean"
  },
  "assignedProjects": ["ObjectId (ref: Project)"],
  "assignedTasks": ["ObjectId (ref: Task)"],
  "performance": {
    "rating": "Number",
    "completedTasks": "Number",
    "onTimeDelivery": "Number",
    "lastReview": "Date"
  },
  "status": "String (enum: active, inactive, terminated, on-leave)",
  "isActive": "Boolean (default: true)",
  "employeeId": "String (unique)",
  "lastLogin": "Date",
  "createdBy": "ObjectId (ref: Admin)",
  "createdAt": "Date",
  "updatedAt": "Date",
  "deletedAt": "Date"
}
```

---

## 📝 **Request Examples**

### **cURL Examples**

#### **Create Employee**
```bash
curl -X POST http://localhost:5000/api/employee/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "fullname": "Michael Chen",
    "email": "michael.chen@company.com",
    "password": "SecurePass123!",
    "phone": "+1234567891",
    "role": "designer",
    "department": "design",
    "designation": "UI/UX Designer",
    "company": "company_id_here",
    "hireDate": "2024-01-15",
    "salary": 65000,
    "skills": ["figma", "adobe-xd", "sketch", "prototyping"]
  }'
```

#### **Update Employee**
```bash
curl -X PUT http://localhost:5000/api/employee/employee_id_here \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "fullname": "Michael Chen",
    "designation": "Senior UI/UX Designer",
    "salary": 75000,
    "skills": ["figma", "adobe-xd", "sketch", "prototyping", "user-research", "design-systems"]
  }'
```

#### **Assign Project**
```bash
curl -X POST http://localhost:5000/api/employee/employee_id_here/assign-project \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "project": "project_id_here",
    "role": "designer",
    "responsibilities": ["ui-design", "user-research", "prototyping"],
    "startDate": "2024-01-20",
    "allocation": 100
  }'
```

#### **Get Employee Details**
```bash
curl -X GET http://localhost:5000/api/employee/employee_id_here \
  -H "Authorization: Bearer <admin_token>"
```

#### **List Employees with Filters**
```bash
curl -X GET "http://localhost:5000/api/employee/list?page=1&limit=20&department=development&role=developer" \
  -H "Authorization: Bearer <admin_token>"
```

### **JavaScript Examples**

#### **Create Employee**
```javascript
const response = await fetch('/api/employee/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    fullname: 'Michael Chen',
    email: 'michael.chen@company.com',
    password: 'SecurePass123!',
    phone: '+1234567891',
    role: 'designer',
    department: 'design',
    designation: 'UI/UX Designer',
    company: 'company_id_here',
    hireDate: '2024-01-15',
    salary: 65000,
    skills: ['figma', 'adobe-xd', 'sketch', 'prototyping']
  })
});

const data = await response.json();
```

#### **Update Employee**
```javascript
const response = await fetch(`/api/employee/${employeeId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    fullname: 'Michael Chen',
    designation: 'Senior UI/UX Designer',
    salary: 75000,
    skills: ['figma', 'adobe-xd', 'sketch', 'prototyping', 'user-research', 'design-systems']
  })
});

const data = await response.json();
```

---

## ❌ **Error Handling**

### **Common Error Codes**

| Status Code | Error Type | Description | Solution |
|-------------|------------|-------------|----------|
| `400` | Bad Request | Invalid employee ID, validation errors | Check request parameters and body |
| `401` | Unauthorized | Missing or invalid authentication | Provide valid JWT token |
| `403` | Forbidden | Insufficient permissions | Check user role and company access |
| `404` | Not Found | Employee doesn't exist | Verify employee ID |
| `409` | Conflict | Email already exists, active dependencies | Use different email or resolve dependencies |
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
      "field": "role",
      "message": "Role is required",
      "value": ""
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/employee/create",
  "method": "POST"
}
```

---

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Employee Configuration
MAX_EMPLOYEES_PER_COMPANY=500
EMPLOYEE_PASSWORD_MIN_LENGTH=8
EMPLOYEE_NAME_MIN_LENGTH=2
EMPLOYEE_NAME_MAX_LENGTH=100

# Validation
ALLOWED_EMPLOYEE_ROLES=developer,designer,project-manager,sales,support,hr,admin
ALLOWED_DEPARTMENTS=development,design,sales,support,hr,marketing,finance
ALLOWED_WORK_SCHEDULES=full-time,part-time,contract,freelance
```

### **Rate Limiting**
- Employee creation: 20 requests per hour per IP
- Employee updates: 50 requests per hour per IP
- Employee listing: 200 requests per hour per IP
- Project assignments: 30 requests per hour per IP

---

## 📚 **Related Documentation**

- [API Overview](../README.md) - Complete API reference
- [Admin Management](./admin.md) - Admin user management
- [Project Management](./project.md) - Project operations
- [Task Management](./task.md) - Task operations
- [Database Models](../database.md) - Employee model schema
- [Security Guide](../security.md) - Multi-tenant security

---

**The Employee Management APIs provide comprehensive employee lifecycle management with project assignments, performance tracking, and detailed analytics for workforce optimization.**
