import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: typeof window === 'undefined'
    ? process.env.VITE_APP_URL || 'http://localhost:3000'
    : '',
})
