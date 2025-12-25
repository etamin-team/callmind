export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    email: string
    name: string
  }
}

export interface AuthState {
  isAuthenticated: boolean
  user: AuthResponse['user'] | null
  token: string | null
}
