export * from '@repo/types/agent'

// Keep existing UI specific types if needed, or remove if replaced
export interface AgentTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: string
  capabilities: string[]
  recommendedSettings: {
    model?: string
    temperature?: number
    maxTokens?: number
    configuration?: any
  }
}

export interface CreateAgentStep {
  id: string
  title: string
  description: string
  component: React.ComponentType<any>
}
