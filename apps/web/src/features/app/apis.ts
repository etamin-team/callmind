import api from '@/libs/api'
import { DashboardStats, ActivityItem, Todo, CreateTodoInput, UpdateTodoInput } from './types'

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  // Mock for now, can be implemented later
  return {
    totalInteractions: '1,234',
    activeUsers: '89',
    responseRate: '94.2%',
    avgResponseTime: '1.2s',
  }
}

export const fetchRecentActivity = async (): Promise<ActivityItem[]> => {
  // Mock data
  return [
    {
      id: '1',
      title: 'New user registration',
      description: 'John Doe signed up for Callmind',
      time: '2 minutes ago',
      status: 'completed',
    },
    {
      id: '2',
      title: 'API integration complete',
      description: 'Successfully connected to external service',
      time: '15 minutes ago',
      status: 'completed',
    },
  ]
}

// Todo CRUD Actions
export const fetchTodos = async (token: string): Promise<Todo[]> => {
  const response = await api.get('/todos', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const createTodo = async (token: string, input: CreateTodoInput): Promise<Todo> => {
  const response = await api.post('/todos', input, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const updateTodo = async (token: string, id: string, input: UpdateTodoInput): Promise<Todo> => {
  const response = await api.patch(`/todos/${id}`, input, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const deleteTodo = async (token: string, id: string): Promise<void> => {
  await api.delete(`/todos/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
