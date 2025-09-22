// Test Delete Finance Entry API
const axios = require('axios');

const BASE_URL = 'http://localhost:3500';

// Test data
const testData = {
  // You'll need to get a valid SuperAdmin JWT token
  token: 'YOUR_SUPERADMIN_JWT_TOKEN_HERE',
  
  // Test entry ID (you'll need to create an entry first and get its ID)
  entryId: 'YOUR_ENTRY_ID_HERE',
  
  // Invalid entry ID for testing not found error
  invalidEntryId: '507f1f77bcf86cd799439011'
};

// Test functions
async function testDeleteEntry() {
  console.log('🧪 Testing DELETE /api/admin/finance/entries/:id - Delete Entry...');
  
  try {
    const response = await axios.delete(`${BASE_URL}/api/admin/finance/entries/${testData.entryId}`, {
      headers: {
        'Authorization': `Bearer ${testData.token}`
      }
    });
    
    console.log('✅ Entry Deleted Successfully');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Delete Entry Failed');
    console.log('Error:', error.response?.data || error.message);
  }
}

async function testDeleteNonExistentEntry() {
  console.log('\n🧪 Testing DELETE /api/admin/finance/entries/:id - Delete Non-Existent Entry...');
  
  try {
    const response = await axios.delete(`${BASE_URL}/api/admin/finance/entries/${testData.invalidEntryId}`, {
      headers: {
        'Authorization': `Bearer ${testData.token}`
      }
    });
    
    console.log('❌ Should have failed but didn\'t');
    
  } catch (error) {
    console.log('✅ Not Found Error Caught Successfully');
    console.log('Error:', error.response?.data?.message);
  }
}

async function testDeleteWithoutToken() {
  console.log('\n🧪 Testing DELETE /api/admin/finance/entries/:id - Delete Without Token...');
  
  try {
    const response = await axios.delete(`${BASE_URL}/api/admin/finance/entries/${testData.entryId}`);
    
    console.log('❌ Should have failed but didn\'t');
    
  } catch (error) {
    console.log('✅ Unauthorized Error Caught Successfully');
    console.log('Error:', error.response?.data?.message);
  }
}

async function testDeleteWithInvalidToken() {
  console.log('\n🧪 Testing DELETE /api/admin/finance/entries/:id - Delete With Invalid Token...');
  
  try {
    const response = await axios.delete(`${BASE_URL}/api/admin/finance/entries/${testData.entryId}`, {
      headers: {
        'Authorization': 'Bearer invalid_token'
      }
    });
    
    console.log('❌ Should have failed but didn\'t');
    
  } catch (error) {
    console.log('✅ Invalid Token Error Caught Successfully');
    console.log('Error:', error.response?.data?.message);
  }
}

async function testDeleteWithInvalidId() {
  console.log('\n🧪 Testing DELETE /api/admin/finance/entries/:id - Delete With Invalid ID...');
  
  try {
    const response = await axios.delete(`${BASE_URL}/api/admin/finance/entries/invalid_id`, {
      headers: {
        'Authorization': `Bearer ${testData.token}`
      }
    });
    
    console.log('❌ Should have failed but didn\'t');
    
  } catch (error) {
    console.log('✅ Invalid ID Error Caught Successfully');
    console.log('Error:', error.response?.data?.message);
  }
}

async function testDeleteAlreadyDeletedEntry() {
  console.log('\n🧪 Testing DELETE /api/admin/finance/entries/:id - Delete Already Deleted Entry...');
  
  try {
    const response = await axios.delete(`${BASE_URL}/api/admin/finance/entries/${testData.entryId}`, {
      headers: {
        'Authorization': `Bearer ${testData.token}`
      }
    });
    
    console.log('❌ Should have failed but didn\'t');
    
  } catch (error) {
    console.log('✅ Already Deleted Error Caught Successfully');
    console.log('Error:', error.response?.data?.message);
  }
}

// Helper function to create a test entry first
async function createTestEntry() {
  console.log('🔧 Creating test entry for delete tests...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/admin/finance/entries`, {
      type: 'income',
      amount: 10000,
      description: 'Test Entry for Delete',
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

// Helper function to verify entry is deleted
async function verifyEntryDeleted(entryId) {
  console.log('\n🔍 Verifying entry is deleted...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/finance/entries/${entryId}`, {
      headers: {
        'Authorization': `Bearer ${testData.token}`
      }
    });
    
    console.log('❌ Entry still exists (should be deleted)');
    
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ Entry successfully deleted (404 Not Found)');
    } else {
      console.log('⚠️  Unexpected error:', error.response?.data?.message);
    }
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Delete Finance Entry API Tests...\n');
  console.log('⚠️  Note: You need to replace YOUR_SUPERADMIN_JWT_TOKEN_HERE with a valid token\n');
  
  // Create a test entry first
  const testEntryId = await createTestEntry();
  
  if (!testEntryId) {
    console.log('❌ Cannot proceed with tests without a test entry. Please create one manually.');
    return;
  }
  
  // Update the test data with the created entry ID
  testData.entryId = testEntryId;
  
  // Test 1: Delete entry successfully
  await testDeleteEntry();
  
  // Test 2: Verify entry is deleted
  await verifyEntryDeleted(testEntryId);
  
  // Test 3: Try to delete non-existent entry
  await testDeleteNonExistentEntry();
  
  // Test 4: Try to delete without token
  await testDeleteWithoutToken();
  
  // Test 5: Try to delete with invalid token
  await testDeleteWithInvalidToken();
  
  // Test 6: Try to delete with invalid ID format
  await testDeleteWithInvalidId();
  
  // Test 7: Try to delete already deleted entry
  await testDeleteAlreadyDeletedEntry();
  
  console.log('\n🏁 Delete Finance Entry API Tests Completed!');
}

// Run tests
runTests().catch(console.error);
