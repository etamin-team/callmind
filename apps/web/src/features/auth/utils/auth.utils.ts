import type { AuthState } from '../types/auth.types'

export const getAuthState = (): AuthState => {
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  return {
    isAuthenticated: !!token,
    user,
    token,
  }
}

export const setAuthState = (token: string, user: any): void => {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

export const clearAuthState = (): void => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token')
}
