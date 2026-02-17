import { createFileRoute } from '@tanstack/react-router'
import { PaymentCancelPage } from '@/features/payments/pages/cancel-page'

export const Route = createFileRoute('/payment/cancel')({
  component: PaymentCancelPage,
})
