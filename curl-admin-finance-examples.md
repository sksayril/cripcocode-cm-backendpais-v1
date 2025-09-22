# Admin Finance API - cURL Examples

## 🔐 **Authentication Setup**
Replace `YOUR_JWT_TOKEN` with your actual JWT token for Admin, CompanyAdmin, or SuperAdmin user.

**Allowed Roles:**
- `admin` - Full access to all finance operations
- `companyAdmin` - Full access to all finance operations  
- `superAdmin` - Full access to all finance operations

---

## 📊 **1. Get All Finance Entries**

### **Basic Request**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **With Pagination**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Filter by Type (Income)**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries?type=income" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Filter by Type (Expense)**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries?type=expense" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Filter by Date Range**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Filter by Category**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries?category=Sales" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Filter by Status**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries?status=approved" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Search in Description**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries?search=consulting" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Complex Filter (Multiple Parameters)**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries?type=income&category=Sales&status=approved&page=1&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔍 **2. Get Finance Entry by ID**

### **Get Specific Entry**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries/65a1b2c3d4e5f6789012345a" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Get Non-existent Entry (Error Example)**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries/000000000000000000000000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## ➕ **3. Create Finance Entry**

### **Create Income Entry**
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "income",
    "amount": 100000,
    "currency": "INR",
    "description": "Product Sales Revenue",
    "category": "Sales",
    "incomeSource": "Product Sales",
    "paymentMethod": "bank_transfer",
    "paymentReference": "TXN123456",
    "date": "2024-01-20T10:00:00.000Z",
    "tags": ["sales", "revenue", "product"],
    "notes": "Monthly product sales revenue"
  }'
```

### **Create Expense Entry**
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "expense",
    "amount": 50000,
    "currency": "INR",
    "description": "Marketing Campaign",
    "category": "Marketing",
    "expenseType": "marketing",
    "paymentMethod": "card",
    "paymentReference": "CARD789012",
    "date": "2024-01-20T14:30:00.000Z",
    "tags": ["marketing", "campaign", "advertising"],
    "notes": "Digital marketing campaign for Q1"
  }'
```

### **Create Minimal Income Entry**
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "income",
    "amount": 25000,
    "description": "Consulting Fee",
    "category": "Services"
  }'
```

### **Create Minimal Expense Entry**
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "expense",
    "amount": 15000,
    "description": "Office Supplies",
    "category": "Operations",
    "expenseType": "operational"
  }'
```

### **Create Entry with All Fields**
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "income",
    "amount": 200000,
    "currency": "USD",
    "description": "International Consulting Services",
    "category": "International Services",
    "incomeSource": "International Consulting",
    "paymentMethod": "bank_transfer",
    "paymentReference": "INTL123456",
    "date": "2024-01-20T09:00:00.000Z",
    "tags": ["international", "consulting", "services", "high-value"],
    "notes": "High-value international consulting project for enterprise client",
    "attachments": [
      {
        "filename": "contract.pdf",
        "url": "https://example.com/contracts/contract.pdf",
        "type": "application/pdf"
      }
    ]
  }'
```

---

## ✏️ **4. Update Finance Entry**

### **Update Amount and Description**
```bash
curl -X PUT "http://localhost:3500/api/admin/finance/entries/65a1b2c3d4e5f6789012345a" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 120000,
    "description": "Updated Product Sales Revenue"
  }'
```

### **Update Multiple Fields**
```bash
curl -X PUT "http://localhost:3500/api/admin/finance/entries/65a1b2c3d4e5f6789012345a" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 150000,
    "description": "Premium Product Sales Revenue",
    "category": "Premium Sales",
    "incomeSource": "Premium Product Sales",
    "paymentMethod": "upi",
    "paymentReference": "UPI987654",
    "notes": "Updated to reflect premium product sales"
  }'
```

### **Update Tags and Notes**
```bash
curl -X PUT "http://localhost:3500/api/admin/finance/entries/65a1b2c3d4e5f6789012345a" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tags": ["premium", "sales", "revenue", "updated"],
    "notes": "Updated with premium product sales information"
  }'
```

### **Update Status (if allowed)**
```bash
curl -X PUT "http://localhost:3500/api/admin/finance/entries/65a1b2c3d4e5f6789012345a" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "notes": "Transaction completed successfully"
  }'
```

---

## 🗑️ **5. Delete Finance Entry**

### **Delete Entry (Soft Delete)**
```bash
curl -X DELETE "http://localhost:3500/api/admin/finance/entries/65a1b2c3d4e5f6789012345a" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Delete Non-existent Entry (Error Example)**
```bash
curl -X DELETE "http://localhost:3500/api/admin/finance/entries/000000000000000000000000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📊 **6. Get Finance Statistics**

### **Get All Statistics**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/statistics" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Get Statistics for Date Range**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/statistics?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Get Income Statistics Only**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/statistics?type=income" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Get Expense Statistics Only**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/statistics?type=expense" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Get Statistics for Current Month**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/statistics?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Get Statistics for Last Quarter**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/statistics?startDate=2024-10-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## ❌ **Error Testing Examples**

### **1. No Authentication Token**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries"
```

### **2. Invalid Token**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer invalid_token_here"
```

### **3. Invalid Entry ID**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries/invalid_id" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **4. Invalid Request Body (Missing Required Fields)**
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000
  }'
```

### **5. Invalid Amount (Negative)**
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "income",
    "amount": -1000,
    "description": "Invalid amount",
    "category": "Test"
  }'
```

### **6. Invalid Type**
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "invalid_type",
    "amount": 1000,
    "description": "Invalid type",
    "category": "Test"
  }'
```

### **7. Invalid Date Format**
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "income",
    "amount": 1000,
    "description": "Invalid date",
    "category": "Test",
    "date": "invalid-date-format"
  }'
```

---

## 🔧 **Advanced Examples**

### **1. Bulk Operations Simulation**
```bash
# Create multiple entries
for i in {1..5}; do
  curl -X POST "http://localhost:3500/api/admin/finance/entries" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"type\": \"income\",
      \"amount\": $((10000 + i * 1000)),
      \"description\": \"Test Entry $i\",
      \"category\": \"Test\"
    }"
  echo "Created entry $i"
done
```

### **2. Date Range Testing**
```bash
# Get entries for each month
for month in 01 02 03 04 05 06 07 08 09 10 11 12; do
  curl -X GET "http://localhost:3500/api/admin/finance/entries?startDate=2024-$month-01&endDate=2024-$month-31" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN"
  echo "Retrieved entries for 2024-$month"
done
```

### **3. Performance Testing**
```bash
# Test with large limit
curl -X GET "http://localhost:3500/api/admin/finance/entries?limit=100" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📝 **Notes**

1. **Replace `YOUR_JWT_TOKEN`** with your actual JWT token
2. **Replace entry IDs** with actual MongoDB ObjectIds from your database
3. **Adjust dates** according to your data
4. **Test error scenarios** to ensure proper error handling
5. **Use proper Content-Type headers** for POST/PUT requests
6. **Check response status codes** for success/error indication

---

## 🚀 **Quick Test Script**

```bash
#!/bin/bash

# Set your JWT token here
JWT_TOKEN="YOUR_JWT_TOKEN"
BASE_URL="http://localhost:3500/api/admin/finance"

echo "Testing Admin Finance API..."

# Test 1: Get all entries
echo "1. Getting all entries..."
curl -s -X GET "$BASE_URL/entries" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .

# Test 2: Create income entry
echo "2. Creating income entry..."
curl -s -X POST "$BASE_URL/entries" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "income",
    "amount": 50000,
    "description": "Test Income Entry",
    "category": "Test"
  }' | jq .

# Test 3: Get statistics
echo "3. Getting statistics..."
curl -s -X GET "$BASE_URL/statistics" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .

echo "Testing completed!"
```

Save this as `test-admin-finance.sh`, make it executable with `chmod +x test-admin-finance.sh`, and run it with `./test-admin-finance.sh`.
