# Create Finance Entry - cURL Examples

## Prerequisites
1. Start your server: `node server.js`
2. Get a SuperAdmin JWT token from your authentication system
3. Replace `YOUR_JWT_TOKEN` with your actual token

## API Endpoint
```
POST /api/admin/finance/entries
```

## Example 1: Create Income Entry
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "income",
    "amount": 50000,
    "description": "Product Sales Revenue",
    "date": "2024-01-15"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Entry added successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "type": "income",
    "amount": 50000,
    "description": "Product Sales Revenue",
    "date": "2024-01-15T00:00:00.000Z",
    "addedBy": "superadmin"
  }
}
```

## Example 2: Create Expense Entry
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "expense",
    "amount": 15000,
    "description": "Office Rent Payment",
    "date": "2024-01-15"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Entry added successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "type": "expense",
    "amount": 15000,
    "description": "Office Rent Payment",
    "date": "2024-01-15T00:00:00.000Z",
    "addedBy": "superadmin"
  }
}
```

## Example 3: Create Entry Without Date (Uses Current Date)
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "income",
    "amount": 25000,
    "description": "Consulting Services"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Entry added successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
    "type": "income",
    "amount": 25000,
    "description": "Consulting Services",
    "date": "2024-01-20T10:30:00.000Z",
    "addedBy": "superadmin"
  }
}
```

## Error Examples

### 1. Invalid Type
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "invalid",
    "amount": 1000,
    "description": "Test entry"
  }'
```

**Expected Error Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "type",
      "message": "Type must be either \"income\" or \"expense\""
    }
  ]
}
```

### 2. Missing Amount
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "income",
    "description": "Test entry"
  }'
```

**Expected Error Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "amount",
      "message": "Amount must be a number"
    }
  ]
}
```

### 3. Missing Description
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "income",
    "amount": 1000
  }'
```

**Expected Error Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "description",
      "message": "Description must be between 1 and 500 characters"
    }
  ]
}
```

### 4. Negative Amount
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "income",
    "amount": -1000,
    "description": "Test entry"
  }'
```

**Expected Error Response:**
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

### 5. Unauthorized Access (No Token)
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "income",
    "amount": 1000,
    "description": "Test entry"
  }'
```

**Expected Error Response:**
```json
{
  "success": false,
  "message": "Access denied. No token provided"
}
```

### 6. Invalid Token
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer invalid_token" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "income",
    "amount": 1000,
    "description": "Test entry"
  }'
```

**Expected Error Response:**
```json
{
  "success": false,
  "message": "Access denied. Invalid token"
}
```

## Request Body Schema

### Required Fields
- `type` (string): Must be "income" or "expense"
- `amount` (number): Must be greater than 0
- `description` (string): Must be between 1 and 500 characters

### Optional Fields
- `date` (string): ISO 8601 date format (YYYY-MM-DD). Defaults to current date if not provided

## Response Schema

### Success Response
```json
{
  "success": true,
  "message": "Entry added successfully",
  "data": {
    "_id": "string",
    "type": "string",
    "amount": "number",
    "description": "string",
    "date": "ISODate",
    "addedBy": "string"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "string",
  "errors": [
    {
      "field": "string",
      "message": "string"
    }
  ]
}
```

## Notes
1. All entries are automatically approved for SuperAdmin users
2. Default currency is INR
3. Default category is "General Income" for income entries and "General Expense" for expense entries
4. The `addedBy` field will show the username of the SuperAdmin who created the entry
5. Date format should be YYYY-MM-DD (e.g., "2024-01-15")
6. All amounts are stored as numbers (not strings)
