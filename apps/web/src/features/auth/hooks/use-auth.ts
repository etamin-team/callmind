import { authClient } from '#/lib/auth-client'
import type { LoginInput, RegisterInput } from '../types'

export function useAuth() {
  const { data: session, isPending, refetch } = authClient.useSession()

  const user = session?.user
  const isAuthenticated = !!user

  return {
    user,
    isAuthenticated,
    isPending,
    refetch,
  }
}

export function useLogin() {
  return authClient.useSignIn()
}

export function useRegister() {
  return authClient.useSignUp()
}

export function useLogout() {
  return authClient.useSignOut()
}

// Helper functions for auth operations
export async function login(input: LoginInput) {
  const data = await authClient.signIn.email(input)
  if (data.error) {
    return { error: data.error.message || 'Login failed' }
  }
  return { user: data.data }
}

export async function register(input: RegisterInput) {
  const data = await authClient.signUp.email(input)
  if (data.error) {
    return { error: data.error.message || 'Registration failed' }
  }
  return { user: data.data }
}

export async function logout() {
  await authClient.signOut()
}
