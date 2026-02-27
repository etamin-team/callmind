import { useAuth } from './use-auth'
import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export function useProtectedRoute() {
  const { isAuthenticated, isPending } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isPending && !isAuthenticated) {
      navigate({ to: '/login', replace: true })
    }
  }, [isAuthenticated, isPending, navigate])

  return { isAuthenticated, isPending }
}

export function useRedirectIfAuthenticated() {
  const { isAuthenticated, isPending } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isPending && isAuthenticated) {
      navigate({ to: '/', replace: true })
    }
  }, [isAuthenticated, isPending, navigate])

  return { isAuthenticated, isPending }
}
