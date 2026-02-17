import { createFileRoute } from '@tanstack/react-router'
import { PaymentSuccessPage } from '@/features/payments/pages/success-page'

export const Route = createFileRoute('/payment/success')({
  component: PaymentSuccessPage,
})
