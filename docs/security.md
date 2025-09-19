# 🔒 Security Guide

## 📚 **Security Overview**

The **CRIPCOCODE CRM** system implements a comprehensive security framework to protect sensitive business data, user accounts, and system resources. This guide covers all security measures, best practices, and implementation details.

## 🛡️ **Security Architecture**

### **Multi-Layer Security Model**
```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Input Validation│  │ Rate Limiting   │  │ CORS Policy │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Authentication Layer                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ JWT Tokens      │  │ Password Hashing│  │ Session Mgmt│ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Authorization Layer                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Role-based Access│  │ Permission Check│  │ Company Iso│ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Data Encryption │  │ Audit Logging   │  │ Backup Sec  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### **Security Principles**
- **Defense in Depth**: Multiple security layers
- **Least Privilege**: Minimal required access
- **Zero Trust**: Verify every request
- **Secure by Default**: Security-first configuration
- **Continuous Monitoring**: Real-time security oversight

## 🔐 **Authentication Security**

### **JWT Token Security**

#### **Token Structure**
```javascript
// JWT Payload
{
  "userId": "admin_id",
  "username": "admin_username",
  "email": "admin@company.com",
  "role": "CompanyAdmin",
  "company": "company_id",
  "permissions": {
    "canManageUsers": true,
    "canManageAdmins": true,
    "canManageCompany": true,
    "canViewReports": true,
    "canManageProjects": true,
    "canManageBilling": true
  },
  "iat": 1234567890,        // Issued at
  "exp": 1234654290,        // Expiration time
  "jti": "unique_token_id"  // JWT ID for blacklisting
}
```

#### **Token Security Features**
- **Short Expiration**: 7 days default (configurable)
- **Unique Token IDs**: Prevents replay attacks
- **Blacklisting**: Secure logout mechanism
- **Refresh Tokens**: Automatic token renewal
- **Device Tracking**: Monitor token usage

#### **Token Validation**
```javascript
// Middleware validation
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }
    
    // Check blacklist
    if (tokenBlacklist.isBlacklisted(token)) {
      return res.status(401).json({ message: 'Token invalidated' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Validate user exists and is active
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
```

### **Password Security**

#### **Password Requirements**
- **Minimum Length**: 8 characters
- **Complexity**: Mix of uppercase, lowercase, numbers, symbols
- **Common Passwords**: Blocked using dictionary
- **History**: Prevent password reuse
- **Expiration**: 90 days (configurable)

#### **Password Hashing**
```javascript
// bcrypt configuration
const bcryptConfig = {
  saltRounds: 12,           // High cost for security
  memoryCost: 2**14,         // 16MB memory usage
  timeCost: 3,               // 3 iterations
  parallelism: 1             // Single thread
};

// Password hashing
const hashPassword = async (password) => {
  return await bcrypt.hash(password, bcryptConfig.saltRounds);
};

// Password verification
const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
```

#### **Password Policies**
```javascript
// Password validation middleware
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (password.length < minLength) {
    throw new Error('Password must be at least 8 characters long');
  }
  
  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
    throw new Error('Password must contain uppercase, lowercase, number, and special character');
  }
  
  return true;
};
```

## 🚪 **Authorization Security**

### **Role-Based Access Control (RBAC)**

#### **User Roles and Permissions**
```javascript
// Role hierarchy
const roleHierarchy = {
  'superAdmin': {
    level: 1,
    permissions: ['*']  // All permissions
  },
  'CompanyAdmin': {
    level: 2,
    permissions: [
      'canManageUsers',
      'canManageAdmins',
      'canManageCompany',
      'canViewReports',
      'canManageProjects',
      'canManageBilling'
    ]
  },
  'manager': {
    level: 3,
    permissions: [
      'canManageUsers',
      'canViewReports',
      'canManageProjects'
    ]
  },
  'sales': {
    level: 4,
    permissions: [
      'canViewReports'
    ]
  },
  'support': {
    level: 4,
    permissions: [
      'canViewReports'
    ]
  }
};
```

#### **Permission Middleware**
```javascript
// Check specific permission
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user.permissions || !req.user.permissions[permission]) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${permission} permission required.`
      });
    }
    next();
  };
};

// Check role level
const requireRoleLevel = (minLevel) => {
  return (req, res, next) => {
    const userLevel = roleHierarchy[req.user.role]?.level || 999;
    if (userLevel > minLevel) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient role level for this operation.'
      });
    }
    next();
  };
};
```

### **Company Isolation**

#### **Data Access Control**
```javascript
// Company access middleware
const requireCompanyAccess = (req, res, next) => {
  const companyId = req.params.companyId || req.body.company || req.query.company;
  
  if (!companyId) {
    return res.status(400).json({
      success: false,
      message: 'Company ID is required'
    });
  }

  // Super-admin can access any company
  if (req.user.role === 'superAdmin') {
    return next();
  }

  // Other users can only access their own company
  if (req.user.company && req.user.company.toString() === companyId.toString()) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. You can only access your own company.'
  });
};
```

#### **Query Filtering**
```javascript
// Company-based data filtering
const filterByCompany = (query, user) => {
  if (user.role === 'superAdmin') {
    return query; // No filtering for superAdmin
  }
  
  return query.where('company', user.company);
};

// Example usage
const getProjects = async (req, res) => {
  try {
    let query = Project.find();
    query = filterByCompany(query, req.user);
    
    const projects = await query.exec();
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

## 🛡️ **Input Validation & Sanitization**

### **Request Validation**

#### **Express-Validator Configuration**
```javascript
const { body, validationResult } = require('express-validator');

// Validation rules
const validateAdmin = [
  body('fullname')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .escape(),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),
  
  body('phone')
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Must be a valid phone number'),
  
  body('role')
    .isIn(['superAdmin', 'CompanyAdmin', 'manager', 'sales', 'support'])
    .withMessage('Invalid role specified'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character')
];

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};
```

#### **SQL Injection Prevention**
```javascript
// MongoDB injection prevention
const sanitizeQuery = (query) => {
  // Remove dangerous operators
  const dangerousOperators = ['$where', '$eval', '$code'];
  dangerousOperators.forEach(op => {
    delete query[op];
  });
  
  // Sanitize string inputs
  Object.keys(query).forEach(key => {
    if (typeof query[key] === 'string') {
      query[key] = query[key].replace(/[<>{}]/g, '');
    }
  });
  
  return query;
};

// Usage example
const searchAdmins = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search) {
      query = {
        $or: [
          { fullname: { $regex: search.replace(/[<>{}]/g, ''), $options: 'i' } },
          { email: { $regex: search.replace(/[<>{}]/g, ''), $options: 'i' } }
        ]
      };
    }
    
    query = sanitizeQuery(query);
    const admins = await Admin.find(query);
    res.json({ success: true, data: admins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### **XSS Prevention**

#### **Output Sanitization**
```javascript
// HTML entity encoding
const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    "/": '&#x2F;'
  };
  
  return text.replace(/[&<>"'/]/g, (m) => map[m]);
};

// Response sanitization middleware
const sanitizeResponse = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    if (typeof data === 'string') {
      data = escapeHtml(data);
    } else if (typeof data === 'object') {
      data = JSON.stringify(data);
      data = escapeHtml(data);
    }
    
    originalSend.call(this, data);
  };
  
  next();
};
```

## 🚦 **Rate Limiting & DDoS Protection**

### **API Rate Limiting**

#### **Rate Limiter Configuration**
```javascript
const rateLimit = require('express-rate-limit');

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Stricter limits for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});
```

#### **IP-based Blocking**
```javascript
// IP blacklist management
class IPBlacklist {
  constructor() {
    this.blacklist = new Set();
    this.failedAttempts = new Map();
    this.blockDuration = 24 * 60 * 60 * 1000; // 24 hours
  }
  
  addToBlacklist(ip) {
    this.blacklist.add(ip);
    setTimeout(() => {
      this.blacklist.delete(ip);
    }, this.blockDuration);
  }
  
  isBlacklisted(ip) {
    return this.blacklist.has(ip);
  }
  
  recordFailedAttempt(ip) {
    const attempts = this.failedAttempts.get(ip) || 0;
    this.failedAttempts.set(ip, attempts + 1);
    
    if (attempts + 1 >= 10) {
      this.addToBlacklist(ip);
      this.failedAttempts.delete(ip);
    }
  }
}

const ipBlacklist = new IPBlacklist();

// IP blocking middleware
const checkIPBlacklist = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  if (ipBlacklist.isBlacklisted(clientIP)) {
    return res.status(403).json({
      success: false,
      message: 'Your IP address has been blocked due to suspicious activity.'
    });
  }
  
  next();
};
```

## 🔒 **Data Encryption & Protection**

### **Data at Rest**

#### **Field-level Encryption**
```javascript
const crypto = require('crypto');

// Encryption configuration
const encryptionConfig = {
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 16,
  tagLength: 16
};

// Encrypt sensitive data
const encryptField = (text, secretKey) => {
  const iv = crypto.randomBytes(encryptionConfig.ivLength);
  const cipher = crypto.createCipher(encryptionConfig.algorithm, secretKey);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  return {
    encrypted: encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex')
  };
};

// Decrypt sensitive data
const decryptField = (encryptedData, secretKey) => {
  const decipher = crypto.createDecipher(encryptionConfig.algorithm, secretKey);
  decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};
```

#### **Password Field Protection**
```javascript
// Mongoose schema with password protection
const adminSchema = new mongoose.Schema({
  // ... other fields
  password: {
    type: String,
    required: true,
    select: false // Don't include in queries by default
  }
});

// Password comparison method
adminSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};
```

### **Data in Transit**

#### **HTTPS Configuration**
```javascript
const https = require('https');
const fs = require('fs');

// SSL/TLS configuration
const httpsOptions = {
  key: fs.readFileSync('path/to/private-key.pem'),
  cert: fs.readFileSync('path/to/certificate.pem'),
  ca: fs.readFileSync('path/to/ca-bundle.pem'),
  minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.3',
  ciphers: [
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES256-SHA384',
    'ECDHE-RSA-AES128-SHA256'
  ].join(':'),
  honorCipherOrder: true
};

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## 📊 **Audit Logging & Monitoring**

### **Security Event Logging**

#### **Audit Log Schema**
```javascript
const auditLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  userEmail: String,
  userRole: String,
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login', 'logout', 'create', 'read', 'update', 'delete',
      'permission_change', 'role_change', 'data_export', 'login_failed'
    ]
  },
  resource: {
    type: String,
    required: true
  },
  resourceId: mongoose.Schema.Types.ObjectId,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  success: {
    type: Boolean,
    required: true
  },
  errorMessage: String
});
```

#### **Audit Logging Middleware**
```javascript
// Audit logging middleware
const auditLog = (action, resource) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the action after response
      const logData = {
        userId: req.user?.id,
        userEmail: req.user?.email,
        userRole: req.user?.role,
        company: req.user?.company,
        action: action,
        resource: resource,
        resourceId: req.params.id || req.body.id,
        details: {
          method: req.method,
          url: req.originalUrl,
          body: req.body,
          params: req.params,
          query: req.query
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: res.statusCode < 400,
        errorMessage: res.statusCode >= 400 ? data : undefined
      };
      
      // Async logging (don't block response)
      AuditLog.create(logData).catch(console.error);
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Usage example
app.post('/api/admin/create', 
  authenticateToken, 
  requirePermission('canManageAdmins'),
  auditLog('create', 'admin'),
  adminController.createAdmin
);
```

### **Security Monitoring**

#### **Real-time Alerts**
```javascript
// Security monitoring service
class SecurityMonitor {
  constructor() {
    this.suspiciousActivities = [];
    this.alertThresholds = {
      failedLogins: 5,
      suspiciousIPs: 3,
      rateLimitViolations: 10
    };
  }
  
  // Monitor failed login attempts
  monitorFailedLogin(userId, ipAddress) {
    const key = `${userId}:${ipAddress}`;
    const attempts = this.failedAttempts.get(key) || 0;
    this.failedAttempts.set(key, attempts + 1);
    
    if (attempts + 1 >= this.alertThresholds.failedLogins) {
      this.raiseAlert('multiple_failed_logins', {
        userId,
        ipAddress,
        attempts: attempts + 1
      });
    }
  }
  
  // Monitor suspicious IP activities
  monitorSuspiciousIP(ipAddress, activity) {
    const activities = this.ipActivities.get(ipAddress) || [];
    activities.push({
      timestamp: new Date(),
      activity: activity
    });
    
    if (activities.length >= this.alertThresholds.suspiciousIPs) {
      this.raiseAlert('suspicious_ip_activity', {
        ipAddress,
        activities: activities
      });
    }
  }
  
  // Raise security alerts
  raiseAlert(type, data) {
    const alert = {
      type: type,
      data: data,
      timestamp: new Date(),
      severity: this.getAlertSeverity(type)
    };
    
    // Log alert
    console.error('SECURITY ALERT:', alert);
    
    // Send notification (email, Slack, etc.)
    this.sendNotification(alert);
    
    // Store in database
    SecurityAlert.create(alert).catch(console.error);
  }
}
```

## 🚨 **Incident Response**

### **Security Incident Handling**

#### **Incident Response Plan**
```javascript
// Security incident response
class SecurityIncidentResponse {
  constructor() {
    this.incidentLevels = {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
      CRITICAL: 'critical'
    };
  }
  
  // Handle security incident
  async handleIncident(incident) {
    try {
      // 1. Assess incident level
      const level = this.assessIncidentLevel(incident);
      
      // 2. Immediate response
      await this.immediateResponse(incident, level);
      
      // 3. Investigation
      const investigation = await this.investigateIncident(incident);
      
      // 4. Remediation
      await this.remediateIncident(incident, investigation);
      
      // 5. Documentation
      await this.documentIncident(incident, investigation);
      
      // 6. Notification
      await this.notifyStakeholders(incident, level);
      
    } catch (error) {
      console.error('Error handling security incident:', error);
      // Escalate to emergency contacts
      await this.escalateIncident(incident, error);
    }
  }
  
  // Immediate response actions
  async immediateResponse(incident, level) {
    switch (level) {
      case this.incidentLevels.CRITICAL:
        // Block affected accounts/IPs
        await this.blockAffectedEntities(incident);
        // Disable affected services
        await this.disableAffectedServices(incident);
        break;
        
      case this.incidentLevels.HIGH:
        // Increase monitoring
        await this.increaseMonitoring(incident);
        // Alert security team
        await this.alertSecurityTeam(incident);
        break;
        
      case this.incidentLevels.MEDIUM:
        // Log incident
        await this.logIncident(incident);
        break;
        
      case this.incidentLevels.LOW:
        // Standard logging
        await this.standardLogging(incident);
        break;
    }
  }
}
```

## 📋 **Security Checklist**

### **Development Security**
- [ ] **Input Validation**: All inputs validated and sanitized
- [ ] **Authentication**: JWT tokens with proper expiration
- [ ] **Authorization**: Role-based access control implemented
- [ ] **Password Security**: Strong password policies enforced
- [ ] **Data Encryption**: Sensitive data encrypted at rest and in transit
- [ ] **Rate Limiting**: API rate limiting implemented
- [ ] **CORS Policy**: Proper CORS configuration
- [ ] **Security Headers**: Helmet.js security headers
- [ ] **Audit Logging**: Comprehensive security event logging
- [ ] **Error Handling**: Secure error messages (no sensitive data)

### **Production Security**
- [ ] **HTTPS**: SSL/TLS certificates configured
- [ ] **Environment Variables**: Sensitive data in environment variables
- [ ] **Database Security**: Database access restricted
- [ ] **Backup Security**: Encrypted backups with access control
- [ ] **Monitoring**: Security monitoring and alerting
- [ ] **Incident Response**: Security incident response plan
- [ ] **Regular Updates**: Security patches and updates
- [ ] **Access Control**: Minimal production access
- [ ] **Logging**: Centralized security logging
- [ ] **Testing**: Regular security testing and penetration testing

### **Compliance & Standards**
- [ ] **GDPR Compliance**: Data protection and privacy
- [ ] **SOC 2**: Security controls and procedures
- [ ] **ISO 27001**: Information security management
- [ ] **OWASP Top 10**: Web application security
- [ ] **NIST Framework**: Cybersecurity framework
- [ ] **Regular Audits**: Security compliance audits
- [ ] **Documentation**: Security policies and procedures
- [ ] **Training**: Security awareness training
- [ ] **Incident Response**: Documented response procedures
- [ ] **Business Continuity**: Disaster recovery planning

## 🔧 **Security Tools & Utilities**

### **Security Testing Tools**
```bash
# OWASP ZAP for security testing
npm install -g @zaproxy/cli

# Run security scan
zap-cli quick-scan --self-contained http://localhost:5000

# NPM audit for dependency vulnerabilities
npm audit
npm audit fix

# ESLint security plugin
npm install eslint-plugin-security
```

### **Security Monitoring Tools**
```bash
# Install security monitoring packages
npm install helmet express-rate-limit express-validator
npm install bcryptjs jsonwebtoken

# Security headers
npm install helmet

# Rate limiting
npm install express-rate-limit

# Input validation
npm install express-validator
```

---

**This security guide provides comprehensive protection for the CRM system. Regular security reviews, updates, and testing are essential to maintain the security posture of the application.**
