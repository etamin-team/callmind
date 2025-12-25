import { createRootRouteWithContext } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'

import appCss from '../styles.css?url'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Callmind' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootDocument,
})

function RootDocument() {
  return (
    <html lang="en">
      <head />
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
}

function Scripts() {
  const router = useRouter()
  return <>{/* Add devtools here when needed */}</>
}

function Outlet() {
  const router = useRouter()
  return router.state.matches.map((match) => {
    const RouteComponent = match.route.options.component
    if (!RouteComponent) return null
    return <RouteComponent key={match.routeId} />
  })
}

// Import at bottom to avoid circular dependency
import { Scripts as TSRSscripts, Outlet as TSRSOutlet, useRouter } from '@tanstack/react-router'
