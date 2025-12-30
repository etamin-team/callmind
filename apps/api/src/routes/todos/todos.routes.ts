import { FastifyPluginAsync } from 'fastify'
import { TodoModel } from '@repo/db'
import { CreateTodoSchema, UpdateTodoSchema } from '@repo/types'
import { requireAuth } from '../../middleware/auth.middleware.js'

const todosRoutes: FastifyPluginAsync = async (fastify) => {
  // Add authentication hook for all routes in this plugin
  fastify.addHook('preHandler', requireAuth)

  // Get all todos for current user
  fastify.get(
    '/',
    {
      schema: {
        tags: ['todos'],
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                completed: { type: 'boolean' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
              },
            },
          },
        },
      },
    },
    async (request) => {
      const { userId, orgId } = request.auth
      const todos = await TodoModel.find({ userId, orgId: orgId || null }).sort({ createdAt: -1 })
      return todos
    }
  )

  // Create a new todo
  fastify.post(
    '/',
    {
      schema: {
        tags: ['todos'],
        body: {
          type: 'object',
          properties: {
            title: { type: 'string' },
          },
          required: ['title'],
        },
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              completed: { type: 'boolean' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { userId, orgId } = request.auth
      const data = CreateTodoSchema.parse(request.body)
      
      const todo = await TodoModel.create({
        ...data,
        userId: userId!,
        orgId: orgId || null,
      })

      return reply.status(201).send(todo)
    }
  )

  // Update a todo
  fastify.patch(
    '/:id',
    {
      schema: {
        tags: ['todos'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            completed: { type: 'boolean' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              completed: { type: 'boolean' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { userId, orgId } = request.auth
      const { id } = request.params as { id: string }
      const data = UpdateTodoSchema.parse(request.body)

      const todo = await TodoModel.findOneAndUpdate(
        { _id: id, userId: userId!, orgId: orgId || null },
        data,
        { new: true }
      )

      if (!todo) {
        return reply.status(404).send({ error: 'Todo not found' })
      }

      return todo
    }
  )

  // Delete a todo
  fastify.delete(
    '/:id',
    {
      schema: {
        tags: ['todos'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        response: {
          204: { type: 'null' },
        },
      },
    },
    async (request, reply) => {
      const { userId, orgId } = request.auth
      const { id } = request.params as { id: string }

      const todo = await TodoModel.findOneAndDelete({ _id: id, userId: userId!, orgId: orgId || null })

      if (!todo) {
        return reply.status(404).send({ error: 'Todo not found' })
      }

      return reply.status(204).send()
    }
  )
}

export default todosRoutes
