import { z } from 'zod'

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
})

export type ApiError = z.infer<typeof ApiErrorSchema>

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    error: ApiErrorSchema.optional(),
  })

export type ApiResponse<T> = {
  data: T
  error?: ApiError
}
