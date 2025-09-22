// Test Finance API Endpoint
const axios = require('axios');

const BASE_URL = 'http://localhost:3500';

// Test data
const testData = {
  // You'll need to get a valid SuperAdmin JWT token
  token: 'YOUR_SUPERADMIN_JWT_TOKEN_HERE',
  
  // Test finance entry
  testEntry: {
    type: 'income',
    amount: 50000,
    currency: 'INR',
    description: 'Test income entry for API testing',
    category: 'Sales',
    incomeSource: 'Product Sales',
    paymentMethod: 'bank_transfer',
    paymentReference: 'TXN123456789',
    tags: ['test', 'api'],
    notes: 'This is a test entry created via API'
  }
};

// Test functions
async function testGetEntries() {
  console.log('🧪 Testing GET /api/admin/finance/entries...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/finance/entries`, {
      headers: {
        'Authorization': `Bearer ${testData.token}`,
        'Content-Type': 'application/json'
      },
      params: {
        type: 'income',
        page: 1,
        limit: 10
      }
    });
    
    console.log('✅ GET /api/admin/finance/entries - SUCCESS');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ GET /api/admin/finance/entries - FAILED');
    console.log('Error:', error.response?.data || error.message);
  }
}

async function testCreateEntry() {
  console.log('\n🧪 Testing POST /api/admin/finance/entries...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/admin/finance/entries`, testData.testEntry, {
      headers: {
        'Authorization': `Bearer ${testData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ POST /api/admin/finance/entries - SUCCESS');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.data.data.entry._id; // Return the created entry ID
    
  } catch (error) {
    console.log('❌ POST /api/admin/finance/entries - FAILED');
    console.log('Error:', error.response?.data || error.message);
    return null;
  }
}

async function testGetEntryById(entryId) {
  if (!entryId) {
    console.log('\n⏭️  Skipping GET /api/admin/finance/entries/:id (no entry ID)');
    return;
  }
  
  console.log(`\n🧪 Testing GET /api/admin/finance/entries/${entryId}...`);
  
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/finance/entries/${entryId}`, {
      headers: {
        'Authorization': `Bearer ${testData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ GET /api/admin/finance/entries/:id - SUCCESS');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ GET /api/admin/finance/entries/:id - FAILED');
    console.log('Error:', error.response?.data || error.message);
  }
}

async function testGetStatistics() {
  console.log('\n🧪 Testing GET /api/admin/finance/statistics...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/finance/statistics`, {
      headers: {
        'Authorization': `Bearer ${testData.token}`,
        'Content-Type': 'application/json'
      },
      params: {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      }
    });
    
    console.log('✅ GET /api/admin/finance/statistics - SUCCESS');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ GET /api/admin/finance/statistics - FAILED');
    console.log('Error:', error.response?.data || error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Finance API Tests...\n');
  console.log('⚠️  Note: You need to replace YOUR_SUPERADMIN_JWT_TOKEN_HERE with a valid token\n');
  
  // Test 1: Get entries
  await testGetEntries();
  
  // Test 2: Create entry
  const entryId = await testCreateEntry();
  
  // Test 3: Get entry by ID
  await testGetEntryById(entryId);
  
  // Test 4: Get statistics
  await testGetStatistics();
  
  console.log('\n🏁 Finance API Tests Completed!');
}

// Run tests
runTests().catch(console.error);
