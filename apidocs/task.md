# ✅ **Task Management APIs**

## **Overview**
The Task Management module provides comprehensive functionality for creating, assigning, tracking, and managing tasks within projects. It supports task dependencies, time tracking, progress updates, and team collaboration with role-based access control.

## **🔐 Authentication**
All task management endpoints require authentication using JWT tokens. Different endpoints have different access levels:
- **Admin**: Full task management operations
- **Employee**: Limited access to assigned tasks and progress updates

## **📋 Task Types & Categories**

### **Task Types:**
- `development` - Software development tasks
- `design` - UI/UX design tasks
- `marketing` - Marketing and promotional tasks
- `content` - Content creation and management
- `testing` - Quality assurance and testing
- `deployment` - Deployment and release tasks
- `maintenance` - System maintenance and updates
- `research` - Research and analysis tasks
- `documentation` - Documentation and writing tasks
- `other` - Miscellaneous tasks

### **Task Priorities:**
- `low` - Low priority tasks
- `medium` - Normal priority tasks
- `high` - High priority tasks
- `urgent` - Critical priority tasks

### **Task Complexity:**
- `simple` - Simple, straightforward tasks
- `moderate` - Moderately complex tasks
- `complex` - Complex tasks requiring expertise
- `very-complex` - Highly complex tasks

### **Task Status:**
- `pending` - Task is waiting to be started
- `in-progress` - Task is currently being worked on
- `review` - Task is under review
- `testing` - Task is being tested
- `completed` - Task has been completed
- `on-hold` - Task is temporarily paused
- `cancelled` - Task has been cancelled

## **📋 API Endpoints**

### **1. Task Management (Admin/Employee)**

#### **Create Task**
```http
POST /api/task/create
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "title": "Implement User Authentication",
  "description": "Create a complete user authentication system with JWT tokens, password hashing, and role-based access control",
  "shortDescription": "Build user auth system with JWT and RBAC",
  "project": "project_id",
  "client": "client_id",
  "type": "development",
  "category": "Backend Development",
  "priority": "high",
  "complexity": "moderate",
  "assignedTo": "employee_id",
  "startDate": "2024-01-15",
  "dueDate": "2024-01-30",
  "estimatedHours": 40,
  "budget": {
    "allocated": 5000,
    "currency": "USD"
  },
  "deliverables": [
    {
      "name": "Authentication API",
      "description": "Complete REST API for user authentication",
      "fileType": "API",
      "isRequired": true
    },
    {
      "name": "User Management Dashboard",
      "description": "Admin dashboard for managing users",
      "fileType": "Frontend",
      "isRequired": true
    }
  ],
  "requirements": [
    {
      "description": "Support for multiple user roles",
      "isRequired": true
    },
    {
      "description": "Password reset functionality",
      "isRequired": true
    }
  ],
  "tags": ["authentication", "security", "backend"],
  "labels": ["feature", "core"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "task": {
      "id": "task_id",
      "title": "Implement User Authentication",
      "description": "Create a complete user authentication system...",
      "type": "development",
      "category": "Backend Development",
      "priority": "high",
      "complexity": "moderate",
      "assignedTo": "employee_id",
      "startDate": "2024-01-15T00:00:00.000Z",
      "dueDate": "2024-01-30T00:00:00.000Z",
      "estimatedHours": 40,
      "status": "pending",
      "progress": 0,
      "project": {
        "id": "project_id",
        "title": "E-commerce Platform",
        "status": "active",
        "projectType": "development"
      },
      "client": {
        "id": "client_id",
        "firstName": "John",
        "lastName": "Doe",
        "companyName": "Tech Corp"
      },
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

#### **Get All Tasks**
```http
GET /api/task/list?page=1&limit=10&status=pending&priority=high&type=development&project=project_id&assignedTo=employee_id&overdue=true
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter by task status
- `priority` - Filter by priority level
- `type` - Filter by task type
- `category` - Filter by task category
- `project` - Filter by project ID
- `client` - Filter by client ID
- `assignedTo` - Filter by assigned employee
- `startDate` - Filter by start date (YYYY-MM-DD)
- `endDate` - Filter by end date (YYYY-MM-DD)
- `overdue` - Filter overdue tasks (true/false)
- `search` - Search in title, description, category

**Response:**
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": {
    "tasks": {
      "docs": [
        {
          "id": "task_id",
          "title": "Implement User Authentication",
          "type": "development",
          "category": "Backend Development",
          "priority": "high",
          "status": "pending",
          "progress": 0,
          "assignedTo": {
            "id": "employee_id",
            "firstName": "Jane",
            "lastName": "Smith",
            "email": "jane@company.com",
            "department": "development"
          },
          "dueDate": "2024-01-30T00:00:00.000Z",
          "estimatedHours": 40,
          "project": {
            "id": "project_id",
            "title": "E-commerce Platform",
            "status": "active",
            "projectType": "development"
          }
        }
      ],
      "totalDocs": 50,
      "limit": 10,
      "page": 1,
      "totalPages": 5
    }
  }
}
```

#### **Get Task by ID**
```http
GET /api/task/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Task retrieved successfully",
  "data": {
    "task": {
      "id": "task_id",
      "title": "Implement User Authentication",
      "description": "Create a complete user authentication system...",
      "type": "development",
      "category": "Backend Development",
      "priority": "high",
      "complexity": "moderate",
      "assignedTo": {
        "id": "employee_id",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane@company.com",
        "department": "development",
        "role": "senior"
      },
      "assignedBy": {
        "id": "admin_id",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@company.com"
      },
      "startDate": "2024-01-15T00:00:00.000Z",
      "dueDate": "2024-01-30T00:00:00.000Z",
      "estimatedHours": 40,
      "actualHours": 0,
      "status": "pending",
      "progress": 0,
      "project": {
        "id": "project_id",
        "title": "E-commerce Platform",
        "status": "active",
        "projectType": "development",
        "progress": 25
      },
      "client": {
        "id": "client_id",
        "firstName": "John",
        "lastName": "Doe",
        "companyName": "Tech Corp",
        "industry": "Technology"
      },
      "company": {
        "id": "company_id",
        "name": "Tech Solutions",
        "status": "active",
        "industry": "Software Development"
      },
      "teamMembers": [...],
      "dependencies": [...],
      "parentTask": null,
      "subTasks": [...],
      "deliverables": [...],
      "requirements": [...],
      "timeEntries": [...],
      "comments": [...],
      "tags": ["authentication", "security", "backend"],
      "labels": ["feature", "core"],
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

#### **Update Task**
```http
PUT /api/task/:id
POST /api/task/:id/update
```

**Request Body:**
```json
{
  "status": "in-progress",
  "progress": 25,
  "actualHours": 10,
  "deliverables": [
    {
      "name": "Authentication API",
      "description": "Complete REST API for user authentication",
      "isCompleted": true,
      "completedDate": "2024-01-20"
    }
  ]
}
```

#### **Delete Task (Soft Delete)**
```http
DELETE /api/task/:id
POST /api/task/:id/delete
```

### **2. Task Assignment & Team Management**

#### **Assign Employee to Task**
```http
POST /api/task/:id/employees/:employeeId/assign
```

**Request Body:**
```json
{
  "role": "Contributor"
}
```

#### **Remove Employee from Task**
```http
DELETE /api/task/:id/employees/:employeeId/remove
POST /api/task/:id/employees/:employeeId/remove
```

### **3. Time Tracking & Progress (Employee Access)**

#### **Add Time Entry**
```http
POST /api/task/employee/:id/time-entry
```

**Headers:**
```
Authorization: Bearer <employee_token>
```

**Request Body:**
```json
{
  "startTime": "2024-01-20T09:00:00.000Z",
  "endTime": "2024-01-20T17:00:00.000Z",
  "description": "Implemented JWT token generation and validation",
  "isBillable": true
}
```

#### **Update Task Progress**
```http
PUT /api/task/employee/:id/progress
POST /api/task/employee/:id/progress
```

**Request Body:**
```json
{
  "progress": 50,
  "status": "in-progress",
  "comment": "Completed JWT implementation, working on role-based access control"
}
```

### **4. Task Communication**

#### **Add Task Comment**
```http
POST /api/task/employee/:id/comment
```

**Request Body:**
```json
{
  "content": "Need clarification on the password reset flow requirements",
  "isInternal": false
}
```

### **5. Task Analytics (Admin Only)**

#### **Get Task Statistics**
```http
GET /api/task/stats/overview?project=project_id&status=pending&priority=high&type=development&assignedTo=employee_id
```

**Response:**
```json
{
  "success": true,
  "message": "Task statistics retrieved successfully",
  "data": {
    "stats": {
      "overview": {
        "totalTasks": 150,
        "completedTasks": 75,
        "inProgressTasks": 45,
        "pendingTasks": 20,
        "overdueTasks": 10,
        "totalEstimatedHours": 1200,
        "totalActualHours": 800,
        "avgProgress": 65
      },
      "priorityDistribution": [
        {
          "_id": "low",
          "count": 30,
          "avgProgress": 80
        },
        {
          "_id": "medium",
          "count": 60,
          "avgProgress": 65
        },
        {
          "_id": "high",
          "count": 45,
          "avgProgress": 55
        },
        {
          "_id": "urgent",
          "count": 15,
          "avgProgress": 40
        }
      ],
      "statusDistribution": [
        {
          "_id": "pending",
          "count": 20,
          "avgProgress": 0
        },
        {
          "_id": "in-progress",
          "count": 45,
          "avgProgress": 45
        },
        {
          "_id": "completed",
          "count": 75,
          "avgProgress": 100
        }
      ],
      "typeDistribution": [
        {
          "_id": "development",
          "count": 80,
          "avgProgress": 70
        },
        {
          "_id": "design",
          "count": 40,
          "avgProgress": 60
        },
        {
          "_id": "testing",
          "count": 30,
          "avgProgress": 55
        }
      ]
    }
  }
}
```

## **🔒 Access Control Matrix**

| Endpoint | Super Admin | Company Admin | Employee |
|----------|-------------|---------------|----------|
| `/create` | ✅ | ✅ | ❌ |
| `/list` | ✅ | ✅ | ❌ |
| `/:id` | ✅ | ✅ | ❌ |
| `/update` | ✅ | ✅ | ❌ |
| `/delete` | ✅ | ✅ | ❌ |
| `/employees/assign` | ✅ | ✅ | ❌ |
| `/employees/remove` | ✅ | ✅ | ❌ |
| `/stats/overview` | ✅ | ✅ | ❌ |
| `/employee/list` | ❌ | ❌ | ✅ |
| `/employee/:id` | ❌ | ❌ | ✅ |
| `/employee/:id/progress` | ❌ | ❌ | ✅ |
| `/employee/:id/time-entry` | ❌ | ❌ | ✅ |
| `/employee/:id/comment` | ❌ | ❌ | ✅ |

## **📊 Data Models**

### **Task Schema**
```json
{
  "title": "string (required, max: 200)",
  "description": "string (required)",
  "shortDescription": "string (max: 500)",
  "project": "ObjectId (required, ref: Project)",
  "client": "ObjectId (required, ref: Client)",
  "company": "ObjectId (required, ref: Company)",
  "type": "enum (required)",
  "category": "string (required)",
  "priority": "enum (required, default: medium)",
  "complexity": "enum (default: moderate)",
  "assignedTo": "ObjectId (required, ref: Employee)",
  "assignedBy": "ObjectId (required, ref: Admin)",
  "startDate": "date (required)",
  "dueDate": "date (required)",
  "estimatedHours": "number (required, min: 0.5)",
  "actualHours": "number (default: 0, min: 0)",
  "status": "enum (required, default: pending)",
  "progress": "number (min: 0, max: 100, default: 0)",
  "completionDate": "date",
  "dependencies": "array of dependency objects",
  "parentTask": "ObjectId (ref: Task)",
  "subTasks": "array of task IDs",
  "deliverables": "array of deliverable objects",
  "requirements": "array of requirement objects",
  "timeEntries": "array of time entry objects",
  "teamMembers": "array of team member objects",
  "comments": "array of comment objects",
  "tags": "array of strings",
  "labels": "array of strings",
  "createdBy": "ObjectId (required, ref: Admin)"
}
```

### **Time Entry Object**
```json
{
  "employee": "ObjectId (required, ref: Employee)",
  "startTime": "date (required)",
  "endTime": "date",
  "duration": "number (in minutes)",
  "description": "string",
  "isBillable": "boolean (default: true)"
}
```

### **Deliverable Object**
```json
{
  "name": "string (required)",
  "description": "string",
  "fileType": "string",
  "isRequired": "boolean (default: true)",
  "isCompleted": "boolean (default: false)",
  "completedDate": "date"
}
```

### **Dependency Object**
```json
{
  "task": "ObjectId (ref: Task)",
  "type": "enum (blocks, blocked-by, related-to, default: blocks)"
}
```

## **🚀 Testing Examples**

### **cURL Examples**

#### **Create Task (Admin)**
```bash
curl -X POST http://localhost:3000/api/task/create \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement User Authentication",
    "description": "Create user authentication system with JWT",
    "project": "project_id",
    "client": "client_id",
    "type": "development",
    "category": "Backend Development",
    "priority": "high",
    "assignedTo": "employee_id",
    "startDate": "2024-01-15",
    "dueDate": "2024-01-30",
    "estimatedHours": 40
  }'
```

#### **Add Time Entry (Employee)**
```bash
curl -X POST http://localhost:3000/api/task/employee/task_id/time-entry \
  -H "Authorization: Bearer <employee_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": "2024-01-20T09:00:00.000Z",
    "endTime": "2024-01-20T17:00:00.000Z",
    "description": "Implemented JWT token generation",
    "isBillable": true
  }'
```

#### **Update Task Progress (Employee)**
```bash
curl -X PUT http://localhost:3000/api/task/employee/task_id/progress \
  -H "Authorization: Bearer <employee_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "progress": 50,
    "status": "in-progress",
    "comment": "Completed JWT implementation"
  }'
```

### **JavaScript Examples**

#### **Create Task**
```javascript
const response = await fetch('/api/task/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Implement User Authentication',
    description: 'Create user authentication system with JWT',
    project: 'project_id',
    client: 'client_id',
    type: 'development',
    category: 'Backend Development',
    priority: 'high',
    assignedTo: 'employee_id',
    startDate: '2024-01-15',
    dueDate: '2024-01-30',
    estimatedHours: 40
  })
});
```

#### **Add Time Entry**
```javascript
const response = await fetch(`/api/task/employee/${taskId}/time-entry`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${employeeToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    description: 'Implemented JWT token generation',
    isBillable: true
  })
});
```

## **⚠️ Error Handling**

### **Common Error Responses**

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
  "message": "Access denied. You can only modify your assigned tasks.",
  "statusCode": 403
}
```

#### **Task Not Found**
```json
{
  "success": false,
  "message": "Task not found",
  "statusCode": 404
}
```

#### **Dependency Error**
```json
{
  "success": false,
  "message": "Cannot delete task with active dependencies. Please complete or cancel dependent tasks first.",
  "statusCode": 400
}
```

## **🔧 Best Practices**

1. **Task Dependencies**: Always consider task dependencies when creating and updating tasks
2. **Time Tracking**: Encourage employees to log time accurately for better project management
3. **Progress Updates**: Regular progress updates help keep projects on track
4. **Communication**: Use task comments for important updates and clarifications
5. **Priority Management**: Regularly review and update task priorities based on project needs
6. **Resource Allocation**: Ensure tasks are assigned to employees with appropriate skills
7. **Deadline Management**: Set realistic deadlines and monitor for overdue tasks

## **📈 Performance Considerations**

1. **Pagination**: Use pagination for large task lists
2. **Filtering**: Implement efficient filtering and search capabilities
3. **Indexing**: Ensure proper database indexing on frequently queried fields
4. **Caching**: Consider caching task data for frequently accessed information
5. **Real-time Updates**: Implement real-time updates for task status changes
6. **Bulk Operations**: Support bulk operations for task management
7. **Reporting**: Efficient task reporting and analytics for project insights
