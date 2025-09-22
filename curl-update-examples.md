# Update Finance Entry - cURL Examples

## Prerequisites
1. Start your server: `node server.js`
2. Get a SuperAdmin JWT token from your authentication system
3. Create a finance entry first to get an entry ID
4. Replace `YOUR_JWT_TOKEN` and `ENTRY_ID` with actual values

## API Endpoint
```
PUT /api/admin/finance/entries/:id
```

## Example 1: Update All Fields
```bash
curl -X PUT "http://localhost:3500/api/admin/finance/entries/64f8a1b2c3d4e5f6a7b8c9d0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "expense",
    "amount": 25000,
    "description": "Updated Office Rent Payment",
    "date": "2024-01-20"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Entry updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "type": "expense",
    "amount": 25000,
    "description": "Updated Office Rent Payment",
    "date": "2024-01-20T00:00:00.000Z",
    "addedBy": "superadmin"
  }
}
```

## Example 2: Update Amount Only
```bash
curl -X PUT "http://localhost:3500/api/admin/finance/entries/64f8a1b2c3d4e5f6a7b8c9d0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 30000
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Entry updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "type": "expense",
    "amount": 30000,
    "description": "Updated Office Rent Payment",
    "date": "2024-01-20T00:00:00.000Z",
    "addedBy": "superadmin"
  }
}
```

## Example 3: Update Description Only
```bash
curl -X PUT "http://localhost:3500/api/admin/finance/entries/64f8a1b2c3d4e5f6a7b8c9d0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated Product Sales Revenue - Q1 2024"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Entry updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "type": "expense",
    "amount": 30000,
    "description": "Updated Product Sales Revenue - Q1 2024",
    "date": "2024-01-20T00:00:00.000Z",
    "addedBy": "superadmin"
  }
}
```

## Example 4: Update Type Only
```bash
curl -X PUT "http://localhost:3500/api/admin/finance/entries/64f8a1b2c3d4e5f6a7b8c9d0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "income"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Entry updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "type": "income",
    "amount": 30000,
    "description": "Updated Product Sales Revenue - Q1 2024",
    "date": "2024-01-20T00:00:00.000Z",
    "addedBy": "superadmin"
  }
}
```

## Example 5: Update Date Only
```bash
curl -X PUT "http://localhost:3500/api/admin/finance/entries/64f8a1b2c3d4e5f6a7b8c9d0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-02-01"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Entry updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "type": "income",
    "amount": 30000,
    "description": "Updated Product Sales Revenue - Q1 2024",
    "date": "2024-02-01T00:00:00.000Z",
    "addedBy": "superadmin"
  }
}
```

## Error Examples

### 1. Invalid Type
```bash
curl -X PUT "http://localhost:3500/api/admin/finance/entries/64f8a1b2c3d4e5f6a7b8c9d0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "invalid"
  }'
```

**Expected Error Response:**
```json
{
  "success": false,
  "message": "Type must be either \"income\" or \"expense\""
}
```

### 2. Negative Amount
```bash
curl -X PUT "http://localhost:3500/api/admin/finance/entries/64f8a1b2c3d4e5f6a7b8c9d0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": -1000
  }'
```

**Expected Error Response:**
```json
{
  "success": false,
  "message": "Amount must be greater than 0"
}
```

### 3. Empty Description
```bash
curl -X PUT "http://localhost:3500/api/admin/finance/entries/64f8a1b2c3d4e5f6a7b8c9d0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": ""
  }'
```

**Expected Error Response:**
```json
{
  "success": false,
  "message": "Description cannot be empty"
}
```

### 4. Invalid Date Format
```bash
curl -X PUT "http://localhost:3500/api/admin/finance/entries/64f8a1b2c3d4e5f6a7b8c9d0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "invalid-date"
  }'
```

**Expected Error Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "date",
      "message": "Date must be a valid ISO 8601 date (YYYY-MM-DD)"
    }
  ]
}
```

### 5. Entry Not Found
```bash
curl -X PUT "http://localhost:3500/api/admin/finance/entries/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000
  }'
```

**Expected Error Response:**
```json
{
  "success": false,
  "message": "Finance entry not found"
}
```

### 6. Unauthorized Access (No Token)
```bash
curl -X PUT "http://localhost:3500/api/admin/finance/entries/64f8a1b2c3d4e5f6a7b8c9d0" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000
  }'
```

**Expected Error Response:**
```json
{
  "success": false,
  "message": "Access denied. No token provided"
}
```

### 7. Invalid Token
```bash
curl -X PUT "http://localhost:3500/api/admin/finance/entries/64f8a1b2c3d4e5f6a7b8c9d0" \
  -H "Authorization: Bearer invalid_token" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000
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

### Optional Fields (any or all can be updated)
- `type` (string): Must be "income" or "expense"
- `amount` (number): Must be greater than 0
- `description` (string): Must be between 1 and 500 characters
- `date` (string): ISO 8601 date format (YYYY-MM-DD)

## Response Schema

### Success Response
```json
{
  "success": true,
  "message": "Entry updated successfully",
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
  "message": "string"
}
```

## Complete Workflow Example

### Step 1: Create an Entry
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "income",
    "amount": 10000,
    "description": "Initial Product Sales",
    "date": "2024-01-15"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Entry added successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "type": "income",
    "amount": 10000,
    "description": "Initial Product Sales",
    "date": "2024-01-15T00:00:00.000Z",
    "addedBy": "superadmin"
  }
}
```

### Step 2: Update the Entry
```bash
curl -X PUT "http://localhost:3500/api/admin/finance/entries/64f8a1b2c3d4e5f6a7b8c9d0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 15000,
    "description": "Updated Product Sales - Premium Package"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Entry updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "type": "income",
    "amount": 15000,
    "description": "Updated Product Sales - Premium Package",
    "date": "2024-01-15T00:00:00.000Z",
    "addedBy": "superadmin"
  }
}
```

## Notes
1. All fields in the request body are optional
2. Only provided fields will be updated
3. The entry must exist and not be deleted
4. Date format should be YYYY-MM-DD (e.g., "2024-01-15")
5. All amounts are stored as numbers (not strings)
6. The `addedBy` field shows who originally created the entry
7. SuperAdmin authentication is required for all update operations
