import { useUser, UserButton } from '@clerk/clerk-react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function DashboardHeader() {
  const { user } = useUser()

  return (
    <header className="sticky top-0 z-30 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-slate-900 dark:bg-slate-100 rounded-lg flex items-center justify-center">
            <span className="text-white dark:text-slate-900 font-bold text-lg">C</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Callmind</h1>
          <Badge variant="outline" className="hidden sm:inline-flex bg-slate-100 dark:bg-slate-800 border-transparent">
            Dashboard
          </Badge>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
          </Button>
          
          <div className="flex items-center space-x-3 pl-4 border-l border-slate-200 dark:border-slate-700">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">{user?.fullName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                Pro Plan
              </p>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </header>
  )
}
