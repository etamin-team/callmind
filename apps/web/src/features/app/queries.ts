import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchDashboardStats, fetchRecentActivity, fetchTodos, createTodo, updateTodo, deleteTodo } from './apis'
import { useAuth } from '@clerk/clerk-react'

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  })
}

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: fetchRecentActivity,
  })
}

export const useTodos = () => {
  const { getToken, orgId } = useAuth()
  return useQuery({
    queryKey: ['todos', orgId],
    queryFn: async () => {
      const token = await getToken()
      return fetchTodos(token || '')
    },
  })
}

export const useCreateTodo = () => {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (title: string) => {
      const token = await getToken()
      return createTodo(token || '', { title })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export const useUpdateTodo = () => {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, completed, title }: { id: string; completed?: boolean; title?: string }) => {
      const token = await getToken()
      return updateTodo(token || '', id, { completed, title })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export const useDeleteTodo = () => {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      return deleteTodo(token || '', id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}
