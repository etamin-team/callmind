import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultStaleTime: 1000 * 60 * 5, // 5 minutes
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
