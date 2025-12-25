import { Sun, Moon } from "lucide-react"
import { useTheme } from "./theme-provider"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}
