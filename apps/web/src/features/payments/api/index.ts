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

export interface FreedompayCheckoutResponse {
  checkoutUrl: string
  orderId: string
  paymentId: string
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

async function getProducts() {
  const response = await fetch(`${API_URL}/api/payments/products`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch products')
  }

  return response.json()
}

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

export function useCreateCheckout() {
  return useMutation({
    mutationFn: createCheckout,
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
      if (data.customerPortalUrl) {
        window.location.href = data.customerPortalUrl
      }
    },
  })
}

export async function createFreedompayCheckout(
  plan: string,
  data: {
    yearly?: boolean
    userId?: string
    phone?: string
  },
): Promise<FreedompayCheckoutResponse> {
  const response = await fetch(`${API_URL}/api/freedompay/checkout/${plan}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create FreedomPay checkout')
  }

  return response.json()
}

export function useCreateFreedompayCheckout() {
  return useMutation({
    mutationFn: ({
      plan,
      data,
    }: {
      plan: string
      data: Parameters<typeof createFreedompayCheckout>[1]
    }) => createFreedompayCheckout(plan, data),
  })
}

export async function getFreedompayPrices() {
  const response = await fetch(`${API_URL}/api/freedompay/prices`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch FreedomPay prices')
  }

  return response.json()
}

export function useGetFreedompayPrices() {
  return useQuery({
    queryKey: ['freedompay-prices'],
    queryFn: getFreedompayPrices,
  })
}

export async function chargeRecurringPayment(data: {
  recurringProfileId: string
  amount: number
  orderId: string
  description?: string
}) {
  const response = await fetch(`${API_URL}/api/freedompay/recurring/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to charge recurring payment')
  }

  return response.json()
}

export function useChargeRecurringPayment() {
  return useMutation({
    mutationFn: chargeRecurringPayment,
  })
}

export interface PaymeCheckoutResponse {
  checkoutUrl: string
  orderId: string
  plan: string
  yearly: boolean
}

async function createPaymeCheckout(
  plan: string,
  data: {
    yearly?: boolean
    userId?: string
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
      data: {
        yearly?: boolean
        userId?: string
        recurring?: boolean
      }
    }) => createPaymeCheckout(plan, data),
  })
}
