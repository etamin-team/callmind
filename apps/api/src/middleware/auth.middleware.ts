import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { getAuth } from '@clerk/fastify'

export interface AuthPluginOptions {
  // Add any plugin options here if needed
}

export interface AuthContext {
  userId: string | null
  sessionId: string | null
  orgId: string | null
  user: any | null
}

declare module 'fastify' {
  interface FastifyRequest {
    auth: AuthContext
  }
}

const authMiddleware: FastifyPluginAsync<AuthPluginOptions> = async (
  fastify,
  options
) => {
  fastify.addHook('onRequest', async (request, reply) => {
    try {
      const { userId, sessionId, orgId } = getAuth(request)
      
      request.auth = {
        userId,
        sessionId,
        orgId: orgId || null,
        user: null, // You can fetch user data from your database here if needed
      }
    } catch (error) {
      request.auth = {
        userId: null,
        sessionId: null,
        orgId: null,
        user: null,
      }
    }
  })
}

export const requireAuth = async (request: any, reply: any) => {
  if (!request.auth?.userId) {
    reply.code(401).send({
      error: 'Unauthorized',
      message: 'Authentication required',
    })
  }
}

export const optionalAuth = async (request: any, reply: any) => {
  // This is a no-op for optional auth - just let the request pass through
  // The auth context will be available if the user is authenticated
}

export default fp(authMiddleware, {
  name: 'auth-middleware',
})
