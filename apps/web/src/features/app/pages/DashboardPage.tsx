import { useEffect } from 'react'

import CallCenterDashboard from '@/features/app/components/dashboard'

export function DashboardPage() {
  useEffect(() => {
    document.title = 'Dashboard - Callmind'
  }, [])

  return <CallCenterDashboard />
}
