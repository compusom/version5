import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

export const config = {
  // Server configuration
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'meta_ads_creative_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    url: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'password'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'meta_ads_creative_db'}`
  },

  // API Keys
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  metaAppId: process.env.META_APP_ID || '',
  metaAppSecret: process.env.META_APP_SECRET || '',

  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'your-super-secure-jwt-secret-key-change-this-in-production',
  jwtExpiresIn: '24h',

  // File upload configuration
  maxFileSize: process.env.MAX_FILE_SIZE || '50MB',
  uploadPath: process.env.UPLOAD_PATH || './uploads',

  // Security
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),

  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  // FTP configuration (if needed)
  ftp: {
    host: process.env.FTP_HOST || '',
    user: process.env.FTP_USER || '',
    password: process.env.FTP_PASSWORD || '',
    port: parseInt(process.env.FTP_PORT || '21', 10)
  }
};

// Validation
if (!config.geminiApiKey && config.nodeEnv === 'production') {
  console.warn('⚠️  GEMINI_API_KEY is not set in production environment');
}

if (!config.jwtSecret || config.jwtSecret === 'your-super-secure-jwt-secret-key-change-this-in-production') {
  if (config.nodeEnv === 'production') {
    throw new Error('JWT_SECRET must be set in production environment');
  } else {
    console.warn('⚠️  Using default JWT_SECRET in development');
  }
}
