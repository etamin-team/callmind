import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultTheme?: Theme;
	storageKey?: string;
};

type ThemeProviderState = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
	theme: "system",
	setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
	children,
	defaultTheme = "system",
	storageKey = "vite-ui-theme",
	...props
}: ThemeProviderProps) {
	// Initialize with default theme - inline script handles setting the correct class
	// We'll read from localStorage in useEffect to avoid blocking
	const [theme, setTheme] = useState<Theme>(defaultTheme);
	const [isInitialized, setIsInitialized] = useState(false);

	// Read actual theme from localStorage after mount (non-blocking)
	useEffect(() => {
		if (typeof window === "undefined") return;

		const storedTheme = localStorage.getItem(storageKey) as Theme;
		if (storedTheme && storedTheme !== defaultTheme) {
			setTheme(storedTheme);
		}
		setIsInitialized(true);
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;
		
		const root = window.document.documentElement;
		
		let targetTheme: "light" | "dark";
		if (theme === "system") {
			targetTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
		} else {
			targetTheme = theme;
		}
		
		// Only update classes after initial mount to avoid flickering
		if (!isInitialized) {
			// On first mount, check if inline script already set the correct class
			const hasCorrectClass = root.classList.contains(targetTheme);
			if (!hasCorrectClass) {
				root.classList.remove("light", "dark");
				root.classList.add(targetTheme);
			}
			setIsInitialized(true);
		} else {
			// After initialization, always update
			root.classList.remove("light", "dark");
			root.classList.add(targetTheme);
		}
	}, [theme, isInitialized]);

	const value = {
		theme,
		setTheme: (theme: Theme) => {
			if (typeof window !== "undefined") {
				localStorage.setItem(storageKey, theme);
			}
			setTheme(theme);
		},
	};

	return (
		<ThemeProviderContext.Provider {...props} value={value}>
			{children}
		</ThemeProviderContext.Provider>
	);
}

export const useTheme = () => {
	const context = useContext(ThemeProviderContext);
	if (context === undefined)
		throw new Error("useTheme must be used within a ThemeProvider");
	return context;
};