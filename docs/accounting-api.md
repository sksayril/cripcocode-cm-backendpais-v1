# 📊 Accounting System API Documentation

## Overview

The Accounting System API provides comprehensive financial management capabilities for the CRM project. It includes income/expense management, ledger account management, transaction processing, and financial reporting.

## 🔐 Authentication

All endpoints require JWT authentication with `Admin` or `CompanyAdmin` roles.

```http
Authorization: Bearer <your_jwt_token>
```

## 📋 Base URL

```
/api/admin/accounting
```

## 🏗️ Models

### IncomeExpense Model
```javascript
{
  type: "income" | "expense",
  date: Date,
  amount: Number,
  category: String,
  subcategory: String,
  description: String,
  account: ObjectId (ref: Ledger),
  reference: String,
  paymentMethod: "cash" | "bank_transfer" | "credit_card" | "check" | "other",
  status: "pending" | "approved" | "rejected" | "cancelled",
  attachments: Array,
  tags: Array,
  company: ObjectId (ref: Company),
  createdBy: ObjectId (ref: Admin),
  isRecurring: Boolean,
  recurringPattern: "daily" | "weekly" | "monthly" | "quarterly" | "yearly",
  recurringEndDate: Date
}
```

### Ledger Model
```javascript
{
  name: String,
  code: String,
  type: "asset" | "liability" | "equity" | "revenue" | "expense",
  subType: String,
  openingBalance: Number,
  currentBalance: Number,
  currency: String,
  description: String,
  parentAccount: ObjectId (ref: Ledger),
  isActive: Boolean,
  isSystemAccount: Boolean,
  company: ObjectId (ref: Company),
  createdBy: ObjectId (ref: Admin)
}
```

### Transaction Model
```javascript
{
  fromAccount: ObjectId (ref: Ledger),
  toAccount: ObjectId (ref: Ledger),
  amount: Number,
  date: Date,
  description: String,
  reference: String,
  transactionType: "transfer" | "payment" | "receipt" | "adjustment" | "opening_balance",
  status: "pending" | "completed" | "cancelled" | "reversed",
  currency: String,
  exchangeRate: Number,
  attachments: Array,
  tags: Array,
  company: ObjectId (ref: Company),
  createdBy: ObjectId (ref: Admin)
}
```

## 💰 Income & Expense Management

### Add Income
```http
POST /api/admin/accounting/income
```

**Request Body:**
```json
{
  "date": "2024-01-15T10:30:00.000Z",
  "amount": 1500.00,
  "category": "Service Revenue",
  "subcategory": "Web Development",
  "description": "Payment for website development project",
  "account": "64a1b2c3d4e5f6789012345",
  "reference": "INV-001",
  "paymentMethod": "bank_transfer",
  "tags": ["web-development", "client-payment"],
  "isRecurring": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Income added successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6789012346",
    "type": "income",
    "date": "2024-01-15T10:30:00.000Z",
    "amount": 1500.00,
    "category": "Service Revenue",
    "description": "Payment for website development project",
    "account": {
      "_id": "64a1b2c3d4e5f6789012345",
      "name": "Service Revenue Account",
      "code": "SERV-REV",
      "type": "revenue"
    },
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Add Expense
```http
POST /api/admin/accounting/expense
```

**Request Body:**
```json
{
  "date": "2024-01-15T10:30:00.000Z",
  "amount": 250.00,
  "category": "Office Supplies",
  "subcategory": "Stationery",
  "description": "Purchase of office stationery",
  "account": "64a1b2c3d4e5f6789012347",
  "reference": "EXP-001",
  "paymentMethod": "credit_card",
  "tags": ["office", "supplies"]
}
```

### Get All Entries
```http
GET /api/admin/accounting/entries?type=income&from=2024-01-01&to=2024-01-31&page=1&limit=10
```

**Query Parameters:**
- `type`: "income" | "expense" (optional)
- `category`: String (optional, partial match)
- `status`: "pending" | "approved" | "rejected" | "cancelled" (optional)
- `from`: ISO 8601 date (optional)
- `to`: ISO 8601 date (optional)
- `page`: Number (default: 1)
- `limit`: Number (default: 10, max: 100)
- `sortBy`: "date" | "amount" | "category" | "createdAt" (default: "date")
- `sortOrder`: "asc" | "desc" (default: "desc")

**Response:**
```json
{
  "success": true,
  "message": "Entries retrieved successfully",
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012346",
      "type": "income",
      "date": "2024-01-15T10:30:00.000Z",
      "amount": 1500.00,
      "category": "Service Revenue",
      "description": "Payment for website development project",
      "account": {
        "_id": "64a1b2c3d4e5f6789012345",
        "name": "Service Revenue Account",
        "code": "SERV-REV",
        "type": "revenue"
      },
      "status": "approved",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalEntries": 50,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 10
  }
}
```

### Get Entry by ID
```http
GET /api/admin/accounting/entries/:id
```

### Update Entry
```http
PUT /api/admin/accounting/entries/:id
```

### Delete Entry
```http
DELETE /api/admin/accounting/entries/:id
```

### Approve Entry
```http
POST /api/admin/accounting/entries/:id/approve
```

### Reject Entry
```http
POST /api/admin/accounting/entries/:id/reject
```

**Request Body:**
```json
{
  "reason": "Insufficient documentation provided"
}
```

## 📚 Ledger Account Management

### Create Ledger Account
```http
POST /api/admin/accounting/ledger
```

**Request Body:**
```json
{
  "name": "Service Revenue Account",
  "code": "SERV-REV",
  "type": "revenue",
  "subType": "Service Income",
  "openingBalance": 0,
  "currency": "USD",
  "description": "Account for tracking service revenue",
  "parentAccount": "64a1b2c3d4e5f6789012348"
}
```

### Get All Ledger Accounts
```http
GET /api/admin/accounting/ledger?type=revenue&isActive=true&page=1&limit=10
```

**Query Parameters:**
- `type`: "asset" | "liability" | "equity" | "revenue" | "expense" (optional)
- `isActive`: Boolean (optional)
- `page`: Number (default: 1)
- `limit`: Number (default: 10, max: 100)
- `sortBy`: "code" | "name" | "type" | "currentBalance" | "createdAt" (default: "code")
- `sortOrder`: "asc" | "desc" (default: "asc")

### Get Ledger Account by ID
```http
GET /api/admin/accounting/ledger/:id
```

### Update Ledger Account
```http
PUT /api/admin/accounting/ledger/:id
```

### Delete Ledger Account
```http
DELETE /api/admin/accounting/ledger/:id
```

## 💸 Transaction Management

### Create Transaction
```http
POST /api/admin/accounting/transaction
```

**Request Body:**
```json
{
  "fromAccount": "64a1b2c3d4e5f6789012349",
  "toAccount": "64a1b2c3d4e5f6789012350",
  "amount": 1000.00,
  "description": "Transfer from checking to savings",
  "date": "2024-01-15T10:30:00.000Z",
  "reference": "TXN-001",
  "transactionType": "transfer",
  "currency": "USD",
  "exchangeRate": 1.0,
  "tags": ["internal-transfer"]
}
```

### Get All Transactions
```http
GET /api/admin/accounting/transaction?fromAccount=64a1b2c3d4e5f6789012349&status=completed&page=1&limit=10
```

**Query Parameters:**
- `fromAccount`: ObjectId (optional)
- `toAccount`: ObjectId (optional)
- `status`: "pending" | "completed" | "cancelled" | "reversed" (optional)
- `transactionType`: "transfer" | "payment" | "receipt" | "adjustment" | "opening_balance" (optional)
- `from`: ISO 8601 date (optional)
- `to`: ISO 8601 date (optional)
- `page`: Number (default: 1)
- `limit`: Number (default: 10, max: 100)
- `sortBy`: "date" | "amount" | "createdAt" (default: "date")
- `sortOrder`: "asc" | "desc" (default: "desc")

### Get Transaction by ID
```http
GET /api/admin/accounting/transaction/:id
```

### Update Transaction
```http
PUT /api/admin/accounting/transaction/:id
```

### Delete Transaction
```http
DELETE /api/admin/accounting/transaction/:id
```

### Reverse Transaction
```http
POST /api/admin/accounting/transaction/:id/reverse
```

**Request Body:**
```json
{
  "reason": "Incorrect amount entered"
}
```

## 📊 Financial Reports

### Profit & Loss Report
```http
GET /api/admin/accounting/report/profit-loss?from=2024-01-01&to=2024-01-31
```

**Response:**
```json
{
  "success": true,
  "message": "Profit & Loss report generated successfully",
  "data": {
    "period": {
      "from": "2024-01-01T00:00:00.000Z",
      "to": "2024-01-31T23:59:59.999Z"
    },
    "summary": {
      "totalRevenue": 15000.00,
      "totalExpenses": 8500.00,
      "netProfit": 6500.00,
      "profitMargin": 43.33
    },
    "revenue": {
      "total": 15000.00,
      "byCategory": [
        {
          "_id": "Service Revenue",
          "total": 12000.00,
          "count": 8
        },
        {
          "_id": "Product Sales",
          "total": 3000.00,
          "count": 5
        }
      ]
    },
    "expenses": {
      "total": 8500.00,
      "byCategory": [
        {
          "_id": "Office Rent",
          "total": 2000.00,
          "count": 1
        },
        {
          "_id": "Salaries",
          "total": 5000.00,
          "count": 1
        },
        {
          "_id": "Office Supplies",
          "total": 1500.00,
          "count": 3
        }
      ]
    }
  }
}
```

### Balance Sheet Report
```http
GET /api/admin/accounting/report/balance-sheet?asOf=2024-01-31
```

**Response:**
```json
{
  "success": true,
  "message": "Balance Sheet report generated successfully",
  "data": {
    "asOf": "2024-01-31T23:59:59.999Z",
    "summary": {
      "totalAssets": 25000.00,
      "totalLiabilities": 5000.00,
      "totalEquity": 20000.00,
      "netWorth": 20000.00
    },
    "assets": {
      "total": 25000.00,
      "accounts": [
        {
          "_id": "64a1b2c3d4e5f6789012351",
          "name": "Cash Account",
          "code": "CASH-001",
          "type": "asset",
          "currentBalance": 15000.00
        },
        {
          "_id": "64a1b2c3d4e5f6789012352",
          "name": "Equipment",
          "code": "EQUIP-001",
          "type": "asset",
          "currentBalance": 10000.00
        }
      ]
    },
    "liabilities": {
      "total": 5000.00,
      "accounts": [
        {
          "_id": "64a1b2c3d4e5f6789012353",
          "name": "Accounts Payable",
          "code": "AP-001",
          "type": "liability",
          "currentBalance": 5000.00
        }
      ]
    },
    "equity": {
      "total": 20000.00,
      "accounts": [
        {
          "_id": "64a1b2c3d4e5f6789012354",
          "name": "Owner's Equity",
          "code": "OE-001",
          "type": "equity",
          "currentBalance": 20000.00
        }
      ]
    }
  }
}
```

### Cash Flow Report
```http
GET /api/admin/accounting/report/cash-flow?from=2024-01-01&to=2024-01-31
```

**Response:**
```json
{
  "success": true,
  "message": "Cash Flow report generated successfully",
  "data": {
    "period": {
      "from": "2024-01-01T00:00:00.000Z",
      "to": "2024-01-31T23:59:59.999Z"
    },
    "summary": {
      "openingBalance": 10000.00,
      "totalInflows": 15000.00,
      "totalOutflows": 8500.00,
      "netCashFlow": 6500.00,
      "closingBalance": 16500.00
    },
    "inflows": {
      "total": 15000.00,
      "byCategory": [
        {
          "_id": "Service Revenue",
          "total": 12000.00
        },
        {
          "_id": "Product Sales",
          "total": 3000.00
        }
      ]
    },
    "outflows": {
      "total": 8500.00,
      "byCategory": [
        {
          "_id": "Office Rent",
          "total": 2000.00
        },
        {
          "_id": "Salaries",
          "total": 5000.00
        },
        {
          "_id": "Office Supplies",
          "total": 1500.00
        }
      ]
    }
  }
}
```

### Trial Balance Report
```http
GET /api/admin/accounting/report/trial-balance?asOf=2024-01-31
```

### Account Statement
```http
GET /api/admin/accounting/report/account-statement/:accountId?from=2024-01-01&to=2024-01-31&page=1&limit=10
```

### Financial Summary Dashboard
```http
GET /api/admin/accounting/report/summary?period=30
```

**Query Parameters:**
- `period`: Number (days, default: 30, max: 365)

## 🔍 Error Responses

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "amount",
      "message": "Amount must be greater than 0",
      "value": -100
    }
  ]
}
```

### Not Found Error
```json
{
  "success": false,
  "message": "Entry not found",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Unauthorized Error
```json
{
  "success": false,
  "message": "Access denied. Admin role required.",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 📝 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (Validation Error)
- `401` - Unauthorized
- `403` - Forbidden (Insufficient Permissions)
- `404` - Not Found
- `409` - Conflict (Duplicate Entry)
- `500` - Internal Server Error

## 🔧 Rate Limiting

- **Rate Limit**: 100 requests per 15 minutes per IP
- **Headers**: Standard rate limiting headers included in responses

## 📋 Pagination

All list endpoints support pagination with the following parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Response includes pagination metadata:
```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 10
  }
}
```

## 🏷️ Filtering & Sorting

Most endpoints support filtering and sorting:

### Filtering
- Use query parameters to filter results
- Date ranges: `from` and `to` parameters
- Status filters: `status`, `type`, etc.
- Text search: `category`, `description`, etc.

### Sorting
- `sortBy`: Field to sort by
- `sortOrder`: "asc" or "desc"
- Default sorting varies by endpoint

## 🔐 Security Features

- **JWT Authentication**: All endpoints require valid JWT token
- **Role-based Access**: Only Admin and CompanyAdmin roles allowed
- **Company Isolation**: Users can only access their company's data
- **Input Validation**: Comprehensive validation on all inputs
- **SQL Injection Prevention**: Mongoose ODM provides protection
- **Rate Limiting**: Prevents API abuse

## 📚 Usage Examples

### Complete Workflow Example

1. **Create Ledger Accounts**
```bash
# Create revenue account
curl -X POST http://localhost:5000/api/admin/accounting/ledger \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Service Revenue",
    "code": "SERV-REV",
    "type": "revenue",
    "openingBalance": 0
  }'

# Create expense account
curl -X POST http://localhost:5000/api/admin/accounting/ledger \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Office Expenses",
    "code": "OFF-EXP",
    "type": "expense",
    "openingBalance": 0
  }'
```

2. **Add Income Entry**
```bash
curl -X POST http://localhost:5000/api/admin/accounting/income \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15T10:30:00.000Z",
    "amount": 1500.00,
    "category": "Service Revenue",
    "description": "Web development project payment",
    "account": "ACCOUNT_ID_FROM_STEP_1"
  }'
```

3. **Generate Financial Report**
```bash
curl -X GET "http://localhost:5000/api/admin/accounting/report/profit-loss?from=2024-01-01&to=2024-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🚀 Getting Started

1. **Authentication**: Get JWT token from `/api/auth/login`
2. **Create Accounts**: Set up ledger accounts for your business
3. **Record Transactions**: Add income, expenses, and transfers
4. **Generate Reports**: Use reporting endpoints for financial analysis
5. **Monitor**: Use summary endpoint for dashboard data

---

**Built with ❤️ for the CRIPCOCODE CRM Project**
