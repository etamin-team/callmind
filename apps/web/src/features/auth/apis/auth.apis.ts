import type { LoginFormData, RegisterFormData, AuthResponse } from '../types/auth.types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export class AuthApi {
  private static instance: AuthApi

  static getInstance(): AuthApi {
    if (!AuthApi.instance) {
      AuthApi.instance = new AuthApi()
    }
    return AuthApi.instance
  }

  async login(data: LoginFormData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Login failed')
    }

    return response.json()
  }

  async register(data: RegisterFormData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Registration failed')
    }

    return response.json()
  }

  logout(): void {
    // Clear auth state
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}

export const authApi = AuthApi.getInstance()
