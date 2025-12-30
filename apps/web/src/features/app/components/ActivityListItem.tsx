import { CheckCircle, Clock } from 'lucide-react'
import { ActivityItem } from '../types'

interface ActivityListItemProps {
  activity: ActivityItem
}

export function ActivityListItem({ activity }: ActivityListItemProps) {
  return (
    <div className="flex items-start space-x-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <div className="mt-1">
        {activity.status === 'completed' && (
          <CheckCircle className="h-4 w-4 text-emerald-500" />
        )}
        {activity.status === 'pending' && (
          <Clock className="h-4 w-4 text-amber-500" />
        )}
        {activity.status === 'in-progress' && (
          <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        )}
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">{activity.title}</p>
        <p className="text-sm text-muted-foreground">
          {activity.description}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {activity.time}
        </p>
      </div>
    </div>
  )
}
