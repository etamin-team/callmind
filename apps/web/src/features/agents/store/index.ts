import { create } from 'zustand'
import { Agent, CreateAgentRequest, UpdateAgentRequest } from '../types'
import { createAgent, updateAgent, getAgents, deleteAgent } from '../api'

interface AgentStore {
  agents: Agent[]
  currentAgent: Agent | null
  isLoading: boolean
  error: string | null
  
  createAgent: (agentData: CreateAgentRequest, token: string) => Promise<Agent>
  updateAgent: (id: string, updates: UpdateAgentRequest, token: string) => Promise<void>
  deleteAgent: (id: string, token: string) => Promise<void>
  fetchAgents: (token: string) => Promise<void>
  
  setCurrentAgent: (agent: Agent | null) => void
  clearError: () => void
}

export const useAgentStore = create<AgentStore>((set) => ({
  agents: [],
  currentAgent: null,
  isLoading: false,
  error: null,
  
  createAgent: async (agentData: CreateAgentRequest, token: string) => {
    set((state) => ({ ...state, isLoading: true, error: null }))
    
    try {
      const createdAgent = await createAgent(agentData, token)
      set((state) => ({ 
        ...state, 
        agents: [createdAgent, ...state.agents],
        currentAgent: createdAgent,
        isLoading: false,
      }))
      return createdAgent
    } catch (error: any) {
      set((state) => ({ ...state, isLoading: false, error: error.message || 'Failed to create agent' }))
      throw error
    }
  },
  
  updateAgent: async (id: string, updates: UpdateAgentRequest, token: string) => {
    set((state) => ({ ...state, isLoading: true, error: null }))
    
    try {
      const updatedAgent = await updateAgent(id, updates, token)
      set((state) => ({ 
        ...state, 
        agents: state.agents.map(agent => agent.id === id ? updatedAgent : agent),
        currentAgent: updatedAgent,
        isLoading: false,
      }))
    } catch (error: any) {
      set((state) => ({ ...state, isLoading: false, error: error.message || 'Failed to update agent' }))
      throw error
    }
  },

  deleteAgent: async (id: string, token: string) => {
     set((state) => ({ ...state, isLoading: true, error: null }))
     try {
        await deleteAgent(id, token)
        set((state) => ({
           ...state,
           agents: state.agents.filter(a => a.id !== id),
           isLoading: false
        }))
     } catch (error: any) {
        set((state) => ({ ...state, isLoading: false, error: error.message || 'Failed to delete agent' }))
        throw error
     }
  },
  
  fetchAgents: async (token: string) => {
    set((state) => ({ ...state, isLoading: true, error: null }))
    
    try {
      const agents = await getAgents(token)
      set((state) => ({ ...state, agents, isLoading: false }))
    } catch (error: any) {
      set((state) => ({ ...state, isLoading: false, error: error.message || 'Failed to fetch agents' }))
    }
  },
  
  setCurrentAgent: (agent: Agent | null) => {
    set((state) => ({ ...state, currentAgent: agent }))
  },
  
  clearError: () => {
    set((state) => ({ ...state, error: null }))
  },
}))