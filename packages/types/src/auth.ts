import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).max(100),
})

export const AuthResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
  }),
})

export type Login = z.infer<typeof LoginSchema>
export type Register = z.infer<typeof RegisterSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>
