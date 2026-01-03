import { createFileRoute } from '@tanstack/react-router'
import { DashboardPage } from '@/features/app/pages/DashboardPage'

export const Route = createFileRoute('/_app/$workspaceId/dashboard')({
  component: DashboardPage,
})