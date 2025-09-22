// Test POST Update Finance Entry API
const axios = require('axios');

const BASE_URL = 'http://localhost:3500';

// Test data
const testData = {
  // You'll need to get a valid SuperAdmin JWT token
  token: 'YOUR_SUPERADMIN_JWT_TOKEN_HERE',
  
  // Test entry ID (you'll need to create an entry first and get its ID)
  entryId: '68d11045380b4e78ee31c113',
  
  // Test update data
  updateData: {
    amount: 55000,
    description: 'Updated Product Sales Revenue'
  }
};

// Test functions
async function testPostUpdateEntry() {
  console.log('🧪 Testing POST /api/admin/finance/entries/:id - Update Entry...');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/api/admin/finance/entries/${testData.entryId}`,
      testData.updateData,
      {
        headers: {
          'Authorization': `Bearer ${testData.token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Entry Updated Successfully via POST');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ POST Update Failed');
    console.log('Error:', error.response?.data || error.message);
  }
}

async function testPostUpdateWithAllFields() {
  console.log('\n🧪 Testing POST /api/admin/finance/entries/:id - Update All Fields...');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/api/admin/finance/entries/${testData.entryId}`,
      {
        type: 'expense',
        amount: 25000,
        description: 'Updated Office Rent Payment',
        date: '2024-01-20'
      },
      {
        headers: {
          'Authorization': `Bearer ${testData.token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ All Fields Updated Successfully via POST');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ POST Update All Fields Failed');
    console.log('Error:', error.response?.data || error.message);
  }
}

async function testPostUpdateValidationErrors() {
  console.log('\n🧪 Testing POST /api/admin/finance/entries/:id - Validation Errors...');
  
  // Test 1: Invalid type
  console.log('\n📝 Test 1: Invalid type');
  try {
    await axios.post(`${BASE_URL}/api/admin/finance/entries/${testData.entryId}`, {
      type: 'invalid'
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
  
  // Test 2: Negative amount
  console.log('\n📝 Test 2: Negative amount');
  try {
    await axios.post(`${BASE_URL}/api/admin/finance/entries/${testData.entryId}`, {
      amount: -1000
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

// Helper function to create a test entry first
async function createTestEntry() {
  console.log('🔧 Creating test entry for update tests...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/admin/finance/entries`, {
      type: 'income',
      amount: 10000,
      description: 'Test Entry for POST Update',
      date: '2024-01-15'
    }, {
      headers: {
        'Authorization': `Bearer ${testData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Test entry created successfully');
    console.log('Entry ID:', response.data.data._id);
    return response.data.data._id;
    
  } catch (error) {
    console.log('❌ Failed to create test entry');
    console.log('Error:', error.response?.data || error.message);
    return null;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting POST Update Finance Entry API Tests...\n');
  console.log('⚠️  Note: You need to replace YOUR_SUPERADMIN_JWT_TOKEN_HERE with a valid token\n');
  
  // Create a test entry first
  const testEntryId = await createTestEntry();
  
  if (!testEntryId) {
    console.log('❌ Cannot proceed with tests without a test entry. Please create one manually.');
    return;
  }
  
  // Update the test data with the created entry ID
  testData.entryId = testEntryId;
  
  // Test 1: Update entry via POST
  await testPostUpdateEntry();
  
  // Test 2: Update all fields via POST
  await testPostUpdateWithAllFields();
  
  // Test 3: Test validation errors
  await testPostUpdateValidationErrors();
  
  console.log('\n🏁 POST Update Finance Entry API Tests Completed!');
}

// Run tests
runTests().catch(console.error);
