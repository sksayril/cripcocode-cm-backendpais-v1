# 🚀 Installation Guide

## 📋 **Prerequisites**

Before installing the CRIPCOCODE CRM system, ensure you have the following software installed on your system:

### **Required Software**
- **Node.js** (v16.0.0 or higher)
- **MongoDB** (v4.4 or higher)
- **Git** (for cloning the repository)
- **npm** (comes with Node.js)

### **System Requirements**
- **Operating System**: Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: Minimum 10GB available space
- **Network**: Internet connection for package installation

## 🔧 **Installation Steps**

### **Step 1: Clone the Repository**

```bash
# Clone the repository
git clone https://github.com/cripcocode/crm-project.git

# Navigate to project directory
cd CRIPCOCODE_CRM_PROJECT

# Verify the contents
ls -la
```

### **Step 2: Install Dependencies**

```bash
# Install Node.js dependencies
npm install

# Verify installation
npm list --depth=0
```

### **Step 3: Database Setup**

#### **Option A: Local MongoDB Installation**

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mongodb

# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Windows
# Download and install from https://www.mongodb.com/try/download/community

# Start MongoDB service
sudo systemctl start mongodb  # Linux
brew services start mongodb-community  # macOS
```

#### **Option B: MongoDB Atlas (Cloud)**

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Add your IP address to the whitelist

### **Step 4: Environment Configuration**

```bash
# Copy environment configuration file
cp env.js.example env.js

# Edit the configuration file
nano env.js  # Linux/macOS
notepad env.js  # Windows
```

#### **Environment Configuration Example**

```javascript
// Environment Configuration
const config = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // MongoDB Connection
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/cripcocode_crm',
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_this_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // CORS Configuration
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001',
  
  // Optional: External Services
  // SMTP_EMAIL: process.env.SMTP_EMAIL || '',
  // SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
  // CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  // CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  // CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
};

module.exports = config;
```

### **Step 5: Database Initialization**

```bash
# Start the application (this will create the database)
npm run dev

# In another terminal, you can check MongoDB
mongo
use cripcocode_crm
show collections
```

### **Step 6: Create Initial Users**

The system requires at least one superAdmin user to function properly. You can create one using the API:

```bash
# Create superAdmin user
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superAdmin",
    "email": "admin@cripcocode.com",
    "phone": "1234567890",
    "role": "superAdmin",
    "password": "admin123"
  }'
```

## 🚀 **Starting the Application**

### **Development Mode**

```bash
# Start development server with nodemon
npm run dev

# The server will start on http://localhost:5000
# You should see output like:
# 🚀 Server running on port 5000
# 📊 Environment: development
# 🔗 Health check: http://localhost:5000/health
```

### **Production Mode**

```bash
# Start production server
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start server.js --name "crm-api"
pm2 status
```

## ✅ **Verification Steps**

### **1. Health Check**

```bash
# Check if server is running
curl http://localhost:5000/health

# Expected response:
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development",
  "database": "connected"
}
```

### **2. Database Connection**

```bash
# Check MongoDB connection
mongo
use cripcocode_crm
db.stats()
```

### **3. API Endpoints**

```bash
# Test authentication endpoint
curl http://localhost:5000/api/auth

# Test admin endpoint (should return 401 - unauthorized)
curl http://localhost:5000/api/admin/list
```

## 🔧 **Configuration Options**

### **Port Configuration**

```bash
# Set custom port
export PORT=3000
npm run dev

# Or modify env.js
PORT: process.env.PORT || 3000
```

### **Database Configuration**

```bash
# Local MongoDB
MONGODB_URI: 'mongodb://localhost:27017/cripcocode_crm'

# MongoDB Atlas
MONGODB_URI: 'mongodb+srv://username:password@cluster.mongodb.net/cripcocode_crm'

# MongoDB with authentication
MONGODB_URI: 'mongodb://username:password@localhost:27017/cripcocode_crm'
```

### **JWT Configuration**

```bash
# Custom JWT secret
JWT_SECRET: 'your_custom_secret_key_here'

# Custom expiration time
JWT_EXPIRES_IN: '24h'  # 24 hours
JWT_EXPIRES_IN: '7d'   # 7 days
JWT_EXPIRES_IN: '30d'  # 30 days
```

## 🐛 **Troubleshooting**

### **Common Issues**

#### **1. Port Already in Use**

```bash
# Check what's using the port
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

#### **2. MongoDB Connection Failed**

```bash
# Check MongoDB status
sudo systemctl status mongodb  # Linux
brew services list | grep mongodb  # macOS

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log  # Linux
tail -f /usr/local/var/log/mongodb/mongo.log  # macOS
```

#### **3. Permission Denied**

```bash
# Fix file permissions
chmod +x server.js
chmod 644 env.js

# Check Node.js version
node --version
npm --version
```

#### **4. Dependencies Installation Failed**

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Use specific Node.js version
nvm use 16  # If using nvm
```

### **Logs and Debugging**

```bash
# Enable debug logging
export DEBUG=*
npm run dev

# Check application logs
tail -f logs/app.log  # If logging is configured

# MongoDB query logging
export DEBUG=mongoose:*
npm run dev
```

## 🔒 **Security Considerations**

### **Production Security**

```bash
# Change default JWT secret
JWT_SECRET: 'very_long_random_string_at_least_32_characters'

# Enable HTTPS
NODE_ENV: 'production'
HTTPS_ENABLED: true

# Restrict CORS origins
ALLOWED_ORIGINS: 'https://yourdomain.com,https://app.yourdomain.com'
```

### **Environment Variables**

```bash
# Use .env file for sensitive data
echo "JWT_SECRET=your_secret_here" > .env
echo "MONGODB_URI=your_mongodb_uri" >> .env

# Load environment variables
npm install dotenv
```

## 📚 **Next Steps**

After successful installation:

1. **Read the [Quick Start Guide](./quickstart.md)** - Get familiar with basic operations
2. **Explore the [API Documentation](./api/README.md)** - Understand available endpoints
3. **Check the [User Guides](./user-guides/)** - Learn how to use the system
4. **Review [Security Guide](./security.md)** - Understand security features
5. **Read [Development Guide](./development.md)** - Learn how to contribute

## 🆘 **Getting Help**

### **Documentation**
- **Project Documentation**: [docs/README.md](./README.md)
- **API Reference**: [docs/api/README.md](./api/README.md)
- **Code Examples**: [examples/](../examples/)

### **Support Channels**
- **GitHub Issues**: [Report bugs and issues](https://github.com/cripcocode/crm-project/issues)
- **Email Support**: dev@cripcocode.com
- **Community Forum**: [Join discussions](https://community.cripcocode.com)

---

**Congratulations! You have successfully installed the CRIPCOCODE CRM system. The next step is to explore the system and start managing your business operations.**
