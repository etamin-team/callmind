import { useState } from 'react'
import type { LoginInput, RegisterInput } from '../types'

interface FormErrors {
  email?: string
  password?: string
  name?: string
  general?: string
}

interface UseAuthFormOptions {
  mode: 'login' | 'register'
  onSubmit: (data: LoginInput | RegisterInput) => Promise<void>
}

export function useAuthForm({ mode, onSubmit }: UseAuthFormOptions) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email address'
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    // Name validation (only for register)
    if (mode === 'register' && !name) {
      newErrors.name = 'Name is required'
    } else if (mode === 'register' && name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const data: LoginInput | RegisterInput =
        mode === 'login'
          ? { email, password }
          : { email, password, name }

      await onSubmit(data)
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'An error occurred',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const clearErrors = () => setErrors({})

  return {
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    errors,
    isSubmitting,
    handleSubmit,
    clearErrors,
  }
}
