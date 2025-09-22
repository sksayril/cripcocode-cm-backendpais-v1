# Finance API Documentation

## Overview
The Finance API provides comprehensive financial management capabilities for the CRM system, allowing SuperAdmins to track income and expense entries with advanced filtering, pagination, and analytics.

## Base URL
```
http://localhost:3500/api/admin/finance
```

## Authentication
All endpoints require SuperAdmin authentication using JWT tokens.

**Header:**
```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Get Finance Entries
**GET** `/entries`

Retrieve all finance entries with filtering and pagination.

#### Query Parameters
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

#### Example Request
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries?type=income&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Response Format
```json
{
  "success": true,
  "message": "Finance entries retrieved successfully",
  "data": {
    "entries": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "type": "income",
        "amount": 50000,
        "currency": "INR",
        "description": "Product Sales Revenue",
        "category": "Sales",
        "incomeSource": "Product Sales",
        "paymentMethod": "bank_transfer",
        "paymentReference": "TXN123456789",
        "date": "2024-01-15T10:30:00.000Z",
        "status": "approved",
        "addedBy": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
          "username": "superadmin",
          "email": "admin@example.com",
          "fullname": "Super Admin"
        },
        "approvedBy": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
          "username": "superadmin",
          "email": "admin@example.com",
          "fullname": "Super Admin"
        },
        "approvedAt": "2024-01-15T10:30:00.000Z",
        "tags": ["sales", "revenue"],
        "notes": "Monthly product sales",
        "attachments": [],
        "company": null,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalEntries": 95,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 20
    },
    "summary": {
      "totalIncome": 2500000,
      "totalExpense": 1500000,
      "totalEntries": 95,
      "incomeEntries": 60,
      "expenseEntries": 35,
      "netProfit": 1000000
    },
    "filters": {
      "type": "income",
      "startDate": null,
      "endDate": null,
      "category": null,
      "status": "all",
      "search": null
    }
  }
}
```

---

### 2. Get Finance Entry by ID
**GET** `/entries/:id`

Retrieve a specific finance entry by its ID.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the entry |

#### Example Request
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries/64f8a1b2c3d4e5f6a7b8c9d0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Response Format
```json
{
  "success": true,
  "message": "Finance entry retrieved successfully",
  "data": {
    "entry": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "type": "income",
      "amount": 50000,
      "currency": "INR",
      "description": "Product Sales Revenue",
      "category": "Sales",
      "incomeSource": "Product Sales",
      "paymentMethod": "bank_transfer",
      "paymentReference": "TXN123456789",
      "date": "2024-01-15T10:30:00.000Z",
      "status": "approved",
      "addedBy": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "username": "superadmin",
        "email": "admin@example.com",
        "fullname": "Super Admin"
      },
      "approvedBy": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "username": "superadmin",
        "email": "admin@example.com",
        "fullname": "Super Admin"
      },
      "approvedAt": "2024-01-15T10:30:00.000Z",
      "tags": ["sales", "revenue"],
      "notes": "Monthly product sales",
      "attachments": [],
      "company": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

### 3. Create Finance Entry
**POST** `/entries`

Create a new finance entry.

#### Request Body
```json
{
  "type": "income",
  "amount": 50000,
  "currency": "INR",
  "description": "Product Sales Revenue",
  "category": "Sales",
  "incomeSource": "Product Sales",
  "paymentMethod": "bank_transfer",
  "paymentReference": "TXN123456789",
  "date": "2024-01-15T10:30:00.000Z",
  "tags": ["sales", "revenue"],
  "notes": "Monthly product sales",
  "attachments": []
}
```

#### Field Descriptions
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Entry type: "income" or "expense" |
| `amount` | number | Yes | Amount (must be > 0) |
| `currency` | string | No | Currency code (default: "INR") |
| `description` | string | Yes | Entry description (max: 500 chars) |
| `category` | string | Yes | Entry category (max: 100 chars) |
| `incomeSource` | string | No | Income source (for income entries) |
| `expenseType` | string | No | Expense type: "operational", "marketing", "infrastructure", "personnel", "other" |
| `paymentMethod` | string | No | Payment method: "cash", "bank_transfer", "card", "upi", "cheque", "other" |
| `paymentReference` | string | No | Payment reference (max: 100 chars) |
| `date` | string | No | Entry date (ISO 8601 format) |
| `tags` | array | No | Array of tags |
| `notes` | string | No | Additional notes (max: 1000 chars) |
| `attachments` | array | No | Array of attachment objects |

#### Example Request
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "income",
    "amount": 50000,
    "description": "Product Sales Revenue",
    "category": "Sales",
    "incomeSource": "Product Sales"
  }'
```

#### Response Format
```json
{
  "success": true,
  "message": "Finance entry created successfully",
  "data": {
    "entry": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "type": "income",
      "amount": 50000,
      "currency": "INR",
      "description": "Product Sales Revenue",
      "category": "Sales",
      "incomeSource": "Product Sales",
      "paymentMethod": "bank_transfer",
      "paymentReference": "",
      "date": "2024-01-15T10:30:00.000Z",
      "status": "approved",
      "addedBy": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "username": "superadmin",
        "email": "admin@example.com",
        "fullname": "Super Admin"
      },
      "approvedBy": null,
      "approvedAt": null,
      "tags": [],
      "notes": "",
      "attachments": [],
      "company": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

### 4. Update Finance Entry
**PUT** `/entries/:id`

Update an existing finance entry.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the entry |

#### Request Body
Same as create entry, but all fields are optional.

#### Example Request
```bash
curl -X PUT "http://localhost:3500/api/admin/finance/entries/64f8a1b2c3d4e5f6a7b8c9d0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 55000,
    "description": "Updated Product Sales Revenue"
  }'
```

#### Response Format
```json
{
  "success": true,
  "message": "Finance entry updated successfully",
  "data": {
    "entry": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "type": "income",
      "amount": 55000,
      "currency": "INR",
      "description": "Updated Product Sales Revenue",
      "category": "Sales",
      "incomeSource": "Product Sales",
      "paymentMethod": "bank_transfer",
      "paymentReference": "",
      "date": "2024-01-15T10:30:00.000Z",
      "status": "approved",
      "addedBy": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "username": "superadmin",
        "email": "admin@example.com",
        "fullname": "Super Admin"
      },
      "approvedBy": null,
      "approvedAt": null,
      "tags": [],
      "notes": "",
      "attachments": [],
      "company": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

### 5. Delete Finance Entry
**DELETE** `/entries/:id`

Soft delete a finance entry.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the entry |

#### Example Request
```bash
curl -X DELETE "http://localhost:3500/api/admin/finance/entries/64f8a1b2c3d4e5f6a7b8c9d0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Response Format
```json
{
  "success": true,
  "message": "Finance entry deleted successfully",
  "data": null
}
```

---

### 6. Get Finance Statistics
**GET** `/statistics`

Get comprehensive finance statistics and analytics.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string | No | Start date filter (YYYY-MM-DD) |
| `endDate` | string | No | End date filter (YYYY-MM-DD) |
| `type` | string | No | Filter by type: "income" or "expense" |

#### Example Request
```bash
curl -X GET "http://localhost:3500/api/admin/finance/statistics?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Response Format
```json
{
  "success": true,
  "message": "Finance statistics retrieved successfully",
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

## Error Responses

### 400 Bad Request
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

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. SuperAdmin role required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Finance entry not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to fetch finance entries"
}
```

---

## Usage Examples

### 1. Get All Income Entries for January 2024
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries?type=income&startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Search for Entries Containing "Sales"
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries?search=sales" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Get Pending Entries
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries?status=pending" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Get Entries by Category
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries?category=Marketing" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Notes

1. **Authentication**: All endpoints require SuperAdmin authentication
2. **Pagination**: Default page size is 20, maximum is 100
3. **Sorting**: Entries are sorted by date in descending order
4. **Soft Delete**: Deleted entries are marked as deleted but not removed from database
5. **Validation**: All input data is validated using express-validator
6. **Error Handling**: Comprehensive error handling with detailed error messages
7. **Summary Statistics**: Each getEntries response includes summary statistics
8. **Date Filtering**: Date filters are inclusive of the entire day
