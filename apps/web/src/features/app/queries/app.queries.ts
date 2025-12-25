import { useQuery } from '@tanstack/react-query'
import type { DashboardStats, UserProfile } from '../types/app.types'
import { appApi } from '../apis/app.apis'

export const useDashboardStats = () => {
  return useQuery<DashboardStats, Error>({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => appApi.getDashboardStats(),
    staleTime: 1000 * 60, // 1 minute
  })
}

export const useUserProfile = () => {
  return useQuery<UserProfile, Error>({
    queryKey: ['user', 'profile'],
    queryFn: () => appApi.getUserProfile(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
