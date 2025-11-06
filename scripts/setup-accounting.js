#!/usr/bin/env node

/**
 * Accounting System Setup Script
 * This script initializes the accounting system with basic ledger accounts
 */

const mongoose = require('mongoose');
const config = require('../env');
const Ledger = require('../models/Ledger');
const Admin = require('../models/Admin');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create basic ledger accounts
const createBasicAccounts = async (companyId, adminId) => {
  const basicAccounts = [
    // Assets
    { name: 'Cash Account', code: 'CASH-001', type: 'asset', subType: 'Current Assets', openingBalance: 0 },
    { name: 'Bank Account', code: 'BANK-001', type: 'asset', subType: 'Current Assets', openingBalance: 0 },
    { name: 'Accounts Receivable', code: 'AR-001', type: 'asset', subType: 'Current Assets', openingBalance: 0 },
    { name: 'Equipment', code: 'EQUIP-001', type: 'asset', subType: 'Fixed Assets', openingBalance: 0 },
    { name: 'Office Furniture', code: 'FURN-001', type: 'asset', subType: 'Fixed Assets', openingBalance: 0 },
    
    // Liabilities
    { name: 'Accounts Payable', code: 'AP-001', type: 'liability', subType: 'Current Liabilities', openingBalance: 0 },
    { name: 'Accrued Expenses', code: 'ACC-001', type: 'liability', subType: 'Current Liabilities', openingBalance: 0 },
    { name: 'Long-term Debt', code: 'LTD-001', type: 'liability', subType: 'Long-term Liabilities', openingBalance: 0 },
    
    // Equity
    { name: 'Owner\'s Equity', code: 'OE-001', type: 'equity', subType: 'Owner\'s Capital', openingBalance: 0 },
    { name: 'Retained Earnings', code: 'RE-001', type: 'equity', subType: 'Retained Earnings', openingBalance: 0 },
    
    // Revenue
    { name: 'Service Revenue', code: 'SERV-REV', type: 'revenue', subType: 'Service Income', openingBalance: 0 },
    { name: 'Product Sales', code: 'PROD-REV', type: 'revenue', subType: 'Product Income', openingBalance: 0 },
    { name: 'Other Income', code: 'OTH-REV', type: 'revenue', subType: 'Other Income', openingBalance: 0 },
    
    // Expenses
    { name: 'Office Rent', code: 'RENT-EXP', type: 'expense', subType: 'Operating Expenses', openingBalance: 0 },
    { name: 'Salaries & Wages', code: 'SAL-EXP', type: 'expense', subType: 'Operating Expenses', openingBalance: 0 },
    { name: 'Office Supplies', code: 'SUPP-EXP', type: 'expense', subType: 'Operating Expenses', openingBalance: 0 },
    { name: 'Utilities', code: 'UTIL-EXP', type: 'expense', subType: 'Operating Expenses', openingBalance: 0 },
    { name: 'Marketing', code: 'MKT-EXP', type: 'expense', subType: 'Operating Expenses', openingBalance: 0 },
    { name: 'Professional Services', code: 'PROF-EXP', type: 'expense', subType: 'Operating Expenses', openingBalance: 0 },
    { name: 'Travel & Entertainment', code: 'TRAVEL-EXP', type: 'expense', subType: 'Operating Expenses', openingBalance: 0 },
    { name: 'Insurance', code: 'INS-EXP', type: 'expense', subType: 'Operating Expenses', openingBalance: 0 },
    { name: 'Depreciation', code: 'DEP-EXP', type: 'expense', subType: 'Operating Expenses', openingBalance: 0 },
    { name: 'Other Expenses', code: 'OTH-EXP', type: 'expense', subType: 'Operating Expenses', openingBalance: 0 }
  ];

  console.log('📊 Creating basic ledger accounts...');
  
  for (const accountData of basicAccounts) {
    try {
      const account = new Ledger({
        ...accountData,
        company: companyId,
        createdBy: adminId,
        currency: 'USD'
      });
      
      await account.save();
      console.log(`✅ Created account: ${account.name} (${account.code})`);
    } catch (error) {
      if (error.code === 11000) {
        console.log(`⚠️  Account ${accountData.code} already exists, skipping...`);
      } else {
        console.error(`❌ Error creating account ${accountData.name}:`, error.message);
      }
    }
  }
  
  console.log('✅ Basic ledger accounts created successfully');
};

// Main setup function
const setupAccounting = async () => {
  try {
    console.log('🚀 Starting Accounting System Setup...\n');
    
    // Connect to database
    await connectDB();
    
    // Get the first admin user (assuming superAdmin exists)
    const admin = await Admin.findOne({ role: 'superAdmin', isActive: true });
    if (!admin) {
      console.error('❌ No superAdmin found. Please create a superAdmin user first.');
      process.exit(1);
    }
    
    console.log(`👤 Found admin: ${admin.username} (${admin.email})`);
    
    // Get company ID from admin
    const companyId = admin.company;
    if (!companyId) {
      console.error('❌ Admin is not associated with any company.');
      process.exit(1);
    }
    
    console.log(`🏢 Company ID: ${companyId}`);
    
    // Create basic accounts
    await createBasicAccounts(companyId, admin._id);
    
    console.log('\n🎉 Accounting System Setup Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Start your server: npm run dev');
    console.log('2. Test the API endpoints using the documentation');
    console.log('3. Create your first income/expense entries');
    console.log('4. Generate financial reports');
    
    console.log('\n📚 API Documentation:');
    console.log('- Base URL: /api/admin/accounting');
    console.log('- Documentation: docs/accounting-api.md');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run setup if called directly
if (require.main === module) {
  setupAccounting();
}

module.exports = { setupAccounting, createBasicAccounts };
