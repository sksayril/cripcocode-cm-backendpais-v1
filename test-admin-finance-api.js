const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3500/api/admin/finance';
const JWT_TOKEN = 'YOUR_JWT_TOKEN'; // Replace with actual JWT token for Admin, CompanyAdmin, or SuperAdmin

// Helper function to make requests
async function makeRequest(method, endpoint, data = null, params = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params: Object.keys(params).length > 0 ? params : undefined,
      data: data ? JSON.stringify(data) : undefined
    };

    const response = await axios(config);
    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 500,
      data: error.response?.data || { message: error.message }
    };
  }
}

// Test functions
async function testGetAllEntries() {
  console.log('\n📊 Testing GET /entries (All Entries)');
  console.log('=' .repeat(50));
  
  const result = await makeRequest('GET', '/entries');
  console.log('Status:', result.status);
  console.log('Success:', result.success);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  return result;
}

async function testGetEntriesWithFilters() {
  console.log('\n🔍 Testing GET /entries (With Filters)');
  console.log('=' .repeat(50));
  
  const filters = {
    type: 'income',
    page: 1,
    limit: 5,
    category: 'Sales'
  };
  
  const result = await makeRequest('GET', '/entries', null, filters);
  console.log('Status:', result.status);
  console.log('Success:', result.success);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  return result;
}

async function testCreateIncomeEntry() {
  console.log('\n➕ Testing POST /entries (Create Income)');
  console.log('=' .repeat(50));
  
  const entryData = {
    type: 'income',
    amount: 75000,
    currency: 'INR',
    description: 'Admin Test Income Entry',
    category: 'Test Sales',
    incomeSource: 'Test Product Sales',
    paymentMethod: 'bank_transfer',
    paymentReference: 'ADMIN_TEST_001',
    date: new Date().toISOString(),
    tags: ['test', 'admin', 'income'],
    notes: 'Test entry created by admin user'
  };
  
  const result = await makeRequest('POST', '/entries', entryData);
  console.log('Status:', result.status);
  console.log('Success:', result.success);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  return result;
}

async function testCreateExpenseEntry() {
  console.log('\n➕ Testing POST /entries (Create Expense)');
  console.log('=' .repeat(50));
  
  const entryData = {
    type: 'expense',
    amount: 25000,
    currency: 'INR',
    description: 'Admin Test Expense Entry',
    category: 'Test Operations',
    expenseType: 'operational',
    paymentMethod: 'card',
    paymentReference: 'ADMIN_EXP_001',
    date: new Date().toISOString(),
    tags: ['test', 'admin', 'expense'],
    notes: 'Test expense entry created by admin user'
  };
  
  const result = await makeRequest('POST', '/entries', entryData);
  console.log('Status:', result.status);
  console.log('Success:', result.success);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  return result;
}

async function testGetEntryById(entryId) {
  console.log('\n🔍 Testing GET /entries/:id');
  console.log('=' .repeat(50));
  
  const result = await makeRequest('GET', `/entries/${entryId}`);
  console.log('Status:', result.status);
  console.log('Success:', result.success);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  return result;
}

async function testUpdateEntry(entryId) {
  console.log('\n✏️ Testing PUT /entries/:id (Update)');
  console.log('=' .repeat(50));
  
  const updateData = {
    amount: 80000,
    description: 'Updated Admin Test Income Entry',
    notes: 'Updated by admin user - amount increased'
  };
  
  const result = await makeRequest('PUT', `/entries/${entryId}`, updateData);
  console.log('Status:', result.status);
  console.log('Success:', result.success);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  return result;
}

async function testGetStatistics() {
  console.log('\n📊 Testing GET /statistics');
  console.log('=' .repeat(50));
  
  const result = await makeRequest('GET', '/statistics');
  console.log('Status:', result.status);
  console.log('Success:', result.success);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  return result;
}

async function testGetStatisticsWithFilters() {
  console.log('\n📊 Testing GET /statistics (With Filters)');
  console.log('=' .repeat(50));
  
  const filters = {
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    type: 'income'
  };
  
  const result = await makeRequest('GET', '/statistics', null, filters);
  console.log('Status:', result.status);
  console.log('Success:', result.success);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  return result;
}

async function testDeleteEntry(entryId) {
  console.log('\n🗑️ Testing DELETE /entries/:id');
  console.log('=' .repeat(50));
  
  const result = await makeRequest('DELETE', `/entries/${entryId}`);
  console.log('Status:', result.status);
  console.log('Success:', result.success);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  return result;
}

async function testErrorScenarios() {
  console.log('\n❌ Testing Error Scenarios');
  console.log('=' .repeat(50));
  
  // Test 1: No authentication
  console.log('\n1. Testing without authentication...');
  try {
    await axios.get(`${BASE_URL}/entries`);
  } catch (error) {
    console.log('Expected error:', error.response?.status, error.response?.data?.message);
  }
  
  // Test 2: Invalid entry ID
  console.log('\n2. Testing with invalid entry ID...');
  const invalidIdResult = await makeRequest('GET', '/entries/invalid_id');
  console.log('Status:', invalidIdResult.status);
  console.log('Response:', JSON.stringify(invalidIdResult.data, null, 2));
  
  // Test 3: Invalid request body
  console.log('\n3. Testing with invalid request body...');
  const invalidBodyResult = await makeRequest('POST', '/entries', {
    amount: -1000, // Invalid amount
    type: 'invalid_type' // Invalid type
  });
  console.log('Status:', invalidBodyResult.status);
  console.log('Response:', JSON.stringify(invalidBodyResult.data, null, 2));
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Admin Finance API Tests');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: Get all entries
    await testGetAllEntries();
    
    // Test 2: Get entries with filters
    await testGetEntriesWithFilters();
    
    // Test 3: Create income entry
    const incomeResult = await testCreateIncomeEntry();
    const incomeEntryId = incomeResult.success && incomeResult.data?.data?.entry?._id;
    
    // Test 4: Create expense entry
    const expenseResult = await testCreateExpenseEntry();
    const expenseEntryId = expenseResult.success && expenseResult.data?.data?.entry?._id;
    
    // Test 5: Get entry by ID (if we have an ID)
    if (incomeEntryId) {
      await testGetEntryById(incomeEntryId);
    }
    
    // Test 6: Update entry (if we have an ID)
    if (incomeEntryId) {
      await testUpdateEntry(incomeEntryId);
    }
    
    // Test 7: Get statistics
    await testGetStatistics();
    
    // Test 8: Get statistics with filters
    await testGetStatisticsWithFilters();
    
    // Test 9: Error scenarios
    await testErrorScenarios();
    
    // Test 10: Delete entry (if we have an ID)
    if (incomeEntryId) {
      await testDeleteEntry(incomeEntryId);
    }
    
    console.log('\n✅ All tests completed!');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testGetAllEntries,
  testGetEntriesWithFilters,
  testCreateIncomeEntry,
  testCreateExpenseEntry,
  testGetEntryById,
  testUpdateEntry,
  testGetStatistics,
  testGetStatisticsWithFilters,
  testDeleteEntry,
  testErrorScenarios,
  runAllTests
};
