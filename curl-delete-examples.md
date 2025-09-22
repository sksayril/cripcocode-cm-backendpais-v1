# Delete Finance Entry - cURL Examples

## Prerequisites
1. Start your server: `node server.js`
2. Get a SuperAdmin JWT token from your authentication system
3. Create a finance entry first to get an entry ID
4. Replace `YOUR_JWT_TOKEN` and `ENTRY_ID` with actual values

## API Endpoint
```
DELETE /api/admin/finance/entries/:id
```

## Example 1: Delete Entry Successfully
```bash
curl -X DELETE "http://localhost:3500/api/admin/finance/entries/64f8a1b2c3d4e5f6a7b8c9d0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Entry deleted successfully"
}
```

## Error Examples

### 1. Entry Not Found
```bash
curl -X DELETE "http://localhost:3500/api/admin/finance/entries/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Error Response:**
```json
{
  "success": false,
  "message": "Finance entry not found"
}
```

### 2. Unauthorized Access (No Token)
```bash
curl -X DELETE "http://localhost:3500/api/admin/finance/entries/64f8a1b2c3d4e5f6a7b8c9d0"
```

**Expected Error Response:**
```json
{
  "success": false,
  "message": "Access denied. No token provided"
}
```

### 3. Invalid Token
```bash
curl -X DELETE "http://localhost:3500/api/admin/finance/entries/64f8a1b2c3d4e5f6a7b8c9d0" \
  -H "Authorization: Bearer invalid_token"
```

**Expected Error Response:**
```json
{
  "success": false,
  "message": "Access denied. Invalid token"
}
```

### 4. Invalid Entry ID Format
```bash
curl -X DELETE "http://localhost:3500/api/admin/finance/entries/invalid_id" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Error Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "id",
      "message": "Invalid entry ID"
    }
  ]
}
```

### 5. Missing Entry ID
```bash
curl -X DELETE "http://localhost:3500/api/admin/finance/entries/" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Error Response:**
```json
{
  "success": false,
  "message": "Entry ID is required"
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
    "description": "Test Product Sales",
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
    "description": "Test Product Sales",
    "date": "2024-01-15T00:00:00.000Z",
    "addedBy": "superadmin"
  }
}
```

### Step 2: Verify Entry Exists
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries/64f8a1b2c3d4e5f6a7b8c9d0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Finance entry retrieved successfully",
  "data": {
    "entry": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "type": "income",
      "amount": 10000,
      "description": "Test Product Sales",
      "date": "2024-01-15T00:00:00.000Z",
      "addedBy": "superadmin"
    }
  }
}
```

### Step 3: Delete the Entry
```bash
curl -X DELETE "http://localhost:3500/api/admin/finance/entries/64f8a1b2c3d4e5f6a7b8c9d0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Entry deleted successfully"
}
```

### Step 4: Verify Entry is Deleted
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries/64f8a1b2c3d4e5f6a7b8c9d0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": false,
  "message": "Finance entry not found"
}
```

## Response Schema

### Success Response
```json
{
  "success": true,
  "message": "Entry deleted successfully"
}
```

### Error Response
```json
{
  "success": false,
  "message": "string"
}
```

## Important Notes

### Soft Delete Implementation
- **Soft Delete**: Entries are not permanently removed from the database
- **Marked as Deleted**: The `isDeleted` field is set to `true`
- **Audit Trail**: `deletedAt` and `deletedBy` fields are recorded
- **Recovery**: Deleted entries can potentially be restored (if needed)

### Database Changes
When an entry is deleted, the following fields are updated:
```json
{
  "isDeleted": true,
  "deletedAt": "2024-01-20T10:30:00.000Z",
  "deletedBy": "64f8a1b2c3d4e5f6a7b8c9d1"
}
```

### Security Features
- **SuperAdmin Only**: Only SuperAdmin users can delete entries
- **JWT Authentication**: Valid JWT token required
- **Entry Validation**: Checks if entry exists before deletion
- **Audit Logging**: Records who deleted the entry and when

### Error Handling
- **404 Not Found**: Entry doesn't exist or already deleted
- **401 Unauthorized**: Missing or invalid JWT token
- **400 Bad Request**: Invalid entry ID format
- **500 Internal Server Error**: Server-side error

## Testing Scenarios

### 1. Happy Path
1. Create an entry
2. Verify it exists
3. Delete the entry
4. Verify it's deleted

### 2. Error Cases
1. Try to delete non-existent entry
2. Try to delete without authentication
3. Try to delete with invalid token
4. Try to delete with invalid ID format

### 3. Edge Cases
1. Try to delete already deleted entry
2. Try to delete with empty ID
3. Try to delete with malformed ID

## Integration Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

async function deleteFinanceEntry(entryId, token) {
  try {
    const response = await axios.delete(
      `http://localhost:3500/api/admin/finance/entries/${entryId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('Entry deleted:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('Delete failed:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
deleteFinanceEntry('64f8a1b2c3d4e5f6a7b8c9d0', 'your_jwt_token');
```

### Python
```python
import requests

def delete_finance_entry(entry_id, token):
    url = f"http://localhost:3500/api/admin/finance/entries/{entry_id}"
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.delete(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Delete failed: {e}")
        raise

# Usage
result = delete_finance_entry('64f8a1b2c3d4e5f6a7b8c9d0', 'your_jwt_token')
print(result)
```

### PHP
```php
<?php
function deleteFinanceEntry($entryId, $token) {
    $url = "http://localhost:3500/api/admin/finance/entries/{$entryId}";
    
    $headers = [
        "Authorization: Bearer {$token}",
        "Content-Type: application/json"
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        return json_decode($response, true);
    } else {
        throw new Exception("Delete failed: " . $response);
    }
}

// Usage
try {
    $result = deleteFinanceEntry('64f8a1b2c3d4e5f6a7b8c9d0', 'your_jwt_token');
    echo "Entry deleted: " . json_encode($result);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
```
