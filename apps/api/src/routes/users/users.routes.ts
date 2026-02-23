import { FastifyPluginAsync } from 'fastify'
import { UserModel } from '@repo/db'
import { CreateUserSchema, UpdateUserSchema } from '@repo/types'

const usersRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all users
  fastify.get(
    '/users',
    {
      schema: {
        tags: ['users'],
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                avatar: { type: 'string', nullable: true },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
              },
            },
          },
        },
      },
    },
    async () => {
      const users = await UserModel.find()
      return users
    }
  )

  // Get user by ID
  fastify.get(
    '/users/:id',
    {
      schema: {
        tags: ['users'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              name: { type: 'string' },
              avatar: { type: 'string', nullable: true },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const user = await UserModel.findById(id)
      
      if (!user) {
        return reply.status(404).send({ error: 'User not found' })
      }
      
      return user
    }
  )

  // Create user
  fastify.post(
    '/users',
    {
      schema: {
        tags: ['users'],
        body: {
          type: 'object',
          properties: {
            email: { type: 'string' },
            name: { type: 'string' },
            avatar: { type: 'string', nullable: true },
          },
          required: ['email', 'name'],
        },
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              name: { type: 'string' },
              avatar: { type: 'string', nullable: true },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const data = CreateUserSchema.parse(request.body)
        const user = await UserModel.create(data)
        
        return reply.status(201).send(user)
      } catch (error) {
        fastify.log.error(error)
        return reply.status(400).send({ error: 'Invalid user data' })
      }
    }
  )

  // Update user
  fastify.put(
    '/users/:id',
    {
      schema: {
        tags: ['users'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          properties: {
            email: { type: 'string' },
            name: { type: 'string' },
            avatar: { type: 'string', nullable: true },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              name: { type: 'string' },
              avatar: { type: 'string', nullable: true },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      
      try {
        const data = UpdateUserSchema.parse(request.body)
        const user = await UserModel.findByIdAndUpdate(id, data, { new: true })
        
        if (!user) {
          return reply.status(404).send({ error: 'User not found' })
        }
        
        return user
      } catch (error) {
        fastify.log.error(error)
        return reply.status(400).send({ error: 'Invalid user data' })
      }
    }
  )

  // Delete user
  fastify.delete(
    '/users/:id',
    {
      schema: {
        tags: ['users'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        response: {
          204: {
            type: 'null',
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const user = await UserModel.findByIdAndDelete(id)

      if (!user) {
        return reply.status(404).send({ error: 'User not found' })
      }

      return reply.status(204).send()
    }
  )

  // Decrement credits (legacy - use check-and-decrement for new code)
  fastify.post(
    '/users/:id/decrement-credits',
    {
      schema: {
        tags: ['users'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          properties: {
            amount: { type: 'number', minimum: 1 },
          },
          required: ['amount'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              name: { type: 'string' },
              plan: { type: 'string' },
              credits: { type: 'number' },
            },
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const { amount } = request.body as { amount: number }

      try {
        const user = await UserModel.findById(id)

        if (!user) {
          return reply.status(404).send({ error: 'User not found' })
        }

        const currentCredits = (user as any).credits || 0

        if (currentCredits < amount) {
          return reply.status(400).send({ error: 'Insufficient credits' })
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
          id,
          { $inc: { credits: -amount } },
          { new: true }
        )

        return reply.status(200).send(updatedUser)
      } catch (error) {
        fastify.log.error(error)
        return reply.status(400).send({ error: 'Failed to decrement credits' })
      }
    }
  )

  // Atomic check-and-decrement - prevents race conditions
  fastify.post(
    '/users/:id/check-and-decrement-credits',
    {
      schema: {
        tags: ['users'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          properties: {
            amount: { type: 'number', minimum: 1, default: 1 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              credits: { type: 'number' },
              creditsRemaining: { type: 'number' },
              previousCredits: { type: 'number' },
            },
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const { amount = 1 } = request.body as { amount?: number }

      try {
        // Atomic operation: find user with sufficient credits and decrement in one go
        const user = await UserModel.findOneAndUpdate(
          {
            _id: id,
            credits: { $gte: amount }, // Only find if user has enough credits
          },
          {
            $inc: { credits: -amount }, // Decrement atomically
          },
          { new: true } // Return the updated document
        )

        if (!user) {
          // Check if user exists
          const existingUser = await UserModel.findById(id)
          if (!existingUser) {
            return reply.status(404).send({ error: 'User not found' })
          }
          // User exists but insufficient credits
          return reply.status(400).send({ error: 'Insufficient credits' })
        }

        const currentCredits = (user as any).credits || 0
        return reply.status(200).send({
          success: true,
          credits: currentCredits,
          creditsRemaining: currentCredits,
          previousCredits: currentCredits + amount,
        })
      } catch (error) {
        fastify.log.error(error)
        return reply.status(500).send({ error: 'Failed to check and decrement credits' })
      }
    }
  )

  // Refund credits (for failed calls)
  fastify.post(
    '/users/:id/refund-credits',
    {
      schema: {
        tags: ['users'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          properties: {
            amount: { type: 'number', minimum: 1, default: 1 },
            reason: { type: 'string' },
          },
          required: ['reason'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              credits: { type: 'number' },
              refundedAmount: { type: 'number' },
            },
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const { amount = 1, reason } = request.body as { amount?: number; reason: string }

      try {
        const user = await UserModel.findById(id)

        if (!user) {
          return reply.status(404).send({ error: 'User not found' })
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
          id,
          { $inc: { credits: amount } },
          { new: true }
        )

        const currentCredits = (updatedUser as any).credits || 0

        fastify.log.info(`Refunded ${amount} credits to user ${id}. Reason: ${reason}`)

        return reply.status(200).send({
          success: true,
          credits: currentCredits,
          refundedAmount: amount,
        })
      } catch (error) {
        fastify.log.error(error)
        return reply.status(500).send({ error: 'Failed to refund credits' })
      }
    }
  )
}

export default usersRoutes
