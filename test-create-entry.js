// Test Create Finance Entry API
const axios = require('axios');

const BASE_URL = 'http://localhost:3500';

// Test data
const testData = {
  // You'll need to get a valid SuperAdmin JWT token
  token: 'YOUR_SUPERADMIN_JWT_TOKEN_HERE',
  
  // Test income entry
  incomeEntry: {
    type: 'income',
    amount: 50000,
    description: 'Product Sales Revenue',
    date: '2024-01-15'
  },
  
  // Test expense entry
  expenseEntry: {
    type: 'expense',
    amount: 15000,
    description: 'Office Rent Payment',
    date: '2024-01-15'
  },
  
  // Test entry without date (should use current date)
  entryWithoutDate: {
    type: 'income',
    amount: 25000,
    description: 'Consulting Services'
  }
};

// Test functions
async function testCreateIncomeEntry() {
  console.log('🧪 Testing POST /api/admin/finance/entries - Income Entry...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/admin/finance/entries`, testData.incomeEntry, {
      headers: {
        'Authorization': `Bearer ${testData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Income Entry Created Successfully');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.data.data._id; // Return the created entry ID
    
  } catch (error) {
    console.log('❌ Income Entry Creation Failed');
    console.log('Error:', error.response?.data || error.message);
    return null;
  }
}

async function testCreateExpenseEntry() {
  console.log('\n🧪 Testing POST /api/admin/finance/entries - Expense Entry...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/admin/finance/entries`, testData.expenseEntry, {
      headers: {
        'Authorization': `Bearer ${testData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Expense Entry Created Successfully');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.data.data._id; // Return the created entry ID
    
  } catch (error) {
    console.log('❌ Expense Entry Creation Failed');
    console.log('Error:', error.response?.data || error.message);
    return null;
  }
}

async function testCreateEntryWithoutDate() {
  console.log('\n🧪 Testing POST /api/admin/finance/entries - Entry Without Date...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/admin/finance/entries`, testData.entryWithoutDate, {
      headers: {
        'Authorization': `Bearer ${testData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Entry Without Date Created Successfully');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.data.data._id; // Return the created entry ID
    
  } catch (error) {
    console.log('❌ Entry Without Date Creation Failed');
    console.log('Error:', error.response?.data || error.message);
    return null;
  }
}

async function testValidationErrors() {
  console.log('\n🧪 Testing Validation Errors...');
  
  // Test 1: Invalid type
  console.log('\n📝 Test 1: Invalid type');
  try {
    await axios.post(`${BASE_URL}/api/admin/finance/entries`, {
      type: 'invalid',
      amount: 1000,
      description: 'Test entry'
    }, {
      headers: {
        'Authorization': `Bearer ${testData.token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('❌ Should have failed but didn\'t');
  } catch (error) {
    console.log('✅ Validation error caught:', error.response?.data?.message);
  }
  
  // Test 2: Missing amount
  console.log('\n📝 Test 2: Missing amount');
  try {
    await axios.post(`${BASE_URL}/api/admin/finance/entries`, {
      type: 'income',
      description: 'Test entry'
    }, {
      headers: {
        'Authorization': `Bearer ${testData.token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('❌ Should have failed but didn\'t');
  } catch (error) {
    console.log('✅ Validation error caught:', error.response?.data?.message);
  }
  
  // Test 3: Missing description
  console.log('\n📝 Test 3: Missing description');
  try {
    await axios.post(`${BASE_URL}/api/admin/finance/entries`, {
      type: 'income',
      amount: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${testData.token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('❌ Should have failed but didn\'t');
  } catch (error) {
    console.log('✅ Validation error caught:', error.response?.data?.message);
  }
  
  // Test 4: Negative amount
  console.log('\n📝 Test 4: Negative amount');
  try {
    await axios.post(`${BASE_URL}/api/admin/finance/entries`, {
      type: 'income',
      amount: -1000,
      description: 'Test entry'
    }, {
      headers: {
        'Authorization': `Bearer ${testData.token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('❌ Should have failed but didn\'t');
  } catch (error) {
    console.log('✅ Validation error caught:', error.response?.data?.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Create Finance Entry API Tests...\n');
  console.log('⚠️  Note: You need to replace YOUR_SUPERADMIN_JWT_TOKEN_HERE with a valid token\n');
  
  // Test 1: Create income entry
  const incomeId = await testCreateIncomeEntry();
  
  // Test 2: Create expense entry
  const expenseId = await testCreateExpenseEntry();
  
  // Test 3: Create entry without date
  const noDateId = await testCreateEntryWithoutDate();
  
  // Test 4: Test validation errors
  await testValidationErrors();
  
  console.log('\n🏁 Create Finance Entry API Tests Completed!');
  console.log('\n📊 Created Entry IDs:');
  console.log('Income Entry ID:', incomeId);
  console.log('Expense Entry ID:', expenseId);
  console.log('No Date Entry ID:', noDateId);
}

// Run tests
runTests().catch(console.error);
