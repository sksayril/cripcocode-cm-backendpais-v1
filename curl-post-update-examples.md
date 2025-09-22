# POST Update Finance Entry - cURL Examples

## Prerequisites
1. Start your server: `node server.js`
2. Get a SuperAdmin JWT token from your authentication system
3. Create a finance entry first to get an entry ID
4. Replace `YOUR_JWT_TOKEN` and `ENTRY_ID` with actual values

## API Endpoint
```
POST /api/admin/finance/entries/:id
```

## Example 1: Update Entry with POST Method
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries/68d11045380b4e78ee31c113" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 55000,
    "description": "Updated Product Sales Revenue"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Finance entry updated successfully",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "data": {
    "entry": {
      "_id": "68d11045380b4e78ee31c113",
      "type": "income",
      "amount": 55000,
      "currency": "INR",
      "description": "Updated Product Sales Revenue",
      "category": "General Income",
      "incomeSource": "Product Sales",
      "expenseType": null,
      "paymentMethod": "bank_transfer",
      "paymentReference": "",
      "date": "2024-01-15T00:00:00.000Z",
      "status": "approved",
      "addedBy": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "username": "superadmin",
        "email": "admin@example.com",
        "fullname": "Super Admin"
      },
      "approvedBy": null,
      "approvedAt": null,
      "rejectionReason": null,
      "tags": [],
      "notes": "",
      "attachments": [],
      "company": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-20T10:30:00.000Z"
    }
  }
}
```

## Example 2: Update All Fields with POST
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries/68d11045380b4e78ee31c113" \
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
    "_id": "68d11045380b4e78ee31c113",
    "type": "expense",
    "amount": 25000,
    "description": "Updated Office Rent Payment",
    "date": "2024-01-20T00:00:00.000Z",
    "addedBy": "superadmin"
  }
}
```

## Example 3: Update Only Amount
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries/68d11045380b4e78ee31c113" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 75000
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Entry updated successfully",
  "data": {
    "_id": "68d11045380b4e78ee31c113",
    "type": "expense",
    "amount": 75000,
    "description": "Updated Office Rent Payment",
    "date": "2024-01-20T00:00:00.000Z",
    "addedBy": "superadmin"
  }
}
```

## Example 4: Update Only Description
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries/68d11045380b4e78ee31c113" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Final Updated Product Sales Revenue - Q1 2024"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Entry updated successfully",
  "data": {
    "_id": "68d11045380b4e78ee31c113",
    "type": "expense",
    "amount": 75000,
    "description": "Final Updated Product Sales Revenue - Q1 2024",
    "date": "2024-01-20T00:00:00.000Z",
    "addedBy": "superadmin"
  }
}
```

## Error Examples

### 1. Invalid Type
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries/68d11045380b4e78ee31c113" \
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
curl -X POST "http://localhost:3500/api/admin/finance/entries/68d11045380b4e78ee31c113" \
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
curl -X POST "http://localhost:3500/api/admin/finance/entries/68d11045380b4e78ee31c113" \
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

### 4. Entry Not Found
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries/507f1f77bcf86cd799439011" \
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

### 5. Unauthorized Access (No Token)
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries/68d11045380b4e78ee31c113" \
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
    "_id": "68d11045380b4e78ee31c113",
    "type": "income",
    "amount": 10000,
    "description": "Initial Product Sales",
    "date": "2024-01-15T00:00:00.000Z",
    "addedBy": "superadmin"
  }
}
```

### Step 2: Update the Entry using POST
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries/68d11045380b4e78ee31c113" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 55000,
    "description": "Updated Product Sales Revenue"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Entry updated successfully",
  "data": {
    "_id": "68d11045380b4e78ee31c113",
    "type": "income",
    "amount": 55000,
    "description": "Updated Product Sales Revenue",
    "date": "2024-01-15T00:00:00.000Z",
    "addedBy": "superadmin"
  }
}
```

## Integration Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

async function updateFinanceEntryPost(entryId, updateData, token) {
  try {
    const response = await axios.post(
      `http://localhost:3500/api/admin/finance/entries/${entryId}`,
      updateData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Entry updated:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('Update failed:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
updateFinanceEntryPost('68d11045380b4e78ee31c113', {
  amount: 55000,
  description: 'Updated Product Sales Revenue'
}, 'your_jwt_token');
```

### Python
```python
import requests

def update_finance_entry_post(entry_id, update_data, token):
    url = f"http://localhost:3500/api/admin/finance/entries/{entry_id}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, json=update_data, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Update failed: {e}")
        raise

# Usage
result = update_finance_entry_post('68d11045380b4e78ee31c113', {
    "amount": 55000,
    "description": "Updated Product Sales Revenue"
}, "your_jwt_token")
print(result)
```

## Notes
1. **POST Method**: Now you can use POST method to update entries
2. **All Fields Optional**: Any combination of fields can be updated
3. **Same Validation**: Uses the same validation rules as PUT method
4. **Same Response**: Returns the same response format as PUT method
5. **SuperAdmin Only**: Requires SuperAdmin authentication
6. **Entry Must Exist**: The entry must exist and not be deleted
