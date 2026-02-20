import { useMutation, useQuery } from '@tanstack/react-query'
import { env } from '@/env'

const API_URL = env.VITE_API_URL

export interface CreateCheckoutRequest {
  priceId?: string
  productId?: string
  customerEmail?: string
  customerName?: string
  metadata?: Record<string, string>
}

export interface CreateCheckoutForPlanRequest {
  yearly?: boolean
  customerEmail?: string
  customerName?: string
  metadata?: Record<string, string>
}

export interface CheckoutResponse {
  transactionId: string
  plan?: string
  yearly?: boolean
}

export interface PaymeCheckoutResponse {
  checkoutUrl: string
  orderId: string
  amount: number
  amountDisplay: number
  currency: string
  plan: string
  yearly: boolean
}

export interface CustomerPortalRequest {
  customerId: string
}

export interface CustomerPortalResponse {
  customerPortalUrl: string
}

// Create a generic checkout session
async function createCheckout(
  data: CreateCheckoutRequest,
): Promise<CheckoutResponse> {
  const response = await fetch(`${API_URL}/api/payments/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create checkout session')
  }

  return response.json()
}

// Create a checkout session for a specific plan
async function createCheckoutForPlan(
  plan: string,
  data: CreateCheckoutForPlanRequest,
): Promise<CheckoutResponse> {
  const response = await fetch(`${API_URL}/api/payments/checkout/${plan}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create checkout session')
  }

  return response.json()
}

// Get available products
async function getProducts() {
  const response = await fetch(`${API_URL}/api/payments/products`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch products')
  }

  return response.json()
}

// Create customer portal session
async function createCustomerPortal(
  data: CustomerPortalRequest,
): Promise<CustomerPortalResponse> {
  const response = await fetch(`${API_URL}/api/payments/customer-portal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create customer portal session')
  }

  return response.json()
}

// React Query hooks
export function useCreateCheckout() {
  return useMutation({
    mutationFn: createCheckout,
    // Return data for the component to handle Paddle checkout overlay
  })
}

export function useCreateCheckoutForPlan() {
  return useMutation({
    mutationFn: ({
      plan,
      data,
    }: {
      plan: string
      data: CreateCheckoutForPlanRequest
    }) => createCheckoutForPlan(plan, data),
    // Return data for the component to handle Paddle checkout overlay
  })
}

export function useGetProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  })
}

export function useCreateCustomerPortal() {
  return useMutation({
    mutationFn: createCustomerPortal,
    onSuccess: (data) => {
      // Redirect to customer portal
      if (data.customerPortalUrl) {
        window.location.href = data.customerPortalUrl
      }
    },
  })
}

// Payme checkout functions
export async function createPaymeCheckout(
  plan: string,
  data: {
    yearly?: boolean
    userId?: string
    phone?: string
    recurring?: boolean
  },
): Promise<PaymeCheckoutResponse> {
  const response = await fetch(`${API_URL}/api/payme/checkout/${plan}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create Payme checkout')
  }

  return response.json()
}

export function useCreatePaymeCheckout() {
  return useMutation({
    mutationFn: ({
      plan,
      data,
    }: {
      plan: string
      data: Parameters<typeof createPaymeCheckout>[1]
    }) => createPaymeCheckout(plan, data),
  })
}

export async function getPaymePrices() {
  const response = await fetch(`${API_URL}/api/payme/prices`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch Payme prices')
  }

  return response.json()
}

export function useGetPaymePrices() {
  return useQuery({
    queryKey: ['payme-prices'],
    queryFn: getPaymePrices,
  })
}
