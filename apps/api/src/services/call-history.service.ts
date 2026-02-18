import { CallHistoryModel } from '@repo/db'
import { CreateCallHistoryRequest, CallHistory } from '@repo/types'

export class CallHistoryService {
  /**
   * Create a new call record when a call starts
   */
  static async createCall(data: CreateCallHistoryRequest): Promise<CallHistory> {
    const call = await CallHistoryModel.create({
      ...data,
      status: data.status || 'ringing',
      startedAt: data.startedAt || new Date(),
    })
    return call.toJSON() as CallHistory
  }

  /**
   * Update call record with completion data
   */
  static async updateCallCompletion(
    callId: string,
    updates: {
      duration?: number
      recordingUrl?: string
      transcript?: string
      sentiment?: string
      topics?: string[]
      summary?: string
      collectedData?: Record<string, string>
      cost?: number
    }
  ): Promise<CallHistory | null> {
    const updateData: any = {
      ...updates,
      status: 'completed',
      endedAt: new Date(),
    }

    const call = await CallHistoryModel.findByIdAndUpdate(callId, updateData, { new: true })
    return call ? (call.toJSON() as CallHistory) : null
  }

  /**
   * Update call status
   */
  static async updateCallStatus(
    callId: string,
    status: 'completed' | 'missed' | 'failed' | 'in-progress' | 'ringing'
  ): Promise<CallHistory | null> {
    const updateData: any = { status }

    if (status === 'completed' || status === 'missed' || status === 'failed') {
      updateData.endedAt = new Date()
    }

    const call = await CallHistoryModel.findByIdAndUpdate(callId, updateData, { new: true })
    return call ? (call.toJSON() as CallHistory) : null
  }

  /**
   * Find call by external call ID (e.g., Twilio CallSid)
   */
  static async findByCallSid(callSid: string): Promise<CallHistory | null> {
    const call = await CallHistoryModel.findOne({ callSid })
    return call ? (call.toJSON() as CallHistory) : null
  }

  /**
   * Get call history for an agent
   */
  static async getAgentCallHistory(
    agentId: string,
    filters?: {
      status?: string
      direction?: string
      limit?: number
      skip?: number
    }
  ): Promise<{ calls: CallHistory[]; total: number }> {
    const filter: any = { agentId }
    if (filters?.status) filter.status = filters.status
    if (filters?.direction) filter.direction = filters.direction

    const limit = filters?.limit || 50
    const skip = filters?.skip || 0

    const calls = await CallHistoryModel.find(filter)
      .sort({ startedAt: -1 })
      .limit(limit)
      .skip(skip)

    const total = await CallHistoryModel.countDocuments(filter)

    return {
      calls: calls.map((c) => c.toJSON() as CallHistory),
      total,
    }
  }

  /**
   * Get call statistics for an agent
   */
  static async getAgentStats(agentId: string) {
    const stats = await CallHistoryModel.aggregate([
      { $match: { agentId } },
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

    return (
      stats[0] || {
        totalCalls: 0,
        completedCalls: 0,
        missedCalls: 0,
        totalDuration: 0,
        averageDuration: 0,
        totalCost: 0,
      }
    )
  }
}
