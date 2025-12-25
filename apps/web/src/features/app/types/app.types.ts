export interface DashboardStats {
  totalUsers: number
  activeSessions: number
  revenue: number
  growth: number
}

export interface UserProfile {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
}
