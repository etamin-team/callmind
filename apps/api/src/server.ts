import Fastify from 'fastify'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import autoLoad from '@fastify/autoload'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import rateLimit from '@fastify/rate-limit'
import { config } from './config/environment.js'
import { connectDB } from '@repo/db'

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

// Register plugins
await fastify.register(helmet, {
  contentSecurityPolicy: config.NODE_ENV === 'production',
})

await fastify.register(cors, {
  origin: config.CORS_ORIGINS.split(','),
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

// Auto-load all routes
await fastify.register(autoLoad, {
  dir: join(__dirname, 'routes'),
  options: { prefix: '/api' },
  routeParams: true,
})

// Health check
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
