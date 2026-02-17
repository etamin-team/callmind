import { useEffect, useState } from 'react'
import { env } from '@/env'

declare global {
  interface Window {
    Paddle?: {
      initialize: (config: {
        token: string
        environment?: 'sandbox' | 'production'
      }) => void
      Checkout: {
        open: (options: { transactionId: string }) => void
      }
    }
  }
}

interface PaddleProviderProps {
  children: React.ReactNode
}

export function PaddleProvider({ children }: PaddleProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const clientToken = env.VITE_PADDLE_CLIENT_TOKEN

    if (!clientToken) {
      console.warn('Paddle client token not configured')
      return
    }

    // Load Paddle.js SDK
    const script = document.createElement('script')
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js'
    script.async = true
    script.onload = () => {
      if (window.Paddle) {
        window.Paddle.initialize({
          token: clientToken,
          environment: import.meta.env.MODE === 'production' ? 'production' : 'sandbox',
        })
        setIsLoaded(true)
      }
    }
    script.onerror = () => {
      console.error('Failed to load Paddle.js SDK')
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup script on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  if (!isLoaded && env.VITE_PADDLE_CLIENT_TOKEN) {
    // Optionally show loading state
    return <>{children}</>
  }

  return <>{children}</>
}

export function usePaddle() {
  return {
    openCheckout: (transactionId: string) => {
      if (window.Paddle) {
        window.Paddle.Checkout.open({ transactionId })
      } else {
        console.error('Paddle.js not loaded')
      }
    },
    isLoaded: !!window.Paddle,
  }
}
