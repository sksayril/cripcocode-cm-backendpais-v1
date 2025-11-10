/**
 * Test script for Company Admins API
 * Usage: node test-company-admins-api.js
 */

const http = require('http');

const companyId = '690daf8df487a5d636a3b122';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTBkOWUxNGY0ODdhNWQ2MzZhM2IxMGMiLCJyb2xlIjoic3VwZXJBZG1pbiIsImlhdCI6MTc2MjUxOTM2NywiZXhwIjoxNzYzMTI0MTY3fQ.FhGXjp7VOVjt1zEVoT4Odl6Fsz07F2Zw3Lu8pxifxfc';

const options = {
  hostname: 'localhost',
  port: 3500,
  path: `/api/company/${companyId}/admins`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
};

console.log('Testing Company Admins API...');
console.log(`URL: http://${options.hostname}:${options.port}${options.path}`);
console.log('');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log('Response:');
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
  console.error('\nMake sure the server is running on port 3500');
});

req.end();

