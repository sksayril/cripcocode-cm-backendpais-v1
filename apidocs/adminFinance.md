# Admin Finance API Documentation

## Overview
Complete Node.js Express API for managing financial entries in a CRM project. Admin and CompanyAdmin users can access these endpoints.

**Base URL:** `/api/admin/finance`

## Authentication
All endpoints require JWT token authentication for Admin, CompanyAdmin, or SuperAdmin users.

**Header:** `Authorization: Bearer <jwt_token>`

**Allowed Roles:**
- `admin` - Full access to all finance operations
- `companyAdmin` - Full access to all finance operations
- `superAdmin` - Full access to all finance operations

---

## 📊 **1. Get All Finance Entries**

### **Endpoint**
```
GET /api/admin/finance/entries
```

### **Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | No | Filter by type: "income" or "expense" |
| `startDate` | string | No | Start date filter (YYYY-MM-DD) |
| `endDate` | string | No | End date filter (YYYY-MM-DD) |
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 20, max: 100) |
| `category` | string | No | Filter by category |
| `status` | string | No | Filter by status: "pending", "approved", "rejected", "completed" |
| `search` | string | No | Search in description |

### **Example Request**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries?type=income&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Response**
```json
{
  "success": true,
  "message": "Finance entries retrieved successfully",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "data": {
    "entries": [
      {
        "_id": "65a1b2c3d4e5f6789012345a",
        "type": "income",
        "amount": 50000,
        "currency": "INR",
        "description": "Product Sales Revenue",
        "category": "Sales",
        "incomeSource": "Product Sales",
        "expenseType": null,
        "paymentMethod": "bank_transfer",
        "paymentReference": "TXN123456",
        "date": "2024-01-15T10:30:00.000Z",
        "status": "approved",
        "addedBy": {
          "_id": "65a1b2c3d4e5f6789012345b",
          "username": "admin_user",
          "email": "admin@example.com"
        },
        "approvedBy": {
          "_id": "65a1b2c3d4e5f6789012345c",
          "username": "super_admin",
          "email": "superadmin@example.com"
        },
        "approvedAt": "2024-01-15T11:00:00.000Z",
        "rejectionReason": null,
        "tags": ["sales", "revenue"],
        "notes": "Monthly product sales",
        "attachments": [],
        "company": "65a1b2c3d4e5f6789012345d",
        "isDeleted": false,
        "deletedAt": null,
        "deletedBy": null,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T11:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalEntries": 95,
      "hasNextPage": true,
      "hasPrevPage": false,
      "nextPage": 2,
      "prevPage": null,
      "limit": 10
    },
    "summary": {
      "totalIncome": 2500000,
      "totalExpense": 1500000,
      "netProfit": 1000000,
      "incomeEntries": 60,
      "expenseEntries": 35,
      "totalEntries": 95
    }
  }
}
```

---

## 🔍 **2. Get Finance Entry by ID**

### **Endpoint**
```
GET /api/admin/finance/entries/:id
```

### **Path Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the entry |

### **Example Request**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries/65a1b2c3d4e5f6789012345a" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Response**
```json
{
  "success": true,
  "message": "Finance entry retrieved successfully",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "data": {
    "entry": {
      "_id": "65a1b2c3d4e5f6789012345a",
      "type": "income",
      "amount": 50000,
      "currency": "INR",
      "description": "Product Sales Revenue",
      "category": "Sales",
      "incomeSource": "Product Sales",
      "expenseType": null,
      "paymentMethod": "bank_transfer",
      "paymentReference": "TXN123456",
      "date": "2024-01-15T10:30:00.000Z",
      "status": "approved",
      "addedBy": {
        "_id": "65a1b2c3d4e5f6789012345b",
        "username": "admin_user",
        "email": "admin@example.com"
      },
      "approvedBy": {
        "_id": "65a1b2c3d4e5f6789012345c",
        "username": "super_admin",
        "email": "superadmin@example.com"
      },
      "approvedAt": "2024-01-15T11:00:00.000Z",
      "rejectionReason": null,
      "tags": ["sales", "revenue"],
      "notes": "Monthly product sales",
      "attachments": [],
      "company": "65a1b2c3d4e5f6789012345d",
      "isDeleted": false,
      "deletedAt": null,
      "deletedBy": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

---

## ➕ **3. Create Finance Entry**

### **Endpoint**
```
POST /api/admin/finance/entries
```

### **Request Body**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | "income" or "expense" |
| `amount` | number | Yes | Amount > 0 |
| `currency` | string | No | "INR", "USD", "EUR", "GBP" (default: "INR") |
| `description` | string | Yes | Description (max 500 chars) |
| `category` | string | Yes | Category (max 100 chars) |
| `incomeSource` | string | No | Income source (max 200 chars) |
| `expenseType` | string | No | "operational", "marketing", "infrastructure", "personnel", "other" |
| `paymentMethod` | string | No | "cash", "bank_transfer", "card", "upi", "cheque", "other" |
| `paymentReference` | string | No | Payment reference (max 100 chars) |
| `date` | string | No | ISO 8601 date (default: current date) |
| `tags` | array | No | Array of strings |
| `notes` | string | No | Notes (max 1000 chars) |
| `attachments` | array | No | Array of attachment objects |

### **Example Request**
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "income",
    "amount": 75000,
    "currency": "INR",
    "description": "Consulting Services Revenue",
    "category": "Services",
    "incomeSource": "Consulting",
    "paymentMethod": "bank_transfer",
    "paymentReference": "TXN789012",
    "date": "2024-01-20T09:00:00.000Z",
    "tags": ["consulting", "services"],
    "notes": "Monthly consulting services"
  }'
```

### **Response**
```json
{
  "success": true,
  "message": "Finance entry created successfully",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "data": {
    "entry": {
      "_id": "65a1b2c3d4e5f6789012345e",
      "type": "income",
      "amount": 75000,
      "currency": "INR",
      "description": "Consulting Services Revenue",
      "category": "Services",
      "incomeSource": "Consulting",
      "expenseType": null,
      "paymentMethod": "bank_transfer",
      "paymentReference": "TXN789012",
      "date": "2024-01-20T09:00:00.000Z",
      "status": "pending",
      "addedBy": {
        "_id": "65a1b2c3d4e5f6789012345b",
        "username": "admin_user",
        "email": "admin@example.com"
      },
      "approvedBy": null,
      "approvedAt": null,
      "rejectionReason": null,
      "tags": ["consulting", "services"],
      "notes": "Monthly consulting services",
      "attachments": [],
      "company": "65a1b2c3d4e5f6789012345d",
      "isDeleted": false,
      "deletedAt": null,
      "deletedBy": null,
      "createdAt": "2024-01-20T10:30:00.000Z",
      "updatedAt": "2024-01-20T10:30:00.000Z"
    }
  }
}
```

---

## ✏️ **4. Update Finance Entry**

### **Endpoint**
```
PUT /api/admin/finance/entries/:id
```

### **Path Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the entry |

### **Request Body**
Same as Create Entry, but all fields are optional.

### **Example Request**
```bash
curl -X PUT "http://localhost:3500/api/admin/finance/entries/65a1b2c3d4e5f6789012345e" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 80000,
    "description": "Updated Consulting Services Revenue",
    "notes": "Updated monthly consulting services"
  }'
```

### **Response**
```json
{
  "success": true,
  "message": "Finance entry updated successfully",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "data": {
    "entry": {
      "_id": "65a1b2c3d4e5f6789012345e",
      "type": "income",
      "amount": 80000,
      "currency": "INR",
      "description": "Updated Consulting Services Revenue",
      "category": "Services",
      "incomeSource": "Consulting",
      "expenseType": null,
      "paymentMethod": "bank_transfer",
      "paymentReference": "TXN789012",
      "date": "2024-01-20T09:00:00.000Z",
      "status": "pending",
      "addedBy": {
        "_id": "65a1b2c3d4e5f6789012345b",
        "username": "admin_user",
        "email": "admin@example.com"
      },
      "approvedBy": null,
      "approvedAt": null,
      "rejectionReason": null,
      "tags": ["consulting", "services"],
      "notes": "Updated monthly consulting services",
      "attachments": [],
      "company": "65a1b2c3d4e5f6789012345d",
      "isDeleted": false,
      "deletedAt": null,
      "deletedBy": null,
      "createdAt": "2024-01-20T10:30:00.000Z",
      "updatedAt": "2024-01-20T10:30:00.000Z"
    }
  }
}
```

---

## 🗑️ **5. Delete Finance Entry**

### **Endpoint**
```
DELETE /api/admin/finance/entries/:id
```

### **Path Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the entry |

### **Example Request**
```bash
curl -X DELETE "http://localhost:3500/api/admin/finance/entries/65a1b2c3d4e5f6789012345e" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Response**
```json
{
  "success": true,
  "message": "Finance entry deleted successfully",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "data": {
    "deletedEntry": {
      "_id": "65a1b2c3d4e5f6789012345e",
      "type": "income",
      "amount": 80000,
      "description": "Updated Consulting Services Revenue",
      "deletedAt": "2024-01-20T10:30:00.000Z",
      "deletedBy": {
        "_id": "65a1b2c3d4e5f6789012345b",
        "username": "admin_user",
        "email": "admin@example.com"
      }
    }
  }
}
```

---

## 📊 **6. Get Finance Statistics**

### **Endpoint**
```
GET /api/admin/finance/statistics
```

### **Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string | No | Start date filter (YYYY-MM-DD) |
| `endDate` | string | No | End date filter (YYYY-MM-DD) |
| `type` | string | No | Filter by type: "income" or "expense" |

### **Example Request**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/statistics?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Response**
```json
{
  "success": true,
  "message": "Finance statistics retrieved successfully",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "data": {
    "summary": {
      "totalIncome": 2500000,
      "totalExpense": 1500000,
      "totalEntries": 95,
      "incomeEntries": 60,
      "expenseEntries": 35,
      "netProfit": 1000000
    },
    "monthlyBreakdown": [
      {
        "_id": {
          "year": 2024,
          "month": 12,
          "type": "income"
        },
        "amount": 250000,
        "count": 15
      },
      {
        "_id": {
          "year": 2024,
          "month": 12,
          "type": "expense"
        },
        "amount": 150000,
        "count": 10
      }
    ],
    "categoryBreakdown": [
      {
        "_id": {
          "category": "Sales",
          "type": "income"
        },
        "amount": 2000000,
        "count": 50
      },
      {
        "_id": {
          "category": "Marketing",
          "type": "expense"
        },
        "amount": 500000,
        "count": 20
      }
    ]
  }
}
```

---

## ❌ **Error Responses**

### **401 Unauthorized**
```json
{
  "success": false,
  "message": "Access denied. No token provided"
}
```

### **403 Forbidden**
```json
{
  "success": false,
  "message": "Access denied. Admin or CompanyAdmin role required"
}
```

### **400 Bad Request**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "amount",
      "message": "Amount must be greater than 0"
    }
  ]
}
```

### **404 Not Found**
```json
{
  "success": false,
  "message": "Finance entry not found"
}
```

### **500 Internal Server Error**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 🔧 **Technical Details**

### **Database Schema**
- **Collection:** `financeentries`
- **Soft Delete:** Implemented with `isDeleted`, `deletedAt`, `deletedBy` fields
- **Indexes:** Optimized for queries by type, date, category, status

### **Validation Rules**
- **Amount:** Must be > 0
- **Type:** Must be "income" or "expense"
- **Currency:** Must be one of: INR, USD, EUR, GBP
- **Description:** 1-500 characters
- **Category:** 1-100 characters
- **Date:** Valid ISO 8601 format

### **Pagination**
- **Default:** 20 items per page
- **Maximum:** 100 items per page
- **Sorting:** By date descending

### **Security**
- JWT token authentication required
- Admin, CompanyAdmin, or SuperAdmin role validation
- Input sanitization and validation
- SQL injection protection via Mongoose

---

## 🚀 **Quick Start Examples**

### **1. Get All Income Entries**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries?type=income" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **2. Create Expense Entry**
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "expense",
    "amount": 25000,
    "description": "Office Rent",
    "category": "Operations",
    "expenseType": "operational",
    "paymentMethod": "bank_transfer"
  }'
```

### **3. Get Statistics for Current Month**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/statistics?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📝 **Notes**

- All timestamps are in ISO 8601 format
- All amounts are stored as numbers (not strings)
- Soft delete preserves data integrity
- Pagination includes metadata for frontend implementation
- Statistics are calculated in real-time
- Admin users can access all finance operations
- CompanyAdmin users can access all finance operations
- SuperAdmin users also have access to these endpoints
