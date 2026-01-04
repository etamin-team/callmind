import type { CreateAgentRequest, CreateAgentResponse, Agent, UpdateAgentRequest } from '../types'

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3001/api' 
  : 'https://api.callmind.ai/v1'

export async function createAgent(data: CreateAgentRequest): Promise<CreateAgentResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

export async function updateAgent(id: string, data: UpdateAgentRequest): Promise<Agent> {
  try {
    const response = await fetch(`${API_BASE_URL}/agents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
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

export async function getAgents(): Promise<Array<Agent>> {
  try {
    const response = await fetch(`${API_BASE_URL}/agents`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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
