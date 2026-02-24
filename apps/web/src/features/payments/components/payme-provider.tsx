import { env } from '@/env'

interface PaymeProviderProps {
  children: React.ReactNode
}

export function PaymeProvider({ children }: PaymeProviderProps) {
  const merchantId = env.VITE_PAYME_MERCHANT_ID

  if (!merchantId) {
    console.warn('Payme merchant ID not configured')
  }

  // Load Payme checkout script
  if (typeof window !== 'undefined' && merchantId) {
    const script = document.createElement('script')
    script.src = 'https://cdn.paycom.uz/integration/js/checkout.min.js'
    script.async = true
    document.body.appendChild(script)
  }

  return <>{children}</>
}

export function usePayme() {
  const isConfigured = !!env.VITE_PAYME_MERCHANT_ID

  const openCheckout = (params: {
    orderId: string
    amount: number
    returnUrl: string
    lang?: 'ru' | 'uz' | 'en'
  }) => {
    if (!env.VITE_PAYME_MERCHANT_ID) {
      console.error('Payme merchant ID not configured')
      return
    }

    // Create a hidden form and submit it
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = 'https://checkout.paycom.uz/'

    const merchantInput = document.createElement('input')
    merchantInput.type = 'hidden'
    merchantInput.name = 'merchant'
    merchantInput.value = env.VITE_PAYME_MERCHANT_ID
    form.appendChild(merchantInput)

    const orderIdInput = document.createElement('input')
    orderIdInput.type = 'hidden'
    orderIdInput.name = 'account[order_id]'
    orderIdInput.value = params.orderId
    form.appendChild(orderIdInput)

    const amountInput = document.createElement('input')
    amountInput.type = 'hidden'
    amountInput.name = 'amount'
    amountInput.value = params.amount.toString()
    form.appendChild(amountInput)

    const langInput = document.createElement('input')
    langInput.type = 'hidden'
    langInput.name = 'lang'
    langInput.value = params.lang || 'ru'
    form.appendChild(langInput)

    const returnInput = document.createElement('input')
    returnInput.type = 'hidden'
    returnInput.name = 'return_url'
    returnInput.value = params.returnUrl
    form.appendChild(returnInput)

    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
  }

  const redirectToCheckout = (checkoutUrl: string) => {
    window.location.href = checkoutUrl
  }

  const openCheckoutInNewTab = (checkoutUrl: string) => {
    window.open(checkoutUrl, '_blank')
  }

  return {
    isConfigured,
    openCheckout,
    redirectToCheckout,
    openCheckoutInNewTab,
  }
}
