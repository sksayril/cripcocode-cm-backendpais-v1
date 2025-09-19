# 🚀 Quick Start Guide

## ⚡ **Get Up and Running in 5 Minutes**

This quick start guide will help you get the **CRIPCOCODE CRM** system running on your local machine in just a few minutes.

## 📋 **Prerequisites Check**

Before starting, ensure you have the following installed:

```bash
# Check Node.js version (should be 16.0.0 or higher)
node --version

# Check npm version
npm --version

# Check MongoDB version (should be 4.4 or higher)
mongod --version
```

**If any of these are missing, install them first:**
- **Node.js**: Download from [nodejs.org](https://nodejs.org/)
- **MongoDB**: Follow [MongoDB installation guide](https://docs.mongodb.com/manual/installation/)
- **Git**: Download from [git-scm.com](https://git-scm.com/)

## 🚀 **Quick Setup Steps**

### **Step 1: Clone and Setup**
```bash
# Clone the repository
git clone https://github.com/cripcocode/crm-project.git

# Navigate to project directory
cd CRIPCOCODE_CRM_PROJECT

# Install dependencies
npm install
```

### **Step 2: Database Setup**
```bash
# Start MongoDB (if not running as a service)
mongod

# In a new terminal, verify MongoDB is running
mongo
# You should see MongoDB shell
exit
```

### **Step 3: Environment Configuration**
```bash
# Copy environment file
cp env.js.example env.js

# Edit the configuration (use your preferred editor)
nano env.js  # Linux/macOS
notepad env.js  # Windows
code env.js  # VS Code
```

**Update these key values in `env.js`:**
```javascript
module.exports = {
  PORT: 5000,
  MONGODB_URI: 'mongodb://localhost:27017/cripcocode_crm',
  JWT_SECRET: 'your_super_secret_key_here_change_in_production',
  JWT_EXPIRES_IN: '7d'
};
```

### **Step 4: Start the Application**
```bash
# Start development server
npm run dev

# You should see:
# 🚀 Server running on port 5000
# 📊 Environment: development
# 🔗 Health check: http://localhost:5000/health
```

### **Step 5: Verify Installation**
```bash
# Test health endpoint
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

## 👤 **Create Your First User**

### **Create Super Admin Account**
```bash
# Create superAdmin user
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superAdmin",
    "email": "admin@cripcocode.com",
    "phone": "1234567890",
    "role": "superAdmin",
    "password": "Admin123!"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "user_id_here",
      "username": "superAdmin",
      "email": "admin@cripcocode.com",
      "role": "superAdmin"
    },
    "token": "jwt_token_here"
  }
}
```

### **Login to Get Access Token**
```bash
# Login with your credentials
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cripcocode.com",
    "password": "Admin123!"
  }'
```

**Save the token from the response - you'll need it for authenticated requests.**

## 🏢 **Create Your First Company**

### **Create Company (requires superAdmin token)**
```bash
# Replace YOUR_TOKEN with the token from login
curl -X POST http://localhost:5000/api/company/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "My Company",
    "description": "A sample company for testing",
    "email": "info@mycompany.com",
    "phone": "+1-555-0123",
    "industry": "Technology",
    "size": "small"
  }'
```

## 👨‍💼 **Create Your First Admin**

### **Create Company Admin**
```bash
# Create admin for your company
curl -X POST http://localhost:5000/api/admin/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "fullname": "John Doe",
    "username": "johndoe",
    "email": "john@mycompany.com",
    "role": "CompanyAdmin",
    "password": "Admin123!",
    "phone": "+1-555-0124",
    "department": "Management",
    "adminArea": "General",
    "company": "COMPANY_ID_FROM_PREVIOUS_STEP"
  }'
```

## 📱 **Test Basic Operations**

### **List All Admins**
```bash
curl -X GET http://localhost:5000/api/admin/list \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Get Company Details**
```bash
curl -X GET http://localhost:5000/api/company/COMPANY_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Health Check**
```bash
curl http://localhost:5000/health
```

## 🌐 **Access the System**

### **API Endpoints Available**
- **Health Check**: `http://localhost:5000/health`
- **Authentication**: `http://localhost:5000/api/auth`
- **Company Management**: `http://localhost:5000/api/company`
- **Admin Management**: `http://localhost:5000/api/admin`
- **Client Management**: `http://localhost:5000/api/client`
- **Project Management**: `http://localhost:5000/api/project`
- **Employee Management**: `http://localhost:5000/api/employee`
- **Task Management**: `http://localhost:5000/api/task`

### **Default Credentials**
- **Super Admin**: `admin@cripcocode.com` / `Admin123!`
- **Company Admin**: `john@mycompany.com` / `Admin123!`

## 🔧 **Common Quick Fixes**

### **Port Already in Use**
```bash
# Find what's using the port
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### **MongoDB Connection Failed**
```bash
# Check MongoDB status
sudo systemctl status mongodb  # Linux
brew services list | grep mongodb  # macOS

# Start MongoDB if not running
sudo systemctl start mongodb  # Linux
brew services start mongodb-community  # macOS
```

### **Permission Denied**
```bash
# Fix file permissions
chmod +x server.js
chmod 644 env.js
```

## 📚 **Next Steps**

After successful setup:

1. **Explore the API**: Test different endpoints with your token
2. **Create Test Data**: Add sample clients, projects, and tasks
3. **Read Documentation**: Check the [full documentation](./README.md)
4. **Customize Configuration**: Modify settings in `env.js`
5. **Set Up Frontend**: Build or integrate a frontend application

## 🆘 **Need Help?**

### **Quick Troubleshooting**
- **Server won't start**: Check MongoDB connection and port availability
- **Authentication fails**: Verify JWT secret and token format
- **Database errors**: Ensure MongoDB is running and accessible
- **Permission errors**: Check user role and company access

### **Support Resources**
- **Documentation**: [docs/README.md](./README.md)
- **API Reference**: [docs/api/README.md](./api/README.md)
- **GitHub Issues**: [Report problems](https://github.com/cripcocode/crm-project/issues)
- **Email Support**: dev@cripcocode.com

## 🎯 **What You've Accomplished**

✅ **Installed and configured the CRM system**  
✅ **Created your first superAdmin account**  
✅ **Set up your first company**  
✅ **Created your first admin user**  
✅ **Tested basic API operations**  
✅ **Verified system functionality**  

**Congratulations! You now have a fully functional CRM system running locally. You can start managing clients, projects, and business operations right away.**

---

**Ready to scale? Check out the [Deployment Guide](./deployment.md) for production setup instructions.**
