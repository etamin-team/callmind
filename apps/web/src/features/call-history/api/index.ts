import type { CallHistory, CreateCallHistoryRequest, UpdateCallHistoryRequest } from '@repo/types'
import { env } from '@/env'

const API_BASE_URL = env.VITE_API_URL + '/api'

export interface CallHistoryResponse {
  calls: CallHistory[]
  total: number
  limit: number
  skip: number
}

export interface CallHistoryStats {
  totalCalls: number
  completedCalls: number
  missedCalls: number
  totalDuration: number
  averageDuration: number
  totalCost: number
}

export async function getCallHistory(
  agentId: string,
  token: string,
  filters?: {
    status?: string
    direction?: string
    limit?: number
    skip?: number
  }
): Promise<CallHistoryResponse> {
  try {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.direction) params.append('direction', filters.direction)
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.skip) params.append('skip', filters.skip.toString())

    const url = `${API_BASE_URL}/call-history/agent/${agentId}${params.toString() ? `?${params}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch call history')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching call history:', error)
    throw error
  }
}

export async function getCallHistoryStats(
  agentId: string,
  token: string
): Promise<CallHistoryStats> {
  try {
    const response = await fetch(`${API_BASE_URL}/call-history/agent/${agentId}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch call history stats')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching call history stats:', error)
    throw error
  }
}

export async function getCall(callId: string, token: string): Promise<CallHistory> {
  try {
    const response = await fetch(`${API_BASE_URL}/call-history/${callId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch call')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching call:', error)
    throw error
  }
}

export async function createCall(
  data: CreateCallHistoryRequest,
  token: string
): Promise<CallHistory> {
  try {
    const response = await fetch(`${API_BASE_URL}/call-history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to create call')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating call:', error)
    throw error
  }
}

export async function updateCallStatus(
  callId: string,
  token: string,
  updates: {
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
): Promise<CallHistory> {
  try {
    const response = await fetch(`${API_BASE_URL}/call-history/${callId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      throw new Error('Failed to update call status')
    }

    return await response.json()
  } catch (error) {
    console.error('Error updating call status:', error)
    throw error
  }
}

export async function deleteCall(callId: string, token: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/call-history/${callId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    })

    if (!response.ok) {
      throw new Error('Failed to delete call')
    }
  } catch (error) {
    console.error('Error deleting call:', error)
    throw error
  }
}
