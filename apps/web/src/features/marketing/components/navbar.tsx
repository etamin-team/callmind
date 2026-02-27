import { Link } from '@tanstack/react-router'
import { Menu, X, Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '#/components/ui/button'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkDark = () => {
      const isDarkMode = document.documentElement.classList.contains('dark')
      setIsDark(isDarkMode)
    }
    checkDark()

    const observer = new MutationObserver(checkDark)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark')
    setIsDark(!isDark)
  }

  return (
    <header className="navbar">
      <div className="page-wrap flex h-14 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center bg-[var(--color-accent)] text-white font-semibold text-sm rounded-md">
            C
          </div>
          <span className="text-base font-semibold">Callmind</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/pricing" className="nav-link">Pricing</Link>
          <Link to="#changelog" className="nav-link">Changelog</Link>
          <Link to="#docs" className="nav-link">Docs</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <Link to="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link to="/signup">
            <Button size="sm">Try for free</Button>
          </Link>

          <button
            type="button"
            className="md:hidden p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--color-border-subtle)]">
          <div className="page-wrap py-4 space-y-4">
            <Link to="/pricing" className="block text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors py-2">
              Pricing
            </Link>
            <Link to="#changelog" className="block text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors py-2">
              Changelog
            </Link>
            <Link to="#docs" className="block text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors py-2">
              Docs
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
