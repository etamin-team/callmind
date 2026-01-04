import { createFileRoute, redirect, useLocation, useNavigate, Outlet } from '@tanstack/react-router'
import { useOrganization, useUser } from '@clerk/clerk-react'
import { useEffect } from 'react'

export const Route = createFileRoute('/_app')({
  beforeLoad: ({ context }) => {
    if (context.auth?.isLoaded && !context.auth?.isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
  component: AppLayout,
})

function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoaded: userLoaded, user } = useUser()
  const { isLoaded: orgLoaded, organization } = useOrganization()

  useEffect(() => {
    if (!userLoaded || !orgLoaded) return
    
    // Get current workspace ID from URL
    const pathParts = location.pathname.split('/').filter(Boolean)
    const currentWorkspaceId = pathParts[0]
    
    // Determine target workspace ID
    const targetWorkspaceId = organization?.id || user?.id
    
    if (targetWorkspaceId) {
      const knownAppPaths = ['dashboard', 'agents', 'tasks', 'usage', 'settings', 'login', 'register']
      
      // Case 1: URL has no workspace ID (e.g., /agents or /)
      if (knownAppPaths.includes(currentWorkspaceId)) {
        const remainingPath = location.pathname.split('/').slice(1).join('/')
        // Skip redirect for agent creation page - let it be standalone
        if (currentWorkspaceId === 'agents' && remainingPath.startsWith('create')) {
          return
        }
        navigate({ to: `/${targetWorkspaceId}/${remainingPath}` })
      } else if (location.pathname === '/') {
        navigate({ to: `/${targetWorkspaceId}/agents` })
      }
      
      // Case 2: URL has a workspace ID but it doesn't match the active Clerk state
      // (e.g., user switched orgs via TeamSwitcher or manually changed URL)
      else if (currentWorkspaceId && 
               (currentWorkspaceId.startsWith('org_') || currentWorkspaceId.startsWith('user_')) && 
               currentWorkspaceId !== targetWorkspaceId) {
        
        // If the mismatch is because of a manual URL change, we might want to sync Clerk
        // but for now, let's ensure the URL reflects Clerk's active state
        const remainingPath = location.pathname.split('/').slice(2).join('/')
        const newPath = `/${targetWorkspaceId}/${remainingPath || 'agents'}`
        
        if (location.pathname !== newPath) {
          navigate({ to: newPath })
        }
      }
    }
  }, [location.pathname, navigate, userLoaded, orgLoaded, organization?.id, user?.id])

  if (!userLoaded || !orgLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 animate-pulse font-medium">Initializing Workspace...</p>
        </div>
      </div>
    )
  }

  return <Outlet />
}
