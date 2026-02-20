import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  resolvedTheme: 'light',
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function resolveTheme(
  theme: Theme,
  systemTheme: 'light' | 'dark',
): 'light' | 'dark' {
  return theme === 'system' ? systemTheme : theme
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() =>
    resolveTheme(defaultTheme, getSystemTheme()),
  )
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)

    try {
      const stored = localStorage.getItem(storageKey) as Theme | null
      if (stored && stored !== defaultTheme) {
        setThemeState(stored)
        setResolvedTheme(resolveTheme(stored, getSystemTheme()))
      }
    } catch {
      // localStorage not available
    }
  }, [defaultTheme, storageKey])

  useEffect(() => {
    if (!isHydrated) return

    const systemTheme = getSystemTheme()
    const newResolvedTheme = resolveTheme(theme, systemTheme)
    setResolvedTheme(newResolvedTheme)

    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(newResolvedTheme)

    try {
      localStorage.setItem(storageKey, theme)
    } catch {
      // localStorage not available
    }
  }, [theme, isHydrated, storageKey])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
  }, [])

  const value: ThemeProviderState = {
    theme,
    setTheme,
    resolvedTheme,
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
