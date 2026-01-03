import { createFileRoute } from '@tanstack/react-router'
import UsagePage from '@/features/usage/pages/usage-page'

export const Route = createFileRoute('/_app/usage')({
  component: UsagePage,
})