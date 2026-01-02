// Agent types and interfaces
export interface AIAgent {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive' | 'training' | 'error'
  avatar?: string
  capabilities: string[]
  model: string
  temperature: number
  maxTokens: number
  createdAt: Date
  updatedAt: Date
  performance: {
    totalCalls: number
    successRate: number
    avgResponseTime: number
    customerSatisfaction: number
  }
  configuration: {
    language: string
    voice: string
    personality: string
    knowledgeBase: string[]
    escalationThreshold: number
  }
}

export interface AgentTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: string
  capabilities: string[]
  recommendedSettings: Partial<AIAgent>
}

export interface CreateAgentStep {
  id: string
  title: string
  description: string
  component: React.ComponentType<any>
}
