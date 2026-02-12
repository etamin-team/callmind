import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import ClerkProvider from '../integrations/clerk/provider'
import StoreDevtools from '../lib/demo-store-devtools'
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
import appCss from '../styles.css?url'
import type { QueryClient } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'

export interface MyRouterContext {
  queryClient: QueryClient
  auth: {
    isAuthenticated: boolean
    userId: string | null
    user: any | null
    isLoaded: boolean
  }
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'CallMind - Your AI Agent',
      },
    ],
    links: [
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('vite-ui-theme');
                  if (!theme) {
                    theme = 'light';
                  }
                  
                  var resolvedTheme = theme;
                  if (theme === 'system') {
                    resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  
                  document.documentElement.classList.add(resolvedTheme);
                } catch (e) {
                  console.error('Inline theme script error:', e);
                  document.documentElement.classList.add('light');
                }
              })();
            `
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <ClerkProvider>
            <AuthWrapper>
              {children}
            </AuthWrapper>
            <TanStackDevtools
              config={{
                position: 'bottom-right',
              }}
              plugins={[
                {
                  name: 'Tanstack Router',
                  render: <TanStackRouterDevtoolsPanel />,
                },
                StoreDevtools,
                TanStackQueryDevtools,
              ]}
            />
          </ClerkProvider>
          <Scripts />
        </ThemeProvider>
      </body>
    </html>
  )
}

import { useUser } from '@clerk/clerk-react'
import { useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isSignedIn, user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    router.update({
      context: {
        ...router.options.context,
        auth: {
          isAuthenticated: !!isSignedIn,
          userId: user?.id || null,
          user: user || null,
          isLoaded,
        },
      },
    })
  }, [isSignedIn, user, isLoaded])

  return <>{children}</>
}