import {
  createFileRoute,
  Outlet,
  redirect,
  useParams,
  useLocation,
} from '@tanstack/react-router'
import { AppSidebar } from '@/features/app/components/app-sidebar'
import { AppHeader } from '@/features/app/components/AppHeader'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useUser, useOrganization } from '@clerk/clerk-react'
import { useEffect } from 'react'

export const Route = createFileRoute('/_app/$workspaceId')({
  component: WorkspaceLayout,
  beforeLoad: async ({ context }) => {
    if (context.auth?.isLoaded && !context.auth?.isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
  loader: async ({ params }) => {
    return { workspaceId: params.workspaceId }
  },
})

function WorkspaceLayout() {
  const { isLoaded } = useUser()
  const { organization } = useOrganization()
  const { workspaceId } = useParams({ from: '/_app/$workspaceId' })
  const location = useLocation()

  const pathParts = location.pathname.split('/').filter(Boolean)

  // Check if this is a full-screen agent page (create or dashboard)
  // Logic: if path has 'agents' and there is a segment after it (ID or 'create')
  const agentsIndex = pathParts.indexOf('agents')
  const isFullScreen = agentsIndex !== -1 && pathParts.length > agentsIndex + 1

  useEffect(() => {
    // Validate workspaceId matches current organization
    if (isLoaded && organization && workspaceId !== organization.id) {
      console.warn('Workspace ID mismatch')
    }
  }, [workspaceId, organization, isLoaded])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 animate-pulse font-medium">
            Initializing Workspace...
          </p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      {!isFullScreen && <AppSidebar />}
      <SidebarInset>
        {!isFullScreen && <AppHeader />}
        <main
          className={`flex flex-1 flex-col gap-4 overflow-auto bg-background ${!isFullScreen ? 'p-4 lg:p-6' : ''}`}
        >
          <div
            className={`${!isFullScreen ? 'max-w-7xl mx-auto w-full h-full' : 'w-full h-full'}`}
          >
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
