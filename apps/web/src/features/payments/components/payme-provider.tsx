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
  // Use test checkout URL if VITE_PAYME_TEST_MODE is true
  // Note: Test URL is https://test.paycom.uz (not test.checkout.paycom.uz)
  const checkoutUrl =
    env.VITE_PAYME_TEST_MODE === 'true'
      ? 'https://test.paycom.uz'
      : 'https://checkout.paycom.uz/'

  const openCheckout = (params: {
    orderId: string
    amount: number
    returnUrl: string
    lang?: 'ru' | 'uz' | 'en'
  }) => {
    console.log('=== openCheckout PARAMS ===', params)

    if (!env.VITE_PAYME_MERCHANT_ID) {
      console.error('Payme merchant ID not configured')
      return
    }

    console.log('=== PAYME CHECKOUT DEBUG ===')
    console.log('Merchant ID:', env.VITE_PAYME_MERCHANT_ID)
    console.log('Checkout URL:', checkoutUrl)
    console.log('Params:', params)
    console.log('Amount (in tiyins):', params.amount)

    // Create a hidden form and submit it
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = checkoutUrl

    // Merchant ID
    const merchantInput = document.createElement('input')
    merchantInput.type = 'hidden'
    merchantInput.name = 'merchant'
    merchantInput.value = env.VITE_PAYME_MERCHANT_ID
    form.appendChild(merchantInput)
    console.log('Form field - merchant:', merchantInput.value)

    // Order ID
    const orderIdInput = document.createElement('input')
    orderIdInput.type = 'hidden'
    orderIdInput.name = 'account[order_id]'
    orderIdInput.value = params.orderId
    form.appendChild(orderIdInput)
    console.log('Form field - account[order_id]:', orderIdInput.value)

    // Amount
    const amountInput = document.createElement('input')
    amountInput.type = 'hidden'
    amountInput.name = 'amount'
    amountInput.value = params.amount.toString()
    form.appendChild(amountInput)
    console.log('Form field - amount:', amountInput.value)

    // Language
    const langInput = document.createElement('input')
    langInput.type = 'hidden'
    langInput.name = 'lang'
    langInput.value = params.lang || 'ru'
    form.appendChild(langInput)
    console.log('Form field - lang:', langInput.value)

    // Payme uses 'callback' not 'return_url' for the return URL
    const callbackInput = document.createElement('input')
    callbackInput.type = 'hidden'
    callbackInput.name = 'callback'
    callbackInput.value = params.returnUrl
    form.appendChild(callbackInput)
    console.log('Form field - callback:', callbackInput.value)

    // Add payment description (recommended by Payme)
    const descInput = document.createElement('input')
    descInput.type = 'hidden'
    descInput.name = 'description[ru]'
    descInput.value = `Оплата тарифа ${params.orderId}`
    form.appendChild(descInput)
    console.log('Form field - description[ru]:', descInput.value)

    console.log('Full form HTML:', form.outerHTML)
    console.log('============================')

    // Submit the form
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
