import type {
  Contact,
  CreateContactRequest,
  UpdateContactRequest,
} from '@repo/types'

export type { Contact, CreateContactRequest, UpdateContactRequest }

export interface ContactQueryParams {
  agentId?: string
  status?: 'hot-lead' | 'potential' | 'customer' | 'cold' | 'inactive'
  tag?: string
  search?: string
  limit?: number
  offset?: number
}
