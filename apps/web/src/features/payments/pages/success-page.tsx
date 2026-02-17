import { useEffect, useState } from 'react'
import { useSearch } from '@tanstack/react-router'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function PaymentSuccessPage() {
  const search = useSearch({ from: '/payment/success' })
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    // Simulate processing time for webhook to complete
    const timer = setTimeout(() => {
      setIsProcessing(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            {isProcessing ? (
              <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            ) : (
              <CheckCircle className="w-8 h-8 text-green-600" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {isProcessing ? 'Processing Payment...' : 'Payment Successful!'}
          </CardTitle>
          <CardDescription>
            {isProcessing
              ? 'Please wait while we confirm your payment...'
              : 'Thank you for your purchase. Your account has been updated.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isProcessing && (
            <>
              <div className="bg-muted rounded-lg p-4 text-sm">
                <p className="text-muted-foreground">
                  Your plan will be activated shortly. You may need to refresh the page to see the changes.
                </p>
              </div>
              <div className="flex gap-3">
                <Button className="flex-1" asChild>
                  <a href="/dashboard">Go to Dashboard</a>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <a href="/settings/billing">View Billing</a>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
