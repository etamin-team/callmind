import { Link } from '@tanstack/react-router'
import { Mail, Lock, User, AlertCircle } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { useAuthForm } from '../hooks/use-auth-form'
import { register } from '../hooks/use-auth'
import { useNavigate } from '@tanstack/react-router'

export function RegisterForm() {
  const navigate = useNavigate()

  const {
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    errors,
    isSubmitting,
    handleSubmit,
  } = useAuthForm({
    mode: 'register',
    onSubmit: async (data) => {
      const result = await register(data)
      if (result.error) {
        throw new Error(result.error)
      }
      // Navigate to dashboard or home after successful registration
      navigate({ to: '/' })
    },
  })

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Create your account</h1>
        <p className="text-[var(--color-text-muted)]">
          Start your free trial today. No credit card required.
        </p>
      </div>

      {/* Error Alert */}
      {errors.general && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-dim)]" />
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] transition-colors ${
                errors.name
                  ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500'
                  : 'border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]'
              }`}
            />
          </div>
          {errors.name && (
            <p className="mt-1.5 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-dim)]" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] transition-colors ${
                errors.email
                  ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500'
                  : 'border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]'
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-dim)]" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] transition-colors ${
                errors.password
                  ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500'
                  : 'border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]'
              }`}
            />
          </div>
          {errors.password && (
            <p className="mt-1.5 text-sm text-red-500">{errors.password}</p>
          )}
          <p className="mt-1.5 text-xs text-[var(--color-text-dim)]">
            Must be at least 8 characters
          </p>
        </div>

        {/* Terms */}
        <p className="text-xs text-[var(--color-text-dim)]">
          By signing up, you agree to our{' '}
          <Link to="/terms" className="text-[var(--color-accent)] hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-[var(--color-accent)] hover:underline">
            Privacy Policy
          </Link>
        </p>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      {/* Sign In Link */}
      <p className="mt-8 text-center text-sm text-[var(--color-text-muted)]">
        Already have an account?{' '}
        <Link to="/login" className="text-[var(--color-accent)] font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
