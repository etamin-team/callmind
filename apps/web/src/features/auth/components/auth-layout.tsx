import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'

interface AuthLayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Simple Navbar */}
      <nav className="border-b border-[var(--color-border-subtle)]">
        <div className="page-wrap py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center bg-[var(--color-accent)] text-white font-semibold text-sm rounded-md">
              C
            </div>
            <span className="text-sm font-semibold">Callmind</span>
          </Link>

          <div className="flex items-center gap-4">
            {title?.includes('Sign in') ? (
              <>
                <span className="text-sm text-[var(--color-text-muted)]">
                  Don't have an account?
                </span>
                <Link
                  to="/register"
                  className="text-sm font-medium text-[var(--color-accent)] hover:underline"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <>
                <span className="text-sm text-[var(--color-text-muted)]">
                  Already have an account?
                </span>
                <Link
                  to="/login"
                  className="text-sm font-medium text-[var(--color-accent)] hover:underline"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-[var(--color-border-subtle)]">
        <div className="page-wrap">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-text-dim)]">
            <p>© {new Date().getFullYear()} Callmind. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="hover:text-[var(--color-text)]">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-[var(--color-text)]">
                Terms
              </Link>
              <Link to="/contact" className="hover:text-[var(--color-text)]">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
