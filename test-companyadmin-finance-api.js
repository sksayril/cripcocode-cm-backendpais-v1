const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3500/api/admin/finance';
const JWT_TOKEN = 'YOUR_COMPANYADMIN_JWT_TOKEN'; // Replace with actual CompanyAdmin JWT token

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
async function testCompanyAdminAccess() {
  console.log('\n🏢 Testing CompanyAdmin Access to Finance API');
  console.log('=' .repeat(60));
  
  // Test 1: Get all entries
  console.log('\n1. Testing GET /entries (CompanyAdmin Access)');
  const getResult = await makeRequest('GET', '/entries');
  console.log('Status:', getResult.status);
  console.log('Success:', getResult.success);
  if (getResult.success) {
    console.log('✅ CompanyAdmin can access finance entries');
    console.log('Total entries:', getResult.data?.data?.pagination?.totalEntries || 0);
  } else {
    console.log('❌ CompanyAdmin access denied:', getResult.data?.message);
  }
  
  return getResult;
}

async function testCreateEntryAsCompanyAdmin() {
  console.log('\n➕ Testing POST /entries (CompanyAdmin Create)');
  console.log('=' .repeat(50));
  
  const entryData = {
    type: 'income',
    amount: 100000,
    currency: 'INR',
    description: 'CompanyAdmin Test Income Entry',
    category: 'Company Revenue',
    incomeSource: 'Company Services',
    paymentMethod: 'bank_transfer',
    paymentReference: 'COMPANYADMIN_001',
    date: new Date().toISOString(),
    tags: ['companyadmin', 'test', 'income'],
    notes: 'Test entry created by CompanyAdmin user'
  };
  
  const result = await makeRequest('POST', '/entries', entryData);
  console.log('Status:', result.status);
  console.log('Success:', result.success);
  if (result.success) {
    console.log('✅ CompanyAdmin can create finance entries');
    console.log('Created entry ID:', result.data?.data?.entry?._id);
  } else {
    console.log('❌ CompanyAdmin create failed:', result.data?.message);
  }
  
  return result;
}

async function testUpdateEntryAsCompanyAdmin(entryId) {
  console.log('\n✏️ Testing PUT /entries/:id (CompanyAdmin Update)');
  console.log('=' .repeat(50));
  
  const updateData = {
    amount: 120000,
    description: 'Updated by CompanyAdmin',
    notes: 'Updated by CompanyAdmin user - amount increased'
  };
  
  const result = await makeRequest('PUT', `/entries/${entryId}`, updateData);
  console.log('Status:', result.status);
  console.log('Success:', result.success);
  if (result.success) {
    console.log('✅ CompanyAdmin can update finance entries');
    console.log('Updated amount:', result.data?.data?.entry?.amount);
  } else {
    console.log('❌ CompanyAdmin update failed:', result.data?.message);
  }
  
  return result;
}

async function testDeleteEntryAsCompanyAdmin(entryId) {
  console.log('\n🗑️ Testing DELETE /entries/:id (CompanyAdmin Delete)');
  console.log('=' .repeat(50));
  
  const result = await makeRequest('DELETE', `/entries/${entryId}`);
  console.log('Status:', result.status);
  console.log('Success:', result.success);
  if (result.success) {
    console.log('✅ CompanyAdmin can delete finance entries');
    console.log('Deleted entry ID:', result.data?.data?.deletedEntry?._id);
  } else {
    console.log('❌ CompanyAdmin delete failed:', result.data?.message);
  }
  
  return result;
}

async function testGetStatisticsAsCompanyAdmin() {
  console.log('\n📊 Testing GET /statistics (CompanyAdmin Access)');
  console.log('=' .repeat(50));
  
  const result = await makeRequest('GET', '/statistics');
  console.log('Status:', result.status);
  console.log('Success:', result.success);
  if (result.success) {
    console.log('✅ CompanyAdmin can access finance statistics');
    const summary = result.data?.data?.summary;
    if (summary) {
      console.log('Total Income:', summary.totalIncome);
      console.log('Total Expense:', summary.totalExpense);
      console.log('Net Profit:', summary.netProfit);
    }
  } else {
    console.log('❌ CompanyAdmin statistics access denied:', result.data?.message);
  }
  
  return result;
}

async function testFilteringAsCompanyAdmin() {
  console.log('\n🔍 Testing Filtering (CompanyAdmin Access)');
  console.log('=' .repeat(50));
  
  // Test income filter
  console.log('\nTesting income filter...');
  const incomeResult = await makeRequest('GET', '/entries', null, { type: 'income' });
  console.log('Income entries:', incomeResult.success ? '✅' : '❌');
  
  // Test expense filter
  console.log('\nTesting expense filter...');
  const expenseResult = await makeRequest('GET', '/entries', null, { type: 'expense' });
  console.log('Expense entries:', expenseResult.success ? '✅' : '❌');
  
  // Test pagination
  console.log('\nTesting pagination...');
  const paginationResult = await makeRequest('GET', '/entries', null, { page: 1, limit: 5 });
  console.log('Pagination:', paginationResult.success ? '✅' : '❌');
  
  return { incomeResult, expenseResult, paginationResult };
}

async function testErrorHandlingAsCompanyAdmin() {
  console.log('\n❌ Testing Error Handling (CompanyAdmin)');
  console.log('=' .repeat(50));
  
  // Test invalid entry ID
  console.log('\nTesting invalid entry ID...');
  const invalidIdResult = await makeRequest('GET', '/entries/invalid_id');
  console.log('Invalid ID handling:', invalidIdResult.status === 400 ? '✅' : '❌');
  
  // Test invalid request body
  console.log('\nTesting invalid request body...');
  const invalidBodyResult = await makeRequest('POST', '/entries', {
    amount: -1000, // Invalid amount
    type: 'invalid_type' // Invalid type
  });
  console.log('Invalid body handling:', invalidBodyResult.status === 400 ? '✅' : '❌');
  
  return { invalidIdResult, invalidBodyResult };
}

// Main test runner
async function runCompanyAdminTests() {
  console.log('🏢 Starting CompanyAdmin Finance API Tests');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: Basic access
    await testCompanyAdminAccess();
    
    // Test 2: Create entry
    const createResult = await testCreateEntryAsCompanyAdmin();
    const entryId = createResult.success && createResult.data?.data?.entry?._id;
    
    // Test 3: Update entry (if created successfully)
    if (entryId) {
      await testUpdateEntryAsCompanyAdmin(entryId);
    }
    
    // Test 4: Get statistics
    await testGetStatisticsAsCompanyAdmin();
    
    // Test 5: Filtering and pagination
    await testFilteringAsCompanyAdmin();
    
    // Test 6: Error handling
    await testErrorHandlingAsCompanyAdmin();
    
    // Test 7: Delete entry (if created successfully)
    if (entryId) {
      await testDeleteEntryAsCompanyAdmin(entryId);
    }
    
    console.log('\n✅ All CompanyAdmin tests completed!');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('\n❌ CompanyAdmin test execution failed:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runCompanyAdminTests();
}

module.exports = {
  testCompanyAdminAccess,
  testCreateEntryAsCompanyAdmin,
  testUpdateEntryAsCompanyAdmin,
  testDeleteEntryAsCompanyAdmin,
  testGetStatisticsAsCompanyAdmin,
  testFilteringAsCompanyAdmin,
  testErrorHandlingAsCompanyAdmin,
  runCompanyAdminTests
};
