import type { CreateAgentRequest, Agent, UpdateAgentRequest } from '../types'
import { env } from '@/env'

const API_BASE_URL = env.VITE_API_URL + '/api'

export async function createAgent(data: CreateAgentRequest, token: string): Promise<Agent> {
  try {
    const response = await fetch(`${API_BASE_URL}/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to create agent')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating agent:', error)
    throw error
  }
}

export async function updateAgent(id: string, data: UpdateAgentRequest, token: string): Promise<Agent> {
  try {
    const response = await fetch(`${API_BASE_URL}/agents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to update agent')
    }

    return await response.json()
  } catch (error) {
    console.error('Error updating agent:', error)
    throw error
  }
}

export async function getAgents(token: string): Promise<Array<Agent>> {
  try {
    const response = await fetch(`${API_BASE_URL}/agents`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch agents')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching agents:', error)
    throw error
  }
}

export async function deleteAgent(id: string, token: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/agents/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    })

    if (!response.ok) {
      throw new Error('Failed to delete agent')
    }
  } catch (error) {
    console.error('Error deleting agent:', error)
    throw error
  }
}
