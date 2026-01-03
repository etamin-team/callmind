import { createFileRoute, Outlet, redirect, useParams, useLocation } from '@tanstack/react-router'
import { AppSidebar } from '@/features/app/components/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
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
  
  // Extract the page title from the path for the breadcrumb
  const pathParts = location.pathname.split('/').filter(Boolean)
  const currentPage = pathParts[pathParts.length - 1] || 'Dashboard'

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
          <p className="text-slate-500 animate-pulse font-medium">Initializing Workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b bg-white dark:bg-black sticky top-0 z-30">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href={`/${workspaceId}/agents`}>
                    {organization?.name || 'Personal'}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="capitalize">{currentPage.replace('-', ' ')}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6 overflow-auto bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto w-full h-full">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}