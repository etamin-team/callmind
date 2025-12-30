import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load local .env
dotenv.config()

// Load root .env (3 levels up from apps/api/src/config)
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') })

const getOptionalEnv = (key: string) => {
  const val = process.env[key]
  // Filter out placeholder values from .env.example
  if (!val || val.includes('your_clerk_') || val.includes('your-secret')) {
    return undefined
  }
  return val
}

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001'),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/callmind',
  CORS_ORIGINS: process.env.CORS_ORIGINS || 'http://localhost:3000',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-this',
  CLERK_PUBLISHABLE_KEY: getOptionalEnv('CLERK_PUBLISHABLE_KEY') || getOptionalEnv('VITE_CLERK_PUBLISHABLE_KEY'),
  CLERK_SECRET_KEY: getOptionalEnv('CLERK_SECRET_KEY'),
}

// Debug logging (masked)
if (config.CLERK_PUBLISHABLE_KEY) {
  console.log(`[Config] Clerk Publishable Key loaded: ${config.CLERK_PUBLISHABLE_KEY.substring(0, 8)}...`)
} else {
  console.error(`[Config] Clerk Publishable Key is MISSING or invalid placeholder detected.`)
}

if (config.CLERK_SECRET_KEY) {
  console.log(`[Config] Clerk Secret Key loaded: sk_test_...${config.CLERK_SECRET_KEY.substring(config.CLERK_SECRET_KEY.length - 4)}`)
} else {
  console.error(`[Config] Clerk Secret Key is MISSING or invalid placeholder detected.`)
}
