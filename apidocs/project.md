# Project Management API Documentation

## Overview
The Project Management API provides comprehensive endpoints for creating, managing, and tracking projects. It supports two main project types: Digital Marketing and Development, with detailed project splitting, phase management, team collaboration, and analytics.

## Base URL
```
http://localhost:3500/api/project
```

## Authentication
- **Admin Routes**: Require JWT token with admin/superAdmin role
- **Client Routes**: Require JWT token with client role
- **All Routes**: Require authentication (no public endpoints)

## Project Model Schema

### Basic Project Information
```json
{
  "title": "string (required, max 200 chars)",
  "description": "string (required, max 2000 chars)",
  "shortDescription": "string (max 500 chars)",
  "projectType": "enum (required: 'digital-marketing', 'development')",
  "category": "string (required)"
}
```

### Digital Marketing Specific Fields
```json
{
  "digitalMarketing": {
    "serviceType": "enum (SEO, PPC, Social Media Marketing, Content Marketing, Email Marketing, Influencer Marketing, Affiliate Marketing, Analytics & Reporting, Brand Strategy, Other)",
    "platforms": ["enum (Google, Facebook, Instagram, LinkedIn, Twitter, YouTube, TikTok, Pinterest, Other)"],
    "targetAudience": "string",
    "campaignDuration": "string",
    "budget": {
      "min": "number",
      "max": "number",
      "currency": "string (default: 'USD')"
    }
  }
}
```

### Development Specific Fields
```json
{
  "development": {
    "technology": {
      "frontend": ["string"],
      "backend": ["string"],
      "database": ["string"],
      "mobile": ["string"],
      "other": ["string"]
    },
    "platform": "enum (Web, Mobile, Desktop, Hybrid, Other)",
    "complexity": "enum (Simple, Medium, Complex, Enterprise)",
    "estimatedHours": {
      "min": "number",
      "max": "number"
    }
  }
}
```

### Project Management Fields
```json
{
  "status": "enum (planning, active, on-hold, completed, cancelled, archived)",
  "priority": "enum (low, medium, high, urgent)",
  "progress": "number (0-100)",
  "startDate": "date (required)",
  "endDate": "date (required)",
  "estimatedDuration": "number (days, required)"
}
```

### Financial Information
```json
{
  "budget": {
    "total": "number (required)",
    "allocated": "number",
    "spent": "number",
    "currency": "string (default: 'USD')"
  },
  "billing": {
    "type": "enum (hourly, fixed, milestone, retainer)",
    "rate": "number",
    "paymentTerms": "string"
  }
}
```

### Project Phases
```json
{
  "phases": [{
    "name": "string (required)",
    "description": "string",
    "startDate": "date",
    "endDate": "date",
    "status": "enum (pending, active, completed, on-hold)",
    "progress": "number (0-100)",
    "deliverables": [{
      "name": "string",
      "description": "string",
      "status": "enum (pending, in-progress, completed, review)",
      "dueDate": "date",
      "assignedTo": "admin_id"
    }],
    "tasks": [{
      "title": "string",
      "description": "string",
      "status": "enum (todo, in-progress, review, completed)",
      "priority": "enum (low, medium, high)",
      "estimatedHours": "number",
      "assignedTo": "admin_id",
      "dueDate": "date"
    }],
    "budget": {
      "allocated": "number",
      "spent": "number",
      "currency": "string"
    }
  }]
}
```

## API Endpoints

### 1. Create Project (Admin Required)
**POST** `/create`

Creates a new project with detailed configuration.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request Body:**
```json
{
  "title": "Website Redesign & SEO Optimization",
  "description": "Complete website redesign with modern UI/UX and comprehensive SEO optimization for better search engine rankings.",
  "shortDescription": "Website redesign with SEO focus",
  "projectType": "development",
  "category": "Web Development",
  "development": {
    "technology": {
      "frontend": ["React", "TypeScript", "Tailwind CSS"],
      "backend": ["Node.js", "Express"],
      "database": ["MongoDB"]
    },
    "platform": "Web",
    "complexity": "Medium",
    "estimatedHours": {
      "min": 120,
      "max": 160
    }
  },
  "client": "client_id_here",
  "startDate": "2024-02-01",
  "endDate": "2024-04-30",
  "estimatedDuration": 90,
  "budget": {
    "total": 25000,
    "currency": "USD"
  },
  "billing": {
    "type": "fixed"
  },
  "projectManager": "admin_id_here",
  "phases": [
    {
      "name": "Planning & Design",
      "description": "Requirements gathering, wireframing, and UI/UX design",
      "startDate": "2024-02-01",
      "endDate": "2024-02-28",
      "budget": {
        "allocated": 5000,
        "currency": "USD"
      }
    },
    {
      "name": "Development",
      "description": "Frontend and backend development",
      "startDate": "2024-03-01",
      "endDate": "2024-04-15",
      "budget": {
        "allocated": 15000,
        "currency": "USD"
      }
    },
    {
      "name": "Testing & Launch",
      "description": "Quality assurance and deployment",
      "startDate": "2024-04-16",
      "endDate": "2024-04-30",
      "budget": {
        "allocated": 5000,
        "currency": "USD"
      }
    }
  ],
  "communication": {
    "channels": ["email", "slack", "meeting"],
    "frequency": "weekly"
  },
  "tags": ["website", "redesign", "seo", "react"]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "project": {
      "_id": "project_id_here",
      "title": "Website Redesign & SEO Optimization",
      "projectType": "development",
      "status": "planning",
      "progress": 0,
      "budget": {
        "total": 25000,
        "allocated": 25000,
        "spent": 0,
        "remaining": 25000
      },
      "client": {
        "_id": "client_id_here",
        "firstName": "John",
        "lastName": "Doe"
      },
      "company": "company_id_here",
      "projectManager": {
        "_id": "admin_id_here",
        "firstName": "Project",
        "lastName": "Manager"
      },
      "phases": [
        {
          "_id": "phase_id_here",
          "name": "Planning & Design",
          "status": "pending",
          "progress": 0
        }
      ],
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### 2. Get All Projects (Admin Required)
**GET** `/list`

Retrieves a paginated list of projects with comprehensive filtering options.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search in title, description, category
- `status` (optional): Filter by status
- `projectType` (optional): Filter by project type
- `category` (optional): Filter by category
- `priority` (optional): Filter by priority
- `client` (optional): Filter by client ID
- `company` (optional): Filter by company ID
- `startDate` (optional): Filter by start date range
- `endDate` (optional): Filter by end date range

**Example Request:**
```
GET /api/project/list?page=1&limit=20&status=active&projectType=development
```

**Response (200):**
```json
{
  "success": true,
  "message": "Projects retrieved successfully",
  "data": {
    "projects": {
      "docs": [
        {
          "_id": "project_id_here",
          "title": "Website Redesign & SEO Optimization",
          "projectType": "development",
          "category": "Web Development",
          "status": "active",
          "priority": "high",
          "progress": 45,
          "budget": {
            "total": 25000,
            "spent": 11250
          },
          "client": {
            "_id": "client_id_here",
            "firstName": "John",
            "lastName": "Doe",
            "companyName": "Tech Solutions Inc"
          },
          "company": {
            "_id": "company_id_here",
            "name": "Tech Corp"
          },
          "projectManager": {
            "_id": "admin_id_here",
            "firstName": "Project",
            "lastName": "Manager"
          },
          "startDate": "2024-02-01T00:00:00.000Z",
          "endDate": "2024-04-30T00:00:00.000Z"
        }
      ],
      "totalDocs": 45,
      "limit": 20,
      "page": 1,
      "totalPages": 3
    }
  }
}
```

### 3. Get Project by ID (Admin Required)
**GET** `/:id`

Retrieves detailed information about a specific project including all phases, tasks, and team members.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Project retrieved successfully",
  "data": {
    "project": {
      "_id": "project_id_here",
      "title": "Website Redesign & SEO Optimization",
      "description": "Complete website redesign with modern UI/UX and comprehensive SEO optimization...",
      "projectType": "development",
      "category": "Web Development",
      "development": {
        "technology": {
          "frontend": ["React", "TypeScript", "Tailwind CSS"],
          "backend": ["Node.js", "Express"],
          "database": ["MongoDB"]
        },
        "platform": "Web",
        "complexity": "Medium",
        "estimatedHours": {
          "min": 120,
          "max": 160
        }
      },
      "status": "active",
      "priority": "high",
      "progress": 45,
      "budget": {
        "total": 25000,
        "allocated": 25000,
        "spent": 11250,
        "remaining": 13750
      },
      "phases": [
        {
          "_id": "phase_id_here",
          "name": "Planning & Design",
          "status": "completed",
          "progress": 100,
          "deliverables": [
            {
              "_id": "deliverable_id_here",
              "name": "Wireframes",
              "status": "completed",
              "assignedTo": {
                "_id": "admin_id_here",
                "firstName": "Designer",
                "lastName": "User"
              }
            }
          ],
          "tasks": [
            {
              "_id": "task_id_here",
              "title": "Create wireframes",
              "status": "completed",
              "priority": "high",
              "estimatedHours": 20,
              "assignedTo": {
                "_id": "admin_id_here",
                "firstName": "Designer",
                "lastName": "User"
              }
            }
          ]
        }
      ],
      "team": [
        {
          "_id": "team_member_id_here",
          "member": {
            "_id": "admin_id_here",
            "firstName": "Project",
            "lastName": "Manager"
          },
          "role": "Project Manager",
          "isActive": true
        }
      ],
      "issues": [
        {
          "_id": "issue_id_here",
          "title": "Design approval delayed",
          "description": "Client needs more time to review design concepts",
          "severity": "medium",
          "status": "open",
          "reportedBy": {
            "_id": "admin_id_here",
            "firstName": "Project",
            "lastName": "Manager"
          }
        }
      ],
      "risks": [
        {
          "_id": "risk_id_here",
          "description": "Potential scope creep during development phase",
          "probability": "medium",
          "impact": "high",
          "status": "identified",
          "mitigation": "Regular client check-ins and change request process"
        }
      ]
    }
  }
}
```

### 4. Update Project (Admin Required)
**PUT** `/:id` or **POST** `/:id/update`

Updates project information and configuration.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request Body:**
```json
{
  "title": "Website Redesign & SEO Optimization - Updated",
  "priority": "urgent",
  "phases": [
    {
      "name": "Planning & Design",
      "status": "completed",
      "progress": 100
    },
    {
      "name": "Development",
      "status": "active",
      "progress": 60
    }
  ],
  "notes": "Project scope updated based on client feedback"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "project": {
      "_id": "project_id_here",
      "title": "Website Redesign & SEO Optimization - Updated",
      "priority": "urgent",
      "progress": 80,
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

### 5. Delete Project (Admin Required)
**DELETE** `/:id` or **POST** `/:id/delete`

Soft deletes a project (sets status to archived).

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Project archived successfully"
}
```

### 6. Add Project Phase (Admin Required)
**POST** `/:id/phases`

Adds a new phase to an existing project.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request Body:**
```json
{
  "name": "Quality Assurance",
  "description": "Comprehensive testing and bug fixing",
  "startDate": "2024-04-01",
  "endDate": "2024-04-15",
  "budget": {
    "allocated": 3000,
    "currency": "USD"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Phase added successfully",
  "data": {
    "phase": {
      "_id": "phase_id_here",
      "name": "Quality Assurance",
      "status": "pending",
      "progress": 0
    }
  }
}
```
 <!-- ###  Check if Phase was Actually Created  
GET http://localhost:3500/api/project/:projectID
Authorization: Bearer your_admin_jwt_token_here

** Response
{
  "success": true,
  "message": "Operation successful",
  "timestamp": "2025-09-09T05:52:22.534Z",
  "data": {
    "message": "Phase added successfully",
    "phase": {
      "_id": "68bfbe487893fa82d99c3043",
      "name": "Quality Assurance",
      "description": "Comprehensive testing and bug fixing",
      "startDate": "2024-04-01T00:00:00.000Z",
      "endDate": "2024-04-15T00:00:00.000Z",
      "status": "pending",
      "progress": 0,
      "deliverables": [],
      "tasks": [],
      "budget": {
        "allocated": 3000,
        "spent": 0,
        "remaining": 3000,
        "currency": "USD"
      },
      "createdAt": "2025-09-09T05:52:22.534Z",
      "updatedAt": "2025-09-09T05:52:22.534Z"
    }
  }
} -->


### 7. Update Project Phase (Admin Required)
**PUT** `/:id/phases/:phaseId` or **POST** `/:id/phases/:phaseId/update`

Updates an existing project phase.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request Body:**
```json
{
  "status": "active",
  "progress": 25
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Phase updated successfully",
  "data": {
    "phase": {
      "_id": "phase_id_here",
      "status": "active",
      "progress": 25
    }
  }
}
```

### 8. Add Team Member (Admin Required)
**POST** `/:id/team`

Adds a new team member to the project.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request Body:**
```json
{
  "member": "admin_id_here",
  "role": "Frontend Developer"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Team member added successfully"
}
```

### 9. Remove Team Member (Admin Required)
**DELETE** `/:id/team/:memberId` or **POST** `/:id/team/:memberId/remove`

Removes a team member from the project.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Team member removed successfully"
}
```

### 10. Add Project Issue (Admin Required)
**POST** `/:id/issues`

Adds a new issue to the project.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request Body:**
```json
{
  "title": "Database connection timeout",
  "description": "Database queries are timing out during peak hours",
  "severity": "high",
  "assignedTo": "admin_id_here"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Issue added successfully",
  "data": {
    "issue": {
      "_id": "issue_id_here",
      "title": "Database connection timeout",
      "status": "open",
      "severity": "high"
    }
  }
}
```

### 11. Add Project Risk (Admin Required)
**POST** `/:id/risks`

Adds a new risk to the project.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request Body:**
```json
{
  "description": "Third-party API rate limiting",
  "probability": "medium",
  "impact": "high",
  "mitigation": "Implement caching and fallback mechanisms",
  "assignedTo": "admin_id_here"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Risk added successfully",
  "data": {
    "risk": {
      "_id": "risk_id_here",
      "description": "Third-party API rate limiting",
      "status": "identified"
    }
  }
}
```

### 12. Get Project Statistics (Admin Required)
**GET** `/stats/overview`

Retrieves comprehensive project statistics and analytics.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**
- `company` (optional): Filter by company ID
- `projectType` (optional): Filter by project type
- `status` (optional): Filter by status

**Response (200):**
```json
{
  "success": true,
  "message": "Project statistics retrieved successfully",
  "data": {
    "stats": {
      "overview": {
        "totalProjects": 150,
        "activeProjects": 45,
        "completedProjects": 95,
        "planningProjects": 8,
        "onHoldProjects": 2,
        "totalBudget": 2500000,
        "totalSpent": 1800000,
        "avgProgress": 68
      },
      "typeDistribution": [
        {
          "_id": "development",
          "count": 80,
          "avgBudget": 20000,
          "avgProgress": 72
        },
        {
          "_id": "digital-marketing",
          "count": 70,
          "avgBudget": 15000,
          "avgProgress": 65
        }
      ],
      "statusDistribution": [
        {
          "_id": "active",
          "count": 45,
          "avgBudget": 18000
        },
        {
          "_id": "completed",
          "count": 95,
          "avgBudget": 22000
        }
      ],
      "priorityDistribution": [
        {
          "_id": "high",
          "count": 60
        },
        {
          "_id": "medium",
          "count": 70
        },
        {
          "_id": "low",
          "count": 20
        }
      ]
    }
  }
}
```

### 13. Create Client Project (Client Auth Required)
**POST** `/client/create`

Allows clients to create their own projects.

**Headers:**
```
Authorization: Bearer <client_jwt_token>
```

**Request Body:**
```json
{
  "title": "Social Media Campaign",
  "description": "Comprehensive social media marketing campaign across multiple platforms",
  "projectType": "digital-marketing",
  "category": "Social Media Marketing",
  "digitalMarketing": {
    "serviceType": "Social Media Marketing",
    "platforms": ["Facebook", "Instagram", "LinkedIn"],
    "targetAudience": "B2B professionals aged 25-45",
    "campaignDuration": "3 months"
  },
  "startDate": "2024-03-01",
  "endDate": "2024-05-31",
  "estimatedDuration": 90,
  "budget": {
    "total": 12000,
    "currency": "USD"
  },
  "tags": ["social-media", "b2b", "marketing"]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "project": {
      "_id": "project_id_here",
      "title": "Social Media Campaign",
      "projectType": "digital-marketing",
      "status": "planning",
      "client": "client_id_here",
      "company": "company_id_here",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### 14. Client Project Access Routes

#### Get Client Projects List
**GET** `/client/list`

**Headers:**
```
Authorization: Bearer <client_jwt_token>
```

#### Get Client Project by ID
**GET** `/client/:id`

**Headers:**
```
Authorization: Bearer <client_jwt_token>
```

#### Update Client Project
**PUT** `/client/:id` or **POST** `/client/:id/update`

**Headers:**
```
Authorization: Bearer <client_jwt_token>
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
| `/create` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/list` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/:id` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/:id/update` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/:id/delete` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/:id/phases` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `/:id/team` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/:id/issues` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/:id/risks` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `/stats/overview` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/client/create` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/client/list` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/client/:id` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/client/:id/update` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

## Rate Limiting
- **Admin Routes**: 200 requests per minute per admin
- **Client Routes**: 100 requests per minute per client
- **Project Creation**: 10 requests per minute per user

## Security Features
- JWT token authentication
- Company-based access control
- Role-based permissions
- Input validation and sanitization
- CORS protection
- Helmet security headers

## Testing Examples

### cURL Examples

#### Create Project (Admin)
```bash
curl -X POST http://localhost:3000/api/project/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -d '{
    "title": "Website Redesign",
    "description": "Complete website redesign project",
    "projectType": "development",
    "category": "Web Development",
    "client": "client_id_here",
    "startDate": "2024-02-01",
    "endDate": "2024-04-30",
    "estimatedDuration": 90,
    "budget": {
      "total": 25000
    }
  }'
```

#### Create Client Project
```bash
curl -X POST http://localhost:3000/api/project/client/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <client_jwt_token>" \
  -d '{
    "title": "Social Media Campaign",
    "description": "Social media marketing campaign",
    "projectType": "digital-marketing",
    "category": "Marketing",
    "startDate": "2024-03-01",
    "endDate": "2024-05-31",
    "estimatedDuration": 90,
    "budget": {
      "total": 12000
    }
  }'
```

### JavaScript Examples

#### Create Project (Admin)
```javascript
const response = await fetch('http://localhost:3000/api/project/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <admin_jwt_token>'
  },
  body: JSON.stringify({
    title: 'Website Redesign',
    description: 'Complete website redesign project',
    projectType: 'development',
    category: 'Web Development',
    client: 'client_id_here',
    startDate: '2024-02-01',
    endDate: '2024-04-30',
    estimatedDuration: 90,
    budget: {
      total: 25000
    }
  })
});

const data = await response.json();
console.log(data);
```

#### Get Project Statistics
```javascript
const response = await fetch('http://localhost:3000/api/project/stats/overview?company=company_id_here', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer <admin_jwt_token>'
  }
});

const data = await response.json();
console.log(data);
```

## Notes
- Projects automatically calculate progress based on phase completion
- Budget remaining is automatically calculated
- Project phases support detailed task and deliverable management
- Clients can only create projects within their assigned company
- All timestamps are in ISO 8601 format
- Pagination is handled using the `mongoose-paginate-v2` plugin
- Project status changes trigger automatic updates to client statistics
