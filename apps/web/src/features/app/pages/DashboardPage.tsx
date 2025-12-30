import { useEffect } from 'react'
import { DashboardOverview } from '../components/DashboardOverview'

export function DashboardPage() {
  useEffect(() => {
    document.title = 'Dashboard - Callmind'
  }, [])

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-white dark:bg-zinc-900 aspect-video rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col p-6 items-center justify-center gap-2">
          <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">128</span>
          <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Active Sessions</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 aspect-video rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col p-6 items-center justify-center gap-2">
          <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">98%</span>
          <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">System Health</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 aspect-video rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col p-6 items-center justify-center gap-2">
          <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">4.2m</span>
          <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Avg Latency</span>
        </div>
      </div>
      <DashboardOverview />
    </div>
  )
}
