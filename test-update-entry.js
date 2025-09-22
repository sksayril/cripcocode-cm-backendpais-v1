// Test Update Finance Entry API
const axios = require('axios');

const BASE_URL = 'http://localhost:3500';

// Test data
const testData = {
  // You'll need to get a valid SuperAdmin JWT token
  token: 'YOUR_SUPERADMIN_JWT_TOKEN_HERE',
  
  // Test entry ID (you'll need to create an entry first and get its ID)
  entryId: 'YOUR_ENTRY_ID_HERE',
  
  // Test update data
  updateData: {
    // Update all fields
    updateAll: {
      type: 'expense',
      amount: 25000,
      description: 'Updated Office Rent Payment',
      date: '2024-01-20'
    },
    
    // Update only amount
    updateAmount: {
      amount: 30000
    },
    
    // Update only description
    updateDescription: {
      description: 'Updated Product Sales Revenue - Q1 2024'
    },
    
    // Update only type
    updateType: {
      type: 'income'
    },
    
    // Update only date
    updateDate: {
      date: '2024-02-01'
    }
  }
};

// Test functions
async function testUpdateAllFields() {
  console.log('🧪 Testing PUT /api/admin/finance/entries/:id - Update All Fields...');
  
  try {
    const response = await axios.put(`${BASE_URL}/api/admin/finance/entries/${testData.entryId}`, testData.updateData.updateAll, {
      headers: {
        'Authorization': `Bearer ${testData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ All Fields Updated Successfully');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Update All Fields Failed');
    console.log('Error:', error.response?.data || error.message);
  }
}

async function testUpdateAmount() {
  console.log('\n🧪 Testing PUT /api/admin/finance/entries/:id - Update Amount Only...');
  
  try {
    const response = await axios.put(`${BASE_URL}/api/admin/finance/entries/${testData.entryId}`, testData.updateData.updateAmount, {
      headers: {
        'Authorization': `Bearer ${testData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Amount Updated Successfully');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Update Amount Failed');
    console.log('Error:', error.response?.data || error.message);
  }
}

async function testUpdateDescription() {
  console.log('\n🧪 Testing PUT /api/admin/finance/entries/:id - Update Description Only...');
  
  try {
    const response = await axios.put(`${BASE_URL}/api/admin/finance/entries/${testData.entryId}`, testData.updateData.updateDescription, {
      headers: {
        'Authorization': `Bearer ${testData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Description Updated Successfully');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Update Description Failed');
    console.log('Error:', error.response?.data || error.message);
  }
}

async function testUpdateType() {
  console.log('\n🧪 Testing PUT /api/admin/finance/entries/:id - Update Type Only...');
  
  try {
    const response = await axios.put(`${BASE_URL}/api/admin/finance/entries/${testData.entryId}`, testData.updateData.updateType, {
      headers: {
        'Authorization': `Bearer ${testData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Type Updated Successfully');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Update Type Failed');
    console.log('Error:', error.response?.data || error.message);
  }
}

async function testUpdateDate() {
  console.log('\n🧪 Testing PUT /api/admin/finance/entries/:id - Update Date Only...');
  
  try {
    const response = await axios.put(`${BASE_URL}/api/admin/finance/entries/${testData.entryId}`, testData.updateData.updateDate, {
      headers: {
        'Authorization': `Bearer ${testData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Date Updated Successfully');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Update Date Failed');
    console.log('Error:', error.response?.data || error.message);
  }
}

async function testValidationErrors() {
  console.log('\n🧪 Testing Validation Errors...');
  
  // Test 1: Invalid type
  console.log('\n📝 Test 1: Invalid type');
  try {
    await axios.put(`${BASE_URL}/api/admin/finance/entries/${testData.entryId}`, {
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
    await axios.put(`${BASE_URL}/api/admin/finance/entries/${testData.entryId}`, {
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
  
  // Test 3: Empty description
  console.log('\n📝 Test 3: Empty description');
  try {
    await axios.put(`${BASE_URL}/api/admin/finance/entries/${testData.entryId}`, {
      description: ''
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
  
  // Test 4: Invalid date format
  console.log('\n📝 Test 4: Invalid date format');
  try {
    await axios.put(`${BASE_URL}/api/admin/finance/entries/${testData.entryId}`, {
      date: 'invalid-date'
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

async function testNotFoundError() {
  console.log('\n🧪 Testing Not Found Error...');
  
  try {
    await axios.put(`${BASE_URL}/api/admin/finance/entries/507f1f77bcf86cd799439011`, {
      amount: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${testData.token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('❌ Should have failed but didn\'t');
  } catch (error) {
    console.log('✅ Not found error caught:', error.response?.data?.message);
  }
}

async function testUnauthorizedAccess() {
  console.log('\n🧪 Testing Unauthorized Access...');
  
  try {
    await axios.put(`${BASE_URL}/api/admin/finance/entries/${testData.entryId}`, {
      amount: 1000
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('❌ Should have failed but didn\'t');
  } catch (error) {
    console.log('✅ Unauthorized error caught:', error.response?.data?.message);
  }
}

// Helper function to create a test entry first
async function createTestEntry() {
  console.log('🔧 Creating test entry for update tests...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/admin/finance/entries`, {
      type: 'income',
      amount: 10000,
      description: 'Test Entry for Update',
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
  console.log('🚀 Starting Update Finance Entry API Tests...\n');
  console.log('⚠️  Note: You need to replace YOUR_SUPERADMIN_JWT_TOKEN_HERE with a valid token\n');
  
  // Create a test entry first
  const testEntryId = await createTestEntry();
  
  if (!testEntryId) {
    console.log('❌ Cannot proceed with tests without a test entry. Please create one manually.');
    return;
  }
  
  // Update the test data with the created entry ID
  testData.entryId = testEntryId;
  
  // Test 1: Update all fields
  await testUpdateAllFields();
  
  // Test 2: Update amount only
  await testUpdateAmount();
  
  // Test 3: Update description only
  await testUpdateDescription();
  
  // Test 4: Update type only
  await testUpdateType();
  
  // Test 5: Update date only
  await testUpdateDate();
  
  // Test 6: Test validation errors
  await testValidationErrors();
  
  // Test 7: Test not found error
  await testNotFoundError();
  
  // Test 8: Test unauthorized access
  await testUnauthorizedAccess();
  
  console.log('\n🏁 Update Finance Entry API Tests Completed!');
}

// Run tests
runTests().catch(console.error);
