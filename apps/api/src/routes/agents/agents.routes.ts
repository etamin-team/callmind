import { FastifyPluginAsync } from 'fastify'
import { AgentModel } from '@repo/db'
import { CreateAgentSchema, UpdateAgentSchema } from '@repo/types'
import { requireAuth } from '../../middleware/auth.middleware.js'

const agentsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', requireAuth)

  // Get all agents
  fastify.get('/', async (request) => {
    const { userId, orgId } = request.auth
    const agents = await AgentModel.find({ userId, orgId: orgId || null }).sort({ createdAt: -1 })
    return agents
  })

  // Get single agent
  fastify.get('/:id', async (request, reply) => {
    const { userId, orgId } = request.auth
    const { id } = request.params as { id: string }
    const agent = await AgentModel.findOne({ _id: id, userId, orgId: orgId || null })
    if (!agent) {
      return reply.status(404).send({ error: 'Agent not found' })
    }
    return agent
  })

  // Create agent
  fastify.post('/', async (request, reply) => {
    const { userId, orgId } = request.auth
    // Validation
    const data = CreateAgentSchema.parse(request.body)
    
    const agent = await AgentModel.create({
      ...data,
      userId: userId!,
      orgId: orgId || null,
    })
    
    return reply.status(201).send(agent)
  })

  // Update agent
  fastify.put('/:id', async (request, reply) => {
    const { userId, orgId } = request.auth
    const { id } = request.params as { id: string }
    const data = UpdateAgentSchema.parse(request.body)
    
    const agent = await AgentModel.findOneAndUpdate(
      { _id: id, userId, orgId: orgId || null },
      data,
      { new: true }
    )
    
    if (!agent) {
      return reply.status(404).send({ error: 'Agent not found' })
    }
    
    return agent
  })

  // Delete agent
  fastify.delete('/:id', async (request, reply) => {
    const { userId, orgId } = request.auth
    const { id } = request.params as { id: string }
    
    const agent = await AgentModel.findOneAndDelete({ _id: id, userId, orgId: orgId || null })
    
    if (!agent) {
      return reply.status(404).send({ error: 'Agent not found' })
    }
    
    return reply.status(204).send()
  })
}

export default agentsRoutes
