import { createAuthClient } from "better-auth/react"
import { tanstackStartCookies } from "better-auth/tanstack-start"

export const auth = createAuthClient({
	baseURL: "http://localhost:3001",
	plugins: [tanstackStartCookies()],
})

// Export hooks for convenience
export const {
	signIn,
	signOut,
	signUp,
	useSession,
} = auth
