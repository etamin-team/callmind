import * as dotenv from 'dotenv'

dotenv.config()

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001'),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/callmind',
  CORS_ORIGINS: process.env.CORS_ORIGINS || 'http://localhost:3000',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-this',
}
