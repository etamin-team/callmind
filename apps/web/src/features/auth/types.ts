export interface AuthUser {
  id: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  user: AuthUser | null
  error?: string
}

export interface Session {
  user: AuthUser
  expiresAt: Date
  token: string
}
