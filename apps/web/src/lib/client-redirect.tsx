import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useOrganization, useUser } from '@clerk/clerk-react'

interface ClientRedirectProps {
  to: string
}

/**
 * ClientRedirect component - handles redirects on the client side
 * Use this when you need to redirect based on client-side state (like Clerk org/user)
 */
export function ClientRedirect({ to }: ClientRedirectProps) {
  const navigate = useNavigate()
  const { organization, isLoaded: orgLoaded } = useOrganization()
  const { user, isLoaded: userLoaded } = useUser()

  useEffect(() => {
    if (!orgLoaded || !userLoaded) return
    
    const workspaceId = organization?.id || user?.id
    
    if (workspaceId) {
      navigate({ to: `/${workspaceId}${to}` })
    } else {
      navigate({ to: '/login' })
    }
  }, [navigate, to, orgLoaded, userLoaded, organization, user])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}