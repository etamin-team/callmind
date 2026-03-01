import { env } from '@/env'

const API_BASE_URL = env.VITE_API_URL + '/api'

export interface UsageStats {
  totalCalls: number
  totalMinutes: number
  totalCost: number
  avgCostPerCall: number
}

export interface UsageTrendData {
  date: string
  calls: number
  minutes: number
  cost: number
}

export interface AgentUsage {
  agentId: string
  agentName: string
  calls: number
  minutes: number
  cost: number
  percentage: number
}

export interface RecentActivity {
  callId: string
  agentName: string
  agentId: string
  time: string
  duration: string
  durationMinutes: number
  cost: string
  status: string
  direction: string
  callerNumber?: string
}

export interface BillingInfo {
  credits: number
  plan: string
  usage: {
    totalCalls: number
    totalMinutes: number
    totalCost: number
  }
}

export async function getUsageStats(
  token: string,
  period?: number,
  startDate?: string,
  endDate?: string
): Promise<UsageStats> {
  const params = new URLSearchParams()
  if (period) params.append('period', period.toString())
  if (startDate) params.append('startDate', startDate)
  if (endDate) params.append('endDate', endDate)

  const response = await fetch(`${API_BASE_URL}/usage/stats?${params}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch usage stats')
  }

  return response.json()
}

export async function getUsageTrends(
  token: string,
  period = 30,
  groupBy: 'day' | 'week' = 'day'
): Promise<UsageTrendData[]> {
  const response = await fetch(
    `${API_BASE_URL}/usage/trends?period=${period}&groupBy=${groupBy}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch usage trends')
  }

  return response.json()
}

export async function getAgentUsage(
  token: string,
  period = 30,
  limit = 10
): Promise<AgentUsage[]> {
  const response = await fetch(
    `${API_BASE_URL}/usage/agents?period=${period}&limit=${limit}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch agent usage')
  }

  return response.json()
}

export async function getRecentActivity(
  token: string,
  limit = 20
): Promise<RecentActivity[]> {
  const response = await fetch(
    `${API_BASE_URL}/usage/recent?limit=${limit}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch recent activity')
  }

  return response.json()
}

export async function getBillingInfo(token: string): Promise<BillingInfo> {
  const response = await fetch(`${API_BASE_URL}/usage/billing`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch billing info')
  }

  return response.json()
}

export async function exportUsage(
  token: string,
  period = 30,
  format: 'csv' | 'json' = 'csv'
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/usage/export?period=${period}&format=${format}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to export usage')
  }

  // Download the file
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `usage-export-${new Date().toISOString().split('T')[0]}.${format}`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}
