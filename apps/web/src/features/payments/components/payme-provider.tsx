import { env } from '@/env'

declare global {
  interface Window {
    Payme?: {
      initialize: (config: {
        merchant: string
        environment?: 'sandbox' | 'production'
      }) => void
      Checkout: {
        open: (options: {
          amount: number
          account: {
            order_id: string
            phone?: string
            user_id?: string
            plan?: string
            yearly?: string
          }
          lang?: string
          callback?: string
        }) => void
      }
    }
  }
}

interface PaymeProviderProps {
  children: React.ReactNode
}

export function PaymeProvider({ children }: PaymeProviderProps) {
  const merchantId = env.VITE_PAYME_MERCHANT_ID

  if (!merchantId) {
    console.warn('Payme merchant ID not configured')
    return <>{children}</>
  }

  return <>{children}</>
}

export function usePayme() {
  const isConfigured = !!env.VITE_PAYME_MERCHANT_ID

  const openCheckout = async (options: {
    amount: number
    orderId: string
    userId?: string
    phone?: string
    plan?: string
    yearly?: boolean
    callbackUrl?: string
  }) => {
    const { amount, orderId, userId, phone, plan, yearly, callbackUrl } =
      options

    const account: {
      order_id: string
      phone?: string
      user_id?: string
      plan?: string
      yearly?: string
    } = {
      order_id: orderId,
    }

    if (phone) account.phone = phone
    if (userId) account.user_id = userId
    if (plan) account.plan = plan
    if (yearly !== undefined) account.yearly = yearly.toString()

    if (window.Payme) {
      window.Payme.Checkout.open({
        amount,
        account,
        lang: 'en',
        callback: callbackUrl,
      })
    } else {
      console.error('Payme.js not loaded')
    }
  }

  const redirectToCheckout = (checkoutUrl: string) => {
    window.location.href = checkoutUrl
  }

  return {
    isConfigured,
    openCheckout,
    redirectToCheckout,
  }
}
