import type {
  Contact,
  CreateContactRequest,
  UpdateContactRequest,
  ContactQueryParams,
} from '../types'
import { env } from '@/env'

const API_BASE_URL = env.VITE_API_URL + '/api'

export async function getContacts(
  token: string,
  params?: ContactQueryParams,
): Promise<Contact[]> {
  try {
    const searchParams = new URLSearchParams()

    if (params?.agentId) searchParams.append('agentId', params.agentId)
    if (params?.status) searchParams.append('status', params.status)
    if (params?.tag) searchParams.append('tag', params.tag)
    if (params?.search) searchParams.append('search', params.search)
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.offset) searchParams.append('offset', params.offset.toString())

    const queryString = searchParams.toString()
    const url = `${API_BASE_URL}/contacts${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch contacts')
    }

    const data = await response.json()
    // Convert date strings to Date objects
    return data.map((contact: any) => ({
      ...contact,
      lastCallAt: contact.lastCallAt ? new Date(contact.lastCallAt) : undefined,
      createdAt: contact.createdAt ? new Date(contact.createdAt) : undefined,
      updatedAt: contact.updatedAt ? new Date(contact.updatedAt) : undefined,
    }))
  } catch (error) {
    console.error('Error fetching contacts:', error)
    throw error
  }
}

export async function getContact(id: string, token: string): Promise<Contact> {
  try {
    const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch contact')
    }

    const data = await response.json()
    return {
      ...data,
      lastCallAt: data.lastCallAt ? new Date(data.lastCallAt) : undefined,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    }
  } catch (error) {
    console.error('Error fetching contact:', error)
    throw error
  }
}

export async function createContact(
  data: CreateContactRequest,
  token: string,
): Promise<Contact> {
  try {
    const response = await fetch(`${API_BASE_URL}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to create contact')
    }

    const result = await response.json()
    return {
      ...result,
      lastCallAt: result.lastCallAt ? new Date(result.lastCallAt) : undefined,
      createdAt: result.createdAt ? new Date(result.createdAt) : undefined,
      updatedAt: result.updatedAt ? new Date(result.updatedAt) : undefined,
    }
  } catch (error) {
    console.error('Error creating contact:', error)
    throw error
  }
}

export async function updateContact(
  id: string,
  data: UpdateContactRequest,
  token: string,
): Promise<Contact> {
  try {
    const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to update contact')
    }

    const result = await response.json()
    return {
      ...result,
      lastCallAt: result.lastCallAt ? new Date(result.lastCallAt) : undefined,
      createdAt: result.createdAt ? new Date(result.createdAt) : undefined,
      updatedAt: result.updatedAt ? new Date(result.updatedAt) : undefined,
    }
  } catch (error) {
    console.error('Error updating contact:', error)
    throw error
  }
}

export async function deleteContact(id: string, token: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to delete contact')
    }
  } catch (error) {
    console.error('Error deleting contact:', error)
    throw error
  }
}
