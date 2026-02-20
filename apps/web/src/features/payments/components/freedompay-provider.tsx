import { env } from '@/env'

interface FreedompayProviderProps {
  children: React.ReactNode
}

export function FreedompayProvider({ children }: FreedompayProviderProps) {
  const merchantId = env.VITE_FREEDOMPAY_MERCHANT_ID

  if (!merchantId) {
    console.warn('FreedomPay merchant ID not configured')
  }

  return <>{children}</>
}

export function useFreedompay() {
  const isConfigured = !!env.VITE_FREEDOMPAY_MERCHANT_ID

  const redirectToCheckout = (checkoutUrl: string) => {
    window.location.href = checkoutUrl
  }

  const openCheckoutInNewTab = (checkoutUrl: string) => {
    window.open(checkoutUrl, '_blank')
  }

  return {
    isConfigured,
    redirectToCheckout,
    openCheckoutInNewTab,
  }
}
