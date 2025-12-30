import { useEffect } from 'react'
import { TodoList } from '../components/TodoList'

export function TasksPage() {
  useEffect(() => {
    document.title = 'Tasks - Callmind'
  }, [])

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <TodoList />
    </div>
  )
}
