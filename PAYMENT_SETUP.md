# Payment System Setup Guide

This guide will help you set up the Razorpay payment system for your CRM project.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Razorpay Credentials
```bash
npm run setup-payment
```

This interactive script will help you configure your Razorpay credentials.

### 3. Test the Payment System
```bash
npm run test-payment
```

### 4. Start the Server
```bash
npm start
```

## 🔑 Getting Razorpay Credentials

1. **Sign up for Razorpay**: Go to [https://razorpay.com](https://razorpay.com)
2. **Create Account**: Sign up for a Razorpay account
3. **Get API Keys**: 
   - Go to [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys)
   - Copy your **Key ID** and **Key Secret**
   - Use these credentials in the setup script

## 📋 Manual Setup

If you prefer to set up manually:

### 1. Create/Update .env file
```env
# Razorpay Payment Gateway Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

### 2. Test the configuration
```bash
npm run test-payment
```

## 🧪 Testing the Payment System

### Test Script
The test script checks:
- ✅ Environment variables
- ✅ PaymentService initialization
- ✅ Charge calculation
- ✅ Database connection
- ✅ Transaction model

### Manual Testing
1. **Start the server**: `npm start`
2. **Check health**: `http://localhost:3500/health`
3. **Test payment API**: `http://localhost:3500/api/payment`

## 📚 API Documentation

Complete API documentation is available at:
- **File**: `apidocs/payment.md`
- **URL**: `http://localhost:3500/api/payment` (when server is running)

## 🔧 Available Scripts

- `npm run setup-payment` - Interactive setup for Razorpay credentials
- `npm run test-payment` - Test payment system functionality
- `npm start` - Start the server
- `npm run dev` - Start server in development mode

## 🚨 Troubleshooting

### Error: "key_id or oauthToken is mandatory"
- **Cause**: Razorpay credentials not found
- **Solution**: Run `npm run setup-payment` to configure credentials

### Error: "Razorpay is not initialized"
- **Cause**: Invalid or missing Razorpay credentials
- **Solution**: Check your .env file and verify credentials

### Error: "Database connection failed"
- **Cause**: MongoDB not running or incorrect connection string
- **Solution**: Check your MongoDB connection and MONGODB_URI in .env

## 🔐 Security Notes

- **Never commit .env file** to version control
- **Use different credentials** for development and production
- **Keep your Razorpay credentials secure**
- **Use environment-specific configurations**

## 📊 Features

The payment system includes:
- ✅ Razorpay order creation
- ✅ Payment verification
- ✅ Automatic charge calculation (2% + 18% GST)
- ✅ Transaction management
- ✅ Refund support
- ✅ Statistics and analytics
- ✅ CSV export
- ✅ Dashboard with real-time data

## 🎯 Next Steps

1. **Configure Razorpay**: Get your API keys from Razorpay dashboard
2. **Set up credentials**: Run the setup script
3. **Test the system**: Verify everything works
4. **Integrate frontend**: Use the API endpoints in your frontend
5. **Monitor transactions**: Use the dashboard and statistics endpoints

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify your Razorpay credentials
3. Ensure MongoDB is running
4. Check the server logs for detailed error messages

---

**Happy coding! 🚀**
