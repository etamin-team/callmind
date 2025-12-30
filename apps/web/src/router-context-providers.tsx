import { useUser } from '@clerk/clerk-react'
import { ReactNode } from 'react'

interface AuthContext {
  isAuthenticated: boolean
  userId: string | null
  user: any | null
}

interface RouterContext {
  auth: AuthContext
  queryClient: any
}

export function RouterContextProviders({ children }: { children: ReactNode }) {
  const { isSignedIn, user, isLoaded } = useUser()
  
  const routerContext: RouterContext = {
    auth: {
      isAuthenticated: !!isSignedIn,
      userId: user?.id || null,
      user: user || null,
    },
    queryClient: undefined, // Will be provided by TanStack Query provider
  }

  // You can use React Context or TanStack Router's context here
  // For now, we'll just return the children as the context is passed via TanStack Router
  return <>{children}</>
}

// Helper hook to get auth state in routes
export function useAuth() {
  const { user, isSignedIn } = useUser()
  
  return {
    isAuthenticated: !!isSignedIn,
    userId: user?.id || null,
    user,
  }
}