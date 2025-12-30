import { FastifyPluginAsync } from 'fastify'
import { requireAuth } from '../../middleware/auth.middleware.js'

interface ProtectedRoutesOptions {
  // Future options can be added here
}

const protectedRoutes: FastifyPluginAsync<ProtectedRoutesOptions> = async (
  fastify,
  options
) => {
  // Apply auth middleware to all routes in this plugin
  fastify.addHook('onRequest', requireAuth)

  fastify.get('/profile', async (request, reply) => {
    const { userId, sessionId } = request.auth
    
    return {
      message: 'This is a protected route',
      userId,
      sessionId,
      // You can fetch user profile from your database here
      profile: {
        id: userId,
        message: 'User profile data would be here',
      },
    }
  })

  fastify.get('/settings', async (request, reply) => {
    return {
      message: 'This is a protected settings route',
      settings: {
        theme: 'dark',
        notifications: true,
        // ... other settings
      },
    }
  })

  // Example of a protected POST route
  fastify.post('/data', async (request, reply) => {
    const { userId } = request.auth
    const body = request.body as any
    
    // Process the data for the authenticated user
    return {
      message: 'Data saved successfully',
      userId,
      data: body,
    }
  })
}

export default protectedRoutes