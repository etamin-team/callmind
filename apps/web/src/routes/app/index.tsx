import { createFileRoute } from '@tanstack/react-router'
import { DashboardPage } from '../../app/pages/dashboard.page'

export const Route = createFileRoute('/app/')({
  component: DashboardPage,
})
