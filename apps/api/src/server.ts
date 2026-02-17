import Fastify from 'fastify'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import autoLoad from '@fastify/autoload'
import rawBody from 'fastify-raw-body'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import rateLimit from '@fastify/rate-limit'
import { config } from './config/environment.js'
import { connectDB } from '@repo/db'
import { clerkPlugin, getAuth } from '@clerk/fastify'
import authPlugin from './middleware/auth.middleware.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const fastify = Fastify({
  logger: {
    level: config.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
      config.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  },
})

// Register raw body parser (needed for webhooks verification)
await fastify.register(rawBody, {
  field: 'rawBody', // attach raw body to request.rawBody
  global: false, // only for routes that request it
  encoding: 'utf8', // default encoding
  runFirst: true, // ensure it runs before body parser
})

// Register plugins
await fastify.register(helmet, {
  contentSecurityPolicy: config.NODE_ENV === 'production',
})

await fastify.register(cors, {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true)

    const allowedOrigins = [
      ...config.CORS_ORIGINS.split(','),
      // Allow ngrok URLs for testing
      /https:\/\/.*\.ngrok-free\.app$/,
      /https:\/\/.*\.ngrok\.io$/,
    ]

    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin)
      return origin === allowed
    })

    if (isAllowed) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
})

await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
})

// Swagger documentation
await fastify.register(swagger, {
  openapi: {
    info: {
      title: 'Callmind API',
      version: '1.0.0',
    },
  },
})

await fastify.register(swaggerUI, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
})

// Register Clerk plugin
await fastify.register(clerkPlugin, {
  secretKey: config.CLERK_SECRET_KEY,
  publishableKey: config.CLERK_PUBLISHABLE_KEY,
})

// Register auth middleware
await fastify.register(authPlugin)

// Auto-load all routes
await fastify.register(autoLoad, {
  dir: join(__dirname, 'routes'),
  options: { prefix: '/api' },
  routeParams: true,
})

// Current user endpoint - requires authentication
fastify.get('/api/me', async (request, reply) => {
  const { userId } = getAuth(request)
  if (!userId) {
    return reply.code(401).send({ error: 'Unauthorized', message: 'User not authenticated' })
  }
  
  return { 
    userId,
    isAuthenticated: true,
    // You can fetch additional user data from your database here
  }
})

// Public health check endpoint
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Connect to database
try {
  await connectDB()
  fastify.log.info('Database connected successfully')
} catch (error) {
  fastify.log.error(error, 'Failed to connect to database')
  process.exit(1)
}

const start = async () => {
  try {
    await fastify.listen({ port: config.PORT, host: '0.0.0.0' })
    fastify.log.info(`Server listening on port ${config.PORT}`)
    fastify.log.info(`API documentation available at http://localhost:${config.PORT}/docs`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()

export default fastify
