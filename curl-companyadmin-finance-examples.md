# CompanyAdmin Finance API - cURL Examples

## 🔐 **Authentication Setup**
Replace `YOUR_COMPANYADMIN_JWT_TOKEN` with your actual JWT token for CompanyAdmin user.

**Allowed Roles:**
- `admin` - Full access to all finance operations
- `companyAdmin` - Full access to all finance operations  
- `superAdmin` - Full access to all finance operations

---

## 📊 **1. Get All Finance Entries (CompanyAdmin)**

### **Basic Request**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN"
```

### **With Pagination**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN"
```

### **Filter by Type (Income)**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries?type=income" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN"
```

### **Filter by Type (Expense)**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries?type=expense" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN"
```

### **Filter by Date Range**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN"
```

### **Filter by Category**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries?category=Sales" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN"
```

### **Filter by Status**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries?status=approved" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN"
```

### **Search in Description**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries?search=consulting" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN"
```

### **Complex Filter (Multiple Parameters)**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries?type=income&category=Sales&status=approved&page=1&limit=5" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN"
```

---

## 🔍 **2. Get Finance Entry by ID (CompanyAdmin)**

### **Get Specific Entry**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries/65a1b2c3d4e5f6789012345a" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN"
```

### **Get Non-existent Entry (Error Example)**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/entries/000000000000000000000000" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN"
```

---

## ➕ **3. Create Finance Entry (CompanyAdmin)**

### **Create Income Entry**
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "income",
    "amount": 150000,
    "currency": "INR",
    "description": "CompanyAdmin Product Sales Revenue",
    "category": "Company Sales",
    "incomeSource": "Product Sales",
    "paymentMethod": "bank_transfer",
    "paymentReference": "COMPANYADMIN_TXN001",
    "date": "2024-01-20T10:00:00.000Z",
    "tags": ["companyadmin", "sales", "revenue"],
    "notes": "Revenue entry created by CompanyAdmin"
  }'
```

### **Create Expense Entry**
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "expense",
    "amount": 75000,
    "currency": "INR",
    "description": "CompanyAdmin Marketing Campaign",
    "category": "Company Marketing",
    "expenseType": "marketing",
    "paymentMethod": "card",
    "paymentReference": "COMPANYADMIN_CARD001",
    "date": "2024-01-20T14:30:00.000Z",
    "tags": ["companyadmin", "marketing", "campaign"],
    "notes": "Marketing expense created by CompanyAdmin"
  }'
```

### **Create Minimal Income Entry**
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "income",
    "amount": 50000,
    "description": "CompanyAdmin Consulting Fee",
    "category": "Company Services"
  }'
```

### **Create Minimal Expense Entry**
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "expense",
    "amount": 30000,
    "description": "CompanyAdmin Office Supplies",
    "category": "Company Operations",
    "expenseType": "operational"
  }'
```

### **Create Entry with All Fields**
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "income",
    "amount": 300000,
    "currency": "USD",
    "description": "CompanyAdmin International Services",
    "category": "International Services",
    "incomeSource": "International Consulting",
    "paymentMethod": "bank_transfer",
    "paymentReference": "COMPANYADMIN_INTL001",
    "date": "2024-01-20T09:00:00.000Z",
    "tags": ["companyadmin", "international", "consulting", "high-value"],
    "notes": "High-value international consulting project managed by CompanyAdmin",
    "attachments": [
      {
        "filename": "companyadmin_contract.pdf",
        "url": "https://example.com/contracts/companyadmin_contract.pdf",
        "type": "application/pdf"
      }
    ]
  }'
```

---

## ✏️ **4. Update Finance Entry (CompanyAdmin)**

### **Update Amount and Description**
```bash
curl -X PUT "http://localhost:3500/api/admin/finance/entries/65a1b2c3d4e5f6789012345a" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 180000,
    "description": "Updated by CompanyAdmin - Product Sales Revenue"
  }'
```

### **Update Multiple Fields**
```bash
curl -X PUT "http://localhost:3500/api/admin/finance/entries/65a1b2c3d4e5f6789012345a" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 200000,
    "description": "CompanyAdmin Premium Product Sales",
    "category": "Premium Sales",
    "incomeSource": "Premium Product Sales",
    "paymentMethod": "upi",
    "paymentReference": "COMPANYADMIN_UPI001",
    "notes": "Updated by CompanyAdmin - premium product sales"
  }'
```

### **Update Tags and Notes**
```bash
curl -X PUT "http://localhost:3500/api/admin/finance/entries/65a1b2c3d4e5f6789012345a" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tags": ["companyadmin", "premium", "sales", "updated"],
    "notes": "Updated by CompanyAdmin with premium product information"
  }'
```

### **Update Status (if allowed)**
```bash
curl -X PUT "http://localhost:3500/api/admin/finance/entries/65a1b2c3d4e5f6789012345a" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "notes": "Transaction completed by CompanyAdmin"
  }'
```

---

## 🗑️ **5. Delete Finance Entry (CompanyAdmin)**

### **Delete Entry (Soft Delete)**
```bash
curl -X DELETE "http://localhost:3500/api/admin/finance/entries/65a1b2c3d4e5f6789012345a" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN"
```

### **Delete Non-existent Entry (Error Example)**
```bash
curl -X DELETE "http://localhost:3500/api/admin/finance/entries/000000000000000000000000" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN"
```

---

## 📊 **6. Get Finance Statistics (CompanyAdmin)**

### **Get All Statistics**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/statistics" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN"
```

### **Get Statistics for Date Range**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/statistics?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN"
```

### **Get Income Statistics Only**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/statistics?type=income" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN"
```

### **Get Expense Statistics Only**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/statistics?type=expense" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN"
```

### **Get Statistics for Current Month**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/statistics?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN"
```

### **Get Statistics for Last Quarter**
```bash
curl -X GET "http://localhost:3500/api/admin/finance/statistics?startDate=2024-10-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN"
```

---

## ❌ **Error Testing Examples (CompanyAdmin)**

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
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN"
```

### **4. Invalid Request Body (Missing Required Fields)**
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000
  }'
```

### **5. Invalid Amount (Negative)**
```bash
curl -X POST "http://localhost:3500/api/admin/finance/entries" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN" \
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
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN" \
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
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN" \
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

## 🔧 **Advanced Examples (CompanyAdmin)**

### **1. Bulk Operations Simulation**
```bash
# Create multiple entries as CompanyAdmin
for i in {1..5}; do
  curl -X POST "http://localhost:3500/api/admin/finance/entries" \
    -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"type\": \"income\",
      \"amount\": $((20000 + i * 5000)),
      \"description\": \"CompanyAdmin Test Entry $i\",
      \"category\": \"Company Test\"
    }"
  echo "Created CompanyAdmin entry $i"
done
```

### **2. Date Range Testing**
```bash
# Get entries for each month as CompanyAdmin
for month in 01 02 03 04 05 06 07 08 09 10 11 12; do
  curl -X GET "http://localhost:3500/api/admin/finance/entries?startDate=2024-$month-01&endDate=2024-$month-31" \
    -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN"
  echo "Retrieved CompanyAdmin entries for 2024-$month"
done
```

### **3. Performance Testing**
```bash
# Test with large limit as CompanyAdmin
curl -X GET "http://localhost:3500/api/admin/finance/entries?limit=100" \
  -H "Authorization: Bearer YOUR_COMPANYADMIN_JWT_TOKEN"
```

---

## 📝 **Notes**

1. **Replace `YOUR_COMPANYADMIN_JWT_TOKEN`** with your actual CompanyAdmin JWT token
2. **Replace entry IDs** with actual MongoDB ObjectIds from your database
3. **Adjust dates** according to your data
4. **Test error scenarios** to ensure proper error handling
5. **Use proper Content-Type headers** for POST/PUT requests
6. **Check response status codes** for success/error indication
7. **CompanyAdmin has full access** to all finance operations

---

## 🚀 **Quick Test Script (CompanyAdmin)**

```bash
#!/bin/bash

# Set your CompanyAdmin JWT token here
COMPANYADMIN_JWT_TOKEN="YOUR_COMPANYADMIN_JWT_TOKEN"
BASE_URL="http://localhost:3500/api/admin/finance"

echo "Testing CompanyAdmin Finance API..."

# Test 1: Get all entries
echo "1. Getting all entries as CompanyAdmin..."
curl -s -X GET "$BASE_URL/entries" \
  -H "Authorization: Bearer $COMPANYADMIN_JWT_TOKEN" | jq .

# Test 2: Create income entry
echo "2. Creating income entry as CompanyAdmin..."
curl -s -X POST "$BASE_URL/entries" \
  -H "Authorization: Bearer $COMPANYADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "income",
    "amount": 100000,
    "description": "CompanyAdmin Test Income Entry",
    "category": "Company Test"
  }' | jq .

# Test 3: Get statistics
echo "3. Getting statistics as CompanyAdmin..."
curl -s -X GET "$BASE_URL/statistics" \
  -H "Authorization: Bearer $COMPANYADMIN_JWT_TOKEN" | jq .

echo "CompanyAdmin testing completed!"
```

Save this as `test-companyadmin-finance.sh`, make it executable with `chmod +x test-companyadmin-finance.sh`, and run it with `./test-companyadmin-finance.sh`.
