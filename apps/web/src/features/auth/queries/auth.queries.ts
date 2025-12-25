import { useMutation } from '@tanstack/react-query'
import type { LoginFormData, RegisterFormData, AuthResponse } from '../types/auth.types'
import { authApi } from '../apis/auth.apis'

export const useLoginMutation = () => {
  return useMutation<AuthResponse, Error, LoginFormData>({
    mutationFn: (data) => authApi.login(data),
    onSuccess: (data) => {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    },
  })
}

export const useRegisterMutation = () => {
  return useMutation<AuthResponse, Error, RegisterFormData>({
    mutationFn: (data) => authApi.register(data),
    onSuccess: (data) => {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    },
  })
}

export const useLogout = () => {
  const logout = () => {
    authApi.logout()
    window.location.href = '/auth/login'
  }
  return logout
}
