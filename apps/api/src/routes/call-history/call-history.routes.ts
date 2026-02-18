import { FastifyPluginAsync } from 'fastify'
import { CallHistoryModel } from '@repo/db'
import { CreateCallHistorySchema, UpdateCallHistorySchema } from '@repo/types'
import { requireAuth } from '../../middleware/auth.middleware.js'

const callHistoryRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', requireAuth)

  // Get all call history for an agent
  fastify.get('/agent/:agentId', async (request, reply) => {
    const { userId, orgId } = request.auth
    const { agentId } = request.params as { agentId: string }
    const { status, direction, limit = '50', skip = '0' } = request.query as {
      status?: string
      direction?: string
      limit?: string
      skip?: string
    }

    const filter: any = { agentId, userId, orgId: orgId || null }
    if (status) filter.status = status
    if (direction) filter.direction = direction

    const calls = await CallHistoryModel.find(filter)
      .sort({ startedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))

    const total = await CallHistoryModel.countDocuments(filter)

    return { calls, total, limit: parseInt(limit), skip: parseInt(skip) }
  })

  // Get call statistics for an agent
  fastify.get('/agent/:agentId/stats', async (request, reply) => {
    const { userId, orgId } = request.auth
    const { agentId } = request.params as { agentId: string }

    const stats = await CallHistoryModel.aggregate([
      { $match: { agentId, userId, orgId: orgId || null } },
      {
        $group: {
          _id: null,
          totalCalls: { $sum: 1 },
          completedCalls: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          missedCalls: {
            $sum: { $cond: [{ $eq: ['$status', 'missed'] }, 1, 0] },
          },
          totalDuration: { $sum: '$duration' },
          averageDuration: { $avg: '$duration' },
          totalCost: { $sum: '$cost' },
        },
      },
    ])

    return stats[0] || {
      totalCalls: 0,
      completedCalls: 0,
      missedCalls: 0,
      totalDuration: 0,
      averageDuration: 0,
      totalCost: 0,
    }
  })

  // Get single call record
  fastify.get('/:callId', async (request, reply) => {
    const { userId, orgId } = request.auth
    const { callId } = request.params as { callId: string }

    const call = await CallHistoryModel.findOne({
      _id: callId,
      userId,
      orgId: orgId || null,
    })

    if (!call) {
      return reply.status(404).send({ error: 'Call not found' })
    }

    return call
  })

  // Create call record
  fastify.post('/', async (request, reply) => {
    const { userId, orgId } = request.auth
    const data = CreateCallHistorySchema.parse(request.body)

    const call = await CallHistoryModel.create({
      ...data,
      userId: userId!,
      orgId: orgId || null,
    })

    return reply.status(201).send(call)
  })

  // Update call record (for updating status, transcript, etc.)
  fastify.put('/:callId', async (request, reply) => {
    const { userId, orgId } = request.auth
    const { callId } = request.params as { callId: string }
    const data = UpdateCallHistorySchema.parse(request.body)

    const call = await CallHistoryModel.findOneAndUpdate(
      { _id: callId, userId, orgId: orgId || null },
      data,
      { new: true }
    )

    if (!call) {
      return reply.status(404).send({ error: 'Call not found' })
    }

    return call
  })

  // Delete call record
  fastify.delete('/:callId', async (request, reply) => {
    const { userId, orgId } = request.auth
    const { callId } = request.params as { callId: string }

    const call = await CallHistoryModel.findOneAndDelete({
      _id: callId,
      userId,
      orgId: orgId || null,
    })

    if (!call) {
      return reply.status(404).send({ error: 'Call not found' })
    }

    return reply.status(204).send()
  })

  // Update call status (endpoint for call processing)
  fastify.patch('/:callId/status', async (request, reply) => {
    const { userId, orgId } = request.auth
    const { callId } = request.params as { callId: string }
    const { status, duration, recordingUrl, transcript, sentiment, topics, summary, collectedData, cost } =
      request.body as {
        status?: string
        duration?: number
        recordingUrl?: string
        transcript?: string
        sentiment?: string
        topics?: string[]
        summary?: string
        collectedData?: Record<string, string>
        cost?: number
      }

    const updateData: any = {}
    if (status) updateData.status = status
    if (duration !== undefined) updateData.duration = duration
    if (recordingUrl) updateData.recordingUrl = recordingUrl
    if (transcript) updateData.transcript = transcript
    if (sentiment) updateData.sentiment = sentiment
    if (topics) updateData.topics = topics
    if (summary) updateData.summary = summary
    if (collectedData) updateData.collectedData = collectedData
    if (cost !== undefined) updateData.cost = cost
    if (status === 'completed' || status === 'missed' || status === 'failed') {
      updateData.endedAt = new Date()
    }

    const call = await CallHistoryModel.findOneAndUpdate(
      { _id: callId, userId, orgId: orgId || null },
      updateData,
      { new: true }
    )

    if (!call) {
      return reply.status(404).send({ error: 'Call not found' })
    }

    return call
  })
}

export default callHistoryRoutes
