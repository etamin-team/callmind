import { authClient } from '#/lib/auth-client'
import type { LoginInput, RegisterInput } from '../types'

class AuthService {
  /**
   * Sign in with email and password
   */
  async signIn(input: LoginInput) {
    const data = await authClient.signIn.email(input)
    if (data.error) {
      throw new Error(data.error.message || 'Login failed')
    }
    return data.data
  }

  /**
   * Sign up with email, password, and name
   */
  async signUp(input: RegisterInput) {
    const data = await authClient.signUp.email(input)
    if (data.error) {
      throw new Error(data.error.message || 'Registration failed')
    }
    return data.data
  }

  /**
   * Sign out
   */
  async signOut() {
    await authClient.signOut()
  }

  /**
   * Get current session
   */
  async getSession() {
    const data = await authClient.useSession()
    return data.data
  }

  /**
   * Send password reset email
   */
  async forgotPassword(email: string) {
    const data = await authClient.forgetPassword({ email })
    if (data.error) {
      throw new Error(data.error.message || 'Failed to send reset email')
    }
    return data.data
  }

  /**
   * Reset password with token
   */
  async resetPassword(password: string, token: string) {
    const data = await authClient.resetPassword({ password, token })
    if (data.error) {
      throw new Error(data.error.message || 'Failed to reset password')
    }
    return data.data
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string) {
    const data = await authClient.verifyEmail({ token })
    if (data.error) {
      throw new Error(data.error.message || 'Failed to verify email')
    }
    return data.data
  }
}

export const authService = new AuthService()
