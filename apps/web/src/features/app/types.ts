export interface DashboardStats {
  totalInteractions: string
  activeUsers: string
  responseRate: string
  avgResponseTime: string
}

export interface ActivityItem {
  id: string
  title: string
  description: string
  time: string
  status: 'completed' | 'pending' | 'in-progress'
}

export interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTodoInput {
  title: string
}

export interface UpdateTodoInput {
  title?: string
  completed?: boolean
}
