interface PaymeProviderProps {
  children: React.ReactNode
}

export function PaymeProvider({ children }: PaymeProviderProps) {
  return <>{children}</>
}

export function usePayme() {
  const redirectToCheckout = (checkoutUrl: string) => {
    window.location.href = checkoutUrl
  }

  const openCheckoutInNewTab = (checkoutUrl: string) => {
    window.open(checkoutUrl, '_blank')
  }

  return {
    isConfigured: true,
    redirectToCheckout,
    openCheckoutInNewTab,
  }
}
