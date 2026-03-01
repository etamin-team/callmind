import { create } from 'zustand'
import {
  UsageStats,
  UsageTrendData,
  AgentUsage,
  RecentActivity,
  BillingInfo,
  getUsageStats,
  getUsageTrends,
  getAgentUsage,
  getRecentActivity,
  getBillingInfo,
  exportUsage,
} from '../api'

interface UsageStore {
  // State
  stats: UsageStats | null
  trends: UsageTrendData[]
  agentUsage: AgentUsage[]
  recentActivity: RecentActivity[]
  billingInfo: BillingInfo | null
  isLoading: boolean
  error: string | null

  // Period filter
  period: number

  // Actions
  fetchStats: (token: string, period?: number) => Promise<UsageStats>
  fetchTrends: (token: string, period?: number) => Promise<UsageTrendData[]>
  fetchAgentUsage: (token: string, period?: number) => Promise<AgentUsage[]>
  fetchRecentActivity: (token: string, limit?: number) => Promise<RecentActivity[]>
  fetchBillingInfo: (token: string) => Promise<BillingInfo>
  fetchAll: (token: string, period?: number) => Promise<void>
  exportData: (token: string, period?: number) => Promise<void>
  setPeriod: (period: number) => void
  clearError: () => void
}

export const useUsageStore = create<UsageStore>((set, get) => ({
  // Initial state
  stats: null,
  trends: [],
  agentUsage: [],
  recentActivity: [],
  billingInfo: null,
  isLoading: false,
  error: null,
  period: 30,

  // Fetch stats
  fetchStats: async (token: string, period?: number) => {
    set((state) => ({ ...state, isLoading: true, error: null }))
    try {
      const stats = await getUsageStats(token, period || get().period)
      set((state) => ({ ...state, stats, isLoading: false }))
      return stats
    } catch (error: any) {
      set((state) => ({
        ...state,
        isLoading: false,
        error: error.message || 'Failed to fetch usage stats',
      }))
      throw error
    }
  },

  // Fetch trends
  fetchTrends: async (token: string, period?: number) => {
    set((state) => ({ ...state, isLoading: true, error: null }))
    try {
      const trends = await getUsageTrends(token, period || get().period)
      set((state) => ({ ...state, trends, isLoading: false }))
      return trends
    } catch (error: any) {
      set((state) => ({
        ...state,
        isLoading: false,
        error: error.message || 'Failed to fetch usage trends',
      }))
      throw error
    }
  },

  // Fetch agent usage
  fetchAgentUsage: async (token: string, period?: number) => {
    set((state) => ({ ...state, isLoading: true, error: null }))
    try {
      const agentUsage = await getAgentUsage(token, period || get().period)
      set((state) => ({ ...state, agentUsage, isLoading: false }))
      return agentUsage
    } catch (error: any) {
      set((state) => ({
        ...state,
        isLoading: false,
        error: error.message || 'Failed to fetch agent usage',
      }))
      throw error
    }
  },

  // Fetch recent activity
  fetchRecentActivity: async (token: string, limit = 20) => {
    set((state) => ({ ...state, isLoading: true, error: null }))
    try {
      const recentActivity = await getRecentActivity(token, limit)
      set((state) => ({ ...state, recentActivity, isLoading: false }))
      return recentActivity
    } catch (error: any) {
      set((state) => ({
        ...state,
        isLoading: false,
        error: error.message || 'Failed to fetch recent activity',
      }))
      throw error
    }
  },

  // Fetch billing info
  fetchBillingInfo: async (token: string) => {
    set((state) => ({ ...state, isLoading: true, error: null }))
    try {
      const billingInfo = await getBillingInfo(token)
      set((state) => ({ ...state, billingInfo, isLoading: false }))
      return billingInfo
    } catch (error: any) {
      set((state) => ({
        ...state,
        isLoading: false,
        error: error.message || 'Failed to fetch billing info',
      }))
      throw error
    }
  },

  // Fetch all usage data
  fetchAll: async (token: string, period?: number) => {
    set((state) => ({ ...state, isLoading: true, error: null }))
    try {
      const actualPeriod = period || get().period
      const [stats, trends, agentUsage, recentActivity, billingInfo] =
        await Promise.all([
          getUsageStats(token, actualPeriod),
          getUsageTrends(token, actualPeriod),
          getAgentUsage(token, actualPeriod),
          getRecentActivity(token),
          getBillingInfo(token),
        ])
      set((state) => ({
        ...state,
        stats,
        trends,
        agentUsage,
        recentActivity,
        billingInfo,
        isLoading: false,
      }))
    } catch (error: any) {
      set((state) => ({
        ...state,
        isLoading: false,
        error: error.message || 'Failed to fetch usage data',
      }))
      throw error
    }
  },

  // Export data
  exportData: async (token: string, period?: number) => {
    try {
      await exportUsage(token, period || get().period)
    } catch (error: any) {
      set((state) => ({
        ...state,
        error: error.message || 'Failed to export usage data',
      }))
      throw error
    }
  },

  // Set period
  setPeriod: (period: number) => {
    set((state) => ({ ...state, period }))
  },

  // Clear error
  clearError: () => {
    set((state) => ({ ...state, error: null }))
  },
}))
