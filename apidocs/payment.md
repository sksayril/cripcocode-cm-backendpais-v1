# Payment System API Documentation

A comprehensive payment system API integrated with Razorpay Payment Gateway for CRM project. This system allows SuperAdmin users to create orders, verify payments, and manage transactions with automatic gateway charge calculations.

## 🔐 Authentication

All payment endpoints require SuperAdmin authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 👥 Access Control

- **SuperAdmin Only**: All payment endpoints are restricted to SuperAdmin users
- **Role Verification**: Automatic role checking on all routes
- **Secure Operations**: Payment verification and transaction management

## 💳 Gateway Pricing

The system automatically calculates Razorpay charges:
- **Transaction Fee**: 2% of the payment amount
- **GST on Fee**: 18% of the transaction fee
- **Total Charges**: Transaction Fee + GST
- **Net Amount**: Payment Amount - Total Charges

### Example Calculation:
- Amount: ₹1000
- Transaction Fee: ₹20 (2% of ₹1000)
- GST on Fee: ₹3.6 (18% of ₹20)
- Total Gateway Charges: ₹23.6
- Net Amount: ₹976.4

## 📋 API Endpoints

### 1. Create Razorpay Order
**POST** `/api/payment/create-order`

Create a new Razorpay order for payment processing.

**Request Body:**
```json
{
  "amount": 100000,
  "currency": "INR",
  "receipt": "order_12345",
  "notes": {
    "description": "CRM Subscription Payment",
    "customer_id": "cust_123"
  },
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "contact": "+919876543210"
  }
}
```

**Field Descriptions:**
- `amount` (number, required): Payment amount in paise (₹1000 = 100000 paise)
- `currency` (string, optional): Currency code (default: "INR")
- `receipt` (string, optional): Order receipt identifier
- `notes` (object, optional): Additional order notes
- `customer` (object, optional): Customer information

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "id": "order_MjQwMzQ4NjQ4",
      "amount": 100000,
      "currency": "INR",
      "receipt": "order_12345",
      "status": "created",
      "created_at": 1640995200,
      "notes": {
        "description": "CRM Subscription Payment",
        "customer_id": "cust_123",
        "gatewayCharges": 23.6,
        "netAmount": 976.4
      }
    },
    "charges": {
      "transactionFee": 20,
      "gstOnFee": 3.6,
      "totalGatewayCharges": 23.6,
      "netAmount": 976.4,
      "amountInRupees": 1000
    }
  }
}
```

### 2. Verify Payment
**POST** `/api/payment/verify`

Verify payment signature and save transaction to database.

**Request Body:**
```json
{
  "razorpayOrderId": "order_MjQwMzQ4NjQ4",
  "razorpayPaymentId": "pay_MjQwMzQ4NjQ5",
  "razorpaySignature": "a1b2c3d4e5f6...",
  "amount": 100000,
  "currency": "INR",
  "method": "card",
  "bank": "HDFC",
  "wallet": null,
  "vpa": null,
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "contact": "+919876543210"
  },
  "description": "CRM Subscription Payment",
  "notes": "Monthly subscription payment"
}
```

**Field Descriptions:**
- `razorpayOrderId` (string, required): Razorpay order ID
- `razorpayPaymentId` (string, required): Razorpay payment ID
- `razorpaySignature` (string, required): Razorpay payment signature
- `amount` (number, required): Payment amount in paise
- `currency` (string, optional): Currency code (default: "INR")
- `method` (string, optional): Payment method (default: "card")
- `bank` (string, optional): Bank name for card payments
- `wallet` (string, optional): Wallet name for wallet payments
- `vpa` (string, optional): VPA for UPI payments
- `customer` (object, optional): Customer information
- `description` (string, optional): Payment description
- `notes` (string, optional): Additional notes

**Response:**
```json
{
  "success": true,
  "message": "Payment verified and transaction saved successfully",
  "data": {
    "transaction": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b5",
      "orderId": "order_MjQwMzQ4NjQ4",
      "paymentId": "pay_MjQwMzQ4NjQ5",
      "amount": 1000,
      "currency": "INR",
      "gatewayCharges": 23.6,
      "netAmount": 976.4,
      "status": "captured",
      "method": "card",
      "bank": "HDFC",
      "wallet": null,
      "vpa": null,
      "customer": {
        "name": "John Doe",
        "email": "john@example.com",
        "contact": "+919876543210"
      },
      "description": "CRM Subscription Payment",
      "notes": "Monthly subscription payment",
      "createdAt": "2023-07-20T10:00:00.000Z",
      "capturedAt": "2023-07-20T10:00:00.000Z"
    },
    "charges": {
      "transactionFee": 20,
      "gstOnFee": 3.6,
      "totalGatewayCharges": 23.6,
      "netAmount": 976.4,
      "amountInRupees": 1000
    }
  }
}
```

### 3. Get All Transactions
**GET** `/api/payment/transactions`

Retrieve all transactions with pagination and filtering.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Transactions per page (default: 10)
- `status` (string, optional): Filter by status (pending, captured, failed, refunded, partially_refunded)
- `startDate` (string, optional): Start date filter (ISO 8601 format)
- `endDate` (string, optional): End date filter (ISO 8601 format)
- `sortBy` (string, optional): Sort field (default: "createdAt")
- `sortOrder` (string, optional): Sort order - "asc" or "desc" (default: "desc")

**Example:**
```
GET /api/payment/transactions?page=1&limit=20&status=captured&startDate=2023-07-01&endDate=2023-07-31
```

**Response:**
```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": {
    "transactions": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
        "orderId": "order_MjQwMzQ4NjQ4",
        "paymentId": "pay_MjQwMzQ4NjQ5",
        "amount": 1000,
        "currency": "INR",
        "gatewayCharges": 23.6,
        "netAmount": 976.4,
        "status": "captured",
        "method": "card",
        "bank": "HDFC",
        "customer": {
          "name": "John Doe",
          "email": "john@example.com",
          "contact": "+919876543210"
        },
        "description": "CRM Subscription Payment",
        "createdAt": "2023-07-20T10:00:00.000Z",
        "capturedAt": "2023-07-20T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalTransactions": 50,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 10
    }
  }
}
```

### 4. Get Transaction Statistics
**GET** `/api/payment/statistics`

Get comprehensive transaction statistics and revenue analytics.

**Query Parameters:**
- `startDate` (string, optional): Start date filter (ISO 8601 format)
- `endDate` (string, optional): End date filter (ISO 8601 format)

**Example:**
```
GET /api/payment/statistics?startDate=2023-07-01&endDate=2023-07-31
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction statistics retrieved successfully",
  "data": {
    "statistics": {
      "totalTransactions": 150,
      "totalAmount": 150000,
      "totalGatewayCharges": 3540,
      "totalNetAmount": 146460,
      "totalRefunded": 5000,
      "capturedTransactions": 140,
      "failedTransactions": 5,
      "pendingTransactions": 3,
      "refundedTransactions": 2,
      "successRate": 93.33,
      "averageTransactionValue": 1071.43,
      "netSettled": 141460
    }
  }
}
```

### 5. Get Payment Dashboard
**GET** `/api/payment/dashboard`

Get comprehensive dashboard data including recent transactions and statistics.

**Response:**
```json
{
  "success": true,
  "message": "Payment dashboard data retrieved successfully",
  "data": {
    "recentTransactions": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
        "orderId": "order_MjQwMzQ4NjQ4",
        "amount": 1000,
        "status": "captured",
        "customer": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "createdAt": "2023-07-20T10:00:00.000Z"
      }
    ],
    "overallStatistics": {
      "totalTransactions": 150,
      "totalAmount": 150000,
      "totalGatewayCharges": 3540,
      "netSettled": 141460,
      "successRate": 93.33,
      "averageTransactionValue": 1071.43
    },
    "todayStatistics": {
      "totalTransactions": 5,
      "totalAmount": 5000,
      "totalGatewayCharges": 118,
      "netSettled": 4882
    },
    "monthStatistics": {
      "totalTransactions": 50,
      "totalAmount": 50000,
      "totalGatewayCharges": 1180,
      "netSettled": 48820
    },
    "summary": {
      "totalRevenue": 150000,
      "totalGatewayCharges": 3540,
      "netSettled": 141460,
      "successRate": 93.33,
      "averageTransactionValue": 1071.43
    }
  }
}
```

### 6. Get Transaction by ID
**GET** `/api/payment/transactions/:id`

Get detailed information about a specific transaction.

**Path Parameters:**
- `id` (string): Transaction ID

**Response:**
```json
{
  "success": true,
  "message": "Transaction retrieved successfully",
  "data": {
    "transaction": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
      "orderId": "order_MjQwMzQ4NjQ4",
      "paymentId": "pay_MjQwMzQ4NjQ5",
      "amount": 1000,
      "currency": "INR",
      "gatewayCharges": 23.6,
      "netAmount": 976.4,
      "status": "captured",
      "method": "card",
      "bank": "HDFC",
      "customer": {
        "name": "John Doe",
        "email": "john@example.com",
        "contact": "+919876543210"
      },
      "description": "CRM Subscription Payment",
      "notes": "Monthly subscription payment",
      "refunds": [],
      "totalRefunded": 0,
      "refundableAmount": 976.4,
      "createdAt": "2023-07-20T10:00:00.000Z",
      "capturedAt": "2023-07-20T10:00:00.000Z"
    }
  }
}
```

### 7. Create Refund
**POST** `/api/payment/transactions/:id/refund`

Create a refund for a specific transaction.

**Path Parameters:**
- `id` (string): Transaction ID

**Request Body:**
```json
{
  "amount": 500,
  "notes": "Customer requested partial refund"
}
```

**Field Descriptions:**
- `amount` (number, required): Refund amount in rupees
- `notes` (string, optional): Refund reason or notes

**Response:**
```json
{
  "success": true,
  "message": "Refund created successfully",
  "data": {
    "refund": {
      "id": "rfnd_MjQwMzQ4NjQ5",
      "amount": 500,
      "status": "processed",
      "notes": "Customer requested partial refund",
      "refundedAt": "2023-07-20T11:00:00.000Z"
    },
    "transaction": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b5",
      "status": "partially_refunded",
      "totalRefunded": 500,
      "refundableAmount": 476.4
    }
  }
}
```

### 8. Calculate Gateway Charges
**POST** `/api/payment/calculate-charges`

Calculate gateway charges for a given amount without creating an order.

**Request Body:**
```json
{
  "amount": 100000
}
```

**Field Descriptions:**
- `amount` (number, required): Amount in paise

**Response:**
```json
{
  "success": true,
  "message": "Charges calculated successfully",
  "data": {
    "charges": {
      "transactionFee": 20,
      "gstOnFee": 3.6,
      "totalGatewayCharges": 23.6,
      "netAmount": 976.4,
      "amountInRupees": 1000
    }
  }
}
```

### 9. Export Transactions
**GET** `/api/payment/export`

Export transactions to CSV format for download.

**Query Parameters:**
- `startDate` (string, optional): Start date filter (ISO 8601 format)
- `endDate` (string, optional): End date filter (ISO 8601 format)
- `status` (string, optional): Filter by status

**Example:**
```
GET /api/payment/export?startDate=2023-07-01&endDate=2023-07-31&status=captured
```

**Response:**
- **Content-Type**: `text/csv`
- **Content-Disposition**: `attachment; filename="transactions_2023-07-20.csv"`
- **Body**: CSV file with transaction data

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Amount is required",
  "timestamp": "2023-07-20T10:00:00.000Z"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token is required",
  "timestamp": "2023-07-20T10:00:00.000Z"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. SuperAdmin role required.",
  "timestamp": "2023-07-20T10:00:00.000Z"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Transaction not found",
  "timestamp": "2023-07-20T10:00:00.000Z"
}
```

## 🚀 Usage Examples

### Create Order (cURL)
```bash
curl -X POST http://localhost:3500/api/payment/create-order \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100000,
    "currency": "INR",
    "receipt": "order_12345",
    "customer": {
      "name": "John Doe",
      "email": "john@example.com",
      "contact": "+919876543210"
    }
  }'
```

### Verify Payment (cURL)
```bash
curl -X POST http://localhost:3500/api/payment/verify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpayOrderId": "order_MjQwMzQ4NjQ4",
    "razorpayPaymentId": "pay_MjQwMzQ4NjQ5",
    "razorpaySignature": "a1b2c3d4e5f6...",
    "amount": 100000,
    "method": "card",
    "bank": "HDFC"
  }'
```

### Get Transactions (cURL)
```bash
curl -X GET "http://localhost:3500/api/payment/transactions?page=1&limit=10&status=captured" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Statistics (cURL)
```bash
curl -X GET "http://localhost:3500/api/payment/statistics?startDate=2023-07-01&endDate=2023-07-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📝 Notes

- All amounts are stored in rupees in the database but processed in paise by Razorpay
- Gateway charges are automatically calculated and stored with each transaction
- Payment signature verification ensures transaction security
- All endpoints require SuperAdmin authentication
- Transaction statuses: pending, captured, failed, refunded, partially_refunded
- Refunds can be partial or full
- CSV export includes all transaction details for reporting
- Dashboard provides real-time analytics and insights

## 🔧 Environment Variables

Add these to your `.env` file:

```env
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

## 📊 Database Schema

The Transaction model includes:
- Order and payment IDs from Razorpay
- Amount, currency, and charge calculations
- Customer information
- Payment method details
- Refund tracking
- Timestamps and status tracking

---

**Built with ❤️ for Secure Payment Processing**
