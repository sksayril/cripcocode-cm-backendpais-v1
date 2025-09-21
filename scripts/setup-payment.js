#!/usr/bin/env node

/**
 * Payment System Setup Script
 * This script helps configure Razorpay credentials for the payment system
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(__dirname, '..', '.env');
const envTemplatePath = path.join(__dirname, '..', 'env.template');

console.log('🔧 Payment System Setup');
console.log('======================');
console.log('');
console.log('This script will help you configure Razorpay credentials for the payment system.');
console.log('You can get your Razorpay credentials from: https://dashboard.razorpay.com/app/keys');
console.log('');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupPayment() {
  try {
    // Check if .env file exists
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    } else if (fs.existsSync(envTemplatePath)) {
      envContent = fs.readFileSync(envTemplatePath, 'utf8');
      console.log('📄 Using env.template as base...');
    } else {
      console.log('❌ No .env or env.template file found!');
      process.exit(1);
    }

    // Get Razorpay credentials
    console.log('Enter your Razorpay credentials:');
    console.log('');
    
    const keyId = await question('Razorpay Key ID: ');
    const keySecret = await question('Razorpay Key Secret: ');
    
    if (!keyId || !keySecret) {
      console.log('❌ Both Key ID and Key Secret are required!');
      process.exit(1);
    }

    // Update .env content
    let updatedContent = envContent;
    
    // Update or add RAZORPAY_KEY_ID
    if (updatedContent.includes('RAZORPAY_KEY_ID=')) {
      updatedContent = updatedContent.replace(
        /RAZORPAY_KEY_ID=.*/,
        `RAZORPAY_KEY_ID=${keyId}`
      );
    } else {
      updatedContent += `\n# Razorpay Payment Gateway Configuration\nRAZORPAY_KEY_ID=${keyId}\n`;
    }
    
    // Update or add RAZORPAY_KEY_SECRET
    if (updatedContent.includes('RAZORPAY_KEY_SECRET=')) {
      updatedContent = updatedContent.replace(
        /RAZORPAY_KEY_SECRET=.*/,
        `RAZORPAY_KEY_SECRET=${keySecret}`
      );
    } else {
      updatedContent += `RAZORPAY_KEY_SECRET=${keySecret}\n`;
    }

    // Write updated .env file
    fs.writeFileSync(envPath, updatedContent);
    
    console.log('');
    console.log('✅ Payment system configured successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Restart your server: npm start');
    console.log('2. Test the payment API: http://localhost:3500/api/payment');
    console.log('3. Check the API documentation: apidocs/payment.md');
    console.log('');
    console.log('🔐 Security Note:');
    console.log('- Keep your Razorpay credentials secure');
    console.log('- Never commit .env file to version control');
    console.log('- Use different credentials for development and production');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run setup
setupPayment();
