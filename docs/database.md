# 🗄️ Database Design

## 📚 **Database Overview**

The **CRIPCOCODE CRM** system uses **MongoDB** as its primary database with **Mongoose ODM** for data modeling and validation. The database is designed with a **multi-tenant architecture** that ensures data isolation between different companies while maintaining optimal performance and scalability.

## 🏗️ **Database Architecture**

### **Multi-Tenant Design**
```
┌─────────────────────────────────────────────────────────────┐
│                    CRM Database                             │
├─────────────────────────────────────────────────────────────┤
│  Company A Data                    │  Company B Data       │
│  ┌─────────────────────────────┐   │  ┌─────────────────┐  │
│  │ Admins                      │   │  │ Admins          │  │
│  │ Clients                     │   │  │ Clients         │  │
│  │ Projects                    │   │  │ Projects        │  │
│  │ Tasks                       │   │  │ Tasks           │  │
│  │ Employees                   │   │  │ Employees       │  │
│  └─────────────────────────────┘   │  └─────────────────┘  │
│                                    │                       │
│  Global Data                       │                       │
│  ┌─────────────────────────────┐   │                       │
│  │ Users (Super Admins)       │   │                       │
│  │ System Configuration       │   │                       │
│  │ Audit Logs                 │   │                       │
│  └─────────────────────────────┘   │                       │
└─────────────────────────────────────────────────────────────┘
```

### **Data Isolation Strategy**
- **Company-based Filtering**: All queries include company ID for data segregation
- **Index Optimization**: Company-specific indexes for performance
- **Permission Validation**: Middleware ensures data access control
- **Audit Logging**: Track all data access and modifications

## 📊 **Database Collections**

### **1. Users Collection**
**Purpose**: Store superAdmin and system-level user accounts

```javascript
{
  _id: ObjectId,
  username: String,           // Unique username
  email: String,              // Unique email
  phone: String,              // Unique phone
  role: String,               // 'superAdmin' | 'admin'
  password: String,           // Hashed password
  isActive: Boolean,          // Account status
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{ email: 1 }` - Unique index
- `{ username: 1 }` - Unique index
- `{ phone: 1 }` - Unique index
- `{ role: 1 }` - Role-based queries
- `{ isActive: 1 }` - Active user filtering

### **2. Companies Collection**
**Purpose**: Store company information and configuration

```javascript
{
  _id: ObjectId,
  name: String,               // Company name
  description: String,         // Company description
  email: String,              // Company email
  phone: String,              // Company phone
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  industry: String,            // Business industry
  size: String,                // 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  website: String,             // Company website
  isActive: Boolean,           // Company status
  subscriptionPlan: String,    // 'free' | 'basic' | 'premium' | 'enterprise'
  subscriptionExpiry: Date,    // Subscription end date
  stats: {
    totalAdmins: Number,       // Total admin count
    totalUsers: Number,        // Total user count
    totalProjects: Number      // Total project count
  },
  createdBy: ObjectId,         // Reference to User
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{ email: 1 }` - Unique index
- `{ name: 1 }` - Company name search
- `{ isActive: 1 }` - Active company filtering
- `{ createdBy: 1 }` - Creator reference
- `{ industry: 1 }` - Industry-based queries

### **3. Admins Collection**
**Purpose**: Store company-level administrator accounts

```javascript
{
  _id: ObjectId,
  fullname: String,            // Full name
  username: String,            // Unique username
  email: String,               // Unique email
  phone: String,               // Unique phone
  company: ObjectId,           // Reference to Company
  role: String,                // 'superAdmin' | 'CompanyAdmin' | 'manager' | 'sales' | 'support'
  department: String,          // Department name
  adminArea: String,           // Administrative area
  password: String,            // Hashed password
  permissions: {
    canManageUsers: Boolean,   // User management permission
    canManageAdmins: Boolean,  // Admin management permission
    canManageCompany: Boolean, // Company management permission
    canViewReports: Boolean,   // Report viewing permission
    canManageProjects: Boolean, // Project management permission
    canManageBilling: Boolean  // Billing management permission
  },
  isActive: Boolean,           // Account status
  isEmailVerified: Boolean,    // Email verification status
  isPhoneVerified: Boolean,    // Phone verification status
  lastLogin: Date,             // Last login timestamp
  loginAttempts: Number,       // Failed login attempts
  lockUntil: Date,             // Account lock timestamp
  createdBy: ObjectId,         // Reference to Admin
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{ email: 1 }` - Unique index
- `{ username: 1 }` - Unique index
- `{ phone: 1 }` - Unique index
- `{ company: 1 }` - Company-based queries
- `{ role: 1 }` - Role-based filtering
- `{ isActive: 1 }` - Active admin filtering
- `{ createdBy: 1 }` - Creator reference
- `{ company: 1, role: 1 }` - Compound index for company-role queries

### **4. Clients Collection**
**Purpose**: Store client information and business details

```javascript
{
  _id: ObjectId,
  firstName: String,           // First name
  lastName: String,            // Last name
  email: String,               // Unique email
  phone: String,               // Phone number
  password: String,            // Hashed password
  company: ObjectId,           // Reference to Company
  companyName: String,         // Client's company name
  industry: String,            // Business industry
  businessType: String,        // 'Startup' | 'SME' | 'Enterprise' | 'Non-Profit' | 'Government' | 'Other'
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  website: String,             // Client website
  socialMedia: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String
  },
  isEmailVerified: Boolean,    // Email verification status
  isPhoneVerified: Boolean,    // Phone verification status
  isActive: Boolean,           // Account status
  status: String,              // 'active' | 'inactive' | 'suspended' | 'pending'
  lastLogin: Date,             // Last login timestamp
  loginAttempts: Number,       // Failed login attempts
  lockUntil: Date,             // Account lock timestamp
  totalProjects: Number,       // Total project count
  activeProjects: Number,      // Active project count
  completedProjects: Number,   // Completed project count
  totalRevenue: Number,        // Total revenue generated
  communicationPreferences: {
    email: Boolean,            // Email communication preference
    sms: Boolean,              // SMS communication preference
    phone: Boolean,            // Phone communication preference
    preferredTime: String      // Preferred communication time
  },
  timezone: String,            // Client timezone
  language: String,            // Preferred language
  createdBy: ObjectId,         // Reference to Admin
  assignedBy: ObjectId,        // Reference to Admin
  assignedAt: Date,            // Assignment timestamp
  notes: [{
    content: String,           // Note content
    createdBy: ObjectId,       // Reference to Admin
    createdAt: Date            // Note creation timestamp
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{ company: 1, status: 1 }` - Company and status filtering
- `{ email: 1 }` - Email-based queries
- `{ phone: 1 }` - Phone-based queries
- `{ status: 1, isActive: 1 }` - Status and active filtering
- `{ createdBy: 1 }` - Creator reference
- `{ assignedBy: 1 }` - Assigner reference

### **5. Projects Collection**
**Purpose**: Store project information and lifecycle management

```javascript
{
  _id: ObjectId,
  title: String,               // Project title
  description: String,         // Project description
  shortDescription: String,    // Brief project summary
  projectType: String,         // 'digital-marketing' | 'development'
  category: String,            // Project category
  digitalMarketing: {
    serviceType: String,       // SEO, PPC, Social Media, etc.
    platforms: [String],       // Google, Facebook, Instagram, etc.
    targetAudience: String,    // Target audience description
    campaignDuration: String,  // Campaign duration
    budget: {
      min: Number,             // Minimum budget
      max: Number,             // Maximum budget
      currency: String         // Currency (default: USD)
    }
  },
  development: {
    technology: {
      frontend: [String],      // Frontend technologies
      backend: [String],       // Backend technologies
      database: [String],      // Database technologies
      mobile: [String],        // Mobile technologies
      other: [String]          // Other technologies
    },
    platform: String,          // 'Web' | 'Mobile' | 'Desktop' | 'Hybrid' | 'Other'
    complexity: String,        // 'Simple' | 'Medium' | 'Complex' | 'Enterprise'
    estimatedHours: {
      min: Number,             // Minimum estimated hours
      max: Number              // Maximum estimated hours
    }
  },
  client: ObjectId,            // Reference to Client
  company: ObjectId,           // Reference to Company
  status: String,              // 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled' | 'archived'
  priority: String,            // 'low' | 'medium' | 'high' | 'urgent'
  progress: Number,            // Project progress (0-100)
  startDate: Date,             // Project start date
  endDate: Date,               // Project end date
  estimatedDuration: Number,   // Estimated duration in days
  actualDuration: Number,      // Actual duration in days
  phases: [{
    name: String,              // Phase name
    description: String,       // Phase description
    startDate: Date,           // Phase start date
    endDate: Date,             // Phase end date
    status: String,            // 'pending' | 'active' | 'completed' | 'on-hold'
    progress: Number,          // Phase progress (0-100)
    deliverables: [{
      name: String,            // Deliverable name
      description: String,     // Deliverable description
      status: String,          // 'pending' | 'in-progress' | 'completed' | 'review'
      dueDate: Date,           // Due date
      completedDate: Date,     // Completion date
      assignedTo: ObjectId     // Reference to Admin
    }],
    tasks: [{
      title: String,           // Task title
      description: String,     // Task description
      status: String,          // 'todo' | 'in-progress' | 'review' | 'completed'
      priority: String,        // 'low' | 'medium' | 'high'
      estimatedHours: Number,  // Estimated hours
      actualHours: Number,     // Actual hours
      assignedTo: ObjectId,    // Reference to Admin
      dueDate: Date,           // Due date
      completedDate: Date,     // Completion date
      dependencies: [ObjectId] // Reference to Task
    }],
    budget: {
      allocated: Number,       // Allocated budget
      spent: Number,           // Spent budget
      currency: String         // Currency (default: USD)
    }
  }],
  budget: {
    total: Number,             // Total budget
    allocated: Number,         // Allocated budget
    spent: Number,             // Spent budget
    remaining: Number,         // Remaining budget
    currency: String           // Currency (default: USD)
  },
  billing: {
    type: String,              // 'hourly' | 'fixed' | 'milestone' | 'retainer'
    rate: Number,              // Hourly rate
    paymentTerms: String,      // Payment terms
    invoices: [{
      invoiceNumber: String,   // Invoice number
      amount: Number,          // Invoice amount
      status: String,          // 'draft' | 'sent' | 'paid' | 'overdue'
      dueDate: Date,           // Due date
      paidDate: Date           // Payment date
    }]
  },
  projectManager: ObjectId,    // Reference to Admin
  team: [{
    member: ObjectId,          // Reference to Admin
    role: String,              // Team member role
    assignedDate: Date,        // Assignment date
    removedDate: Date,         // Removal date
    isActive: Boolean          // Active team member status
  }],
  externalResources: [{
    name: String,              // Resource name
    type: String,              // Resource type
    contact: String,           // Contact information
    cost: Number,              // Resource cost
    description: String        // Resource description
  }],
  communication: {
    channels: [String],        // Communication channels
    frequency: String,         // Communication frequency
    stakeholders: [{
      name: String,            // Stakeholder name
      role: String,            // Stakeholder role
      email: String,           // Stakeholder email
      phone: String            // Stakeholder phone
    }]
  },
  documents: [{
    name: String,              // Document name
    type: String,              // Document type
    url: String,               // Document URL
    uploadedBy: ObjectId,      // Reference to Admin
    uploadedAt: Date,          // Upload timestamp
    version: String            // Document version
  }],
  risks: [{
    description: String,       // Risk description
    probability: String,       // 'low' | 'medium' | 'high'
    impact: String,            // 'low' | 'medium' | 'high'
    mitigation: String,        // Mitigation strategy
    status: String,            // 'identified' | 'mitigated' | 'closed'
    assignedTo: ObjectId       // Reference to Admin
  }],
  issues: [{
    title: String,             // Issue title
    description: String,       // Issue description
    severity: String,          // 'low' | 'medium' | 'high' | 'critical'
    status: String,            // 'open' | 'in-progress' | 'resolved' | 'closed'
    reportedBy: ObjectId,      // Reference to Admin
    assignedTo: ObjectId,      // Reference to Admin
    reportedAt: Date,          // Report timestamp
    resolvedAt: Date,          // Resolution timestamp
    resolution: String         // Resolution description
  }],
  qualityMetrics: {
    codeCoverage: Number,      // Code coverage percentage
    testPassRate: Number,      // Test pass rate percentage
    bugDensity: Number,        // Bug density metric
    performanceScore: Number   // Performance score
  },
  testing: {
    unitTesting: Boolean,      // Unit testing status
    integrationTesting: Boolean, // Integration testing status
    userAcceptanceTesting: Boolean, // UAT status
    performanceTesting: Boolean, // Performance testing status
    securityTesting: Boolean   // Security testing status
  },
  deployment: {
    environment: String,       // 'development' | 'staging' | 'production'
    deploymentDate: Date,      // Deployment date
    version: String,           // Deployment version
    notes: String              // Deployment notes
  },
  maintenance: {
    type: String,              // 'none' | 'basic' | 'standard' | 'premium'
    startDate: Date,           // Maintenance start date
    endDate: Date,             // Maintenance end date
    monthlyCost: Number        // Monthly maintenance cost
  },
  metrics: {
    userEngagement: Number,    // User engagement metric
    conversionRate: Number,    // Conversion rate
    pageLoadTime: Number,      // Page load time
    bounceRate: Number,        // Bounce rate
    customMetrics: [{
      name: String,            // Custom metric name
      value: Number,            // Metric value
      unit: String             // Metric unit
    }]
  },
  tags: [String],              // Project tags
  notes: [{
    content: String,           // Note content
    createdBy: ObjectId,       // Reference to Admin
    createdAt: Date,           // Note creation timestamp
    isPrivate: Boolean         // Private note flag
  }],
  createdBy: ObjectId,         // Reference to Admin
  updatedBy: ObjectId,         // Reference to Admin
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{ client: 1, status: 1 }` - Client and status filtering
- `{ company: 1, status: 1 }` - Company and status filtering
- `{ projectType: 1, status: 1 }` - Project type and status filtering
- `{ status: 1, priority: 1 }` - Status and priority filtering
- `{ startDate: 1, endDate: 1 }` - Date range queries
- `{ projectManager: 1 }` - Project manager filtering
- `{ 'team.member': 1 }` - Team member queries
- `{ tags: 1 }` - Tag-based queries

### **6. Employees Collection**
**Purpose**: Store employee information and project assignments

```javascript
{
  _id: ObjectId,
  firstName: String,           // First name
  lastName: String,            // Last name
  email: String,               // Unique email
  phone: String,               // Phone number
  password: String,            // Hashed password
  company: ObjectId,           // Reference to Company
  department: String,          // 'development' | 'digital-marketing' | 'graphics-design' | 'hr' | 'accounting' | 'sales' | 'support' | 'management'
  role: String,                // 'junior' | 'senior' | 'lead' | 'manager' | 'director'
  designation: String,         // Job designation
  skills: [{
    name: String,              // Skill name
    level: String,             // 'beginner' | 'intermediate' | 'advanced' | 'expert'
    yearsOfExperience: Number  // Years of experience
  }],
  assignedProjects: [{
    project: ObjectId,         // Reference to Project
    role: String,              // Project role
    assignedDate: Date,        // Assignment date
    isActive: Boolean,         // Active assignment status
    responsibilities: [String] // Project responsibilities
  }],
  currentTasks: [{
    task: ObjectId,            // Reference to Task
    assignedDate: Date,        // Assignment date
    dueDate: Date,             // Due date
    priority: String,          // 'low' | 'medium' | 'high' | 'urgent'
    status: String             // 'pending' | 'in-progress' | 'review' | 'completed' | 'on-hold'
  }],
  workSchedule: {
    startTime: String,         // Work start time
    endTime: String,           // Work end time
    timezone: String,          // Work timezone
    workingDays: [String]      // Working days
  },
  performance: {
    completedTasks: Number,    // Completed task count
    totalProjects: Number,     // Total project count
    averageRating: Number,     // Average performance rating
    lastReviewDate: Date       // Last review date
  },
  isActive: Boolean,           // Account status
  isEmailVerified: Boolean,    // Email verification status
  isPhoneVerified: Boolean,    // Phone verification status
  lastLogin: Date,             // Last login timestamp
  loginAttempts: Number,       // Failed login attempts
  lockUntil: Date,             // Account lock timestamp
  dateOfBirth: Date,           // Date of birth
  gender: String,              // 'male' | 'female' | 'other' | 'prefer-not-to-say'
  address: {
    street: String,            // Street address
    city: String,              // City
    state: String,             // State
    country: String,           // Country
    zipCode: String            // ZIP code
  },
  emergencyContact: {
    name: String,              // Emergency contact name
    relationship: String,      // Relationship
    phone: String,             // Emergency contact phone
    email: String              // Emergency contact email
  },
  employeeId: String,          // Unique employee ID
  joiningDate: Date,           // Joining date
  contractType: String,        // 'full-time' | 'part-time' | 'contract' | 'intern'
  salary: {
    amount: Number,            // Salary amount
    currency: String,          // Currency (default: USD)
    frequency: String          // 'monthly' | 'weekly' | 'hourly'
  },
  permissions: {
    canCreateProjects: Boolean, // Project creation permission
    canAssignTasks: Boolean,    // Task assignment permission
    canViewAllProjects: Boolean, // All project viewing permission
    canManageTeam: Boolean,     // Team management permission
    canViewReports: Boolean,    // Report viewing permission
    canManageClients: Boolean   // Client management permission
  },
  createdBy: ObjectId,         // Reference to Admin
  updatedBy: ObjectId,         // Reference to Admin
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{ email: 1, company: 1 }` - Email and company filtering
- `{ company: 1, department: 1 }` - Company and department filtering
- `{ employeeId: 1, company: 1 }` - Employee ID and company filtering
- `{ 'assignedProjects.project': 1 }` - Project assignment queries
- `{ 'currentTasks.task': 1 }` - Task assignment queries

### **7. Tasks Collection**
**Purpose**: Store task information and execution tracking

```javascript
{
  _id: ObjectId,
  title: String,               // Task title
  description: String,         // Task description
  shortDescription: String,    // Brief task summary
  project: ObjectId,           // Reference to Project
  client: ObjectId,            // Reference to Client
  company: ObjectId,           // Reference to Company
  type: String,                // 'development' | 'design' | 'marketing' | 'content' | 'testing' | 'deployment' | 'maintenance' | 'research' | 'documentation' | 'other'
  category: String,            // Task category
  priority: String,            // 'low' | 'medium' | 'high' | 'urgent'
  complexity: String,          // 'simple' | 'moderate' | 'complex' | 'very-complex'
  assignedTo: ObjectId,        // Reference to Employee
  assignedBy: ObjectId,        // Reference to Admin
  assignedDate: Date,          // Assignment date
  teamMembers: [{
    employee: ObjectId,        // Reference to Employee
    role: String,              // Team member role
    assignedDate: Date,        // Assignment date
    isActive: Boolean          // Active member status
  }],
  startDate: Date,             // Start date
  dueDate: Date,               // Due date
  estimatedHours: Number,      // Estimated hours
  actualHours: Number,         // Actual hours
  status: String,              // 'pending' | 'in-progress' | 'review' | 'testing' | 'completed' | 'on-hold' | 'cancelled'
  progress: Number,            // Progress percentage (0-100)
  completionDate: Date,        // Completion date
  dependencies: [{
    task: ObjectId,            // Reference to Task
    type: String               // 'blocks' | 'blocked-by' | 'related-to'
  }],
  parentTask: ObjectId,        // Reference to Task (parent)
  subTasks: [ObjectId],        // References to Tasks (children)
  deliverables: [{
    name: String,              // Deliverable name
    description: String,       // Deliverable description
    fileType: String,          // File type
    isRequired: Boolean,       // Required flag
    isCompleted: Boolean,      // Completion status
    completedDate: Date        // Completion date
  }],
  requirements: [{
    description: String,       // Requirement description
    isRequired: Boolean,       // Required flag
    isMet: Boolean             // Requirement met status
  }],
  timeEntries: [{
    employee: ObjectId,        // Reference to Employee
    startTime: Date,           // Time entry start
    endTime: Date,             // Time entry end
    duration: Number,          // Duration in minutes
    description: String,       // Time entry description
    isBillable: Boolean        // Billable flag
  }],
  qualityScore: Number,        // Quality score (0-10)
  reviewComments: [{
    reviewer: ObjectId,        // Reference to Employee
    comment: String,           // Review comment
    rating: Number,            // Rating (1-5)
    reviewDate: Date           // Review date
  }],
  comments: [{
    author: ObjectId,          // Reference to Employee
    content: String,           // Comment content
    timestamp: Date,           // Comment timestamp
    isInternal: Boolean        // Internal comment flag
  }],
  updates: [{
    field: String,             // Updated field name
    oldValue: Mixed,           // Old value
    newValue: Mixed,           // New value
    updatedBy: ObjectId,       // Reference to Employee
    updateDate: Date           // Update timestamp
  }],
  budget: {
    allocated: Number,         // Allocated budget
    spent: Number,             // Spent budget
    currency: String           // Currency (default: USD)
  },
  tags: [String],              // Task tags
  labels: [String],            // Task labels
  createdBy: ObjectId,         // Reference to Admin
  updatedBy: ObjectId,         // Reference to Employee
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{ project: 1, status: 1 }` - Project and status filtering
- `{ assignedTo: 1, status: 1 }` - Assignee and status filtering
- `{ company: 1, dueDate: 1 }` - Company and due date filtering
- `{ priority: 1, dueDate: 1 }` - Priority and due date filtering
- `{ 'dependencies.task': 1 }` - Dependency queries
- `{ parentTask: 1 }` - Parent task queries

## 🔗 **Database Relationships**

### **Primary Relationships**
```
Users (Super Admins)
    ↓ creates
Companies
    ↓ has many
Admins, Clients, Projects, Employees
    ↓ manage
Tasks
```

### **Referential Integrity**
- **Company-based Isolation**: All entities reference a company for data segregation
- **User Management**: Admins and employees reference the company they belong to
- **Project Relationships**: Projects link clients, companies, and team members
- **Task Dependencies**: Tasks can have parent-child relationships and dependencies

### **Cascade Operations**
- **Company Deactivation**: Deactivates all associated admins, employees, and clients
- **Project Deletion**: Removes associated tasks and team assignments
- **Employee Deactivation**: Updates project and task assignments
- **Client Deactivation**: Affects project status and communications

## 📈 **Performance Optimization**

### **Indexing Strategy**
- **Compound Indexes**: Optimize multi-field queries
- **Covered Queries**: Include frequently accessed fields in indexes
- **Background Indexing**: Non-blocking index creation
- **Index Maintenance**: Regular index analysis and optimization

### **Query Optimization**
- **Aggregation Pipelines**: Efficient data processing
- **Projection**: Select only required fields
- **Pagination**: Limit result sets for large collections
- **Caching**: Implement Redis caching for frequently accessed data

### **Data Partitioning**
- **Company-based Sharding**: Distribute data across multiple servers
- **Time-based Partitioning**: Archive old data for performance
- **Read Replicas**: Distribute read operations across multiple nodes

## 🔒 **Data Security**

### **Access Control**
- **Company Isolation**: Data access restricted to company members
- **Role-based Permissions**: Granular access control based on user roles
- **Field-level Security**: Sensitive fields protected from unauthorized access
- **Audit Logging**: Track all data access and modifications

### **Data Encryption**
- **Password Hashing**: bcrypt with salt for secure storage
- **Field Encryption**: Sensitive data encrypted at rest
- **Transport Security**: HTTPS for data in transit
- **Token Security**: JWT tokens with expiration and blacklisting

## 📊 **Data Analytics**

### **Reporting Queries**
- **Performance Metrics**: Project completion rates and timelines
- **Resource Utilization**: Employee workload and efficiency
- **Financial Analysis**: Budget tracking and revenue analysis
- **Client Insights**: Client engagement and satisfaction metrics

### **Aggregation Examples**
```javascript
// Project completion statistics
db.projects.aggregate([
  { $match: { company: companyId } },
  { $group: { 
    _id: "$status", 
    count: { $sum: 1 },
    totalBudget: { $sum: "$budget.total" }
  }}
])

// Employee performance metrics
db.employees.aggregate([
  { $match: { company: companyId, isActive: true } },
  { $lookup: { from: "tasks", localField: "_id", foreignField: "assignedTo", as: "tasks" } },
  { $project: {
    name: { $concat: ["$firstName", " ", "$lastName"] },
    completedTasks: { $size: { $filter: { input: "$tasks", cond: { $eq: ["$$this.status", "completed"] } } } },
    totalTasks: { $size: "$tasks" }
  }}
])
```

## 🚀 **Scalability Considerations**

### **Horizontal Scaling**
- **Sharding Strategy**: Company-based sharding for multi-tenant data
- **Load Balancing**: Distribute read operations across replica sets
- **Connection Pooling**: Optimize database connections
- **Caching Layer**: Redis for frequently accessed data

### **Vertical Scaling**
- **Resource Optimization**: Monitor and optimize resource usage
- **Index Optimization**: Regular index analysis and maintenance
- **Query Optimization**: Analyze and optimize slow queries
- **Storage Optimization**: Implement data archiving and compression

---

**This database design provides a robust foundation for the CRM system with optimal performance, security, and scalability. The multi-tenant architecture ensures data isolation while maintaining efficient query performance through strategic indexing and optimization.**
