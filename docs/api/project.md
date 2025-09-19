# 📋 Project Management APIs

## 📋 **Overview**

The Project Management APIs provide comprehensive functionality for managing projects within the CRIPCOCODE CRM system. These endpoints handle project creation, lifecycle management, phase tracking, and analytics with support for both digital marketing and development projects.

## 🔗 **Base Endpoints**

```
Base URL: /api/project
```

## 🔐 **Access Control**

- **Super Admin**: Full access to all projects across all companies
- **Company Admin**: Access only to projects within their company
- **Manager**: Full access to projects within their company
- **Sales**: Read and limited update access to projects within their company
- **Support**: Read-only access to project information within their company

## 📝 **API Endpoints**

### **1. Create Project**

#### **POST** `/project/create`

Creates a new project in the system.

**Access Level**: Admin+

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "E-commerce Website Development",
  "description": "Build a modern e-commerce platform with payment integration",
  "projectType": "development",
  "category": "web-development",
  "client": "client_id_here",
  "company": "company_id_here",
  "startDate": "2024-01-15",
  "endDate": "2024-04-15",
  "estimatedDuration": 90,
  "budget": {
    "total": 25000,
    "currency": "USD",
    "breakdown": {
      "design": 5000,
      "development": 15000,
      "testing": 3000,
      "deployment": 2000
    }
  },
  "projectManager": "admin_id_here",
  "team": ["employee_id_1", "employee_id_2"],
  "priority": "high",
  "requirements": {
    "features": ["user-authentication", "product-catalog", "shopping-cart", "payment-gateway"],
    "technologies": ["react", "nodejs", "mongodb", "stripe"],
    "platforms": ["web", "mobile-responsive"]
  }
}
```

**Required Fields**:
- `title` (string): Project title
- `description` (string): Project description
- `projectType` (string): Type (development, digital-marketing)
- `category` (string): Project category
- `client` (string): Client ID reference
- `company` (string): Company ID reference
- `startDate` (date): Project start date
- `endDate` (date): Project end date

**Optional Fields**:
- `estimatedDuration` (number): Estimated duration in days
- `budget` (object): Budget details
- `projectManager` (string): Project manager ID
- `team` (array): Team member IDs
- `priority` (string): Priority level (low, medium, high, urgent)
- `requirements` (object): Project requirements
- `phases` (array): Project phases
- `tags` (array): Project tags

**Success Response** (201):
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "project": {
      "_id": "project_id_here",
      "title": "E-commerce Website Development",
      "description": "Build a modern e-commerce platform with payment integration",
      "projectType": "development",
      "category": "web-development",
      "client": "client_id_here",
      "company": "company_id_here",
      "startDate": "2024-01-15T00:00:00.000Z",
      "endDate": "2024-04-15T00:00:00.000Z",
      "estimatedDuration": 90,
      "budget": {
        "total": 25000,
        "currency": "USD"
      },
      "projectManager": "admin_id_here",
      "status": "planning",
      "progress": 0,
      "priority": "high",
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
- `409` - Project title already exists
- `500` - Server error

---

### **2. List All Projects**

#### **GET** `/project/list`

Retrieves a paginated list of projects.

**Access Level**: Admin+

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search term for title/description
- `status` (string): Filter by status (planning, active, on-hold, completed, cancelled)
- `projectType` (string): Filter by type (development, digital-marketing)
- `category` (string): Filter by category
- `priority` (string): Filter by priority
- `client` (string): Filter by client ID
- `projectManager` (string): Filter by project manager
- `sort` (string): Sort field (default: createdAt)
- `order` (string): Sort order (asc, desc, default: desc)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Projects retrieved successfully",
  "data": {
    "projects": [
      {
        "_id": "project_id_1",
        "title": "E-commerce Website Development",
        "projectType": "development",
        "category": "web-development",
        "client": "client_id_here",
        "status": "active",
        "progress": 45,
        "priority": "high",
        "startDate": "2024-01-15T00:00:00.000Z",
        "endDate": "2024-04-15T00:00:00.000Z",
        "budget": {
          "total": 25000,
          "currency": "USD"
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

### **3. Get Project Details**

#### **GET** `/project/:id`

Retrieves detailed information about a specific project.

**Access Level**: Admin+, Client (own projects)

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**URL Parameters**:
- `id` (string): Project ID

**Success Response** (200):
```json
{
  "success": true,
  "message": "Project details retrieved successfully",
  "data": {
    "project": {
      "_id": "project_id_here",
      "title": "E-commerce Website Development",
      "description": "Build a modern e-commerce platform with payment integration",
      "projectType": "development",
      "category": "web-development",
      "client": "client_id_here",
      "company": "company_id_here",
      "startDate": "2024-01-15T00:00:00.000Z",
      "endDate": "2024-04-15T00:00:00.000Z",
      "estimatedDuration": 90,
      "actualDuration": 45,
      "budget": {
        "total": 25000,
        "currency": "USD",
        "breakdown": {
          "design": 5000,
          "development": 15000,
          "testing": 3000,
          "deployment": 2000
        },
        "spent": 12000,
        "remaining": 13000
      },
      "projectManager": "admin_id_here",
      "team": ["employee_id_1", "employee_id_2"],
      "status": "active",
      "progress": 45,
      "priority": "high",
      "phases": [
        {
          "_id": "phase_id_1",
          "name": "Planning & Design",
          "description": "Project planning and UI/UX design",
          "startDate": "2024-01-15T00:00:00.000Z",
          "endDate": "2024-01-30T00:00:00.000Z",
          "progress": 100,
          "status": "completed",
          "deliverables": ["wireframes", "design-mockups"],
          "tasks": ["task_id_1", "task_id_2"]
        }
      ],
      "requirements": {
        "features": ["user-authentication", "product-catalog", "shopping-cart", "payment-gateway"],
        "technologies": ["react", "nodejs", "mongodb", "stripe"],
        "platforms": ["web", "mobile-responsive"]
      },
      "timeline": {
        "milestones": [
          {
            "name": "Design Complete",
            "date": "2024-01-30T00:00:00.000Z",
            "status": "completed"
          }
        ]
      },
      "communication": {
        "clientUpdates": ["update_id_1"],
        "teamMeetings": ["meeting_id_1"],
        "documents": ["document_id_1"]
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "createdBy": "admin_id_here",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `400` - Invalid project ID
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Project not found
- `500` - Server error

---

### **4. Update Project**

#### **PUT** `/project/:id` or **POST** `/project/:id/update`

Updates an existing project's information.

**Access Level**: Admin+, Project Manager

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**URL Parameters**:
- `id` (string): Project ID

**Request Body**:
```json
{
  "title": "E-commerce Website Development v2.0",
  "description": "Enhanced e-commerce platform with advanced features",
  "endDate": "2024-05-15",
  "estimatedDuration": 120,
  "budget": {
    "total": 30000,
    "breakdown": {
      "design": 6000,
      "development": 18000,
      "testing": 4000,
      "deployment": 2000
    }
  },
  "priority": "urgent",
  "status": "active"
}
```

**Updatable Fields**:
- `title` (string): Project title
- `description` (string): Project description
- `startDate` (date): Project start date
- `endDate` (date): Project end date
- `estimatedDuration` (number): Estimated duration
- `budget` (object): Budget details
- `projectManager` (string): Project manager ID
- `team` (array): Team member IDs
- `priority` (string): Priority level
- `status` (string): Project status
- `requirements` (object): Project requirements
- `tags` (array): Project tags

**Success Response** (200):
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "project": {
      "_id": "project_id_here",
      "title": "E-commerce Website Development v2.0",
      "description": "Enhanced e-commerce platform with advanced features",
      "endDate": "2024-05-15T00:00:00.000Z",
      "estimatedDuration": 120,
      "budget": {
        "total": 30000,
        "breakdown": {
          "design": 6000,
          "development": 18000,
          "testing": 4000,
          "deployment": 2000
        }
      },
      "priority": "urgent",
      "status": "active",
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
- `404` - Project not found
- `409` - Project title already exists
- `500` - Server error

---

### **5. Delete Project**

#### **DELETE** `/project/:id` or **POST** `/project/:id/delete`

Soft deletes a project (marks as cancelled).

**Access Level**: Admin+, Project Manager

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**URL Parameters**:
- `id` (string): Project ID

**Request Body**: None required

**Success Response** (200):
```json
{
  "success": true,
  "message": "Project deleted successfully",
  "data": {
    "project": {
      "_id": "project_id_here",
      "title": "E-commerce Website Development v2.0",
      "status": "cancelled",
      "deletedAt": "2024-01-15T12:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T12:30:00.000Z"
}
```

**Error Responses**:
- `400` - Invalid project ID
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Project not found
- `409` - Project has active tasks/phases
- `500` - Server error

---

### **6. Add Project Phase**

#### **POST** `/project/:id/phases`

Adds a new phase to an existing project.

**Access Level**: Admin+, Project Manager

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**URL Parameters**:
- `id` (string): Project ID

**Request Body**:
```json
{
  "name": "Development Phase",
  "description": "Core development of the e-commerce platform",
  "startDate": "2024-02-01",
  "endDate": "2024-03-15",
  "deliverables": ["user-authentication", "product-catalog", "shopping-cart"],
  "dependencies": ["phase_id_1"],
  "assignedTeam": ["employee_id_1", "employee_id_2"],
  "budget": 15000
}
```

**Required Fields**:
- `name` (string): Phase name
- `description` (string): Phase description
- `startDate` (date): Phase start date
- `endDate` (date): Phase end date

**Optional Fields**:
- `deliverables` (array): Phase deliverables
- `dependencies` (array): Dependent phase IDs
- `assignedTeam` (array): Team member IDs
- `budget` (number): Phase budget
- `priority` (string): Phase priority

**Success Response** (201):
```json
{
  "success": true,
  "message": "Project phase added successfully",
  "data": {
    "phase": {
      "_id": "phase_id_2",
      "name": "Development Phase",
      "description": "Core development of the e-commerce platform",
      "startDate": "2024-02-01T00:00:00.000Z",
      "endDate": "2024-03-15T00:00:00.000Z",
      "deliverables": ["user-authentication", "product-catalog", "shopping-cart"],
      "dependencies": ["phase_id_1"],
      "assignedTeam": ["employee_id_1", "employee_id_2"],
      "budget": 15000,
      "status": "planning",
      "progress": 0,
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
- `404` - Project not found
- `409` - Phase name already exists
- `500` - Server error

---

### **7. Update Project Phase**

#### **PUT** `/project/:id/phases/:phaseId` or **POST** `/project/:id/phases/:phaseId`

Updates an existing project phase.

**Access Level**: Admin+, Project Manager

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**URL Parameters**:
- `id` (string): Project ID
- `phaseId` (string): Phase ID

**Request Body**:
```json
{
  "name": "Development Phase v2",
  "endDate": "2024-03-30",
  "deliverables": ["user-authentication", "product-catalog", "shopping-cart", "payment-gateway"],
  "status": "active",
  "progress": 25
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Project phase updated successfully",
  "data": {
    "phase": {
      "_id": "phase_id_2",
      "name": "Development Phase v2",
      "endDate": "2024-03-30T00:00:00.000Z",
      "deliverables": ["user-authentication", "product-catalog", "shopping-cart", "payment-gateway"],
      "status": "active",
      "progress": 25,
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
- `404` - Project or phase not found
- `500` - Server error

---

### **8. Delete Project Phase**

#### **DELETE** `/project/:id/phases/:phaseId` or **POST** `/project/:id/phases/:phaseId/delete`

Deletes a project phase.

**Access Level**: Admin+, Project Manager

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**URL Parameters**:
- `id` (string): Project ID
- `phaseId` (string): Phase ID

**Request Body**: None required

**Success Response** (200):
```json
{
  "success": true,
  "message": "Project phase deleted successfully",
  "data": null,
  "timestamp": "2024-01-15T12:30:00.000Z"
}
```

**Error Responses**:
- `400` - Invalid project or phase ID
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Project or phase not found
- `409` - Phase has active tasks
- `500` - Server error

---

### **9. Project Statistics**

#### **GET** `/project/stats/overview`

Retrieves comprehensive statistics about projects.

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
  "message": "Project statistics retrieved successfully",
  "data": {
    "stats": {
      "overview": {
        "totalProjects": 85,
        "activeProjects": 45,
        "completedProjects": 30,
        "cancelledProjects": 5,
        "onHoldProjects": 5
      },
      "byType": {
        "development": 50,
        "digital-marketing": 35
      },
      "byStatus": {
        "planning": 10,
        "active": 45,
        "on-hold": 5,
        "completed": 30,
        "cancelled": 5
      },
      "byPriority": {
        "low": 15,
        "medium": 40,
        "high": 25,
        "urgent": 5
      },
      "performance": {
        "onTimeDelivery": 85,
        "averageProgress": 65,
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

### **Project Schema**
```json
{
  "_id": "ObjectId",
  "title": "String (required)",
  "description": "String (required)",
  "projectType": "String (required, enum: development, digital-marketing)",
  "category": "String (required)",
  "client": "ObjectId (required, ref: Client)",
  "company": "ObjectId (required, ref: Company)",
  "startDate": "Date (required)",
  "endDate": "Date (required)",
  "estimatedDuration": "Number",
  "actualDuration": "Number",
  "budget": {
    "total": "Number",
    "currency": "String",
    "breakdown": "Object",
    "spent": "Number",
    "remaining": "Number"
  },
  "projectManager": "ObjectId (ref: Admin)",
  "team": ["ObjectId (ref: Employee)"],
  "status": "String (enum: planning, active, on-hold, completed, cancelled)",
  "progress": "Number (0-100)",
  "priority": "String (enum: low, medium, high, urgent)",
  "phases": ["ObjectId (ref: Phase)"],
  "requirements": {
    "features": ["String"],
    "technologies": ["String"],
    "platforms": ["String"]
  },
  "timeline": {
    "milestones": ["Object"]
  },
  "communication": {
    "clientUpdates": ["ObjectId"],
    "teamMeetings": ["ObjectId"],
    "documents": ["ObjectId"]
  },
  "createdBy": "ObjectId (ref: Admin)",
  "createdAt": "Date",
  "updatedAt": "Date",
  "deletedAt": "Date"
}
```

---

## 📝 **Request Examples**

### **cURL Examples**

#### **Create Project**
```bash
curl -X POST http://localhost:5000/api/project/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "title": "Digital Marketing Campaign",
    "description": "Comprehensive digital marketing campaign for brand awareness",
    "projectType": "digital-marketing",
    "category": "social-media-marketing",
    "client": "client_id_here",
    "company": "company_id_here",
    "startDate": "2024-01-15",
    "endDate": "2024-03-15",
    "estimatedDuration": 60,
    "budget": {
      "total": 15000,
      "currency": "USD"
    },
    "priority": "high"
  }'
```

#### **Update Project**
```bash
curl -X PUT http://localhost:5000/api/project/project_id_here \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "title": "Digital Marketing Campaign v2.0",
    "endDate": "2024-04-15",
    "estimatedDuration": 90,
    "budget": {
      "total": 20000
    }
  }'
```

#### **Add Project Phase**
```bash
curl -X POST http://localhost:5000/api/project/project_id_here/phases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "name": "Content Creation",
    "description": "Create engaging content for social media platforms",
    "startDate": "2024-01-15",
    "endDate": "2024-02-15",
    "deliverables": ["social-media-posts", "blog-articles", "videos"]
  }'
```

#### **Get Project Details**
```bash
curl -X GET http://localhost:5000/api/project/project_id_here \
  -H "Authorization: Bearer <admin_token>"
```

#### **List Projects with Filters**
```bash
curl -X GET "http://localhost:5000/api/project/list?page=1&limit=20&status=active&projectType=development&priority=high" \
  -H "Authorization: Bearer <admin_token>"
```

### **JavaScript Examples**

#### **Create Project**
```javascript
const response = await fetch('/api/project/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Digital Marketing Campaign',
    description: 'Comprehensive digital marketing campaign for brand awareness',
    projectType: 'digital-marketing',
    category: 'social-media-marketing',
    client: 'client_id_here',
    company: 'company_id_here',
    startDate: '2024-01-15',
    endDate: '2024-03-15',
    estimatedDuration: 60,
    budget: {
      total: 15000,
      currency: 'USD'
    },
    priority: 'high'
  })
});

const data = await response.json();
```

#### **Update Project**
```javascript
const response = await fetch(`/api/project/${projectId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Digital Marketing Campaign v2.0',
    endDate: '2024-04-15',
    estimatedDuration: 90,
    budget: {
      total: 20000
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
| `400` | Bad Request | Invalid project ID, validation errors | Check request parameters and body |
| `401` | Unauthorized | Missing or invalid authentication | Provide valid JWT token |
| `403` | Forbidden | Insufficient permissions | Check user role and company access |
| `404` | Not Found | Project doesn't exist | Verify project ID |
| `409` | Conflict | Project title already exists, active dependencies | Use different title or resolve dependencies |
| `500` | Internal Server Error | Server-side error | Contact support |

### **Error Response Format**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Project title is required",
      "value": ""
    },
    {
      "field": "endDate",
      "message": "End date must be after start date",
      "value": "2024-01-10"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/project/create",
  "method": "POST"
}
```

---

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Project Configuration
MAX_PROJECTS_PER_COMPANY=500
MAX_PHASES_PER_PROJECT=20
PROJECT_TITLE_MIN_LENGTH=5
PROJECT_TITLE_MAX_LENGTH=200

# Validation
ALLOWED_PROJECT_TYPES=development,digital-marketing
ALLOWED_PROJECT_CATEGORIES=web-development,mobile-development,ui-ux-design,social-media-marketing,seo,content-marketing
ALLOWED_PROJECT_STATUSES=planning,active,on-hold,completed,cancelled
ALLOWED_PRIORITIES=low,medium,high,urgent
```

### **Rate Limiting**
- Project creation: 20 requests per hour per IP
- Project updates: 50 requests per hour per IP
- Project listing: 200 requests per hour per IP
- Phase management: 30 requests per hour per IP

---

## 📚 **Related Documentation**

- [API Overview](../README.md) - Complete API reference
- [Client Management](./client.md) - Client operations
- [Employee Management](./employee.md) - Team management
- [Task Management](./task.md) - Task operations
- [Database Models](../database.md) - Project model schema
- [Security Guide](../security.md) - Multi-tenant security

---

**The Project Management APIs provide comprehensive project lifecycle management with phase tracking, team collaboration, and detailed analytics for both development and digital marketing projects.**
