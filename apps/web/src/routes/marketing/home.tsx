import { createFileRoute } from '@tanstack/react-router'
import { HomePage } from '../../marketing/pages/home.page'

export const Route = createFileRoute('/marketing/home')({
  component: HomePage,
})
