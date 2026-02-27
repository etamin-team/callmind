import { db, callHistory, eq, and, desc, count } from '@repo/db'
import { CreateCallHistoryRequest, CallHistory } from '@repo/types'

export class CallHistoryService {
  /**
   * Create a new call record when a call starts
   */
  static async createCall(data: CreateCallHistoryRequest): Promise<CallHistory> {
    const result = await db
      .insert(callHistory)
      .values({
        ...data,
        status: data.status || 'ringing',
        startedAt: data.startedAt || new Date(),
      } as any)
      .returning()
    return result[0] as CallHistory
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
    const result = await db
      .update(callHistory)
      .set({
        ...updates,
        status: 'completed',
        endedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(callHistory.id, callId))
      .returning()
    return result[0] ? (result[0] as CallHistory) : null
  }

  /**
   * Update call status
   */
  static async updateCallStatus(
    callId: string,
    status: 'completed' | 'missed' | 'failed' | 'in-progress' | 'ringing'
  ): Promise<CallHistory | null> {
    const updateData: any = { status, updatedAt: new Date() }

    if (status === 'completed' || status === 'missed' || status === 'failed') {
      updateData.endedAt = new Date()
    }

    const result = await db
      .update(callHistory)
      .set(updateData)
      .where(eq(callHistory.id, callId))
      .returning()
    return result[0] ? (result[0] as CallHistory) : null
  }

  /**
   * Find call by external call ID (e.g., Twilio CallSid)
   */
  static async findByCallSid(callSid: string): Promise<CallHistory | null> {
    const result = await db
      .select()
      .from(callHistory)
      .where(eq(callHistory.callSid, callSid))
    return result[0] ? (result[0] as CallHistory) : null
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
    const conditions = [eq(callHistory.agentId, agentId)]
    if (filters?.status) {
      conditions.push(eq(callHistory.status, filters.status))
    }
    if (filters?.direction) {
      conditions.push(eq(callHistory.direction, filters.direction))
    }

    const limit = filters?.limit || 50
    const skip = filters?.skip || 0

    const callsResult = await db
      .select()
      .from(callHistory)
      .where(and(...conditions))
      .orderBy(desc(callHistory.startedAt))
      .limit(limit)
      .offset(skip)

    const totalResult = await db
      .select({ count: count() })
      .from(callHistory)
      .where(and(...conditions))

    return {
      calls: callsResult.map((c) => c as CallHistory),
      total: totalResult[0]?.count || 0,
    }
  }

  /**
   * Get call statistics for an agent
   */
  static async getAgentStats(agentId: string) {
    const callsResult = await db
      .select()
      .from(callHistory)
      .where(eq(callHistory.agentId, agentId))

    const totalCalls = callsResult.length
    const completedCalls = callsResult.filter(c => c.status === 'completed').length
    const missedCalls = callsResult.filter(c => c.status === 'missed').length
    const totalDuration = callsResult.reduce((sum, c) => sum + (c.duration || 0), 0)
    const totalCost = callsResult.reduce((sum, c) => sum + (c.cost || 0), 0)

    return {
      totalCalls,
      completedCalls,
      missedCalls,
      totalDuration,
      averageDuration: totalCalls > 0 ? totalDuration / totalCalls : 0,
      totalCost,
    }
  }
}
