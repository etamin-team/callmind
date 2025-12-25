import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: () => {
    const router = useRouter()
    router.navigate({ to: '/marketing/home' })
    return null
  },
})

import { useRouter } from '@tanstack/react-router'
