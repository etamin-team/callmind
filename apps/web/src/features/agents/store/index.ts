import { create } from 'zustand'
import type { Agent } from '../types'

interface AgentStore {
  agents: Agent[]
  currentAgent: Agent | null
  isLoading: boolean
  error: string | null
  createAgent: (agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateAgent: (id: string, updates: Partial<Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>
  fetchAgents: () => Promise<void>
  setCurrentAgent: (agent: Agent | null) => void
  clearError: () => void
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  agents: [],
  currentAgent: null,
  isLoading: false,
  error: null,
  
  createAgent: async (agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => {
    set((state) => ({ 
      ...state, 
      agents: [...state.agents, { ...agentData, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
      isLoading: true,
      error: null,
    }))
    
    try {
      const response = await fetch(`${process.env.NODE_ENV === 'development' ? 'http://localhost:3001/api' : 'https://api.callmind.ai/v1'}/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData),
      })

      if (!response.ok) {
        set((state) => ({ ...state, isLoading: false, error: 'Failed to create agent' }))
        return
      }

      const createdAgent = await response.json()
      set((state) => ({ 
        ...state, 
        agents: [...state.agents, createdAgent],
        currentAgent: createdAgent,
        isLoading: false,
      }))
    } catch (error) {
      set((state) => ({ ...state, isLoading: false, error: error.message }))
    }
  },
  
  updateAgent: async (id: string, updates: Partial<Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>>) => {
    set((state) => ({ 
      ...state, 
      agents: state.agents.map(agent => 
        agent.id === id ? { ...agent, ...updates, updatedAt: new Date().toISOString() } : agent
      ),
      currentAgent: state.agents.find(agent => agent.id === id) || null,
      isLoading: true,
      error: null,
    }))
    
    try {
      const response = await fetch(`${process.env.NODE_ENV === 'development' ? 'http://localhost:3001/api' : 'https://api.callmind.ai/v1'}/agents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        set((state) => ({ ...state, isLoading: false, error: 'Failed to update agent' }))
        return
      }

      const updatedAgent = await response.json()
      set((state) => ({ 
        ...state, 
        agents: state.agents.map(agent => 
          agent.id === id ? { ...agent, ...updates, updatedAt: new Date().toISOString() } : agent
        ),
        currentAgent: updatedAgent,
        isLoading: false,
      }))
    } catch (error: any) {
      set((state) => ({ ...state, isLoading: false, error: error.message }))
    }
  },
  
  fetchAgents: async () => {
    set((state) => ({ ...state, isLoading: true, error: null }))
    
    try {
      const response = await fetch(`${process.env.NODE_ENV === 'development' ? 'http://localhost:3001/api' : 'https://api.callmind.ai/v1'}/agents`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        set((state) => ({ ...state, isLoading: false, error: 'Failed to fetch agents' }))
        return
      }

      const agents = await response.json()
      set((state) => ({ ...state, agents, isLoading: false }))
    } catch (error) {
      set((state) => ({ ...state, isLoading: false, error: error.message }))
    }
  },
  
  setCurrentAgent: (agent: Agent | null) => {
    set((state) => ({ ...state, currentAgent: agent }))
  },
  
  clearError: () => {
    set((state) => ({ ...state, error: null }))
  },
})
)