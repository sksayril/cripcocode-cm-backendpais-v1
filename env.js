// Environment Configuration
const config = {
  // Server Configuration
  PORT: process.env.PORT || 3500,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // MongoDB Connection
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/cripcocode_crm',
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_this_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // CORS Configuration
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173,https://8gl8skhl-3500.inc1.devtunnels.ms',
  CORS_CREDENTIALS: process.env.CORS_CREDENTIALS === 'true' || true,
  
  // Optional: External Services
  // SMTP_EMAIL: process.env.SMTP_EMAIL || '',
  // SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
  // CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  // CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  // CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
};

module.exports = config;
