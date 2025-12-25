import type { DashboardStats, UserProfile } from '../types/app.types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export class AppApi {
  private static instance: AppApi

  static getInstance(): AppApi {
    if (!AppApi.instance) {
      AppApi.instance = new AppApi()
    }
    return AppApi.instance
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats')
    }

    return response.json()
  }

  async getUserProfile(): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user profile')
    }

    return response.json()
  }
}

export const appApi = AppApi.getInstance()
