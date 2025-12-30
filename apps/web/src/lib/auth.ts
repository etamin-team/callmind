import { useUser } from '@clerk/clerk-react'

export interface AuthContext {
  isAuthenticated: boolean
  userId: string | null
  user: any | null
  isLoading: boolean
}

export function useAuthContext(): AuthContext {
  const { isSignedIn, user, isLoaded } = useUser()
  
  return {
    isAuthenticated: !!isSignedIn,
    userId: user?.id || null,
    user: user || null,
    isLoading: !isLoaded,
  }
}

export function checkAuth({ context }: { context: any }) {
  if (!context.auth?.isAuthenticated) {
    return {
      redirect: {
        to: '/login',
        search: {
          redirect: window.location.pathname + window.location.search,
        },
      },
    }
  }
  return {}
}

export function checkNoAuth({ context }: { context: any }) {
  if (context.auth?.isAuthenticated) {
    return {
      redirect: {
        to: '/dashboard',
      },
    }
  }
  return {}
}
