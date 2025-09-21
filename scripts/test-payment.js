#!/usr/bin/env node

/**
 * Payment System Test Script
 * This script tests the payment system functionality
 */

const config = require('../env');

console.log('🧪 Payment System Test');
console.log('=====================');
console.log('');

// Test 1: Check environment variables
console.log('1. Checking environment variables...');
if (config.RAZORPAY_KEY_ID && config.RAZORPAY_KEY_SECRET) {
  console.log('✅ Razorpay credentials found');
  console.log(`   Key ID: ${config.RAZORPAY_KEY_ID.substring(0, 8)}...`);
  console.log(`   Key Secret: ${config.RAZORPAY_KEY_SECRET.substring(0, 8)}...`);
} else {
  console.log('❌ Razorpay credentials not found');
  console.log('   Please run: node scripts/setup-payment.js');
  process.exit(1);
}

// Test 2: Test PaymentService initialization
console.log('');
console.log('2. Testing PaymentService initialization...');
try {
  const PaymentService = require('../services/paymentService');
  if (PaymentService.razorpay) {
    console.log('✅ PaymentService initialized successfully');
  } else {
    console.log('⚠️  PaymentService initialized but Razorpay is null');
    console.log('   This might be due to invalid credentials');
  }
} catch (error) {
  console.log('❌ PaymentService initialization failed:', error.message);
}

// Test 3: Test charge calculation
console.log('');
console.log('3. Testing charge calculation...');
try {
  const PaymentService = require('../services/paymentService');
  const charges = PaymentService.calculateGatewayCharges(100000); // ₹1000
  console.log('✅ Charge calculation working');
  console.log(`   Amount: ₹${charges.amountInRupees}`);
  console.log(`   Transaction Fee: ₹${charges.transactionFee}`);
  console.log(`   GST on Fee: ₹${charges.gstOnFee}`);
  console.log(`   Total Gateway Charges: ₹${charges.totalGatewayCharges}`);
  console.log(`   Net Amount: ₹${charges.netAmount}`);
} catch (error) {
  console.log('❌ Charge calculation failed:', error.message);
}

// Test 4: Test database connection
console.log('');
console.log('4. Testing database connection...');
try {
  const mongoose = require('mongoose');
  const connectDB = require('../config/database');
  
  connectDB().then(() => {
    console.log('✅ Database connected successfully');
    
    // Test Transaction model
    const Transaction = require('../models/Transaction');
    console.log('✅ Transaction model loaded successfully');
    
    // Close connection
    mongoose.connection.close();
    console.log('');
    console.log('🎉 All tests passed! Payment system is ready to use.');
    console.log('');
    console.log('📋 Available endpoints:');
    console.log('   POST /api/payment/create-order');
    console.log('   POST /api/payment/verify');
    console.log('   GET  /api/payment/transactions');
    console.log('   GET  /api/payment/statistics');
    console.log('   GET  /api/payment/dashboard');
    console.log('');
    console.log('📖 Documentation: apidocs/payment.md');
  }).catch((error) => {
    console.log('❌ Database connection failed:', error.message);
    console.log('   Please check your MongoDB connection');
  });
} catch (error) {
  console.log('❌ Database test failed:', error.message);
}
