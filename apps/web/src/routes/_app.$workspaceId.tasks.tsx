import { createFileRoute } from '@tanstack/react-router'
import { TasksPage } from '@/features/app/pages/TasksPage'

export const Route = createFileRoute('/_app/$workspaceId/tasks')({
  component: TasksPage,
})