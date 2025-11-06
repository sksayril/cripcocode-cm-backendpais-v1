# 📊 Accounting System API

A comprehensive accounting system built for the CRIPCOCODE CRM Project, providing full financial management capabilities including income/expense tracking, ledger management, transaction processing, and financial reporting.

## 🚀 Quick Start

### 1. Setup Accounting System
```bash
# Run the setup script to create basic ledger accounts
node scripts/setup-accounting.js
```

### 2. Start the Server
```bash
npm run dev
```

### 3. Test the API
```bash
# Health check
curl http://localhost:5000/health

# Test accounting endpoint (requires authentication)
curl -X GET http://localhost:5000/api/admin/accounting/ledger \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📋 Features

### ✅ Income & Expense Management
- Add income and expense entries
- Categorize transactions
- Track payment methods
- Support for recurring transactions
- Approval workflow
- File attachments support

### ✅ Ledger Account Management
- Create and manage chart of accounts
- Hierarchical account structure
- Account types: Asset, Liability, Equity, Revenue, Expense
- Real-time balance tracking
- Account activation/deactivation

### ✅ Transaction Processing
- Record transfers between accounts
- Multiple transaction types
- Transaction reversal capability
- Real-time balance updates
- Transaction history tracking

### ✅ Financial Reporting
- **Profit & Loss Report**: Revenue vs expenses analysis
- **Balance Sheet**: Assets, liabilities, and equity overview
- **Cash Flow Report**: Cash inflows and outflows tracking
- **Trial Balance**: Account balance verification
- **Account Statements**: Individual account transaction history
- **Financial Summary**: Dashboard with key metrics

### ✅ Security & Access Control
- JWT authentication required
- Role-based access (Admin & CompanyAdmin only)
- Company data isolation
- Input validation and sanitization
- Rate limiting protection

## 🏗️ Architecture

### Models
- **IncomeExpense**: Income and expense entries
- **Ledger**: Chart of accounts
- **Transaction**: Account transfers and adjustments

### Controllers
- **accountingController**: Core accounting operations
- **accountingReportsController**: Financial reporting

### Services
- **accountingService**: Business logic layer

### Middleware
- **accountingValidation**: Input validation
- **auth**: Authentication and authorization

## 📚 API Endpoints

### Income & Expense Management
```
POST   /api/admin/accounting/income          # Add income
POST   /api/admin/accounting/expense         # Add expense
GET    /api/admin/accounting/entries         # Get all entries
GET    /api/admin/accounting/entries/:id     # Get entry by ID
PUT    /api/admin/accounting/entries/:id     # Update entry
DELETE /api/admin/accounting/entries/:id     # Delete entry
POST   /api/admin/accounting/entries/:id/approve  # Approve entry
POST   /api/admin/accounting/entries/:id/reject   # Reject entry
```

### Ledger Account Management
```
POST   /api/admin/accounting/ledger          # Create account
GET    /api/admin/accounting/ledger          # Get all accounts
GET    /api/admin/accounting/ledger/:id      # Get account by ID
PUT    /api/admin/accounting/ledger/:id      # Update account
DELETE /api/admin/accounting/ledger/:id      # Delete account
```

### Transaction Management
```
POST   /api/admin/accounting/transaction     # Create transaction
GET    /api/admin/accounting/transaction     # Get all transactions
GET    /api/admin/accounting/transaction/:id # Get transaction by ID
PUT    /api/admin/accounting/transaction/:id # Update transaction
DELETE /api/admin/accounting/transaction/:id # Delete transaction
POST   /api/admin/accounting/transaction/:id/reverse # Reverse transaction
```

### Financial Reports
```
GET    /api/admin/accounting/report/profit-loss      # P&L Report
GET    /api/admin/accounting/report/balance-sheet    # Balance Sheet
GET    /api/admin/accounting/report/cash-flow        # Cash Flow Report
GET    /api/admin/accounting/report/trial-balance    # Trial Balance
GET    /api/admin/accounting/report/account-statement/:id # Account Statement
GET    /api/admin/accounting/report/summary          # Financial Summary
```

## 🔧 Configuration

### Environment Variables
```env
# Database
MONGODB_URI=mongodb://localhost:27017/cripcocode_crm

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
CORS_CREDENTIALS=true
```

### Database Setup
The accounting system requires MongoDB with the following collections:
- `incomeexpenses` - Income and expense entries
- `ledgers` - Chart of accounts
- `transactions` - Account transactions

## 📖 Usage Examples

### 1. Create a Revenue Account
```bash
curl -X POST http://localhost:5000/api/admin/accounting/ledger \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Service Revenue",
    "code": "SERV-REV",
    "type": "revenue",
    "openingBalance": 0
  }'
```

### 2. Record Income
```bash
curl -X POST http://localhost:5000/api/admin/accounting/income \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15T10:30:00.000Z",
    "amount": 1500.00,
    "category": "Web Development",
    "description": "Payment for website project",
    "account": "ACCOUNT_ID_FROM_STEP_1"
  }'
```

### 3. Generate P&L Report
```bash
curl -X GET "http://localhost:5000/api/admin/accounting/report/profit-loss?from=2024-01-01&to=2024-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔍 Data Models

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
  paymentMethod: String,
  status: "pending" | "approved" | "rejected" | "cancelled",
  tags: [String],
  company: ObjectId (ref: Company),
  createdBy: ObjectId (ref: Admin),
  isRecurring: Boolean,
  recurringPattern: String,
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
  company: ObjectId (ref: Company),
  createdBy: ObjectId (ref: Admin)
}
```

## 🛡️ Security Features

- **JWT Authentication**: All endpoints require valid JWT token
- **Role-based Access**: Only Admin and CompanyAdmin roles allowed
- **Company Isolation**: Users can only access their company's data
- **Input Validation**: Comprehensive validation on all inputs
- **SQL Injection Prevention**: Mongoose ODM provides protection
- **Rate Limiting**: Prevents API abuse
- **CORS Protection**: Configurable cross-origin resource sharing

## 📊 Reporting Features

### Profit & Loss Report
- Revenue vs expenses analysis
- Category-wise breakdown
- Profit margin calculation
- Period-based filtering

### Balance Sheet
- Assets, liabilities, and equity overview
- Account-wise details
- Net worth calculation
- As-of-date reporting

### Cash Flow Report
- Cash inflows and outflows
- Category-wise analysis
- Opening and closing balances
- Net cash flow calculation

### Trial Balance
- Account balance verification
- Debit/credit balance check
- Balance validation
- As-of-date reporting

## 🔧 Development

### Prerequisites
- Node.js v16.0.0 or higher
- MongoDB v4.4 or higher
- JWT authentication setup

### Installation
```bash
# Install dependencies
npm install

# Setup accounting system
node scripts/setup-accounting.js

# Start development server
npm run dev
```

### Testing
```bash
# Run tests (if available)
npm test

# Test specific endpoint
curl -X GET http://localhost:5000/api/admin/accounting/ledger \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📚 Documentation

- **API Documentation**: [docs/accounting-api.md](docs/accounting-api.md)
- **Setup Guide**: [docs/installation.md](docs/installation.md)
- **Quick Start**: [docs/quickstart.md](docs/quickstart.md)

## 🚀 Deployment

### Production Setup
1. Set up MongoDB cluster
2. Configure environment variables
3. Set up JWT secrets
4. Configure CORS origins
5. Deploy application
6. Run accounting setup script

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cripcocode_crm
JWT_SECRET=very_long_random_string_at_least_32_characters
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
CORS_CREDENTIALS=true
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the [docs/](docs/) directory
- **Issues**: Create an issue on GitHub
- **Email**: dev@cripcocode.com

---

**Built with ❤️ for the CRIPCOCODE CRM Project**

*Last updated: January 2024*
*Version: 1.0.0*
