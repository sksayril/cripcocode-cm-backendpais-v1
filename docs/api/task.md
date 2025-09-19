# ✅ Task Management APIs

## 📋 **Overview**

The Task Management APIs provide comprehensive functionality for managing tasks within the CRIPCOCODE CRM system. These endpoints handle task creation, assignment, tracking, time management, and analytics with support for dependencies and workflow management.

## 🔗 **Base Endpoints**

```
Base URL: /api/task
```

## 🔐 **Access Control**

- **Super Admin**: Full access to all tasks across all companies
- **Company Admin**: Access only to tasks within their company
- **Manager**: Full access to tasks within their company
- **Employee**: Access to assigned tasks and limited task operations
- **Support**: Read-only access to task information within their company

## 📝 **API Endpoints**

### **1. Create Task**

#### **POST** `/task/create`

Creates a new task in the system.

**Access Level**: Admin+

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Design User Authentication System",
  "description": "Create a secure user authentication system with JWT tokens",
  "project": "project_id_here",
  "client": "client_id_here",
  "company": "company_id_here",
  "type": "development",
  "category": "backend-development",
  "priority": "high",
  "assignedTo": "employee_id_here",
  "assignedBy": "admin_id_here",
  "startDate": "2024-01-15",
  "dueDate": "2024-01-22",
  "estimatedHours": 16,
  "dependencies": ["task_id_1", "task_id_2"],
  "requirements": {
    "features": ["user-registration", "user-login", "password-reset"],
    "technologies": ["nodejs", "jwt", "bcrypt"],
    "security": ["password-hashing", "token-validation"]
  },
  "deliverables": ["authentication-api", "user-model", "security-tests"],
  "tags": ["authentication", "security", "backend"]
}
```

**Required Fields**:
- `title` (string): Task title
- `description` (string): Task description
- `project` (string): Project ID reference
- `client` (string): Client ID reference
- `company` (string): Company ID reference
- `type` (string): Task type
- `category` (string): Task category
- `priority` (string): Priority level
- `assignedTo` (string): Assigned employee ID
- `startDate` (date): Task start date
- `dueDate` (date): Task due date

**Optional Fields**:
- `estimatedHours` (number): Estimated hours to complete
- `dependencies` (array): Dependent task IDs
- `requirements` (object): Task requirements
- `deliverables` (array): Expected deliverables
- `tags` (array): Task tags
- `notes` (string): Additional notes

**Success Response** (201):
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "task": {
      "_id": "task_id_here",
      "title": "Design User Authentication System",
      "description": "Create a secure user authentication system with JWT tokens",
      "project": "project_id_here",
      "client": "client_id_here",
      "company": "company_id_here",
      "type": "development",
      "category": "backend-development",
      "priority": "high",
      "assignedTo": "employee_id_here",
      "assignedBy": "admin_id_here",
      "startDate": "2024-01-15T00:00:00.000Z",
      "dueDate": "2024-01-22T00:00:00.000Z",
      "estimatedHours": 16,
      "status": "pending",
      "progress": 0,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `400` - Validation errors
- `401` - Unauthorized
- `403` - Insufficient permissions
- `409` - Task title already exists
- `500` - Server error

---

### **2. List All Tasks**

#### **GET** `/task/list`

Retrieves a paginated list of tasks.

**Access Level**: Admin+

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search term for title/description
- `status` (string): Filter by status (pending, in-progress, completed, cancelled)
- `type` (string): Filter by type
- `category` (string): Filter by category
- `priority` (string): Filter by priority
- `project` (string): Filter by project ID
- `assignedTo` (string): Filter by assigned employee
- `sort` (string): Sort field (default: createdAt)
- `order` (string): Sort order (asc, desc, default: desc)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": {
    "tasks": [
      {
        "_id": "task_id_1",
        "title": "Design User Authentication System",
        "type": "development",
        "category": "backend-development",
        "project": "project_id_here",
        "assignedTo": "employee_id_here",
        "priority": "high",
        "status": "in-progress",
        "progress": 45,
        "startDate": "2024-01-15T00:00:00.000Z",
        "dueDate": "2024-01-22T00:00:00.000Z",
        "estimatedHours": 16,
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

### **3. Get Task Details**

#### **GET** `/task/:id`

Retrieves detailed information about a specific task.

**Access Level**: Admin+, Employee (assigned tasks)

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**URL Parameters**:
- `id` (string): Task ID

**Success Response** (200):
```json
{
  "success": true,
  "message": "Task details retrieved successfully",
  "data": {
    "task": {
      "_id": "task_id_here",
      "title": "Design User Authentication System",
      "description": "Create a secure user authentication system with JWT tokens",
      "project": "project_id_here",
      "client": "client_id_here",
      "company": "company_id_here",
      "type": "development",
      "category": "backend-development",
      "priority": "high",
      "assignedTo": "employee_id_here",
      "assignedBy": "admin_id_here",
      "startDate": "2024-01-15T00:00:00.000Z",
      "dueDate": "2024-01-22T00:00:00.000Z",
      "estimatedHours": 16,
      "actualHours": 8,
      "dependencies": ["task_id_1", "task_id_2"],
      "requirements": {
        "features": ["user-registration", "user-login", "password-reset"],
        "technologies": ["nodejs", "jwt", "bcrypt"],
        "security": ["password-hashing", "token-validation"]
      },
      "deliverables": ["authentication-api", "user-model", "security-tests"],
      "tags": ["authentication", "security", "backend"],
      "status": "in-progress",
      "progress": 45,
      "timeEntries": [
        {
          "_id": "time_entry_id_1",
          "date": "2024-01-15T00:00:00.000Z",
          "hours": 4,
          "description": "Initial setup and planning",
          "employee": "employee_id_here"
        }
      ],
      "comments": [
        {
          "_id": "comment_id_1",
          "text": "Starting with user model design",
          "employee": "employee_id_here",
          "createdAt": "2024-01-15T10:30:00.000Z"
        }
      ],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `400` - Invalid task ID
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Task not found
- `500` - Server error

---

### **4. Update Task**

#### **PUT** `/task/:id` or **POST** `/task/:id/update`

Updates an existing task's information.

**Access Level**: Admin+, Employee (assigned tasks - limited fields)

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**URL Parameters**:
- `id` (string): Task ID

**Request Body**:
```json
{
  "title": "Design User Authentication System v2.0",
  "description": "Enhanced user authentication system with advanced security features",
  "dueDate": "2024-01-25",
  "estimatedHours": 20,
  "priority": "urgent",
  "requirements": {
    "features": ["user-registration", "user-login", "password-reset", "2fa", "oauth"],
    "technologies": ["nodejs", "jwt", "bcrypt", "passport"],
    "security": ["password-hashing", "token-validation", "rate-limiting"]
  },
  "deliverables": ["authentication-api", "user-model", "security-tests", "documentation"]
}
```

**Updatable Fields**:
- `title` (string): Task title
- `description` (string): Task description
- `startDate` (date): Task start date
- `dueDate` (date): Task due date
- `estimatedHours` (number): Estimated hours
- `priority` (string): Priority level
- `requirements` (object): Task requirements
- `deliverables` (array): Expected deliverables
- `tags` (array): Task tags
- `notes` (string): Additional notes

**Success Response** (200):
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "task": {
      "_id": "task_id_here",
      "title": "Design User Authentication System v2.0",
      "description": "Enhanced user authentication system with advanced security features",
      "dueDate": "2024-01-25T00:00:00.000Z",
      "estimatedHours": 20,
      "priority": "urgent",
      "requirements": {
        "features": ["user-registration", "user-login", "password-reset", "2fa", "oauth"],
        "technologies": ["nodejs", "jwt", "bcrypt", "passport"],
        "security": ["password-hashing", "token-validation", "rate-limiting"]
      },
      "deliverables": ["authentication-api", "user-model", "security-tests", "documentation"],
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
- `404` - Task not found
- `409` - Task title already exists
- `500` - Server error

---

### **5. Delete Task**

#### **DELETE** `/task/:id` or **POST** `/task/:id/delete`

Soft deletes a task (marks as cancelled).

**Access Level**: Admin+

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**URL Parameters**:
- `id` (string): Task ID

**Request Body**: None required

**Success Response** (200):
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": {
    "task": {
      "_id": "task_id_here",
      "title": "Design User Authentication System v2.0",
      "status": "cancelled",
      "deletedAt": "2024-01-15T12:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T12:30:00.000Z"
}
```

**Error Responses**:
- `400` - Invalid task ID
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Task not found
- `409` - Task has active dependencies
- `500` - Server error

---

### **6. Assign Task to Employee**

#### **POST** `/task/:id/assign`

Assigns a task to an employee.

**Access Level**: Admin+, Project Manager

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**URL Parameters**:
- `id` (string): Task ID

**Request Body**:
```json
{
  "assignedTo": "employee_id_here",
  "assignedBy": "admin_id_here",
  "startDate": "2024-01-20",
  "dueDate": "2024-01-27",
  "estimatedHours": 18,
  "notes": "Please prioritize this task as it's blocking other development work"
}
```

**Required Fields**:
- `assignedTo` (string): Employee ID to assign to
- `assignedBy` (string): Admin ID making the assignment

**Optional Fields**:
- `startDate` (date): Assignment start date
- `dueDate` (date): Assignment due date
- `estimatedHours` (number): Estimated hours
- `notes` (string): Assignment notes

**Success Response** (200):
```json
{
  "success": true,
  "message": "Task assigned successfully",
  "data": {
    "task": {
      "_id": "task_id_here",
      "assignedTo": "employee_id_here",
      "assignedBy": "admin_id_here",
      "startDate": "2024-01-20T00:00:00.000Z",
      "dueDate": "2024-01-27T00:00:00.000Z",
      "estimatedHours": 18,
      "status": "assigned",
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
- `404` - Task or employee not found
- `409` - Task already assigned
- `500` - Server error

---

### **7. Start Task Execution**

#### **POST** `/task/:id/start`

Marks a task as started and begins time tracking.

**Access Level**: Employee (assigned tasks)

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**URL Parameters**:
- `id` (string): Task ID

**Request Body**:
```json
{
  "startTime": "2024-01-15T10:30:00.000Z",
  "notes": "Starting development of authentication system"
}
```

**Optional Fields**:
- `startTime` (date): Actual start time
- `notes` (string): Start notes

**Success Response** (200):
```json
{
  "success": true,
  "message": "Task started successfully",
  "data": {
    "task": {
      "_id": "task_id_here",
      "status": "in-progress",
      "startedAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `400` - Validation errors
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Task not found
- `409` - Task already started
- `500` - Server error

---

### **8. Mark Task as Complete**

#### **POST** `/task/:id/complete`

Marks a task as completed.

**Access Level**: Employee (assigned tasks), Admin+

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**URL Parameters**:
- `id` (string): Task ID

**Request Body**:
```json
{
  "completionDate": "2024-01-20T16:00:00.000Z",
  "actualHours": 18,
  "deliverables": ["authentication-api", "user-model", "security-tests"],
  "notes": "Task completed successfully. All requirements met and tested."
}
```

**Required Fields**:
- `deliverables` (array): Completed deliverables

**Optional Fields**:
- `completionDate` (date): Actual completion date
- `actualHours` (number): Actual hours spent
- `notes` (string): Completion notes

**Success Response** (200):
```json
{
  "success": true,
  "message": "Task completed successfully",
  "data": {
    "task": {
      "_id": "task_id_here",
      "status": "completed",
      "progress": 100,
      "completionDate": "2024-01-20T16:00:00.000Z",
      "actualHours": 18,
      "deliverables": ["authentication-api", "user-model", "security-tests"],
      "updatedAt": "2024-01-20T16:00:00.000Z"
    }
  },
  "timestamp": "2024-01-20T16:00:00.000Z"
}
```

**Error Responses**:
- `400` - Validation errors
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Task not found
- `409` - Task dependencies not completed
- `500` - Server error

---

### **9. Add Time Entry**

#### **POST** `/task/:id/time-entry`

Adds a time entry to track work hours.

**Access Level**: Employee (assigned tasks), Admin+

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**URL Parameters**:
- `id` (string): Task ID

**Request Body**:
```json
{
  "date": "2024-01-15",
  "hours": 4,
  "description": "Developed user authentication API endpoints",
  "startTime": "09:00",
  "endTime": "13:00"
}
```

**Required Fields**:
- `date` (date): Work date
- `hours` (number): Hours worked
- `description` (string): Work description

**Optional Fields**:
- `startTime` (string): Start time
- `endTime` (string): End time
- `breakTime` (number): Break time in minutes

**Success Response** (201):
```json
{
  "success": true,
  "message": "Time entry added successfully",
  "data": {
    "timeEntry": {
      "_id": "time_entry_id_here",
      "task": "task_id_here",
      "date": "2024-01-15T00:00:00.000Z",
      "hours": 4,
      "description": "Developed user authentication API endpoints",
      "startTime": "09:00",
      "endTime": "13:00",
      "employee": "employee_id_here",
      "createdAt": "2024-01-15T13:00:00.000Z"
    }
  },
  "timestamp": "2024-01-15T13:00:00.000Z"
}
```

**Error Responses**:
- `400` - Validation errors
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Task not found
- `500` - Server error

---

### **10. Task Statistics**

#### **GET** `/task/stats/overview`

Retrieves comprehensive statistics about tasks.

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
  "message": "Task statistics retrieved successfully",
  "data": {
    "stats": {
      "overview": {
        "totalTasks": 250,
        "activeTasks": 120,
        "completedTasks": 100,
        "cancelledTasks": 20,
        "overdueTasks": 10
      },
      "byStatus": {
        "pending": 30,
        "assigned": 20,
        "in-progress": 70,
        "completed": 100,
        "cancelled": 20,
        "on-hold": 10
      },
      "byPriority": {
        "low": 50,
        "medium": 120,
        "high": 60,
        "urgent": 20
      },
      "byType": {
        "development": 150,
        "design": 50,
        "testing": 30,
        "documentation": 20
      },
      "performance": {
        "onTimeDelivery": 85,
        "averageProgress": 65,
        "totalHoursSpent": 2500,
        "averageTaskDuration": 12.5
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

### **Task Schema**
```json
{
  "_id": "ObjectId",
  "title": "String (required)",
  "description": "String (required)",
  "project": "ObjectId (required, ref: Project)",
  "client": "ObjectId (required, ref: Client)",
  "company": "ObjectId (required, ref: Company)",
  "type": "String (required)",
  "category": "String (required)",
  "priority": "String (required, enum: low, medium, high, urgent)",
  "assignedTo": "ObjectId (ref: Employee)",
  "assignedBy": "ObjectId (ref: Admin)",
  "startDate": "Date (required)",
  "dueDate": "Date (required)",
  "estimatedHours": "Number",
  "actualHours": "Number",
  "dependencies": ["ObjectId (ref: Task)"],
  "requirements": {
    "features": ["String"],
    "technologies": ["String"],
    "security": ["String"]
  },
  "deliverables": ["String"],
  "tags": ["String"],
  "status": "String (enum: pending, assigned, in-progress, completed, cancelled, on-hold)",
  "progress": "Number (0-100)",
  "timeEntries": ["ObjectId (ref: TimeEntry)"],
  "comments": ["ObjectId (ref: Comment)"],
  "startedAt": "Date",
  "completionDate": "Date",
  "notes": "String",
  "createdAt": "Date",
  "updatedAt": "Date",
  "deletedAt": "Date"
}
```

---

## 📝 **Request Examples**

### **cURL Examples**

#### **Create Task**
```bash
curl -X POST http://localhost:5000/api/task/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "title": "Create Landing Page Design",
    "description": "Design a modern landing page for the marketing campaign",
    "project": "project_id_here",
    "client": "client_id_here",
    "company": "company_id_here",
    "type": "design",
    "category": "ui-ux-design",
    "priority": "medium",
    "assignedTo": "employee_id_here",
    "startDate": "2024-01-15",
    "dueDate": "2024-01-20",
    "estimatedHours": 12,
    "deliverables": ["wireframes", "design-mockups", "style-guide"]
  }'
```

#### **Update Task**
```bash
curl -X PUT http://localhost:5000/api/task/task_id_here \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "title": "Create Landing Page Design v2.0",
    "dueDate": "2024-01-22",
    "estimatedHours": 16,
    "priority": "high",
    "deliverables": ["wireframes", "design-mockups", "style-guide", "prototype"]
  }'
```

#### **Start Task**
```bash
curl -X POST http://localhost:5000/api/task/task_id_here/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <employee_token>" \
  -d '{
    "notes": "Starting design work on the landing page"
  }'
```

#### **Add Time Entry**
```bash
curl -X POST http://localhost:5000/api/task/task_id_here/time-entry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <employee_token>" \
  -d '{
    "date": "2024-01-15",
    "hours": 6,
    "description": "Created wireframes and initial design concepts",
    "startTime": "09:00",
    "endTime": "16:00"
  }'
```

#### **Complete Task**
```bash
curl -X POST http://localhost:5000/api/task/task_id_here/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <employee_token>" \
  -d '{
    "actualHours": 14,
    "deliverables": ["wireframes", "design-mockups", "style-guide"],
    "notes": "Design completed and approved by client"
  }'
```

#### **Get Task Details**
```bash
curl -X GET http://localhost:5000/api/task/task_id_here \
  -H "Authorization: Bearer <admin_token>"
```

#### **List Tasks with Filters**
```bash
curl -X GET "http://localhost:5000/api/task/list?page=1&limit=20&status=in-progress&priority=high&type=development" \
  -H "Authorization: Bearer <admin_token>"
```

### **JavaScript Examples**

#### **Create Task**
```javascript
const response = await fetch('/api/task/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Create Landing Page Design',
    description: 'Design a modern landing page for the marketing campaign',
    project: 'project_id_here',
    client: 'client_id_here',
    company: 'company_id_here',
    type: 'design',
    category: 'ui-ux-design',
    priority: 'medium',
    assignedTo: 'employee_id_here',
    startDate: '2024-01-15',
    dueDate: '2024-01-20',
    estimatedHours: 12,
    deliverables: ['wireframes', 'design-mockups', 'style-guide']
  })
});

const data = await response.json();
```

#### **Update Task**
```javascript
const response = await fetch(`/api/task/${taskId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Create Landing Page Design v2.0',
    dueDate: '2024-01-22',
    estimatedHours: 16,
    priority: 'high',
    deliverables: ['wireframes', 'design-mockups', 'style-guide', 'prototype']
  })
});

const data = await response.json();
```

---

## ❌ **Error Handling**

### **Common Error Codes**

| Status Code | Error Type | Description | Solution |
|-------------|------------|-------------|----------|
| `400` | Bad Request | Invalid task ID, validation errors | Check request parameters and body |
| `401` | Unauthorized | Missing or invalid authentication | Provide valid JWT token |
| `403` | Forbidden | Insufficient permissions | Check user role and company access |
| `404` | Not Found | Task doesn't exist | Verify task ID |
| `409` | Conflict | Task title already exists, dependencies not met | Use different title or resolve dependencies |
| `500` | Internal Server Error | Server-side error | Contact support |

### **Error Response Format**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Task title is required",
      "value": ""
    },
    {
      "field": "dueDate",
      "message": "Due date must be after start date",
      "value": "2024-01-10"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/task/create",
  "method": "POST"
}
```

---

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Task Configuration
MAX_TASKS_PER_PROJECT=100
MAX_DEPENDENCIES_PER_TASK=10
TASK_TITLE_MIN_LENGTH=5
TASK_TITLE_MAX_LENGTH=200

# Validation
ALLOWED_TASK_TYPES=development,design,testing,documentation,research,planning
ALLOWED_TASK_CATEGORIES=frontend-development,backend-development,ui-ux-design,testing,seo,content-creation
ALLOWED_TASK_STATUSES=pending,assigned,in-progress,completed,cancelled,on-hold
ALLOWED_PRIORITIES=low,medium,high,urgent
```

### **Rate Limiting**
- Task creation: 30 requests per hour per IP
- Task updates: 60 requests per hour per IP
- Task listing: 300 requests per hour per IP
- Time entries: 100 requests per hour per IP

---

## 📚 **Related Documentation**

- [API Overview](../README.md) - Complete API reference
- [Project Management](./project.md) - Project operations
- [Employee Management](./employee.md) - Employee operations
- [Database Models](../database.md) - Task model schema
- [Security Guide](../security.md) - Multi-tenant security

---

**The Task Management APIs provide comprehensive task lifecycle management with time tracking, dependencies, and detailed analytics for project workflow optimization.**
